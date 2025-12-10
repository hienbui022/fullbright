const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');

// Import controllers (to be implemented)
// For now, we'll create placeholder functions
const flashcardController = {
  getAllFlashcards: (req, res) => {
    // Placeholder for get all flashcards logic
    res.status(200).json({ message: 'Get all flashcards endpoint' });
  },
  getFlashcardById: (req, res) => {
    // Placeholder for get flashcard by id logic
    res.status(200).json({ message: `Get flashcard with ID: ${req.params.id}` });
  },
  getFlashcardsByCourse: (req, res) => {
    // Placeholder for get flashcards by course logic
    res.status(200).json({ message: `Get flashcards for course with ID: ${req.params.courseId}` });
  },
  getFlashcardsByLesson: (req, res) => {
    // Placeholder for get flashcards by lesson logic
    res.status(200).json({ message: `Get flashcards for lesson with ID: ${req.params.lessonId}` });
  },
  createFlashcard: (req, res) => {
    // Placeholder for create flashcard logic
    res.status(201).json({ message: 'Create flashcard endpoint' });
  },
  updateFlashcard: (req, res) => {
    // Placeholder for update flashcard logic
    res.status(200).json({ message: `Update flashcard with ID: ${req.params.id}` });
  },
  deleteFlashcard: (req, res) => {
    // Placeholder for delete flashcard logic
    res.status(200).json({ message: `Delete flashcard with ID: ${req.params.id}` });
  },
  uploadFlashcardMedia: (req, res) => {
    // Placeholder for upload flashcard media logic
    res.status(200).json({ 
      message: `Upload media for flashcard with ID: ${req.params.id}`,
      file: req.file
    });
  }
};

const exerciseController = {
  getAllExercises: (req, res) => {
    // Placeholder for get all exercises logic
    res.status(200).json({ message: 'Get all exercises endpoint' });
  },
  getExerciseById: (req, res) => {
    // Placeholder for get exercise by id logic
    res.status(200).json({ message: `Get exercise with ID: ${req.params.id}` });
  },
  getExercisesByCourse: (req, res) => {
    // Placeholder for get exercises by course logic
    res.status(200).json({ message: `Get exercises for course with ID: ${req.params.courseId}` });
  },
  getExercisesByLesson: (req, res) => {
    // Placeholder for get exercises by lesson logic
    res.status(200).json({ message: `Get exercises for lesson with ID: ${req.params.lessonId}` });
  },
  createExercise: (req, res) => {
    // Placeholder for create exercise logic
    res.status(201).json({ message: 'Create exercise endpoint' });
  },
  updateExercise: (req, res) => {
    // Placeholder for update exercise logic
    res.status(200).json({ message: `Update exercise with ID: ${req.params.id}` });
  },
  deleteExercise: (req, res) => {
    // Placeholder for delete exercise logic
    res.status(200).json({ message: `Delete exercise with ID: ${req.params.id}` });
  },
  uploadExerciseMedia: (req, res) => {
    // Placeholder for upload exercise media logic
    res.status(200).json({ 
      message: `Upload media for exercise with ID: ${req.params.id}`,
      file: req.file
    });
  },
  submitExerciseAnswer: (req, res) => {
    // Placeholder for submit exercise answer logic
    res.status(200).json({ message: `Submit answer for exercise with ID: ${req.params.id}` });
  },
  getExerciseResults: (req, res) => {
    // Placeholder for get exercise results logic
    res.status(200).json({ message: `Get results for exercise with ID: ${req.params.id}` });
  }
};

const dictionaryController = {
  searchWord: (req, res) => {
    // Placeholder for search word logic
    res.status(200).json({ message: `Search for word: ${req.query.term}` });
  },
  getWordDetails: (req, res) => {
    // Placeholder for get word details logic
    res.status(200).json({ message: `Get details for word: ${req.params.word}` });
  }
};

// Flashcard validation
const flashcardValidation = [
  body('term').notEmpty().withMessage('Term is required'),
  body('definition').notEmpty().withMessage('Definition is required')
];

// Exercise validation
const exerciseValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['multiple_choice', 'writing', 'listening', 'speaking']).withMessage('Type must be multiple_choice, writing, listening, or speaking'),
  body('content').isObject().withMessage('Content must be a JSON object'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard')
];

// Flashcard routes
// Public routes
router.get('/flashcards/course/:courseId', flashcardController.getFlashcardsByCourse);
router.get('/flashcards/lesson/:lessonId', flashcardController.getFlashcardsByLesson);
router.get('/flashcards/:id', authenticate, flashcardController.getFlashcardById);

// Admin only routes
router.get('/flashcards', authenticate, isAdmin, flashcardController.getAllFlashcards);
router.post('/flashcards', authenticate, isAdmin, flashcardValidation, validateRequest, flashcardController.createFlashcard);
router.put('/flashcards/:id', authenticate, isAdmin, flashcardValidation, validateRequest, flashcardController.updateFlashcard);
router.delete('/flashcards/:id', authenticate, isAdmin, flashcardController.deleteFlashcard);
router.post('/flashcards/:id/media', authenticate, isAdmin, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 }
]), handleUploadError, flashcardController.uploadFlashcardMedia);

// Exercise routes
// Public routes
router.get('/exercises/course/:courseId', exerciseController.getExercisesByCourse);
router.get('/exercises/lesson/:lessonId', exerciseController.getExercisesByLesson);

// Protected routes
router.get('/exercises/:id', authenticate, exerciseController.getExerciseById);
router.post('/exercises/:id/submit', authenticate, exerciseController.submitExerciseAnswer);
router.get('/exercises/:id/results', authenticate, exerciseController.getExerciseResults);

// Admin only routes
router.get('/exercises', authenticate, isAdmin, exerciseController.getAllExercises);
router.post('/exercises', authenticate, isAdmin, exerciseValidation, validateRequest, exerciseController.createExercise);
router.put('/exercises/:id', authenticate, isAdmin, exerciseValidation, validateRequest, exerciseController.updateExercise);
router.delete('/exercises/:id', authenticate, isAdmin, exerciseController.deleteExercise);
router.post('/exercises/:id/media', authenticate, isAdmin, upload.single('media'), handleUploadError, exerciseController.uploadExerciseMedia);

// Dictionary routes
router.get('/dictionary/search', dictionaryController.searchWord);
router.get('/dictionary/word/:word', dictionaryController.getWordDetails);

module.exports = router; 