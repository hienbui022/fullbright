const { validationResult } = require('express-validator');

/**
 * Middleware để xử lý kết quả validation từ express-validator
 * Nếu có lỗi, trả về response với danh sách lỗi
 * Nếu không có lỗi, tiếp tục xử lý request
 */
exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
}; 