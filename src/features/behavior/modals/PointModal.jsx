import React, { useState, useEffect } from 'react';
import {
  X,
  Star,
  AlertTriangle,
  Award,
  Bot,
  Plus,
  Minus,
  Check,
  RotateCcw,
  Undo2,
  Settings,
  Gift,
  GraduationCap,
  Sparkles,
  ArrowRight,
  History,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadCriteria, convertStudentPoints, loadBehaviorSettings } from '../behaviorStorage';
import { playClick, playCorrect, playWinner, playDeduct } from '../../../utils/soundEffects';
import { speakPraise } from '../utils/speechPraise';
import CriteriaSettingsModal from './CriteriaSettingsModal';

export default function PointModal({
  isOpen,
  onClose,
  student,
  classId,
  gradeLevel = 'all',
  onUpdateStudent,
}) {
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'convert' | 'avatar'
  const [criteria, setCriteria] = useState({ plusCriteria: [], minusCriteria: [] });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [lastAction, setLastAction] = useState(null); // { type: 'plus'|'minus', amount: number, label: string }
  const [toastMsg, setToastMsg] = useState('');

  // Số điểm muốn quy đổi (bội số của 10)
  const [convertBatch, setConvertBatch] = useState(10);

  useEffect(() => {
    if (isOpen) {
      const data = loadCriteria(gradeLevel);
      setCriteria(data);
      setLastAction(null);
      setToastMsg('');
    }
  }, [isOpen, gradeLevel]);

  if (!isOpen || !student) return null;

  const currentPlus = student.plus_points || 0;
  const currentMinus = student.minus_points || 0;
  const kttxBonus = student.kttx_bonus || 0;
  const starCoins = student.coins || currentPlus;

  // Thêm điểm cộng
  const handleAddPoints = (amount, reason = '') => {
    playCorrect();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    const updated = {
      ...student,
      plus_points: currentPlus + amount,
    };
    setLastAction({ type: 'plus', amount, label: reason });
    onUpdateStudent(updated);
    setToastMsg(`+${amount} ⭐: ${reason || 'Điểm cộng'}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Trừ điểm nề nếp
  const handleDeductPoints = (amount, reason = '') => {
    playDeduct();
    const updated = {
      ...student,
      minus_points: currentMinus + amount,
    };
    setLastAction({ type: 'minus', amount, label: reason });
    onUpdateStudent(updated);
    setToastMsg(`-${amount}: ${reason || 'Điểm trừ'}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Hoàn tác lần bấm vừa rồi (Undo)
  const handleUndo = () => {
    if (!lastAction) return;
    playClick();

    let updated = { ...student };
    if (lastAction.type === 'plus') {
      updated.plus_points = Math.max(0, (updated.plus_points || 0) - lastAction.amount);
    } else if (lastAction.type === 'minus') {
      updated.minus_points = Math.max(0, (updated.minus_points || 0) - lastAction.amount);
    }

    setLastAction(null);
    onUpdateStudent(updated);
    setToastMsg('↩️ Đã hoàn tác lần chấm điểm vừa rồi!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Tăng / Giảm 1 điểm trực tiếp (Sửa bấm nhầm)
  const handleDirectAdjust = (field, delta) => {
    playClick();
    const cur = field === 'plus' ? currentPlus : currentMinus;
    const nextVal = Math.max(0, cur + delta);
    const updated = {
      ...student,
      [field === 'plus' ? 'plus_points' : 'minus_points']: nextVal,
    };
    onUpdateStudent(updated);
  };

  // Reset điểm học sinh này về 0
  const handleResetPoints = () => {
    playClick();
    if (window.confirm(`Thầy/Cô có chắc chắn muốn đặt lại điểm của em "${student.full_name}" về 0 không?`)) {
      playCorrect();
      const updated = {
        ...student,
        plus_points: 0,
        minus_points: 0,
      };
      setLastAction(null);
      onUpdateStudent(updated);
      setToastMsg('🔄 Đã đưa điểm của học sinh về 0!');
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  // Quy đổi điểm nề nếp sang Điểm KTTX hoặc Sao
  const handleConvert = (type) => {
    if (currentPlus < convertBatch) {
      alert(`Em ${student.full_name} chỉ có ${currentPlus} điểm, không đủ ${convertBatch} điểm để quy đổi!`);
      return;
    }

    const res = convertStudentPoints(classId, student.id, type, convertBatch);
    if (res?.error) {
      playDeduct();
      alert(res.message || 'Không thể quy đổi điểm lúc này!');
      return;
    }

    if (res) {
      playWinner();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.55 },
      });

      onUpdateStudent(res);

      const valueGained = type === 'kttx' ? Math.floor(convertBatch / 10) : convertBatch;

      // LỜI BÌNH AI TUYÊN DƯƠNG BẰNG GIỌNG NÓI TRỰC TIẾP
      speakPraise(student.full_name, type, valueGained);

      const label = type === 'kttx'
        ? `🎉 Đã đổi ${convertBatch} điểm nề nếp thành +${valueGained} Điểm KTTX!`
        : `🎉 Đã đổi ${convertBatch} điểm nề nếp thành +${convertBatch} ⭐ Sao Đổi Quà!`;
      setToastMsg(label);
      setTimeout(() => setToastMsg(''), 3500);
    }
  };

  // Đổi Avatar Robot
  const handleChangeAvatar = (newAvatarUrl) => {
    playCorrect();
    const updated = {
      ...student,
      avatar: newAvatarUrl,
    };
    onUpdateStudent(updated);
    setToastMsg('🤖 Đã đổi avatar robot!');
    setTimeout(() => setToastMsg(''), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
        <div className="bg-white rounded-[2rem] w-full max-w-xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-4 my-auto max-h-[94vh] flex flex-col">
          {/* HEADER VỚI AVATAR HỌC SINH VÀ CÁC NÚT THAO TÁC */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3.5">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 p-1 shadow-md">
                  <img src={student.avatar} alt={student.full_name} className="w-full h-full object-cover" />
                </div>
                <span
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                    student.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{student.code}</span>
                  <h3 className="text-lg font-black text-slate-900 leading-snug">{student.full_name}</h3>
                </div>
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 mt-0.5 flex-wrap">
                  <span>Tổ {student.team_group}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-extrabold">+{currentPlus} ⭐</span>
                  <span>•</span>
                  <span className="text-purple-600 font-extrabold">-{currentMinus}</span>
                  {kttxBonus > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-black">🎓 +{kttxBonus} KTTX</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* CỤM NÚT RĂNG CƯA TIÊU CHÍ VÀ ĐÓNG */}
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsSettingsOpen(true);
                }}
                className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer flex items-center space-x-1"
                title="Cài đặt danh sách tiêu chí cộng / trừ"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">Tiêu chí</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* THÔNG BÁO TOAST NHANH */}
          {toastMsg && (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between animate-fade-in">
              <span>{toastMsg}</span>
              {lastAction && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="ml-2 underline font-black text-emerald-900 hover:text-black cursor-pointer"
                >
                  Hoàn tác
                </button>
              )}
            </div>
          )}

          {/* NHẮC NHỞ CẢNH BÁO SỚM KHI HỌC SINH BỊ TRỪ NHIỀU ĐIỂM */}
          {currentMinus >= (loadBehaviorSettings().warningMinusThreshold || 3) && (
            <div className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center space-x-2">
                <span className="text-base animate-bounce">🔔</span>
                <span>
                  <strong>Cảnh báo sớm:</strong> Em đang có <strong>-{currentMinus} điểm trừ</strong>. Thầy/Cô hãy động viên em tích cực phát biểu để gỡ điểm nhé!
                </span>
              </div>
            </div>
          )}

          {/* THANH 3 TABS: CHO ĐIỂM | QUY ĐỔI THƯỞNG | ĐỔI AVATAR */}
          <div className="flex items-center space-x-1.5 border-b border-slate-100 pb-2 select-none overflow-x-auto">
            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('points');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'points'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Star className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>Cho Điểm & Nhắc Nhở</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('convert');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'convert'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Quy Đổi Điểm Thưởng (KTTX / Sao)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClick();
                setActiveTab('avatar');
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center space-x-1.5 whitespace-nowrap ${
                activeTab === 'avatar'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Đổi Avatar</span>
            </button>
          </div>

          {/* TAB 1: CHO ĐIỂM & NHẮC NHỞ */}
          {activeTab === 'points' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* KHU VỰC CHỈNH SỬA NHANH / SỬA BẤM NHẦM / RESET VỀ 0 */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-4">
                  {/* Ô chỉnh điểm cộng */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-emerald-700">Điểm (+):</span>
                    <button
                      type="button"
                      onClick={() => handleDirectAdjust('plus', -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Giảm 1 điểm cộng"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-black text-emerald-800 bg-white py-1 rounded-lg border border-emerald-300">
                      +{currentPlus}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDirectAdjust('plus', 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Tăng 1 điểm cộng"
                    >
                      +
                    </button>
                  </div>

                  {/* Ô chỉnh điểm trừ */}
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-black text-purple-700">Điểm (-):</span>
                    <button
                      type="button"
                      onClick={() => handleDirectAdjust('minus', -1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Giảm 1 điểm trừ"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-black text-purple-800 bg-white py-1 rounded-lg border border-purple-300">
                      -{currentMinus}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDirectAdjust('minus', 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-slate-700 font-black hover:bg-slate-100 flex items-center justify-center cursor-pointer shadow-2xs"
                      title="Tăng 1 điểm trừ"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* CẶP NÚT RESET & HOÀN TÁC */}
                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  {lastAction && (
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                      title="Hoàn tác lần bấm vừa rồi"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      <span>Hoàn tác</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResetPoints}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 border border-slate-300 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                    title="Đặt lại điểm học sinh này về 0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset về 0</span>
                  </button>
                </div>
              </div>

              {/* NHÓM CỘNG ĐIỂM */}
              <div className="space-y-2">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Khen Thưởng & Điểm Cộng (+)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {criteria.plusCriteria.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleAddPoints(c.points, c.label)}
                      className="p-3 bg-emerald-50/80 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-1">
                        <span className="text-lg flex-shrink-0">{c.icon || '🌟'}</span>
                        <span className="text-xs font-bold text-slate-800 leading-snug truncate">{c.label}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-700 bg-white px-2 py-0.5 rounded-lg border border-emerald-300 flex-shrink-0 group-hover:scale-110 transition">
                        +{c.points}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* NHÓM TRỪ ĐIỂM */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black text-rose-700 uppercase tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Nhắc Nhở & Điểm Trừ Nề Nếp (-)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {criteria.minusCriteria.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleDeductPoints(c.points, c.label)}
                      className="p-3 bg-rose-50/70 hover:bg-rose-100 border border-rose-200 rounded-2xl text-left transition cursor-pointer flex items-center justify-between group shadow-2xs hover:scale-[1.01]"
                    >
                      <div className="flex items-center space-x-2 min-w-0 pr-1">
                        <span className="text-lg flex-shrink-0">{c.icon || '⚠️'}</span>
                        <span className="text-xs font-bold text-slate-800 leading-snug truncate">{c.label}</span>
                      </div>
                      <span className="text-xs font-black text-rose-800 bg-white px-2 py-0.5 rounded-lg border border-rose-300 flex-shrink-0 group-hover:scale-110 transition">
                        -{c.points}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUY ĐỔI ĐIỂM THƯỞNG (KTTX HOẶC SAO) */}
          {activeTab === 'convert' && (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1 select-none">
              {/* BANNER THỐNG KÊ ĐIỂM CỘNG KHẢ DỤNG */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-200 uppercase tracking-wider block">
                    ĐIỂM CỘNG NỀ NẾP KHẢ DỤNG
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-300 flex items-center space-x-1 mt-0.5">
                    <span>{currentPlus}</span>
                    <span className="text-base text-white">⭐ Điểm</span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-xl backdrop-blur-md">
                    🎓 Đã tích lũy: <strong>+{kttxBonus} / {loadBehaviorSettings().maxKttxBonus || 2} KTTX</strong>
                  </div>
                  <div className="text-[10px] text-blue-200 font-semibold">
                    (Mức trần tối đa: +{loadBehaviorSettings().maxKttxBonus || 2} điểm)
                  </div>
                </div>
              </div>

              {/* THANH TIẾN ĐỘ TỚI MỐC ĐỔI */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Tiến độ đạt mốc 10 điểm tiếp theo:</span>
                  <span className="font-mono text-emerald-700 font-black">{currentPlus % 10}/10 điểm</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, ((currentPlus % 10) / 10) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {currentPlus >= 10
                    ? `🎉 Em ${student.full_name} đã đủ điều kiện quy đổi điểm thưởng!`
                    : `Cần thêm ${10 - (currentPlus % 10)} điểm nề nếp nữa để đủ mốc 10 điểm.`}
                </p>
              </div>

              {/* CẢNH BÁO NẾU ĐÃ ĐẠT MỨC TRẦN KTTX */}
              {kttxBonus >= (loadBehaviorSettings().maxKttxBonus || 2) && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start space-x-2 text-xs font-bold text-amber-900">
                  <span className="text-base">⚠️</span>
                  <div>
                    <span className="font-black">Đã đạt mức trần điểm thưởng KTTX (+{loadBehaviorSettings().maxKttxBonus || 2} điểm):</span>
                    <p className="font-medium text-amber-800 mt-0.5">
                      Học sinh đã nhận đủ điểm cộng tối đa vào cột kiểm tra. Số điểm nề nếp còn lại xin mời đổi sang <strong>Sao Cửa Hàng Quà 4.0 ⭐</strong>!
                    </p>
                  </div>
                </div>
              )}

              {/* CHỌN SỐ ĐIỂM MUỐN ĐỔI (10, 20, 30...) */}
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-700 whitespace-nowrap">Số điểm muốn đổi:</span>
                {[10, 20, 30].map((batch) => (
                  <button
                    key={batch}
                    type="button"
                    onClick={() => setConvertBatch(batch)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      convertBatch === batch
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {batch} Điểm
                  </button>
                ))}
              </div>

              {/* 2 LỰA CHỌN QUY ĐỔI CHÍNH */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* LỰA CHỌN 1: ĐỔI SANG ĐIỂM KTTX */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl p-4 border border-blue-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-sm">
                      🎓
                    </div>
                    <h4 className="text-sm font-black text-blue-950 flex items-center justify-between">
                      <span>Đổi sang Điểm KTTX</span>
                      {kttxBonus >= (loadBehaviorSettings().maxKttxBonus || 2) && (
                        <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">Kịch trần</span>
                      )}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Cứ <strong>{convertBatch} điểm nề nếp</strong> quy đổi thành <strong>+{Math.floor(convertBatch / 10)} điểm</strong> cộng vào cột Kiểm tra Thường xuyên.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConvert('kttx')}
                    disabled={currentPlus < convertBatch || kttxBonus >= (loadBehaviorSettings().maxKttxBonus || 2)}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-sm ${
                      currentPlus >= convertBatch && kttxBonus < (loadBehaviorSettings().maxKttxBonus || 2)
                        ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>
                      {kttxBonus >= (loadBehaviorSettings().maxKttxBonus || 2)
                        ? 'Đã đạt mức trần (+2đ)'
                        : `Đổi +${Math.floor(convertBatch / 10)} Điểm KTTX`}
                    </span>
                  </button>
                </div>

                {/* LỰA CHỌN 2: ĐỔI SANG SAO CỬA HÀNG QUÀ */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg shadow-sm">
                      ⭐
                    </div>
                    <h4 className="text-sm font-black text-amber-950">
                      Đổi sang Sao Cửa Hàng
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Học sinh không muốn lấy điểm kiểm tra có thể đổi thành <strong>+{convertBatch} Sao ⭐</strong> để mua quà và mở túi mù.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleConvert('stars')}
                    disabled={currentPlus < convertBatch}
                    className={`w-full py-2.5 px-3 rounded-xl font-black text-xs transition flex items-center justify-center space-x-1.5 shadow-sm ${
                      currentPlus >= convertBatch
                        ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Đổi +{convertBatch} Sao Đổi Quà</span>
                  </button>
                </div>
              </div>

              {/* LỊCH SỬ CÁC LẦN ĐỔI THƯỞNG CỦA HỌC SINH */}
              {student.conversion_history && student.conversion_history.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lịch sử đổi thưởng gần đây:</span>
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {student.conversion_history.slice(0, 5).map((h) => (
                      <div
                        key={h.id}
                        className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold flex items-center justify-between text-slate-700"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{h.type === 'kttx' ? '🎓' : '⭐'}</span>
                          <span>{h.label}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(h.date).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ĐỔI AVATAR ROBOT */}
          {activeTab === 'avatar' && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wider block">
                Chọn Avatar Robot mới cho học sinh:
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {[
                  'Sparky', 'Bolt', 'Cosmo', 'Titan', 'Byte', 'Pixel',
                  'Nova', 'Echo', 'Orbit', 'Pulse', 'Cyber', 'Aero',
                  'Blaze', 'Gizmo', 'Rust', 'Quantum', 'Vortex', 'Neon',
                ].map((seed, idx) => {
                  const url = `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChangeAvatar(url)}
                      className="p-2 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-400 rounded-2xl transition cursor-pointer group flex flex-col items-center space-y-1"
                    >
                      <img src={url} alt={seed} className="w-12 h-12 group-hover:scale-110 transition" />
                      <span className="text-[10px] font-bold text-slate-500">{seed}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">
              LMS Nề nếp 4.0 • Tự động đồng bộ hóa
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs transition cursor-pointer shadow-md"
            >
              Hoàn tất
            </button>
          </div>
        </div>
      </div>

      {/* MODAL CÀI ĐẶT TIÊU CHÍ */}
      {isSettingsOpen && (
        <CriteriaSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => {
            setIsSettingsOpen(false);
            setCriteria(loadCriteria(gradeLevel));
          }}
          initialGrade={gradeLevel}
        />
      )}
    </>
  );
}
