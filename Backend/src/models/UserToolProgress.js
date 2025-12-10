const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserToolProgress = sequelize.define('UserToolProgress', {
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
    toolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'learning_tools',
        key: 'id'
      }
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    lastAccessedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Score achieved in the tool (if applicable)'
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'JSON data with user progress details'
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
    tableName: 'user_tool_progress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'toolId']
      }
    ]
  });

  UserToolProgress.associate = (models) => {
    // UserToolProgress belongs to a User
    UserToolProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // UserToolProgress belongs to a LearningTool
    UserToolProgress.belongsTo(models.LearningTool, {
      foreignKey: 'toolId',
      as: 'tool'
    });
  };

  return UserToolProgress;
}; 