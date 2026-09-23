import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Trophy, Volume2, VolumeX, Settings, Shuffle, Award, Check, UserMinus, RefreshCw, Zap } from 'lucide-react';
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

// Danh sách các loại mũ/phụ kiện ngộ nghĩnh chuẩn ảnh 3 & 4
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

// Danh sách các loài linh vật đua nước
const RACER_ANIMALS = [
  { id: 'duck', name: 'Vịt Vàng', icon: '🦆', label: 'Vịt' },
  { id: 'turtle', name: 'Rùa Biển', icon: '🐢', label: 'Rùa' },
  { id: 'fish', name: 'Cá Đại Dương', icon: '🐟', label: 'Cá' },
  { id: 'crab', name: 'Cua Biển', icon: '🦀', label: 'Cua' },
  { id: 'shrimp', name: 'Tôm Hùm', icon: '🦐', label: 'Tôm' },
];

export default function BeeRaceModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [duration, setDuration] = useState(15); // Mặc định 15s để đủ thời gian bơi chậm và 5s bứt phá
  const [timeLeft, setTimeLeft] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [duckPositions, setDuckPositions] = useState({});
  const [rankings, setRankings] = useState([]);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false); // Trạng thái về đích (chuẩn ảnh 2)
  const [selectedAnimal, setSelectedAnimal] = useState('duck'); // Loài vật đua (vịt, rùa, cá, cua, tôm)
  const [removeWinnerNextRace, setRemoveWinnerNextRace] = useState(true); // Loại bỏ người thắng ở lượt kế tiếp
  const [excludedIds, setExcludedIds] = useState([]); // Danh sách học sinh bị loại tạm thời
  const [turboActive, setTurboActive] = useState(true); // Bật tính năng làn tăng tốc Turbo Lane

  // Lọc học sinh có mặt và chưa bị loại trừ
  const presentStudents = students.filter((s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm');
  const baseStudents = presentStudents.length > 0 ? presentStudents : students;
  const activeStudents = baseStudents.filter((s) => !excludedIds.includes(s.id));
  const racerStudents = activeStudents.length > 0 ? activeStudents : baseStudents;

  const animFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const pausedElapsedRef = useRef(0);
  const duckConfigRef = useRef({});

  // Khởi tạo vị trí đàn thú đua tại vạch xuất phát
  const initDuckPositions = (shuffleOrder = false) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stopRiverWaterSound();
    setIsRunning(false);
    setIsPaused(false);
    setRaceFinished(false);
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

    // Bốc thăm thứ hạng đích tiềm năng
    const targetRanks = orderedStudents.map((_, i) => i + 1).sort(() => Math.random() - 0.5);

    const finishLineX = 84;
    const newPositions = {};
    const configs = {};

    orderedStudents.forEach((st, idx) => {
      // Phân bổ trục Y dọc theo dòng sông (12% đến 86%)
      const yStep = count > 1 ? (74 / (count - 1)) : 0;
      const baseY = 12 + idx * yStep;

      // Xếp hàng xuất phát so le nhẹ 2 cột để không bị đè chữ
      const colOffset = (idx % 2) * 3.5;
      const startX = 4 + colOffset; 
      const targetRank = targetRanks[idx];
      const hatIndex = (idx * 3 + 5) % DUCK_HATS.length;

      // Tính vị trí đích
      let finalTargetX = finishLineX + 4.5; // Top 1: vượt qua vạch đích
      if (targetRank === 2) {
        finalTargetX = finishLineX - 4.5;
      } else if (targetRank === 3) {
        finalTargetX = finishLineX - 8.0;
      } else if (targetRank >= 4) {
        const normalizedRank = (targetRank - 4) / Math.max(1, count - 4);
        const stagger = ((idx * 7) % 5) - 2;
        finalTargetX = Math.max(18, 70 - normalizedRank * 48 + stagger);
      }

      configs[st.id] = {
        targetRank,
        finalTargetX,
        burstTime: 0.4 + Math.random() * 0.3,
        hatIndex,
        wobbleFreq: 1.6 + Math.random() * 1.8,
        wobbleAmp: 1.0 + Math.random() * 1.2,
        startY: baseY,
        startX,
        isTurboBoosted: false,
      };

      newPositions[st.id] = {
        x: startX,
        y: baseY,
        hatIndex,
        isFinished: false,
        isTurbo: false,
      };
    });

    duckConfigRef.current = configs;
    setDuckPositions(newPositions);
  };

  // CHỈ RE-INIT KHI MỞ MODAL HOẶC ĐỔI THỜI GIAN (KHÔNG BỎ EXCLUDEDIDS VÀO ĐÂY ĐỂ TRÁNH RESET MẤT VỊT VỀ ĐÍCH)
  useEffect(() => {
    if (isOpen) {
      initDuckPositions(false);
    } else {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      stopRiverWaterSound();
      setIsRunning(false);
      setIsPaused(false);
    }
    return () => {
      stopRiverWaterSound();
    };
  }, [isOpen, duration, students.length]);

  // Bắt đầu / Tiếp tục cuộc đua
  const handleStartOrContinue = () => {
    if (racerStudents.length === 0) {
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

    if (soundEnabled) {
      playRaceHorn();
      setTimeout(playQuack, 180);
      startRiverWaterSound();
    }

    setIsRunning(true);
    setIsPaused(false);
    setRankings([]);
    setShowRankModal(false);
    setRaceFinished(false);
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

  // Khôi phục tất cả học sinh bị loại
  const handleResetExclusions = () => {
    if (soundEnabled) playClick();
    setExcludedIds([]);
    setTimeout(() => {
      initDuckPositions(false);
    }, 50);
  };

  // Vòng lặp chuyển động: Chậm rãi lúc đầu -> Nhanh dần -> Bứt phá trong 5 giây cuối + Làn Turbo
  const runAnimationLoop = () => {
    const durationMs = duration * 1000;
    const finishLineX = 84;
    let lastSecond = Math.ceil((durationMs - pausedElapsedRef.current) / 1000);

    // Thời điểm bắt đầu 5 giây cuối (Final 5-second sprint)
    const sprintDurationMs = Math.min(5000, durationMs * 0.55);
    const sprintStartTime = durationMs - sprintDurationMs;

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
        if (secondsRemaining <= 5 && soundEnabled) playQuack();
      }

      const updated = {};
      const standings = [];

      racerStudents.forEach((st, idx) => {
        const cfg = duckConfigRef.current[st.id] || {
          startX: 5,
          startY: 20,
          targetRank: idx + 1,
          finalTargetX: 50,
          burstTime: 0.5,
          hatIndex: 0,
          wobbleFreq: 2.0,
          wobbleAmp: 1.2,
        };

        const isWinner = cfg.targetRank === 1;
        let currentX = cfg.startX;
        let isTurboActiveHere = false;

        // VÙNG LÀN TĂNG TỐC TURBO LANE ⚡ (nằm ở khoảng Y: 30% - 60% và thời gian từ 30% đến 80%)
        if (turboActive && cfg.startY >= 28 && cfg.startY <= 62 && progress >= 0.3 && progress <= 0.75) {
          isTurboActiveHere = true;
        }

        // ===================================================================
        // 1. GIAI ĐOẠN ĐẦU: BƠI CHẬM RÃI, GIẰNG CO KHÓ ĐOÁN (Trước 5 giây cuối)
        // ===================================================================
        if (elapsed < sprintStartTime) {
          const slowRatio = elapsed / sprintStartTime; // từ 0.0 đến 1.0
          const midFieldX = cfg.startX + (38 - cfg.startX) * Math.pow(slowRatio, 1.2);

          // Dao động sóng sin liên tục hoán đổi vị trí thứ hạng gây tò mò
          const slowWobble = Math.sin((now / 420) * cfg.wobbleFreq + idx * 2.2) * 4.2;
          const turboBoost = isTurboActiveHere ? 4.0 : 0;
          const slowX = midFieldX + slowWobble + turboBoost;

          currentX = Math.max(cfg.startX, Math.min(44, slowX));
        } 
        // ===================================================================
        // 2. GIAI ĐOẠN 5 GIÂY CUỐI: TĂNG TỐC NHANH DẦN & BỨT PHÁ VỀ ĐÍCH!
        // ===================================================================
        else {
          const sprintElapsed = elapsed - sprintStartTime;
          const sprintRatio = Math.min(1, sprintElapsed / sprintDurationMs); // từ 0.0 đến 1.0
          const accelCurve = Math.pow(sprintRatio, 1.45);

          const startSprintX = 38;
          const rawSprintX = startSprintX + (cfg.finalTargetX - startSprintX) * accelCurve;
          
          const sprintWobble = Math.sin((now / 260) * cfg.wobbleFreq + idx * 2.5) * (3.5 * (1 - sprintRatio));
          const turboBoost = isTurboActiveHere ? 2.5 : 0;
          const combinedX = rawSprintX + sprintWobble + turboBoost;

          if (isWinner) {
            // Quán quân: chỉ vượt qua vạch đích khi đồng hồ chạm 00:00:00 (sprintRatio >= 0.985)
            if (sprintRatio < 0.985) {
              currentX = Math.min(finishLineX - 0.5, combinedX);
            } else {
              currentX = cfg.finalTargetX; // vọt qua vạch đích tới 88.5%!
            }
          } else {
            // Tất cả các con còn lại: TUYỆT ĐỐI không được vượt vạch đích
            currentX = Math.min(finishLineX - 4.5, combinedX);
          }
        }

        // Tọa độ Y: dao động nhấp nhô theo sóng nước sông
        const waveY = cfg.startY + Math.sin(now / 180 * cfg.wobbleFreq + idx) * cfg.wobbleAmp;
        const hasCrossedFinish = isWinner && currentX >= finishLineX;

        updated[st.id] = {
          x: currentX,
          y: waveY,
          hatIndex: cfg.hatIndex,
          isFinished: hasCrossedFinish,
          targetRank: cfg.targetRank,
          isTurbo: isTurboActiveHere,
        };

        standings.push({ student: st, x: currentX, targetRank: cfg.targetRank });
      });

      setDuckPositions(updated);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        // ===================================================================
        // 3. ĐÃ CÁN ĐÍCH: HẾT GIỜ 00:00:00 -> CHUYỂN SANG MÀN HÌNH VỀ ĐÍCH CHUẨN ẢNH 2!
        // ===================================================================
        stopRiverWaterSound();
        setIsRunning(false);
        setIsPaused(false);
        setRaceFinished(true); // BẬT MÀN HÌNH VỀ ĐÍCH ĐỘC TÔN
        setShowRankModal(false);

        // Hiệu ứng tiếng vịt cạc cạc dồn dập 3 tiếng và kèn chiến thắng
        if (soundEnabled) {
          playTripleQuack();
          setTimeout(playWinner, 300);
        }

        // Pháo hoa giấy bay rợp trời
        confetti({
          particleCount: 240,
          spread: 130,
          origin: { y: 0.55 },
        });

        // Sắp xếp tìm Bảng xếp hạng toàn đoàn (TẤT CẢ HỌC SINH)
        standings.sort((a, b) => a.targetRank - b.targetRank);
        const fullRankings = standings.map((item) => item.student);
        setRankings(fullRankings);

        // Tự động thưởng sao Top 3
        if (onAwardStudent && fullRankings[0]) onAwardStudent(fullRankings[0].id, 3);
        if (onAwardStudent && fullRankings[1]) onAwardStudent(fullRankings[1].id, 2);
        if (onAwardStudent && fullRankings[2]) onAwardStudent(fullRankings[2].id, 1);

        // Nếu bật tùy chọn loại bỏ người thắng ở lượt sau
        if (removeWinnerNextRace && fullRankings[0]) {
          setExcludedIds((prev) => (prev.includes(fullRankings[0].id) ? prev : [...prev, fullRankings[0].id]));
        }
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Xác định Quán Quân khi về đích
  const winnerStudent = rankings[0] || racerStudents[0];
  const winnerStudentNumber = winnerStudent
    ? racerStudents.findIndex((s) => s.id === winnerStudent.id) + 1
    : 1;
  const winnerHat = winnerStudent
    ? DUCK_HATS[(duckConfigRef.current[winnerStudent.id]?.hatIndex || 0) % DUCK_HATS.length]
    : DUCK_HATS[0];

  // Danh sách hiển thị Bảng Xếp Hạng: luôn đảm bảo có đủ 100% học sinh dù chưa đua hay đã đua
  const displayRankings = rankings.length > 0 ? rankings : racerStudents;

  // ===================================================================
  // HÀM VẼ LINH VẬT ĐUA (Vịt, Rùa, Cá, Cua, Tôm) ĐẦY ĐỦ BIỂN SỐ
  // ===================================================================
  const renderAnimalSVG = (animalId, number, isWinner = false) => {
    if (animalId === 'turtle') {
      // 🐢 RÙA BIỂN
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <ellipse cx="25" cy="35" rx="10" ry="6" fill="#15803d" />
          <ellipse cx="25" cy="65" rx="10" ry="6" fill="#15803d" />
          <ellipse cx="75" cy="32" rx="14" ry="7" fill="#16a34a" transform="rotate(-15 75 32)" />
          <ellipse cx="75" cy="68" rx="14" ry="7" fill="#16a34a" transform="rotate(15 75 68)" />
          <ellipse cx="88" cy="50" rx="12" ry="9" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
          <circle cx="93" cy="46" r="2.5" fill="#111" />
          <circle cx="94" cy="45" r="0.8" fill="#fff" />
          <ellipse cx="50" cy="50" rx="34" ry="28" fill="#166534" stroke="#14532d" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="27" ry="22" fill="#15803d" />
          <rect x="36" y="38" width="28" height="24" rx="6" fill="#ffffff" stroke="#111111" strokeWidth="2.5" />
        </svg>
      );
    }

    if (animalId === 'fish') {
      // 🐟 CÁ ĐẠI DƯƠNG
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

    if (animalId === 'crab') {
      // 🦀 CUA BIỂN
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

    if (animalId === 'shrimp') {
      // 🦐 TÔM HÙM
      return (
        <svg viewBox="0 0 100 90" className="w-full h-full">
          <path d="M85,35 Q96,15 100,5" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M85,40 Q98,30 100,20" stroke="#ea580c" strokeWidth="2" fill="none" />
          <path d="M20,68 Q10,78 5,82 Q25,82 32,70 Q45,74 60,65 Q78,60 88,45 Q75,30 55,36 Q38,40 28,52 Z" fill="#fb923c" stroke="#c2410c" strokeWidth="2.5" />
          <circle cx="82" cy="38" r="3" fill="#111" />
          <circle cx="83" cy="37" r="1" fill="#fff" />
          <rect x="42" y="42" width="26" height="22" rx="5" fill="#ffffff" stroke="#111111" strokeWidth="2" />
        </svg>
      );
    }

    // 🦆 MẶC ĐỊNH: VỊT VÀNG CAO SU (CHUẨN ẢNH 2, 3, 4)
    return (
      <svg viewBox="0 0 100 90" className="w-full h-full">
        <path
          d="M20,60 C20,40 35,35 55,42 C68,46 80,48 88,58 C96,68 85,82 60,82 C35,82 20,78 20,60 Z"
          fill="#ffcc00"
          stroke="#b8860b"
          strokeWidth="3.2"
        />
        <path
          d="M58,45 C58,35 62,20 75,20 C88,20 92,34 88,44 C82,54 68,54 58,45 Z"
          fill="#ffd700"
          stroke="#b8860b"
          strokeWidth="3.2"
        />
        <path
          d="M84,32 C94,30 100,34 98,39 C92,44 85,41 84,32 Z"
          fill="#ff6600"
          stroke="#cc3300"
          strokeWidth="2.2"
        />
        <circle cx="78" cy="27" r="4.5" fill="#111" />
        <circle cx="79.5" cy="25.5" r="1.5" fill="#fff" />
        <path
          d="M35,62 C40,54 55,54 62,62 C60,70 45,74 35,62 Z"
          fill="#ffb700"
          stroke="#b8860b"
          strokeWidth="2.2"
        />
        <rect
          x="23"
          y="52"
          width="26"
          height="20"
          rx="6"
          fill="#ffffff"
          stroke="#111111"
          strokeWidth="2.2"
        />
      </svg>
    );
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

          {/* GÓC TRÁI: CÁC NÚT ICON & NÚT START/CLEAR */}
          <div className="flex items-center space-x-3 relative z-10">
            {/* CỤM NÚT ĐIỀU KHIỂN ĐEN VUÔNG */}
            <div className="bg-black/90 p-1 rounded-xl flex items-center space-x-1 shadow-md border border-white/20">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 text-white hover:text-amber-300 hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Cài đặt giải đua"
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

            {/* CHỮ START / CONTINUE / PAUSE VÀ CLEAR */}
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
                title="Xáo trộn lại vị trí ở vạch xuất phát"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* CHÍNH GIỮA: ĐỒNG HỒ ĐẾM NGƯỢC SIÊU TO KHỔNG LỒ */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="bg-[#e2e8f8] border-[3.5px] border-slate-900 rounded-2xl px-6 sm:px-10 py-1 shadow-2xl flex items-center justify-center">
              <span className="font-mono font-black text-3xl sm:text-4xl tracking-widest text-slate-950 drop-shadow-xs">
                00:00:{String(timeLeft).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* GÓC PHẢI: BỘ CHỌN LINH VẬT & NÚT BẢNG VÀNG & ĐÓNG */}
          <div className="flex items-center space-x-2 relative z-10">
            {/* THANH CHỌN LOÀI VẬT ĐUA (Vịt, Rùa, Cá, Cua, Tôm) */}
            <div className="hidden md:flex items-center bg-black/60 p-1 rounded-xl border border-white/20 space-x-1">
              {RACER_ANIMALS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSelectedAnimal(a.id)}
                  disabled={isRunning}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer ${
                    selectedAnimal === a.id
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                  title={`Đua ${a.name}`}
                >
                  <span>{a.icon}</span>
                  <span className="hidden lg:inline">{a.label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5 border border-amber-500"
            >
              <Trophy className="w-4 h-4 fill-slate-950" />
              <span>Xếp Hạng</span>
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

        {/* POPOVER CÀI ĐẶT THỜI GIAN VÀ TÙY CHỌN */}
        {showSettings && (
          <div className="absolute top-16 left-4 z-50 bg-slate-900 border-2 border-amber-400 p-4 rounded-2xl text-white shadow-2xl space-y-3 animate-fade-in w-72">
            <span className="text-xs font-black text-amber-300 block uppercase">Cài đặt cuộc đua:</span>
            
            {/* CHỌN THỜI GIAN ĐUA */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-300 font-bold block">Thời gian đua:</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { s: 10, label: '10 Giây (Nhanh)' },
                  { s: 15, label: '15 Giây (Chuẩn)' },
                  { s: 20, label: '20 Giây (Kịch tính)' },
                  { s: 30, label: '30 Giây (Hồi hộp)' },
                ].map((item) => (
                  <button
                    key={item.s}
                    type="button"
                    onClick={() => {
                      setDuration(item.s);
                      setTimeLeft(item.s);
                      initDuckPositions(false);
                    }}
                    className={`px-2 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      duration === item.s ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CHỌN LOÀI VẬT ĐUA */}
            <div className="space-y-1 pt-1 border-t border-slate-800">
              <span className="text-[11px] text-slate-300 font-bold block">Linh vật đua:</span>
              <div className="grid grid-cols-3 gap-1">
                {RACER_ANIMALS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSelectedAnimal(a.id)}
                    className={`p-1.5 rounded-xl text-xs font-black transition cursor-pointer flex flex-col items-center ${
                      selectedAnimal === a.id ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-base">{a.icon}</span>
                    <span className="text-[10px]">{a.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* BẬT/TẮT LÀN TĂNG TỐC TURBO */}
            <div className="pt-1.5 border-t border-slate-800">
              <label className="flex items-center space-x-2 text-xs font-bold text-amber-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={turboActive}
                  onChange={(e) => setTurboActive(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span>Bật Làn Tăng Tốc Turbo Lane ⚡</span>
              </label>
            </div>

            {/* TÙY CHỌN LOẠI BỎ NGƯỜI THẮNG Ở LƯỢT KẾ TIẾP */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeWinnerNextRace}
                  onChange={(e) => setRemoveWinnerNextRace(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-slate-200">Loại người thắng ở lượt sau (Tạo cơ hội cho bạn khác)</span>
              </label>

              {excludedIds.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetExclusions}
                  className="w-full py-1.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-400/50 rounded-xl text-[11px] font-bold text-rose-200 transition cursor-pointer flex items-center justify-center space-x-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Khôi phục {excludedIds.length} bạn đã thắng</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 2. DÒNG SÔNG NƯỚC THẬT SỐNG ĐỘNG (CHUẨN 100% ẢNH 1 ONLINE-STOPWATCH) */}
        {/* =================================================================== */}
        <div className="flex-1 relative overflow-hidden bg-[#35738e] select-none">
          
          {/* CSS CHO SÓNG NƯỚC CHUẨN XÁC Y HỆT ẢNH 1 ONLINE-STOPWATCH */}
          <style>{`
            @keyframes realWaterWaves {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            @keyframes turboPulse {
              0%, 100% { opacity: 0.55; transform: scaleY(1); }
              50% { opacity: 0.85; transform: scaleY(1.08); }
            }
          `}</style>

          {/* CÁC ĐƯỜNG SÓNG NƯỚC THỰC SỰ CHUẨN ẢNH 1 (ONLINE-STOPWATCH.COM/DUCK) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Lớp sóng nước ngang chuẩn ảnh 1: dạng con thoi phình to thắt nhỏ uốn lượn liên tục */}
            <div 
              className="absolute inset-y-0 w-[200%] flex opacity-85"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 360' preserveAspectRatio='none'%3E%3Cpath d='M0,30 Q250,5 500,30 T1000,30 L1000,48 Q750,22 500,48 T0,48 Z' fill='%234888a4' opacity='0.75'/%3E%3Cpath d='M0,95 Q250,70 500,95 T1000,95 L1000,125 Q750,90 500,125 T0,125 Z' fill='%2343839f' opacity='0.65'/%3E%3Cpath d='M0,170 Q200,140 450,170 Q700,200 1000,170 L1000,210 Q700,240 450,210 Q200,180 0,210 Z' fill='%235193af' opacity='0.9'/%3E%3Cpath d='M0,260 Q250,240 500,260 T1000,260 L1000,285 Q750,265 500,285 T0,285 Z' fill='%234586a2' opacity='0.7'/%3E%3Cpath d='M0,325 Q200,305 450,325 Q700,345 1000,325 L1000,350 Q700,370 450,350 Q200,330 0,350 Z' fill='%234c8ea9' opacity='0.8'/%3E%3C/svg%3E")`,
                backgroundSize: '950px 100%',
                animation: 'realWaterWaves 3.8s linear infinite',
              }}
            />

            {/* Lớp sóng phụ ngược pha tạo sự dập dềnh đa chiều của mặt nước */}
            <div 
              className="absolute inset-y-0 w-[200%] flex opacity-50"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 360' preserveAspectRatio='none'%3E%3Cpath d='M0,60 Q250,85 500,60 T1000,60 L1000,75 Q750,100 500,75 T0,75 Z' fill='%235ea1bd' opacity='0.5'/%3E%3Cpath d='M0,140 Q250,165 500,140 T1000,140 L1000,158 Q750,183 500,158 T0,158 Z' fill='%235ea1bd' opacity='0.55'/%3E%3Cpath d='M0,230 Q250,255 500,230 T1000,230 L1000,248 Q750,273 500,248 T0,248 Z' fill='%235ea1bd' opacity='0.45'/%3E%3C/svg%3E")`,
                backgroundSize: '780px 100%',
                animation: 'realWaterWaves 6.2s linear infinite',
              }}
            />
          </div>

          {/* LÀN TĂNG TỐC TURBO LANE ⚡ (HIỆU ỨNG TRÒ CHƠI) */}
          {turboActive && !raceFinished && (
            <div 
              className="absolute left-[28%] right-[22%] top-[34%] h-24 pointer-events-none rounded-3xl border-y-2 border-amber-300/40 bg-gradient-to-r from-amber-400/10 via-cyan-400/25 to-amber-400/10 z-0 flex items-center justify-around overflow-hidden shadow-lg"
              style={{ animation: 'turboPulse 2s ease-in-out infinite' }}
            >
              <div className="flex items-center space-x-6 text-amber-200/60 font-black text-xs uppercase tracking-widest animate-pulse whitespace-nowrap">
                <span>⚡ TURBO LANE</span>
                <span>⚡ SPEED BOOST</span>
                <span>⚡ TURBO LANE</span>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* TRƯỜNG HỢP 1: KHI ĐÃ CÁN ĐÍCH (00:00:00) -> CHUẨN XÁC Y HỆT ẢNH 2! */}
          {/* CHỈ CÓ DUY NHẤT 1 LINH VẬT VÔ ĐỊCH BƠI QUA VẠCH ĐÍCH Ở GIỮA DÒNG SÔNG! */}
          {/* =================================================================== */}
          {raceFinished ? (
            <div className="absolute inset-0">
              {/* VẠCH ĐÍCH CARÔ BÊN TRÁI CHUẨN ẢNH 2 */}
              <div
                className="absolute left-6 top-0 bottom-0 w-12 shadow-2xl transform -skew-x-[22deg] origin-top border-x-4 border-slate-950 pointer-events-none z-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 12px, #fff 12px, #fff 24px)',
                }}
              />

              {/* CHÚ LINH VẬT CHIẾN THẮNG DUY NHẤT BƠI TRÊN SÔNG (CHUẨN ẢNH 2) */}
              <div
                className="absolute transition-all duration-300 z-20 cursor-pointer group"
                style={{
                  left: '45%',
                  top: '58%',
                }}
                title={`Quán quân: #${winnerStudentNumber} - ${winnerStudent?.full_name}`}
              >
                {/* Vệt nước rẽ sóng bọt trắng dập dềnh */}
                <div className="absolute -bottom-2 -left-6 w-32 h-8 bg-cyan-200/50 rounded-full blur-xs animate-pulse" />
                
                {/* Hình linh vật vàng to đẹp chuẩn ảnh 2 */}
                <div className="relative w-20 h-18 sm:w-24 sm:h-22 filter drop-shadow-xl transform hover:scale-110 transition animate-bounce">
                  {/* Vương miện vàng kiêu hãnh trên đầu quán quân */}
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-2xl filter drop-shadow-md">
                    👑
                  </div>

                  {renderAnimalSVG(selectedAnimal, winnerStudentNumber, true)}

                  {/* Số thứ tự học sinh in to rõ trên thân linh vật */}
                  <div className="absolute top-[48%] left-[22%] w-7 h-6 flex items-center justify-center font-black text-sm text-black font-sans pointer-events-none">
                    {winnerStudentNumber}
                  </div>

                  {/* Mũ phụ kiện ngộ nghĩnh */}
                  <div className="absolute -top-2 right-1 text-xl transform rotate-6 pointer-events-none">
                    {winnerHat.icon}
                  </div>
                </div>

                {/* TÊN ĐẦY ĐỦ CỦA HỌC SINH VÔ ĐỊCH NỔI BẬT DƯỚI BỤNG */}
                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 text-amber-300 border border-amber-400 font-black text-xs px-3 py-1 rounded-full shadow-xl z-30 pointer-events-none">
                  #{winnerStudentNumber}. {winnerStudent?.full_name}
                </div>
              </div>

              {/* HỘP ĐIỀU KHIỂN GÓC TRÊN BÊN TRÁI CHUẨN ẢNH 2 */}
              <div className="absolute top-4 left-4 z-30 bg-white/95 border-[3.5px] border-slate-900 rounded-2xl p-3 shadow-2xl flex flex-col space-y-2 animate-fade-in max-w-xs">
                {/* Checkbox loại người thắng ở lượt sau (chuẩn góc trên ảnh 2) */}
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1.5 border-b border-slate-200">
                  <span>Remove winner from next race?</span>
                  <input
                    type="checkbox"
                    checked={removeWinnerNextRace}
                    onChange={(e) => setRemoveWinnerNextRace(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-[#52c41a] hover:bg-[#43aa13] text-white font-black text-base rounded-xl border-2 border-slate-900 shadow-md transition cursor-pointer flex items-center justify-center space-x-2 active:scale-95"
                >
                  <RotateCcw className="w-5 h-5 stroke-[2.5]" />
                  <span>Race Again?</span>
                </button>

                <div className="text-xs font-black text-slate-900 pt-1 flex items-center justify-between gap-2">
                  <span className="truncate">
                    🏆 Quán quân: <strong className="text-emerald-700">#{winnerStudentNumber}. {winnerStudent?.full_name}</strong>
                  </span>
                  <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">+3⭐</span>
                </div>
              </div>

              {/* NÚT TRÒN CÚP VÀNG 🏆 Ở GÓC DƯỚI BÊN PHẢI CHUẨN ẢNH 2 */}
              <button
                type="button"
                onClick={() => setShowRankModal(true)}
                className="absolute bottom-5 right-5 z-30 w-16 h-16 bg-white hover:bg-amber-50 border-4 border-slate-900 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95 group"
                title="Bấm vào để xem Bảng Xếp Hạng Toàn Đoàn"
              >
                <Trophy className="w-8 h-8 text-slate-950 fill-amber-400 group-hover:rotate-12 transition-transform" />
              </button>
            </div>
          ) : (
            /* =================================================================== */
            /* TRƯỜNG HỢP 2: TRONG KHI ĐANG ĐUA / CHUẨN BỊ (CHUẨN ẢNH 3 & 4)      */
            /* =================================================================== */
            <div className="absolute inset-0">
              {/* VẠCH XUẤT PHÁT THẲNG ĐỨNG BÊN TRÁI */}
              <div
                className="absolute left-3 top-0 bottom-0 w-7 z-10 opacity-50 border-r-2 border-dashed border-black/40 pointer-events-none"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 8px, #fff 8px, #fff 16px)',
                }}
              />

              {/* VẠCH ĐÍCH THỂ THAO CARÔ THẲNG ĐỨNG CHUẨN XÁC Ở 84% (FINISH LINE) */}
              <div
                className="absolute top-0 bottom-0 w-12 z-20 shadow-2xl border-x-4 border-slate-950 pointer-events-none"
                style={{
                  left: '84%',
                  backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 12px, #fff 12px, #fff 24px)',
                }}
              >
                <div className="absolute top-2 -left-3 bg-red-600 border-2 border-white text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center space-x-1 whitespace-nowrap">
                  <span>🏁</span>
                  <span>ĐÍCH</span>
                </div>
                <div className="absolute bottom-4 -left-4 bg-red-600 border-2 border-white text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg uppercase tracking-wider flex items-center space-x-1 whitespace-nowrap">
                  <span>🏁</span>
                  <span>FINISH</span>
                </div>
              </div>

              {/* TẤT CẢ ĐÀN CON VẬT TRONG 1 KHUNG HÌNH (NO SCROLL) */}
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
                        zIndex: Math.floor(pos.y * 10),
                      }}
                      title={`#${studentNumber} - ${st.full_name}`}
                    >
                      {/* BỌT NƯỚC RIPPLE DƯỚI BỤNG KHI ĐANG BƠI */}
                      <div className={`absolute -bottom-1 -left-2 w-12 h-3.5 bg-cyan-200/40 rounded-full blur-2xs ${isRunning ? 'animate-pulse' : ''}`} />

                      {/* HIỆU ỨNG TIA SÉT TURBO KHI BƠI QUA LÀN TĂNG TỐC ⚡ */}
                      {pos.isTurbo && (
                        <div className="absolute -top-4 -right-1 text-xs text-amber-300 animate-bounce filter drop-shadow-xs">
                          ⚡
                        </div>
                      )}

                      {/* THÂN LINH VẬT SVG (Duck, Turtle, Fish, Crab, Shrimp) */}
                      <div className="relative w-12 h-11 sm:w-14 sm:h-13 flex-shrink-0 filter drop-shadow-md transform hover:scale-115 transition">
                        {renderAnimalSVG(selectedAnimal, studentNumber, false)}

                        {/* SỐ THỨ TỰ HỌC SINH IN TO RÕ TRÊN MÔNG / THÂN */}
                        <div className="absolute top-[48%] left-[23%] w-6 h-5 flex items-center justify-center font-black text-[11px] sm:text-xs text-black font-sans pointer-events-none">
                          {studentNumber}
                        </div>

                        {/* MŨ / PHỤ KIỆN HÀI HƯỚC TRÊN ĐẦU */}
                        <div className="absolute -top-3 right-0 text-base sm:text-lg transform rotate-6 pointer-events-none filter drop-shadow-xs">
                          {hat.icon}
                        </div>
                      </div>

                      {/* NHÃN TÊN ĐẦY ĐỦ CỦA HỌC SINH (KHI ĐUA: HIỆN ĐẦY ĐỦ; KHI CHƯA ĐUA: CHỈ HIỆN KHI RỜ CHUỘT ĐỂ TRÁNH ĐÈ NHAU) */}
                      <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-amber-200 font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white/20 z-30 pointer-events-none transition-opacity ${
                        isRunning ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {studentNumber}. {st.full_name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DÒNG HƯỚNG DẪN DƯỚI ĐÁY SÔNG */}
              <div className="absolute bottom-2 left-6 z-20 text-[11px] font-bold text-cyan-200/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs flex items-center space-x-2">
                <span>💡 {RACER_ANIMALS.find(a => a.id === selectedAnimal)?.name}: Bơi chậm rãi ban đầu và bứt phá trong 5 giây cuối!</span>
                {turboActive && <span className="text-amber-300">⚡ Có Làn Turbo tăng tốc</span>}
                {excludedIds.length > 0 && (
                  <span className="text-rose-300">({excludedIds.length} bạn đã thắng đang tạm nghỉ)</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* =================================================================== */}
        {/* 4. MODAL BẢNG XẾP HẠNG TOÀN ĐOÀN (THỐNG KÊ TẤT CẢ HỌC SINH THAM GIA) */}
        {/* =================================================================== */}
        {showRankModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 p-4 animate-scale-up backdrop-blur-xs">
            <div className="bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 p-1.5 rounded-[2.5rem] shadow-2xl max-w-lg w-full border-4 border-amber-200 flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-b from-[#0b1b36] to-[#060e1d] rounded-[2.2rem] p-5 text-center text-white flex flex-col flex-1 overflow-hidden">
                
                {/* HEADER BẢNG XẾP HẠNG */}
                <div className="flex-shrink-0 space-y-1 mb-3">
                  <span className="text-4xl animate-bounce inline-block">🏆 🦆 🏆</span>
                  <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wider drop-shadow-md">
                    BẢNG XẾP HẠNG TOÀN ĐOÀN
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Thống kê đầy đủ kết quả chặng đua của tất cả {displayRankings.length} học sinh!
                  </p>
                </div>

                {/* DANH SÁCH CUỘN MƯỢT MÀ CHỨA TOÀN BỘ HỌC SINH */}
                <div className="flex-1 overflow-y-auto pr-1.5 space-y-2 custom-scrollbar">
                  {/* TOP 3 VINH DỰ ĐẦU BẢNG */}
                  {displayRankings.slice(0, 3).map((st, idx) => {
                    const medals = ['🥇', '🥈', '🥉'];
                    const titles = ['QUÁN QUÂN (+3 ⭐)', 'Á QUÂN (+2 ⭐)', 'QUÝ QUÂN (+1 ⭐)'];
                    const borders = ['border-amber-400 bg-amber-500/15', 'border-slate-300 bg-slate-400/15', 'border-amber-700 bg-amber-800/15'];
                    const stIdx = racerStudents.findIndex((s) => s.id === st.id) + 1;

                    return (
                      <div
                        key={st.id}
                        className={`p-2.5 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-md ${borders[idx]}`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <span className="text-3xl flex-shrink-0">{medals[idx]}</span>
                          <div className="text-left min-w-0">
                            <span className="text-sm font-black text-white block">
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

                  {/* CÁC THỨ HẠNG CÒN LẠI TỪ HẠNG 4 ĐẾN HẾT */}
                  {displayRankings.length > 3 && (
                    <div className="pt-2">
                      <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider text-left mb-1.5 px-2">
                        Các Vị Trí Về Đích Tiếp Theo:
                      </div>
                      <div className="space-y-1.5">
                        {displayRankings.slice(3).map((st, i) => {
                          const rankNum = i + 4;
                          const stIdx = racerStudents.findIndex((s) => s.id === st.id) + 1;

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
                                  #{stIdx}. {st.full_name}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  playWinner();
                                  if (onAwardStudent) onAwardStudent(st.id, 1);
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 font-bold text-[10px] rounded-lg transition cursor-pointer flex items-center space-x-1"
                                title="Thưởng 1 sao khích lệ"
                              >
                                <Award className="w-3 h-3" />
                                <span>+1 ⭐</span>
                              </button>
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
