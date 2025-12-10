const { User, Course, LearningPath, UserProgress, sequelize } = require('../../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    };
    
    // Add search filter if provided
    if (search) {
      options.where = {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { fullName: { [Op.like]: `%${search}%` } }
        ]
      };
    }
    
    // Get users
    const users = await User.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(users.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own profile or is admin
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    // Get user
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create user (admin only)
 * @route POST /api/users
 * @access Private/Admin
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, isAdmin = false, profileImage } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this username or email already exists'
      });
    }
    
    // Create user - Pass plain password directly
    const user = await User.create({
      username,
      email,
      password, // Pass plain password directly
      fullName,
      isAdmin,
      profileImage
    });
    
    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    
    res.status(201).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update user
 * @route PUT /api/users/:id
 * @access Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = req.body;
    
    // Check if user is updating their own profile or is admin
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if username is being updated and if it's already taken
    if (updateFields.username && updateFields.username !== user.username) {
      const existingUsername = await User.findOne({ where: { username: updateFields.username } });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }
    
    // Check if email is being updated and if it's already taken
    if (updateFields.email && updateFields.email !== user.email) {
      const existingEmail = await User.findOne({ where: { email: updateFields.email } });
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken'
        });
      }
    }
    
    // Only admin can update isAdmin status
    if (!req.user.isAdmin) {
      delete updateFields.isAdmin;
    }
    
    // Update user with only the provided fields
    await user.update(updateFields);
    
    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    
    res.status(200).json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete profile image if exists
    if (user.profileImage) {
      const imagePath = path.join(__dirname, '../../../uploads', user.profileImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete user
    await user.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Upload profile image
 * @route POST /api/users/:id/profile-image
 * @access Private
 */
const uploadProfileImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is updating their own profile
    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Delete old profile image if exists
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../../../uploads', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update user with new profile image
    user.profileImage = req.file.filename;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        profileImage: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload profile image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user courses
 * @route GET /api/users/:id/courses
 * @access Private
 */
const getUserCourses = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own courses or is admin
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    // Get user progress for courses
    const userProgress = await UserProgress.findAll({
      where: {
        userId: id,
        courseId: {
          [Op.ne]: null
        },
        lessonId: null,
        exerciseId: null
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'description', 'level', 'thumbnail', 'duration', 'isPublished']
        }
      ]
    });
    
    // Format response
    const courses = userProgress.map(progress => ({
      ...progress.course.toJSON(),
      progress: progress.progress,
      lastAccessedAt: progress.lastAccessedAt
    }));
    
    res.status(200).json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Get user courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user learning paths
 * @route GET /api/users/:id/learning-paths
 * @access Private
 */
const getUserLearningPaths = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own learning paths or is admin
    if (req.user.id !== parseInt(id) && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    
    // Get user progress for learning paths
    const userProgress = await UserProgress.findAll({
      where: {
        userId: id,
        learningPathId: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['id', 'title', 'description', 'level', 'thumbnail', 'duration', 'isPublished']
        }
      ]
    });
    
    // Format response
    const learningPaths = userProgress.map(progress => ({
      ...progress.learningPath.toJSON(),
      progress: progress.progress,
      lastAccessedAt: progress.lastAccessedAt
    }));
    
    res.status(200).json({
      success: true,
      data: learningPaths
    });
  } catch (error) {
    console.error('Get user learning paths error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user progress
 * @route GET /api/users/:id/progress
 * @access Private/Admin
 */
const getUserProgress = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user
    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'fullName', 'email']
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get course progress
    const courseProgress = await UserProgress.findAll({
      where: {
        userId: id,
        courseId: {
          [Op.ne]: null
        },
        lessonId: null,
        exerciseId: null
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    // Get learning path progress
    const learningPathProgress = await UserProgress.findAll({
      where: {
        userId: id,
        learningPathId: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: LearningPath,
          as: 'learningPath',
          attributes: ['id', 'title']
        }
      ]
    });
    
    // Get lesson progress
    const lessonProgress = await UserProgress.findAll({
      where: {
        userId: id,
        lessonId: {
          [Op.ne]: null
        }
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        user,
        courseProgress: courseProgress.map(cp => ({
          courseId: cp.courseId,
          courseTitle: cp.course.title,
          progress: cp.progress,
          lastAccessedAt: cp.lastAccessedAt
        })),
        learningPathProgress: learningPathProgress.map(lp => ({
          learningPathId: lp.learningPathId,
          learningPathTitle: lp.learningPath.title,
          progress: lp.progress,
          lastAccessedAt: lp.lastAccessedAt
        })),
        lessonProgress: lessonProgress.map(lp => ({
          courseId: lp.courseId,
          courseTitle: lp.course.title,
          lessonId: lp.lessonId,
          progress: lp.progress,
          lastAccessedAt: lp.lastAccessedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Search users
 * @route GET /api/users/search
 * @access Private/Admin
 */
const searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    // Search users
    const users = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${query}%` } },
          { email: { [Op.like]: `%${query}%` } },
          { fullName: { [Op.like]: `%${query}%` } }
        ]
      },
      attributes: { exclude: ['password'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(users.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        users: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update user status (active/inactive)
 * @route PATCH /api/users/:id/status
 * @access Private/Admin
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    
    // Find user
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user status
    user.isActive = isActive;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        isActive: user.isActive
      },
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  uploadProfileImage,
  getUserCourses,
  getUserLearningPaths,
  getUserProgress,
  searchUsers,
  updateUserStatus
}; 