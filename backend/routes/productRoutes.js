const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(authMiddleware, adminOnly, createProduct);

router.route('/:id')
  .get(getProductById)
  .put(authMiddleware, adminOnly, updateProduct)
  .delete(authMiddleware, adminOnly, deleteProduct);

module.exports = router;
