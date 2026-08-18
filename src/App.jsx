import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CourseView from './pages/CourseView';
import AssignmentView from './pages/AssignmentView';
import TeacherAnalytics from './pages/TeacherAnalytics';
import AiBuilderView from './pages/AiBuilderView';
import QuestionBankView from './pages/QuestionBankView';
import ErrorBoundary from './components/common/ErrorBoundary';
import MockExamView from './pages/MockExamView';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
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
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
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
                path="/ai-builder"
                element={
                  <ProtectedRoute>
                    <AiBuilderView />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/question-bank"
                element={
                  <ProtectedRoute>
                    <ErrorBoundary>
                      <QuestionBankView />
                    </ErrorBoundary>
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
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <TeacherAnalytics />
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
