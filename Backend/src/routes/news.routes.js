const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const newsController = require('../controllers/news/newsController');

// News validation
const newsValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required'),
  body('summary').notEmpty().withMessage('Summary is required'),
  body('category').notEmpty().withMessage('Category is required')
];

// Public routes
router.get('/', newsController.getAllNews);
router.get('/search', newsController.searchNews);
router.get('/category/:category', newsController.getNewsByCategory);
router.get('/:id', newsController.getNewsById);

// Admin routes
router.use(authenticate, isAdmin);

// Create news
router.post('/', newsValidation, validateRequest, newsController.createNews);

// Update news
router.put('/:id', newsValidation, validateRequest, newsController.updateNews);

// Delete news
router.delete('/:id', newsController.deleteNews);

// Upload news image
router.post(
  '/:id/image',
  upload.single('image'),
  handleUploadError,
  newsController.uploadNewsImage
);

module.exports = router; 