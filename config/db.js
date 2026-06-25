const mongoose = require('mongoose');

module.exports = async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌  MONGO_URI is not defined in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      family: 4,                    // Force IPv4 — avoids IPv6 DNS issues
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅  MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('❌  MongoDB connection failed:', err.message);
    console.warn('⚠️   Server is running without MongoDB connection. Some features will fail.');
  }
};
