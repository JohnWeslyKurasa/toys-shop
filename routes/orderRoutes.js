const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require('../controllers/orderController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// All order routes require a valid JWT
router.use(authMiddleware);

// POST /api/orders  — place an order
router.post('/', createOrder);

// GET /api/orders/me  — logged-in user's own orders
router.get('/me', getMyOrders);

// GET /api/orders  — all orders (admin only)
router.get('/', adminOnly, getAllOrders);

// PUT /api/orders/:orderId/status  — update order / payment status (admin only)
router.put('/:orderId/status', adminOnly, updateOrderStatus);

// POST /api/orders/razorpay/create  — create Razorpay order
router.post('/razorpay/create', require('../controllers/orderController').createRazorpayOrder);

// POST /api/orders/razorpay/verify  — verify Razorpay payment
router.post('/razorpay/verify', require('../controllers/orderController').verifyRazorpayPayment);

module.exports = router;
