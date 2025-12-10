const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const userController = require('../controllers/user/userController');

// User validation
const userValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('fullName').notEmpty().withMessage('Full name is required')
];

// Create user validation (includes password)
const createUserValidation = [
  ...userValidation,
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Protected routes (require authentication)
router.use(authenticate);

// Get user by ID
router.get('/:id', userController.getUserById);

// Get user courses
router.get('/:id/courses', userController.getUserCourses);

// Get user learning paths
router.get('/:id/learning-paths', userController.getUserLearningPaths);

// Upload profile image
router.post(
  '/:id/profile-image',
  upload.single('profileImage'),
  handleUploadError,
  userController.uploadProfileImage
);


// Update user
router.put('/:id', userController.updateUser);

// Admin routes
router.use(isAdmin);

// Get all users
router.get('/', userController.getAllUsers);

// Search users
router.get('/search', userController.searchUsers);

// Create user
router.post('/', createUserValidation, validateRequest, userController.createUser);


// Update user status
router.patch('/:id/status', userController.updateUserStatus);

// Delete user
router.delete('/:id', userController.deleteUser);

// Get user progress
router.get('/:id/progress', userController.getUserProgress);

module.exports = router; 