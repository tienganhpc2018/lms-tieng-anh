import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Trophy, Volume2, VolumeX, Settings, Shuffle, Award, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playTick, playQuack, playRaceHorn } from '../../../utils/soundEffects';

// Danh sách các loại mũ/phụ kiện ngộ nghĩnh cho vịt chuẩn ảnh 3 & 4
const DUCK_HATS = [
  { name: 'builder', icon: '👷', label: 'Thợ xây', color: '#f59e0b' },
  { name: 'police', icon: '👮', label: 'Cảnh sát', color: '#1e3a8a' },
  { name: 'doctor', icon: '👨‍⚕️', label: 'Bác sĩ', color: '#0284c7' },
  { name: 'detective', icon: '🕵️', label: 'Thám tử', color: '#78350f' },
  { name: 'chef', icon: '👨‍🍳', label: 'Đầu bếp', color: '#e2e8f0' },
  { name: 'party', icon: '🥳', label: 'Sinh nhật', color: '#ec4899' },
  { name: 'graduate', icon: '🎓', label: 'Cử nhân', color: '#475569' },
  { name: 'pirate', icon: '🏴‍☠️', label: 'Cướp biển', color: '#0f172a' },
  { name: 'straw', icon: '🤠', label: 'Cao bồi', color: '#d97706' },
  { name: 'strawberry', icon: '🍓', label: 'Dâu tây', color: '#ef4444' },
  { name: 'bunny', icon: '🐰', label: 'Tai thỏ', color: '#f472b6' },
  { name: 'crown', icon: '👑', label: 'Vương miện', color: '#eab308' },
];

export default function BeeRaceModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [duration, setDuration] = useState(10); // 10s mặc định chuẩn ảnh 3
  const [timeLeft, setTimeLeft] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [duckPositions, setDuckPositions] = useState({}); // { studentId: { xPercent, yOffset, speed, hatIndex } }
  const [rankings, setRankings] = useState([]);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Đảm bảo lấy danh sách học sinh (ưu tiên học sinh có mặt, nếu chưa điểm danh lấy toàn bộ)
  const presentStudents = students.filter((s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm');
  const racerStudents = presentStudents.length > 0 ? presentStudents : students;

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const duckConfigRef = useRef({});

  // Khởi tạo vị trí đàn vịt xếp hàng chéo tại vạch xuất phát (chuẩn ảnh 3)
  const initDuckPositions = (shuffleOrder = false) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;
    setRankings([]);
    setShowRankModal(false);

    const count = racerStudents.length;
    if (count === 0) return;

    let orderedStudents = [...racerStudents];
    if (shuffleOrder) {
      orderedStudents.sort(() => Math.random() - 0.5);
    }

    // Bốc thăm thứ hạng đích để cuộc đua kết thúc với khoảng cách rõ ràng, không đè lên nhau
    const targetRanks = orderedStudents.map((_, i) => i + 1).sort(() => Math.random() - 0.5);

    const newPositions = {};
    const configs = {};

    orderedStudents.forEach((st, idx) => {
      // Phân bổ toạ độ Y dọc theo chiều cao mặt sông (12% đến 86%)
      const yStep = count > 1 ? (76 / (count - 1)) : 0;
      const baseY = 12 + idx * yStep;

      // Xếp hàng chéo theo vạch xuất phát nghiêng 22 độ
      const slopeOffsetX = (idx / Math.max(1, count)) * 6.0; 
      const startX = 3.5 + slopeOffsetX; // Bắt đầu ở khoảng 3.5% - 9.5%

      const targetRank = targetRanks[idx];
      const hatIndex = (idx * 3 + 5) % DUCK_HATS.length;

      configs[st.id] = {
        targetRank,
        burstTime: 0.35 + Math.random() * 0.4, // thời điểm bứt tốc giữa chặng
        hatIndex,
        wobbleFreq: 1.8 + Math.random() * 2.0,
        wobbleAmp: 1.2 + Math.random() * 1.5,
        startY: baseY,
        startX,
      };

      newPositions[st.id] = {
        x: startX,
        y: baseY,
        hatIndex,
        isFinished: false,
      };
    });

    duckConfigRef.current = configs;
    setDuckPositions(newPositions);
  };

  useEffect(() => {
    if (isOpen) {
      initDuckPositions(false);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [isOpen, duration, students.length]);

  // Bắt đầu / Tiếp tục cuộc đua
  const handleStartOrContinue = () => {
    if (racerStudents.length === 0) {
      alert('Chưa có học sinh nào trong lớp để tham gia đua vịt!');
      return;
    }

    if (isPaused) {
      // Tiếp tục từ lúc tạm dừng
      if (soundEnabled) playClick();
      setIsPaused(false);
      setIsRunning(true);
      startTimeRef.current = performance.now() - pausedElapsedRef.current;
      runAnimationLoop();
      return;
    }

    if (soundEnabled) {
      playRaceHorn();
      setTimeout(playQuack, 180);
    }

    setIsRunning(true);
    setIsPaused(false);
    setRankings([]);
    setShowRankModal(false);
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;

    startTimeRef.current = performance.now();
    runAnimationLoop();
  };

  // Tạm dừng
  const handlePause = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (soundEnabled) playClick();
    setIsRunning(false);
    setIsPaused(true);
  };

  // Thiết lập lại từ đầu (Clear)
  const handleClear = () => {
    if (soundEnabled) playClick();
    initDuckPositions(false);
  };

  // Xáo trộn vị trí vịt (Shuffle)
  const handleShuffle = () => {
    if (isRunning) return;
    if (soundEnabled) {
      playClick();
      playQuack();
    }
    initDuckPositions(true);
  };

  // Vòng lặp chuyển động mượt mà của đàn vịt (Animation Loop)
  const runAnimationLoop = () => {
    const durationMs = duration * 1000;
    const finishLineX = 80; // Vạch đích carô nằm ở vị trí 80% chiều ngang
    let lastSecond = Math.ceil((durationMs - pausedElapsedRef.current) / 1000);

    const step = (now) => {
      const elapsed = (now - startTimeRef.current);
      pausedElapsedRef.current = elapsed;
      const progress = Math.min(1, elapsed / durationMs);

      // Đếm ngược đồng hồ LED
      const secondsRemaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      setTimeLeft(secondsRemaining);

      if (secondsRemaining !== lastSecond && secondsRemaining > 0) {
        lastSecond = secondsRemaining;
        if (soundEnabled) playTick();
        if (secondsRemaining === 3 && soundEnabled) playQuack();
      }

      const updated = {};
      const standings = [];

      racerStudents.forEach((st, idx) => {
        const cfg = duckConfigRef.current[st.id] || {
          startX: 5,
          startY: 20,
          targetRank: idx + 1,
          burstTime: 0.5,
          hatIndex: 0,
          wobbleFreq: 2.5,
          wobbleAmp: 1.5,
        };

        let currentX = cfg.startX;

        // VỊ TRÍ ĐÍCH CUỐI CÙNG KHI KẾT THÚC (progress = 1.0)
        let finalTargetX = finishLineX - 4.5 - Math.min(22, (cfg.targetRank - 4) * 1.8);
        if (cfg.targetRank === 1) finalTargetX = finishLineX + 3.8; // Quán quân: vọt qua vạch đích
        else if (cfg.targetRank === 2) finalTargetX = finishLineX - 0.6; // Á quân: sát mép vạch đích
        else if (cfg.targetRank === 3) finalTargetX = finishLineX - 2.6; // Quý quân: bám sát nút

        // GIAI ĐOẠN 1: BƠI SO KÈ GIẰNG CO (0% -> 92% thời gian)
        // Đảm bảo TUYỆT ĐỐI KHÔNG CHÚ VỊT NÀO ĐƯỢC CHẠM VẠCH ĐÍCH TRƯỚC HẾT GIỜ
        if (progress < 0.92) {
          const stageP = progress / 0.92;
          const maxDistanceBeforeFinish = (finishLineX - 4.5) - cfg.startX;
          
          // Dao động sóng sin rượt đuổi, thay đổi thứ hạng liên tục tạo kịch tính
          const raceWobble = Math.sin((now / 380) * cfg.wobbleFreq + idx * 1.9) * 3.8;
          let burstBonus = 0;
          if (progress > cfg.burstTime && progress < cfg.burstTime + 0.28) {
            burstBonus = 3.2; // Cú bứt tốc ngoạn mục
          }

          const rawX = cfg.startX + (maxDistanceBeforeFinish * stageP) + raceWobble + burstBonus;
          
          // CLAMP CỨNG: Không con nào được vượt quá (finishLineX - 4.2%)
          currentX = Math.max(cfg.startX, Math.min(finishLineX - 4.2, rawX));
        } 
        // GIAI ĐOẠN 2: NƯỚC RÚT VỀ ĐÍCH (92% -> 100% thời gian - giây cuối cùng)
        else {
          const sprintP = (progress - 0.92) / 0.08; // chạy từ 0 đến 1
          const preSprintX = finishLineX - 4.5 - Math.min(18, (cfg.targetRank - 1) * 1.2);
          
          const interpolatedX = (1 - sprintP) * preSprintX + sprintP * finalTargetX;

          // Chỉ cho phép chú vịt số 1 vượt qua vạch đích khi thời gian chạm mốc 00:00:00 (progress >= 0.985)
          if (progress < 0.985) {
            currentX = Math.min(finishLineX - 0.5, interpolatedX);
          } else {
            currentX = interpolatedX;
          }
        }

        // Tọa độ Y: dao động nhấp nhô theo sóng nước sông
        const waveY = cfg.startY + Math.sin(now / 180 * cfg.wobbleFreq + idx) * cfg.wobbleAmp;

        updated[st.id] = {
          x: currentX,
          y: waveY,
          hatIndex: cfg.hatIndex,
          isFinished: currentX >= finishLineX,
        };

        standings.push({ student: st, x: currentX, targetRank: cfg.targetRank });
      });

      setDuckPositions(updated);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // ĐÃ CÁN ĐÍCH HOÀN TẤT CUỘC ĐUA ĐÚNG KHOẢNH KHẮC 00:00:00!
        setIsRunning(false);
        setIsPaused(false);
        if (soundEnabled) {
          playWinner();
          setTimeout(playQuack, 600);
        }
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.55 },
        });

        // Sắp xếp tìm Top 3 theo đúng kết quả cán đích
        standings.sort((a, b) => a.targetRank - b.targetRank);
        const top3 = standings.slice(0, 3).map((item) => item.student);
        setRankings(top3);
        setShowRankModal(true);

        // Thưởng sao cho học sinh vô địch
        if (onAwardStudent && top3[0]) onAwardStudent(top3[0].id, 3);
        if (onAwardStudent && top3[1]) onAwardStudent(top3[1].id, 2);
        if (onAwardStudent && top3[2]) onAwardStudent(top3[2].id, 1);
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-hidden select-none">
      <div className="bg-[#24941e] border-4 border-slate-900 rounded-[2rem] w-full max-w-6xl shadow-2xl flex flex-col h-[94vh] max-h-[820px] overflow-hidden relative">
        
        {/* =================================================================== */}
        {/* 1. KHU VỰC BỜ CỎ XANH & BẢNG ĐIỀU KHIỂN CHUẨN ẢNH 3 & 4 */}
        {/* =================================================================== */}
        <div className="bg-[#2eb124] px-4 py-3 border-b-4 border-[#683f1c] relative z-20 flex flex-wrap items-center justify-between gap-3 shadow-md">
          {/* CÁC BỤI CÂY NỀN TRÒN XANH ĐẬM TRANG TRÍ */}
          <div className="absolute left-32 -top-2 w-14 h-14 bg-[#1f7e17] rounded-full pointer-events-none opacity-80" />
          <div className="absolute right-40 -top-1 w-16 h-16 bg-[#1f7e17] rounded-full pointer-events-none opacity-80" />

          {/* GÓC TRÁI: CÁC NÚT ICON & NÚT START/CLEAR CHUẨN ẢNH 3 */}
          <div className="flex items-center space-x-3 relative z-10">
            {/* CỤM NÚT ĐIỀU KHIỂN ĐEN VUÔNG */}
            <div className="bg-black/90 p-1 rounded-xl flex items-center space-x-1 shadow-md border border-white/20">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-white hover:text-amber-300 hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Cài đặt thời gian đua"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 text-white hover:text-amber-300 hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Bật/Tắt âm thanh"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-rose-400" />}
              </button>
            </div>

            {/* CHỮ START / CONTINUE / PAUSE VÀ CLEAR TRẮNG CHUẨN ẢNH 3 */}
            <div className="flex items-center space-x-2">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartOrContinue}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md border-2 border-emerald-300 transition cursor-pointer flex items-center space-x-1 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{isPaused ? 'Continue' : 'Start'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-md border-2 border-amber-200 transition cursor-pointer flex items-center space-x-1 active:scale-95"
                >
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pause</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl shadow-md border border-white/20 transition cursor-pointer flex items-center space-x-1 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Clear</span>
              </button>

              <button
                type="button"
                onClick={handleShuffle}
                disabled={isRunning}
                className="px-3 py-2 bg-[#1b5e20] hover:bg-[#2e7d32] disabled:opacity-40 text-amber-200 font-bold text-xs rounded-xl shadow-sm border border-amber-400/40 transition cursor-pointer flex items-center space-x-1"
                title="Xáo trộn lại vị trí đàn vịt ở vạch xuất phát"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* CHÍNH GIỮA: ĐỒNG HỒ ĐẾM NGƯỢC SIÊU TO KHỔNG LỒ CHUẨN ẢNH 3 & 4 */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="bg-[#e2e8f8] border-[3.5px] border-slate-900 rounded-2xl px-6 sm:px-10 py-1 shadow-2xl flex items-center justify-center">
              <span className="font-mono font-black text-3xl sm:text-4xl tracking-widest text-slate-950 drop-shadow-xs">
                00:00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* GÓC PHẢI: LOGO ONLINE-STOPWATCH & NÚT BẢNG VÀNG & ĐÓNG */}
          <div className="flex items-center space-x-2 relative z-10">
            <div className="hidden lg:flex items-center space-x-1 bg-black/60 px-3 py-1.5 rounded-xl border border-white/20 text-white text-[11px] font-bold">
              <span>🦆</span>
              <span>Đua Vịt LMS Tiếng Anh</span>
              <span className="text-amber-400">({racerStudents.length} HS)</span>
            </div>

            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-amber-500"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>Thứ Hạng</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white hover:bg-black/40 rounded-xl transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* POPOVER CÀI ĐẶT THỜI GIAN ĐUA */}
        {showSettings && (
          <div className="absolute top-16 left-4 z-50 bg-slate-900 border-2 border-amber-400 p-3.5 rounded-2xl text-white shadow-2xl space-y-2 animate-fade-in w-64">
            <span className="text-xs font-black text-amber-300 block uppercase">Chọn thời gian đua:</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { s: 6, label: '6 Giây (Siêu tốc)' },
                { s: 10, label: '10 Giây (Chuẩn)' },
                { s: 15, label: '15 Giây (Hào hứng)' },
                { s: 20, label: '20 Giây (Gay cấn)' },
                { s: 30, label: '30 Giây (Nghẹt thở)' },
              ].map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => {
                    setDuration(item.s);
                    setTimeLeft(item.s);
                    setShowSettings(false);
                    initDuckPositions(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    duration === item.s ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. DÒNG SÔNG NƯỚC THẬT SỐNG ĐỘNG (RIVER WATER - CHUẨN ẢNH 3 & 4) */}
        {/* =================================================================== */}
        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-[#2b6d8e] via-[#246282] to-[#1c506d] select-none">
          
          {/* CÁC LỚP SÓNG NƯỚC UỐN LƯỢN CHUYỂN ĐỘNG THẬT */}
          <div 
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.18) 0%, transparent 60%)',
              backgroundSize: '80px 40px',
            }}
          />
          
          {/* DẢI SÓNG NƯỚC CHẢY NGANG CHÂN THỰC */}
          <div 
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.2) 19px, transparent 20px)`,
            }}
          />

          {/* VẠCH XUẤT PHÁT CARÔ CHÉO BÊN TRÁI (CHUẨN ẢNH 3) */}
          <div
            className="absolute left-4 top-0 bottom-0 w-8 z-10 opacity-70 transform -skew-x-[22deg] origin-top border-r-2 border-black/40 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, #fff 8px, #fff 16px)',
            }}
          />

          {/* VẠCH ĐÍCH CARÔ CHÉO BÊN PHẢI (FINISH LINE - CHUẨN ẢNH 3 & 4) */}
          <div
            className="absolute top-0 bottom-0 w-12 z-10 shadow-2xl transform -skew-x-[24deg] origin-top border-x-4 border-slate-950 pointer-events-none"
            style={{
              left: '80%',
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 10px, #fff 10px, #fff 20px)',
            }}
          >
            <div className="absolute -top-1 -right-3 bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 rounded shadow-md uppercase tracking-widest transform skew-x-[24deg]">
              ĐÍCH
            </div>
          </div>

          {/* =================================================================== */}
          {/* 3. TẤT CẢ ĐÀN VỊT VÀNG TRONG 1 KHUNG HÌNH (NO SCROLL - CHUẨN ẢNH 3 & 4) */}
          {/* =================================================================== */}
          <div className="absolute inset-0">
            {racerStudents.map((st, idx) => {
              const pos = duckPositions[st.id] || { x: 5, y: 15 + idx * 2, hatIndex: 0 };
              const hat = DUCK_HATS[pos.hatIndex % DUCK_HATS.length];
              const studentNumber = idx + 1;

              return (
                <div
                  key={st.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 cursor-pointer group"
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    zIndex: Math.floor(pos.y * 10), // Vịt ở dưới sông nổi đè lên vịt ở trên bờ tự nhiên
                  }}
                  title={`#${studentNumber} - ${st.full_name}`}
                >
                  {/* BỌT NƯỚC RIPPLE DƯỚI BỤNG VỊT KHI ĐANG BƠI */}
                  <div className={`absolute -bottom-1 -left-2 w-12 h-3.5 bg-cyan-200/40 rounded-full blur-2xs ${isRunning ? 'animate-pulse' : ''}`} />

                  {/* THÂN CHÚ VỊT VÀNG CAO SU (SVG CHUẨN ẢNH 3 & 4) */}
                  <div className="relative w-12 h-11 sm:w-14 sm:h-13 flex-shrink-0 filter drop-shadow-md transform hover:scale-115 transition">
                    <svg viewBox="0 0 100 90" className="w-full h-full">
                      {/* Thân vịt vàng phao tròn */}
                      <path
                        d="M20,60 C20,40 35,35 55,42 C68,46 80,48 88,58 C96,68 85,82 60,82 C35,82 20,78 20,60 Z"
                        fill="#ffcc00"
                        stroke="#b8860b"
                        strokeWidth="3"
                      />
                      {/* Đầu vịt & cổ */}
                      <path
                        d="M58,45 C58,35 62,20 75,20 C88,20 92,34 88,44 C82,54 68,54 58,45 Z"
                        fill="#ffd700"
                        stroke="#b8860b"
                        strokeWidth="3"
                      />
                      {/* Mỏ cam dài chúm chím */}
                      <path
                        d="M84,32 C94,30 100,34 98,39 C92,44 85,41 84,32 Z"
                        fill="#ff6600"
                        stroke="#cc3300"
                        strokeWidth="2"
                      />
                      {/* Mắt đen to tròn lay láy */}
                      <circle cx="78" cy="27" r="4.5" fill="#111" />
                      <circle cx="79.5" cy="25.5" r="1.5" fill="#fff" />
                      {/* Cánh vịt vàng */}
                      <path
                        d="M35,62 C40,54 55,54 62,62 C60,70 45,74 35,62 Z"
                        fill="#ffb700"
                        stroke="#b8860b"
                        strokeWidth="2"
                      />
                      {/* KHUNG BIỂN SỐ TRÊN MÔNG VỊT CHUẨN ẢNH 3 & 4 */}
                      <rect
                        x="24"
                        y="52"
                        width="24"
                        height="18"
                        rx="5"
                        fill="#ffffff"
                        stroke="#111111"
                        strokeWidth="2"
                      />
                    </svg>

                    {/* SỐ THỨ TỰ HỌC SINH IN TO RÕ TRÊN MÔNG VỊT (1, 2, 3...) */}
                    <div className="absolute top-[48%] left-[23%] w-6 h-5 flex items-center justify-center font-black text-[11px] sm:text-xs text-black font-sans pointer-events-none">
                      {studentNumber}
                    </div>

                    {/* MŨ / PHỤ KIỆN HÀI HƯỚC TRÊN ĐẦU VỊT CHUẨN ẢNH 4 */}
                    <div className="absolute -top-3 right-0 text-base sm:text-lg transform rotate-6 pointer-events-none filter drop-shadow-xs">
                      {hat.icon}
                    </div>

                    {/* NHÃN TÊN HỌC SINH MINI NỔI PHÍA TRÊN */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition whitespace-nowrap bg-black/85 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-md border border-amber-300 z-30 pointer-events-none">
                      #{studentNumber} {st.full_name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DÒNG HƯỚNG DẪN DƯỚI ĐÁY SÔNG */}
          <div className="absolute bottom-2 left-6 z-20 text-[11px] font-bold text-cyan-200/70 bg-black/30 px-3 py-1 rounded-full backdrop-blur-xs">
            💡 Mỗi chú vịt mang số thứ tự tương ứng học sinh trong lớp • Bấm START để bắt đầu bơi thi kịch tính!
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. MODAL BẢNG VÀNG THẮNG CUỘC TOP 3 (KHI CÁN ĐÍCH) */}
        {/* =================================================================== */}
        {showRankModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 p-1.5 rounded-[2.5rem] shadow-2xl max-w-md w-full border-4 border-amber-200">
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#060e1d] rounded-[2.2rem] p-6 text-center space-y-4 text-white">
                <span className="text-5xl animate-bounce inline-block">🏆 🦆 🏆</span>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wider drop-shadow-md">
                    BẢNG VÀNG VÔ ĐỊCH
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Tuyên dương những chú vịt bơi nhanh nhất chặng đua!
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {rankings.map((st, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const titles = ['QUÁN QUÂN (+3 ⭐)', 'Á QUÂN (+2 ⭐)', 'QUÝ QUÂN (+1 ⭐)'];
                    const borders = ['border-amber-400 bg-amber-500/15', 'border-slate-300 bg-slate-400/15', 'border-amber-700 bg-amber-800/15'];
                    const stIdx = racerStudents.findIndex((s) => s.id === st.id) + 1;

                    return (
                      <div
                        key={st.id}
                        className={`p-3 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-md ${borders[idx] || 'border-slate-700'}`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-3xl flex-shrink-0">{medals[idx]}</span>
                          <div className="text-left min-w-0">
                            <span className="text-sm font-black text-white block truncate">
                              #{stIdx}. {st.full_name}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300 block uppercase">
                              {titles[idx]}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              playWinner();
                              if (onAwardStudent) onAwardStudent(st.id, 3 - idx);
                            }}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-sm transition cursor-pointer flex items-center space-x-1"
                          >
                            <Award className="w-3.5 h-3.5 fill-slate-950" />
                            <span>Thưởng</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRankModal(false);
                      handleClear();
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Đua Lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRankModal(false)}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
