const Product = require('../models/Product');
const Order = require('../models/Order');


// Get all products
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    const productsMapped = products.map(p => {
      const obj = p.toObject();
      obj.isNew = p.isNewProduct;
      return obj;
    });
    res.json({ success: true, data: productsMapped });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
};

// Get single product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    
    const obj = product.toObject();
    obj.isNew = product.isNewProduct;
    res.json({ success: true, data: obj });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    if (req.body.isNew !== undefined) {
      req.body.isNewProduct = req.body.isNew;
    }
    const product = new Product(req.body);
    // ensure backward compatibility for "image" vs "images"
    if (req.body.images && req.body.images.length > 0 && !req.body.image) {
      product.image = req.body.images[0];
    } else if (req.body.image && (!req.body.images || req.body.images.length === 0)) {
      product.images = [req.body.image];
    }
    const savedProduct = await product.save();
    
    const obj = savedProduct.toObject();
    obj.isNew = savedProduct.isNewProduct;
    res.status(201).json({ success: true, data: obj });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (req.body.images && req.body.images.length > 0) {
      req.body.image = req.body.images[0];
    }

    if (req.body.isNew !== undefined) {
      req.body.isNewProduct = req.body.isNew;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    const obj = updatedProduct.toObject();
    obj.isNew = updatedProduct.isNewProduct;
    res.json({ success: true, data: obj });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product', error: error.message });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
};

// Create new product review
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Verify if the user has purchased this product
    const hasPurchased = await Order.findOne({
      user: req.user._id,
      'items.productId': productId,
      status: { $ne: 'cancelled' }
    });

    if (!hasPurchased) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only customers who have purchased this product can leave a review.' 
      });
    }

    // Check if user already left a review
    const alreadyReviewed = product.reviews.find(
      r => r.userId.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      // Update existing review
      alreadyReviewed.rating = Number(rating);
      alreadyReviewed.comment = comment;
    } else {
      // Add new review
      const review = {
        userId: req.user._id,
        name: req.user.name || 'Anonymous Customer',
        rating: Number(rating),
        comment
      };
      product.reviews.push(review);
    }

    // Update overall product rating
    if (product.reviews.length > 0) {
      product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
    } else {
      product.rating = 5.0;
    }

    await product.save();
    res.status(201).json({ success: true, message: 'Review added successfully', data: product });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ success: false, message: 'Failed to add review', error: error.message });
  }
};

