const { Lesson, Course, User, UserProgress, Comment, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all lessons with pagination and search
 * @route GET /api/lessons
 * @access Private/Admin
 */
const getAllLessons = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', courseId } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    // Get lessons with pagination
    const { count, rows: lessons } = await Lesson.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(count / limit);
    
    // Format response to match frontend expectations
    const formattedLessons = lessons.map(lesson => {
      const plainLesson = lesson.get({ plain: true });
      return {
        ...plainLesson,
        // Ensure these fields are present and correctly formatted
        contentType: plainLesson.contentType || 'text',
        isPublished: !!plainLesson.isPublished,
        duration: plainLesson.duration || 0,
        order: plainLesson.order || 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        lessons: formattedLessons,
        pagination: {
          total: count,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all lessons error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get lessons by course ID
 * @route GET /api/lessons/course/:courseId
 * @access Public
 */
const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Get lessons
    const lessons = await Lesson.findAll({
      where: {
        courseId,
        isPublished: true
      },
      order: [['order', 'ASC']],
      attributes: ['id', 'title', 'description', 'order', 'contentType', 'duration', 'isPublished', 'createdAt']
    });
    
    // If user is authenticated, get their progress for each lesson
    let progress = [];
    if (req.user) {
      progress = await UserProgress.findAll({
        where: {
          userId: req.user.id,
          courseId,
          lessonId: {
            [Op.ne]: null
          }
        }
      });
    }
    
    // Map progress to lessons
    const lessonsWithProgress = lessons.map(lesson => {
      const lessonProgress = progress.find(p => p.lessonId === lesson.id);
      return {
        ...lesson.toJSON(),
        progress: lessonProgress ? lessonProgress.progress : 0,
        completed: lessonProgress ? lessonProgress.progress === 100 : false
      };
    });
    
    res.status(200).json({
      success: true,
      data: lessonsWithProgress
    });
  } catch (error) {
    console.error('Get lessons by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get lesson by ID
 * @route GET /api/lessons/:id
 * @access Public
 */
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get lesson with course info
    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'level']
        }
      ]
    });
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // If lesson is not published and user is not admin/author (Consider adding author check if needed)
    if (!lesson.isPublished && (!req.user || !req.user.isAdmin)) { 
      return res.status(404).json({
        success: false,
        message: 'Lesson not found or not published' // More specific message
      });
    }
    
    // If user is authenticated, get their progress for this lesson
    let userProgress = 0;
    let isCompleted = false; // Default completion status
    console.log(req.user);
    if (req.user) {
      const progressRecord = await UserProgress.findOne({
        where: {
          userId: req.user.id,
          lessonId: id
        }
      });

      console.log(progressRecord);
      
      // If no progress record exists, create one (only if lesson is published)
      if (!progressRecord && lesson.isPublished) {
          await UserProgress.create({
              userId: req.user.id,
              courseId: lesson.courseId,
              lessonId: id,
              progress: 0, // Start progress at 0
              lastAccessedAt: new Date()
          });
          // Keep userProgress as 0 and isCompleted as false for newly created record
      } else if (progressRecord) {
          userProgress = progressRecord.progress;
          isCompleted = progressRecord.progress === 100; // Check if progress is 100
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        lesson,
        userProgress: userProgress, // Return the progress percentage
        isCompleted: isCompleted   // Add the completion status boolean
      }
    });
  } catch (error) {
    console.error('Get lesson by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create lesson
 * @route POST /api/lessons
 * @access Private/Admin
 */
const createLesson = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      content, 
      contentType, 
      courseId, 
      order, 
      duration, 
      isPublished = false 
    } = req.body;
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Create lesson
    const lesson = await Lesson.create({
      title,
      description,
      content,
      contentType,
      courseId,
      order,
      duration,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update lesson
 * @route PUT /api/lessons/:id
 * @access Private/Admin
 */
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      content, 
      contentType, 
      courseId, 
      order, 
      duration, 
      isPublished 
    } = req.body;
    
    // Find lesson
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // If courseId is changing, check if new course exists
    if (courseId && courseId !== lesson.courseId) {
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }
    }
    
    // Update lesson
    lesson.title = title || lesson.title;
    lesson.description = description || lesson.description;
    lesson.content = content !== undefined ? content : lesson.content;
    lesson.contentType = contentType || lesson.contentType;
    lesson.courseId = courseId || lesson.courseId;
    lesson.order = order !== undefined ? order : lesson.order;
    lesson.duration = duration || lesson.duration;
    
    // Update published status and date if changed
    if (isPublished !== undefined && isPublished !== lesson.isPublished) {
      lesson.isPublished = isPublished;
      if (isPublished) {
        lesson.publishedAt = new Date();
      }
    }
    
    await lesson.save();
    
    res.status(200).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete lesson
 * @route DELETE /api/lessons/:id
 * @access Private/Admin
 */
const deleteLesson = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find lesson
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Delete media if exists
    if (lesson.mediaUrl) {
      const mediaPath = path.join(__dirname, '../../../uploads', lesson.mediaUrl);
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
    
    // Delete lesson
    await lesson.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Upload lesson media
 * @route POST /api/lessons/:id/media
 * @access Private/Admin
 */
const uploadLessonMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find lesson
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Delete old media if exists
    if (lesson.mediaUrl) {
      const oldMediaPath = path.join(__dirname, '../../../uploads', lesson.mediaUrl);
      if (fs.existsSync(oldMediaPath)) {
        fs.unlinkSync(oldMediaPath);
      }
    }
    
    // Update lesson with new media
    lesson.mediaUrl = req.file.filename;
    await lesson.save();
    
    res.status(200).json({
      success: true,
      data: {
        mediaUrl: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload lesson media error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update lesson order
 * @route PUT /api/lessons/order
 * @access Private/Admin
 */
const updateLessonOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { lessons } = req.body;
    
    // Validate lessons array
    if (!Array.isArray(lessons) || lessons.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Lessons array is required'
      });
    }
    
    // Update order for each lesson
    for (const item of lessons) {
      if (!item.id || item.order === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each lesson must have id and order'
        });
      }
      
      await Lesson.update(
        { order: item.order },
        { 
          where: { id: item.id },
          transaction
        }
      );
    }
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Lesson order updated successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Update lesson order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get lesson comments
 * @route GET /api/lessons/:id/comments
 * @access Public
 */
const getLessonComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if lesson exists
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Get comments
    const comments = await Comment.findAndCountAll({
      where: {
        lessonId: id,
        parentId: null // Only get top-level comments
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profileImage']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(comments.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        comments: comments.rows,
        pagination: {
          total: comments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get lesson comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Add lesson comment
 * @route POST /api/lessons/:id/comments
 * @access Private
 */
const addLessonComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    
    // Check if lesson exists
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }
    
    // Create comment
    const comment = await Comment.create({
      content,
      userId: req.user.id,
      lessonId: id,
      parentId: parentId || null
    });
    
    // Get comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: commentWithUser
    });
  } catch (error) {
    console.error('Add lesson comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Mark lesson as complete
 * @route POST /api/lessons/:id/complete
 * @access Private
 */
const completeLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if lesson exists
    const lesson = await Lesson.findByPk(id);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Find or create progress record
    const [progress, created] = await UserProgress.findOrCreate({
      where: {
        userId: req.user.id,
        lessonId: id
      },
      defaults: {
        userId: req.user.id,
        courseId: lesson.courseId,
        lessonId: id,
        progress: 100,
        lastAccessedAt: new Date()
      }
    });
    
    // If record already exists, update it
    if (!created) {
      progress.progress = 100;
      progress.lastAccessedAt = new Date();
      await progress.save();
    }
    
    // Update course progress
    await updateCourseProgress(req.user.id, lesson.courseId);
    
    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      data: progress
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Helper function to update course progress
 */
const updateCourseProgress = async (userId, courseId) => {
  try {
    // Get all lessons for the course
    const lessons = await Lesson.findAll({
      where: {
        courseId,
        isPublished: true
      }
    });
    
    if (lessons.length === 0) return;
    
    // Get completed lessons
    const completedLessons = await UserProgress.count({
      where: {
        userId,
        courseId,
        lessonId: {
          [Op.ne]: null
        },
        progress: 100
      }
    });
    
    // Calculate course progress
    const progress = Math.round((completedLessons / lessons.length) * 100);
    
    // Update course progress
    await UserProgress.upsert({
      userId,
      courseId,
      lessonId: null,
      exerciseId: null,
      progress,
      lastAccessedAt: new Date()
    });
  } catch (error) {
    console.error('Update course progress error:', error);
    throw error;
  }
};

module.exports = {
  getAllLessons,
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  uploadLessonMedia,
  updateLessonOrder,
  getLessonComments,
  addLessonComment,
  completeLesson
}; 