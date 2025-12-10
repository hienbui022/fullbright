const { LearningPath, Course, User, UserProgress, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all learning paths
 * @route GET /api/learning-paths
 * @access Public
 */
const getAllLearningPaths = async (req, res) => {
  try {
    const { page = 1, limit = 10, published, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']],
      where: {}
    };
    
    // Filter by published status if specified
    if (published !== undefined) {
      options.where.isPublished = published === 'true';
    }

    // Add search condition if search term is provided
    if (search) {
      options.where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { targetAudience: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get learning paths
    const learningPaths = await LearningPath.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(learningPaths.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        learningPaths: learningPaths.rows,
        pagination: {
          total: learningPaths.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all learning paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get learning path by ID
 * @route GET /api/learning-paths/:id
 * @access Public
 */
const getLearningPathById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get learning path with creator and courses
    const learningPath = await LearningPath.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'title', 'description', 'level', 'thumbnail', 'duration', 'isPublished'],
          through: {
            attributes: ['order']
          }
        }
      ]
    });
    
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // If learning path is not published and user is not admin, return 404
    if (!learningPath.isPublished && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // If user is authenticated, get their progress for this learning path
    let progress = null;
    if (req.user) {
      progress = await UserProgress.findOne({
        where: {
          userId: req.user.id,
          learningPathId: id
        }
      });
    }
    
    // Sort courses by order
    learningPath.courses.sort((a, b) => a.LearningPathCourse.order - b.LearningPathCourse.order);
    
    res.status(200).json({
      success: true,
      data: {
        learningPath,
        userProgress: progress ? progress.progress : 0
      }
    });
  } catch (error) {
    console.error('Get learning path by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create learning path
 * @route POST /api/learning-paths
 * @access Private/Admin
 */
const createLearningPath = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      level, 
      estimatedDuration,
      thumbnail,
      isPublished = false 
    } = req.body;
    
    // Create learning path
    const learningPath = await LearningPath.create({
      title,
      description,
      level,
      thumbnail,
      estimatedDuration,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    console.error('Create learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update learning path
 * @route PUT /api/learning-paths/:id
 * @access Private/Admin
 */
const updateLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      level, 
      estimatedDuration,
      thumbnail,
      isPublished 
    } = req.body;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Update learning path
    learningPath.title = title || learningPath.title;
    learningPath.description = description || learningPath.description;
    learningPath.level = level || learningPath.level;
    learningPath.estimatedDuration = estimatedDuration || learningPath.estimatedDuration;
    learningPath.thumbnail = thumbnail !== undefined ? thumbnail : learningPath.thumbnail;
    
    // Update published status and date if changed
    if (isPublished !== undefined && isPublished !== learningPath.isPublished) {
      learningPath.isPublished = isPublished;
      if (isPublished) {
        learningPath.publishedAt = new Date();
      }
    }
    
    await learningPath.save();
    
    res.status(200).json({
      success: true,
      data: learningPath
    });
  } catch (error) {
    console.error('Update learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete learning path
 * @route DELETE /api/learning-paths/:id
 * @access Private/Admin
 */
const deleteLearningPath = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Delete thumbnail if exists
    if (learningPath.thumbnail) {
      const thumbnailPath = path.join(__dirname, '../../../uploads', learningPath.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }
    
    // Delete learning path
    await learningPath.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Learning path deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Upload learning path thumbnail
 * @route POST /api/learning-paths/:id/thumbnail
 * @access Private/Admin
 */
const uploadLearningPathThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Delete old thumbnail if exists
    if (learningPath.thumbnail) {
      const oldThumbnailPath = path.join(__dirname, '../../../uploads', learningPath.thumbnail);
      if (fs.existsSync(oldThumbnailPath)) {
        fs.unlinkSync(oldThumbnailPath);
      }
    }
    
    // Update learning path with new thumbnail
    learningPath.thumbnail = req.file.filename;
    await learningPath.save();
    
    res.status(200).json({
      success: true,
      data: {
        thumbnail: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload learning path thumbnail error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Add course to learning path
 * @route POST /api/learning-paths/:id/courses
 * @access Private/Admin
 */
const addCourseToLearningPath = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { courseId, order } = req.body;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Find course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is already in learning path
    const existingCourse = await sequelize.models.LearningPathCourse.findOne({
      where: {
        learningPathId: id,
        courseId
      }
    });
    
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course is already in learning path'
      });
    }
    
    // Add course to learning path
    await sequelize.models.LearningPathCourse.create({
      learningPathId: id,
      courseId,
      order: order || 0
    }, { transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Course added to learning path successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Add course to learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Remove course from learning path
 * @route DELETE /api/learning-paths/:id/courses/:courseId
 * @access Private/Admin
 */
const removeCourseFromLearningPath = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, courseId } = req.params;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Find course
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is in learning path
    const existingCourse = await sequelize.models.LearningPathCourse.findOne({
      where: {
        learningPathId: id,
        courseId
      }
    });
    
    if (!existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course is not in learning path'
      });
    }
    
    // Remove course from learning path
    await existingCourse.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Course removed from learning path successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Remove course from learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update course order in learning path
 * @route PUT /api/learning-paths/:id/courses/order
 * @access Private/Admin
 */
const updateCourseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const { courses } = req.body;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Validate courses array
    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Courses array is required'
      });
    }
    
    // Update order for each course
    for (const item of courses) {
      if (!item.courseId || item.order === undefined) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Each course must have courseId and order'
        });
      }
      
      await sequelize.models.LearningPathCourse.update(
        { order: item.order },
        { 
          where: { 
            learningPathId: id,
            courseId: item.courseId
          },
          transaction
        }
      );
    }
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Course order updated successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Update course order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get learning paths by level
 * @route GET /api/learning-paths/level/:level
 * @access Public
 */
const getLearningPathsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get learning paths by level
    const learningPaths = await LearningPath.findAndCountAll({
      where: {
        level,
        isPublished: true
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(learningPaths.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        learningPaths: learningPaths.rows,
        pagination: {
          total: learningPaths.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get learning paths by level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Enroll in learning path
 * @route POST /api/learning-paths/:id/enroll
 * @access Private
 */
const enrollLearningPath = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find learning path
    const learningPath = await LearningPath.findByPk(id);
    if (!learningPath) {
      return res.status(404).json({
        success: false,
        message: 'Learning path not found'
      });
    }
    
    // Check if learning path is published
    if (!learningPath.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished learning path'
      });
    }
    
    // Check if user is already enrolled
    const existingProgress = await UserProgress.findOne({
      where: {
        userId: req.user.id,
        learningPathId: id
      }
    });
    
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this learning path'
      });
    }
    
    // Create progress record
    const progress = await UserProgress.create({
      userId: req.user.id,
      learningPathId: id,
      progress: 0,
      lastAccessedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Enrolled in learning path successfully',
      data: progress
    });
  } catch (error) {
    console.error('Enroll learning path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get enrolled learning paths
 * @route GET /api/learning-paths/user/enrolled
 * @access Private
 */
const getEnrolledLearningPaths = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get user progress for learning paths
    const userProgress = await UserProgress.findAndCountAll({
      where: {
        userId: req.user.id,
        learningPathId: {
          [Op.ne]: null
        }
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: LearningPath,
          as: 'learningPath',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'username', 'fullName']
            }
          ]
        }
      ],
      order: [['lastAccessedAt', 'DESC']]
    });
    
    // Format response
    const learningPaths = userProgress.rows.map(progress => ({
      ...progress.learningPath.toJSON(),
      progress: progress.progress,
      lastAccessedAt: progress.lastAccessedAt
    }));
    
    // Calculate total pages
    const totalPages = Math.ceil(userProgress.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        learningPaths,
        pagination: {
          total: userProgress.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get enrolled learning paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllLearningPaths,
  getLearningPathById,
  createLearningPath,
  updateLearningPath,
  deleteLearningPath,
  uploadLearningPathThumbnail,
  addCourseToLearningPath,
  removeCourseFromLearningPath,
  updateCourseOrder,
  getLearningPathsByLevel,
  enrollLearningPath,
  getEnrolledLearningPaths
}; 