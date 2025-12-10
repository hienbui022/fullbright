const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const learningPathController = require('../controllers/learningPath/learningPathController');

// Learning path validation
const learningPathValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced', 'all']).withMessage('Level must be beginner, intermediate, advanced, or all'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Estimated duration must be a positive integer')
];

// Course order validation
const courseOrderValidation = [
  body('courses').isArray().withMessage('Courses must be an array'),
  body('courses.*.courseId').isInt().withMessage('Course ID must be an integer'),
  body('courses.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
];

// Public routes
router.get('/', learningPathController.getAllLearningPaths);
router.get('/level/:level', learningPathController.getLearningPathsByLevel);
router.get('/:id', learningPathController.getLearningPathById);

// Protected routes (require authentication)
router.use(authenticate);

// Enroll in learning path
router.post('/:id/enroll', learningPathController.enrollLearningPath);

// Get enrolled learning paths
router.get('/user/enrolled', learningPathController.getEnrolledLearningPaths);

// Admin routes
router.use(isAdmin);

// Create learning path
router.post('/', learningPathValidation, validateRequest, learningPathController.createLearningPath);

// Update learning path
router.put('/:id', learningPathValidation, validateRequest, learningPathController.updateLearningPath);

// Delete learning path
router.delete('/:id', learningPathController.deleteLearningPath);

// Upload learning path thumbnail
router.post(
  '/:id/thumbnail',
  upload.single('thumbnail'),
  handleUploadError,
  learningPathController.uploadLearningPathThumbnail
);

// Add course to learning path
router.post(
  '/:id/courses',
  body('courseId').isInt().withMessage('Course ID must be an integer'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
  validateRequest,
  learningPathController.addCourseToLearningPath
);

// Remove course from learning path
router.delete('/:id/courses/:courseId', learningPathController.removeCourseFromLearningPath);

// Update course order in learning path
router.put('/:id/courses/order', courseOrderValidation, validateRequest, learningPathController.updateCourseOrder);

module.exports = router; 