const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { validateRequest } = require('../middleware/validate');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload.middleware');
const communityController = require('../controllers/community/communityController');
const forumController = require('../controllers/community/forum.controller');
const commentController = require('../controllers/community/comment.controller');

// Validation rules
const postValidationRules = [
  check('title').notEmpty().withMessage('Title is required'),
  check('content').notEmpty().withMessage('Content is required'),
  check('category').notEmpty().withMessage('Category is required')
];

const commentValidationRules = [
  check('content').notEmpty().withMessage('Comment content is required')
];

// Public routes
router.get('/posts', communityController.getAllPosts);
router.get('/posts/search', communityController.searchPosts);
router.get('/posts/category/:category', communityController.getPostsByCategory);
router.get('/posts/:id', communityController.getPostById);
router.get('/posts/:id/comments', communityController.getPostComments);

// Protected routes (require authentication)
router.post('/posts', authenticate, postValidationRules, validateRequest, communityController.createPost);
router.put('/posts/:id', authenticate, postValidationRules, validateRequest, communityController.updatePost);
router.delete('/posts/:id', authenticate, communityController.deletePost);
router.post('/posts/:id/like', authenticate, communityController.likePost);
router.put('/posts/:id/resolve', authenticate, communityController.resolvePost);
router.post('/posts/:id/comments', authenticate, commentValidationRules, validateRequest, communityController.addComment);
router.put('/comments/:id', authenticate, commentValidationRules, validateRequest, communityController.updateComment);
router.delete('/comments/:id', authenticate, communityController.deleteComment);
router.post('/comments/:id/like', authenticate, communityController.likeComment);
router.put('/comments/:id/accept', authenticate, communityController.acceptComment);

// Forum routes
router.post('/forum/posts', authenticate, forumController.createPost);
router.get('/forum/posts', forumController.getPosts);
router.get('/forum/posts/stats', authenticate, forumController.getForumStats);
router.get('/forum/posts/:id', forumController.getPostById);
router.put('/forum/posts/:id', authenticate, forumController.updatePost);
router.delete('/forum/posts/:id', authenticate, forumController.deletePost);
router.put('/forum/posts/:id/resolve', authenticate, forumController.markAsResolved);
router.post('/forum/posts/:id/like', authenticate, forumController.toggleLike);

// Comment routes
router.post('/comments', authenticate, commentController.createComment);
router.get('/comments', commentController.getComments);
router.put('/comments/:id', authenticate, commentController.updateComment);
router.delete('/comments/:id', authenticate, commentController.deleteComment);
router.post('/comments/:id/like', authenticate, commentController.toggleLike);
router.put('/comments/:id/accept', authenticate, commentController.acceptAnswer);

module.exports = router; 