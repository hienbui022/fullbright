const db = require('../../models');
const Comment = db.Comment;
const User = db.User;

// Create a new comment
exports.createComment = async (req, res) => {
    try {
        const { content, forumPostId, lessonId, parentId } = req.body;
        
        // Create the comment
        const comment = await Comment.create({
            content,
            userId: req.user.id,
            forumPostId,
            lessonId,
            parentId
        });

        // Fetch the comment with user info
        const commentWithUser = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'profileImage']
            }]
        });

        // If this is a forum post comment, increment the post's comment count
        if (forumPostId) {
            await db.ForumPost.increment('commentCount', {
                where: { id: forumPostId }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Comment created successfully',
            data: commentWithUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating comment',
            error: error.message
        });
    }
};

// Get comments for a forum post or lesson
exports.getComments = async (req, res) => {
    try {
        const { forumPostId, lessonId, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (forumPostId) {
            whereClause.forumPostId = forumPostId;
        }
        if (lessonId) {
            whereClause.lessonId = lessonId;
        }
        whereClause.parentId = null; // Only get top-level comments

        const { count, rows } = await Comment.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'username', 'fullName', 'profileImage']
                },
                {
                    model: Comment,
                    as: 'replies',
                    include: [{
                        model: User,
                        as: 'user',
                        attributes: ['id', 'username', 'fullName', 'profileImage']
                    }]
                }
            ],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.json({
            success: true,
            data: {
                comments: rows,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalComments: count
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching comments',
            error: error.message
        });
    }
};

// Update a comment
exports.updateComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is the author
        if (comment.userId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        const { content } = req.body;
        await comment.update({ content });

        const updatedComment = await Comment.findByPk(comment.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'username', 'fullName', 'profileImage']
            }]
        });

        res.json({
            success: true,
            message: 'Comment updated successfully',
            data: updatedComment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating comment',
            error: error.message
        });
    }
};

// Delete a comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is the author or admin
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // If this is a forum post comment, decrement the post's comment count
        if (comment.forumPostId) {
            await db.ForumPost.decrement('commentCount', {
                where: { id: comment.forumPostId }
            });
        }

        await comment.destroy();

        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting comment',
            error: error.message
        });
    }
};

// Like/Unlike a comment
exports.toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // In a real application, you would use a separate table to track likes
        // This is a simplified version
        await comment.increment('likeCount');

        res.json({
            success: true,
            message: 'Comment liked successfully',
            data: { likeCount: comment.likeCount + 1 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error liking comment',
            error: error.message
        });
    }
};

// Mark comment as accepted answer (for forum posts)
exports.acceptAnswer = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        if (!comment.forumPostId) {
            return res.status(400).json({
                success: false,
                message: 'This comment is not associated with a forum post'
            });
        }

        // Check if the user is the author of the forum post
        const forumPost = await db.ForumPost.findByPk(comment.forumPostId);
        if (forumPost.authorId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Only the post author can mark an answer as accepted'
            });
        }

        await comment.update({ isAccepted: true });
        await forumPost.update({ 
            isResolved: true,
            resolvedAt: new Date()
        });

        res.json({
            success: true,
            message: 'Comment marked as accepted answer',
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error accepting answer',
            error: error.message
        });
    }
}; 