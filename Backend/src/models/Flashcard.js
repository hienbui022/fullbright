const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Flashcard = sequelize.define('Flashcard', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    term: {
      type: DataTypes.STRING,
      allowNull: false
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    example: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    audioUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    difficulty: {
      type: DataTypes.ENUM('easy', 'medium', 'hard'),
      allowNull: true
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
    tableName: 'Flashcards',
    timestamps: true
  });

  Flashcard.associate = (models) => {
    // Flashcard belongs to Course
    Flashcard.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course'
    });

    // Flashcard belongs to Lesson
    Flashcard.belongsTo(models.Lesson, {
      foreignKey: 'lessonId',
      as: 'lesson'
    });

    // Flashcard belongs to User (creator)
    Flashcard.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // Flashcard has many UserFlashcardProgress
    if (models.UserFlashcardProgress) {
      Flashcard.hasMany(models.UserFlashcardProgress, {
        foreignKey: 'flashcardId',
        as: 'userProgress'
      });
    }
  };

  return Flashcard;
};