const { Enrollment, User, Course, UserProgress, Lesson } = require('../models');
const { Op } = require('sequelize');

class EnrollmentController {
  // Đăng ký khóa học
  async enroll(req, res) {
    try {
      const { courseId } = req.body;
      const userId = req.user.id;

      // Kiểm tra xem khóa học có tồn tại không
      const course = await Course.findByPk(courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Khóa học không tồn tại'
        });
      }

      // Kiểm tra xem người dùng đã đăng ký khóa học này chưa
      const existingEnrollment = await Enrollment.findOne({
        where: { userId, courseId }
      });
      if (existingEnrollment) {
        return res.status(400).json({
          success: false,
          message: 'Bạn đã đăng ký khóa học này'
        });
      }

      // Tạo đăng ký mới
      const enrollment = await Enrollment.create({
        userId,
        courseId,
        status: 'active'
      });

      return res.status(201).json({
        success: true,
        message: 'Đăng ký khóa học thành công',
        data: enrollment
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy danh sách khóa học đã đăng ký của người dùng (Tính toán tiến độ từ bài học)
  async getUserEnrollments(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Step 1: Fetch enrollments with basic course details
      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        where: { userId },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'thumbnail', 'level', 'duration']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      // Step 2: Get course IDs from the fetched enrollments
      const courseIds = enrollments.map(enrollment => enrollment.courseId);

      // Step 3: Fetch necessary data for progress calculation if courses exist
      let courseProgressMap = {}; // Map to store calculated progress { courseId: progress }
      if (courseIds.length > 0) {
          // 3a: Fetch all *published* lessons for these courses
          const courseLessons = await Lesson.findAll({
              where: {
                  courseId: { [Op.in]: courseIds },
                  isPublished: true
              },
              attributes: ['id', 'courseId'] // Only need id and courseId
          });

          // 3b: Fetch all *lesson-specific* progress records for the user and these courses
          const lessonProgressRecords = await UserProgress.findAll({
              where: {
                  userId: userId,
                  courseId: { [Op.in]: courseIds },
                  lessonId: { [Op.ne]: null } // IMPORTANT: Only get lesson progress
              },
              attributes: ['lessonId', 'progress'] // Only need lessonId and progress
          });

          // 3c: Create helper maps for calculation
          const completedLessonsMap = {}; // { lessonId: true/false }
          lessonProgressRecords.forEach(record => {
              if (record.progress === 100) {
                  completedLessonsMap[record.lessonId] = true;
              }
          });

          const totalLessonsMap = {}; // { courseId: count }
          const completedLessonsCountMap = {}; // { courseId: count }

          courseLessons.forEach(lesson => {
              // Count total published lessons per course
              totalLessonsMap[lesson.courseId] = (totalLessonsMap[lesson.courseId] || 0) + 1;
              
              // Count completed lessons per course using the progress map
              if (completedLessonsMap[lesson.id]) {
                  completedLessonsCountMap[lesson.courseId] = (completedLessonsCountMap[lesson.courseId] || 0) + 1;
              }
          });

          // 3d: Calculate final progress percentage for each course
          courseIds.forEach(courseId => {
              const total = totalLessonsMap[courseId] || 0;
              const completed = completedLessonsCountMap[courseId] || 0;
              if (total > 0) {
                  courseProgressMap[courseId] = Math.round((completed / total) * 100);
              } else {
                  courseProgressMap[courseId] = 0; // No published lessons = 0% progress
              }
          });
          
          console.log("Calculated courseProgressMap:", JSON.stringify(courseProgressMap, null, 2)); // Log calculated progress
      }

      // Step 4: Combine enrollment data with the *calculated* course progress
      const enrollmentsWithCalculatedProgress = enrollments.map(enrollment => {
          const plainEnrollment = enrollment.get({ plain: true }); // Get plain object
          const calculatedProgress = courseProgressMap[plainEnrollment.courseId] || 0; // Get calculated progress
          
          // Add the calculated progress as a top-level field
          plainEnrollment.calculatedProgress = calculatedProgress;
          
          // Keep the original course object as is (or remove progress from it if it exists)
          // if (plainEnrollment.course && plainEnrollment.course.hasOwnProperty('progress')) {
          //    delete plainEnrollment.course.progress; 
          // }
          
          return plainEnrollment;
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách khóa học thành công',
        data: {
          enrollments: enrollmentsWithCalculatedProgress, // Return the list with calculated progress
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy chi tiết đăng ký
  async getEnrollmentById(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findByPk(id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'fullName']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'title', 'description', 'thumbnail', 'level', 'duration']
          }
        ]
      });

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin đăng ký'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Lấy thông tin đăng ký thành công',
        data: enrollment
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Cập nhật tiến độ học tập
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const { progress } = req.body;

      const enrollment = await Enrollment.findByPk(id);
      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin đăng ký'
        });
      }

      // Cập nhật tiến độ
      enrollment.progress = progress;
      
      // Nếu tiến độ đạt 100%, cập nhật trạng thái thành completed
      if (progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }

      await enrollment.save();

      return res.status(200).json({
        success: true,
        message: 'Cập nhật tiến độ thành công',
        data: enrollment
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Hủy đăng ký
  async cancelEnrollment(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findByPk(id);

      if (!enrollment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy thông tin đăng ký'
        });
      }

      // Chỉ cho phép hủy đăng ký khi trạng thái là active hoặc pending
      if (!['active', 'pending'].includes(enrollment.status)) {
        return res.status(400).json({
          success: false,
          message: 'Không thể hủy đăng ký ở trạng thái hiện tại'
        });
      }

      enrollment.status = 'cancelled';
      await enrollment.save();

      return res.status(200).json({
        success: true,
        message: 'Hủy đăng ký thành công',
        data: enrollment
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Lấy danh sách học viên của một khóa học (cho admin)
  async getCourseEnrollments(req, res) {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const { count, rows: enrollments } = await Enrollment.findAndCountAll({
        where: { courseId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email', 'fullName', 'profileImage']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        message: 'Lấy danh sách học viên thành công',
        data: {
          enrollments,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Kiểm tra trạng thái đăng ký
  async checkEnrollmentStatus(req, res) {
    try {
      const { courseId } = req.params;
      const userId = req.user.id;

      const enrollment = await Enrollment.findOne({
        where: { userId, courseId }
      });

      return res.status(200).json({
        success: true,
        message: 'Kiểm tra trạng thái thành công',
        data: {
          status: enrollment ? enrollment.status : null,
          enrollment: enrollment || null
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EnrollmentController(); 