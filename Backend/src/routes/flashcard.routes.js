const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const flashcardController = require('../controllers/flashcard/flashcardController');

// Validation rules
const flashcardValidation = [
  body('term').notEmpty().withMessage('Term is required'),
  body('definition').notEmpty().withMessage('Definition is required'),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('courseId').optional().isInt().withMessage('Course ID must be an integer'),
  body('lessonId').optional().isInt().withMessage('Lesson ID must be an integer'),
  body('imageUrl').optional().isURL().withMessage('Invalid image URL'),
];

// Public routes
// GET /api/flashcards - Lấy tất cả flashcard (có phân trang và lọc)
router.get('/', flashcardController.getAllFlashcards);

// GET /api/flashcards/:id - Lấy flashcard theo ID
router.get('/:id', flashcardController.getFlashcardById);

// GET /api/flashcards/category/:category - Lấy flashcard theo category
router.get('/category/:category', flashcardController.getFlashcardsByCategory);

// Protected routes (yêu cầu đăng nhập)
// POST /api/flashcards - Tạo flashcard mới
router.post('/', authenticate, flashcardValidation, validateRequest, flashcardController.createFlashcard);

// PUT /api/flashcards/:id - Cập nhật flashcard
router.put('/:id', authenticate, flashcardValidation, validateRequest, flashcardController.updateFlashcard);

// DELETE /api/flashcards/:id - Xóa flashcard
router.delete('/:id', authenticate, flashcardController.deleteFlashcard);

// GET /api/flashcards/progress/:flashcardId - Lấy tiến trình học flashcard của người dùng
router.get('/progress/:flashcardId', authenticate, flashcardController.getUserFlashcardProgress);

// POST /api/flashcards/progress/:flashcardId - Cập nhật tiến trình học flashcard của người dùng
router.post('/progress/:flashcardId', authenticate, flashcardController.updateUserFlashcardProgress);

// GET /api/flashcards/review/due - Lấy danh sách flashcard cần ôn tập
router.get('/review/due', authenticate, flashcardController.getFlashcardsForReview);

// GET /api/flashcards/progress/stats - Lấy thống kê tiến trình học flashcard
router.get('/progress/stats', authenticate, flashcardController.getFlashcardProgressStats);

// Admin routes
router.use(isAdmin);

module.exports = router; 