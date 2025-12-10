const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Course = sequelize.define('Course', {
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
    level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      allowNull: false
    },
    skills: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Array of skills: listening, speaking, reading, writing, grammar, vocabulary, pronunciation, communication',
      get() {
        const rawValue = this.getDataValue('skills');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('skills', JSON.stringify(value));
      }
    },
    topics: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Array of topics: travel, business, academic, daily_communication',
      get() {
        const rawValue = this.getDataValue('topics');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('topics', JSON.stringify(value));
      }
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Duration in minutes'
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true
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
    tableName: 'courses',
    timestamps: true
  });

  Course.associate = (models) => {
    // Course belongs to a User (creator)
    Course.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'creator'
    });

    // Course has many Lessons
    Course.hasMany(models.Lesson, {
      foreignKey: 'courseId',
      as: 'lessons'
    });

    // Course has many UserProgress records
    Course.hasMany(models.UserProgress, {
      foreignKey: 'courseId',
      as: 'userProgress'
    });
  };

  return Course;
}; 