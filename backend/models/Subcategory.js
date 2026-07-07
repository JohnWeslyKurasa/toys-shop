const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  name: { type: String, required: true },
  slug: { type: String },
  image: { type: String },
  description: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

subcategorySchema.pre('save', function() {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  }
});

module.exports = mongoose.model('Subcategory', subcategorySchema);
