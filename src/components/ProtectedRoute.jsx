import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner label="Đang xác thực thông tin tài khoản..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-200 mb-2">Quyền Truy Cập Bị Hạn Chế</h2>
        <p className="text-sm text-slate-400 max-w-md">
          Tài khoản của bạn ({role}) không có quyền truy cập vào trang này. Vui lòng liên hệ Giáo viên hoặc Quản trị viên.
        </p>
      </div>
    );
  }

  return <Outlet />;
};
