import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
} from 'lucide-react';
import MarbleRaceLeaderboard from './marble-race/MarbleRaceLeaderboard';
import MarbleRaceLogs from './marble-race/MarbleRaceLogs';
import MarbleRaceCanvas from './marble-race/MarbleRaceCanvas';
import MarbleRaceOverlay from './marble-race/MarbleRaceOverlay';
import MarbleWinnerModal from './marble-race/MarbleWinnerModal';
import MarbleStudentSourceModal from './marble-race/MarbleStudentSourceModal';
import { formatRaceTime } from './marble-race/marblePhysics';
import { playClick, playWinner, playTick } from '../../../utils/soundEffects';

export default function MarbleRaceModal({
  isOpen,
  onClose,
  classes = [],
  currentClassId = null,
  students = [],
  onSelectClass,
}) {
  const [gateLocked, setGateLocked] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [countdownStep, setCountdownStep] = useState(0);
  const [isAutoCounting, setIsAutoCounting] = useState(false);

  const [activeStudents, setActiveStudents] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [removeWinnerNextRound, setRemoveWinnerNextRound] = useState(true);

  const [marbles, setMarbles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cameraState, setCameraState] = useState({ cameraY: 0, viewportHeight: 600, trackHeight: 2600 });
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);

  const [winnerMarble, setWinnerMarble] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  const modalRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const presentList = students.filter(
        (s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
      );
      const listToUse = presentList.length > 0 ? presentList : students;
      setActiveStudents(listToUse);
      handleResetRace();
    }
  }, [isOpen, students]);

  // ĐỒNG HỒ ĐIỆN TỬ BẤM GIỜ
  useEffect(() => {
    if (!gateLocked && !isPaused && !winnerMarble) {
      if (!startTimeRef.current) startTimeRef.current = Date.now() - elapsedTimeMs;
      timerIntervalRef.current = setInterval(() => {
        setElapsedTimeMs(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gateLocked, isPaused, winnerMarble]);

  // ĐẶT LẠI LƯỢT ĐUA MỚI
  const handleResetRace = () => {
    setGateLocked(true);
    setIsPaused(false);
    setCountdownStep(0);
    setIsAutoCounting(false);
    setWinnerMarble(null);
    setIsWinnerModalOpen(false);
    setElapsedTimeMs(0);
    startTimeRef.current = null;

    setLogs([
      {
        time: '00:00,0',
        text: 'Thanh gạt chắn đang đóng. Bấm 1-2-3-4 hoặc MỞ THANH GẠT để đua!',
      },
    ]);
  };

  // TÍN HIỆU ĐẾM NGƯỢC 1-2-3-4
  const handleTriggerStep = (step) => {
    if (soundEnabled) playClick();
    setCountdownStep(step);

    const timeStr = formatRaceTime(elapsedTimeMs);
    if (step === 4) {
      setGateLocked(false);
      setLogs((prev) => [
        ...prev,
        { time: timeStr, text: 'Thanh gạt chắn mở! Cuộc đua bắt đầu.' },
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        { time: timeStr, text: `Tín hiệu xuất phát: Nút ${step}!` },
      ]);
    }
  };

  // ĐẾM NGƯỢC TỰ ĐỘNG
  const handleStartAutoCountdown = () => {
    if (isAutoCounting || !gateLocked) return;
    if (soundEnabled) playClick();

    setIsAutoCounting(true);
    setCountdownStep(1);

    const steps = [1, 2, 3, 4];
    let idx = 0;

    const timer = setInterval(() => {
      idx += 1;
      if (idx < steps.length) {
        const nextStep = steps[idx];
        setCountdownStep(nextStep);
        if (soundEnabled) playTick();

        if (nextStep === 4) {
          setGateLocked(false);
          setIsAutoCounting(false);
          clearInterval(timer);
          const timeStr = formatRaceTime(elapsedTimeMs);
          setLogs((prev) => [
            ...prev,
            { time: timeStr, text: 'Thanh gạt chắn mở! Cuộc đua bắt đầu.' },
          ]);
        }
      } else {
        clearInterval(timer);
        setIsAutoCounting(false);
      }
    }, 800);
  };

  // MỞ NGAY LẬP TỨC
  const handleOpenInstantly = () => {
    if (soundEnabled) playClick();
    setCountdownStep(4);
    setGateLocked(false);
    const timeStr = formatRaceTime(elapsedTimeMs);
    setLogs((prev) => [
      ...prev,
      { time: timeStr, text: 'Thanh gạt chắn mở ngay! Cuộc đua bùng nổ.' },
    ]);
  };

  // ĐUA LẠI VÒNG MỚI
  const handleRaceAgain = () => {
    if (removeWinnerNextRound && winnerMarble) {
      setExcludedIds((prev) => (prev.includes(winnerMarble.id) ? prev : [...prev, winnerMarble.id]));
    }
    handleResetRace();
  };

  // LỜI GỌI KHI CÓ HỌC SINH VƯỢT MẶT NỔI BẬT
  const handleMarbleFinish = (marble, rank) => {
    const timeStr = formatRaceTime(marble.finishTime || elapsedTimeMs);
    setLogs((prev) => [
      ...prev,
      { time: timeStr, text: `${marble.studentName} về đích hạng ${rank}.` },
    ]);
  };

  const handleWinnerFound = (marble) => {
    setWinnerMarble(marble);
    setIsWinnerModalOpen(true);
  };

  // FULLSCREEN TOGGLE
  const toggleFullscreen = () => {
    if (!modalRef.current) return;
    if (!document.fullscreenElement) {
      modalRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const racerStudents = activeStudents.filter((s) => !excludedIds.includes(s.id));

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-900 select-none animate-fade-in font-sans overflow-hidden"
    >
      {/* 1. TOP MINI TOOLBAR (XEM TOÀN MÀN HÌNH & THAO TÁC NHANH) */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-black">
            🔮
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
              GỌI TÊN HỌC SINH – GAME BI LĂN
            </h2>
            <p className="text-[10px] font-bold text-slate-500">
              {racerStudents.length} học sinh tham gia • Nhấn phím 1, 2, 3, 4 trên bàn phím
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              handleResetRace();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition cursor-pointer flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đua lại</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSourceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black transition cursor-pointer flex items-center space-x-1"
          >
            <Settings className="w-3.5 h-3.5 text-purple-700" />
            <span>Nguồn DS</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Toàn màn hình"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition cursor-pointer"
            title="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. BỐ CỤC CHÍNH 3 CỘT (LEADERBOARD | CANVAS & POPUP OVERLAY | LOGS & MINIMAP) */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* CỘT TRÁI: LEADERBOARD TRẮNG SÁNG & ĐỒNG HỒ (CHUẨN ẢNH 2, 3, 4) */}
        <MarbleRaceLeaderboard marbles={marbles} elapsedTimeMs={elapsedTimeMs} />

        {/* KHU VỰC GIỮA: CANVAS ĐƯỜNG ĐUA & POPUP ĐIỀU KHIỂN NỔI (CHUẨN ẢNH 2) */}
        <div className="flex-1 relative bg-slate-100 flex flex-col min-h-0 overflow-hidden">
          {/* THẺ POPUP NỔI ĐIỀU KHIỂN NÚT 1, 2, 3, 4 */}
          {gateLocked && (
            <MarbleRaceOverlay
              gateLocked={gateLocked}
              countdownStep={countdownStep}
              isAutoCounting={isAutoCounting}
              onTriggerStep={handleTriggerStep}
              onStartAutoCountdown={handleStartAutoCountdown}
              onOpenInstantly={handleOpenInstantly}
            />
          )}

          {/* CANVAS 2D MÔ PHỎNG MƯỢT MÀ 60 FPS */}
          <MarbleRaceCanvas
            racerStudents={racerStudents}
            gateLocked={gateLocked}
            isPaused={isPaused}
            soundEnabled={soundEnabled}
            onWinnerFound={handleWinnerFound}
            onMarbleFinish={handleMarbleFinish}
            onUpdateMarbles={setMarbles}
            onCameraUpdate={setCameraState}
          />
        </div>

        {/* CỘT PHẢI: TOÀN ĐƯỜNG ĐUA MINIMAP & DIỄN BIẾN (CHUẨN ẢNH 2, 3, 4) */}
        <MarbleRaceLogs marbles={marbles} logs={logs} cameraState={cameraState} />
      </div>

      {/* MODAL VINH DANH NGƯỜI CHIẾN THẮNG */}
      <MarbleWinnerModal
        isOpen={isWinnerModalOpen}
        winnerMarble={winnerMarble}
        onClose={() => setIsWinnerModalOpen(false)}
        onRaceAgain={handleRaceAgain}
        removeWinnerNextRound={removeWinnerNextRound}
        setRemoveWinnerNextRound={setRemoveWinnerNextRound}
      />

      {/* MODAL CẤU HÌNH NGUỒN DANH SÁCH HỌC SINH */}
      <MarbleStudentSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        classes={classes}
        currentClassId={currentClassId}
        onSelectClassStudents={(classId) => {
          if (onSelectClass) onSelectClass(classId);
        }}
        onSaveManualStudents={(newList) => {
          setActiveStudents(newList);
          handleResetRace();
        }}
        currentStudents={activeStudents}
      />
    </div>
  );
}
