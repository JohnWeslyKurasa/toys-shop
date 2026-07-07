const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');

exports.getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcategories = await Subcategory.find({ categoryId }).sort({ order: 1 });
    
    const result = await Promise.all(subcategories.map(async (sub) => {
      const productCount = await Product.countDocuments({ subcategoryId: sub._id });
      return { ...sub.toObject(), productCount };
    }));
    
    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
  }
};

exports.createSubcategory = async (req, res) => {
  try {
    if (req.body.order === undefined) {
      const maxOrder = await Subcategory.findOne({ categoryId: req.body.categoryId }).sort({ order: -1 });
      req.body.order = maxOrder ? maxOrder.order + 1 : 0;
    }
    const subcategory = await Subcategory.create(req.body);
    res.status(201).json({ success: true, data: subcategory });
  } catch (error) {
    console.error('Error creating subcategory:', error);
    res.status(500).json({ success: false, message: 'Failed to create subcategory' });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    if (req.body.name) {
      req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    }
    const subcategory = await Subcategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    res.json({ success: true, data: subcategory });
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).json({ success: false, message: 'Failed to update subcategory' });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const subcategory = await Subcategory.findById(req.params.id);
    if (!subcategory) return res.status(404).json({ success: false, message: 'Subcategory not found' });
    await Product.updateMany({ subcategoryId: subcategory._id }, { $unset: { subcategoryId: 1 } });
    await subcategory.deleteOne();
    res.json({ success: true, message: 'Subcategory deleted' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subcategory' });
  }
};

exports.reorderSubcategories = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds must be an array' });
    }
    await Promise.all(orderedIds.map((id, index) => 
      Subcategory.findByIdAndUpdate(id, { order: index })
    ));
    res.json({ success: true, message: 'Subcategories reordered' });
  } catch (error) {
    console.error('Error reordering subcategories:', error);
    res.status(500).json({ success: false, message: 'Failed to reorder subcategories' });
  }
};
