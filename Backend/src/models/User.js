const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 30]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user'
    },
    profileImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  // Instance method to compare password
  User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  };

  User.associate = (models) => {
    // User has many Courses
    User.hasMany(models.Course, {
      foreignKey: 'createdBy',
      as: 'courses'
    });

    // User has many Lessons
    User.hasMany(models.Lesson, {
      foreignKey: 'createdBy',
      as: 'lessons'
    });

    // User has many LearningPaths
    User.hasMany(models.LearningPath, {
      foreignKey: 'createdBy',
      as: 'learningPaths'
    });

    // User has many News
    User.hasMany(models.News, {
      foreignKey: 'createdBy',
      as: 'news'
    });

    // User has many ForumPosts
    User.hasMany(models.ForumPost, {
      foreignKey: 'authorId',
      as: 'forumPosts'
    });

    // User has many Comments
    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments'
    });

    // User has many UserProgress records
    User.hasMany(models.UserProgress, {
      foreignKey: 'userId',
      as: 'progress'
    });

    // User has many LearningTools
    User.hasMany(models.LearningTool, {
      foreignKey: 'createdBy',
      as: 'learningTools'
    });

    // User has many UserToolProgress records
    User.hasMany(models.UserToolProgress, {
      foreignKey: 'userId',
      as: 'toolProgress'
    });
  };

  return User;
}; 