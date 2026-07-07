const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },
  category: {
    type: String,
    required: true,
  },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory' },
  image: {
    type: String,
    required: true,
  },
  images: [{
    type: String
  }],
  brand: {
    type: String,
    default: "Mother & Toddler",
  },
  description: {
    type: String,
    required: true,
  },
  features: [{
    type: String
  }],
  specifications: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  ageGroup: {
    type: String,
    default: "All",
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  stock: {
    type: Number,
    default: 10,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isNewProduct: {
    type: Boolean,
    default: true,
  },
  isSale: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
