'use client'

import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ReadingNews from './pages/ReadingNews';
import NewsDetail from './pages/NewsDetail';
import CourseDetail from './pages/CourseDetail';
import Courses from './pages/Courses';
import MyCourses from './pages/MyCourses';
import Profile from './pages/Profile';
import LearnPage from './pages/Learn/LearnPage';
import Dictionary from './pages/Dictionary';

import { AuthProvider } from './context/AuthContext';
import ChangePassword from './pages/ChangePassword';
import Introduction from './pages/Introduction';
import ResetPassword from './pages/ResetPassword';
import ForumList from './pages/Forum/ForumList';
import ForumDetail from './pages/Forum/ForumDetail';
import CreatePost from './pages/Forum/CreatePost';

function App() {
    return (
            <AuthProvider>
                <Router>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={
                            <ProtectedRoute>
                                <Login />
                            </ProtectedRoute>
                        } />
                        <Route path="/register" element={<Register />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/dictionary" element={<Dictionary />} />
                        <Route path="/change-password" element={
                            <PrivateRoute>
                                <ChangePassword />
                            </PrivateRoute>
                        } />                    
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/introduction" element={<Introduction />} />
                        <Route path="/news" element={<ReadingNews />} />
                        <Route path="/news/:id" element={<NewsDetail />} />
                        <Route path="/courses" element={<Courses />} />
                        <Route path="/courses/:id" element={<CourseDetail />} />
                        <Route path="/learn/:lessonId" element={
                            <PrivateRoute>
                                <LearnPage />
                            </PrivateRoute>
                        } />
                        <Route path="/my-courses" element={
                            <PrivateRoute>
                                <MyCourses />
                            </PrivateRoute>
                        } />
                        <Route path="/profile" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />
                        <Route path="/forum" element={<ForumList />} />
                        <Route path="/forum/:id" element={<ForumDetail />} />
                        <Route path="/forum/create" element={
                            <PrivateRoute>
                                <CreatePost />
                            </PrivateRoute>
                        } />
                    </Routes>
                    <Footer />
                </Router>
            </AuthProvider>
    );
}

export default App;