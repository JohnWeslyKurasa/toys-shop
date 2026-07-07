const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subcategoryRoutes = require('./routes/subcategoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

// ── Security ────────────────────────────────────────────────────────────────
app.use(helmet());

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: true, // Allow all origins to resolve the deployment CORS issues
  credentials: true
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Socket.IO Setup ───────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*', // To ensure no CORS issues with Socket.IO during dev
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected to Socket.IO:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  return res.json({ success: true, message: "Backend is healthy" });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subcategoryRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// ── Connect DB then start server ──────────────────────────────────────────────
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Express & Socket.IO backend listening on http://localhost:${PORT}`);
  });
});