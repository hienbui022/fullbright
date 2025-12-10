const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Exercise = sequelize.define('Exercise', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'multiple_choice',
      validate: {
        isIn: [['multiple_choice']] // Chỉ cho phép loại trắc nghiệm
      }
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'easy',
      validate: {
        isIn: [['easy', 'medium', 'hard']]
      }
    },
    timeLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    passingScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
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
    }
  }, {
    tableName: 'Exercises',
    timestamps: true,
    paranoid: true, // Soft delete
  });

  Exercise.associate = (models) => {
    Exercise.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    Exercise.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    Exercise.hasMany(models.Question, {
      foreignKey: 'exerciseId',
      as: 'questions',
      onDelete: 'CASCADE'
    });

    Exercise.hasMany(models.UserProgress, {
      foreignKey: 'exerciseId',
      as: 'userProgress'
    });
  };

  return Exercise;
}; 