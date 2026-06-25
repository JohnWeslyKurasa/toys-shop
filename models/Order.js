const mongoose = require("mongoose");

const productItemSchema = new mongoose.Schema({
  productId: { type: String, default: "" },
  name: { type: String, default: "" },
  price: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  image: { type: String, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, trim: true },
  userId: { type: String, required: true, trim: true },
  customerName: { type: String, required: true, trim: true },
  customerEmail: { type: String, required: true, trim: true },
  customerPhone: { type: String, required: true, trim: true },
  shippingAddress: { type: String, required: true, trim: true },
  paymentMethod: { type: String, default: "COD", trim: true },
  paymentStatus: { type: String, default: "Pending", trim: true },
  status: { type: String, default: "Pending", trim: true },
  products: { type: [productItemSchema], default: [] },
  items: { type: [productItemSchema], default: [] },
  totalAmount: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  razorpayOrderId: { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" }
}, {
  timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
