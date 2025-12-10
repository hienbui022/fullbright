const { ForumPost, Comment, User, sequelize } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get all forum posts
 * @route GET /api/community/posts
 * @access Public
 */
const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, resolved } = req.query;
    const offset = (page - 1) * limit;
    
    // Build query options
    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    };
    
    // Build where clause
    const whereClause = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (resolved !== undefined) {
      whereClause.isResolved = resolved === 'true';
    }
    
    if (Object.keys(whereClause).length > 0) {
      options.where = whereClause;
    }
    
    // Get posts
    const posts = await ForumPost.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(posts.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          total: posts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get forum post by ID
 * @route GET /api/community/posts/:id
 * @access Public
 */
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get post with author and comments
    const post = await ForumPost.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        },
        {
          model: Comment,
          as: 'comments',
          where: { parentId: null },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profileImage']
            },
            {
              model: Comment,
              as: 'replies',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username', 'fullName', 'profileImage']
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Increment view count
    post.viewCount += 1;
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Create forum post
 * @route POST /api/community/posts
 * @access Private
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    
    // Create post
    const post = await ForumPost.create({
      title,
      content,
      category,
      tags,
      authorId: req.user.id
    });
    
    // Get post with author
    const postWithAuthor = await ForumPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    res.status(201).json({
      success: true,
      data: postWithAuthor
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update forum post
 * @route PUT /api/community/posts/:id
 * @access Private
 */
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    
    // Find post
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the author or admin
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    // Update post
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.updatedAt = new Date();
    
    await post.save();
    
    // Get updated post with author
    const updatedPost = await ForumPost.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete forum post
 * @route DELETE /api/community/posts/:id
 * @access Private
 */
const deletePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find post
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the author or admin
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    // Delete post
    await post.destroy({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Search forum posts
 * @route GET /api/community/posts/search
 * @access Public
 */
const searchPosts = async (req, res) => {
  try {
    const { query, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (query) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${query}%` } },
        { content: { [Op.like]: `%${query}%` } }
      ];
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    // Get posts
    const posts = await ForumPost.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(posts.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          total: posts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Search posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get posts by category
 * @route GET /api/community/posts/category/:category
 * @access Public
 */
const getPostsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Get posts by category
    const posts = await ForumPost.findAndCountAll({
      where: { category },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(posts.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        posts: posts.rows,
        pagination: {
          total: posts.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get posts by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Like forum post
 * @route POST /api/community/posts/:id/like
 * @access Private
 */
const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find post
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Increment like count
    post.likeCount += 1;
    await post.save();
    
    res.status(200).json({
      success: true,
      data: {
        likeCount: post.likeCount
      }
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Mark post as resolved
 * @route PUT /api/community/posts/:id/resolve
 * @access Private
 */
const resolvePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find post
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check if user is the author or admin
    if (post.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to resolve this post'
      });
    }
    
    // Mark post as resolved
    post.isResolved = true;
    post.resolvedAt = new Date();
    await post.save();
    
    res.status(200).json({
      success: true,
      message: 'Post marked as resolved',
      data: {
        isResolved: post.isResolved,
        resolvedAt: post.resolvedAt
      }
    });
  } catch (error) {
    console.error('Resolve post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Get post comments
 * @route GET /api/community/posts/:id/comments
 * @access Public
 */
const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // Check if post exists
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Get comments
    const comments = await Comment.findAndCountAll({
      where: {
        forumPostId: id,
        parentId: null // Only get top-level comments
      },
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        },
        {
          model: Comment,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'fullName', 'profileImage']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Calculate total pages
    const totalPages = Math.ceil(comments.count / limit);
    
    res.status(200).json({
      success: true,
      data: {
        comments: comments.rows,
        pagination: {
          total: comments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Add comment to post
 * @route POST /api/community/posts/:id/comments
 * @access Private
 */
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, parentId } = req.body;
    
    // Check if post exists
    const post = await ForumPost.findByPk(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // If parentId is provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findByPk(parentId);
      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: 'Parent comment not found'
        });
      }
    }
    
    // Create comment
    const comment = await Comment.create({
      content,
      userId: req.user.id,
      forumPostId: id,
      parentId: parentId || null
    });
    
    // Get comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    // Increment comment count on post
    post.commentCount += 1;
    await post.save();
    
    res.status(201).json({
      success: true,
      data: commentWithUser
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Update comment
 * @route PUT /api/community/comments/:id
 * @access Private
 */
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the author or admin
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }
    
    // Update comment
    comment.content = content;
    comment.updatedAt = new Date();
    await comment.save();
    
    // Get updated comment with user info
    const updatedComment = await Comment.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'fullName', 'profileImage']
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Delete comment
 * @route DELETE /api/community/comments/:id
 * @access Private
 */
const deleteComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the author or admin
    if (comment.userId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }
    
    // Get post to update comment count
    const post = await ForumPost.findByPk(comment.forumPostId);
    
    // Delete comment
    await comment.destroy({ transaction });
    
    // Update comment count on post
    if (post) {
      post.commentCount = Math.max(0, post.commentCount - 1);
      await post.save({ transaction });
    }
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Like comment
 * @route POST /api/community/comments/:id/like
 * @access Private
 */
const likeComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find comment
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Increment like count
    comment.likeCount += 1;
    await comment.save();
    
    res.status(200).json({
      success: true,
      data: {
        likeCount: comment.likeCount
      }
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

/**
 * Accept comment as answer
 * @route PUT /api/community/comments/:id/accept
 * @access Private
 */
const acceptComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    
    // Find comment
    const comment = await Comment.findByPk(id, {
      include: [
        {
          model: ForumPost,
          as: 'forumPost'
        }
      ]
    });
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user is the post author or admin
    if (comment.forumPost.authorId !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to accept this comment'
      });
    }
    
    // Mark comment as accepted
    comment.isAccepted = true;
    await comment.save({ transaction });
    
    // Mark post as resolved
    comment.forumPost.isResolved = true;
    comment.forumPost.resolvedAt = new Date();
    await comment.forumPost.save({ transaction });
    
    // Commit transaction
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Comment accepted as answer',
      data: {
        isAccepted: comment.isAccepted,
        postResolved: comment.forumPost.isResolved
      }
    });
  } catch (error) {
    // Rollback transaction
    await transaction.rollback();
    
    console.error('Accept comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getPostsByCategory,
  likePost,
  resolvePost,
  getPostComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  acceptComment
}; 