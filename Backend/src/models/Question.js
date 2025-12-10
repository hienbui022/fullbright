const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Question = sequelize.define('Question', {
    id: {
      type: DataTypes.STRING(36),
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'multiple_choice',
      validate: {
        isIn: [['multiple_choice']] // Chỉ cho phép loại trắc nghiệm
      }
    },
    options: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
      validate: {
        isValidOptions(value) {
          if (!Array.isArray(value)) {
            throw new Error('Options phải là một mảng');
          }
          if (value.length < 2) {
            throw new Error('Phải có ít nhất 2 lựa chọn');
          }
          // Kiểm tra cấu trúc của mỗi option
          value.forEach(option => {
            if (!option.text || typeof option.isCorrect !== 'boolean') {
              throw new Error('Mỗi lựa chọn phải có text và isCorrect');
            }
          });
          // Kiểm tra phải có ít nhất 1 đáp án đúng
          const hasCorrectAnswer = value.some(option => option.isCorrect);
          if (!hasCorrectAnswer) {
            throw new Error('Phải có ít nhất một đáp án đúng');
          }
        }
      }
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    },
    explanation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    orderIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    exerciseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Exercises',
        key: 'id'
      }
    }
  }, {
    tableName: 'Questions',
    timestamps: true,
    paranoid: true, // Soft delete
  });

  Question.associate = (models) => {
    Question.belongsTo(models.Exercise, {
      foreignKey: 'exerciseId',
      as: 'exercise',
      onDelete: 'CASCADE'
    });
  };

  return Question;
}; 