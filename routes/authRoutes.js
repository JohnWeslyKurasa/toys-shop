const express = require('express');
const router = express.Router();
const { register, login, profile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/profile  (protected)
router.get('/profile', authMiddleware, profile);

module.exports = router;
