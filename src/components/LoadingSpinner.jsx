import React from 'react';

export const LoadingSpinner = ({ label = 'Đang tải dữ liệu thực tế...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{label}</p>
    </div>
  );
};
