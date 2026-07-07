const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

// Get active categories with subcategories and product counts (public)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
    
    const result = await Promise.all(categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ categoryId: cat._id, isActive: true }).sort({ order: 1 });
      const productCount = await Product.countDocuments({ categoryId: cat._id });
      
      const subcatsWithCounts = await Promise.all(subcategories.map(async (sub) => {
        const subProductCount = await Product.countDocuments({ subcategoryId: sub._id });
        return { ...sub.toObject(), productCount: subProductCount };
      }));
      
      return { ...cat.toObject(), subcategories: subcatsWithCounts, productCount };
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

// Get ALL categories for admin (including inactive)
exports.getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    
    const result = await Promise.all(categories.map(async (cat) => {
      const subcategories = await Subcategory.find({ categoryId: cat._id }).sort({ order: 1 });
      const productCount = await Product.countDocuments({ categoryId: cat._id });
      
      const subcatsWithCounts = await Promise.all(subcategories.map(async (sub) => {
        const subProductCount = await Product.countDocuments({ subcategoryId: sub._id });
        return { ...sub.toObject(), productCount: subProductCount };
      }));
      
      return { ...cat.toObject(), subcategories: subcatsWithCounts, productCount };
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching all categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    const subcategories = await Subcategory.find({ categoryId: category._id }).sort({ order: 1 });
    const productCount = await Product.countDocuments({ categoryId: category._id });
    res.json({ success: true, data: { ...category.toObject(), subcategories, productCount } });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    // Auto-set order to last position
    if (req.body.order === undefined) {
      const maxOrder = await Category.findOne().sort({ order: -1 });
      req.body.order = maxOrder ? maxOrder.order + 1 : 0;
    }
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    // If name changed, regenerate slug
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    }
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    // Delete all subcategories under this category
    await Subcategory.deleteMany({ categoryId: category._id });
    // Unset categoryId/subcategoryId on products
    await Product.updateMany({ categoryId: category._id }, { $unset: { categoryId: 1, subcategoryId: 1 } });
    await category.deleteOne();
    res.json({ success: true, message: 'Category and its subcategories deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, message: 'Failed to delete category' });
  }
};

// Reorder categories
exports.reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body; // Array of category IDs in new order
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    await Promise.all(orderedIds.map((id, index) => 
      Category.findByIdAndUpdate(id, { order: index })
    ));
    res.json({ success: true, message: 'Categories reordered' });
  } catch (error) {
    console.error('Error reordering categories:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder categories' });
  }
};

// Bulk update status
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array' });
    }
    await Category.updateMany({ _id: { $in: ids } }, { isActive, status: isActive ? 'active' : 'inactive' });
    res.json({ success: true, message: `${ids.length} categories updated` });
  } catch (error) {
    console.error('Error bulk updating:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk update' });
  }
};

// Bulk delete
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ success: false, message: 'ids must be an array' });
    }
    // Delete subcategories for all categories being deleted
    await Subcategory.deleteMany({ categoryId: { $in: ids } });
    // Unset references on products
    await Product.updateMany({ categoryId: { $in: ids } }, { $unset: { categoryId: 1, subcategoryId: 1 } });
    await Category.deleteMany({ _id: { $in: ids } });
    res.json({ success: true, message: `${ids.length} categories deleted` });
  } catch (error) {
    console.error('Error bulk deleting:', error);
    res.status(500).json({ success: false, message: 'Failed to bulk delete' });
  }
};
