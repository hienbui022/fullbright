const { News, User, sequelize } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Get all news
 * @route GET /api/news
 * @access Public
 */
const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, published } = req.query;
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
      order: [['createdAt', 'DESC']]
    };
    
    // Filter by published status if specified
    if (published !== undefined) {
      options.where = { isPublished: published === 'true' };
    } else {
      // Chỉ lọc theo trạng thái xuất bản khi gọi từ client, không lọc khi gọi từ admin
      // Kiểm tra header để biết request đến từ đâu
      const isAdminRequest = req.headers['x-admin-request'] === 'true';
      
      // Nếu không phải request từ admin và người dùng không phải admin, chỉ hiển thị tin đã xuất bản
      if (!isAdminRequest && (!req.user || !req.user.isAdmin)) {
        options.where = { isPublished: true };
      }
    }
    
    // Get news
    const news = await News.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(news.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        news: news.rows,
        pagination: {
          total: news.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get news by ID
 * @route GET /api/news/:id
 * @access Public
 */
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get news with creator
    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ]
    });
    
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // If news is not published and user is not admin, return 404
    if (!news.isPublished && (!req.user || !req.user.isAdmin)) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Increment view count
    news.viewCount += 1;
    await news.save();
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create news
 * @route POST /api/news
 * @access Private/Admin
 */
const createNews = async (req, res) => {
  try {
    const { 
      title, 
      content, 
      summary, 
      category,
      imageUrl, 
      tags, 
      isPublished = false 
    } = req.body;
    
    // Create news
    const news = await News.create({
      title,
      content,
      summary,
      category,
      imageUrl,
      tags,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      createdBy: req.user.id
    });
    
    res.status(201).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update news
 * @route PUT /api/news/:id
 * @access Private/Admin
 */
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      content, 
      summary, 
      category,
      imageUrl, 
      tags, 
      isPublished 
    } = req.body;
    
    // Find news
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Update news
    news.title = title || news.title;
    news.content = content || news.content;
    news.summary = summary || news.summary;
    news.category = category || news.category;
    news.imageUrl = imageUrl !== undefined ? imageUrl : news.imageUrl;
    news.tags = tags || news.tags;
    
    // Update published status and date if changed
    if (isPublished !== undefined && isPublished !== news.isPublished) {
      news.isPublished = isPublished;
      if (isPublished) {
        news.publishedAt = new Date();
      }
    }
    
    await news.save();
    
    res.status(200).json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Update news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete news
 * @route DELETE /api/news/:id
 * @access Private/Admin
 */
const deleteNews = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find news
    const news = await News.findByPk(id);
    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Delete image if exists
    if (news.image) {
      const imagePath = path.join(__dirname, '../../../uploads', news.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete news
    await news.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'News deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Upload news image
 * @route POST /api/news/:id/image
 * @access Private/Admin
 */
const uploadNewsImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }
    
    // Find news
    const news = await News.findByPk(id);
    if (!news) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'News not found'
      });
    }
    
    // Delete old image if exists
    if (news.image) {
      const oldImagePath = path.join(__dirname, '../../../uploads', news.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    // Update news with new image
    news.image = req.file.filename;
    await news.save();
    
    res.status(200).json({
      success: true,
      data: {
        image: req.file.filename
      }
    });
  } catch (error) {
    console.error('Upload news image error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Search news
 * @route GET /api/news/search
 * @access Public
 */
const searchNews = async (req, res) => {
  try {
    const { query, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = { isPublished: true };
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } },
        { summary: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    // Get news
    const news = await News.findAndCountAll({
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
    const totalPages = Math.ceil(news.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        news: news.rows,
        pagination: {
          total: news.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Search news error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get news by category
 * @route GET /api/news/category/:category
 * @access Public
 */
const getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get news by category
    const news = await News.findAndCountAll({
      where: {
        category,
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
    const totalPages = Math.ceil(news.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        news: news.rows,
        pagination: {
          total: news.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get news by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  uploadNewsImage,
  searchNews,
  getNewsByCategory
}; 