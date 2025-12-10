const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const lessonController = require('../controllers/lesson/lessonController');

// Lesson validation
const lessonValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('contentType').isIn(['video', 'text', 'audio', 'quiz', 'interactive']).withMessage('Content type must be valid'),
  body('courseId').isInt().withMessage('Course ID must be an integer'),
  body('order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
];

// Comment validation
const commentValidation = [
  body('content').notEmpty().withMessage('Content is required')
];

// Public routes - These should come before authentication middleware
router.get('/course/:courseId', lessonController.getLessonsByCourse);
router.get('/:id', authenticate, lessonController.getLessonById);
router.get('/:id/comments', lessonController.getLessonComments);

// Protected routes (require authentication)
router.use(authenticate);

// Add comment to lesson
router.post('/:id/comments', commentValidation, validateRequest, lessonController.addLessonComment);

// Mark lesson as complete
router.post('/:id/complete', lessonController.completeLesson);

// Admin routes
router.use(isAdmin);

// Get all lessons (admin only) - Must be before specific admin routes
router.get('/', lessonController.getAllLessons);

// Update lesson order
router.put('/order', lessonController.updateLessonOrder);

// Create lesson
router.post('/', lessonValidation, validateRequest, lessonController.createLesson);

// Update lesson
router.put('/:id', lessonValidation, validateRequest, lessonController.updateLesson);

// Delete lesson
router.delete('/:id', lessonController.deleteLesson);

// Upload lesson media
router.post(
  '/:id/media',
  upload.single('media'),
  handleUploadError,
  lessonController.uploadLessonMedia
);

module.exports = router; 