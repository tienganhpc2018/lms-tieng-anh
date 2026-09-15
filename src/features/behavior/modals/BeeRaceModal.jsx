import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Trophy, Volume2, Settings, Flame, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playTick } from '../../../utils/soundEffects';

const RACER_TYPES = [
  { id: 'duck', label: 'Vịt Vàng', icon: '🐥', color: 'bg-amber-400 text-slate-950' },
  { id: 'fish', label: 'Đàn Cá', icon: '🐟', color: 'bg-blue-500 text-white' },
  { id: 'shrimp', label: 'Tôm Búng', icon: '🦐', color: 'bg-rose-500 text-white' },
  { id: 'squid', label: 'Mực Ống', icon: '🦑', color: 'bg-fuchsia-500 text-white' },
  { id: 'crab', label: 'Cua Biển', icon: '🦀', color: 'bg-red-500 text-white' },
];

export default function BeeRaceModal({ isOpen, onClose, students, onAwardStudent }) {
  const [selectedRacer, setSelectedRacer] = useState('duck');
  const [duration, setDuration] = useState(15); // 15 giây
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [racerPositions, setRacerPositions] = useState({}); // { studentId: progress (0 to 100) }
  const [rankings, setRankings] = useState([]); // Top 3
  const [showRankModal, setShowRankModal] = useState(false);

  const eligibleStudents = students.filter((s) => s.status === 'Present');
  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);

  // Khởi tạo vị trí vạch xuất phát
  const resetRace = () => {
    playClick();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    setTimeLeft(duration);
    const initialPos = {};
    eligibleStudents.forEach((st) => {
      initialPos[st.id] = 0;
    });
    setRacerPositions(initialPos);
    setRankings([]);
    setShowRankModal(false);
  };

  useEffect(() => {
    if (isOpen) {
      resetRace();
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    }
  }, [isOpen, duration]);

  const startRace = () => {
    if (eligibleStudents.length === 0) {
      alert('Không có học sinh nào đang có mặt để đua!');
      return;
    }

    playClick();
    setIsRunning(true);
    setRankings([]);
    setShowRankModal(false);
    setTimeLeft(duration);

    // Tạo tốc độ ngẫu nhiên cho từng bạn
    const speeds = {};
    eligibleStudents.forEach((st) => {
      speeds[st.id] = 0.85 + Math.random() * 0.35; // base speed
    });

    startTimeRef.current = performance.now();
    const durationMs = duration * 1000;

    let lastTickTime = duration;

    const step = (now) => {
      const elapsed = now - startTimeRef.current;
      const progressRatio = Math.min(1, elapsed / durationMs);
      const curSecondsLeft = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setTimeLeft(curSecondsLeft);

      if (curSecondsLeft !== lastTickTime && curSecondsLeft > 0) {
        lastTickTime = curSecondsLeft;
        playTick();
      }

      // Cập nhật vị trí các thí sinh với gia số ngẫu nhiên từng frame
      const newPositions = {};
      const currentStandings = [];

      eligibleStudents.forEach((st) => {
        // Tốc độ biến thiên ngẫu nhiên theo nhịp
        const jitter = Math.sin(now / 200 + st.id.charCodeAt(st.id.length - 1)) * 0.15;
        const currentSpeed = speeds[st.id] + jitter;
        const pos = Math.min(92, progressRatio * 92 * currentSpeed);
        newPositions[st.id] = pos;
        currentStandings.push({ student: st, pos });
      });

      setRacerPositions(newPositions);

      if (progressRatio < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // KẾT THÚC ĐUA!
        setIsRunning(false);
        playWinner();
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
        });

        // Sắp xếp thứ hạng
        currentStandings.sort((a, b) => b.pos - a.pos);
        const top3 = currentStandings.slice(0, 3).map((item) => item.student);
        setRankings(top3);
        setShowRankModal(true);

        // Tự động thưởng sao cho top 1, 2, 3
        if (onAwardStudent && top3[0]) onAwardStudent(top3[0].id, 3);
        if (onAwardStudent && top3[1]) onAwardStudent(top3[1].id, 2);
        if (onAwardStudent && top3[2]) onAwardStudent(top3[2].id, 1);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  if (!isOpen) return null;

  const curRacerMeta = RACER_TYPES.find((r) => r.id === selectedRacer) || RACER_TYPES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0b1b36] border-2 border-indigo-500/50 rounded-[2.5rem] w-full max-w-6xl shadow-2xl p-5 sm:p-7 space-y-4 my-auto text-white flex flex-col max-h-[95vh]">
        {/* HEADER ĐUA VỊT SLIDER (CHUẨN ẢNH 3) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-indigo-900/80 pb-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                const nextDur = duration === 15 ? 20 : duration === 20 ? 30 : 15;
                setDuration(nextDur);
                setTimeLeft(nextDur);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition cursor-pointer"
              title={`Đổi thời gian đua: Hiện tại ${duration}s`}
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={startRace}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>START</span>
            </button>

            <button
              type="button"
              onClick={resetRace}
              disabled={isRunning}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>
          </div>

          {/* ĐỒNG HỒ ĐẾM NGƯỢC GIỮA (00:00:15) */}
          <div className="bg-white text-slate-950 font-mono font-black text-2xl sm:text-3xl px-6 py-1.5 rounded-2xl shadow-inner border border-slate-300">
            00:00:{String(timeLeft).padStart(2, '0')}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
            >
              <Trophy className="w-4 h-4" />
              <span>THỨ HẠNG</span>
            </button>

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
        </div>

        {/* HÀNG CHỌN LOÀI VẬT ĐUA */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-bold text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Loài vật đua:</span>
            {RACER_TYPES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRacer(r.id)}
                className={`px-3 py-1 rounded-xl font-black text-xs transition cursor-pointer flex items-center space-x-1 ${
                  selectedRacer === r.id
                    ? r.color + ' shadow-md scale-105 ring-2 ring-white/40'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>{r.icon}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>

          <span className="text-slate-400 font-bold">
            Sĩ số: <strong className="text-amber-400">{eligibleStudents.length} thí sinh</strong>
          </span>
        </div>

        {/* ĐƯỜNG ĐUA BƠI XANH DƯƠNG (CHUẨN ẢNH 3) */}
        <div className="flex-1 bg-[#1a4b8c] rounded-3xl border-2 border-indigo-500/60 overflow-hidden relative min-h-[380px] max-h-[58vh] flex flex-col shadow-inner">
          {/* BỜ CỎ XANH TRÊN CÙNG */}
          <div className="h-6 bg-[#2e8540] border-b-2 border-amber-800 flex items-center justify-around px-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-6 h-2 bg-[#1b5e20] rounded-full opacity-60" />
            ))}
          </div>

          {/* MẶT NƯỚC VỚI CÁC GỢN SÓNG VÀ VẠCH XUẤT PHÁT CARÔ */}
          <div className="flex-1 relative overflow-y-auto p-2">
            {/* VẠCH XUẤT PHÁT CARÔ ĐEN TRẮNG BÊN TRÁI */}
            <div
              className="absolute left-10 top-0 bottom-0 w-5 bg-repeat-y z-0 opacity-80"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000 0, #000 6px, #fff 6px, #fff 12px)',
              }}
            />

            {/* VẠCH ĐÍCH CỜ CARÔ BÊN PHẢI */}
            <div
              className="absolute right-6 top-0 bottom-0 w-6 bg-repeat-y z-0 opacity-90 border-l-2 border-amber-400"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, #000 0, #000 8px, #fff 8px, #fff 16px)',
              }}
            />

            {/* DANH SÁCH THÍ SINH ĐUA */}
            <div className="relative z-10 space-y-1.5 py-1">
              {eligibleStudents.map((st, idx) => {
                const pos = racerPositions[st.id] || 0;
                return (
                  <div
                    key={st.id}
                    className="relative h-7 flex items-center border-b border-blue-400/20"
                  >
                    {/* ICON THÍ SINH ĐANG CHẠY */}
                    <div
                      className="absolute transition-all duration-75 flex items-center space-x-1 z-20"
                      style={{ left: `${pos}%` }}
                    >
                      <div className="w-7 h-7 rounded-full bg-white/90 shadow-md border border-amber-400 flex items-center justify-center text-base transform hover:scale-125 transition">
                        {curRacerMeta.icon}
                      </div>

                      {/* NHÃN TÊN THÍ SINH */}
                      <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/75 text-white whitespace-nowrap shadow-sm">
                        {st.full_name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BẢNG XẾP HẠNG TOP 3 THẮNG CUỘC */}
        {showRankModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1 rounded-[2.5rem] shadow-2xl max-w-md w-full">
              <div className="bg-gradient-to-b from-[#0f1d38] to-[#081020] rounded-[2.3rem] p-6 text-center space-y-4 text-white">
                <span className="text-4xl animate-bounce inline-block">🏆 🌟 🏆</span>
                <h3 className="text-xl font-black text-amber-300 uppercase tracking-wider">
                  BẢNG VÀNG THẮNG CUỘC
                </h3>

                <div className="space-y-2 pt-1">
                  {rankings.map((st, idx) => (
                    <div
                      key={st.id}
                      className={`p-3 rounded-2xl flex items-center justify-between border ${
                        idx === 0
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                          : idx === 1
                          ? 'bg-slate-300/20 border-slate-300 text-slate-200'
                          : 'bg-orange-500/20 border-orange-400 text-orange-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                        </span>
                        <div className="text-left">
                          <h4 className="text-sm font-black text-white">{st.full_name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {st.code} • Tổ {st.team_group}
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-black text-amber-300 bg-black/50 px-2.5 py-1 rounded-xl">
                        +{3 - idx} ⭐
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowRankModal(false)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer hover:from-amber-300 hover:to-amber-400"
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
