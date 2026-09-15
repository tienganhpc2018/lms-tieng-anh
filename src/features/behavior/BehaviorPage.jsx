import React, { useState, useEffect } from 'react';
import {
  School,
  Maximize2,
  Minimize2,
  UserCheck,
  Award,
  Sparkles,
  Zap,
  Gift,
  Users,
  Layers,
  Flame,
  Timer,
  Grid,
  RotateCcw,
  Search,
  Plus,
  ChevronDown,
  Star,
  CheckCircle,
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import {
  loadClasses,
  saveClasses,
  loadSelectedClassId,
  saveSelectedClassId,
  loadStudents,
  saveStudents,
} from './behaviorStorage';
import { playClick, playCorrect, playWinner } from '../../utils/soundEffects';

// IMPORT TẤT CẢ 11 MODALS CHUẨN KỸ THUẬT
import AddClassModal4 from './modals/AddClassModal4';
import QuickAddStudentsModal from './modals/QuickAddStudentsModal';
import AttendanceModal4 from './modals/AttendanceModal4';
import PointModal from './modals/PointModal';
import TetHaiHoaModal from './modals/TetHaiHoaModal';
import SuspenseCallModal from './modals/SuspenseCallModal';
import BlindPouchModal from './modals/BlindPouchModal';
import BeeRaceModal from './modals/BeeRaceModal';
import DiscussionTimerModal from './modals/DiscussionTimerModal';
import GroupTeamsModal from './modals/GroupTeamsModal';
import SeatingChartModal from './modals/SeatingChartModal';

export default function BehaviorPage() {
  // 1. Dữ liệu lớp học & học sinh (KHÔNG MOCK DATA - CLEAN SLATE)
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);
  const [lastSavedTime, setLastSavedTime] = useState('');

  // 2. Giao diện & Bộ lọc
  const [cardSize, setCardSize] = useState('large'); // 'large' (96px) | 'small' (80px)
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'team1' | 'team2' | 'team3' | 'team4' | 'called' | 'absent'

  // 3. Quản lý trạng thái các Modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [isPointModalOpen, setIsPointModalOpen] = useState(false);
  const [selectedStudentForPoint, setSelectedStudentForPoint] = useState(null);
  const [isTetModalOpen, setIsTetModalOpen] = useState(false);
  const [isSuspenseModalOpen, setIsSuspenseModalOpen] = useState(false);
  const [suspenseMode, setSuspenseMode] = useState('single');
  const [isBlindPouchOpen, setIsBlindPouchOpen] = useState(false);
  const [isBeeRaceOpen, setIsBeeRaceOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isGroupTeamsOpen, setIsGroupTeamsOpen] = useState(false);
  const [isSeatingChartOpen, setIsSeatingChartOpen] = useState(false);

  // Nạp dữ liệu ban đầu từ LocalStorage
  useEffect(() => {
    const loadedClasses = loadClasses();
    setClasses(loadedClasses);

    const savedClassId = loadSelectedClassId();
    if (savedClassId && loadedClasses.some((c) => c.id === savedClassId)) {
      setSelectedClassId(savedClassId);
      const st = loadStudents(savedClassId);
      setStudents(st);
    } else if (loadedClasses.length > 0) {
      const firstId = loadedClasses[0].id;
      setSelectedClassId(firstId);
      saveSelectedClassId(firstId);
      const st = loadStudents(firstId);
      setStudents(st);
    } else {
      setSelectedClassId(null);
      setStudents([]);
    }

    const now = new Date();
    setLastSavedTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  }, []);

  // Đổi lớp học
  const handleSelectClass = (classId) => {
    playClick();
    setSelectedClassId(classId);
    saveSelectedClassId(classId);
    const st = loadStudents(classId);
    setStudents(st);
  };

  // Lưu lớp mới
  const handleSaveNewClass = (newClass, initialStudents = []) => {
    const updatedClasses = [...classes, newClass];
    setClasses(updatedClasses);
    saveClasses(updatedClasses);

    setSelectedClassId(newClass.id);
    saveSelectedClassId(newClass.id);

    setStudents(initialStudents);
    saveStudents(newClass.id, initialStudents);

    const now = new Date();
    setLastSavedTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  };

  // Cập nhật danh sách học sinh
  const handleUpdateStudents = (updatedStudents) => {
    if (!selectedClassId) return;
    setStudents(updatedStudents);
    saveStudents(selectedClassId, updatedStudents);

    const now = new Date();
    setLastSavedTime(
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    );
  };

  // Thêm học sinh bổ sung
  const handleAddStudents = (newStudents) => {
    const combined = [...students, ...newStudents];
    handleUpdateStudents(combined);
  };

  // Cập nhật 1 học sinh
  const handleUpdateSingleStudent = (updatedStudent) => {
    const updated = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    handleUpdateStudents(updated);
  };

  // Thưởng sao nhanh cho 1 học sinh
  const handleAwardStudent = (studentId, points = 1) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          plus_points: (s.plus_points || 0) + points,
          called_at: Date.now(),
        };
      }
      return s;
    });
    handleUpdateStudents(updated);
  };

  // Đánh dấu đã gọi
  const handleMarkCalled = (studentId) => {
    const updated = students.map((s) => (s.id === studentId ? { ...s, called_at: Date.now() } : s));
    handleUpdateStudents(updated);
  };

  // Đặt lại lượt gọi (Reset nhãn ĐÃ GỌI)
  const handleResetCalled = () => {
    playClick();
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa nhãn ĐÃ GỌI của toàn bộ học sinh để bắt đầu vòng gọi mới không?')) {
      playCorrect();
      const updated = students.map((s) => ({ ...s, called_at: null }));
      handleUpdateStudents(updated);
    }
  };

  // Tính toán thống kê
  const activeClass = classes.find((c) => c.id === selectedClassId) || null;
  const totalStudents = students.length;
  const presentStudents = students.filter((s) => s.status === 'Present').length;
  const absentStudents = students.filter((s) => s.status === 'Absent_Perm' || s.status === 'Absent_NoPerm').length;
  const calledStudents = students.filter((s) => Boolean(s.called_at)).length;

  const totalPlusPoints = students.reduce((sum, s) => sum + (s.plus_points || 0), 0);
  const totalMinusPoints = students.reduce((sum, s) => sum + (s.minus_points || 0), 0);

  // Lọc học sinh
  const filteredStudents = students.filter((st) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = st.full_name.toLowerCase().includes(q);
      const matchCode = st.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }

    if (filterType === 'team1') return st.team_group === 1;
    if (filterType === 'team2') return st.team_group === 2;
    if (filterType === 'team3') return st.team_group === 3;
    if (filterType === 'team4') return st.team_group === 4;
    if (filterType === 'called') return Boolean(st.called_at);
    if (filterType === 'absent') return st.status !== 'Present';

    return true;
  });

  return (
    <div className="min-h-screen bg-[#f3f4f8] text-slate-900 font-sans select-none pb-24">
      {/* 1. TOP HEADER APP (CHUẨN ẢNH 1) */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sticky top-0 z-30 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <span>Sổ Nề Nếp & Quản Lý 4.0</span>
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Hệ thống quản lý nề nếp thi đua, gọi tên ngẫu nhiên & minigames lớp học
          </p>
        </div>

        <div className="flex items-center space-x-2.5 self-end sm:self-auto flex-wrap">
          {lastSavedTime && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đã lưu {lastSavedTime}</span>
            </span>
          )}

          {/* DROPDOWN CHỌN LỚP */}
          {classes.length > 0 && (
            <div className="relative">
              <select
                value={selectedClassId || ''}
                onChange={(e) => handleSelectClass(e.target.value)}
                className="bg-purple-50 hover:bg-purple-100 text-purple-900 font-black text-xs px-3.5 py-2 rounded-2xl border border-purple-200 outline-hidden transition cursor-pointer appearance-none pr-8"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏛️ Lớp {c.name} • Khối {c.grade_level}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-purple-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          )}

          {/* CHIP GIÁO VIÊN */}
          <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black">
              🤖
            </div>
            <div className="text-left hidden sm:block">
              <span className="text-xs font-black text-slate-800 block leading-tight">Nguyễn Văn Hải</span>
              <span className="text-[10px] text-purple-600 font-bold block leading-tight">GV Tiếng Anh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 space-y-5">
        {/* =================================================================== */}
        {/* TRƯỜNG HỢP 1: CHƯA CÓ LỚP HỌC NÀO (RULE 1 - CLEAN SLATE) */}
        {/* =================================================================== */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 sm:p-16 text-center space-y-5 my-8 max-w-2xl mx-auto">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-lg">
              <School className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                CHƯA CÓ LỚP HỌC NÀO TRONG SỔ NỀ NẾP
              </h2>
              <p className="text-sm text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
                Thầy/Cô hãy bấm nút bên dưới để tạo lớp học đầu tiên và dán danh sách học sinh từ file Excel hoặc Word nhé!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                playClick();
                setIsAddClassOpen(true);
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm rounded-2xl shadow-xl shadow-purple-600/30 transition cursor-pointer transform hover:scale-105 inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>+ TẠO LỚP HỌC ĐẦU TIÊN</span>
            </button>
          </div>
        ) : (
          <>
            {/* =================================================================== */}
            {/* 2. CLAYMORPHIC TOP BANNER LỚP HỌC (CHUẨN ẢNH 1) */}
            {/* =================================================================== */}
            <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-violet-800 rounded-[2.5rem] p-6 sm:p-8 text-white shadow-2xl shadow-purple-900/40 border border-purple-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              {/* VỆT SÁNG NỀN TRANG TRÍ */}
              <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* BÊN TRÁI: TÊN LỚP & SĨ SỐ */}
              <div className="flex items-center space-x-4 relative z-10">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl sm:text-4xl shadow-inner flex-shrink-0">
                  ⭐
                </div>
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[11px] font-black text-purple-200 border border-white/20">
                    <span>🛡️ SỔ CHỦ NHIỆM 4.0 • QUẢN LÝ NỀ NẾP & THI ĐUA</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                    NỀ NẾP LỚP {activeClass?.name || '7A6'}
                  </h2>
                  <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-extrabold text-purple-200/90 flex-wrap">
                    <span>Sĩ số: <strong className="text-white">{totalStudents} HS</strong></span>
                    <span>•</span>
                    <span>Hiện diện: <strong className="text-emerald-300">{presentStudents}</strong></span>
                    <span>•</span>
                    <span>Vắng: <strong className="text-rose-300">{absentStudents}</strong></span>
                    <span>•</span>
                    <span>Đã gọi tên: <strong className="text-amber-300">{calledStudents}/{totalStudents}</strong></span>
                  </div>
                </div>
              </div>

              {/* BÊN PHẢI: 2 Ô THỐNG KÊ ĐIỂM CỘNG / ĐIỂM TRỪ */}
              <div className="flex items-center space-x-3 self-end md:self-center relative z-10">
                {/* TỔNG ĐIỂM (+) */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 text-center shadow-lg min-w-[120px]">
                  <span className="text-[10px] font-black tracking-wider text-purple-200 uppercase block">
                    TỔNG ĐIỂM (+)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center space-x-1 mt-0.5">
                    <span>+{totalPlusPoints}</span>
                    <span className="text-amber-300 text-xl">⭐</span>
                  </span>
                </div>

                {/* TỔNG ĐIỂM (-) */}
                <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 text-center shadow-lg min-w-[120px]">
                  <span className="text-[10px] font-black tracking-wider text-purple-200 uppercase block">
                    TỔNG ĐIỂM (-)
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white block mt-0.5">
                    -{totalMinusPoints}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 3. THANH CÔNG CỤ TÁC VỤ NHANH (13 NÚT BẤM GRADIENT - CHUẨN ẢNH 1) */}
            {/* =================================================================== */}
            <div className="flex items-center space-x-2.5 overflow-x-auto pb-2 pt-1 scrollbar-thin">
              {/* 1. + Thêm Lớp Mới */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsAddClassOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <School className="w-4 h-4" />
                <span>+ Thêm Lớp Mới</span>
              </button>

              {/* 2. Cỡ To / Cỡ Nhỏ */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setCardSize(cardSize === 'large' ? 'small' : 'large');
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0"
              >
                {cardSize === 'large' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                <span>{cardSize === 'large' ? 'Cỡ To (96px)' : 'Cỡ Nhỏ (80px)'}</span>
              </button>

              {/* 3. Điểm Danh */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsAttendanceOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <UserCheck className="w-4 h-4" />
                <span>Điểm Danh</span>
              </button>

              {/* 4. Danh Sách & Cho Điểm */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  if (students.length > 0) {
                    setSelectedStudentForPoint(students[0]);
                    setIsPointModalOpen(true);
                  } else {
                    setIsQuickAddOpen(true);
                  }
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Award className="w-4 h-4" />
                <span>Danh Sách & Cho Điểm</span>
              </button>

              {/* 5. Tết (Hái hoa dân chủ) 🌸 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsTetModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Tết (Hái hoa dân chủ) 🌸</span>
              </button>

              {/* 6. Gọi 1 (6s Hồi Hộp) */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setSuspenseMode('single');
                  setIsSuspenseModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Gọi 1 (6s Hồi Hộp)</span>
              </button>

              {/* 7. Túi Mù (32 Hộp Quà) 🎁 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsBlindPouchOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Gift className="w-4 h-4" />
                <span>Túi Mù (32 Hộp Quà) 🎁</span>
              </button>

              {/* 7b. Cửa Hàng Đổi Quà 4.0 🏪 */}
              <a
                href="/gift-shop"
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <span className="text-sm">🏪</span>
                <span>Cửa Hàng Đổi Quà 4.0</span>
              </a>

              {/* 7c. Cuộn Phim Kỷ Niệm 🎞️ */}
              <a
                href="/film-reel"
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <span className="text-sm">🎞️</span>
                <span>Cuộn Phim Kỷ Niệm</span>
              </a>

              {/* 8. Gọi Nhiều (Xem Full Lớp) 👥 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setSuspenseMode('multi');
                  setIsSuspenseModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Users className="w-4 h-4" />
                <span>Gọi Nhiều (3 HS) 👥</span>
              </button>

              {/* 9. Chia Nhóm & Theo Tổ 🐝 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsGroupTeamsOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Layers className="w-4 h-4" />
                <span>Chia Nhóm & Theo Tổ 🐝</span>
              </button>

              {/* 10. Bee Race (Đua Vịt Slider) 🐥 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsBeeRaceOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Flame className="w-4 h-4 fill-slate-950" />
                <span>Bee Race (Đua Vịt Slider) 🐥</span>
              </button>

              {/* 11. Bấm Giờ ⏱️ */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsTimerOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-700 to-violet-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0 hover:scale-102"
              >
                <Timer className="w-4 h-4" />
                <span>Bấm Giờ ⏱️</span>
              </button>

              {/* 12. Sơ Đồ Lớp (Đổi Chỗ Kéo Thả) 🏫 */}
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setIsSeatingChartOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0"
              >
                <Grid className="w-4 h-4" />
                <span>Sơ Đồ Lớp 🏫</span>
              </button>

              {/* 13. Đặt Lại Lượt Gọi */}
              <button
                type="button"
                onClick={handleResetCalled}
                className="px-3.5 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer flex items-center space-x-1.5 flex-shrink-0"
                title="Xóa nhãn ĐÃ GỌI để bắt đầu vòng gọi mới"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt Lại Lượt Gọi</span>
              </button>
            </div>

            {/* =================================================================== */}
            {/* 4. THANH TÌM KIẾM & BỘ LỌC DẠNG VIÊN THUỐC (CHUẨN ẢNH 1) */}
            {/* =================================================================== */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              {/* Ô TÌM KIẾM */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm học sinh theo tên..."
                  className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-600 outline-hidden transition"
                />
              </div>

              {/* BỘ LỌC DẠNG VIÊN THUỐC */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setFilterType('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất Cả ({totalStudents})
                </button>

                {[1, 2, 3, 4].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      playClick();
                      setFilterType(`team${t}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                      filterType === `team${t}`
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tổ {t}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setFilterType('called');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    filterType === 'called'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Đã Gọi ({calledStudents})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setFilterType('absent');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                    filterType === 'absent'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Vắng ({absentStudents})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsQuickAddOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center space-x-1 cursor-pointer ml-1"
                  title="Dán bổ sung thêm học sinh"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Dán Thêm</span>
                </button>
              </div>
            </div>

            {/* =================================================================== */}
            {/* 5. LƯỚI THẺ HỌC SINH (STUDENTCARD GRID - CHUẨN ẢNH 1) */}
            {/* =================================================================== */}
            {students.length === 0 ? (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto text-2xl">
                  📝
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Lớp {activeClass?.name} chưa có học sinh nào
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Thầy/Cô hãy dán danh sách họ tên học sinh từ Excel hoặc Word để bắt đầu nhé!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsQuickAddOpen(true);
                  }}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ DÁN DANH SÁCH HỌC SINH TỪ EXCEL/WORD</span>
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-bold text-xs">
                Không tìm thấy học sinh nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {filteredStudents.map((st) => {
                  const isAbsent = st.status !== 'Present';
                  const isCalled = Boolean(st.called_at);

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        if (isAbsent) return;
                        playClick();
                        setSelectedStudentForPoint(st);
                        setIsPointModalOpen(true);
                      }}
                      className={`relative bg-white rounded-3xl border-2 p-3 sm:p-4 text-center transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1 flex flex-col items-center justify-between group ${
                        isAbsent
                          ? 'bg-rose-50/80 border-rose-300 opacity-60 cursor-not-allowed'
                          : isCalled
                          ? 'border-amber-400 bg-amber-50/30 cursor-pointer'
                          : 'border-slate-200 hover:border-purple-400 cursor-pointer'
                      }`}
                    >
                      {/* HUY HIỆU ĐIỂM CỘNG (+) HÌNH TRÒN ĐỎ Ở GÓC TRÊN BÊN TRÁI (CHUẨN ẢNH 1) */}
                      <span className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                        +{st.plus_points || 0}
                      </span>

                      {/* HUY HIỆU ĐIỂM TRỪ (-) HÌNH TRÒN TÍM Ở GÓC TRÊN BÊN PHẢI (CHUẨN ẢNH 1) */}
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shadow-md border-2 border-white">
                        -{st.minus_points || 0}
                      </span>

                      {/* KHUNG AVATAR TRÒN VIỀN VÀNG KIM KÈM CHẤM TRÒN GIỚI TÍNH (CHUẨN ẢNH 1) */}
                      <div className="relative mt-2 mb-2">
                        <div
                          className={`rounded-full border-3 border-amber-300 bg-amber-50/60 p-1 flex items-center justify-center shadow-sm overflow-hidden ${
                            cardSize === 'large' ? 'w-20 h-20' : 'w-16 h-16'
                          }`}
                        >
                          <img
                            src={st.avatar}
                            alt={st.full_name}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                          />
                        </div>

                        {/* CHẤM TRÒN MÀU XANH (NAM) HOẶC HỒNG (NỮ) Ở CHÂN ẢNH */}
                        <span
                          className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                            st.gender === 'Nam' ? 'bg-blue-500' : 'bg-pink-500'
                          }`}
                          title={`Giới tính: ${st.gender}`}
                        />
                      </div>

                      {/* TÊN HỌC SINH */}
                      <div className="w-full space-y-0.5">
                        <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate leading-tight group-hover:text-purple-700 transition">
                          {st.full_name}
                        </h4>
                        <p className="text-[11px] font-bold text-slate-400 font-mono">
                          {st.code} • <span className="text-purple-600 font-black">Tổ {st.team_group}</span>
                        </p>
                      </div>

                      {/* TRẠNG THÁI ĐẶC BIỆT */}
                      {isAbsent ? (
                        <span className="mt-2 text-[9px] font-black uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full">
                          VẮNG MẶT
                        </span>
                      ) : isCalled ? (
                        <span className="mt-2 text-[9px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-xs">
                          ĐÃ GỌI
                        </span>
                      ) : (
                        <span className="mt-2 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition text-purple-600">
                          Bấm để cho điểm ➔
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* =================================================================== */}
      {/* 6. TOÀN BỘ CÁC MODAL HỖ TRỢ ĐÃ ĐƯỢC TÍCH HỢP HOÀN CHỈNH */}
      {/* =================================================================== */}
      {/* 1. Modal Tạo Lớp */}
      <AddClassModal4
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSaveClass={handleSaveNewClass}
      />

      {/* 2. Modal Dán Bổ Sung Học Sinh */}
      <QuickAddStudentsModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        currentCount={students.length}
        onAddStudents={handleAddStudents}
      />

      {/* 3. Modal Điểm Danh */}
      <AttendanceModal4
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        classInfo={activeClass}
        students={students}
        onUpdateStudents={handleUpdateStudents}
      />

      {/* 4. Modal Cho Điểm & Đổi Avatar */}
      <PointModal
        isOpen={isPointModalOpen}
        onClose={() => {
          setIsPointModalOpen(false);
          setSelectedStudentForPoint(null);
        }}
        student={selectedStudentForPoint}
        onUpdateStudent={handleUpdateSingleStudent}
      />

      {/* 5. Modal Hái Hoa Dân Chủ Mừng Xuân */}
      <TetHaiHoaModal
        isOpen={isTetModalOpen}
        onClose={() => setIsTetModalOpen(false)}
        students={students}
        onAwardStudent={handleAwardStudent}
      />

      {/* 6. Modal Vòng Quay 6s Hồi Hộp (Gọi 1 hoặc Gọi Nhiều) */}
      <SuspenseCallModal
        isOpen={isSuspenseModalOpen}
        onClose={() => setIsSuspenseModalOpen(false)}
        students={students}
        mode={suspenseMode}
        onMarkCalled={handleMarkCalled}
        onAwardStudent={handleAwardStudent}
      />

      {/* 7. Modal Túi Mù (32 Hộp Quà) */}
      <BlindPouchModal
        isOpen={isBlindPouchOpen}
        onClose={() => setIsBlindPouchOpen(false)}
        students={students}
        onAwardStudent={handleAwardStudent}
      />

      {/* 8. Modal Bee Race (Đua Vịt Slider) */}
      <BeeRaceModal
        isOpen={isBeeRaceOpen}
        onClose={() => setIsBeeRaceOpen(false)}
        students={students}
        onAwardStudent={handleAwardStudent}
      />

      {/* 9. Modal Bấm Giờ Thảo Luận Nhóm */}
      <DiscussionTimerModal isOpen={isTimerOpen} onClose={() => setIsTimerOpen(false)} />

      {/* 10. Modal Chia Nhóm & Theo Tổ */}
      <GroupTeamsModal
        isOpen={isGroupTeamsOpen}
        onClose={() => setIsGroupTeamsOpen(false)}
        students={students}
        onAwardStudent={handleAwardStudent}
      />

      {/* 11. Modal Sơ Đồ Chỗ Ngồi Lớp Học */}
      <SeatingChartModal
        isOpen={isSeatingChartOpen}
        onClose={() => setIsSeatingChartOpen(false)}
        classInfo={activeClass}
        students={students}
        onUpdateStudents={handleUpdateStudents}
      />
    </div>
  );
}
