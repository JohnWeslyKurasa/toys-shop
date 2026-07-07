const express = require('express');
const router = express.Router();
const { 
  getSubcategories, createSubcategory, updateSubcategory, 
  deleteSubcategory, reorderSubcategories 
} = require('../controllers/subcategoryController');
const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

// Admin routes (before /:id params)
router.patch('/reorder', authMiddleware, adminOnly, reorderSubcategories);

router.get('/:categoryId', getSubcategories);
router.post('/', authMiddleware, adminOnly, createSubcategory);
router.put('/:id', authMiddleware, adminOnly, updateSubcategory);
router.delete('/:id', authMiddleware, adminOnly, deleteSubcategory);

module.exports = router;
