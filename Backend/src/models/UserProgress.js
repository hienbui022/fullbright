const { DataTypes, Op } = require('sequelize');

module.exports = (sequelize) => {
  const UserProgress = sequelize.define('UserProgress', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    courseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Courses',
        key: 'id'
      }
    },
    lessonId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Lessons',
        key: 'id'
      }
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    },
    progress: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Progress percentage (0-100)'
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Score for exercises or assessments'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    timeSpent: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Time spent in minutes'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'user_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'courseId', 'lessonId', 'exerciseId'],
        where: {
          courseId: { [Op.ne]: null },
          lessonId: { [Op.ne]: null },
          exerciseId: { [Op.ne]: null }
        }
      }
    ]
  });

  UserProgress.associate = (models) => {
    // UserProgress belongs to a User
    UserProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // UserProgress can belong to a Course
    UserProgress.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // UserProgress can belong to a Lesson
    UserProgress.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // UserProgress can belong to an Exercise
    UserProgress.belongsTo(models.Exercise, {
      foreignKey: 'exerciseId',
      as: 'exercise'
    });
  };

  return UserProgress;
}; 