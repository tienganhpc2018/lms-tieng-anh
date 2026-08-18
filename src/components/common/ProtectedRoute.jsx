import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, teacherOnly = false }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Đang kiểm tra quyền truy cập..." />;
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (teacherOnly && profile?.role !== 'teacher') {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-amber-50 border border-amber-200 rounded-xl">
        <h2 className="text-xl font-bold text-amber-800 mb-2">Quyền truy cập bị giới hạn</h2>
        <p className="text-sm text-amber-700 mb-4">
          Tính năng này chỉ dành cho Giáo viên quản trị khóa học.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
        >
          Trở về Trang chủ Dashboard
        </a>
      </div>
    );
  }

  return children;
}
