import React, { useState } from 'react';
import { X, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner } from '../../../utils/soundEffects';

export default function TetHaiHoaModal({ isOpen, onClose, students, onAwardStudent }) {
  const [openedLocs, setOpenedLocs] = useState({}); // { locNum: studentId }
  const [activeWinner, setActiveWinner] = useState(null);

  if (!isOpen) return null;

  const totalLoc = students.length || 35;

  const handlePickLoc = (locNum) => {
    if (openedLocs[locNum]) {
      // Đã mở rồi thì mở lại modal xem ai trúng
      const stId = openedLocs[locNum];
      const st = students.find((s) => s.id === stId);
      if (st) setActiveWinner({ student: st, locNum });
      return;
    }

    playWinner();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    // Chọn học sinh tương ứng hoặc ngẫu nhiên từ danh sách chưa gọi
    const availableStudents = students.filter(
      (s) => !Object.values(openedLocs).includes(s.id) && s.status === 'Present'
    );
    const chosen =
      availableStudents.length > 0
        ? availableStudents[Math.floor(Math.random() * availableStudents.length)]
        : students[(locNum - 1) % students.length];

    setOpenedLocs({
      ...openedLocs,
      [locNum]: chosen.id,
    });

    setActiveWinner({ student: chosen, locNum });

    // Tự động cộng 1 sao lì xì
    if (onAwardStudent && chosen) {
      onAwardStudent(chosen.id, 1);
    }
  };

  const handleResetAll = () => {
    playClick();
    setOpenedLocs({});
    setActiveWinner(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#2b0808] to-[#1a0404] border-2 border-amber-500/60 rounded-[2.5rem] w-full max-w-5xl shadow-2xl p-5 sm:p-7 space-y-4 my-auto relative text-amber-100 flex flex-col max-h-[92vh]">
        {/* HEADER TẾT */}
        <div className="flex items-center justify-between border-b border-amber-800/80 pb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-bounce">🌸</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 uppercase tracking-widest flex items-center space-x-2">
                <span>HÁI HOA DÂN CHỦ MỪNG XUÂN</span>
              </h2>
              <p className="text-xs text-amber-200/70 font-bold mt-0.5">
                Sĩ số lớp: <span className="text-amber-400">{students.length} học sinh</span> • Tổng số hoa/lồng đèn: <span className="text-amber-400">{totalLoc} lộc</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-700/60 text-amber-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mở Lại Tất Cả ({Object.keys(openedLocs).length}/{totalLoc} đã mở)</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="p-1.5 text-amber-400 hover:text-white rounded-xl hover:bg-amber-900/60 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* LỜI NHẮC */}
        <div className="text-xs font-bold text-amber-200/90 flex items-center space-x-1.5 pl-1">
          <span>👉 Bấm chọn một lồng đèn may mắn trên cành mai ({totalLoc} lộc):</span>
        </div>

        {/* CÂY MAI TẾT VỚI CÁC LỒNG ĐÈN TREO */}
        <div className="flex-1 bg-radial from-[#3d0f0f] to-[#1f0505] rounded-3xl border border-amber-800/50 p-4 sm:p-6 overflow-y-auto relative min-h-[420px] flex items-center justify-center">
          {/* HỌA TIẾT CÂY MAI GỖ NÂU */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-35">
            <svg viewBox="0 0 800 500" className="w-full h-full max-w-3xl">
              <path
                d="M 400 480 L 400 280 C 400 230 350 180 260 160 M 400 280 C 400 230 450 180 540 160 M 400 220 L 400 120 C 400 90 320 60 280 40 M 400 160 C 400 110 480 80 520 60"
                stroke="#854d0e"
                strokeWidth="18"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          {/* LƯỚI LỒNG ĐÈN LỘC TREO TRÊN CÀNH */}
          <div className="relative z-10 grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
            {Array.from({ length: totalLoc }, (_, i) => i + 1).map((num) => {
              const isOpened = Boolean(openedLocs[num]);
              const stId = openedLocs[num];
              const st = students.find((s) => s.id === stId);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePickLoc(num)}
                  className={`group relative flex flex-col items-center transition-all duration-300 transform hover:scale-110 active:scale-95 cursor-pointer`}
                >
                  {/* DÂY TREO */}
                  <div className="w-0.5 h-3 bg-amber-400/80 mb-0.5" />

                  {/* LỒNG ĐÈN ĐỎ VIỀN VÀNG */}
                  <div
                    className={`w-11 sm:w-13 h-13 sm:h-15 rounded-[1.4rem] border-2 flex flex-col items-center justify-center shadow-lg transition-all ${
                      isOpened
                        ? 'bg-amber-950/80 border-amber-600/50 text-amber-400/60'
                        : 'bg-gradient-to-b from-rose-600 via-red-600 to-rose-700 border-amber-300 text-amber-200 shadow-rose-900/60 ring-2 ring-amber-400/30 animate-pulse'
                    }`}
                  >
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter">LỘC</span>
                    <span className="text-xs sm:text-sm font-black text-white">{num}</span>
                  </div>

                  {/* TÊN NẾU ĐÃ MỞ */}
                  {isOpened && st && (
                    <span className="text-[9px] font-bold text-amber-300 truncate max-w-[55px] mt-1 bg-black/60 px-1 rounded">
                      {st.full_name.split(' ').pop()}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL KẾT QUẢ TRÚNG LỘC */}
        {activeWinner && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1 rounded-[2.5rem] shadow-2xl max-w-sm w-full">
              <div className="bg-gradient-to-b from-[#3a0808] to-[#1f0303] rounded-[2.3rem] p-6 text-center space-y-4 text-amber-100">
                <span className="text-4xl">🎊 🌸 🎊</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    CHÚC MỪNG BẠN TRÚNG LỘC #{activeWinner.locNum}
                  </span>
                  <h3 className="text-xl font-black text-white">{activeWinner.student?.full_name}</h3>
                  <p className="text-xs text-amber-200/80 font-bold font-mono">
                    {activeWinner.student?.code} • Tổ {activeWinner.student?.team_group}
                  </p>
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 p-2 shadow-inner">
                  <img
                    src={activeWinner.student?.avatar}
                    alt={activeWinner.student?.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-3 bg-amber-950/80 rounded-2xl border border-amber-600/40 text-xs font-bold text-amber-200">
                  🎁 Nhận ngay lì xì: <span className="text-amber-400 font-black">+1 ⭐ Sao Thi Đua!</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveWinner(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer hover:from-amber-300 hover:to-amber-400"
                >
                  Tuyệt Vời & Tiếp Tục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
