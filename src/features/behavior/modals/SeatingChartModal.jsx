import React, { useState } from 'react';
import { X, Grid, Shuffle, Printer, Check, ArrowRightLeft, Bell } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';
import { loadBehaviorSettings } from '../behaviorStorage';

export default function SeatingChartModal({ isOpen, onClose, classInfo, students, onUpdateStudents }) {
  const [selectedSeat, setSelectedSeat] = useState(null); // { row, col, studentId }
  const [draggedStudentId, setDraggedStudentId] = useState(null);

  if (!isOpen) return null;

  // Lấy học sinh tại vị trí hàng r (1..5), cột c (1..8)
  const getStudentAt = (row, col) => {
    return students.find((s) => s.seat_row === row && s.seat_col === col);
  };

  // Hoán đổi chỗ ngồi giữa 2 tọa độ
  const swapSeats = (r1, c1, r2, c2) => {
    playCorrect();
    const st1 = getStudentAt(r1, c1);
    const st2 = getStudentAt(r2, c2);

    const updated = students.map((s) => {
      if (st1 && s.id === st1.id) {
        return { ...s, seat_row: r2, seat_col: c2 };
      }
      if (st2 && s.id === st2.id) {
        return { ...s, seat_row: r1, seat_col: c1 };
      }
      return s;
    });

    onUpdateStudents(updated);
    setSelectedSeat(null);
  };

  // Bấm chọn chỗ ngồi để đổi
  const handleSeatClick = (row, col) => {
    playClick();
    const st = getStudentAt(row, col);

    if (!selectedSeat) {
      if (st) {
        setSelectedSeat({ row, col, studentId: st.id, name: st.full_name });
      }
      return;
    }

    // Đã chọn bạn thứ nhất, giờ bấm bạn thứ 2 (hoặc bấm vào bàn trống)
    if (selectedSeat.row === row && selectedSeat.col === col) {
      setSelectedSeat(null); // Hủy chọn
      return;
    }

    swapSeats(selectedSeat.row, selectedSeat.col, row, col);
  };

  // Xáo trộn ngẫu nhiên toàn bộ chỗ ngồi
  const handleRandomize = () => {
    playCorrect();
    const totalDesks = [];
    for (let r = 1; r <= 5; r++) {
      for (let c = 1; c <= 8; c++) {
        totalDesks.push({ r, c });
      }
    }

    // Xáo trộn mảng bàn
    const shuffledDesks = totalDesks.sort(() => 0.5 - Math.random());

    const updated = students.map((st, idx) => {
      const desk = shuffledDesks[idx] || { r: 1, c: 1 };
      return {
        ...st,
        seat_row: desk.r,
        seat_col: desk.c,
      };
    });

    onUpdateStudents(updated);
    setSelectedSeat(null);
  };

  // In sơ đồ
  const handlePrint = () => {
    window.print();
  };

  // 4 DÃY BÀN HỌC (CHUẨN ẢNH 4)
  // Dãy 1: Cột 1 & 2
  // Dãy 2: Cột 3 & 4
  // [LỐI ĐI RỘNG 1.2M]
  // Dãy 3: Cột 5 & 6
  // Dãy 4: Cột 7 & 8
  const renderDeskPair = (row, colLeft, colRight) => {
    const stLeft = getStudentAt(row, colLeft);
    const stRight = getStudentAt(row, colRight);

    const isSelLeft = selectedSeat?.row === row && selectedSeat?.col === colLeft;
    const isSelRight = selectedSeat?.row === row && selectedSeat?.col === colRight;

    const warningThreshold = loadBehaviorSettings().warningMinusThreshold || 3;
    const isWarningLeft = (stLeft?.minus_points || 0) >= warningThreshold;
    const isWarningRight = (stRight?.minus_points || 0) >= warningThreshold;

    return (
      <div key={`${row}-${colLeft}`} className="flex items-center space-x-1.5 p-1 bg-amber-50/50 rounded-2xl border border-amber-200/80">
        <span className="text-[10px] font-black text-amber-700 w-4 pl-1 font-mono">B{row}</span>

        {/* BÀN BÊN TRÁI */}
        <div
          onClick={() => handleSeatClick(row, colLeft)}
          className={`relative flex-1 p-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[52px] ${
            isSelLeft
              ? 'bg-amber-300 border-amber-500 shadow-md ring-2 ring-amber-400'
              : isWarningLeft
              ? 'bg-rose-50/80 hover:bg-rose-100 border-rose-300 ring-2 ring-rose-300/60 shadow-2xs'
              : stLeft
              ? 'bg-white hover:bg-amber-50 border-slate-200'
              : 'border-2 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
          title={isWarningLeft ? `⚠️ Cảnh báo sớm: Em ${stLeft?.full_name} đã bị trừ ${stLeft?.minus_points} điểm!` : undefined}
        >
          {/* HUY HIỆU CHUÔNG VÀNG CẢNH BÁO SỚM */}
          {isWarningLeft && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm animate-bounce" title={`Cảnh báo: -${stLeft?.minus_points} điểm`}>
              🔔
            </span>
          )}

          {stLeft ? (
            <>
              <img src={stLeft.avatar} alt={stLeft.full_name} className="w-5 h-5 rounded-full mb-0.5" />
              <span className="text-[11px] font-black text-slate-900 truncate max-w-[70px] leading-tight block">
                {stLeft.full_name.split(' ').slice(-2).join(' ')}
              </span>
              <span className={`text-[9px] font-extrabold ${isWarningLeft ? 'text-rose-600' : 'text-amber-700'}`}>
                {isWarningLeft ? `-${stLeft.minus_points}đ` : `Tổ ${stLeft.team_group}`}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">Trống</span>
          )}
        </div>

        {/* BÀN BÊN PHẢI */}
        <div
          onClick={() => handleSeatClick(row, colRight)}
          className={`relative flex-1 p-1.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center min-h-[52px] ${
            isSelRight
              ? 'bg-amber-300 border-amber-500 shadow-md ring-2 ring-amber-400'
              : isWarningRight
              ? 'bg-rose-50/80 hover:bg-rose-100 border-rose-300 ring-2 ring-rose-300/60 shadow-2xs'
              : stRight
              ? 'bg-white hover:bg-amber-50 border-slate-200'
              : 'border-2 border-dashed border-slate-200 text-slate-400 hover:bg-slate-50'
          }`}
          title={isWarningRight ? `⚠️ Cảnh báo sớm: Em ${stRight?.full_name} đã bị trừ ${stRight?.minus_points} điểm!` : undefined}
        >
          {/* HUY HIỆU CHUÔNG VÀNG CẢNH BÁO SỚM */}
          {isWarningRight && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-sm animate-bounce" title={`Cảnh báo: -${stRight?.minus_points} điểm`}>
              🔔
            </span>
          )}

          {stRight ? (
            <>
              <img src={stRight.avatar} alt={stRight.full_name} className="w-5 h-5 rounded-full mb-0.5" />
              <span className="text-[11px] font-black text-slate-900 truncate max-w-[70px] leading-tight block">
                {stRight.full_name.split(' ').slice(-2).join(' ')}
              </span>
              <span className={`text-[9px] font-extrabold ${isWarningRight ? 'text-rose-600' : 'text-amber-700'}`}>
                {isWarningRight ? `-${stRight.minus_points}đ` : `Tổ ${stRight.team_group}`}
              </span>
            </>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">Trống</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#fffdf7] border-2 border-amber-300 rounded-[2.5rem] w-full max-w-6xl shadow-2xl p-5 sm:p-7 space-y-4 my-auto text-slate-900 flex flex-col max-h-[95vh]">
        {/* HEADER (CHUẨN ẢNH 4) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-amber-200 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shadow-sm">
              🏫
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  SƠ ĐỒ CHỖ NGỒI {classInfo?.name || 'LỚP HỌC'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs font-black">
                  {students.length} Học Sinh
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Hiển thị tên đệm + tên học sinh • Nhấp 1 bạn rồi nhấp vào bàn trống để đổi chỗ
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button
              type="button"
              onClick={handleRandomize}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center space-x-1.5"
              title="Xáo trộn ngẫu nhiên chỗ ngồi"
            >
              <Shuffle className="w-4 h-4" />
              <span>Xáo Trộn</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center space-x-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>In Sơ Đồ</span>
            </button>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-amber-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* THÔNG BÁO KHI ĐANG CHỌN ĐỔI CHỖ */}
        {selectedSeat && (
          <div className="p-2.5 bg-amber-100 border border-amber-300 rounded-xl text-xs font-black text-amber-900 flex items-center justify-between animate-pulse">
            <span>
              👉 Đang chọn bạn: <strong>{selectedSeat.name}</strong>. Hãy nhấp vào bàn khác hoặc bàn trống để hoán đổi chỗ ngồi!
            </span>
            <button
              type="button"
              onClick={() => setSelectedSeat(null)}
              className="text-[11px] underline text-amber-800 hover:text-amber-950 font-bold cursor-pointer"
            >
              Hủy đổi
            </button>
          </div>
        )}

        {/* 4 DÃY BÀN HỌC & LỐI ĐI CHÍNH GIỮA (CHUẨN ẢNH 4) */}
        <div className="flex-1 bg-white rounded-3xl border border-amber-200 p-4 sm:p-6 overflow-y-auto shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-9 gap-3 items-start">
            {/* DÃY 1 (CỘT 1 & 2) - 2 CỘT GRID */}
            <div className="md:col-span-2 space-y-2">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-black text-amber-900">
                <span>DÃY 1</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">Cột 1 & 2</span>
              </div>
              {[5, 4, 3, 2, 1].map((r) => renderDeskPair(r, 1, 2))}
            </div>

            {/* DÃY 2 (CỘT 3 & 4) - 2 CỘT GRID */}
            <div className="md:col-span-2 space-y-2">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-black text-amber-900">
                <span>DÃY 2</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">Cột 3 & 4</span>
              </div>
              {[5, 4, 3, 2, 1].map((r) => renderDeskPair(r, 3, 4))}
            </div>

            {/* LỐI ĐI CHÍNH GIỮA LỚP (RỘNG 1.2M) - 1 CỘT GRID (CHUẨN ẢNH 4) */}
            <div className="md:col-span-1 py-4 flex flex-col items-center justify-center space-y-4 text-center border-x-2 border-dashed border-amber-300 my-auto min-h-[300px]">
              <span className="text-amber-500">▲</span>
              <div className="[writing-mode:vertical-lr] text-xs font-black text-amber-800 tracking-widest uppercase">
                LỐI ĐI CHÍNH GIỮA LỚP
              </div>
              <span className="text-amber-500">▲</span>
              <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100 px-1 py-0.5 rounded">
                RỘNG 1.2M
              </span>
            </div>

            {/* DÃY 3 (CỘT 5 & 6) - 2 CỘT GRID */}
            <div className="md:col-span-2 space-y-2">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-black text-amber-900">
                <span>DÃY 3</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">Cột 5 & 6</span>
              </div>
              {[5, 4, 3, 2, 1].map((r) => renderDeskPair(r, 5, 6))}
            </div>

            {/* DÃY 4 (CỘT 7 & 8) - 2 CỘT GRID */}
            <div className="md:col-span-2 space-y-2">
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs font-black text-amber-900">
                <span>DÃY 4</span>
                <span className="text-[10px] text-amber-700 font-mono font-bold">Cột 7 & 8</span>
              </div>
              {[5, 4, 3, 2, 1].map((r) => renderDeskPair(r, 7, 8))}
            </div>
          </div>

          {/* DƯỚI CÙNG: BỤC GIẢNG, BẢNG ĐEN VÀ BÀN GIÁO VIÊN (CHUẨN VIỆT NAM) */}
          <div className="mt-8 pt-4 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 p-4 rounded-2xl">
            <div className="flex-1 bg-slate-800 text-white py-2 px-4 rounded-xl text-center font-black text-xs uppercase tracking-widest shadow-sm">
              ⬛ BẢNG TỪ / BẢNG TƯƠNG TÁC LỚP HỌC
            </div>

            <div className="bg-amber-800 text-amber-100 py-2 px-6 rounded-xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center space-x-1.5">
              <span>👨‍🏫 BÀN GIÁO VIÊN</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
