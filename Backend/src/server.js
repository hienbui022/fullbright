const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { Sequelize } = require('sequelize');
const dbConfig = require('./config/database');
const db = require('./models');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const lessonRoutes = require('./routes/lesson.routes');
const learningPathRoutes = require('./routes/learningPath.routes');
const learningToolRoutes = require('./routes/learningTool.routes');
const userRoutes = require('./routes/user.routes');
const newsRoutes = require('./routes/news.routes');
const communityRoutes = require('./routes/community.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
const flashcardRoutes = require('./routes/flashcard.routes');
const exerciseRoutes = require('./routes/exercise.routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // HTTP request logger

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/learning-tools', learningToolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/exercises', exerciseRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to English Fullbright API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Test database connection function
const testDatabaseConnection = async () => {
  try {
    const sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        logging: dbConfig.logging,
        pool: dbConfig.pool
      }
    );
    
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    // Test database connection
    await testDatabaseConnection();
    
    // Sync models with database
    // Set force to true to drop and recreate tables (use with caution in production)
    const force = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
    await db.syncModels(force);
    
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
});

module.exports = app; 