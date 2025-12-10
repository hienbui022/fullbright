# English Fullbright - Backend

Backend API cho nền tảng học tiếng Anh English Fullbright, cung cấp các tính năng quản lý người dùng, khóa học, bài học, lộ trình học tập, công cụ học tập, tin tức và cộng đồng.

## Công nghệ sử dụng

- **Node.js**: Môi trường runtime JavaScript
- **Express**: Framework web cho Node.js
- **Sequelize**: ORM (Object-Relational Mapping) cho cơ sở dữ liệu
- **MySQL**: Hệ quản trị cơ sở dữ liệu quan hệ
- **JWT**: JSON Web Token cho xác thực người dùng
- **Bcrypt**: Mã hóa mật khẩu
- **Multer**: Xử lý tải lên tệp
- **Express Validator**: Xác thực dữ liệu đầu vào
- **Helmet**: Bảo mật HTTP headers
- **CORS**: Cross-Origin Resource Sharing
- **Morgan**: HTTP request logger
- **Winston**: Logger cho ứng dụng

## Cấu trúc thư mục

```
backend/
├── src/                  # Mã nguồn chính
│   ├── config/           # Cấu hình ứng dụng và cơ sở dữ liệu
│   ├── controllers/      # Xử lý logic nghiệp vụ
│   ├── middleware/       # Middleware cho xác thực, xác thực quyền, xử lý lỗi
│   ├── models/           # Định nghĩa model Sequelize
│   ├── routes/           # Định nghĩa API routes
│   ├── utils/            # Tiện ích và hàm helper
│   ├── app.js            # Cấu hình Express app
│   └── server.js         # Entry point của ứng dụng
├── uploads/              # Thư mục lưu trữ tệp tải lên
├── .env                  # Biến môi trường (không được commit)
├── .env.example          # Mẫu cho file .env
├── package.json          # Cấu hình npm và dependencies
└── README.md             # Tài liệu dự án
```

## Các model chính

- **User**: Quản lý thông tin người dùng, xác thực và phân quyền
- **Course**: Khóa học tiếng Anh
- **Lesson**: Bài học trong khóa học
- **LearningPath**: Lộ trình học tập được cá nhân hóa
- **Exercise**: Bài tập và đánh giá
- **Flashcard**: Thẻ ghi nhớ từ vựng
- **News**: Tin tức và bài viết về tiếng Anh
- **ForumPost**: Bài đăng trên diễn đàn cộng đồng
- **Comment**: Bình luận cho bài đăng
- **UserProgress**: Theo dõi tiến độ học tập của người dùng

## Cài đặt

### Yêu cầu

- Node.js (v14 trở lên)
- MySQL (v8 trở lên)

### Các bước cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd english-fullbright/backend
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file .env từ .env.example:
   ```bash
   cp .env.example .env
   ```

4. Cấu hình biến môi trường trong file .env:
   ```
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=english_fullbright
   DB_DIALECT=mysql
   DB_LOGGING=true
   DB_FORCE_SYNC=false

   # JWT Configuration
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

5. Khởi tạo cơ sở dữ liệu:
   ```bash
   # Đăng nhập vào MySQL
   mysql -u root -p
   
   # Tạo cơ sở dữ liệu
   CREATE DATABASE english_fullbright;
   ```

6. Khởi động server:
   ```bash
   # Chế độ development với nodemon
   npm run dev
   
   # Hoặc chế độ production
   npm start
   ```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký người dùng mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Yêu cầu đặt lại mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại

### Người dùng

- `GET /api/users` - Lấy danh sách người dùng (Admin)
- `GET /api/users/:id` - Lấy thông tin người dùng theo ID
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa người dùng (Admin)
- `PUT /api/users/:id/profile-image` - Cập nhật ảnh đại diện

### Khóa học

- `GET /api/courses` - Lấy danh sách khóa học
- `GET /api/courses/:id` - Lấy thông tin khóa học theo ID
- `POST /api/courses` - Tạo khóa học mới (Admin)
- `PUT /api/courses/:id` - Cập nhật khóa học (Admin)
- `DELETE /api/courses/:id` - Xóa khóa học (Admin)

### Bài học

- `GET /api/lessons` - Lấy danh sách bài học
- `GET /api/lessons/:id` - Lấy thông tin bài học theo ID
- `POST /api/lessons` - Tạo bài học mới (Admin)
- `PUT /api/lessons/:id` - Cập nhật bài học (Admin)
- `DELETE /api/lessons/:id` - Xóa bài học (Admin)

### Lộ trình học tập

- `GET /api/learning-paths` - Lấy danh sách lộ trình học tập
- `GET /api/learning-paths/:id` - Lấy thông tin lộ trình học tập theo ID
- `POST /api/learning-paths` - Tạo lộ trình học tập mới (Admin)
- `PUT /api/learning-paths/:id` - Cập nhật lộ trình học tập (Admin)
- `DELETE /api/learning-paths/:id` - Xóa lộ trình học tập (Admin)

### Công cụ học tập

- `GET /api/learning-tools/flashcards` - Lấy danh sách thẻ ghi nhớ
- `GET /api/learning-tools/flashcards/:id` - Lấy thông tin thẻ ghi nhớ theo ID
- `POST /api/learning-tools/flashcards` - Tạo thẻ ghi nhớ mới (Admin)
- `PUT /api/learning-tools/flashcards/:id` - Cập nhật thẻ ghi nhớ (Admin)
- `DELETE /api/learning-tools/flashcards/:id` - Xóa thẻ ghi nhớ (Admin)

- `GET /api/learning-tools/exercises` - Lấy danh sách bài tập
- `GET /api/learning-tools/exercises/:id` - Lấy thông tin bài tập theo ID
- `POST /api/learning-tools/exercises` - Tạo bài tập mới (Admin)
- `PUT /api/learning-tools/exercises/:id` - Cập nhật bài tập (Admin)
- `DELETE /api/learning-tools/exercises/:id` - Xóa bài tập (Admin)

### Tin tức

- `GET /api/news` - Lấy danh sách tin tức
- `GET /api/news/:id` - Lấy thông tin tin tức theo ID
- `POST /api/news` - Tạo tin tức mới (Admin)
- `PUT /api/news/:id` - Cập nhật tin tức (Admin)
- `DELETE /api/news/:id` - Xóa tin tức (Admin)

### Cộng đồng

- `GET /api/community/posts` - Lấy danh sách bài đăng
- `GET /api/community/posts/:id` - Lấy thông tin bài đăng theo ID
- `POST /api/community/posts` - Tạo bài đăng mới
- `PUT /api/community/posts/:id` - Cập nhật bài đăng
- `DELETE /api/community/posts/:id` - Xóa bài đăng

- `GET /api/community/posts/:id/comments` - Lấy danh sách bình luận của bài đăng
- `POST /api/community/posts/:id/comments` - Thêm bình luận mới
- `PUT /api/community/comments/:id` - Cập nhật bình luận
- `DELETE /api/community/comments/:id` - Xóa bình luận

## Xử lý lỗi

API trả về các mã lỗi HTTP tiêu chuẩn:

- `200 OK` - Yêu cầu thành công
- `201 Created` - Tạo tài nguyên thành công
- `400 Bad Request` - Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized` - Không có quyền truy cập
- `403 Forbidden` - Không có quyền thực hiện hành động
- `404 Not Found` - Không tìm thấy tài nguyên
- `500 Internal Server Error` - Lỗi server

## Bảo mật

- Xác thực JWT cho các API endpoints được bảo vệ
- Mã hóa mật khẩu với bcrypt
- Bảo vệ chống lại các cuộc tấn công phổ biến với helmet
- Xác thực dữ liệu đầu vào với express-validator

## Phát triển

### Scripts

- `npm start` - Khởi động server trong chế độ production
- `npm run dev` - Khởi động server trong chế độ development với nodemon

### Quy trình làm việc

1. Tạo branch mới cho tính năng hoặc sửa lỗi
2. Viết code và test
3. Commit và push lên repository
4. Tạo pull request để review
5. Merge vào branch chính sau khi được chấp thuận

## Liên hệ

Nếu bạn có bất kỳ câu hỏi hoặc đề xuất nào, vui lòng liên hệ:

- Email: [your-email@example.com]
- GitHub: [your-github-profile] 