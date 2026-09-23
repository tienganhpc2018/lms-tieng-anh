import React, { useState, useEffect } from 'react';
import { X, Layers, Users, Sparkles, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin } from '../../../utils/soundEffects';

const TEAMS_CONFIG = [
  {
    id: 1,
    name: 'TỔ 1 – BẠC HÀ',
    icon: '🌿',
    bgHeader: 'bg-emerald-600',
    borderCol: 'border-emerald-500/40',
    colorText: 'text-emerald-300',
  },
  {
    id: 2,
    name: 'TỔ 2 – SAN HÔ',
    icon: '🪸',
    bgHeader: 'bg-rose-600',
    borderCol: 'border-rose-500/40',
    colorText: 'text-rose-300',
  },
  {
    id: 3,
    name: 'TỔ 3 – HỔ PHÁCH',
    icon: '🍯',
    bgHeader: 'bg-amber-500 text-slate-950',
    borderCol: 'border-amber-500/40',
    colorText: 'text-amber-300',
  },
  {
    id: 4,
    name: 'TỔ 4 – ĐẠI DƯƠNG',
    icon: '🌊',
    bgHeader: 'bg-indigo-600',
    borderCol: 'border-indigo-500/40',
    colorText: 'text-indigo-300',
  },
];

export default function GroupTeamsModal({ isOpen, onClose, students, onAwardStudent }) {
  const [selectedScope, setSelectedScope] = useState('all'); // 'all' | 1 | 2 | 3 | 4
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeWinner, setActiveWinner] = useState(null);

  if (!isOpen) return null;

  const getTeamStudents = (teamNum) => {
    return students.filter((s) => s.team_group === teamNum && s.status === 'Present');
  };

  const handleStartSpin = (scope = selectedScope) => {
    let pool = [];
    if (scope === 'all') {
      pool = students.filter((s) => s.status === 'Present');
    } else {
      pool = getTeamStudents(Number(scope));
    }

    if (pool.length === 0) {
      alert('Không có học sinh nào đang có mặt trong phạm vi đã chọn!');
      return;
    }

    setIsSpinning(true);
    setActiveWinner(null);

    let count = 0;
    const maxTicks = 25;

    const interval = setInterval(() => {
      count++;
      playSuspenseSpin(count / maxTicks);

      if (count >= maxTicks) {
        clearInterval(interval);
        setIsSpinning(false);

        const chosen = pool[Math.floor(Math.random() * pool.length)];
        setActiveWinner(chosen);

        playWinner();
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
        });

        if (onAwardStudent && chosen) {
          onAwardStudent(chosen.id, 1);
        }
      }
    }, 120);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-5 overflow-y-auto">
      <div className="bg-[#0f172a] border border-slate-700 rounded-[2.5rem] w-full max-w-6xl shadow-2xl p-5 sm:p-7 space-y-4 my-auto text-white flex flex-col max-h-[92vh]">
        {/* HEADER (CHUẨN ẢNH 5) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🐝</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                CHIA NHÓM & BỐC THĂM ĐẠI DIỆN BÁO CÁO
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Tổ chức thi đua, chọn phạm vi (Cả lớp hoặc từng Tổ) và rà soát ngẫu nhiên
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 4 CỘT 4 TỔ (CHUẨN ẢNH 5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto">
          {TEAMS_CONFIG.map((tm) => {
            const list = getTeamStudents(tm.id);
            return (
              <div
                key={tm.id}
                className={`bg-slate-900/90 border ${tm.borderCol} rounded-3xl p-3.5 flex flex-col space-y-3 shadow-lg`}
              >
                {/* BANNER TỔ */}
                <div
                  className={`${tm.bgHeader} py-2.5 px-3 rounded-2xl font-black text-xs sm:text-sm text-center shadow-md flex items-center justify-between text-white`}
                >
                  <span className="flex items-center space-x-1">
                    <span>{tm.icon}</span>
                    <span>{tm.name}</span>
                  </span>
                  <span className="text-[11px] font-mono opacity-90">{list.length} HS</span>
                </div>

                {/* DANH SÁCH HỌC SINH CỦA TỔ */}
                <div className="flex-1 overflow-y-auto max-h-[46vh] space-y-1.5 pr-1">
                  {list.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 italic">
                      Chưa có học sinh trong tổ này
                    </div>
                  ) : (
                    list.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center space-x-2.5 p-2 bg-slate-800/60 hover:bg-slate-800 rounded-xl transition border border-slate-700/40"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-950 p-0.5 border border-slate-600 flex-shrink-0">
                          <img src={st.avatar} alt={st.full_name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate flex-1">
                          {st.full_name}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* NÚT CHỌN RIÊNG TỔ */}
                <button
                  type="button"
                  disabled={isSpinning || list.length === 0}
                  onClick={() => {
                    setSelectedScope(tm.id);
                    handleStartSpin(tm.id);
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-black text-xs rounded-xl transition cursor-pointer border border-slate-700/80 shadow-xs"
                >
                  Bấm Chọn Riêng Tổ {tm.id}
                </button>
              </div>
            );
          })}
        </div>

        {/* THANH ĐIỀU KHIỂN ĐÁY (CHUẨN ẢNH 5) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          {/* BỘ LỌC PHẠM VI */}
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-400">
            <span>Phạm vi:</span>
            <button
              type="button"
              onClick={() => setSelectedScope('all')}
              className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center space-x-1 ${
                selectedScope === 'all'
                  ? 'bg-cyan-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>⭐ Cả Lớp ({students.filter((s) => s.status === 'Present').length})</span>
            </button>

            {[1, 2, 3, 4].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedScope(t)}
                className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer ${
                  selectedScope === t
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Tổ {t}
              </button>
            ))}
          </div>

          {/* NÚT QUAY TO VÀNG */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              disabled={isSpinning}
              onClick={() => handleStartSpin(selectedScope)}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isSpinning
                  ? 'ĐANG QUÉT BỐC THĂM...'
                  : selectedScope === 'all'
                  ? '🎯 QUAY CHỌN ĐẠI DIỆN CẢ LỚP'
                  : `🎯 QUAY CHỌN ĐẠI DIỆN TỔ ${selectedScope}`}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                onClose();
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* MODAL KẾT QUẢ ĐẠI DIỆN */}
        {activeWinner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-400 to-amber-600 p-1 rounded-[2.5rem] shadow-2xl max-w-sm w-full">
              <div className="bg-slate-950 rounded-[2.3rem] p-6 text-center space-y-4 text-white">
                <span className="text-4xl animate-bounce inline-block">🎤 🌟 🐝</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    ĐẠI DIỆN BÁO CÁO ĐƯỢC CHỌN
                  </span>
                  <h3 className="text-xl font-black text-white">{activeWinner.full_name}</h3>
                  <p className="text-xs text-slate-400 font-bold font-mono">
                    {activeWinner.code} • Tổ {activeWinner.team_group}
                  </p>
                </div>

                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-900 border-2 border-amber-400 p-1.5">
                  <img src={activeWinner.avatar} alt={activeWinner.full_name} className="w-full h-full object-cover" />
                </div>

                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold text-amber-300">
                  🎁 Tự động thưởng: +1 ⭐ Sao Đại Diện
                </div>

                <button
                  type="button"
                  onClick={() => setActiveWinner(null)}
                  className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer"
                >
                  Xong & Tiếp Tục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
