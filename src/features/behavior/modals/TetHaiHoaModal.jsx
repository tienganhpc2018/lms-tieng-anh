import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RotateCcw, Dices, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin, playTick } from '../../../utils/soundEffects';

// Bảng tọa độ chuẩn xác gắn thẻ thiệp tên học sinh lên các nhánh cây mai vàng Real
const MAI_BRANCH_COORDINATES = [
  // Tán trên cùng (ngọn mai)
  { x: 42, y: 14 }, { x: 50, y: 12 }, { x: 58, y: 14 }, { x: 46, y: 22 }, { x: 54, y: 21 },
  // Tán bên trái (cành tả - cao, giữa, thấp, vươn xa)
  { x: 34, y: 20 }, { x: 27, y: 19 }, { x: 20, y: 24 }, { x: 14, y: 32 },
  { x: 38, y: 29 }, { x: 31, y: 30 }, { x: 24, y: 32 }, { x: 17, y: 40 }, { x: 11, y: 46 },
  { x: 35, y: 40 }, { x: 28, y: 42 }, { x: 21, y: 47 }, { x: 15, y: 56 }, { x: 22, y: 58 },
  { x: 38, y: 50 }, { x: 31, y: 53 }, { x: 27, y: 64 }, { x: 35, y: 62 },
  // Tán bên phải (cành hữu - cao, giữa, thấp, vươn xa)
  { x: 64, y: 19 }, { x: 71, y: 18 }, { x: 78, y: 23 }, { x: 85, y: 30 },
  { x: 62, y: 29 }, { x: 69, y: 29 }, { x: 76, y: 32 }, { x: 83, y: 39 }, { x: 89, y: 45 },
  { x: 64, y: 40 }, { x: 71, y: 42 }, { x: 78, y: 46 }, { x: 84, y: 55 }, { x: 78, y: 58 },
  { x: 61, y: 50 }, { x: 68, y: 53 }, { x: 73, y: 64 }, { x: 65, y: 62 },
  // Tán trung tâm (quanh thân mai)
  { x: 44, y: 32 }, { x: 52, y: 31 }, { x: 48, y: 40 }, { x: 43, y: 48 }, { x: 55, y: 47 }
];

export default function TetHaiHoaModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [calledStudentIds, setCalledStudentIds] = useState([]); // Danh sách học sinh đã được hái lộc
  const [activeWinner, setActiveWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(6); // 6 giây hồi hộp
  const [spinningStudent, setSpinningStudent] = useState(null);
  const [highlightIndex, setHighlightIndex] = useState(null); // Đèn nháy chạy quanh các thiệp trên cây

  const spinTimerRef = useRef(null);
  const countTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (countTimerRef.current) clearInterval(countTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Lọc danh sách học sinh có mặt
  const presentStudents = students.filter(
    (s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
  );
  const displayStudents = presentStudents.length > 0 ? presentStudents : students;

  // Danh sách các bạn chưa được gọi
  const availableStudents = displayStudents.filter(
    (s) => !calledStudentIds.includes(s.id)
  );

  // Kích hoạt bốc thăm hái hoa (cho 1 học sinh cụ thể hoặc quay ngẫu nhiên)
  const handlePickStudent = (targetStudent) => {
    if (isSpinning) return;

    if (calledStudentIds.includes(targetStudent.id)) {
      // Đã gọi rồi thì mở lại modal chúc mừng
      setActiveWinner(targetStudent);
      return;
    }

    playClick();

    const pool = availableStudents.length > 0 ? availableStudents : displayStudents;

    // BẮT ĐẦU 6S HỒI HỘP ĐẾM NGƯỢC
    setIsSpinning(true);
    setSpinCountdown(6);
    setSpinningStudent(targetStudent);

    let secondsLeft = 6;
    let tickCount = 0;

    // Vòng lặp xoay đèn nháy và tên chớp nhoáng (80ms)
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const randIdx = Math.floor(Math.random() * displayStudents.length);
      setHighlightIndex(randIdx);
      const randStudent = pool[Math.floor(Math.random() * pool.length)];
      setSpinningStudent(randStudent);
      playSuspenseSpin(tickCount / 75);
    }, 80);

    // Đếm ngược từng giây (1000ms)
    countTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setSpinCountdown(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(countTimerRef.current);
        clearInterval(spinTimerRef.current);
        setIsSpinning(false);
        setHighlightIndex(null);

        // Chốt học sinh: nếu bấm trực tiếp vào bạn nào thì chọn bạn đó, nếu quay ngẫu nhiên thì bốc từ pool
        const chosen = targetStudent || pool[Math.floor(Math.random() * pool.length)];

        setCalledStudentIds((prev) => (prev.includes(chosen.id) ? prev : [...prev, chosen.id]));

        playWinner();
        confetti({
          particleCount: 220,
          spread: 140,
          origin: { y: 0.5 },
        });

        setActiveWinner(chosen);
      }
    }, 1000);
  };

  // Nút quay ngẫu nhiên một bạn trên cây mai
  const handleRandomPick = () => {
    if (isSpinning) return;
    const pool = availableStudents.length > 0 ? availableStudents : displayStudents;
    if (pool.length === 0) return;
    const randomTarget = pool[Math.floor(Math.random() * pool.length)];
    handlePickStudent(randomTarget);
  };

  // Đặt lại toàn bộ cành mai
  const handleResetAll = () => {
    playClick();
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
    setIsSpinning(false);
    setHighlightIndex(null);
    setCalledStudentIds([]);
    setActiveWinner(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none overflow-hidden">
      {/* KHUNG MODAL CHIỀU CAO CỐ ĐỊNH 92VH - KHÔNG BAO GIỜ BỊ CO NHỎ */}
      <div className="relative w-full max-w-6xl h-[92vh] sm:h-[94vh] bg-gradient-to-b from-[#2b0808] via-[#1a0404] to-[#0d0101] border-[3.5px] border-amber-500 rounded-[2.2rem] shadow-2xl p-3 sm:p-5 flex flex-col text-amber-100 overflow-hidden space-y-2.5">
        
        {/* CSS CHUYỂN ĐỘNG THIỆP ĐUNG ĐƯA THEO GIÓ & CÁNH HOA MAI RƠI */}
        <style>{`
          @keyframes swingLuckyTag {
            0%, 100% {
              transform: translate(-50%, 0) rotate(-3.5deg);
              transform-origin: top center;
            }
            50% {
              transform: translate(-50%, 0) rotate(3.5deg);
              transform-origin: top center;
            }
          }
          .lucky-tag-swing {
            animation: swingLuckyTag 3.2s ease-in-out infinite;
          }
          .lucky-tag-swing-alt {
            animation: swingLuckyTag 2.7s ease-in-out infinite reverse;
          }

          @keyframes fallingBlossom {
            0% {
              transform: translate(0, -10px) rotate(0deg);
              opacity: 0;
            }
            20% {
              opacity: 0.9;
            }
            80% {
              opacity: 0.9;
            }
            100% {
              transform: translate(90px, 500px) rotate(360deg);
              opacity: 0;
            }
          }
          .falling-petal {
            position: absolute;
            pointer-events: none;
            background: radial-gradient(circle, #fde047 30%, #eab308 100%);
            border-radius: 50% 0 50% 50%;
            animation: fallingBlossom linear infinite;
          }
        `}</style>

        {/* =================================================================== */}
        {/* 1. HEADER TẾT TRUYỀN THỐNG VIỆT NAM                                  */}
        {/* =================================================================== */}
        <div className="flex items-center justify-between border-b-2 border-amber-800/80 pb-2 flex-shrink-0">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <span className="text-3xl sm:text-4xl animate-bounce flex-shrink-0">🌸</span>
            <div>
              <h2 className="text-base sm:text-2xl font-black text-amber-300 uppercase tracking-wider drop-shadow-md flex items-center space-x-2">
                <span>HÁI HOA DÂN CHỦ - CÂY MAI NGÀY TẾT</span>
              </h2>
              <p className="text-[10px] sm:text-xs text-amber-200/80 font-bold mt-0.5">
                Sĩ số lớp: <span className="text-amber-400">{displayStudents.length} học sinh</span> • Đã hái: <span className="text-emerald-400 font-extrabold">{calledStudentIds.length}</span>/{displayStudents.length} bạn
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* NÚT QUAY HÁI HOA NGẪU NHIÊN */}
            <button
              type="button"
              onClick={handleRandomPick}
              disabled={isSpinning || availableStudents.length === 0}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer flex items-center space-x-1.5 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Dices className="w-4 h-4 stroke-[2.5]" />
              <span>Quay Ngẫu Nhiên</span>
            </button>

            {/* NÚT MỞ LẠI TẤT CẢ */}
            <button
              type="button"
              onClick={handleResetAll}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/60 text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-md active:scale-95"
              title="Đặt lại cành mai"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Đặt Lại Cây Mai</span>
            </button>

            {/* NÚT ĐÓNG */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-amber-400/80 hover:text-white rounded-xl hover:bg-white/10 transition cursor-pointer"
              title="Đóng"
            >
              <X className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* HƯỚNG DẪN RÕ RÀNG */}
        <div className="text-[10px] sm:text-xs font-black text-amber-300 flex items-center justify-between bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-700/50 shadow-inner flex-shrink-0">
          <span>🧧 Bấm trực tiếp vào tấm thiệp mang tên học sinh trên cành mai hoặc bấm "Quay Ngẫu Nhiên" để hái hoa trả bài nhận lì xì!</span>
          <span className="hidden sm:inline text-amber-400">Còn lại: <strong>{availableStudents.length}</strong> bạn</span>
        </div>

        {/* =================================================================== */}
        {/* 2. CÂY MAI VÀNG REAL ĐẠI THỤ GẮN ĐẦY ĐỦ TÊN HỌC SINH (CHUẨN 100% REAL) */}
        {/* =================================================================== */}
        <div className="flex-1 relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-black min-h-[380px]">
          {/* HÌNH ẢNH CÂY MAI REAL NỞ HOA VÀNG RỰC RỠ 8K */}
          <img
            src="/images/tet/tree_mai_real.jpg"
            alt="Cây Mai Vàng Real Ngày Tết"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />

          {/* LỚP PHỦ GRADIENT TỐI NHẸ ĐỂ NỔI BẬT CÁC TẤM THIỆP GẮN TÊN */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

          {/* CÁNH HOA MAI VÀNG BAY LƯỢN TRONG GIÓ XUÂN */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { left: '12%', top: '-10px', delay: '0s', dur: '5s', size: '10px' },
              { left: '32%', top: '-10px', delay: '1.2s', dur: '6s', size: '12px' },
              { left: '52%', top: '-10px', delay: '0.6s', dur: '5.4s', size: '9px' },
              { left: '72%', top: '-10px', delay: '2.1s', dur: '6.2s', size: '11px' },
              { left: '88%', top: '-10px', delay: '3.0s', dur: '5.0s', size: '10px' },
            ].map((p, idx) => (
              <div
                key={idx}
                className="falling-petal"
                style={{
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                  animationDelay: p.delay,
                  animationDuration: p.dur,
                }}
              />
            ))}
          </div>

          {/* DẢI CÂU ĐỐI ĐỎ TẾT HAI BÊN */}
          <div className="absolute top-4 left-3 hidden lg:flex flex-col items-center bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] border-2 border-amber-400 py-3.5 px-2 rounded-xl shadow-2xl pointer-events-none z-10 space-y-1">
            <span className="text-[11px] font-black text-amber-300 writing-vertical-lr tracking-widest uppercase">
              🌸 MAI VÀNG NỞ RỘ ĐÓN XUÂN SANG 🌸
            </span>
          </div>
          <div className="absolute top-4 right-3 hidden lg:flex flex-col items-center bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] border-2 border-amber-400 py-3.5 px-2 rounded-xl shadow-2xl pointer-events-none z-10 space-y-1">
            <span className="text-[11px] font-black text-amber-300 writing-vertical-lr tracking-widest uppercase">
              🧧 VẠN SỰ NHƯ Ý ĐẮC TÀI LỘC 🧧
            </span>
          </div>

          {/* ================================================================= */}
          {/* CÁC TẤM THIỆP GẮN TRỰC TIẾP TÊN HỌC SINH TREO TRÊN TỪNG CÀNH MAI    */}
          {/* ================================================================= */}
          <div className="absolute inset-0">
            {displayStudents.map((st, idx) => {
              const isCalled = calledStudentIds.includes(st.id);
              const isHighlighted = highlightIndex === idx;
              
              // Lấy tọa độ cành mai chuẩn xác
              const coord = MAI_BRANCH_COORDINATES[idx % MAI_BRANCH_COORDINATES.length];
              const swingClass = idx % 2 === 0 ? 'lucky-tag-swing' : 'lucky-tag-swing-alt';

              return (
                <div
                  key={st.id}
                  className={`absolute cursor-pointer z-20 ${swingClass} ${
                    isHighlighted ? 'scale-130 z-40 animate-pulse' : ''
                  }`}
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                  }}
                  onClick={() => handlePickStudent(st)}
                >
                  {/* SỢI DÂY TREO ĐỎ TỪ CÀNH MAI RỦ XUỐNG */}
                  <div className="w-0.5 h-3.5 sm:h-5 bg-gradient-to-b from-amber-400 to-rose-600 mx-auto relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-600 shadow-2xs" />
                  </div>

                  {/* THÂN THẺ LIỄN / THIỆP ĐỎ GẤM THIẾT KẾ ĐẶC BIỆT GẮN TÊN HỌC SINH */}
                  <div
                    className={`w-16 sm:w-20 h-13 sm:h-15 rounded-xl p-1 text-center transition transform hover:scale-120 hover:z-40 shadow-2xl border-2 flex flex-col items-center justify-between ${
                      isHighlighted
                        ? 'bg-yellow-400 text-slate-950 border-white shadow-[0_0_20px_#fde047]'
                        : isCalled
                        ? 'bg-gradient-to-b from-amber-600/90 via-amber-700/90 to-amber-900/90 border-amber-300/60 opacity-70'
                        : 'bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] border-amber-400/90 hover:border-yellow-200 hover:shadow-[0_0_15px_#f59e0b]'
                    }`}
                    title={isCalled ? `Đã gọi: ${st.full_name}` : `Bấm để chọn: ${st.full_name}`}
                  >
                    {/* HÀNG TRÊN: HOA MAI HOẶC SỐ ÁO */}
                    <div className="flex items-center justify-between w-full px-1 leading-none">
                      <span className="text-[9px]">🌸</span>
                      {isCalled ? (
                        <span className="text-[8px] bg-emerald-600 text-white px-1 py-0.2 rounded-full font-bold">
                          ✓
                        </span>
                      ) : (
                        <span className="text-[8px] text-amber-300 font-mono font-bold">
                          #{idx + 1}
                        </span>
                      )}
                    </div>

                    {/* HÀNG GIỮA: TÊN HỌC SINH GẮN TRỰC TIẾP TRÊN THIỆP CÀNH MAI */}
                    <div className="w-full px-0.5">
                      <span className={`block font-black text-[10px] sm:text-[11px] leading-tight truncate tracking-tight ${
                        isHighlighted ? 'text-slate-950 font-black' : isCalled ? 'text-amber-100' : 'text-amber-200 drop-shadow-sm'
                      }`}>
                        {st.full_name}
                      </span>
                    </div>

                    {/* HÀNG DƯỚI: BIỂU TƯỢNG LÌ XÌ */}
                    <div className="text-[9px] leading-none">
                      {isCalled ? '🧧' : '🏮'}
                    </div>
                  </div>

                  {/* CHÙM TUA RUA ĐỎ VÀNG ĐUÔI PHỤNG DƯỚI ĐÁY THIỆP */}
                  <div className="flex flex-col items-center -mt-0.5 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-600" />
                    <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-rose-600 via-amber-400 to-rose-700 rounded-b-sm shadow-xs" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. MODAL 6 GIÂY HỒI HỘP KHI ĐANG QUAY HÁI HOA                        */}
        {/* =================================================================== */}
        {isSpinning && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-amber-500 via-rose-600 to-amber-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-4 border-amber-300">
              <div className="bg-gradient-to-b from-[#2b0808] to-[#150202] rounded-[2.2rem] p-6 text-center space-y-5 text-amber-100 relative overflow-hidden">
                
                {/* VỆT SÁNG QUAY TRÒN */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl animate-spin pointer-events-none" />

                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest block animate-pulse">
                    🌸 ĐANG HÁI HOA TRÊN CÀNH MAI 🌸
                  </span>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Ai sẽ là chủ nhân của đóa hoa mai may mắn này?
                  </p>
                </div>

                {/* ĐỒNG HỒ ĐẾM NGƯỢC 6S TO RÕ */}
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 shadow-xl animate-bounce">
                  <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center border-2 border-amber-300">
                    <span className="font-mono font-black text-3xl text-amber-300">
                      0{spinCountdown}s
                    </span>
                  </div>
                </div>

                {/* HỌC SINH ĐANG XOAY CHỚP NHOÁNG */}
                {spinningStudent && (
                  <div className="bg-amber-950/60 p-3 rounded-2xl border border-amber-500/50 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/30 p-1 border-2 border-amber-400 shadow-md">
                      <img
                        src={spinningStudent.avatar}
                        alt={spinningStudent.full_name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <span className="text-base font-black text-white block truncate tracking-tight">
                      {spinningStudent.full_name}
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold block">
                      {spinningStudent.code ? `${spinningStudent.code} • ` : ''}Tổ {spinningStudent.team_group || 1}
                    </span>
                  </div>
                )}

                <div className="text-[11px] text-amber-200/70 italic animate-pulse">
                  ⏳ Đang chọn lọc ngẫu nhiên trong 6 giây...
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 4. MODAL KẾT QUẢ TRÚNG LỘC / HÁI HOA THÀNH CÔNG                      */}
        {/* =================================================================== */}
        {activeWinner && !isSpinning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-3 border-amber-300">
              <div className="bg-gradient-to-b from-[#3a0808] to-[#1f0303] rounded-[2.3rem] p-6 text-center space-y-4 text-amber-100">
                <span className="text-4xl animate-bounce inline-block">🎊 🌸 🎊</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    CHÚC MỪNG BẠN ĐÃ ĐƯỢC HÁI HOA
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {activeWinner.full_name}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-bold font-mono">
                    {activeWinner.code ? `${activeWinner.code} • ` : ''}Tổ {activeWinner.team_group || 1}
                  </p>
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 p-2 shadow-inner">
                  <img
                    src={activeWinner.avatar}
                    alt={activeWinner.full_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="p-3 bg-amber-950/80 rounded-2xl border border-amber-600/40 text-xs font-bold text-amber-200">
                  🎯 Xin mời bạn: <span className="text-amber-400 font-black">Lên Bảng Trả Bài / Nhận Lì Xì!</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveWinner(null)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95"
                >
                  Tuyệt Vời & Tiếp Tục
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
