import React, { useState, useEffect } from 'react';
import { X, Users, Star, AlertTriangle, Check, Sparkles, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadCriteria, awardClassPoints } from '../behaviorStorage';
import { playClick, playCorrect, playWinner, playDeduct } from '../../../utils/soundEffects';

export default function ClassWidePointModal({
  isOpen,
  onClose,
  classId,
  classNameTitle = '',
  gradeLevel = 'all',
  students = [],
  onUpdateStudents,
}) {
  const [activeTab, setActiveTab] = useState('plus'); // 'plus' | 'minus'
  const [onlyPresent, setOnlyPresent] = useState(true);
  const [customPoints, setCustomPoints] = useState(1);
  const [customReason, setCustomReason] = useState('');
  const [criteria, setCriteria] = useState({ plusCriteria: [], minusCriteria: [] });

  useEffect(() => {
    if (isOpen) {
      const data = loadCriteria(gradeLevel);
      setCriteria(data);
    }
  }, [isOpen, gradeLevel]);

  if (!isOpen) return null;

  const totalStudents = students.length;
  const presentStudents = students.filter((s) => s.status === 'Present').length;
  const absentStudents = totalStudents - presentStudents;
  const targetCount = onlyPresent ? presentStudents : totalStudents;

  // Thực hiện cộng hoặc trừ điểm cho cả lớp
  const handleApplyClassPoints = (points, label, isDeduct = false) => {
    if (points <= 0) return;

    if (isDeduct) {
      playDeduct();
    } else {
      playWinner();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
      });
    }

    const updated = awardClassPoints(classId, points, isDeduct, onlyPresent);
    if (onUpdateStudents) onUpdateStudents(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-xl border border-slate-200 shadow-2xl flex flex-col h-[90vh] max-h-[750px] overflow-hidden">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md text-2xl flex-shrink-0">
              👥
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Chấm Điểm Cho Cả Lớp {classNameTitle}
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Khen thưởng hoặc nhắc nhở đồng loạt toàn thể học sinh trong lớp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* THÂN MODAL CUỘN (SCROLLABLE BODY) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4" style={{ scrollbarWidth: 'thin' }}>

        {/* PHẠM VI ÁP DỤNG: CÓ BỎ QUA HỌC SINH VẮNG KHÔNG */}
        <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <label className="flex items-center space-x-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyPresent}
              onChange={(e) => setOnlyPresent(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer accent-emerald-600"
            />
            <div className="text-xs font-bold text-slate-800">
              <span>Chỉ áp dụng cho học sinh có mặt</span>
              {absentStudents > 0 && (
                <span className="text-rose-600 font-semibold ml-1">(Bỏ qua {absentStudents} bạn vắng)</span>
              )}
            </div>
          </label>

          <div className="text-xs font-black text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-amber-300/80 shadow-2xs self-start sm:self-auto">
            🎯 Sẽ chấm cho: <strong>{targetCount}/{totalStudents} HS</strong>
          </div>
        </div>

        {/* 2 TABS: CỘNG ĐIỂM & TRỪ ĐIỂM */}
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('plus');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'plus'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Khen Thưởng Cả Lớp (+)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setActiveTab('minus');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 ${
              activeTab === 'minus'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-white" />
            <span>Nhắc Nhở Cả Lớp (-)</span>
          </button>
        </div>

        {/* DANH SÁCH TIÊU CHÍ LỰA CHỌN */}
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {activeTab === 'plus' ? (
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
                Chọn tiêu chí khen thưởng cả lớp (+):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {criteria.plusCriteria.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleApplyClassPoints(c.points, c.label, false)}
                    className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-1">
                      <span className="text-xl flex-shrink-0">{c.icon || '🌟'}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug truncate">{c.label}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 flex-shrink-0 group-hover:scale-110 transition">
                      +{c.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider block">
                Chọn tiêu chí nhắc nhở cả lớp (-):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {criteria.minusCriteria.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleApplyClassPoints(c.points, c.label, true)}
                    className="p-3 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-1">
                      <span className="text-xl flex-shrink-0">{c.icon || '⚠️'}</span>
                      <span className="text-xs font-bold text-slate-800 leading-snug truncate">{c.label}</span>
                    </div>
                    <span className="text-xs font-black text-rose-800 bg-white px-2 py-0.5 rounded-lg border border-rose-300 flex-shrink-0 group-hover:scale-110 transition">
                      -{c.points}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ô CHẤM ĐIỂM TÙY CHỈNH */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Hoặc nhập số điểm tùy ý:
            </span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Lý do (VD: Cả lớp giữ trật tự tốt, Cả lớp trực nhật sạch...)"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-400"
              />
              <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-300">
                <span className="text-xs font-black text-slate-500">{activeTab === 'plus' ? '+' : '-'}</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={customPoints}
                  onChange={(e) => setCustomPoints(e.target.value)}
                  className="w-12 text-center text-xs font-black bg-transparent outline-none"
                />
                <span className="text-[10px] font-bold text-slate-400">điểm</span>
              </div>
              <button
                type="button"
                onClick={() => handleApplyClassPoints(Number(customPoints) || 1, customReason || 'Chấm điểm cả lớp', activeTab === 'minus')}
                className={`px-4 py-2 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer active:scale-95 ${
                  activeTab === 'plus' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between flex-shrink-0">
          <span className="text-[11px] text-slate-500 font-medium">
            💡 Điểm số sẽ được cập nhật đồng loạt ngay lập tức cho từng học sinh.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-xs active:scale-95"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
