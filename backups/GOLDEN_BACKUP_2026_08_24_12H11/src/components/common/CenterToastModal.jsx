import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function CenterToastModal({ isOpen, onClose, type = 'info', title, message }) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />;
      case 'error':
        return <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />;
      default:
        return <Info className="w-12 h-12 text-sky-500 mx-auto" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200 text-center p-6 space-y-4 animate-scale-up">
        {getIcon()}

        <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
          {title || (type === 'success' ? 'Thành Công!' : type === 'error' ? 'Có Lỗi Xảy Ra!' : 'Thông Báo')}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          {message}
        </p>

        <button
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition ${
            type === 'success'
              ? 'bg-emerald-600 hover:bg-emerald-700'
              : type === 'error'
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-slate-900 hover:bg-slate-800'
          }`}
        >
          Xác Nhận & Đóng
        </button>
      </div>
    </div>
  );
}
