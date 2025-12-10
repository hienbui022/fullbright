const { Course, User, Lesson, UserProgress, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all courses
 * @route GET /api/courses
 * @access Public
 */
const getAllCourses = async (req, res) => {
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
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Get courses
    const courses = await Course.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(courses.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        courses: courses.rows,
        pagination: {
          total: courses.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get course by ID
 * @route GET /api/courses/:id
 * @access Public
 */
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get course with creator and lessons
    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: { 
            include: [
              'id', 
              'title', 
              'description', 
              'order', 
              'contentType', 
              'duration', 
              'isPublished', 
              'videoUrl', 
              'audioUrl', 
              'imageUrl', 
              'content'
            ] 
          },
          order: [['order', 'ASC']]
        }
      ]
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // If user is authenticated, get their progress for this course
    let progress = null;
    if (req.user) {
      progress = await UserProgress.findOne({
        where: {
          userId: req.user.id,
          courseId: id,
          lessonId: null,
          exerciseId: null
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        course,
        userProgress: progress ? progress.progress : 0
      }
    });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create course
 * @route POST /api/courses
 * @access Private/Admin
 */
const createCourse = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      level, 
      skills, 
      topics, 
      duration, 
      price = 0, 
      isPublished = false,
      thumbnail 
    } = req.body;
    
    // Create course
    const course = await Course.create({
      title,
      description,
      level,
      skills,
      topics,
      duration,
      price,
      isPublished,
      thumbnail,
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update course
 * @route PUT /api/courses/:id
 * @access Private/Admin
 */
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      level, 
      skills, 
      topics, 
      duration, 
      price, 
      isPublished,
      thumbnail 
    } = req.body;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update course
    course.title = title || course.title;
    course.description = description || course.description;
    course.level = level || course.level;
    course.skills = skills || course.skills;
    course.topics = topics || course.topics;
    course.duration = duration || course.duration;
    course.price = price !== undefined ? price : course.price;
    course.thumbnail = thumbnail !== undefined ? thumbnail : course.thumbnail;
    
    // Update published status and date if changed
    if (isPublished !== undefined && isPublished !== course.isPublished) {
      course.isPublished = isPublished;
      if (isPublished) {
        course.publishedAt = new Date();
      }
    }
    
    await course.save();
    
    res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete course
 * @route DELETE /api/courses/:id
 * @access Private/Admin
 */
const deleteCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Delete course
    await course.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Search courses
 * @route GET /api/courses/search
 * @access Public
 */
const searchCourses = async (req, res) => {
  try {
    const { 
      query, 
      level, 
      skills, 
      topics, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = { isPublished: true };
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (level) {
      whereClause.level = level;
    }
    
    // For skills and topics, we need to check if the JSON array contains the values
    // This is more complex and depends on the database being used
    // For MySQL, we can use JSON_CONTAINS
    
    // Get courses
    const courses = await Course.findAndCountAll({
      where: whereClause,
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
    const totalPages = Math.ceil(courses.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        courses: courses.rows,
        pagination: {
          total: courses.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Search courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Enroll in course
 * @route POST /api/courses/:id/enroll
 * @access Private
 */
const enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot enroll in unpublished course'
      });
    }
    
    // Check if user is already enrolled
    const existingProgress = await UserProgress.findOne({
      where: {
        userId: req.user.id,
        courseId: id,
        lessonId: null,
        exerciseId: null
      }
    });
    
    if (existingProgress) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }
    
    // Create progress record
    const progress = await UserProgress.create({
      userId: req.user.id,
      courseId: id,
      progress: 0,
      lastAccessedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Enrolled in course successfully',
      data: progress
    });
  } catch (error) {
    console.error('Enroll course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get courses by level
 * @route GET /api/courses/level/:level
 * @access Public
 */
const getCoursesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get courses by level
    const courses = await Course.findAndCountAll({
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
    const totalPages = Math.ceil(courses.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        courses: courses.rows,
        pagination: {
          total: courses.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get courses by level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get courses by skill
 * @route GET /api/courses/skill/:skill
 * @access Public
 */
const getCoursesBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get courses by skill
    // This is a simplified version and may need to be adjusted based on how skills are stored
    const courses = await Course.findAndCountAll({
      where: {
        isPublished: true,
        skills: { [Op.like]: `%${skill}%` }
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
    const totalPages = Math.ceil(courses.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        courses: courses.rows,
        pagination: {
          total: courses.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get courses by skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get courses by topic
 * @route GET /api/courses/topic/:topic
 * @access Public
 */
const getCoursesByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get courses by topic
    // This is a simplified version and may need to be adjusted based on how topics are stored
    const courses = await Course.findAndCountAll({
      where: {
        isPublished: true,
        topics: { [Op.like]: `%${topic}%` }
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
    const totalPages = Math.ceil(courses.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        courses: courses.rows,
        pagination: {
          total: courses.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get courses by topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Publish or unpublish a course
 * @route PATCH /api/courses/:id/publish
 * @access Private/Admin
 */
const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublished } = req.body;
    
    // Find course
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Update published status
    course.isPublished = isPublished;
    
    // Update publishedAt date if publishing
    if (isPublished && !course.publishedAt) {
      course.publishedAt = new Date();
    }
    
    await course.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: course.id,
        title: course.title,
        isPublished: course.isPublished,
        publishedAt: course.publishedAt
      },
      message: `Course ${isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get lessons by course ID
 * @route GET /api/courses/:id/lessons
 * @access Public (or Private depending on your needs)
 */
const getLessonsByCourse = async (req, res) => {
  try {
    const { id } = req.params; // This is courseId
    
    // Find course to ensure it exists
    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học'
      });
    }

    // Find all published lessons for this course
    const lessons = await Lesson.findAll({
        where: {
            courseId: id,
            isPublished: true
        },
        attributes: [ // Select necessary attributes
          'id', 
          'title', 
          'description', 
          'order', 
          'contentType', 
          'duration', 
          'isPublished',
          'videoUrl',
          'audioUrl',
          'imageUrl',
          'content'
        ],
        order: [['order', 'ASC']]
    });

    // If user is authenticated, get their progress for these lessons
    let lessonProgressMap = {};
    if (req.user) {
      const lessonIds = lessons.map(l => l.id);
      if (lessonIds.length > 0) {
          const progressRecords = await UserProgress.findAll({
            where: {
              userId: req.user.id,
              courseId: id, // Ensure progress is for this course
              lessonId: { 
                [Op.in]: lessonIds // Only fetch progress for lessons in this list
              }
            },
            attributes: ['lessonId', 'progress'] // Only need lessonId and progress
          });
          
          // Create a map for quick lookup: { lessonId: progress }
          progressRecords.forEach(p => {
              lessonProgressMap[p.lessonId] = p.progress;
          });
      }
    }
    
    // Map lessons and add isCompleted status
    const lessonsWithCompletion = lessons.map(lesson => {
      const progress = lessonProgressMap[lesson.id] || 0; // Get progress from map, default 0
      return {
        ...lesson.toJSON(), // Convert to plain object
        isCompleted: progress === 100 // Determine completion status
        // You might want to keep 'progress: progress' as well if needed by frontend
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        courseId: course.id, // Keep course context if needed
        courseTitle: course.title,
        lessons: lessonsWithCompletion // Return lessons with completion status
      }
    });
  } catch (error) {
    console.error('Get lessons by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  searchCourses,
  getCoursesByLevel,
  getCoursesBySkill,
  getCoursesByTopic,
  enrollCourse,
  publishCourse,
  getLessonsByCourse
}; 