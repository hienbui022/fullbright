const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const learningToolsController = require('../controllers/learningTools/learningToolsController');

// Validation rules
const toolValidationRules = [
  check('name').notEmpty().withMessage('Name is required'),
  check('description').notEmpty().withMessage('Description is required'),
  check('type').notEmpty().withMessage('Type is required'),
  check('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', learningToolsController.getAllTools);
router.get('/search', learningToolsController.searchTools);
router.get('/popular', learningToolsController.getPopularTools);
router.get('/category/:category', learningToolsController.getToolsByCategory);
router.get('/type/:type', learningToolsController.getToolsByType);
router.get('/:id', learningToolsController.getToolById);

// Protected routes (require authentication)
router.get('/progress', authenticate, learningToolsController.getUserToolsProgress);
router.get('/recommended', authenticate, learningToolsController.getRecommendedTools);
router.post('/:id/start', authenticate, learningToolsController.startTool);
router.put('/:id/complete', authenticate, learningToolsController.completeTool);

// Admin routes
router.post('/', authenticate, isAdmin, toolValidationRules, validateRequest, learningToolsController.createTool);
router.put('/:id', authenticate, isAdmin, toolValidationRules, validateRequest, learningToolsController.updateTool);
router.delete('/:id', authenticate, isAdmin, learningToolsController.deleteTool);
router.post('/:id/image', authenticate, isAdmin, upload.single('image'), handleUploadError, learningToolsController.uploadToolImage);

module.exports = router; 