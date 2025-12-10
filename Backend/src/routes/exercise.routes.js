const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { authenticate } = require('../middleware/auth');
const { check } = require('express-validator');

// Validation middleware cho exercise
const exerciseValidation = [
  check('title').notEmpty().withMessage('Tiêu đề không được để trống'),
  check('description').notEmpty().withMessage('Mô tả không được để trống'),
  check('type').isIn(['multiple_choice']).withMessage('Loại bài tập không hợp lệ'),
  check('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Độ khó không hợp lệ'),
  check('timeLimit').optional().isInt({ min: 0 }).withMessage('Thời gian làm bài phải là số dương'),
  check('passingScore').optional().isInt({ min: 0, max: 100 }).withMessage('Điểm đạt phải từ 0 đến 100')
];

// Validation middleware cho question
const questionValidation = [
  check('content').notEmpty().withMessage('Nội dung câu hỏi không được để trống'),
  check('type').isIn(['multiple_choice']).withMessage('Loại câu hỏi không hợp lệ'),
  check('options').isArray().withMessage('Options phải là một mảng'),
  check('options.*.text').notEmpty().withMessage('Text của option không được để trống'),
  check('options.*.isCorrect').isBoolean().withMessage('isCorrect phải là boolean'),
  check('points').isInt({ min: 1 }).withMessage('Điểm số phải lớn hơn 0')
];

// Exercise routes
router.get('/', authenticate, exerciseController.getAllExercises);
router.get('/:id', authenticate, exerciseController.getExerciseById);
router.post('/', authenticate, exerciseValidation, exerciseController.createExercise);
router.put('/:id', authenticate, exerciseValidation, exerciseController.updateExercise);
router.delete('/:id', authenticate, exerciseController.deleteExercise);

// Question routes
router.get('/:id/questions', authenticate, exerciseController.getQuestionsByExerciseId);
router.post('/:id/questions', authenticate, questionValidation, exerciseController.addQuestion);
router.put('/:id/questions/:questionId', authenticate, questionValidation, exerciseController.updateQuestion);
router.delete('/:id/questions/:questionId', authenticate, exerciseController.deleteQuestion);
router.put('/:id/questions/reorder', authenticate, exerciseController.reorderQuestions);

module.exports = router; 