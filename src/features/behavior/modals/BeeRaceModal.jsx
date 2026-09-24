import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Volume2, VolumeX, Settings, Shuffle, RefreshCw, UserCheck, Bell, RotateCcw } from 'lucide-react';
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

// Thuật toán xáo trộn Fisher-Yates chuẩn xác 100% ngẫu nhiên toán học
function fisherYatesShuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 9 kiểu phụ kiện vui nhộn cho đàn vịt chuẩn Online-Stopwatch (Mũ bếp trưởng, Mũ len, Sừng tuần lộc, Tim hồng, Kính lặn...)
const DUCK_ACCESSORIES = [
  'chef',        // Mũ bếp trưởng + thìa bạc
  'beanie',      // Mũ len mùa đông có hoa tuyết
  'reindeer',    // Sừng tuần lộc + mũi đỏ Rudolph
  'hearts',      // Vịt hồng có họa tiết trái tim
  'diver',       // Kính bơi lặn có ống thở
  'hardhat',     // Mũ bảo hộ công nhân cam
  'snowman',     // Mũ người tuyết xanh tuyết
  'strawberry',  // Mũ dâu tây có cuống xanh
  'classic',     // Vịt vàng nguyên bản đáng yêu
];

export default function BeeRaceModal({ isOpen, onClose, students = [] }) {
  const [duration, setDuration] = useState(60); // 60 giây = 00:01:00 chuẩn theo Ảnh Thầy gửi
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [showRankModal, setShowRankModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false); // Trạng thái về đích
  const [winnerStudent, setWinnerStudent] = useState(null); // Học sinh thắng cuộc
  const [winnerNumber, setWinnerNumber] = useState(1); // Số áo học sinh thắng cuộc
  const [removeWinnerNextRace, setRemoveWinnerNextRace] = useState(true); // Loại người thắng ở vòng sau
  const [excludedIds, setExcludedIds] = useState([]); // Danh sách học sinh đã được gọi
  const [showFinishLine, setShowFinishLine] = useState(false); // Vạch đích chỉ hiện khi thời gian còn ít (<= 3s)

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
  const pendingWinnerRef = useRef(null);
  const pendingWinnerNumberRef = useRef(null);

  // Format đồng hồ điện tử chuẩn Stopwatch (00:01:00 hoặc 00:00:10)
  const formatStopwatch = (totalSec) => {
    const mins = Math.floor(Math.max(0, totalSec) / 60);
    const secs = Math.max(0, totalSec) % 60;
    return `00:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Đua lại vòng mới (loại bạn vừa thắng nếu giáo viên có tích chọn)
  const handleRaceAgain = () => {
    if (soundEnabled) playClick();
    if (removeWinnerNextRace && winnerStudent) {
      setExcludedIds((prev) => (prev.includes(winnerStudent.id) ? prev : [...prev, winnerStudent.id]));
    }
    setTimeout(() => {
      initDuckPositions();
    }, 40);
  };

  // Lấy số áo chuẩn theo danh sách lớp để học sinh luôn nhận diện đúng số của mình
  const getStudentNumber = (student) => {
    const originalIndex = students.findIndex((s) => s.id === student?.id);
    return originalIndex >= 0 ? originalIndex + 1 : 1;
  };

  // Tính toán scale kích thước con vật để vừa vặn trong 1 màn hình
  const studentCount = racerStudents.length;
  let animalScale = 1.0;
  if (studentCount > 35) {
    animalScale = 0.65;
  } else if (studentCount > 25) {
    animalScale = 0.78;
  } else if (studentCount > 15) {
    animalScale = 0.88;
  }

  // Tọa độ vạch xuất phát nghiêng -20 độ (Ảnh 1)
  // Ở y=18% thì lineX=28%, ở y=88% thì lineX=13%
  const getStartingPos = (idx, count) => {
    const yPercent = count > 1 ? (18 + (idx / (count - 1)) * 70) : 50;
    const lineX = 28 - ((yPercent - 18) / 70) * 15;
    const startX = lineX - 7.5;
    return { x: startX, y: yPercent };
  };

  // Khởi tạo vị trí đàn thú đua tại vạch xuất phát xếp hàng xéo ngay ngắn (Ảnh 1)
  const initDuckPositions = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    stopRiverWaterSound();
    setIsRunning(false);
    setIsPaused(false);
    setRaceFinished(false);
    setShowFinishLine(false);
    setWinnerStudent(null);
    setWinnerNumber(null);
    pendingWinnerRef.current = null;
    pendingWinnerNumberRef.current = null;
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;
    setShowRankModal(false);

    const count = racerStudents.length;
    if (count === 0) return;

    racerStudents.forEach((st, idx) => {
      const { x, y } = getStartingPos(idx, count);
      const domEl = duckDomRefs.current[st.id];
      if (domEl) {
        domEl.style.left = `${x}%`;
        domEl.style.top = `${y}%`;
        domEl.style.transform = `translate(-50%, -50%) scale(${animalScale})`;
      }
    });
  };

  // Re-init khi mở modal hoặc thay đổi thời gian/số lượng học sinh
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        initDuckPositions();
      }, 40);
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
    pendingWinnerRef.current = realWinner;
    pendingWinnerNumberRef.current = winnerStNum;
    setWinnerStudent(null);
    setWinnerNumber(null);
    setShowFinishLine(false); // VẠCH ĐÍCH CHƯA HIỆN RA KHI VỪA XUẤT PHÁT!

    const configs = {};

    racerStudents.forEach((st, idx) => {
      const { x, y } = getStartingPos(idx, count);
      const rankIndex = shuffledStudents.findIndex((s) => s.id === st.id);
      const isWinner = rankIndex === 0;

      // Quán quân: Vượt qua vạch đích 78% sang vùng 89% (ĐÚNG Ô ĐỎ NHƯ ẢNH THẦY GỬI!)
      // Các con còn lại: Tản mác dừng lại bên trái vạch đích (<= 68%)
      let finalTargetX = 0;
      let finalTargetY = y;
      if (isWinner) {
        finalTargetX = 89.0; // Vượt qua vạch đích carô nghiêng 78%, bơi vào vị trí 89%
        finalTargetY = 48.0; // Nằm ở giữa độ cao dòng sông lơ lửng trên sóng nước
      } else {
        const normRank = (rankIndex - 1) / Math.max(1, count - 2);
        const staggerX = ((idx * 7) % 10) - 5;
        finalTargetX = Math.max(28, Math.min(68, 66 - normRank * 35 + staggerX));
        finalTargetY = Math.max(18, Math.min(84, y + ((idx % 5) - 2) * 4));
      }

      configs[st.id] = {
        isWinner,
        rankIndex,
        finalTargetX,
        finalTargetY,
        wobbleFreq: 1.8 + Math.random() * 1.4,
        wobbleAmp: 0.8 + Math.random() * 0.8,
        startY: y,
        startX: x,
      };
    });

    duckConfigRef.current = configs;

    if (soundEnabled) {
      playRaceHorn();
      setTimeout(playQuack, 160);
      startRiverWaterSound();
    }

    setIsRunning(true);
    setIsPaused(false);
    setShowRankModal(false);
    setRaceFinished(false);
    setTimeLeft(duration);
    pausedElapsedRef.current = 0;

    startTimeRef.current = performance.now();
    runAnimationLoop();
  };

  // Tạm dừng cuộc đua
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

  // Xáo trộn vị trí xuất phát của đàn vịt (Shuffle Characters)
  const handleShuffleCharacters = () => {
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

  // Xác nhận gọi em này lên bảng trả bài
  const handleConfirmCallStudent = () => {
    if (!winnerStudent) return;
    if (soundEnabled) playClick();
    if (removeWinnerNextRace) {
      setExcludedIds((prev) => (prev.includes(winnerStudent.id) ? prev : [...prev, winnerStudent.id]));
    }
    onClose();
  };

  // Vòng lặp chuyển động bơi 60FPS:
  // Lúc đua: vịt bơi tự do, vạch đích chưa hiện
  // Khi còn <= 3 giây: Vạch đích 78% hiện ra, vịt quán quân lao qua vạch tới 89% (Ô ĐỎ NHƯ ẢNH THẦY GỬI)
  // Khi cán đích: VỊT QUÁN QUÂN LƠ LỬNG TRÊN SÓNG NƯỚC TẠI 89% ĐỂ CẢ LỚP BIẾT MÌNH VỀ NHẤT!
  const runAnimationLoop = () => {
    const durationMs = duration * 1000;
    let lastSecond = Math.ceil((durationMs - pausedElapsedRef.current) / 1000);

    const step = (now) => {
      const elapsed = now - startTimeRef.current;
      pausedElapsedRef.current = elapsed;
      const progress = Math.min(1, elapsed / durationMs);

      const secondsRemaining = Math.max(0, Math.ceil((durationMs - elapsed) / 1000));
      if (secondsRemaining !== lastSecond) {
        lastSecond = secondsRemaining;
        setTimeLeft(secondsRemaining);
        if (soundEnabled && secondsRemaining > 0) playTick();
        if (secondsRemaining <= 3 && soundEnabled && secondsRemaining > 0) playQuack();
      }

      // CHỈ KHI THỜI GIAN CÒN ÍT (<= 3 giây) VÀ ĐÀN VỊT SẮP VỀ ĐÍCH: VẠCH ĐÍCH MỚI XUẤT HIỆN Ở BÊN PHẢI (78%)!
      if (secondsRemaining <= 3 && progress < 1) {
        setShowFinishLine(true);
      } else if (progress < 1) {
        setShowFinishLine(false);
      }

      racerStudents.forEach((st, idx) => {
        const cfg = duckConfigRef.current[st.id] || {
          startX: 10,
          startY: 30,
          finalTargetY: 30,
          isWinner: idx === 0,
          rankIndex: idx,
          finalTargetX: 50,
          wobbleFreq: 2.0,
          wobbleAmp: 1.0,
        };

        let currentX = cfg.startX;

        if (cfg.isWinner) {
          // QUÁN QUÂN: Bứt phá dần dần, ở 2s cuối dẫn đầu khoảng 45%, cán đích và bơi sang 89% ở 0s (VƯỢT VẠCH 78% NHƯ ẢNH THẦY GỬI!)
          if (progress < 0.6) {
            const phase1 = Math.pow(progress / 0.6, 1.25);
            currentX = cfg.startX + (42 - cfg.startX) * phase1;
          } else {
            const sprintRatio = (progress - 0.6) / 0.4;
            const burstCurve = Math.pow(sprintRatio, 1.15);
            currentX = 42 + (cfg.finalTargetX - 42) * burstCurve;
          }
          currentX += Math.sin((elapsed / 200) * cfg.wobbleFreq) * 0.5;
        } else {
          // CÁC CON VỊT CÒN LẠI: Bơi theo đàn tụ lại phía sau, dừng lại an toàn trước vạch đích (<= 68%)
          const normalCurve = Math.pow(progress, 1.15);
          const normalX = cfg.startX + (cfg.finalTargetX - cfg.startX) * normalCurve;
          const wobble = Math.sin((elapsed / 260) * cfg.wobbleFreq + idx) * 0.8;
          currentX = Math.min(68.0, normalX + wobble);
        }

        const targetY = cfg.finalTargetY || cfg.startY;
        const currentBaseY = cfg.startY + (targetY - cfg.startY) * progress;
        const waveY = currentBaseY + Math.sin((elapsed / 240) * cfg.wobbleFreq + idx) * cfg.wobbleAmp;

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
        // ĐÃ CÁN ĐÍCH: DỪNG LẠI, VỊT VỀ NHẤT NẰM LƠ LỬNG Ở 89% (ĐÚNG Ô ĐỎ THẦY KHOANH!)
        stopRiverWaterSound();
        setIsRunning(false);
        setIsPaused(false);
        setWinnerStudent(pendingWinnerRef.current);
        setWinnerNumber(pendingWinnerNumberRef.current);
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

        // VỊT QUÁN QUÂN VÀ ĐÀN VỊT GIỮ NGUYÊN TRÊN DÒNG NƯỚC (KHÔNG TỰ Ý RESET HOẶC LOẠI HỌC SINH TẠI ĐÂY)
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  // Danh sách hiển thị Bảng Xếp Hạng
  const displayRankings = rankings.length > 0 ? rankings : racerStudents;

  // ===================================================================
  // HÀM VẼ CHÚ VỊT CAO SU THẦN THÁNH CHUẨN ONLINE-STOPWATCH 100%
  // CÓ BIỂN SỐ ÁO BẦU DỤC VÀ 9 PHỤ KIỆN VUI NHỘN (ĐẦU BẾP, MŨ LEN, TUẦN LỘC...)
  // ===================================================================
  const renderDuckSVG = (variant, number) => {
    const isPink = variant === 'hearts';
    const isReindeer = variant === 'reindeer';
    const bodyColor = isPink ? '#f472b6' : isReindeer ? '#854d0e' : '#ffd000';
    const bodyStroke = '#0f172a';
    const beakColor = '#f97316';

    return (
      <svg viewBox="0 0 110 95" className="w-full h-full filter drop-shadow-md overflow-visible">
        {/* 1. THÂN VỊT CAO SU UỐN LƯỢN CHUẨN MẪU ONLINE-STOPWATCH */}
        <g>
          {/* Đuôi nhọn hếch lên bên trái, lưng cong mềm mại, ức tròn */}
          <path
            d="M 18,38 Q 12,24 6,20 Q 9,36 14,50 Q 18,74 38,76 Q 66,76 74,58 Q 78,50 78,42 Q 72,42 66,48 Q 50,56 36,54 Q 24,52 18,38 Z"
            fill={bodyColor}
            stroke={bodyStroke}
            strokeWidth="3.2"
          />

          {/* Cánh vịt gập bên hông */}
          <path
            d="M 32,54 Q 48,52 58,44 Q 52,60 38,62 Z"
            fill={isPink ? '#ec4899' : isReindeer ? '#713f12' : '#f59e0b'}
            stroke={bodyStroke}
            strokeWidth="2.5"
          />

          {/* Họa tiết tim nếu là vịt hearts */}
          {isPink && (
            <g fill="#db2777" opacity="0.6">
              <path d="M 30,60 A 2,2 0 0,0 26,60 Q 26,63 28,65 Q 30,63 30,60 Z" />
              <path d="M 44,56 A 2,2 0 0,0 40,56 Q 40,59 42,61 Q 44,59 44,56 Z" />
              <path d="M 52,62 A 2,2 0 0,0 48,62 Q 48,65 50,67 Q 52,65 52,62 Z" />
            </g>
          )}

          {/* ĐẦU VỊT TRÒN TRỊA */}
          <circle cx="68" cy="34" r="22" fill={bodyColor} stroke={bodyStroke} strokeWidth="3.2" />

          {/* MỎ VỊT CAM DÀY KHỎE HƯỚNG VỀ PHÍA TRƯỚC */}
          <path
            d="M 86,34 Q 106,36 102,44 Q 92,48 84,42 Z"
            fill={beakColor}
            stroke={bodyStroke}
            strokeWidth="2.8"
          />
          <line x1="86" y1="39" x2="98" y2="40" stroke="#9a3412" strokeWidth="2" />

          {/* MẮT VỊT HOẠT HÌNH TO TRÒN HÀI HƯỚC */}
          <circle cx="76" cy="28" r="5.5" fill="#ffffff" stroke={bodyStroke} strokeWidth="2.2" />
          <circle cx="78" cy="28" r="3.2" fill="#0f172a" />
          <circle cx="79.5" cy="26.5" r="1.2" fill="#ffffff" />

          {/* BIỂN SỐ ÁO BẦU DỤC MÀU TRẮNG TRÊN THÂN (CHUẨN ẢNH MẪU 100%) */}
          <ellipse cx="40" cy="62" rx="16" ry="11" fill="#ffffff" stroke="#000000" strokeWidth="2.6" />
          <text
            x="40"
            y="66.5"
            textAnchor="middle"
            fill="#000000"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize={number > 99 ? '11' : number > 9 ? '13' : '15'}
          >
            {number}
          </text>
        </g>

        {/* 2. CÁC PHỤ KIỆN VUI NHỘN THEO PHONG CÁCH ONLINE-STOPWATCH */}
        {/* A. Mũ Đầu Bếp + Thìa Bạc (Chef Hat) */}
        {variant === 'chef' && (
          <g>
            <path
              d="M 54,20 Q 50,6 64,8 Q 68,0 78,4 Q 86,2 86,14 Q 88,20 84,22 L 56,22 Z"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            <rect x="56" y="19" width="28" height="4" fill="#e2e8f0" stroke="#0f172a" strokeWidth="1.5" />
            <ellipse cx="80" cy="58" rx="5" ry="3.5" fill="#cbd5e1" stroke="#334155" strokeWidth="1.5" transform="rotate(-30 80 58)" />
            <line x1="78" y1="58" x2="64" y2="50" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}

        {/* B. Mũ len mùa đông có quả bông (Beanie) */}
        {variant === 'beanie' && (
          <g>
            <path d="M 56,22 Q 68,6 80,22 Z" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="68" cy="8" r="4.5" fill="#ffffff" stroke="#0f172a" strokeWidth="2" />
            <rect x="54" y="20" width="28" height="5" rx="2" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.8" />
            <text x="68" y="19" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">❄</text>
          </g>
        )}

        {/* C. Sừng tuần lộc nâu + Mũi đỏ Rudolph (Reindeer) */}
        {variant === 'reindeer' && (
          <g>
            <path d="M 64,18 L 60,6 M 60,10 L 54,8 M 60,6 L 62,2" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 72,18 L 76,6 M 76,10 L 82,8 M 76,6 L 74,2" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="98" cy="40" r="3.5" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
          </g>
        )}

        {/* D. Mũ công nhân màu cam (Hardhat) */}
        {variant === 'hardhat' && (
          <g>
            <path d="M 54,20 Q 68,8 82,20 Z" fill="#f97316" stroke="#0f172a" strokeWidth="2.5" />
            <path d="M 50,21 Q 68,17 86,21" stroke="#ea580c" strokeWidth="4" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* E. Kính bơi lặn (Snorkel Goggles) */}
        {variant === 'diver' && (
          <g>
            <rect x="66" y="24" width="18" height="9" rx="4" fill="#38bdf8" fillOpacity="0.75" stroke="#0369a1" strokeWidth="2" />
            <path d="M 84,28 Q 90,28 92,20 L 92,12" stroke="#0284c7" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* F. Mũ người tuyết xanh tuyết (Snowman top hat) */}
        {variant === 'snowman' && (
          <g>
            <rect x="58" y="4" width="18" height="14" fill="#0284c7" stroke="#0f172a" strokeWidth="2.5" />
            <rect x="52" y="16" width="30" height="4" rx="2" fill="#0369a1" stroke="#0f172a" strokeWidth="2" />
            <text x="67" y="13" textAnchor="middle" fill="#ffffff" fontSize="8">❄</text>
          </g>
        )}

        {/* G. Mũ Dâu Tây (Strawberry hat) */}
        {variant === 'strawberry' && (
          <g>
            <path d="M 58,22 Q 68,10 78,22 Z" fill="#ef4444" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="68" cy="9" r="2.5" fill="#22c55e" />
            <line x1="68" y1="9" x2="68" y2="4" stroke="#15803d" strokeWidth="2" />
          </g>
        )}
      </svg>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-fade-in select-none">
      <div className="relative w-full max-w-6xl h-[94vh] bg-[#0c1326] rounded-[2rem] overflow-hidden shadow-2xl flex flex-col border-[3px] border-amber-500/80">
        
        {/* CSS CHUYỂN ĐỘNG LƠ LỬNG TRÊN SÓNG NƯỚC CHO VỊT VỀ NHẤT VÀ ĐÀN VỊT */}
        <style>{`
          @keyframes floatRippleWinner {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px) rotate(0deg) scale(${animalScale * 1.08});
            }
            50% {
              transform: translate(-50%, -50%) translateY(-6px) rotate(1.2deg) scale(${animalScale * 1.08});
            }
          }
          .duck-winner-floating {
            animation: floatRippleWinner 2s ease-in-out infinite !important;
          }

          @keyframes duckIdleWaves {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px) scale(${animalScale});
            }
            50% {
              transform: translate(-50%, -50%) translateY(-3px) scale(${animalScale});
            }
          }
          .duck-idle-floating {
            animation: duckIdleWaves 2.6s ease-in-out infinite;
          }
        `}</style>

        {/* =================================================================== */}
        {/* 1. BÃI CỎ XANH TRÊN CÙNG + ĐỒNG HỒ DIGITAL STOPWATCH (CHUẨN ẢNH 1-4)   */}
        {/* =================================================================== */}
        <div className="relative z-30 h-28 sm:h-32 bg-[#22c55e] border-b-[5px] border-[#854d0e] flex items-center justify-between px-4 sm:px-6 overflow-hidden shadow-md flex-shrink-0">
          {/* CÁC BỤI CỎ VÀ CÂY XANH TỰ NHIÊN TRÊN BÃI CỎ */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-2 left-16 w-10 h-10 rounded-full bg-[#15803d]" />
            <div className="absolute top-5 left-36 w-8 h-8 rounded-full bg-[#16a34a]" />
            <div className="absolute top-3 right-20 w-12 h-12 rounded-full bg-[#15803d]" />
            <div className="absolute top-6 right-48 w-8 h-8 rounded-full bg-[#16a34a]" />
          </div>

          {/* CỤM NÚT ĐIỀU KHIỂN BÊN TRÁI (CHUẨN 100% ẢNH 1) */}
          <div className="relative z-10 flex flex-col space-y-1.5">
            <div className="flex items-center space-x-1.5">
              {/* Nút Gear (Cài đặt) */}
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="w-8 h-8 rounded-lg bg-black text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition"
                title="Cài đặt thời gian đua"
              >
                <Settings className="w-4 h-4 stroke-[2.5]" />
              </button>

              {/* Nút Âm nhạc */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="w-8 h-8 rounded-lg bg-black text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition"
                title="Bật/Tắt âm thanh"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 stroke-[2.5]" /> : <VolumeX className="w-4 h-4 stroke-[2.5]" />}
              </button>

              {/* Nút Chuông */}
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playRaceHorn();
                }}
                className="w-8 h-8 rounded-lg bg-black text-white hover:bg-slate-800 border border-slate-700 flex items-center justify-center cursor-pointer shadow-sm active:scale-95 transition"
                title="Bấm còi hiệu"
              >
                <Bell className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* CẶP NÚT START / CONTINUE VÀ CLEAR */}
            <div className="flex items-center space-x-2 text-white font-black text-xs sm:text-sm drop-shadow-md">
              {!isRunning ? (
                <button
                  type="button"
                  onClick={handleStartOrContinue}
                  className="hover:underline cursor-pointer active:scale-95 text-white flex items-center space-x-1"
                >
                  <span>{isPaused ? 'Continue' : 'Start'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePause}
                  className="hover:underline cursor-pointer active:scale-95 text-amber-200 flex items-center space-x-1"
                >
                  <span>Pause</span>
                </button>
              )}

              <span>•</span>

              <button
                type="button"
                onClick={handleClear}
                className="hover:underline cursor-pointer active:scale-95 text-white"
              >
                Clear
              </button>
            </div>

            {/* NÚT SHUFFLE CHARACTERS (CHUẨN ẢNH 1) */}
            <button
              type="button"
              onClick={handleShuffleCharacters}
              disabled={isRunning}
              className="px-2 py-0.5 bg-[#15803d] hover:bg-[#166534] disabled:opacity-50 text-white font-bold text-[10px] sm:text-[11px] rounded-md border border-[#14532d] shadow-xs cursor-pointer flex items-center space-x-1 whitespace-nowrap active:scale-95 transition w-fit"
            >
              <Shuffle className="w-3 h-3" />
              <span>Shuffle Characters</span>
            </button>
          </div>

          {/* HỘP ĐỒNG HỒ ĐẾM NGƯỢC DIGITAL STOPWATCH TO TRÒN CHÍNH GIỮA (CHUẨN ẢNH 1-4) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="px-6 sm:px-10 py-2 sm:py-3 bg-[#e8edff] border-[4px] border-black rounded-[1.8rem] sm:rounded-[2.2rem] shadow-[0_8px_0_#94a3b8] font-mono text-3xl sm:text-5xl font-black text-black tracking-wider select-none">
              {formatStopwatch(timeLeft)}
            </div>
          </div>

          {/* LOGO GÓC TRÊN PHẢI VÀ NÚT ĐÓNG */}
          <div className="relative z-10 flex items-center space-x-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[11px] font-black text-black tracking-wide bg-white/80 px-2 py-0.5 rounded-full border border-black/30 shadow-xs">
                🦆 Online-Stopwatch LMS
              </span>
              <span className="text-[10px] font-bold text-slate-900 mt-0.5">
                Sĩ số: <strong>{racerStudents.length}</strong> thí sinh
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/30 hover:bg-black text-white flex items-center justify-center transition cursor-pointer"
              title="Đóng trò chơi"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* POPOVER CÀI ĐẶT THỜI GIAN ĐUA */}
        {showSettings && (
          <div className="absolute top-28 left-6 z-50 bg-slate-900 border-2 border-amber-400 p-4 rounded-2xl text-white shadow-2xl space-y-3 animate-fade-in w-72">
            <span className="text-xs font-black text-amber-300 block uppercase">Cài đặt thời gian đua:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { s: 60, label: '1 phút (Chuẩn 00:01:00)' },
                { s: 30, label: '30 giây' },
                { s: 15, label: '15 giây' },
                { s: 10, label: '10 giây' },
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
        {/* 2. DÒNG SÔNG NƯỚC SÂU TOÀN VẸN (CHUẨN 100% ẢNH THẦY GỬI)             */}
        {/* ĐÀN VỊT VÀ VẠCH ĐÍCH GIỮ NGUYÊN VỊ TRÍ, KHÔNG CHUYỂN MÀN HÌNH GIẢ TẠO */}
        {/* VỊT VỀ NHẤT BƠI QUA VẠCH ĐÍCH LƠ LỬNG TRÊN DÒNG NƯỚC Ở VÙNG 89%      */}
        {/* =================================================================== */}
        <div className="flex-1 relative overflow-hidden bg-[#2581ab] select-none flex flex-col">
          {/* LỚP SÓNG NƯỚC NGANG HOẠT HỌA */}
          <div className="absolute inset-0 pointer-events-none opacity-25">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="riverWavePattern" x="0" y="0" width="120" height="28" patternUnits="userSpaceOnUse">
                  <path d="M 0,14 Q 30,6 60,14 Q 90,22 120,14" fill="none" stroke="#ffffff" strokeWidth="2.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#riverWavePattern)" />
            </svg>
          </div>

          {/* VẠCH XUẤT PHÁT: CHỈ HIỆN KHI CHƯA BẮT ĐẦU ĐUA (ẢNH 1) */}
          {!isRunning && !raceFinished && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-15 shadow-2xl origin-top border-x-[3.5px] border-black"
              style={{
                width: '42px',
                left: '28%',
                transform: 'skewX(-20deg)',
                backgroundImage: `repeating-conic-gradient(#000000 0% 25%, #ffffff 0% 50%)`,
                backgroundSize: '21px 21px',
                borderTop: '4px solid black',
                borderBottom: '4px solid black',
              }}
            />
          )}

          {/* VẠCH ĐÍCH: HIỆN KHI THỜI GIAN CÒN ÍT (<= 3s) HOẶC KHI ĐÃ CÁN ĐÍCH (ĐÚNG NHƯ ẢNH THẦY GỬI!) */}
          {(showFinishLine || raceFinished) && (
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-15 shadow-2xl origin-top border-x-[3.5px] border-black animate-fade-in"
              style={{
                width: '42px',
                left: '78%',
                transform: 'skewX(-20deg)',
                backgroundImage: `repeating-conic-gradient(#000000 0% 25%, #ffffff 0% 50%)`,
                backgroundSize: '21px 21px',
                borderTop: '4px solid black',
                borderBottom: '4px solid black',
              }}
            />
          )}

          {/* HỘP NÚT ĐUA LẠI KHI CUỘC ĐUA KẾT THÚC (GÓC TRÊN TRÁI GỌN GÀNG) */}
          {raceFinished && (
            <div className="absolute top-4 left-4 z-40 bg-white/95 border-[3px] border-black rounded-2xl p-2.5 shadow-2xl flex items-center space-x-3 animate-scale-up">
              <button
                type="button"
                onClick={handleRaceAgain}
                className="px-4 py-2 bg-[#48bb78] hover:bg-[#38a169] text-white font-black text-xs rounded-xl shadow-md border-2 border-black active:scale-95 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Race Again? (Đua Lại)</span>
              </button>

              <label className="flex items-center space-x-1.5 text-[11px] font-black text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={removeWinnerNextRace}
                  onChange={(e) => setRemoveWinnerNextRace(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer accent-emerald-600"
                />
                <span>Loại quán quân vòng sau?</span>
              </label>
            </div>
          )}

          {/* KHUNG DÒNG SÔNG DUY NHẤT CHỨA TẤT CẢ ĐÀN VỊT CHUẨN 100% ẢNH THẦY GỬI */}
          <div className="flex-1 relative">
            <div className="absolute inset-0">
              {racerStudents.map((st, idx) => {
                const studentNumber = getStudentNumber(st);
                const variant = DUCK_ACCESSORIES[idx % DUCK_ACCESSORIES.length];
                const { x, y } = getStartingPos(idx, studentCount);
                const isWinner = raceFinished && winnerStudent?.id === st.id;
                const cfg = duckConfigRef.current[st.id];

                // Khi kết thúc cuộc đua:
                // - Vịt chiến thắng bơi lơ lửng tại 88%, y ~ 50% (đúng trong ô đỏ Thầy khoanh)
                // - Đàn vịt còn lại đứng nguyên trước vạch đích (cfg.finalTargetX, cfg.finalTargetY), KHÔNG bị giật về vạch xuất phát
                // - Khi chưa bắt đầu, đứng tại vị trí xuất phát x, y
                const posX = raceFinished 
                  ? (isWinner ? 88.0 : (cfg?.finalTargetX ?? Math.min(68, x + 35))) 
                  : x;
                const posY = raceFinished 
                  ? (isWinner ? 50.0 : (cfg?.finalTargetY ?? y)) 
                  : y;

                return (
                  <div
                    key={st.id}
                    ref={(el) => {
                      duckDomRefs.current[st.id] = el;
                    }}
                    className={`absolute cursor-pointer group ${
                      isWinner ? 'duck-winner-floating z-40' : raceFinished ? 'duck-idle-floating' : ''
                    }`}
                    style={{
                      left: `${posX}%`,
                      top: `${posY}%`,
                      transform: `translate(-50%, -50%) scale(${animalScale})`,
                      zIndex: isWinner ? 50 : Math.floor(posY * 10),
                      transition: isRunning ? 'none' : 'all 0.4s ease-out',
                    }}
                    title={`#${studentNumber} - ${st.full_name}`}
                    onClick={() => {
                      if (isWinner) setShowRankModal(true);
                    }}
                  >
                    {/* BỌT NƯỚC RẼ SÓNG DƯỚI BỤNG */}
                    <div className={`absolute -bottom-1 -left-1 w-11 h-3 bg-cyan-200/40 rounded-full blur-2xs ${isRunning || isWinner ? 'animate-pulse' : ''}`} />

                    {/* THÂN CHÚ VỊT SVG */}
                    <div className="relative w-14 h-12 flex-shrink-0 filter drop-shadow-md transform hover:scale-125 transition">
                      {renderDuckSVG(variant, studentNumber)}
                    </div>

                    {/* NẾU LÀ VỊT VỀ NHẤT (LƠ LỬNG SAU VẠCH ĐÍCH NHƯ ẢNH THẦY KHOANH ĐỎ): HIỆN VƯƠNG MIỆN & TÊN RÕ RÀNG */}
                    {isWinner && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-400 text-slate-950 font-black text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full shadow-xl border-2 border-amber-200 z-50 flex items-center space-x-1 pointer-events-none animate-bounce">
                        <span>👑</span>
                        <span>#{winnerNumber}. {winnerStudent?.full_name}</span>
                      </div>
                    )}

                    {/* NHÃN TÊN HỌC SINH KHI RÊ CHUỘT NẾU KHÔNG PHẢI QUÁN QUÂN */}
                    {!isWinner && (
                      <div className={`absolute -bottom-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/85 text-amber-200 font-extrabold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white/20 z-30 pointer-events-none transition-opacity ${
                        isRunning ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        {studentNumber}. {st.full_name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* NÚT TRÒN CÚP VÀNG GÓC DƯỚI PHẢI (CHUẨN ẢNH THẦY GỬI) */}
            <button
              type="button"
              onClick={() => setShowRankModal(true)}
              className="absolute bottom-4 right-5 z-30 w-14 h-14 bg-white hover:bg-amber-50 border-[3.5px] border-black rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition transform hover:scale-110 active:scale-95 group"
              title="Xem Bảng Xếp Hạng & Mời Trả Bài"
            >
              <Trophy className="w-7 h-7 text-black fill-amber-400 group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. MODAL BẢNG THỨ TỰ GỌI TRẢ BÀI CẢ LỚP (NGẪU NHIÊN 100% FISHER-YATES) */}
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

                {/* DANH SÁCH CUỘN MƯỢT MÀ CHỨA TOÀN BỘ HỌC SINH */}
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

                        <div className="flex-shrink-0 flex items-center space-x-2">
                          {idx === 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                handleConfirmCallStudent();
                                setShowRankModal(false);
                              }}
                              className="px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-slate-950 font-black text-xs rounded-xl shadow-sm transition active:scale-95 cursor-pointer flex items-center space-x-1"
                            >
                              <UserCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>GỌI EM NÀY</span>
                            </button>
                          )}
                          <span className="px-2.5 py-1 bg-emerald-600/30 border border-emerald-400/50 text-emerald-300 font-black text-xs rounded-xl shadow-sm">
                            Hạng {idx + 1}
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

                              <span className="text-[11px] font-mono text-slate-400">
                                Hạng {rankNum}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* NÚT ĐÓNG BẢNG XẾP HẠNG */}
                <div className="pt-3 border-t border-slate-800 mt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    Sắp xếp ngẫu nhiên hoàn toàn
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRankModal(false)}
                    className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                  >
                    Đóng Bảng
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
