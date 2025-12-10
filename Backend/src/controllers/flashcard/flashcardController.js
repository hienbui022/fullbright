const db = require('../../models');
const { Op } = require('sequelize');
// const fs = require('fs'); // No longer needed for file system operations here
// const path = require('path'); // No longer needed for file system operations here
const { validationResult } = require('express-validator');

// Lấy tất cả flashcard (có phân trang và lọc)
exports.getAllFlashcards = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { category, courseId } = req.query;
    
    // Điều kiện tìm kiếm
    const whereClause = {};
    if (category) {
      whereClause.category = category;
    }
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    // Lấy flashcards
    const flashcards = await db.Flashcard.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: db.Lesson,
          as: 'lesson',
          attributes: ['id', 'title'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Tính tổng số trang
    const totalPages = Math.ceil(flashcards.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        flashcards: flashcards.rows,
        pagination: {
          total: flashcards.count,
          page,
          limit,
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllFlashcards:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server'
    });
  }
};

// Lấy flashcard theo ID
exports.getFlashcardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const flashcard = await db.Flashcard.findByPk(id, {
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        },
        {
          model: db.Course,
          as: 'course',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: db.Lesson,
          as: 'lesson',
          attributes: ['id', 'title'],
          required: false
        }
      ]
    });
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: flashcard
    });
  } catch (error) {
    console.error('Error in getFlashcardById:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thông tin flashcard',
      error: error.message
    });
  }
};

// Tạo flashcard mới
exports.createFlashcard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const {
      term,
      definition,
      example,
      category,
      difficulty,
      courseId,
      lessonId,
      imageUrl,
      audioUrl
    } = req.body;
    
    const newFlashcard = await db.Flashcard.create({
      term,
      definition,
      example,
      category,
      difficulty,
      courseId: courseId || null,
      lessonId: lessonId || null,
      imageUrl: imageUrl || null,
      audioUrl: audioUrl || null,
      createdBy: req.user.id
    });
    
    return res.status(201).json({
      success: true,
      message: 'Flashcard đã được tạo thành công',
      data: newFlashcard
    });
  } catch (error) {
    console.error('Error in createFlashcard:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi tạo flashcard',
      error: error.message
    });
  }
};

// Cập nhật flashcard
exports.updateFlashcard = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const {
      term,
      definition,
      example,
      category,
      difficulty,
      courseId,
      lessonId,
      imageUrl,
      audioUrl
    } = req.body;
    
    const flashcard = await db.Flashcard.findByPk(id);
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Kiểm tra quyền (chỉ admin hoặc người tạo mới có thể cập nhật)
    if (flashcard.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật flashcard này'
      });
    }
    
    await flashcard.update({
      term,
      definition,
      example,
      category,
      difficulty,
      courseId: courseId || null,
      lessonId: lessonId || null,
      imageUrl: imageUrl !== undefined ? imageUrl : flashcard.imageUrl,
      audioUrl: audioUrl !== undefined ? audioUrl : flashcard.audioUrl,
    });
    
    return res.status(200).json({
      success: true,
      message: 'Flashcard đã được cập nhật thành công',
      data: flashcard
    });
  } catch (error) {
    console.error('Error in updateFlashcard:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật flashcard',
      error: error.message
    });
  }
};

// Xóa flashcard
exports.deleteFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    
    const flashcard = await db.Flashcard.findByPk(id);
    
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Kiểm tra quyền (chỉ admin hoặc người tạo mới có thể xóa)
    if (flashcard.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa flashcard này'
      });
    }
    
    // Xóa các bản ghi tiến trình liên quan
    await db.UserFlashcardProgress.destroy({
      where: { flashcardId: id }
    });
    
    await flashcard.destroy();
    
    return res.status(200).json({
      success: true,
      message: 'Flashcard đã được xóa thành công'
    });
  } catch (error) {
    console.error('Error in deleteFlashcard:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi xóa flashcard',
      error: error.message
    });
  }
};

// Lấy flashcard theo category
exports.getFlashcardsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count, rows } = await db.Flashcard.findAndCountAll({
      where: { category },
      limit,
      offset,
      include: [
        {
          model: db.User,
          as: 'creator',
          attributes: ['id', 'username', 'fullName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error in getFlashcardsByCategory:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách flashcard theo danh mục',
      error: error.message
    });
  }
};

// Lấy tiến trình học flashcard của người dùng
exports.getUserFlashcardProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { flashcardId } = req.params;
    
    const progress = await db.UserFlashcardProgress.findOne({
      where: { userId, flashcardId },
      include: [
        {
          model: db.Flashcard,
          as: 'flashcard'
        }
      ]
    });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tiến trình học cho flashcard này'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error in getUserFlashcardProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy tiến trình học flashcard',
      error: error.message
    });
  }
};

// Cập nhật tiến trình học flashcard của người dùng
exports.updateUserFlashcardProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { flashcardId } = req.params;
    const { isCorrect } = req.body;
    
    // Kiểm tra flashcard có tồn tại không
    const flashcard = await db.Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy flashcard'
      });
    }
    
    // Tìm hoặc tạo bản ghi tiến trình
    let [progress, created] = await db.UserFlashcardProgress.findOrCreate({
      where: { userId, flashcardId },
      defaults: {
        userId,
        flashcardId,
        status: 'new',
        correctCount: 0,
        incorrectCount: 0,
        lastReviewedAt: new Date(),
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Mặc định 1 ngày sau
        easeFactor: 2.5,
        interval: 1
      }
    });
    
    // Cập nhật tiến trình dựa trên thuật toán SM-2 (Spaced Repetition)
    const now = new Date();
    let { status, correctCount, incorrectCount, easeFactor, interval } = progress;
    
    if (isCorrect) {
      correctCount += 1;
      
      // Cập nhật trạng thái dựa trên số lần trả lời đúng
      if (correctCount >= 10) {
        status = 'mastered';
      } else if (correctCount >= 5) {
        status = 'reviewing';
      } else if (correctCount >= 1) {
        status = 'learning';
      }
      
      // Cập nhật easeFactor và interval theo thuật toán SM-2
      if (status !== 'new') {
        easeFactor = Math.max(1.3, easeFactor + 0.1);
        interval = Math.round(interval * easeFactor);
      }
    } else {
      incorrectCount += 1;
      
      // Nếu trả lời sai, giảm easeFactor và reset interval
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      interval = 1;
      
      // Nếu đang ở trạng thái mastered mà trả lời sai, quay lại reviewing
      if (status === 'mastered') {
        status = 'reviewing';
      }
    }
    
    // Tính toán thời gian ôn tập tiếp theo
    const nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    
    // Cập nhật bản ghi tiến trình
    await progress.update({
      status,
      correctCount,
      incorrectCount,
      lastReviewedAt: now,
      nextReviewAt,
      easeFactor,
      interval
    });
    
    return res.status(200).json({
      success: true,
      message: 'Tiến trình học flashcard đã được cập nhật',
      data: progress
    });
  } catch (error) {
    console.error('Error in updateUserFlashcardProgress:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi cập nhật tiến trình học flashcard',
      error: error.message
    });
  }
};

// Lấy danh sách flashcard cần ôn tập
exports.getFlashcardsForReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    // Lấy các flashcard có nextReviewAt <= thời điểm hiện tại
    const now = new Date();
    
    const progress = await db.UserFlashcardProgress.findAll({
      where: {
        userId,
        nextReviewAt: {
          [Op.lte]: now
        },
        status: {
          [Op.ne]: 'mastered' // Không lấy các flashcard đã thuộc
        }
      },
      include: [
        {
          model: db.Flashcard,
          as: 'flashcard',
          include: [
            {
              model: db.Course,
              as: 'course',
              attributes: ['id', 'title'],
              required: false
            },
            {
              model: db.Lesson,
              as: 'lesson',
              attributes: ['id', 'title'],
              required: false
            }
          ]
        }
      ],
      limit,
      order: [['nextReviewAt', 'ASC']]
    });
    
    return res.status(200).json({
      success: true,
      data: progress
    });
  } catch (error) {
    console.error('Error in getFlashcardsForReview:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy danh sách flashcard cần ôn tập',
      error: error.message
    });
  }
};

// Lấy thống kê tiến trình học flashcard
exports.getFlashcardProgressStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Đếm số lượng flashcard theo từng trạng thái
    const stats = await db.UserFlashcardProgress.findAll({
      attributes: [
        'status',
        [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
      ],
      where: { userId },
      group: ['status']
    });
    
    // Tính tổng số flashcard đã học
    const totalLearned = await db.UserFlashcardProgress.count({
      where: { userId }
    });
    
    // Tính tổng số flashcard có trong hệ thống
    const totalFlashcards = await db.Flashcard.count();
    
    // Tạo đối tượng kết quả
    const result = {
      totalLearned,
      totalFlashcards,
      notStarted: totalFlashcards - totalLearned,
      byStatus: {}
    };
    
    // Chuyển đổi kết quả thống kê thành đối tượng
    stats.forEach(stat => {
      result.byStatus[stat.status] = stat.get('count');
    });
    
    // Đảm bảo tất cả trạng thái đều có trong kết quả
    ['new', 'learning', 'reviewing', 'mastered'].forEach(status => {
      if (!result.byStatus[status]) {
        result.byStatus[status] = 0;
      }
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getFlashcardProgressStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi lấy thống kê tiến trình học flashcard',
      error: error.message
    });
  }
}; 