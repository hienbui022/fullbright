const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserFlashcardProgress = sequelize.define('UserFlashcardProgress', {
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
    flashcardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Flashcards',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('new', 'learning', 'reviewing', 'mastered'),
      defaultValue: 'new',
      allowNull: false
    },
    correctCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    incorrectCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    lastReviewedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextReviewAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    easeFactor: {
      type: DataTypes.FLOAT,
      defaultValue: 2.5,  // Mặc định cho thuật toán spaced repetition
      allowNull: false
    },
    interval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,  // Khoảng thời gian giữa các lần ôn tập (ngày)
      allowNull: false
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
    tableName: 'UserFlashcardProgress',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId', 'flashcardId']
      }
    ]
  });

  UserFlashcardProgress.associate = (models) => {
    // UserFlashcardProgress belongs to User
    UserFlashcardProgress.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // UserFlashcardProgress belongs to Flashcard
    UserFlashcardProgress.belongsTo(models.Flashcard, {
      foreignKey: 'flashcardId',
      as: 'flashcard'
    });
  };

  return UserFlashcardProgress;
}; 