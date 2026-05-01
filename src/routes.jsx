// src/routes.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import QuizPage from './pages/QuizPage';
import ResultPage from './pages/ResultPage';
import TeacherPanel from './pages/TeacherPanel';
import ProfilePage from './pages/ProfilePage';

// Simple protected route wrapper
const ProtectedRoute = ({ user, allowedRole, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect students trying to access teacher panel
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = ({ user, setUser }) => {
  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'teacher' ? '/teacher' : '/dashboard'} replace /> 
             : <LoginPage setUser={setUser} />
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute user={user} allowedRole="student">
          <Dashboard user={user} />
        </ProtectedRoute>
      } />

      <Route path="/quiz/:quizId" element={
        <ProtectedRoute user={user} allowedRole="student">
          <QuizPage user={user} />
        </ProtectedRoute>
      } />

      <Route path="/result" element={
        <ProtectedRoute user={user} allowedRole="student">
          <ResultPage />
        </ProtectedRoute>
      } />

      <Route path="/teacher" element={
        <ProtectedRoute user={user} allowedRole="teacher">
          <TeacherPanel user={user} />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute user={user}>
          <ProfilePage user={user} />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={user ? (user.role === 'teacher' ? '/teacher' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
};

export default AppRoutes;
