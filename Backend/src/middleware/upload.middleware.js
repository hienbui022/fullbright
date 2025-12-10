const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const createUploadDirs = () => {
  const dirs = [
    path.join(__dirname, '../../uploads'),
    path.join(__dirname, '../../uploads/avatars'),
    path.join(__dirname, '../../uploads/courses'),
    path.join(__dirname, '../../uploads/lessons'),
    path.join(__dirname, '../../uploads/news'),
    path.join(__dirname, '../../uploads/flashcards'),
    path.join(__dirname, '../../uploads/exercises')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '../../uploads');
    
    // Xác định thư mục lưu trữ dựa trên route
    if (req.originalUrl.includes('/users') || req.originalUrl.includes('/profile')) {
      uploadPath = path.join(__dirname, '../../uploads/avatars');
    } else if (req.originalUrl.includes('/courses')) {
      uploadPath = path.join(__dirname, '../../uploads/courses');
    } else if (req.originalUrl.includes('/lessons')) {
      uploadPath = path.join(__dirname, '../../uploads/lessons');
    } else if (req.originalUrl.includes('/news')) {
      uploadPath = path.join(__dirname, '../../uploads/news');
    } else if (req.originalUrl.includes('/flashcards')) {
      uploadPath = path.join(__dirname, '../../uploads/flashcards');
    } else if (req.originalUrl.includes('/exercises')) {
      uploadPath = path.join(__dirname, '../../uploads/exercises');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: timestamp + tên gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Lọc file
const fileFilter = (req, file, cb) => {
  // Kiểm tra loại file
  if (file.mimetype.startsWith('image/')) {
    // Cho phép tải lên ảnh
    cb(null, true);
  } else if (file.mimetype.startsWith('audio/') && req.originalUrl.includes('/audio')) {
    // Cho phép tải lên audio nếu route có chứa /audio
    cb(null, true);
  } else if (file.mimetype.startsWith('video/') && req.originalUrl.includes('/video')) {
    // Cho phép tải lên video nếu route có chứa /video
    cb(null, true);
  } else if (
    (file.mimetype === 'application/pdf' || 
     file.mimetype === 'application/msword' || 
     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') && 
    req.originalUrl.includes('/documents')
  ) {
    // Cho phép tải lên PDF và Word nếu route có chứa /documents
    cb(null, true);
  } else {
    // Từ chối các loại file khác
    cb(new Error('Loại file không được hỗ trợ'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Giới hạn 10MB
  }
});

// Middleware xử lý lỗi upload
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File quá lớn. Kích thước tối đa là 10MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Lỗi upload: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

module.exports = {
  upload,
  handleUploadError
}; 