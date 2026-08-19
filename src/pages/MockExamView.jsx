import React, { useState } from 'react';
import { Award, ArrowLeft, Shuffle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MockExamView() {
  const navigate = useNavigate();
  const { isTeacher } = useAuth();
  const [created, setCreated] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans select-none">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Award className="w-6 h-6 text-purple-500" />
            <span>Hệ Thống Đề Thi Thử Ngẫu Nhiên (Mock Exam)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Khởi tạo bộ đề thi thử ngẫu nhiên từ Ngân Hàng Đề Thi cho học sinh rèn luyện.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto space-y-4">
        <div className="w-16 h-16 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto text-purple-600">
          <Shuffle className="w-8 h-8" />
        </div>

        <h3 className="font-extrabold text-lg text-slate-900">Sinh Đề Thi Thử Tự Động</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Hệ thống sẽ lấy ngẫu nhiên 10-20 câu hỏi trắc nghiệm, bài nghe và điền từ từ Ngân hàng đề thi để tạo đề thi thử độc lập.
        </p>

        {isTeacher ? (
          <button
            onClick={() => setCreated(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition"
          >
            🎲 Tạo Đề Thi Thử Ngẫu Nhiên Ngay (Giáo Viên)
          </button>
        ) : (
          <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span>Tính năng sinh đề thi thử dành riêng cho Giáo viên khởi tạo cho lớp!</span>
          </div>
        )}

        {created && (
          <div className="p-4 bg-purple-50 border border-purple-200 text-purple-900 rounded-2xl text-xs font-bold animate-fade-in">
            🎉 Đã khởi tạo thành công Đề Thi Thử Ngẫu Nhiên 15 phút! Học sinh có thể vào thi ngay tại trang Dashboard.
          </div>
        )}
      </div>
    </div>
  );
}
