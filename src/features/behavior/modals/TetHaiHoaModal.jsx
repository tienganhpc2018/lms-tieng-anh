import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin, playTick } from '../../../utils/soundEffects';

export default function TetHaiHoaModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [openedLocs, setOpenedLocs] = useState({}); // { locNum: studentId }
  const [activeWinner, setActiveWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(6); // 6 giây hồi hộp
  const [spinningLocNum, setSpinningLocNum] = useState(null);
  const [spinningCandidate, setSpinningCandidate] = useState(null);

  const spinTimerRef = useRef(null);
  const countTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (countTimerRef.current) clearInterval(countTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const totalLoc = students.length || 35;

  const handlePickLoc = (locNum) => {
    if (isSpinning) return;

    if (openedLocs[locNum]) {
      // Đã mở rồi thì mở lại modal xem ai trúng
      const stId = openedLocs[locNum];
      const st = students.find((s) => s.id === stId);
      if (st) setActiveWinner({ student: st, locNum });
      return;
    }

    playClick();

    // Chuẩn bị danh sách học sinh hợp lệ
    const presentStudents = students.filter(
      (s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
    );
    const candidatePool = presentStudents.length > 0 ? presentStudents : students;
    const availableStudents = candidatePool.filter(
      (s) => !Object.values(openedLocs).includes(s.id)
    );
    const finalPool = availableStudents.length > 0 ? availableStudents : candidatePool;

    // BẮT ĐẦU 6S HỒI HỘP ĐẾM NGƯỢC
    setIsSpinning(true);
    setSpinningLocNum(locNum);
    setSpinCountdown(6);
    setSpinningCandidate(finalPool[Math.floor(Math.random() * finalPool.length)]);

    let secondsLeft = 6;
    let tickCount = 0;

    // Vòng lặp xoay tên chớp nhoáng (80ms)
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const rand = finalPool[Math.floor(Math.random() * finalPool.length)];
      setSpinningCandidate(rand);
      playSuspenseSpin(tickCount / 75);
    }, 80);

    // Đếm ngược từng giây (1000ms)
    countTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setSpinCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(countTimerRef.current);
        clearInterval(spinTimerRef.current);
        setIsSpinning(false);

        // Chốt học sinh trúng lộc
        const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];

        setOpenedLocs((prev) => ({
          ...prev,
          [locNum]: chosen.id,
        }));

        playWinner();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });

        setActiveWinner({ student: chosen, locNum });
      }
    }, 1000);
  };

  const handleResetAll = () => {
    playClick();
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
    setIsSpinning(false);
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
              className="px-3.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/60 text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mở Lại Tất Cả ({Object.keys(openedLocs).length}/{totalLoc} đã mở)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-amber-400/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* HƯỚNG DẪN */}
        <div className="text-xs font-black text-amber-300/90 flex items-center space-x-2 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/40">
          <span>👉 Bấm chọn một lồng đèn may mắn trên cành mai để bốc thăm lì xì bất ngờ cho học sinh (Quay chọn 6s hồi hộp)!</span>
        </div>

        {/* LƯỚI LỒNG ĐÈN / HOA MAI CÀNH TẾT */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          <div className="relative z-10 grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
            {Array.from({ length: totalLoc }, (_, i) => i + 1).map((num) => {
              const isOpened = Boolean(openedLocs[num]);
              const assignedStudentId = openedLocs[num];
              const st = students.find((s) => s.id === assignedStudentId);

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handlePickLoc(num)}
                  disabled={isSpinning}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition cursor-pointer transform hover:scale-105 active:scale-95 shadow-md relative group border ${
                    isOpened
                      ? 'bg-amber-950/40 border-amber-900/60 opacity-60'
                      : 'bg-gradient-to-b from-[#8b1414] to-[#4a0808] border-amber-500/80 hover:border-amber-300 hover:shadow-amber-500/40'
                  }`}
                >
                  {/* DÂY TREO LỘC TRANG TRÍ */}
                  <div className="w-0.5 h-3 bg-amber-500/60 absolute -top-3 left-1/2 -translate-x-1/2" />

                  {isOpened ? (
                    <div className="space-y-0.5">
                      <span className="text-base block">🧧</span>
                      <span className="text-[10px] font-black text-amber-300 block truncate max-w-[50px]">
                        {st?.full_name?.split(' ').pop() || `#${num}`}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <span className="text-lg block group-hover:animate-bounce">🏮</span>
                      <span className="text-[10px] font-black text-amber-200 uppercase tracking-tight block">
                        LỘC
                      </span>
                      <span className="text-xs font-black text-amber-400 block leading-none">
                        {num}
                      </span>
                    </div>
                  )}

                  {isOpened && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 rounded-full text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL 6 GIÂY HỒI HỘP KHI ĐANG QUAY LỘC */}
        {/* =================================================================== */}
        {isSpinning && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-amber-500 via-rose-600 to-amber-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-4 border-amber-300">
              <div className="bg-gradient-to-b from-[#2b0808] to-[#150202] rounded-[2.2rem] p-6 text-center space-y-5 text-amber-100 relative overflow-hidden">
                
                {/* VỆT SÁNG QUAY TRÒN */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl animate-spin pointer-events-none" />

                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest block animate-pulse">
                    🌸 ĐANG HÁI LỘC XUÂN #{spinningLocNum} 🌸
                  </span>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Ai sẽ là chủ nhân của phong bao lì xì may mắn này?
                  </p>
                </div>

                {/* ĐỒNG HỒ ĐẾM NGƯỢC 6S TO RÕ */}
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 shadow-xl animate-bounce">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-amber-300">
                    <span className="font-mono font-black text-3xl text-amber-300">
                      0{spinCountdown}s
                    </span>
                  </div>
                </div>

                {/* HỌC SINH ĐANG XOAY CHỚP NHOÁNG */}
                {spinningCandidate && (
                  <div className="bg-amber-950/60 p-3 rounded-2xl border border-amber-500/50 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/30 p-1 border-2 border-amber-400 shadow-md">
                      <img
                        src={spinningCandidate.avatar}
                        alt={spinningCandidate.full_name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <span className="text-base font-black text-white block truncate tracking-tight">
                      {spinningCandidate.full_name}
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold block">
                      {spinningCandidate.code} • Tổ {spinningCandidate.team_group}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-amber-200/70 italic animate-pulse">
                  ⏳ Đang chọn lọc ngẫu nhiên trong 6 giây...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL KẾT QUẢ TRÚNG LỘC (SAU KHI ĐẾM NGƯỢC XONG) */}
        {/* =================================================================== */}
        {activeWinner && !isSpinning && (
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
                  🎯 Xin mời bạn: <span className="text-amber-400 font-black">Lên Bảng Trả Bài / Phát Biểu!</span>
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
