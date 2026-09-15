import React, { useState } from 'react';
import { X, Star, AlertTriangle, Award, Bot, Plus, Minus, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playCorrect, playDeduct } from '../../../utils/soundEffects';

const PLUS_CRITERIA = [
  { label: 'Phát biểu xây dựng bài', points: 1, icon: '🙋‍♂️' },
  { label: 'Làm bài tập xuất sắc', points: 2, icon: '🌟' },
  { label: 'Giúp đỡ bạn bè / Nhóm tốt', points: 1, icon: '🤝' },
  { label: 'Trực nhật lớp sạch sẽ', points: 2, icon: '🧹' },
  { label: 'Đạt điểm 10 kiểm tra', points: 5, icon: '💯' },
  { label: 'Khen ngợi nỗ lực tiến bộ', points: 1, icon: '🚀' },
];

const MINUS_CRITERIA = [
  { label: 'Nói chuyện riêng trong giờ', points: 1, icon: '🗣️' },
  { label: 'Không làm bài tập / Thiếu vở', points: 2, icon: '📑' },
  { label: 'Đi học muộn / Vào lớp trễ', points: 1, icon: '⏰' },
  { label: 'Làm việc riêng / Ngủ trong lớp', points: 1, icon: '😴' },
  { label: 'Sử dụng điện thoại không phép', points: 3, icon: '📱' },
  { label: 'Mất trật tự nghiêm trọng', points: 2, icon: '⚠️' },
];

export default function PointModal({ isOpen, onClose, student, onUpdateStudent }) {
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'avatar'
  const [customPoints, setCustomPoints] = useState(1);

  if (!isOpen || !student) return null;

  const handleAddPoints = (amount, reason = '') => {
    playCorrect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const updated = {
      ...student,
      plus_points: (student.plus_points || 0) + amount,
    };
    onUpdateStudent(updated);
    onClose();
  };

  const handleDeductPoints = (amount, reason = '') => {
    playDeduct();
    const updated = {
      ...student,
      minus_points: (student.minus_points || 0) + amount,
    };
    onUpdateStudent(updated);
    onClose();
  };

  const handleChangeAvatar = (newAvatarUrl) => {
    playCorrect();
    const updated = {
      ...student,
      avatar: newAvatarUrl,
    };
    onUpdateStudent(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER VỚI AVATAR HỌC SINH */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 p-1 shadow-md">
                <img src={student.avatar} alt={student.full_name} className="w-full h-full object-cover" />
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  student.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-slate-400">{student.code}</span>
                <h3 className="text-lg font-black text-slate-900">{student.full_name}</h3>
              </div>
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mt-0.5">
                <span>Tổ {student.team_group}</span>
                <span>•</span>
                <span className="text-emerald-600 font-extrabold">+{student.plus_points || 0} ⭐</span>
                <span>•</span>
                <span className="text-purple-600 font-extrabold">-{student.minus_points || 0}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2 TABS */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('points');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'points'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Cho Điểm & Khen Thưởng</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('avatar');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'avatar'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Đổi Avatar Robot</span>
          </button>
        </div>

        {/* NỘI DUNG TAB */}
        {activeTab === 'points' ? (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* NHÓM CỘNG ĐIỂM */}
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Khen Thưởng & Điểm Cộng (+)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {PLUS_CRITERIA.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPoints(c.points, c.label)}
                    className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug">{c.label}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 group-hover:scale-110 transition">
                      +{c.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* NHÓM TRỪ ĐIỂM */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                <span>Nhắc Nhở & Điểm Trừ Nề Nếp (-)</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {MINUS_CRITERIA.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDeductPoints(c.points, c.label)}
                    className="p-3 bg-purple-50/70 hover:bg-purple-100 border border-purple-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{c.icon}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug">{c.label}</span>
                    </div>
                    <span className="text-xs font-black text-purple-800 bg-white px-2 py-0.5 rounded-lg border border-purple-300 group-hover:scale-110 transition">
                      -{c.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* TAB ĐỔI AVATAR ROBOT */
          <div className="space-y-3 flex-1 overflow-y-auto pr-1">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider block">
              Chọn Avatar Robot mới cho học sinh:
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {[
                'Sparky', 'Bolt', 'Cosmo', 'Titan', 'Byte', 'Pixel',
                'Nova', 'Echo', 'Orbit', 'Pulse', 'Cyber', 'Aero',
                'Blaze', 'Gizmo', 'Rust', 'Quantum', 'Vortex', 'Neon'
              ].map((seed, idx) => {
                const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChangeAvatar(url)}
                    className="p-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-400 rounded-2xl transition cursor-pointer group flex flex-col items-center space-y-1"
                  >
                    <img src={url} alt={seed} className="w-12 h-12 group-hover:scale-110 transition" />
                    <span className="text-[10px] font-bold text-slate-500">{seed}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
