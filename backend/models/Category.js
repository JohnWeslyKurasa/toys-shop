const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true }, // auto-generated
  description: { type: String },
  image: { type: String },
  bannerImage: { type: String },
  icon: { type: String },
  metaTitle: { type: String },
  metaDescription: { type: String },
  featured: { type: Boolean, default: false },
  showOnHome: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

categorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }
});

module.exports = mongoose.model('Category', categorySchema);
