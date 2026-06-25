const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("./models/User");
const Order = require("./models/Order");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const PRIMARY_MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/motherntoddler";
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/motherntoddler";
const JWT_SECRET = process.env.JWT_SECRET || "motherntoddler_secret";
const RAZORPAY_KEY_ID = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_T51p8zDGOIWJgK";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET || "uHnjU7ipKownZlCYPi1EfqkH";

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET
});

app.use(cors());
app.use(express.json());

let dbConnected = false;
let activeMongoUri = PRIMARY_MONGO_URI;
const memoryUsers = [];
const memoryOrders = [];

const memoryAdminId = "offline-admin-uid";

function normalizeUser(user) {
  if (!user) return null;
  return {
    uid: user._id?.toString() || user.uid || user.id,
    name: user.name || user.displayName || "",
    email: user.email || "",
    phone: user.phone || "",
    role: user.role || "user",
    createdAt: user.createdAt || user.createdDate || new Date().toISOString()
  };
}

async function connectMongo(uri) {
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000
    });
    dbConnected = true;
    activeMongoUri = uri;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error for ${uri}: ${error.message}`);
    return false;
  }
}

async function initDatabase() {
  const candidates = [PRIMARY_MONGO_URI, LOCAL_MONGO_URI];
  for (const [index, uri] of candidates.entries()) {
    const connected = await connectMongo(uri);
    if (connected) {
      await ensureDefaultAdminAccount();
      return;
    }
    if (index < candidates.length - 1) {
      console.log(`⏳ Retrying MongoDB connection with fallback URI...`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  console.warn("🚨 Database not connected. Running in offline fallback mode.");
}

function getMemoryUserByEmail(email) {
  return memoryUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function getMemoryUserById(id) {
  return memoryUsers.find((user) => user.uid === id || user._id === id || user.id === id);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.uid || user._id?.toString() || user.id,
      email: user.email,
      role: user.role || "user"
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

async function getUserFromToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (dbConnected) {
      const user = await User.findById(payload.id).select("name email phone role");
      return normalizeUser(user);
    }
    return normalizeUser(getMemoryUserById(payload.id));
  } catch (err) {
    return null;
  }
}

async function createUser({ name, email, phone, password, role = "user" }) {
  if (dbConnected) {
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new Error("Email is already registered");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role
    });
    return normalizeUser(user);
  }

  if (getMemoryUserByEmail(email)) {
    throw new Error("Email is already registered");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const uid = `offline-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const user = {
    uid,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  memoryUsers.push(user);
  return normalizeUser(user);
}

async function verifyUserPassword(email, password) {
  if (dbConnected) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return null;
    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? normalizeUser(user) : null;
  }

  const user = getMemoryUserByEmail(email);
  if (!user) return null;
  const isValid = await bcrypt.compare(password, user.passwordHash);
  return isValid ? normalizeUser(user) : null;
}

async function saveOrder(orderData) {
  if (dbConnected) {
    return Order.create(orderData);
  }
  memoryOrders.push(orderData);
  return orderData;
}

async function getOrdersForUser(userId) {
  if (dbConnected) {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  return memoryOrders.filter((order) => order.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getAllOrders() {
  if (dbConnected) {
    return Order.find().sort({ createdAt: -1 }).lean();
  }
  return [...memoryOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function updateOrderStatusInStore(orderId, newStatus) {
  if (dbConnected) {
    return Order.findOneAndUpdate({ orderId }, { status: newStatus }, { new: true }).lean();
  }
  const order = memoryOrders.find((o) => o.orderId === orderId);
  if (order) {
    order.status = newStatus;
  }
  return order || null;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authorization token is missing" });
  }

  const token = authHeader.split(" ")[1];
  getUserFromToken(token)
    .then((user) => {
      if (!user) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.warn("JWT verification failed:", err.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    });
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
}

async function ensureDefaultAdminAccount() {
  const adminEmail = "admin@motherntoddler.com";
  const adminPassword = "AdminPassword123";

  if (dbConnected) {
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) return;
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Shopkeeper Admin",
      email: adminEmail,
      phone: "9876543210",
      passwordHash,
      role: "admin"
    });
    console.log("✅ Default admin account created");
    return;
  }

  if (!getMemoryUserByEmail(adminEmail)) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    memoryUsers.push({
      uid: memoryAdminId,
      name: "Shopkeeper Admin",
      email: adminEmail,
      phone: "9876543210",
      passwordHash,
      role: "admin",
      createdAt: new Date().toISOString()
    });
    console.log("✅ Default offline admin account created");
  }
}

app.get("/api/health", (req, res) => {
  return res.json({ success: true, message: "Backend is healthy", dbConnected, activeMongoUri });
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ success: false, message: "Name, email, phone and password are required" });
  }

  try {
    const user = await createUser({ name, email, phone, password, role: "user" });
    const token = createToken(user);
    return res.json({ success: true, user, token });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await verifyUserPassword(email, password);
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const token = createToken(user);
    return res.json({ success: true, user, token });
  } catch (err) {
    console.error("Login failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to login" });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }
  console.log(`Password reset requested for ${email}.`);
  return res.json({ success: true, message: "Password reset link sent if the email exists." });
});

app.post("/api/auth/ensure-admin", async (req, res) => {
  try {
    await ensureDefaultAdminAccount();
    return res.json({ success: true, message: "Admin account checked" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Unable to ensure admin account" });
  }
});

app.get("/api/auth/profile", authMiddleware, async (req, res) => {
  return res.json({ success: true, profile: req.user });
});

app.put("/api/auth/profile", authMiddleware, async (req, res) => {
  const data = req.body;
  try {
    if (dbConnected) {
      const allowed = ["name", "phone"];
      const updates = {};
      allowed.forEach((field) => {
        if (data[field]) updates[field] = data[field].trim();
      });
      const user = await User.findByIdAndUpdate(req.user.uid, updates, { new: true }).select("name email phone role");
      return res.json({ success: true, profile: normalizeUser(user) });
    }

    const user = getMemoryUserById(req.user.uid);
    if (user) {
      if (data.name) user.name = data.name.trim();
      if (data.phone) user.phone = data.phone.trim();
      return res.json({ success: true, profile: normalizeUser(user) });
    }
    return res.status(404).json({ success: false, message: "User not found" });
  } catch (err) {
    console.error("Update profile failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to update profile" });
  }
});

app.post("/api/orders", authMiddleware, async (req, res) => {
  const { name, email, phone, cartItems, subtotal, shippingAddress = "", paymentMethod = "COD", paymentStatus = "Pending" } = req.body;

  if (!name || !email || !phone || !shippingAddress || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Missing order information" });
  }

  try {
    const orderId = "MT-" + Math.floor(100000 + Math.random() * 900000);
    const mappedProducts = cartItems.map((item) => ({
      productId: item.productId?.toString() || "",
      name: item.name || "Unknown Product",
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || Number(item.qty) || 1,
      image: item.image || ""
    }));

    const totalAmountVal = Number(subtotal) > 0 ? Number(subtotal) : mappedProducts.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const orderData = {
      orderId,
      userId: req.user.uid,
      customerName: name.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: shippingAddress.trim(),
      paymentMethod: paymentMethod.trim(),
      paymentStatus: paymentStatus.trim(),
      products: mappedProducts,
      items: mappedProducts,
      totalAmount: totalAmountVal,
      subtotal: totalAmountVal,
      status: "Pending",
      createdAt: new Date().toISOString()
    };

    const order = await saveOrder(orderData);
    return res.json({ success: true, orderId: order.orderId, order });
  } catch (err) {
    console.error("Place order failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to place order" });
  }
});

app.get("/api/orders", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await getAllOrders();
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch all orders failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to fetch orders" });
  }
});

app.get("/api/orders/me", authMiddleware, async (req, res) => {
  try {
    const orders = await getOrdersForUser(req.user.uid);
    return res.json({ success: true, orders });
  } catch (err) {
    console.error("Fetch customer orders failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to fetch orders" });
  }
});

app.put("/api/orders/:orderId/status", authMiddleware, adminMiddleware, async (req, res) => {
  const { orderId } = req.params;
  const { newStatus } = req.body;
  if (!newStatus) {
    return res.status(400).json({ success: false, message: "Missing newStatus" });
  }

  try {
    const order = await updateOrderStatusInStore(orderId, newStatus.trim());
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    return res.json({ success: true, order });
  } catch (err) {
    console.error("Update order status failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to update order status" });
  }
});

app.post("/api/payments/order", async (req, res) => {
  const { amount } = req.body;
  if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
    return res.status(400).json({ success: false, message: "Invalid order amount" });
  }

  try {
    const options = {
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: "receipt_" + Math.floor(100000 + Math.random() * 900000)
    };
    const order = await razorpay.orders.create(options);
    return res.json({ success: true, order });
  } catch (err) {
    console.error("Razorpay order creation failed:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/payments/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
    return res.status(400).json({ success: false, message: "Missing required verification fields" });
  }

  const hmac = crypto.createHmac("sha256", RAZORPAY_KEY_SECRET);
  hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
  const generatedSignature = hmac.digest("hex");

  if (generatedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, message: "Payment signature verification failed" });
  }

  try {
    const order = await updateOrderStatusInStore(orderData.orderId, orderData.status || "Paid");
    if (!order) {
      return res.json({ success: true, warning: "Payment verified but order record not found", orderId: orderData.orderId });
    }
    return res.json({ success: true, orderId: order.orderId });
  } catch (err) {
    console.error("Payment verify update failed:", err.message);
    return res.status(500).json({ success: false, message: "Unable to save payment verification" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MERN Express backend listening on http://localhost:${PORT}`);
  initDatabase();
});