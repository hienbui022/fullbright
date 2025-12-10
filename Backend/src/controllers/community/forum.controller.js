const db = require('../../models');
const { Op, fn, col } = require('sequelize');
const ForumPost = db.ForumPost;
const User = db.User;
const Comment = db.Comment;

// Create a new forum post
exports.createPost = async (req, res) => {
    try {
        const { title, content, category, tags } = req.body;
        const post = await ForumPost.create({
            title,
            content,
            category,
            tags: tags || [],
            authorId: req.user.id
        });

        const postWithAuthor = await ForumPost.findByPk(post.id, {
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'profileImage']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Forum post created successfully',
            data: postWithAuthor
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating forum post',
            error: error.message
        });
    }
};

// Get all forum posts with pagination and filters
exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, tag, search, sort = 'newest' } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (tag) {
            whereClause.tags = { [Op.like]: `%${tag}%` };
        }
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ];
        }

        // Build order clause
        let order = [['createdAt', 'DESC']]; // default newest first
        if (sort === 'popular') {
            order = [['viewCount', 'DESC']];
        } else if (sort === 'mostCommented') {
            order = [['commentCount', 'DESC']];
        }

        const { count, rows } = await ForumPost.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'author',
                attributes: ['id', 'username', 'fullName', 'profileImage']
            }],
            order,
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            data: {
                posts: rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalPosts: count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching forum posts',
            error: error.message
        });
    }
};

// Get a single forum post by ID
exports.getPostById = async (req, res) => {
    try {
        // Kiểm tra ID có hợp lệ không
        const postId = req.params.id;
        if (!postId) {
            return res.status(400).json({
                success: false,
                message: 'Post ID is required'
            });
        }

        // Tìm bài viết với các quan hệ liên quan
        const post = await ForumPost.findOne({
            where: { id: postId },
            include: [
                {
                    model: User,
                    as: 'author',
                    attributes: ['id', 'username', 'fullName', 'email', 'profileImage']
                },
                {
                    model: Comment,
                    as: 'comments',
                    separate: true, // Tải comments riêng để tránh vấn đề với nested includes
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'username', 'fullName', 'email', 'profileImage']
                        }
                    ],
                    where: { parentId: null }, // Chỉ lấy comments gốc
                    order: [['createdAt', 'DESC']] // Sắp xếp theo thời gian tạo
                }
            ]
        });

        // Kiểm tra nếu không tìm thấy bài viết
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }

        // Tăng số lượt xem
        await post.increment('viewCount');
        await post.reload(); // Tải lại dữ liệu sau khi cập nhật viewCount

        // Format lại dữ liệu trước khi trả về
        const formattedPost = {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            tags: post.tags || [],
            isResolved: post.isResolved || false,
            viewCount: post.viewCount || 0,
            likeCount: post.likeCount || 0,
            commentCount: post.commentCount || 0,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author,
            comments: post.comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                likeCount: comment.likeCount || 0,
                isAcceptedAnswer: comment.isAcceptedAnswer || false,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt,
                user: comment.user
            }))
        };

        // Trả về kết quả
        res.json({
            success: true,
            data: formattedPost
        });
    } catch (error) {
        console.error('Error in getPostById:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching forum post',
            error: error.message
        });
    }
};

// Update a forum post
exports.updatePost = async (req, res) => {
    try {
        const post = await ForumPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }

        // Check if user is the author
        if (post.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this post'
            });
        }

        const { title, content, category, tags } = req.body;
        await post.update({
            title,
            content,
            category,
            tags: tags || []
        });

        res.json({
            success: true,
            message: 'Forum post updated successfully',
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating forum post',
            error: error.message
        });
    }
};

// Delete a forum post
exports.deletePost = async (req, res) => {
    try {
        const post = await ForumPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }

        // Check if user is the author or admin
        if (post.authorId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this post'
            });
        }

        await post.destroy();

        res.json({
            success: true,
            message: 'Forum post deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting forum post',
            error: error.message
        });
    }
};

// Mark post as resolved
exports.markAsResolved = async (req, res) => {
    try {
        const post = await ForumPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }

        // Check if user is the author
        if (post.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to mark this post as resolved'
            });
        }

        await post.update({
            isResolved: true,
            resolvedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Forum post marked as resolved',
            data: post
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error marking forum post as resolved',
            error: error.message
        });
    }
};

// Like/Unlike a post
exports.toggleLike = async (req, res) => {
    try {
        const post = await ForumPost.findByPk(req.params.id);
        
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Forum post not found'
            });
        }

        // In a real application, you would use a separate table to track likes
        // This is a simplified version
        await post.increment('likeCount');

        res.json({
            success: true,
            message: 'Forum post liked successfully',
            data: { likeCount: post.likeCount + 1 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error liking forum post',
            error: error.message
        });
    }
};

// Get Forum Statistics
exports.getForumStats = async (req, res) => {
    try {
        // Total posts
        const totalPosts = await ForumPost.count();

        // Total comments (can be optimized if Comment model has postId)
        // Assuming Comment model has postId
        const totalComments = await Comment.count(); 

        // Posts per category
        const postsPerCategory = await ForumPost.findAll({
            attributes: [
                'category',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['category']
        });

        // Active users (simplified: count unique authors)
        const activeAuthors = await ForumPost.count({
            distinct: true,
            col: 'authorId'
        });

        // Most viewed posts (top 5)
        const mostViewedPosts = await ForumPost.findAll({
            order: [['viewCount', 'DESC']],
            limit: 5,
            attributes: ['id', 'title', 'viewCount'],
            include: [{ model: User, as: 'author', attributes: ['username'] }]
        });

        // Most commented posts (top 5)
        const mostCommentedPosts = await ForumPost.findAll({
            order: [['commentCount', 'DESC']],
            limit: 5,
            attributes: ['id', 'title', 'commentCount'],
            include: [{ model: User, as: 'author', attributes: ['username'] }]
        });
        
        // Resolved vs Unresolved posts
        const resolutionStats = await ForumPost.findAll({
             attributes: [
                'isResolved',
                [fn('COUNT', col('id')), 'count']
            ],
            group: ['isResolved']
        });
        const resolvedCount = resolutionStats.find(s => s.get('isResolved') === true)?.get('count') || 0;
        const unresolvedCount = resolutionStats.find(s => s.get('isResolved') === false)?.get('count') || 0;

        res.json({
            success: true,
            data: {
                totalPosts,
                totalComments,
                postsPerCategory: postsPerCategory.map(c => ({ category: c.get('category'), count: c.get('count') })),
                activeAuthors,
                mostViewedPosts,
                mostCommentedPosts,
                resolutionStats: {
                    resolved: resolvedCount,
                    unresolved: unresolvedCount
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching forum statistics',
            error: error.message
        });
    }
}; 