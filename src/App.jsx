import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { ClassList } from './pages/classes/ClassList';
import { ClassDetail } from './pages/classes/ClassDetail';
import { MaterialHub } from './pages/materials/MaterialHub';
import { MaterialCreate } from './pages/materials/MaterialCreate';
import { MaterialDetail } from './pages/materials/MaterialDetail';
import { CurriculumBank } from './pages/curriculum/CurriculumBank';
import { AITestGenerator } from './pages/curriculum/AITestGenerator';
import { VirtualExamRoom } from './pages/exams/VirtualExamRoom';
import { ExamList } from './pages/exams/ExamList';
import { AIWritingGrader } from './pages/ai/AIWritingGrader';
import { AISpeakingGrader } from './pages/ai/AISpeakingGrader';
import { TeacherAnalytics } from './pages/analytics/TeacherAnalytics';
import { AdminUserManagement } from './pages/admin/AdminUserManagement';

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Authenticated Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/classes" element={<ClassList />} />
                <Route path="/classes/:id" element={<ClassDetail />} />
                <Route path="/materials" element={<MaterialHub />} />
                <Route path="/materials/create" element={<MaterialCreate />} />
                <Route path="/materials/:id" element={<MaterialDetail />} />
                <Route path="/curriculum" element={<CurriculumBank />} />
                <Route path="/ai-test-gen" element={<AITestGenerator />} />
                <Route path="/exams" element={<ExamList />} />
                <Route path="/exams/:id" element={<VirtualExamRoom />} />
                <Route path="/ai-writing" element={<AIWritingGrader />} />
                <Route path="/ai-speaking" element={<AISpeakingGrader />} />
                <Route path="/analytics" element={<TeacherAnalytics />} />
              </Route>

              {/* Admin Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminUserManagement />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
