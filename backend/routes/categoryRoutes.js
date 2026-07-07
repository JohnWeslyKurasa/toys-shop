const express = require('express');
const router = express.Router();
const { 
  getCategories, getAllCategoriesAdmin, getCategoryById, 
  createCategory, updateCategory, deleteCategory,
  reorderCategories, bulkUpdateStatus, bulkDelete 
} = require('../controllers/categoryController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Admin routes (must be before /:id to avoid Express matching 'admin' as an id)
router.get('/admin/all', authMiddleware, adminOnly, getAllCategoriesAdmin);
router.patch('/reorder', authMiddleware, adminOnly, reorderCategories);
router.patch('/bulk-status', authMiddleware, adminOnly, bulkUpdateStatus);
router.post('/bulk-delete', authMiddleware, adminOnly, bulkDelete);

// Public
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin CRUD
router.post('/', authMiddleware, adminOnly, createCategory);
router.put('/:id', authMiddleware, adminOnly, updateCategory);
router.delete('/:id', authMiddleware, adminOnly, deleteCategory);

module.exports = router;
