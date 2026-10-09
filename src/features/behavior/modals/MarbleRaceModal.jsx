import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Settings,
  Sparkles,
  Zap,
  Tag,
  Flame,
  Award,
} from 'lucide-react';
import MarbleRaceLeaderboard from './marble-race/MarbleRaceLeaderboard';
import MarbleRaceLogs from './marble-race/MarbleRaceLogs';
import MarbleRaceCanvas from './marble-race/MarbleRaceCanvas';
import MarbleWinnerModal from './marble-race/MarbleWinnerModal';
import MarbleStudentSourceModal from './marble-race/MarbleStudentSourceModal';
import { TRACK_PRESETS } from './marble-race/marblePhysics';
import { playClick, playCorrect, playTick } from '../../../utils/soundEffects';

export default function MarbleRaceModal({
  isOpen,
  onClose,
  classes = [],
  currentClassId = null,
  students = [],
  onSelectClass,
}) {
  // Trạng thái cuộc đua
  const [presetId, setPresetId] = useState('plinko');
  const [gateLocked, setGateLocked] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Trạng thái đếm ngược 1-2-3-4
  const [countdownStep, setCountdownStep] = useState(0); // 0 (chưa đếm), 1, 2, 3, 4
  const [isAutoCounting, setIsAutoCounting] = useState(false);

  // Danh sách học sinh tham gia
  const [activeStudents, setActiveStudents] = useState([]);
  const [excludedIds, setExcludedIds] = useState([]);
  const [removeWinnerNextRound, setRemoveWinnerNextRound] = useState(true);

  // Live state viên bi & logs
  const [marbles, setMarbles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [trackHeight, setTrackHeight] = useState(600);

  // Modal chiến thắng & Nguồn dữ liệu
  const [winnerMarble, setWinnerMarble] = useState(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);

  const modalRef = useRef(null);

  // Đồng bộ học sinh từ prop
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

  // ĐẶT LẠI LƯỢT ĐUA MỚI
  const handleResetRace = () => {
    setGateLocked(true);
    setIsPaused(false);
    setCountdownStep(0);
    setIsAutoCounting(false);
    setWinnerMarble(null);
    setIsWinnerModalOpen(false);

    const nowStr = new Date().toLocaleTimeString('vi-VN');
    setLogs([
      {
        time: nowStr,
        type: 'info',
        text: '🏁 Đã chuẩn bị vạch xuất phát. Nhấn 1-2-3-4 hoặc MỞ CỔNG để đua!',
      },
    ]);
  };

  // KÍCH HOẠT TÍN HIỆU ĐẾM NGƯỢC THỦ CÔNG HOẶC PHÍM SỐ (1, 2, 3, 4)
  const handleTriggerStep = (step) => {
    if (soundEnabled) playClick();
    setCountdownStep(step);

    const nowStr = new Date().toLocaleTimeString('vi-VN');
    if (step === 4) {
      setGateLocked(false);
      setLogs((prev) => [
        ...prev,
        { time: nowStr, type: 'start', text: '🚦 [TÍN HIỆU 4] CỔNG ĐÃ MỞ! TOÀN BỘ VIÊN BI XUẤT PHÁT!' },
      ]);
    } else {
      setLogs((prev) => [
        ...prev,
        { time: nowStr, type: 'info', text: `⏱️ Tín hiệu khởi động: SỐ ${step}!` },
      ]);
    }
  };

  // ĐẾM NGƯỜC TỰ ĐỘNG 1 -> 2 -> 3 -> 4
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
          const nowStr = new Date().toLocaleTimeString('vi-VN');
          setLogs((prev) => [
            ...prev,
            { time: nowStr, type: 'start', text: '🚦 [TỰ ĐỘNG ĐẾM NGƯỢC] CỔNG ĐÃ MỞ! XUẤT PHÁT!' },
          ]);
        }
      } else {
        clearInterval(timer);
        setIsAutoCounting(false);
      }
    }, 800);
  };

  // MỞ CỔNG NGAY LẬP TỨC
  const handleOpenInstantly = () => {
    if (soundEnabled) playClick();
    setCountdownStep(4);
    setGateLocked(false);
    const nowStr = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [
      ...prev,
      { time: nowStr, type: 'start', text: '⚡ MỞ CỔNG NGAY! Cuộc đua viên bi bùng nổ!' },
    ]);
  };

  // ĐUA LẠI VÒNG TIẾP THEO (LOẠI BẠN VỪA THẮNG NẾU TÍCH CHỌN)
  const handleRaceAgain = () => {
    if (removeWinnerNextRound && winnerMarble) {
      setExcludedIds((prev) => (prev.includes(winnerMarble.id) ? prev : [...prev, winnerMarble.id]));
    }
    handleResetRace();
  };

  // BẮT BÀN PHÍM PHÍM SỐ (1, 2, 3, 4) KHI WINDOW ĐANG ACTIVE
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      // Bỏ qua nếu đang gõ chữ trong ô text
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === '1') handleTriggerStep(1);
      if (e.key === '2') handleTriggerStep(2);
      if (e.key === '3') handleTriggerStep(3);
      if (e.key === '4') handleTriggerStep(4);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, gateLocked]);

  // XỬ LÝ FULLSCREEN
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

  // BÁO NGƯỜI CHIẾN THẮNG TỪ CANVAS
  const handleWinnerFound = (marble) => {
    setWinnerMarble(marble);
    setIsWinnerModalOpen(true);

    const nowStr = new Date().toLocaleTimeString('vi-VN');
    setLogs((prev) => [
      ...prev,
      {
        time: nowStr,
        type: 'finish',
        text: `🏆 [VỊ TRÍ #1] VIÊN BI #${marble.number} (${marble.studentName}) ĐÃ VỀ ĐÍCH ĐẦU TIÊN!`,
      },
    ]);
  };

  // BÁO VIÊN BI VỀ ĐÍCH CÁC THỨ HẠNG SAU
  const handleMarbleFinish = (marble, rank) => {
    if (rank > 1) {
      const nowStr = new Date().toLocaleTimeString('vi-VN');
      setLogs((prev) => [
        ...prev,
        {
          time: nowStr,
          type: 'finish',
          text: `🏁 Viên bi #${marble.number} (${marble.studentName}) về đích ở vị trí #${rank}`,
        },
      ]);
    }
  };

  // LỌC HỌC SINH CHƯA BỊ LOẠI TRỪ
  const racerStudents = activeStudents.filter((s) => !excludedIds.includes(s.id));

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white select-none animate-fade-in font-sans overflow-hidden"
    >
      {/* 1. TOP HEADER TOOLBAR (BẢNG ĐIỀU KHIỂN ĐẬM CHẤT GAME SHOW) */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between gap-3 flex-wrap shadow-xl">
        {/* TIÊU ĐỀ & CHỌN LOẠI ĐƯỜNG ĐUA */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-purple-600/30">
            🔮
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight uppercase flex items-center space-x-2">
              <span>GỌI TÊN HỌC SINH – GAME BI LĂN</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                PRO 2D
              </span>
            </h2>
            <p className="text-[11px] font-bold text-slate-400">
              {racerStudents.length} học sinh tham gia • Phím tắt 1, 2, 3, 4 để mở cổng
            </p>
          </div>

          {/* DROPDOWN SELECT PRESET ĐƯỜNG ĐUA */}
          <select
            value={presetId}
            onChange={(e) => {
              playClick();
              setPresetId(e.target.value);
              handleResetRace();
            }}
            className="bg-slate-800 border border-slate-700 text-purple-300 font-black text-xs px-3 py-1.5 rounded-xl outline-none cursor-pointer hover:bg-slate-700 transition"
          >
            {TRACK_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* BỘ NÚT ĐẾM NGƯỢC CHÍNH 1 - 2 - 3 - 4 (MỞ CỔNG) */}
        <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => handleTriggerStep(step)}
              className={`w-9 h-9 rounded-xl font-black text-sm transition cursor-pointer flex items-center justify-center ${
                countdownStep >= step
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 scale-105'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
              title={`Nhấn nút ${step} (hoặc phím ${step})`}
            >
              {step}
            </button>
          ))}

          {/* NÚT 4: MỞ CỔNG */}
          <button
            type="button"
            onClick={() => handleTriggerStep(4)}
            className={`px-3.5 h-9 rounded-xl font-black text-xs transition cursor-pointer flex items-center space-x-1.5 ${
              countdownStep === 4 || !gateLocked
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>4. MỞ CỔNG</span>
          </button>
        </div>

        {/* THANH CÔNG CỤ TÁC VỤ PHỤ (TỰ ĐỘNG, MỞ NGAY, TẠM DỪNG, NGUỒN, FULLSCREEN) */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* TỰ ĐỘNG ĐẾM NGƯỢC 1-2-3-4 */}
          <button
            type="button"
            onClick={handleStartAutoCountdown}
            disabled={isAutoCounting || !gateLocked}
            className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/50 text-purple-200 text-xs font-black transition cursor-pointer flex items-center space-x-1"
          >
            <span>⏱️ ĐẾM NGƯỜC TỰ ĐỘNG</span>
          </button>

          {/* MỞ NGAY */}
          <button
            type="button"
            onClick={handleOpenInstantly}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/50 text-amber-300 text-xs font-black transition cursor-pointer flex items-center space-x-1"
          >
            <span>⚡ MỞ NGAY</span>
          </button>

          {/* TẠM DỪNG / TIẾP TỤC */}
          <button
            type="button"
            onClick={() => {
              playClick();
              setIsPaused(!isPaused);
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={isPaused ? 'Tiếp tục cuộc đua' : 'Tạm dừng cuộc đua'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-current" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          {/* ĐUA LẠI LƯỢT MỚI */}
          <button
            type="button"
            onClick={() => {
              playClick();
              handleResetRace();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Đặt lại đường đua về vị trí ban đầu"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>

          {/* BẬT / TẮT ÂM THANH */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* ẨN / HIỆN NHÃN TÊN */}
          <button
            type="button"
            onClick={() => setShowLabels(!showLabels)}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              showLabels ? 'bg-purple-900/40 border-purple-500 text-purple-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Ẩn / Hiện nhãn tên học sinh phía dưới viên bi"
          >
            <Tag className="w-4 h-4" />
          </button>

          {/* CẤU HÌNH NGUỒN DANH SÁCH */}
          <button
            type="button"
            onClick={() => setIsSourceModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-black transition cursor-pointer flex items-center space-x-1"
          >
            <Settings className="w-3.5 h-3.5 text-purple-400" />
            <span>Nguồn DS</span>
          </button>

          {/* FULLSCREEN */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Toàn màn hình trình chiếu"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* ĐÓNG MODAL */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/30 hover:bg-rose-600/60 border border-rose-500/50 text-rose-300 transition cursor-pointer"
            title="Đóng trò chơi"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. KHU VỰC CHÍNH BỐ CỤC 3 CỘT (LEADERBOARD | CANVAS | LOGS) */}
      <div className="flex-1 flex flex-col lg:flex-row p-3 gap-3 min-h-0 overflow-hidden">
        {/* CỘT TRÁI: BẢNG XẾP HẠNG */}
        <MarbleRaceLeaderboard marbles={marbles} isRacing={!gateLocked} />

        {/* KHU VỰC GIỮA: ĐƯỜNG ĐUA CANVAS 2D VẬT LÝ */}
        <div className="flex-1 bg-slate-950 rounded-2xl border border-slate-800 relative overflow-hidden flex flex-col min-h-0 shadow-2xl">
          <MarbleRaceCanvas
            racerStudents={racerStudents}
            presetId={presetId}
            gateLocked={gateLocked}
            isPaused={isPaused}
            soundEnabled={soundEnabled}
            showLabels={showLabels}
            onWinnerFound={handleWinnerFound}
            onMarbleFinish={handleMarbleFinish}
            onUpdateMarbles={setMarbles}
            onTrackHeightReady={setTrackHeight}
          />
        </div>

        {/* CỘT PHẢI: DIỄN BIẾN & MINIMAP */}
        <MarbleRaceLogs marbles={marbles} logs={logs} trackHeight={trackHeight} />
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
