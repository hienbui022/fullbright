const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    forumPostId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'forum_posts',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'lessons',
        key: 'id'
      }
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    likeCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    isAccepted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    validate: {
      atLeastOneParent() {
        if (!this.forumPostId && !this.lessonId && !this.parentId) {
          throw new Error('Comment must be associated with a forum post, lesson, or parent comment');
        }
      }
    }
  });

  Comment.associate = (models) => {
    // A Comment belongs to a User
    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // A Comment can belong to a Forum Post
    Comment.belongsTo(models.ForumPost, {
      foreignKey: 'forumPostId',
      as: 'forumPost'
    });

    // A Comment can belong to a Lesson
    Comment.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // A Comment can belong to another Comment (parent)
    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent'
    });

    // A Comment can have many replies (child comments)
    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies'
    });
  };

  return Comment;
}; 