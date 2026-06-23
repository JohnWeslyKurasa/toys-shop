const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const admin = require('firebase-admin');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Razorpay SDK
const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_T51p8zDGOIWJgK',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'uHnjU7ipKownZlCYPi1EfqkH'
});

// Initialize Firebase Admin SDK
let firebaseAdminReady = false;
try {
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'motherntoddler-3a25c',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      })
    });
    firebaseAdminReady = true;
    console.log("Firebase Admin SDK initialized successfully with Service Account Key Cert ✅");
  } else {
    // Attempt default initialization if local credentials exist
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'motherntoddler-3a25c'
    });
    firebaseAdminReady = true;
    console.log("Firebase Admin SDK initialized with project ID fallback ✅");
  }
} catch (err) {
  console.warn("⚠️ Firebase Admin initialization failed/skipped:", err.message);
  console.warn("Firestore database writes will fallback to mock logs in development mode.");
}

// 1. Endpoint to create a Razorpay Order
app.post('/api/payments/order', async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid order amount" });
  }

  const options = {
    amount: Math.round(Number(amount) * 100), // convert INR to paise
    currency: "INR",
    receipt: "receipt_" + Math.floor(100000 + Math.random() * 900000)
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log(`Razorpay Order created: ${order.id} for amount ${order.amount} paise ✅`);
    res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order creation failed:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Endpoint to verify payment signature and write to Firestore
app.post('/api/payments/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
    return res.status(400).json({ success: false, message: "Missing required verification fields" });
  }

  // Verify Razorpay HMAC signature
  const secret = process.env.RAZORPAY_KEY_SECRET || 'uHnjU7ipKownZlCYPi1EfqkH';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generated_signature = hmac.digest('hex');

  if (generated_signature !== razorpay_signature) {
    console.warn("❌ Payment signature verification failed");
    return res.status(400).json({ success: false, message: "Payment signature verification failed. Invalid transaction." });
  }

  console.log(`Payment signature verified successfully for Order: ${razorpay_order_id} ✅`);

  // Write order to Firestore database
  if (firebaseAdminReady) {
    try {
      const db = admin.firestore();
      const finalOrderData = {
        ...orderData,
        paymentStatus: "Paid",
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        createdDate: admin.firestore.FieldValue.serverTimestamp() // set on server side
      };
      
      await db.collection("orders").doc(orderData.orderId).set(finalOrderData);
      console.log(`Order ${orderData.orderId} saved to Firestore successfully ✅`);
      return res.json({ success: true, orderId: orderData.orderId });
    } catch (dbErr) {
      console.error("❌ Firestore order write failed:", dbErr.message);
      // Fallback for development if credentials are invalid or permissions are blocked
      return res.json({
        success: true,
        orderId: orderData.orderId,
        warning: "Payment verified, but database write failed: " + dbErr.message
      });
    }
  } else {
    // Development fallback when Firebase credentials are not provided
    console.log("ℹ️ Server running in mock Firestore mode. Printing verified order details:");
    console.log(JSON.stringify(orderData, null, 2));
    return res.json({
      success: true,
      orderId: orderData.orderId,
      warning: "Payment verified, but order was not saved to Firestore (Firebase Admin key not configured)."
    });
  }
});

// Start server listening
app.listen(PORT, () => {
  console.log(`🚀 Express backend server listening on http://localhost:${PORT}`);
});
