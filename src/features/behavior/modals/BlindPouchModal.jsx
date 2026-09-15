import React, { useState } from 'react';
import { X, Gift, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playCorrect } from '../../../utils/soundEffects';

const BLIND_REWARDS = [
  { text: '+1 ⭐ Sao Thi Đua', points: 1, icon: '⭐' },
  { text: '+2 ⭐ Sao Thần Kỳ', points: 2, icon: '🌟' },
  { text: '+3 ⭐ Sao Xuất Sắc', points: 3, icon: '🔥' },
  { text: '+1 ⭐ Lì Xì May Mắn', points: 1, icon: '🧧' },
  { text: '👏 Cả lớp vỗ tay khen ngợi', points: 1, icon: '👏' },
  { text: '🎤 Hát 1 bài hát / Đọc 1 câu tiếng Anh', points: 1, icon: '🎤' },
  { text: '🍫 1 Viên Kẹo Ngọt May Mắn', points: 1, icon: '🍬' },
  { text: '👑 Đặc quyền chỉ định bạn khác trả lời', points: 1, icon: '👑' },
];

export default function BlindPouchModal({ isOpen, onClose, students, onAwardStudent }) {
  const [openedPouches, setOpenedPouches] = useState({}); // { pouchNum: { reward, studentId } }
  const [activeWinner, setActiveWinner] = useState(null);

  if (!isOpen) return null;

  const handleOpenPouch = (num) => {
    if (openedPouches[num]) {
      setActiveWinner({ num, ...openedPouches[num] });
      return;
    }

    playWinner();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.55 },
    });

    const reward = BLIND_REWARDS[Math.floor(Math.random() * BLIND_REWARDS.length)];
    // Chọn ngẫu nhiên 1 học sinh
    const randStudent = students.length > 0 ? students[Math.floor(Math.random() * students.length)] : null;

    const resultData = {
      reward,
      student: randStudent,
    };

    setOpenedPouches({
      ...openedPouches,
      [num]: resultData,
    });

    setActiveWinner({ num, ...resultData });

    if (randStudent && reward.points > 0 && onAwardStudent) {
      onAwardStudent(randStudent.id, reward.points);
    }
  };

  const handleReset = () => {
    playClick();
    setOpenedPouches({});
    setActiveWinner(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto">
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
              <p className="text-xs text-pink-300/70 font-semibold mt-0.5">
                Xé túi bí mật nhận phần thưởng sao may mắn bất ngờ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-xl bg-pink-950/80 hover:bg-pink-900 border border-pink-700/60 text-pink-200 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt Lại 32 Túi</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="p-1.5 text-pink-400 hover:text-white rounded-xl hover:bg-pink-950 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* LƯỚI 32 TÚI QUÀ */}
        <div className="flex-1 bg-black/30 rounded-3xl border border-pink-900/40 p-4 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 sm:gap-3.5">
            {Array.from({ length: 32 }, (_, i) => i + 1).map((num) => {
              const isOpened = Boolean(openedPouches[num]);
              const data = openedPouches[num];

              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleOpenPouch(num)}
                  className={`group relative p-3 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 transform hover:scale-108 active:scale-95 cursor-pointer shadow-md min-h-[78px] ${
                    isOpened
                      ? 'bg-pink-950/50 border-pink-800 text-pink-400/60'
                      : 'bg-gradient-to-b from-pink-600 via-rose-600 to-pink-700 border-pink-300 text-white shadow-pink-900/60 ring-2 ring-pink-400/40 hover:from-pink-500 hover:to-rose-500'
                  }`}
                >
                  <Gift
                    className={`w-6 h-6 transition-transform ${
                      isOpened ? 'opacity-40' : 'group-hover:rotate-12'
                    }`}
                  />
                  <span className="text-xs font-black mt-1 font-mono">#{num}</span>

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

        {/* MODAL KẾT QUẢ MỞ TÚI MÙ */}
        {activeWinner && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-scale-up">
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
