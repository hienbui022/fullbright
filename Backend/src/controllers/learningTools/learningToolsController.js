const { LearningTool, UserToolProgress, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all learning tools
 * @route GET /api/learning-tools
 * @access Public
 */
const getAllTools = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, type } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    };
    
    // Build where clause
    const whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }
    
    // Get tools
    const tools = await LearningTool.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(tools.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        tools: tools.rows,
        pagination: {
          total: tools.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get learning tool by ID
 * @route GET /api/learning-tools/:id
 * @access Public
 */
const getToolById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get tool
    const tool = await LearningTool.findByPk(id);
    
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Get user progress if authenticated
    let userProgress = null;
    if (req.user) {
      userProgress = await UserToolProgress.findOne({
        where: {
          userId: req.user.id,
          toolId: id
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        tool,
        userProgress: userProgress || null
      }
    });
  } catch (error) {
    console.error('Get tool by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create learning tool
 * @route POST /api/learning-tools
 * @access Private/Admin
 */
const createTool = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      type, 
      category, 
      content, 
      instructions, 
      difficulty, 
      estimatedTime,
      isInteractive
    } = req.body;
    
    // Create tool
    const tool = await LearningTool.create({
      name,
      description,
      type,
      category,
      content,
      instructions,
      difficulty,
      estimatedTime,
      isInteractive: isInteractive || false,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Create tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update learning tool
 * @route PUT /api/learning-tools/:id
 * @access Private/Admin
 */
const updateTool = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      type, 
      category, 
      content, 
      instructions, 
      difficulty, 
      estimatedTime,
      isInteractive
    } = req.body;
    
    // Find tool
    const tool = await LearningTool.findByPk(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Update tool
    tool.name = name || tool.name;
    tool.description = description || tool.description;
    tool.type = type || tool.type;
    tool.category = category || tool.category;
    tool.content = content || tool.content;
    tool.instructions = instructions || tool.instructions;
    tool.difficulty = difficulty || tool.difficulty;
    tool.estimatedTime = estimatedTime || tool.estimatedTime;
    tool.isInteractive = isInteractive !== undefined ? isInteractive : tool.isInteractive;
    tool.updatedAt = new Date();
    
    await tool.save();
    
    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (error) {
    console.error('Update tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete learning tool
 * @route DELETE /api/learning-tools/:id
 * @access Private/Admin
 */
const deleteTool = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find tool
    const tool = await LearningTool.findByPk(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Delete tool image if exists
    if (tool.imageUrl) {
      const imagePath = path.join(__dirname, '../../../uploads', tool.imageUrl.split('/').pop());
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete tool
    await tool.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Learning tool deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Upload tool image
 * @route POST /api/learning-tools/:id/image
 * @access Private/Admin
 */
const uploadToolImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    // Find tool
    const tool = await LearningTool.findByPk(id);
    if (!tool) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Delete old image if exists
    if (tool.imageUrl) {
      const oldImagePath = path.join(__dirname, '../../../uploads', tool.imageUrl.split('/').pop());
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update tool with new image URL
    const imageUrl = `/uploads/${req.file.filename}`;
    tool.imageUrl = imageUrl;
    await tool.save();
    
    res.status(200).json({
      success: true,
      data: {
        imageUrl
      }
    });
  } catch (error) {
    console.error('Upload tool image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get tools by category
 * @route GET /api/learning-tools/category/:category
 * @access Public
 */
const getToolsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get tools by category
    const tools = await LearningTool.findAndCountAll({
      where: { category },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(tools.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        tools: tools.rows,
        pagination: {
          total: tools.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get tools by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get tools by type
 * @route GET /api/learning-tools/type/:type
 * @access Public
 */
const getToolsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get tools by type
    const tools = await LearningTool.findAndCountAll({
      where: { type },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(tools.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        tools: tools.rows,
        pagination: {
          total: tools.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get tools by type error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Search learning tools
 * @route GET /api/learning-tools/search
 * @access Public
 */
const searchTools = async (req, res) => {
  try {
    const { query, category, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (query) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (type) {
      whereClause.type = type;
    }
    
    // Get tools
    const tools = await LearningTool.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(tools.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        tools: tools.rows,
        pagination: {
          total: tools.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Search tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Start using a learning tool
 * @route POST /api/learning-tools/:id/start
 * @access Private
 */
const startTool = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find tool
    const tool = await LearningTool.findByPk(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Check if user has already started this tool
    let progress = await UserToolProgress.findOne({
      where: {
        userId: req.user.id,
        toolId: id
      }
    });
    
    if (progress) {
      // Update last accessed time
      progress.lastAccessedAt = new Date();
      await progress.save();
    } else {
      // Create new progress record
      progress = await UserToolProgress.create({
        userId: req.user.id,
        toolId: id,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        isCompleted: false
      });
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Start tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Complete a learning tool
 * @route PUT /api/learning-tools/:id/complete
 * @access Private
 */
const completeTool = async (req, res) => {
  try {
    const { id } = req.params;
    const { score } = req.body;
    
    // Find tool
    const tool = await LearningTool.findByPk(id);
    if (!tool) {
      return res.status(404).json({
        success: false,
        message: 'Learning tool not found'
      });
    }
    
    // Find or create progress record
    let [progress, created] = await UserToolProgress.findOrCreate({
      where: {
        userId: req.user.id,
        toolId: id
      },
      defaults: {
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        completedAt: new Date(),
        isCompleted: true,
        score: score || null
      }
    });
    
    if (!created) {
      // Update existing progress
      progress.lastAccessedAt = new Date();
      progress.completedAt = new Date();
      progress.isCompleted = true;
      progress.score = score || progress.score;
      await progress.save();
    }
    
    res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Complete tool error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get user's learning tools progress
 * @route GET /api/learning-tools/progress
 * @access Private
 */
const getUserToolsProgress = async (req, res) => {
  try {
    const { page = 1, limit = 10, completed } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {
      userId: req.user.id
    };
    
    if (completed !== undefined) {
      whereClause.isCompleted = completed === 'true';
    }
    
    // Get user's tool progress
    const progress = await UserToolProgress.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: LearningTool,
          as: 'tool'
        }
      ],
      order: [['lastAccessedAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(progress.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        progress: progress.rows,
        pagination: {
          total: progress.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get user tools progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get popular learning tools
 * @route GET /api/learning-tools/popular
 * @access Public
 */
const getPopularTools = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get tools with the most user progress records
    const tools = await LearningTool.findAll({
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*)
              FROM UserToolProgress
              WHERE UserToolProgress.toolId = LearningTool.id
            )`),
            'userCount'
          ]
        ]
      },
      order: [[sequelize.literal('userCount'), 'DESC']],
      limit: parseInt(limit)
    });
    
    res.status(200).json({
      success: true,
      data: tools
    });
  } catch (error) {
    console.error('Get popular tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get recommended learning tools for user
 * @route GET /api/learning-tools/recommended
 * @access Private
 */
const getRecommendedTools = async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    // Get user's completed tools
    const completedTools = await UserToolProgress.findAll({
      where: {
        userId: req.user.id,
        isCompleted: true
      },
      attributes: ['toolId']
    });
    
    const completedToolIds = completedTools.map(progress => progress.toolId);
    
    // Get tools that user hasn't completed yet
    const recommendedTools = await LearningTool.findAll({
      where: {
        id: {
          [Op.notIn]: completedToolIds
        }
      },
      limit: parseInt(limit),
      order: sequelize.random()
    });
    
    res.status(200).json({
      success: true,
      data: recommendedTools
    });
  } catch (error) {
    console.error('Get recommended tools error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
  uploadToolImage,
  getToolsByCategory,
  getToolsByType,
  searchTools,
  startTool,
  completeTool,
  getUserToolsProgress,
  getPopularTools,
  getRecommendedTools
}; 