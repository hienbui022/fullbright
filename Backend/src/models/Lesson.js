const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Lesson = sequelize.define('Lesson', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'courses',
        key: 'id'
      }
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    contentType: {
      type: DataTypes.ENUM('video', 'audio', 'text', 'image', 'mixed'),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Text content or JSON with content details'
    },
    videoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in minutes'
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
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
    tableName: 'lessons',
    timestamps: true
  });

  Lesson.associate = (models) => {
    // Lesson belongs to a Course
    Lesson.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Lesson belongs to a User (creator)
    Lesson.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // Lesson has many Comments
    Lesson.hasMany(models.Comment, {
      foreignKey: 'lessonId',
      as: 'comments'
    });

    // Lesson has many UserProgress records
    Lesson.hasMany(models.UserProgress, {
      foreignKey: 'lessonId',
      as: 'userProgress'
    });
  };

  return Lesson;
}; 