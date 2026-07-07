const express = require('express');
const router = express.Router();
const { getAnalytics, getCustomers } = require('../controllers/adminController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.use(authMiddleware, adminOnly);

router.get('/analytics', getAnalytics);
router.get('/customers', getCustomers);

module.exports = router;
