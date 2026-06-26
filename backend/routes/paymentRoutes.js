const express = require('express');
const router = express.Router();
const { createRazorpayOrder, verifyPayment } = require('../controllers/paymentController');
const { authMiddleware } = require('../middleware/authMiddleware');

// All payment routes require a valid JWT
router.use(authMiddleware);

// POST /api/payment/razorpay-order
router.post('/razorpay-order', createRazorpayOrder);

// POST /api/payment/verify
router.post('/verify', verifyPayment);

module.exports = router;
