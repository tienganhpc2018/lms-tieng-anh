import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, Users, RotateCcw, Trophy, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin } from '../../../utils/soundEffects';

export default function SuspenseCallModal({
  isOpen,
  onClose,
  students,
  mode = 'single', // 'single' (1 HS) | 'multi' (3 HS)
  onMarkCalled,
  onAwardStudent
}) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightedStudent, setHighlightedStudent] = useState(null);
  const [winner, setWinner] = useState(null);
  const [multiWinners, setMultiWinners] = useState([]);
  const [countdown, setCountdown] = useState(6);
  const timerRef = useRef(null);

  const presentStudents = students.filter((s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm');
  const eligibleStudents = presentStudents.length > 0 ? presentStudents : students;

  const startSpin = () => {
    if (eligibleStudents.length === 0) {
      alert('Không có học sinh nào đang có mặt để gọi!');
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setMultiWinners([]);
    setCountdown(6);

    let secondsLeft = 6;
    let spinSpeed = 70; // ms

    const spinInterval = setInterval(() => {
      const rand = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
      setHighlightedStudent(rand);
      playSuspenseSpin((6 - secondsLeft) / 6);
    }, spinSpeed);

    const countInterval = setInterval(() => {
      secondsLeft -= 1;
      setCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(countInterval);
        clearInterval(spinInterval);
        setIsSpinning(false);

        playWinner();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });

        if (mode === 'multi') {
          // Chọn ngẫu nhiên 3 bạn khác nhau
          const shuffled = [...eligibleStudents].sort(() => 0.5 - Math.random());
          const chosen = shuffled.slice(0, Math.min(3, shuffled.length));
          setMultiWinners(chosen);
          chosen.forEach((st) => onMarkCalled && onMarkCalled(st.id));
        } else {
          // Chọn 1 bạn
          const chosen = eligibleStudents[Math.floor(Math.random() * eligibleStudents.length)];
          setWinner(chosen);
          if (onMarkCalled && chosen) onMarkCalled(chosen.id);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      startSpin();
    } else {
      setIsSpinning(false);
      setWinner(null);
      setMultiWinners([]);
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-indigo-500/40 rounded-[2.5rem] w-full max-w-lg shadow-2xl p-6 sm:p-8 space-y-6 my-auto text-white text-center relative flex flex-col max-h-[92vh]">
        {/* NÚT CLOSE */}
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="space-y-1 pt-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-black border border-amber-400/40">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>{mode === 'multi' ? 'GỌI NHIỀU (3 HỌC SINH)' : 'VÒNG QUAY 6 GIÂY HỒI HỘP'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            {isSpinning ? 'Đang quét radar tìm bạn may mắn...' : 'XƯỚNG TÊN LÊN BẢNG'}
          </h2>
        </div>

        {/* MÀN HÌNH VÒNG QUAY */}
        {isSpinning ? (
          <div className="space-y-4 py-6">
            <div className="relative w-36 h-36 mx-auto">
              {/* Vòng tròn hào quang xoay */}
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/30 border-t-amber-400 animate-spin" />
              <div className="w-full h-full rounded-full bg-slate-800/80 border-2 border-indigo-500 p-3 flex items-center justify-center shadow-inner">
                {highlightedStudent ? (
                  <img
                    src={highlightedStudent.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Users className="w-12 h-12 text-indigo-400 animate-pulse" />
                )}
              </div>
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white font-mono font-black text-xs px-2.5 py-0.5 rounded-full shadow-md">
                {countdown}s
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-amber-300 animate-pulse">
                {highlightedStudent?.full_name || '...'}
              </h3>
              <p className="text-xs text-slate-400 font-bold font-mono">
                {highlightedStudent?.code} • Tổ {highlightedStudent?.team_group}
              </p>
            </div>
          </div>
        ) : mode === 'multi' && multiWinners.length > 0 ? (
          /* KẾT QUẢ GỌI 3 HỌC SINH */
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              {multiWinners.map((w, idx) => (
                <div
                  key={w.id}
                  className="bg-slate-800/90 border border-indigo-500/50 rounded-2xl p-3 text-center space-y-2 transform hover:scale-105 transition"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-slate-900 border border-amber-400 p-1">
                    <img src={w.avatar} alt={w.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white truncate">{w.full_name}</h4>
                    <span className="text-[10px] text-amber-400 font-mono font-bold">
                      {w.code} • Tổ {w.team_group}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      playCorrect();
                      onAwardStudent && onAwardStudent(w.id, 1);
                    }}
                    className="w-full py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black cursor-pointer shadow-xs"
                  >
                    +1 ⭐
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : winner ? (
          /* KẾT QUẢ GỌI 1 HỌC SINH */
          <div className="space-y-4 py-2 animate-scale-up">
            <div className="w-28 h-28 mx-auto rounded-3xl bg-slate-800/90 border-3 border-amber-400 p-2 shadow-2xl shadow-amber-500/30">
              <img src={winner.avatar} alt={winner.full_name} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                XIN MỜI BẠN LÊN BẢNG!
              </span>
              <h3 className="text-2xl font-black text-white">{winner.full_name}</h3>
              <p className="text-xs text-slate-400 font-bold font-mono">
                {winner.code} • Tổ {winner.team_group}
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  playCorrect();
                  onAwardStudent && onAwardStudent(winner.id, 1);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md flex items-center space-x-1"
              >
                <span>Thưởng +1 ⭐ Sao</span>
              </button>
            </div>
          </div>
        ) : null}

        {/* NÚT TÁC VỤ DƯỚI */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            disabled={isSpinning}
            onClick={startSpin}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quay Lượt Khác</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md"
          >
            Hoàn Thành
          </button>
        </div>
      </div>
    </div>
  );
}
