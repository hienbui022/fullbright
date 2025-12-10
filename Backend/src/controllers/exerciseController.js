const db = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const exerciseController = {};

// GET all exercises
exerciseController.getAllExercises = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const offset = (page - 1) * limit;
        const { search, lessonId } = req.query;

        const whereClause = {};
        if (search) {
            whereClause.title = { [Op.like]: `%${search}%` };
        }
        if (lessonId) {
            whereClause.lessonId = lessonId;
        }

        const { count, rows } = await db.Exercise.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            include: [
                {
                    model: db.Lesson,
                    as: 'lesson',
                    attributes: ['id', 'title'] // Include lesson title
                },
                {
                    model: db.User, 
                    as: 'creator', 
                    attributes: ['id', 'username', 'fullName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            success: true,
            data: {
                exercises: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    totalPages
                }
            }
        });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách bài tập' });
    }
};

// GET exercise by ID
exerciseController.getExerciseById = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await db.Exercise.findByPk(id, {
            include: [
                {
                    model: db.Lesson,
                    as: 'lesson',
                    attributes: ['id', 'title']
                },
                {
                    model: db.Course, // Include course info as well
                    as: 'course',
                    attributes: ['id', 'title']
                },
                {
                    model: db.User,
                    as: 'creator',
                    attributes: ['id', 'username', 'fullName']
                }
            ]
        });

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
        }

        res.status(200).json({ success: true, data: exercise });
    } catch (error) {
        console.error('Error fetching exercise by ID:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết bài tập' });
    }
};

// CREATE new exercise
exerciseController.createExercise = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { 
            title, description, type, difficulty, timeLimit, 
            passingScore, courseId, lessonId, isPublished
        } = req.body;

        // Initialize content based on type, can be adjusted later
        let initialContent = {}; 
        if (type === 'multiple_choice') {
            initialContent = { questions: [] }; // Example structure
        } else if (type === 'writing' || type === 'speaking' || type === 'listening') {
            initialContent = { prompt: '' }; // Example structure
        }
        // Add more types as needed

        const newExercise = await db.Exercise.create({
            title,
            description,
            type,
            difficulty,
            content: initialContent, // Start with empty/default content
            timeLimit: timeLimit || null,
            passingScore: passingScore || null,
            courseId: courseId || null,
            lessonId: lessonId || null,
            isPublished: isPublished || false,
            createdBy: req.user.id
        });

        res.status(201).json({ 
            success: true, 
            message: 'Tạo bài tập thành công', 
            data: newExercise 
        });
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi tạo bài tập' });
    }
};

// UPDATE exercise
exerciseController.updateExercise = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { id } = req.params;
        const exercise = await db.Exercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
        }

        // Basic authorization check (can be expanded)
        if (exercise.createdBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền cập nhật bài tập này' });
        }

        // Prevent changing type after creation if needed, as it affects content structure
        // if (req.body.type && req.body.type !== exercise.type) {
        //     return res.status(400).json({ success: false, message: 'Không thể thay đổi loại bài tập sau khi tạo.' });
        // }

        const { 
            title, description, difficulty, timeLimit, 
            passingScore, courseId, lessonId, isPublished, content // Allow updating content here for now
        } = req.body;

        await exercise.update({
            title: title !== undefined ? title : exercise.title,
            description: description !== undefined ? description : exercise.description,
            difficulty: difficulty !== undefined ? difficulty : exercise.difficulty,
            timeLimit: timeLimit !== undefined ? (timeLimit || null) : exercise.timeLimit,
            passingScore: passingScore !== undefined ? (passingScore || null) : exercise.passingScore,
            courseId: courseId !== undefined ? (courseId || null) : exercise.courseId,
            lessonId: lessonId !== undefined ? (lessonId || null) : exercise.lessonId,
            isPublished: isPublished !== undefined ? isPublished : exercise.isPublished,
            content: content !== undefined ? content : exercise.content // Update content if provided
        });

        const updatedExercise = await db.Exercise.findByPk(id, { // Fetch updated data with includes
             include: [
                { model: db.Lesson, as: 'lesson', attributes: ['id', 'title'] },
                { model: db.User, as: 'creator', attributes: ['id', 'username', 'fullName'] }
            ]
        });

        res.status(200).json({ 
            success: true, 
            message: 'Cập nhật bài tập thành công', 
            data: updatedExercise 
        });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật bài tập' });
    }
};

// DELETE exercise
exerciseController.deleteExercise = async (req, res) => {
    try {
        const { id } = req.params;
        const exercise = await db.Exercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
        }

        // Basic authorization check
        if (exercise.createdBy !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Không có quyền xóa bài tập này' });
        }

        // Add logic to delete related UserProgress if necessary
        // await db.UserProgress.destroy({ where: { exerciseId: id } });

        await exercise.destroy();

        res.status(200).json({ success: true, message: 'Xóa bài tập thành công' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa bài tập' });
    }
};

// GET questions by exercise ID
exerciseController.getQuestionsByExerciseId = async (req, res) => {
    try {
        const { id } = req.params;
        const questions = await db.Question.findAll({
            where: { exerciseId: id },
            order: [['orderIndex', 'ASC']],
            paranoid: false // Include soft deleted records if needed
        });

        res.status(200).json({
            success: true,
            data: {
                questions
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách câu hỏi' });
    }
};

// ADD question to exercise
exerciseController.addQuestion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { id } = req.params; // exerciseId
        const exercise = await db.Exercise.findByPk(id);

        if (!exercise) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập' });
        }

        // Get max orderIndex
        const maxOrderQuestion = await db.Question.findOne({
            where: { exerciseId: id },
            order: [['orderIndex', 'DESC']]
        });
        const nextOrder = maxOrderQuestion ? maxOrderQuestion.orderIndex + 1 : 0;

        const questionData = {
            ...req.body,
            exerciseId: id,
            orderIndex: nextOrder
        };

        const newQuestion = await db.Question.create(questionData);

        res.status(201).json({
            success: true,
            message: 'Thêm câu hỏi thành công',
            data: newQuestion
        });
    } catch (error) {
        console.error('Error adding question:', error);
        res.status(500).json({ 
            success: false, 
            message: error.name === 'SequelizeValidationError' 
                ? error.message 
                : 'Lỗi server khi thêm câu hỏi'
        });
    }
};

// UPDATE question
exerciseController.updateQuestion = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { id, questionId } = req.params;
        const question = await db.Question.findOne({
            where: {
                id: questionId,
                exerciseId: id
            }
        });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }

        const updatedQuestion = await question.update(req.body);

        res.status(200).json({
            success: true,
            message: 'Cập nhật câu hỏi thành công',
            data: updatedQuestion
        });
    } catch (error) {
        console.error('Error updating question:', error);
        res.status(500).json({ 
            success: false, 
            message: error.name === 'SequelizeValidationError' 
                ? error.message 
                : 'Lỗi server khi cập nhật câu hỏi'
        });
    }
};

// DELETE question
exerciseController.deleteQuestion = async (req, res) => {
    try {
        const { id, questionId } = req.params;
        const question = await db.Question.findOne({
            where: {
                id: questionId,
                exerciseId: id
            }
        });

        if (!question) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy câu hỏi' });
        }

        await question.destroy();

        res.status(200).json({
            success: true,
            message: 'Xóa câu hỏi thành công'
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi xóa câu hỏi' });
    }
};

// REORDER questions
exerciseController.reorderQuestions = async (req, res) => {
    try {
        const { id } = req.params;
        const { questionOrder } = req.body;

        if (!Array.isArray(questionOrder)) {
            return res.status(400).json({ 
                success: false, 
                message: 'questionOrder phải là một mảng các ID câu hỏi' 
            });
        }

        // Validate all questions exist and belong to this exercise
        const questions = await db.Question.findAll({
            where: {
                id: questionOrder,
                exerciseId: id
            }
        });

        if (questions.length !== questionOrder.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Một số câu hỏi không tồn tại hoặc không thuộc bài tập này' 
            });
        }

        // Update orderIndex for each question
        await Promise.all(questionOrder.map((questionId, index) => {
            return db.Question.update(
                { orderIndex: index },
                { where: { id: questionId, exerciseId: id } }
            );
        }));

        res.status(200).json({
            success: true,
            message: 'Cập nhật thứ tự câu hỏi thành công'
        });
    } catch (error) {
        console.error('Error reordering questions:', error);
        res.status(500).json({ success: false, message: 'Lỗi server khi sắp xếp lại câu hỏi' });
    }
};

module.exports = exerciseController; 