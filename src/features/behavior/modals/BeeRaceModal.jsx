import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Trophy, Volume2, VolumeX, Settings, Shuffle, RefreshCw, UserCheck, ListOrdered } from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  playClick, 
  playWinner, 
  playTick, 
  playQuack, 
  playRaceHorn, 
  playTripleQuack, 
  startRiverWaterSound, 
  stopRiverWaterSound 
} from '../../../utils/soundEffects';

// Danh sách các loài linh vật đua nước chuẩn theo thanh subheader ảnh mẫu
const RACER_ANIMALS = [
  { id: 'duck', name: 'Vịt Vàng', icon: '🐥', label: 'Vịt Vàng' },
  { id: 'fish', name: 'Đàn Cá', icon: '🐟', label: 'Đàn Cá' },
  { id: 'shrimp', name: 'Tôm Búng', icon: '🦐', label: 'Tôm Búng' },
  { id: 'squid', name: 'Mực Ống', icon: '🦑', label: 'Mực Ống' },
  { id: 'crab', name: 'Cua Biển', icon: '🦀', label: 'Cua Biển' },
];

// Thuật toán xáo trộn Fisher-Yates chuẩn xác 100% ngẫu nhiên toán học
function fisherYatesShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export default function BeeRaceModal({ isOpen, onClose, students = [] }) {
  const [duration, setDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false); // Trạng thái về đích (chuẩn ảnh mẫu)
  const [winnerStudent, setWinnerStudent] = useState(null); // Học sinh thắng cuộc
  const [winnerNumber, setWinnerNumber] = useState(1); // Số áo học sinh thắng cuộc
  const [selectedAnimal, setSelectedAnimal] = useState('duck'); // Mặc định Vịt Vàng
  const [removeWinnerNextRace, setRemoveWinnerNextRace] = useState(true); // Loại người thắng ở vòng sau
  const [excludedIds, setExcludedIds] = useState([]); // Danh sách học sinh đã được gọi
  const [showFinishLine, setShowFinishLine] = useState(false); // VẠCH ĐÍCH CHỈ HIỆN KHI CÒN 4 GIÂY CUỐI!

  // Lọc học sinh có mặt và chưa bị loại trừ
  const presentStudents = students.filter((s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm');
  const baseStudents = presentStudents.length > 0 ? presentStudents : students;
  const activeStudents = baseStudents.filter((s) => !excludedIds.includes(s.id));
  const racerStudents = activeStudents.length > 0 ? activeStudents : baseStudents;

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const duckConfigRef = useRef({});
  const duckDomRefs = useRef({});

  // Vạch đích xuất hiện ở 80% phía trước đàn vịt khi còn 4 giây cuối
  const FINISH_LINE_X = 80.0;

  // Lấy số áo chuẩn theo danh sách lớp để học sinh luôn nhận diện đúng số của mình
  const getStudentNumber = (student) => {
    const originalIndex = students.findIndex((s) => s.id === student?.id);
    return originalIndex >= 0 ? originalIndex + 1 : 1;
  };

  // Tính toán scale kích thước con vật để vừa vặn trong 1 màn hình
  const studentCount = racerStudents.length;
  let animalScale = 1.0;
  let animalWidth = 'w-14 h-12';
  let numberFontSize = 'text-xs';
  if (studentCount > 35) {
    animalScale = 0.68;
    animalWidth = 'w-10 h-8';
    numberFontSize = 'text-[9px]';
  } else if (studentCount > 25) {
    animalScale = 0.82;
    animalWidth = 'w-12 h-10';
    numberFontSize = 'text-[10px]';
  } else if (studentCount > 15) {
    animalScale = 0.92;
    animalWidth = 'w-13 h-11';
    numberFontSize = 'text-[11px]';
  }

  // Khởi tạo vị trí đàn thú đua tại vạch xuất phát
  const initDuckPositions = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stopRiverWaterSound();
    setIsRunning(false);
    setIsPaused(false);
    setRaceFinished(false);
    setShowFinishLine(false); // Ẩn vạch đích lúc đầu
    setWinnerStudent(null);
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;
    setShowRankModal(false);

    const count = racerStudents.length;
    if (count === 0) return;

    const START_X = 4.0;

    racerStudents.forEach((st, idx) => {
      const yStep = count > 1 ? (76 / (count - 1)) : 0;
      const baseY = 14 + idx * yStep;

      const domEl = duckDomRefs.current[st.id];
      if (domEl) {
        domEl.style.left = `${START_X}%`;
        domEl.style.top = `${baseY}%`;
        domEl.style.transform = `translate(-50%, -50%) scale(${animalScale})`;
      }
    });
  };

  // Re-init khi mở modal hoặc thay đổi thời gian/số lượng học sinh
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        initDuckPositions();
      }, 30);
      return () => clearTimeout(timer);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopRiverWaterSound();
      setIsRunning(false);
      setIsPaused(false);
    }
    return () => {
      stopRiverWaterSound();
    };
  }, [isOpen, duration, racerStudents.length]);

  // Bắt đầu / Tiếp tục cuộc đua
  const handleStartOrContinue = () => {
    const count = racerStudents.length;
    if (count === 0) {
      alert('Chưa có học sinh nào trong danh sách tham gia!');
      return;
    }

    if (isPaused) {
      if (soundEnabled) {
        playClick();
        startRiverWaterSound();
      }
      setIsPaused(false);
      setIsRunning(true);
      startTimeRef.current = performance.now() - pausedElapsedRef.current;
      runAnimationLoop();
      return;
    }

    // Xáo trộn ngẫu nhiên Fisher-Yates: Học sinh thứ nhất (index 0) LÀ QUÁN QUÂN
    const shuffledStudents = fisherYatesShuffle(racerStudents);
    setRankings(shuffledStudents);

    const realWinner = shuffledStudents[0];
    const winnerStNum = getStudentNumber(realWinner);
    setWinnerStudent(realWinner);
    setWinnerNumber(winnerStNum);

    const configs = {};

    racerStudents.forEach((st, idx) => {
      const yStep = count > 1 ? (76 / (count - 1)) : 0;
      const baseY = 14 + idx * yStep;

      const rankIndex = shuffledStudents.findIndex((s) => s.id === st.id);
      const isWinner = rankIndex === 0;

      // Trong lúc đua:
      // Quán quân: bứt tốc qua vạch đích 80% sang 88%
      // Các con thua cuộc: dừng lại trước vạch đích (<= 76%)
      let finalTargetX = 0;
      if (isWinner) {
        finalTargetX = 88.0; // Vượt qua vạch đích 80%
      } else {
        const normRank = (rankIndex - 1) / Math.max(1, count - 2);
        const stagger = ((idx * 5) % 6) - 3;
        finalTargetX = Math.max(30, Math.min(76, 74 - normRank * 38 + stagger));
      }

      configs[st.id] = {
        isWinner,
        rankIndex,
        finalTargetX,
        wobbleFreq: 1.8 + Math.random() * 1.4,
        wobbleAmp: 0.8 + Math.random() * 0.8,
        startY: baseY,
        startX: 4.0,
      };
    });

    duckConfigRef.current = configs;

    if (soundEnabled) {
      playRaceHorn();
      setTimeout(playQuack, 180);
      startRiverWaterSound();
    }

    setIsRunning(true);
    setIsPaused(false);
    setShowRankModal(false);
    setRaceFinished(false);
    setShowFinishLine(false); // Lúc đầu vịt chạy tự do bình thường, chưa có vạch đích!
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;

    startTimeRef.current = performance.now();
    runAnimationLoop();
  };

  // Tạm dừng
  const handlePause = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stopRiverWaterSound();
    if (soundEnabled) playClick();
    setIsRunning(false);
    setIsPaused(true);
  };

  // Thiết lập lại từ đầu (Clear)
  const handleClear = () => {
    stopRiverWaterSound();
    if (soundEnabled) playClick();
    initDuckPositions();
  };

  // Xáo trộn vị trí vịt (Shuffle)
  const handleShuffle = () => {
    if (isRunning) return;
    if (soundEnabled) {
      playClick();
      playQuack();
    }
    initDuckPositions();
  };

  // Khôi phục tất cả học sinh đã được gọi
  const handleResetExclusions = () => {
    if (soundEnabled) playClick();
    setExcludedIds([]);
    setTimeout(() => {
      initDuckPositions();
    }, 50);
  };

  // Xác nhận gọi em này lên bảng trả bài (đóng modal và lưu trạng thái)
  const handleConfirmCallStudent = () => {
    if (!winnerStudent) return;
    if (soundEnabled) playClick();
    if (removeWinnerNextRace) {
      setExcludedIds((prev) => (prev.includes(winnerStudent.id) ? prev : [...prev, winnerStudent.id]));
    }
    onClose();
  };

  // Vòng lặp chuyển động bơi tự nhiên 60FPS:
  // CHỈ KHI CÒN 4 GIÂY CUỐI MỚI HIỆN VẠCH ĐÍCH Ở PHÍA TRƯỚC (80%)!
  const runAnimationLoop = () => {
    const durationMs = duration * 1000;
    const sprintDurationMs = 4000; // ĐÚNG 4 GIÂY CUỐI!
    const sprintStartTimeMs = Math.max(0, durationMs - sprintDurationMs);
    let lastSecond = Math.ceil((durationMs - pausedElapsedRef.current) / 1000);

    const step = (now) => {
      const elapsed = (now - startTimeRef.current);
      pausedElapsedRef.current = elapsed;
      const progress = Math.min(1, elapsed / durationMs);

      const secondsRemaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      if (secondsRemaining !== lastSecond) {
        lastSecond = secondsRemaining;
        setTimeLeft(secondsRemaining);
        if (soundEnabled && secondsRemaining > 0) playTick();
        if (secondsRemaining <= 4 && soundEnabled && secondsRemaining > 0) playQuack();
      }

      // CHỈ KHI CÒN 4 GIÂY CUỐI THÌ VẠCH ĐÍCH MỚI XUẤT HIỆN Ở PHÍA TRƯỚC (80%)
      const isSprintPhase = elapsed >= sprintStartTimeMs || secondsRemaining <= 4;
      if (isSprintPhase) {
        setShowFinishLine(true);
      } else {
        setShowFinishLine(false);
      }

      racerStudents.forEach((st, idx) => {
        const cfg = duckConfigRef.current[st.id] || {
          startX: 4,
          startY: 20,
          isWinner: idx === 0,
          rankIndex: idx,
          finalTargetX: 50,
          wobbleFreq: 2.0,
          wobbleAmp: 1.0,
        };

        let currentX = cfg.startX;

        if (!isSprintPhase) {
          // GIAI ĐOẠN 1: VỊT CHẠY BÌNH THƯỜNG TRÊN SÔNG (Từ 4% đến 32% - 35%)
          // Không có vạch đích chắn ngang, bơi thong thả tự nhiên!
          const phase1Ratio = sprintStartTimeMs > 0 ? Math.min(1, elapsed / sprintStartTimeMs) : 0;
          const slowCurve = Math.pow(phase1Ratio, 1.1);
          let baseTargetP1 = 22 + ((cfg.rankIndex * 4) % 8);
          if (cfg.isWinner) baseTargetP1 = 34;

          const swimStroke = Math.sin((elapsed / 320) * cfg.wobbleFreq + idx * 1.5) * 1.0;
          const drift = Math.sin((elapsed / 650) + idx * 1.8) * 1.5;
          currentX = cfg.startX + (baseTargetP1 - cfg.startX) * slowCurve + swimStroke + drift;
        } else {
          // GIAI ĐOẠN 2: 4 GIÂY CUỐI - VẠCH ĐÍCH HIỆN RA Ở 80%, QUÁN QUÂN BỨT TỐC LAO QUA ĐÍCH!
          const sprintElapsed = elapsed - sprintStartTimeMs;
          const sprintRatio = Math.min(1, sprintElapsed / sprintDurationMs);

          let startSprintX = 22 + ((cfg.rankIndex * 4) % 8);
          if (cfg.isWinner) startSprintX = 34;

          if (cfg.isWinner) {
            // Quán quân: bứt tốc dũng mãnh, vượt qua vạch đích 80% sang 88%
            const burstCurve = Math.pow(sprintRatio, 1.25);
            const surgeX = startSprintX + (cfg.finalTargetX - startSprintX) * burstCurve;
            const wobble = Math.sin((elapsed / 180) * cfg.wobbleFreq) * (0.6 * (1 - sprintRatio));
            currentX = surgeX + wobble;
          } else {
            // Các con khác: dừng lại trước vạch đích (<= 76%)
            const normalCurve = Math.pow(sprintRatio, 1.15);
            const normalX = startSprintX + (cfg.finalTargetX - startSprintX) * normalCurve;
            const wobble = Math.sin((elapsed / 240) * cfg.wobbleFreq + idx) * (0.8 * (1 - sprintRatio));
            currentX = Math.min(FINISH_LINE_X - 4.0, normalX + wobble);
          }
        }

        const waveY = cfg.startY + Math.sin((elapsed / 220) * cfg.wobbleFreq + idx) * cfg.wobbleAmp;

        const domEl = duckDomRefs.current[st.id];
        if (domEl) {
          domEl.style.left = `${currentX}%`;
          domEl.style.top = `${waveY}%`;
          domEl.style.transform = `translate(-50%, -50%) scale(${animalScale})`;
        }
      });

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // ĐÃ VỀ ĐÍCH: Bật màn hình vinh danh chuẩn 100% ảnh mẫu!
        stopRiverWaterSound();
        setIsRunning(false);
        setIsPaused(false);
        setShowFinishLine(false);
        setRaceFinished(true);

        if (soundEnabled) {
          playTripleQuack();
          setTimeout(playWinner, 300);
        }

        confetti({
          particleCount: 260,
          spread: 140,
          origin: { y: 0.52 },
        });

        const winningStudent = duckConfigRef.current ? racerStudents.find(s => duckConfigRef.current[s.id]?.isWinner) : null;
        if (removeWinnerNextRace && winningStudent) {
          setExcludedIds((prev) => (prev.includes(winningStudent.id) ? prev : [...prev, winningStudent.id]));
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Danh sách hiển thị Bảng Xếp Hạng
  const displayRankings = rankings.length > 0 ? rankings : racerStudents;

  // ===================================================================
  // HÀM VẼ LINH VẬT ĐUA (Vịt Vàng, Cá, Tôm, Mực, Cua)
  // ===================================================================
  const renderAnimalSVG = (animalId) => {
    if (animalId === 'fish') {
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <polygon points="12,25 35,50 12,75 22,50" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
          <ellipse cx="58" cy="50" rx="36" ry="26" fill="#38bdf8" stroke="#0284c7" strokeWidth="3" />
          <path d="M48,24 Q65,12 75,28 Z" fill="#0284c7" />
          <circle cx="82" cy="42" r="5" fill="#111" />
          <circle cx="83.5" cy="40.5" r="1.5" fill="#fff" />
          <ellipse cx="94" cy="50" rx="3" ry="4" fill="#f43f5e" />
          <rect x="42" y="38" width="28" height="24" rx="6" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
    }

    if (animalId === 'shrimp') {
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <path d="M85,35 Q96,15 100,5" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M85,40 Q98,30 100,20" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M20,68 Q10,78 5,82 Q25,82 32,70 Q45,74 60,65 Q78,60 88,45 Q75,30 55,36 Q38,40 28,52 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="2.5" />
          <circle cx="82" cy="38" r="3" fill="#111" />
          <circle cx="83" cy="37" r="1" fill="#fff" />
          <rect x="42" y="42" width="26" height="22" rx="5" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
    }

    if (animalId === 'squid') {
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <polygon points="15,50 35,28 35,72" fill="#ec4899" stroke="#be185d" strokeWidth="2" />
          <ellipse cx="58" cy="50" rx="28" ry="20" fill="#f472b6" stroke="#be185d" strokeWidth="2.5" />
          <path d="M84,36 Q98,32 94,40" stroke="#be185d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M86,45 Q99,48 95,54" stroke="#be185d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M84,62 Q96,68 92,60" stroke="#be185d" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="72" cy="42" r="4.5" fill="#111" />
          <circle cx="73.5" cy="40.5" r="1.5" fill="#fff" />
          <rect x="42" y="38" width="28" height="24" rx="6" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
    }

    if (animalId === 'crab') {
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <line x1="20" y1="50" x2="8" y2="40" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="20" y1="58" x2="6" y2="58" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="20" y1="66" x2="10" y2="76" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="80" y1="50" x2="92" y2="40" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="80" y1="58" x2="94" y2="58" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="80" y1="66" x2="90" y2="76" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="28" cy="22" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <circle cx="72" cy="22" r="10" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
          <circle cx="42" cy="26" r="4.5" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
          <circle cx="42" cy="25" r="2" fill="#111" />
          <circle cx="58" cy="26" r="4.5" fill="#ffffff" stroke="#111" strokeWidth="1.5" />
          <circle cx="58" cy="25" r="2" fill="#111" />
          <ellipse cx="50" cy="54" rx="32" ry="24" fill="#ef4444" stroke="#b91c1c" strokeWidth="3" />
          <rect x="36" y="42" width="28" height="24" rx="6" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
    }

    // 🐥 Vịt Vàng tròn dễ thương chuẩn ảnh mẫu (thân tròn xanh dương nhạt hoặc vàng)
    return (
      <svg viewBox="0 0 100 90" className="w-full h-full">
        <polygon points="12,52 35,46 28,62" fill="#38bdf8" stroke="#0f172a" strokeWidth="3" />
        <circle cx="52" cy="50" r="32" fill="#38bdf8" stroke="#0f172a" strokeWidth="3.8" />
        <polygon points="76,46 98,54 78,59" fill="#ea580c" stroke="#0f172a" strokeWidth="3" />
        <circle cx="68" cy="38" r="6" fill="#0f172a" />
        <circle cx="70.5" cy="36" r="2.2" fill="#ffffff" />
        <rect x="36" y="42" width="30" height="24" rx="7" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#0c1326] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border-[3px] border-amber-500/80">
        
        {/* =================================================================== */}
        {/* 1. THANH ĐIỀU KHIỂN HEADER TRÊN CÙNG (CHUẨN ẢNH MẪU)                 */}
        {/* =================================================================== */}
        <div className="relative z-30 flex items-center justify-between px-5 py-3 bg-[#0d162d] border-b border-slate-800">
          {/* CÁC NÚT ĐIỀU KHIỂN BÊN TRÁI: Settings, Volume, Shuffle, CLEAR, START */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer border border-slate-700 shadow-sm"
              title="Cài đặt thời gian"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (!next) stopRiverWaterSound();
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition cursor-pointer border border-slate-700 shadow-sm"
              title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={handleShuffle}
              disabled={isRunning}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl transition cursor-pointer border border-slate-700 shadow-sm"
              title="Xáo trộn ngẫu nhiên"
            >
              <Shuffle className="w-4 h-4 text-amber-400" />
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5 border border-slate-700 shadow-sm uppercase tracking-wider"
              title="Đặt lại từ đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>CLEAR</span>
            </button>

            {!isRunning ? (
              <button
                type="button"
                onClick={handleStartOrContinue}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 active:scale-95 uppercase tracking-wider"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>{isPaused ? 'TIẾP TỤC' : 'START'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 active:scale-95 uppercase tracking-wider"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>TẠM DỪNG</span>
              </button>
            )}
          </div>

          {/* ĐỒNG HỒ ĐẾM NGƯỢC LED CHUẨN ẢNH MẪU */}
          <div className="flex items-center space-x-2">
            <div className="px-7 py-1.5 bg-white border-[3px] border-slate-950 rounded-2xl shadow-inner font-mono text-2xl sm:text-3xl font-black text-slate-950 tracking-widest">
              00:{String(timeLeft).padStart(2, '0')}:00
            </div>
          </div>

          {/* NÚT THỨ HẠNG & NÚT ĐÓNG */}
          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-amber-500 uppercase tracking-wider"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>THỨ HẠNG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. THANH SUBHEADER: CHỌN LOÀI VẬT ĐUA & SĨ SỐ (CHUẨN ẢNH MẪU)      */}
        {/* =================================================================== */}
        <div className="relative z-20 flex items-center justify-between px-5 py-2 bg-[#0a1122] border-b border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2 overflow-x-auto custom-scrollbar py-0.5">
            <span className="font-bold text-slate-400 whitespace-nowrap">Loài vật đua:</span>
            {RACER_ANIMALS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedAnimal(a.id)}
                disabled={isRunning}
                className={`px-3 py-1 rounded-full text-xs font-black transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap border ${
                  selectedAnimal === a.id
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <span>{a.icon}</span>
                <span>{a.label}</span>
              </button>
            ))}
          </div>

          <div className="font-bold text-slate-400 whitespace-nowrap pl-2">
            Sĩ số: <strong className="text-white font-black">{racerStudents.length}</strong> thí sinh
          </div>
        </div>

        {/* POPOVER CÀI ĐẶT THỜI GIAN */}
        {showSettings && (
          <div className="absolute top-24 left-5 z-50 bg-slate-900 border-2 border-amber-400 p-4 rounded-2xl text-white shadow-2xl space-y-3 animate-fade-in w-72">
            <span className="text-xs font-black text-amber-300 block uppercase">Cài đặt thời gian đua:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { s: 10, label: '10 giây' },
                { s: 15, label: '15 giây (Chuẩn)' },
                { s: 20, label: '20 giây' },
                { s: 30, label: '30 giây' },
              ].map((item) => (
                <button
                  key={item.s}
                  type="button"
                  onClick={() => {
                    setDuration(item.s);
                    setTimeLeft(item.s);
                    initDuckPositions();
                    setShowSettings(false);
                  }}
                  className={`px-2 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                    duration === item.s ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {excludedIds.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleResetExclusions}
                  className="w-full py-1.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 rounded-xl text-[11px] font-bold text-rose-200 transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục {excludedIds.length} bạn đã trả bài</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* 3. DÒNG SÔNG NƯỚC SỐNG ĐỘNG CÓ VẢY CÁ VÀ BỜ CỎ (CHUẨN ẢNH MẪU)       */}
        {/* =================================================================== */}
        <div className="flex-1 relative overflow-hidden bg-[#165a83] select-none flex flex-col">
          
          {/* MÈP TRÊN BỜ CỎ XANH VÀ CÁC BỤI CÂY TRÒN CHUẨN ẢNH MẪU */}
          <div className="relative h-7 bg-[#22c55e] border-b-[5px] border-[#854d0e] z-10 flex items-center justify-around px-4 overflow-hidden shadow-md">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full bg-[#15803d] -mb-4 opacity-90 shadow-inner" />
            ))}
          </div>

          {/* NỀN SÔNG VẢY CÁ HÌNH CÁNH CUNG MỀM MẠI CHUẨN 100% ẢNH MẪU */}
          <div className="absolute inset-0 top-7 overflow-hidden pointer-events-none">
            <svg className="w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="scallopWaves" x="0" y="0" width="70" height="34" patternUnits="userSpaceOnUse">
                  <path d="M0,17 Q17.5,2 35,17 Q52.5,2 70,17" fill="none" stroke="#67e8f9" strokeWidth="2.2" />
                  <path d="M-17.5,34 Q0,19 17.5,34 Q35,19 52.5,34 Q70,19 87.5,34" fill="none" stroke="#67e8f9" strokeWidth="2.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#scallopWaves)" />
            </svg>
          </div>

          {/* CSS HOẠT HỌA VẠCH ĐÍCH TRƯỢT VÀO VÀ BƠI BỒNG BỀNH */}
          <style>{`
            @keyframes finishLineSlideIn {
              0% { opacity: 0; transform: translateX(50px) skewX(-20deg); }
              100% { opacity: 1; transform: translateX(0) skewX(-20deg); }
            }
          `}</style>

          {/* VẠCH ĐÍCH THỂ THAO CARÔ: CHỈ XUẤT HIỆN KHI CÒN 4 GIÂY CUỐI Ở 80% */}
          {showFinishLine && !raceFinished && (
            <div
              className="absolute top-7 bottom-0 w-14 shadow-2xl border-x-[3.5px] border-slate-950 pointer-events-none z-20 transform -skew-x-[20deg] origin-top"
              style={{
                left: `${FINISH_LINE_X}%`,
                backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 12px, #fff 12px, #fff 24px)',
                animation: 'finishLineSlideIn 0.5s ease-out forwards',
              }}
            >
              <div className="absolute top-2 -left-3 bg-red-600 border-2 border-white text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center space-x-1 whitespace-nowrap transform skew-x-[20deg]">
                <span>🏁</span>
                <span>ĐÍCH</span>
              </div>
              <div className="absolute bottom-4 -left-4 bg-red-600 border-2 border-white text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center space-x-1 whitespace-nowrap transform skew-x-[20deg]">
                <span>🏁</span>
                <span>FINISH</span>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* HỘP ĐIỀU KHIỂN GÓC TRÊN TRÁI DÒNG SÔNG CHUẨN ẢNH MẪU                */}
          {/* =================================================================== */}
          <div className="absolute top-10 left-5 z-30 bg-[#081528]/85 border border-white/20 rounded-2xl p-2.5 shadow-2xl flex flex-col space-y-2 backdrop-blur-xs max-w-xs">
            <label className="flex items-center space-x-2 text-xs font-bold text-white cursor-pointer">
              <input
                type="checkbox"
                checked={removeWinnerNextRace}
                onChange={(e) => setRemoveWinnerNextRace(e.target.checked)}
                className="rounded text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer accent-emerald-500"
              />
              <span>Loại người thắng ở vòng sau?</span>
            </label>

            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1.5 active:scale-95"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Race Again? (Đua Lại)</span>
            </button>
          </div>

          {/* =================================================================== */}
          {/* TRƯỜNG HỢP 1: KHI ĐÃ CÁN ĐÍCH (00:00:00) -> CHUẨN 100% ẢNH MẪU!     */}
          {/* NHÃN TÊN MÀU CAM BO TRÒN VÀ CHÚ LINH VẬT SỐ ÁO TO Ở CHÍNH GIỮA SÔNG */}
          {/* =================================================================== */}
          {raceFinished && winnerStudent ? (
            <div className="flex-1 relative flex items-center justify-center">
              
              {/* KHỐI VINH DANH CHÍNH GIỮA DÒNG SÔNG CHUẨN ẢNH MẪU */}
              <div className="flex flex-col items-center animate-bounce-subtle z-20">
                {/* NHÃN TÊN TO MÀU CAM BO TRÒN NỔI BẬT */}
                <div className="px-8 py-2.5 bg-[#f97316] text-white font-black text-2xl sm:text-3xl rounded-2xl shadow-2xl border-[3px] border-white/80 mb-3 tracking-wide filter drop-shadow-lg">
                  {winnerStudent?.full_name}
                </div>

                {/* HÌNH CHÚ LINH VẬT CÓ BIỂN SỐ ÁO TO TRÊN THÂN */}
                <div className="relative w-40 h-36 sm:w-48 sm:h-42 filter drop-shadow-2xl flex items-center justify-center">
                  {/* Bóng nước rẽ sóng dưới bụng */}
                  <div className="absolute -bottom-2 w-44 h-8 bg-cyan-200/40 rounded-full blur-xs" />

                  {/* SVG chú linh vật */}
                  {renderAnimalSVG(selectedAnimal)}

                  {/* SỐ ÁO TO ĐẬM IN TRÊN BỤNG */}
                  <div className="absolute top-[49%] left-[37%] w-10 h-7 flex items-center justify-center font-black text-xl sm:text-2xl text-black font-sans pointer-events-none">
                    {winnerNumber}
                  </div>
                </div>
              </div>

              {/* NÚT TRÒN CÚP VÀNG GÓC DƯỚI PHẢI CHUẨN ẢNH MẪU */}
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                className="absolute bottom-4 right-5 z-30 w-14 h-14 bg-white hover:bg-amber-50 border-[3.5px] border-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95 group"
                title="Xem Bảng Xếp Hạng"
              >
                <Trophy className="w-7 h-7 text-black fill-amber-400 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          ) : (
            /* =================================================================== */
            /* TRƯỜNG HỢP 2: TRONG KHI ĐANG ĐUA / CHUẨN BỊ XUẤT PHÁT              */
            /* ĐÀN VỊT BƠI TỰ NHIÊN TRÊN SÔNG - 4S CUỐI VẠCH ĐÍCH MỚI HIỆN RA     */
            /* =================================================================== */
            <div className="flex-1 relative">
              {/* TẤT CẢ ĐÀN CON VẬT TRONG 1 KHUNG HÌNH (XUẤT PHÁT TỪ BÊN TRÁI 4%) */}
              <div className="absolute inset-0">
                {racerStudents.map((st, idx) => {
                  const studentNumber = getStudentNumber(st);
                  const yStep = studentCount > 1 ? (76 / (studentCount - 1)) : 0;
                  const defaultY = 14 + idx * yStep;

                  return (
                    <div
                      key={st.id}
                      ref={(el) => {
                        duckDomRefs.current[st.id] = el;
                      }}
                      className="absolute cursor-pointer group"
                      style={{
                        left: '4%',
                        top: `${defaultY}%`,
                        transform: `translate(-50%, -50%) scale(${animalScale})`,
                        zIndex: Math.floor(defaultY * 10),
                        transition: isRunning ? 'none' : 'all 0.3s ease',
                      }}
                      title={`#${studentNumber} - ${st.full_name}`}
                    >
                      {/* BỌT NƯỚC RIPPLE DƯỚI BỤNG */}
                      <div className={`absolute -bottom-1 -left-2 w-12 h-3.5 bg-cyan-200/40 rounded-full blur-2xs ${isRunning ? 'animate-pulse' : ''}`} />

                      {/* THÂN LINH VẬT SVG */}
                      <div className={`relative ${animalWidth} flex-shrink-0 filter drop-shadow-md transform hover:scale-120 transition`}>
                        {renderAnimalSVG(selectedAnimal)}

                        {/* SỐ THỨ TỰ HỌC SINH IN TO TRÊN THÂN */}
                        <div className={`absolute top-[48%] left-[36%] w-7 h-5 flex items-center justify-center font-black ${numberFontSize} text-black font-sans pointer-events-none`}>
                          {studentNumber}
                        </div>
                      </div>

                      {/* NHÃN TÊN ĐẦY ĐỦ CỦA HỌC SINH */}
                      <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-amber-200 font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white/20 z-30 pointer-events-none transition-opacity ${
                        isRunning ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {studentNumber}. {st.full_name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* NÚT TRÒN CÚP VÀNG GÓC DƯỚI PHẢI */}
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                className="absolute bottom-4 right-5 z-30 w-14 h-14 bg-white hover:bg-amber-50 border-[3.5px] border-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95 group"
                title="Xem Bảng Xếp Hạng"
              >
                <Trophy className="w-7 h-7 text-black fill-amber-400 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. THANH CHÂN TRANG ĐIỀU KHIỂN GỌI TRẢ BÀI (CHUẨN 100% ẢNH MẪU)    */}
        {/* =================================================================== */}
        <div className="relative z-30 px-6 py-3.5 bg-[#0a1124] border-t border-amber-500/40 flex items-center justify-between gap-4">
          {/* THÔNG TIN HỌC SINH ĐẠI DIỆN LÊN BẢNG TRẢ BÀI */}
          <div className="flex items-center space-x-3.5 min-w-0">
            {/* HUY HIỆU 1st VÀNG CAM BO TRÒN */}
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-amber-300 flex items-center justify-center font-black text-slate-950 text-lg shadow-md flex-shrink-0">
              1st
            </div>

            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
                <span>🎯 HỌC SINH ĐẠI DIỆN LÊN BẢNG TRẢ BÀI:</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                  Số #{winnerStudent ? winnerNumber : (racerStudents[0] ? getStudentNumber(racerStudents[0]) : 1)}
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white truncate drop-shadow-sm">
                {winnerStudent ? winnerStudent.full_name : (racerStudents[0]?.full_name || 'Đang chuẩn bị đua...')}
              </div>
            </div>
          </div>

          {/* CẶP NÚT HÀNH ĐỘNG: XÁC NHẬN GỌI EM NÀY & XEM THỨ TỰ */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleConfirmCallStudent}
              disabled={!winnerStudent}
              className="px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 active:scale-95 uppercase tracking-wider"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
              <span>XÁC NHẬN GỌI EM NÀY</span>
            </button>

            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 active:scale-95 uppercase tracking-wider border border-amber-500"
            >
              <ListOrdered className="w-4 h-4 stroke-[2.5]" />
              <span>XEM THỨ TỰ (1st – CUỐI)</span>
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 5. MODAL BẢNG THỨ TỰ GỌI TRẢ BÀI CẢ LỚP (NGẪU NHIÊN 100% FISHER-YATES) */}
        {/* =================================================================== */}
        {showRankModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 animate-scale-up backdrop-blur-xs">
            <div className="bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 p-1.5 rounded-[2.5rem] shadow-2xl max-w-lg w-full border-4 border-amber-200 flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#060e1d] rounded-[2.2rem] p-5 text-center text-white flex flex-col flex-1 overflow-hidden">
                
                {/* HEADER BẢNG XẾP HẠNG */}
                <div className="flex-shrink-0 space-y-1 mb-3">
                  <span className="text-4xl animate-bounce inline-block">🎯 🦆 🎯</span>
                  <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wider drop-shadow-md">
                    THỨ TỰ GỌI TRẢ BÀI
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Thống kê chuẩn xác thứ tự gọi trả bài của tất cả {displayRankings.length} học sinh trong lớp!
                  </p>
                </div>

                {/* DANH SÁCH CUỘN MƯỢT MÀ CHỨA TOÀN BỘ HỌC SINH (NGẪU NHIÊN HOÀN TOÀN) */}
                <div className="flex-1 overflow-y-auto pr-1.5 space-y-2 custom-scrollbar">
                  {/* TOP 3 BẠN ĐẦU TIÊN */}
                  {displayRankings.slice(0, 3).map((st, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const titles = ['MỜI LÊN BẢNG TRẢ BÀI 🎯', 'DỰ BỊ 1 📝', 'DỰ BỊ 2 📝'];
                    const borders = ['border-amber-400 bg-amber-500/15', 'border-slate-300 bg-slate-400/15', 'border-amber-700 bg-amber-800/15'];
                    const stNum = getStudentNumber(st);

                    return (
                      <div
                        key={st.id}
                        className={`p-2.5 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-md ${borders[idx]}`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-3xl flex-shrink-0">{medals[idx]}</span>
                          <div className="text-left min-w-0">
                            <span className="text-sm font-black text-white block">
                              #{stNum}. {st.full_name}
                            </span>
                            <span className="text-[10px] font-bold text-amber-300 block uppercase">
                              {titles[idx]}
                            </span>
                          </div>
                        </div>

                        <div className="flex-shrink-0">
                          <span className="px-3 py-1.5 bg-emerald-600/30 border border-emerald-400/50 text-emerald-300 font-black text-xs rounded-xl shadow-sm flex items-center space-x-1">
                            <span>Hạng {idx + 1}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {/* CÁC THỨ HẠNG CÒN LẠI TỪ HẠNG 4 ĐẾN HẾT */}
                  {displayRankings.length > 3 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-left mb-1.5 px-2">
                        Các Vị Trí Tiếp Theo:
                      </div>
                      <div className="space-y-1.5">
                        {displayRankings.slice(3).map((st, i) => {
                          const rankNum = i + 4;
                          const stNum = getStudentNumber(st);

                          return (
                            <div
                              key={st.id}
                              className="p-2 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center justify-between gap-2 hover:bg-slate-800/80 transition"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center font-mono font-bold text-xs text-slate-300 flex-shrink-0">
                                  {rankNum}
                                </span>
                                <span className="text-xs font-bold text-slate-200 truncate">
                                  #{stNum}. {st.full_name}
                                </span>
                              </div>

                              <span className="text-[10px] text-slate-400 font-mono">
                                Hạng {rankNum}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER NÚT BẤM */}
                <div className="pt-3 mt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
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
