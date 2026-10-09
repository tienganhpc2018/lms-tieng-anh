import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Timer,
  MapPin,
  Zap,
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

  const [raceDurationSec, setRaceDurationSec] = useState(20);
  const [countdownStep, setCountdownStep] = useState(0);
  const [isAutoCounting, setIsAutoCounting] = useState(false);

  // 3 MẪU BẢN ĐỒ: bottleneck (Phễu cổ chai), pinball (Tháp Pinball), zigzag (Thác Zíc Zắc)
  const [trackType, setTrackType] = useState('bottleneck');

  // TỐC ĐỘ CÁNH QUẠT XOAY PHỄU CỔ CHAI: slow (Chậm), normal (Vừa), fast (Nhanh)
  const [spinnerSpeedMode, setSpinnerSpeedMode] = useState('normal');

  const [activeStudents, setActiveStudents] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [removeWinnerNextRound, setRemoveWinnerNextRound] = useState(true);

  const [marbles, setMarbles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [cameraState, setCameraState] = useState({ cameraY: 0, viewportHeight: 600, trackHeight: 2400 });
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
        time: formatRaceTime(raceDurationSec * 1000),
        text: 'Thanh gạt chắn đang đóng. Bấm 1-2-3-4 hoặc MỞ THANH GẠT để đua!',
      },
    ]);
  };

  // TÍN HIỆU ĐẾM NGƯỜC 1-2-3-4
  const handleTriggerStep = (step) => {
    if (soundEnabled) playClick();
    setCountdownStep(step);

    const remainingMs = Math.max(0, raceDurationSec * 1000 - elapsedTimeMs);
    const timeStr = formatRaceTime(remainingMs);
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

  // ĐẾM NGƯỜC TỰ ĐỘNG
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
          const remainingMs = Math.max(0, raceDurationSec * 1000 - elapsedTimeMs);
          const timeStr = formatRaceTime(remainingMs);
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
    const remainingMs = Math.max(0, raceDurationSec * 1000 - elapsedTimeMs);
    const timeStr = formatRaceTime(remainingMs);
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

  // LỜI GỌI KHI CÓ HỌC SINH VỀ ĐÍCH
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
  const remainingTimeMs = Math.max(0, raceDurationSec * 1000 - elapsedTimeMs);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-900 select-none animate-fade-in font-sans overflow-hidden"
    >
      {/* 1. TOP TOOLBAR VỚI CHỌN MẪU BẢN ĐỒ & TỐC ĐỘ QUẠT XOAY */}
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
              {racerStudents.length} học sinh tham gia • Thời gian đua: {raceDurationSec}s
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          {/* BỘ CHỌN 3 MẪU BẢN ĐỒ ĐƯỜNG ĐUA (CHUẨN THẦY YÊU CẦU) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-black">
            <MapPin className="w-3.5 h-3.5 text-purple-600 ml-1" />
            {[
              { id: 'bottleneck', name: 'Phễu Cổ Chai' },
              { id: 'pinball', name: 'Tháp Pinball' },
              { id: 'zigzag', name: 'Thác Zíc Zắc' },
            ].map((map) => (
              <button
                key={map.id}
                type="button"
                onClick={() => {
                  playClick();
                  setTrackType(map.id);
                  handleResetRace();
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  trackType === map.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {map.name}
              </button>
            ))}
          </div>

          {/* BỘ CHỌN TỐC ĐỘ CÁNH QUẠT XOAY: CHẬM / VỪA / NHANH (CHUẨN THẦY YÊU CẦU) */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-black">
            <Zap className="w-3.5 h-3.5 text-amber-500 ml-1" />
            {[
              { mode: 'slow', name: 'Quạt Chậm' },
              { mode: 'normal', name: 'Quạt Vừa' },
              { mode: 'fast', name: 'Quạt Nhanh' },
            ].map((sp) => (
              <button
                key={sp.mode}
                type="button"
                onClick={() => {
                  playClick();
                  setSpinnerSpeedMode(sp.mode);
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  spinnerSpeedMode === sp.mode
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sp.name}
              </button>
            ))}
          </div>

          {/* CHỌN THỜI GIAN ĐUA 20S */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-black">
            <Timer className="w-3.5 h-3.5 text-purple-600 ml-1" />
            {[20, 30, 45].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  playClick();
                  setRaceDurationSec(sec);
                  handleResetRace();
                }}
                className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                  raceDurationSec === sec
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

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
        {/* CỘT TRÁI: LEADERBOARD TRẮNG SÁNG & ĐỒNG HỒ ĐẾM NGƯỜC 20S (CHUẨN ẢNH 2, 3, 4, 6) */}
        <MarbleRaceLeaderboard marbles={marbles} remainingTimeMs={remainingTimeMs} />

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
            trackType={trackType}
            spinnerSpeedMode={spinnerSpeedMode}
            gateLocked={gateLocked}
            isPaused={isPaused}
            soundEnabled={soundEnabled}
            onWinnerFound={handleWinnerFound}
            onMarbleFinish={handleMarbleFinish}
            onUpdateMarbles={setMarbles}
            onCameraUpdate={setCameraState}
          />
        </div>

        {/* CỘT PHẢI: TOÀN ĐƯỜNG ĐUA MINIMAP & DIỄN BIẾN (CHUẨN ẢNH 2, 3, 4, 6) */}
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
