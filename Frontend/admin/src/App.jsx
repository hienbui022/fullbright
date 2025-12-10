import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './utils/PrivateRoute';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Courses from './pages/Courses';
import Lessons from './pages/Lessons';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import News from './pages/News';
import LearningPaths from './pages/LearningPaths';
import Exercises from './pages/Exercises';
import ForumStats from './pages/ForumStats';
import FlashcardsPage from './pages/FlashcardsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<Users />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/learning-paths" element={<LearningPaths />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/news" element={<News />} />
              <Route path="/forum-stats" element={<ForumStats />} />
            </Route>
          </Route>
          
          {/* Redirect to dashboard if logged in, otherwise to login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* 404 Page */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="text-xl text-gray-600 mt-4">Trang không tồn tại</p>
                <a href="/dashboard" className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200">
                  Quay lại Dashboard
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
