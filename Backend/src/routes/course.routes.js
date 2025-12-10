const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const courseController = require('../controllers/course/courseController');

// Course validation
const courseValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
  body('skills').isArray().withMessage('Skills must be an array'),
  body('topics').isArray().withMessage('Topics must be an array'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer')
];

// Public routes (accessible to all users)
router.get('/', courseController.getAllCourses);
router.get('/search', courseController.searchCourses);
router.get('/level/:level', courseController.getCoursesByLevel);
router.get('/skill/:skill', courseController.getCoursesBySkill);
router.get('/topic/:topic', courseController.getCoursesByTopic);
router.get('/:id', courseController.getCourseById);
router.get('/:id/lessons', authenticate, courseController.getLessonsByCourse);

// Protected routes (accessible to authenticated users)
router.post('/:id/enroll', authenticate, courseController.enrollCourse);

// Admin only routes
router.post('/', authenticate, isAdmin, courseValidation, validateRequest, courseController.createCourse);
router.put('/:id', authenticate, isAdmin, courseValidation, validateRequest, courseController.updateCourse);
router.delete('/:id', authenticate, isAdmin, courseController.deleteCourse);
router.patch('/:id/publish', authenticate, isAdmin, courseController.publishCourse);

module.exports = router; 