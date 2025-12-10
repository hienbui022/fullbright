const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LearningTool = sequelize.define('LearningTool', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Type of tool: quiz, flashcard, game, exercise, etc.'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Category: vocabulary, grammar, listening, speaking, etc.'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON content of the tool (questions, answers, etc.)'
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'intermediate'
    },
    estimatedTime: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated time to complete in minutes'
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isInteractive: {
      type: DataTypes.BOOLEAN,
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
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'learning_tools',
    timestamps: true
  });

  LearningTool.associate = (models) => {
    // A Learning Tool belongs to a User (creator)
    LearningTool.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // A Learning Tool has many UserToolProgress records
    LearningTool.hasMany(models.UserToolProgress, {
      foreignKey: 'toolId',
      as: 'progress'
    });
  };

  return LearningTool;
}; 