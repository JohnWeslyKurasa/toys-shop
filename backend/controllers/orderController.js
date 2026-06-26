const Order = require('../models/Order');
const crypto = require('crypto');
const Razorpay = require('razorpay');

let razorpay;
if (process.env.VITE_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// ---------------------------------------------------------------------------
// POST /api/orders  (protected — any logged-in user)
// ---------------------------------------------------------------------------
exports.createOrder = async (req, res) => {
  try {
    const { items, totalAmount, paymentId, paymentStatus, shippingAddress, notes } = req.body;

    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Order must contain at least one item.' });
    }
    if (!totalAmount) {
      return res
        .status(400)
        .json({ success: false, message: 'totalAmount is required.' });
    }
    if (!shippingAddress) {
      return res
        .status(400)
        .json({ success: false, message: 'Shipping address is required.' });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      paymentId: paymentId || null,
      paymentStatus: paymentStatus || 'pending',
      shippingAddress,
      notes,
    });

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(' ') });
    }
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/orders/me  (protected — logged-in user's own orders)
// ---------------------------------------------------------------------------
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (err) {
    console.error('getMyOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// GET /api/orders  (admin only — all orders)
// ---------------------------------------------------------------------------
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (err) {
    console.error('getAllOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// PUT /api/orders/:orderId/status  (admin only)
// ---------------------------------------------------------------------------
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Provide at least one field to update (status or paymentStatus).' });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Order updated successfully.',
      order,
    });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/orders/razorpay/create (protected)
// ---------------------------------------------------------------------------
exports.createRazorpayOrder = async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ success: false, message: 'Razorpay is not configured on the server.' });
    }
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount is required.' });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, orderId: order.id });
  } catch (err) {
    console.error('Razorpay create order error:', err);
    res.status(500).json({ success: false, message: 'Razorpay order creation failed.' });
  }
};

// ---------------------------------------------------------------------------
// POST /api/orders/razorpay/verify (protected)
// ---------------------------------------------------------------------------
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId, dbOrderId } = req.body;
    
    const targetOrderId = dbOrderId || orderId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      // Signature is valid. Update order in DB
      const updatedOrder = await Order.findByIdAndUpdate(
        targetOrderId,
        { paymentStatus: 'paid', paymentId: razorpay_payment_id },
        { new: true }
      );
      res.status(200).json({ success: true, message: 'Payment verified successfully.', order: updatedOrder });
    } else {
      // Signature is invalid, order remains pending/failed
      res.status(400).json({ success: false, message: 'Invalid signature. Payment verification failed.' });
    }
  } catch (err) {
    console.error('Razorpay verify error:', err);
    res.status(500).json({ success: false, message: 'Razorpay payment verification failed.' });
  }
};
