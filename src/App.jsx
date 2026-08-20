import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import AssignmentView from './pages/AssignmentView';
import AssignmentResultView from './pages/AssignmentResultView';
import TeacherAnalytics from './pages/TeacherAnalytics';
import UserProfileView from './pages/UserProfileView';
import WhiteboardView from './pages/WhiteboardView';
import MockExamView from './pages/MockExamView';
import CommunityModuleView from './pages/CommunityModuleView';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col select-none">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/auth" element={<Auth />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/course/:id"
                element={
                  <ProtectedRoute>
                    <CourseView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assignment/:id"
                element={
                  <ProtectedRoute>
                    <AssignmentView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/assignment/:id/result"
                element={
                  <ProtectedRoute>
                    <AssignmentResultView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <UserProfileView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile/:userId"
                element={
                  <ProtectedRoute>
                    <UserProfileView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/whiteboard"
                element={
                  <ProtectedRoute>
                    <WhiteboardView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <TeacherAnalytics />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/mock-exam"
                element={
                  <ProtectedRoute>
                    <MockExamView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/community"
                element={
                  <ProtectedRoute>
                    <CommunityModuleView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/community/:courseId"
                element={
                  <ProtectedRoute>
                    <CommunityModuleView />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
