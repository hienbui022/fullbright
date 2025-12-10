const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticate, isAdmin } = require('../middleware/auth');

// Routes cho người dùng
router.post('/enroll', authenticate, enrollmentController.enroll);
router.get('/my-enrollments', authenticate, enrollmentController.getUserEnrollments);
router.get('/enrollment/:id', authenticate, enrollmentController.getEnrollmentById);
router.put('/enrollment/:id/progress', authenticate, enrollmentController.updateProgress);
router.delete('/enrollment/:id', authenticate, enrollmentController.cancelEnrollment);
router.get('/course/:courseId/status', authenticate, enrollmentController.checkEnrollmentStatus);

// Routes cho admin
router.get('/course/:courseId/enrollments', authenticate, isAdmin, enrollmentController.getCourseEnrollments);

module.exports = router; 