import React, { useState, useEffect, useRef } from 'react';
import { X, Gift, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin, playTick } from '../../../utils/soundEffects';

const BLIND_REWARDS = [
  { text: '+1 ⭐ Sao Thi Đua', points: 1, icon: '⭐' },
  { text: '+2 ⭐ Sao Thần Kỳ', points: 2, icon: '🌟' },
  { text: '+3 ⭐ Sao Xuất Sắc', points: 3, icon: '🔥' },
  { text: '+1 ⭐ Lì Xì May Mắn', points: 1, icon: '🧧' },
  { text: '👏 Cả lớp vỗ tay khen ngợi', points: 1, icon: '👏' },
  { text: '🎤 Hát 1 bài hát / Đọc 1 câu tiếng Anh', points: 1, icon: '🎤' },
  { text: '🍬 1 Viên Kẹo Ngọt May Mắn', points: 1, icon: '🍬' },
  { text: '👑 Đặc quyền chỉ định bạn khác trả lời', points: 1, icon: '👑' },
];

export default function BlindPouchModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [openedPouches, setOpenedPouches] = useState({}); // { pouchNum: { reward, student } }
  const [activeWinner, setActiveWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(6); // 6 giây hồi hộp
  const [spinningPouchNum, setSpinningPouchNum] = useState(null);
  const [spinningReward, setSpinningReward] = useState(null);
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

  const handleOpenPouch = (num) => {
    if (isSpinning) return;

    if (openedPouches[num]) {
      setActiveWinner({ num, ...openedPouches[num] });
      return;
    }

    playClick();

    // Chuẩn bị danh sách học sinh hợp lệ
    const presentStudents = students.filter(
      (s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
    );
    const candidatePool = presentStudents.length > 0 ? presentStudents : students;

    // BẮT ĐẦU 6 GIÂY HỒI HỘP
    setIsSpinning(true);
    setSpinningPouchNum(num);
    setSpinCountdown(6);

    let secondsLeft = 6;
    let tickCount = 0;

    // Vòng lặp xoay phần thưởng và học sinh chớp nhoáng (80ms)
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const randRew = BLIND_REWARDS[Math.floor(Math.random() * BLIND_REWARDS.length)];
      const randSt = candidatePool.length > 0 ? candidatePool[Math.floor(Math.random() * candidatePool.length)] : null;
      setSpinningReward(randRew);
      setSpinningCandidate(randSt);
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

        // Chốt kết quả
        const reward = BLIND_REWARDS[Math.floor(Math.random() * BLIND_REWARDS.length)];
        const randStudent = candidatePool.length > 0 ? candidatePool[Math.floor(Math.random() * candidatePool.length)] : null;

        const resultData = {
          reward,
          student: randStudent,
        };

        setOpenedPouches((prev) => ({
          ...prev,
          [num]: resultData,
        }));

        playWinner();
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.55 },
        });

        setActiveWinner({ num, ...resultData });
      }
    }, 1000);
  };

  const handleReset = () => {
    playClick();
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
    setIsSpinning(false);
    setOpenedPouches({});
    setActiveWinner(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-gradient-to-b from-[#2e0921] to-[#170311] border border-pink-500/50 rounded-[2.5rem] w-full max-w-4xl shadow-2xl p-6 sm:p-8 space-y-5 my-auto text-pink-100 flex flex-col max-h-[92vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-pink-900/60 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-pink-600/40">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-pink-200 tracking-tight flex items-center space-x-2">
                <span>TÚI MÙ (32 HỘP QUÀ BÍ MẬT) 🎁</span>
              </h2>
              <p className="text-xs text-pink-400 font-medium">
                Mỗi hộp quà ẩn chứa một phần thưởng thi đua bất ngờ (Quay mở 6s hồi hộp)!
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 text-pink-300 border border-pink-700/50 text-xs font-bold transition cursor-pointer flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm mới ({Object.keys(openedPouches).length}/32 đã mở)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-pink-400/70 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* LƯỚI 32 HỘP QUÀ */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-3.5">
            {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => {
              const isOpened = Boolean(openedPouches[num]);
              const data = openedPouches[num];

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleOpenPouch(num)}
                  disabled={isSpinning}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition cursor-pointer transform hover:scale-105 active:scale-95 shadow-md relative group border ${
                    isOpened
                      ? 'bg-pink-950/30 border-pink-900/40 opacity-60'
                      : 'bg-gradient-to-b from-[#4a0d36] to-[#25061b] border-pink-500/60 hover:border-pink-300 hover:shadow-pink-500/30'
                  }`}
                >
                  <span className="text-2xl sm:text-3xl block group-hover:animate-bounce">
                    {isOpened ? '📭' : '🎁'}
                  </span>
                  <span className="text-[10px] font-black tracking-wider text-pink-300 uppercase mt-0.5 block">
                    #{num}
                  </span>

                  {isOpened && (
                    <span className="text-[9px] font-bold text-amber-300 truncate max-w-[60px] block mt-0.5">
                      {data.reward?.icon} {data.reward?.text.split(' ')[0]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* MODAL 6 GIÂY HỒI HỘP KHI ĐANG MỞ TÚI MÙ */}
        {/* =================================================================== */}
        {isSpinning && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-pink-500 via-rose-600 to-purple-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-4 border-pink-300">
              <div className="bg-gradient-to-b from-[#350723] to-[#1a0211] rounded-[2.2rem] p-6 text-center space-y-5 text-pink-100 relative overflow-hidden">
                
                {/* VỆT SÁNG NỀN QUAY TRÒN */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-400/20 rounded-full blur-2xl animate-spin pointer-events-none" />

                <div className="space-y-1">
                  <span className="text-xs font-black text-pink-300 uppercase tracking-widest block animate-pulse">
                    ✨ ĐANG XÉ TÚI MÙ SỐ #{spinningPouchNum} ✨
                  </span>
                  <p className="text-xs text-pink-200/80 font-medium">
                    Hộp quà đang rung rinh... Ai sẽ nhận phần quà này?
                  </p>
                </div>

                {/* ĐỒNG HỒ ĐẾM NGƯỢC 6S TO RÕ */}
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-pink-500 to-amber-400 p-1 shadow-xl animate-bounce">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-pink-300">
                    <span className="font-mono font-black text-3xl text-pink-300">
                      0{spinCountdown}s
                    </span>
                  </div>
                </div>

                {/* PHẦN THƯỞNG & HỌC SINH ĐANG XOAY CHỚP NHOÁNG */}
                <div className="bg-pink-950/60 p-3.5 rounded-2xl border border-pink-500/50 space-y-2">
                  <span className="text-3xl block animate-spin">
                    {spinningReward?.icon || '🎁'}
                  </span>
                  <span className="text-sm font-black text-amber-300 block truncate">
                    {spinningReward?.text || 'Đang mở quà...'}
                  </span>

                  {spinningCandidate && (
                    <div className="pt-2 border-t border-pink-800/60 flex items-center justify-center space-x-2">
                      <img
                        src={spinningCandidate.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full bg-pink-900 border border-pink-400 object-cover"
                      />
                      <span className="text-xs font-bold text-white truncate max-w-[150px]">
                        {spinningCandidate.full_name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-pink-300/70 italic animate-pulse">
                  ⏳ Đang mở túi mù hồi hộp trong 6 giây...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* MODAL KẾT QUẢ MỞ TÚI MÙ (SAU KHI ĐẾM NGƯỢC XONG) */}
        {/* =================================================================== */}
        {activeWinner && !isSpinning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-pink-500 to-rose-600 p-1 rounded-[2.5rem] shadow-2xl max-w-sm w-full">
              <div className="bg-gradient-to-b from-[#350723] to-[#1c0313] rounded-[2.3rem] p-6 text-center space-y-4 text-pink-100">
                <span className="text-4xl animate-bounce inline-block">🎁 ✨ 🎁</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-pink-400 uppercase tracking-widest">
                    ĐÃ MỞ TÚI MÙ SỐ #{activeWinner.num}
                  </span>
                  <h3 className="text-xl font-black text-white">{activeWinner.reward?.text}</h3>
                </div>

                {activeWinner.student && (
                  <div className="p-3 bg-pink-950/80 rounded-2xl border border-pink-600/40 space-y-2">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-pink-900/80 border border-amber-400 p-1">
                      <img
                        src={activeWinner.student.avatar}
                        alt={activeWinner.student.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-pink-200">Người may mắn nhận quà:</p>
                      <h4 className="text-sm font-black text-amber-300">{activeWinner.student.full_name}</h4>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveWinner(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer hover:from-pink-400 hover:to-rose-400"
                >
                  Xong & Nhận Thưởng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
