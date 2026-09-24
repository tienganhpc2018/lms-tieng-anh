import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RotateCcw, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin, playTick } from '../../../utils/soundEffects';

// Bảng 45 tọa độ chuẩn xác treo thiệp lộc trên các nhánh cành cây mai vàng Real
const MAI_BRANCH_COORDINATES = [
  // Cành trái trên cao
  { x: 19, y: 26 }, { x: 26, y: 22 }, { x: 32, y: 20 }, { x: 38, y: 25 },
  // Cành trái giữa
  { x: 15, y: 36 }, { x: 22, y: 35 }, { x: 29, y: 34 }, { x: 35, y: 37 },
  // Cành trái thấp & vươn xa
  { x: 11, y: 48 }, { x: 17, y: 50 }, { x: 24, y: 47 }, { x: 31, y: 49 }, { x: 37, y: 53 }, { x: 13, y: 62 }, { x: 20, y: 64 },
  // Ngọn mai trung tâm trên cao
  { x: 44, y: 13 }, { x: 50, y: 11 }, { x: 56, y: 13 }, { x: 62, y: 16 },
  // Ngọn mai tầng 2
  { x: 41, y: 23 }, { x: 47, y: 24 }, { x: 53, y: 22 }, { x: 59, y: 24 },
  // Cành phải trên cao
  { x: 66, y: 25 }, { x: 72, y: 21 }, { x: 78, y: 23 }, { x: 84, y: 27 },
  // Cành phải giữa
  { x: 65, y: 36 }, { x: 71, y: 34 }, { x: 77, y: 35 }, { x: 83, y: 38 }, { x: 89, y: 43 },
  // Cành phải thấp & vươn xa
  { x: 63, y: 48 }, { x: 69, y: 47 }, { x: 75, y: 49 }, { x: 81, y: 52 }, { x: 87, y: 56 }, { x: 80, y: 62 },
  // Tán giữa trung tâm & nhánh phụ
  { x: 43, y: 35 }, { x: 49, y: 36 }, { x: 55, y: 35 }, { x: 27, y: 58 }, { x: 73, y: 60 }, { x: 34, y: 62 }, { x: 65, y: 61 }
];

export default function TetHaiHoaModal({ isOpen, onClose, students = [], onAwardStudent }) {
  const [openedLocs, setOpenedLocs] = useState({}); // { locNum: studentId }
  const [activeWinner, setActiveWinner] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(6); // 6 giây hồi hộp
  const [spinningLocNum, setSpinningLocNum] = useState(null);
  const [spinningCandidate, setSpinningCandidate] = useState(null);

  const spinTimerRef = useRef(null);
  const countTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) clearInterval(spinTimerRef.current);
      if (countTimerRef.current) clearInterval(countTimerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const totalLoc = students.length || 35;

  const handlePickLoc = (locNum) => {
    if (isSpinning) return;

    if (openedLocs[locNum]) {
      // Đã mở rồi thì mở lại modal xem ai trúng
      const stId = openedLocs[locNum];
      const st = students.find((s) => s.id === stId);
      if (st) setActiveWinner({ student: st, locNum });
      return;
    }

    playClick();

    // Chuẩn bị danh sách học sinh hợp lệ
    const presentStudents = students.filter(
      (s) => s.status !== 'Absent_Perm' && s.status !== 'Absent_NoPerm'
    );
    const candidatePool = presentStudents.length > 0 ? presentStudents : students;
    const availableStudents = candidatePool.filter(
      (s) => !Object.values(openedLocs).includes(s.id)
    );
    const finalPool = availableStudents.length > 0 ? availableStudents : candidatePool;

    // BẮT ĐẦU 6S HỒI HỘP ĐẾM NGƯỢC
    setIsSpinning(true);
    setSpinningLocNum(locNum);
    setSpinCountdown(6);
    setSpinningCandidate(finalPool[Math.floor(Math.random() * finalPool.length)]);

    let secondsLeft = 6;
    let tickCount = 0;

    // Vòng lặp xoay tên chớp nhoáng (80ms)
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const rand = finalPool[Math.floor(Math.random() * finalPool.length)];
      setSpinningCandidate(rand);
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

        // Chốt học sinh trúng lộc
        const chosen = finalPool[Math.floor(Math.random() * finalPool.length)];

        setOpenedLocs((prev) => ({
          ...prev,
          [locNum]: chosen.id,
        }));

        playWinner();
        confetti({
          particleCount: 180,
          spread: 120,
          origin: { y: 0.5 },
        });

        setActiveWinner({ student: chosen, locNum });
      }
    }, 1000);
  };

  const handleResetAll = () => {
    playClick();
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
    setIsSpinning(false);
    setOpenedLocs({});
    setActiveWinner(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto select-none">
      <div className="bg-gradient-to-b from-[#2b0808] via-[#1a0404] to-[#0d0101] border-3 border-amber-500/80 rounded-[2.5rem] w-full max-w-6xl shadow-2xl p-4 sm:p-6 space-y-3 my-auto relative text-amber-100 flex flex-col max-h-[96vh] overflow-hidden">
        
        {/* CSS CHUYỂN ĐỘNG THIỆP ĐUNG ĐƯA THEO GIÓ & CÁNH HOA MAI RƠI */}
        <style>{`
          @keyframes swingLuckyTag {
            0%, 100% {
              transform: rotate(-3deg);
              transform-origin: top center;
            }
            50% {
              transform: rotate(3deg);
              transform-origin: top center;
            }
          }
          .lucky-tag-swing {
            animation: swingLuckyTag 3.2s ease-in-out infinite;
          }
          .lucky-tag-swing-alt {
            animation: swingLuckyTag 2.6s ease-in-out infinite reverse;
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
              transform: translate(80px, 450px) rotate(360deg);
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
        <div className="flex items-center justify-between border-b-2 border-amber-800/80 pb-2.5 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-3xl sm:text-4xl animate-bounce">🌸</span>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-amber-300 uppercase tracking-widest flex items-center space-x-2 drop-shadow-md">
                <span>HÁI LỘC ĐẦU XUÂN - CÂY MAI TẾT</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-amber-200/80 font-bold mt-0.5">
                Sĩ số lớp: <span className="text-amber-400">{students.length} học sinh</span> • Tổng số thiệp lộc treo cành mai: <span className="text-amber-400">{totalLoc} lộc</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3 sm:px-4 py-1.5 rounded-xl bg-amber-950/90 hover:bg-amber-900 text-amber-200 border border-amber-600/80 text-xs font-black transition cursor-pointer flex items-center space-x-1.5 shadow-md active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Mở Lại Tất Cả ({Object.keys(openedLocs).length}/{totalLoc} đã hái)</span>
            </button>
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

        {/* HƯỚNG DẪN GỢI Ý */}
        <div className="text-[11px] sm:text-xs font-black text-amber-300 flex items-center justify-between bg-amber-950/60 px-3.5 py-1.5 rounded-xl border border-amber-700/50 shadow-inner flex-shrink-0">
          <span>🧧 Bấm chọn một tấm thiệp may mắn treo trên cành mai để bốc thăm lì xì bất ngờ cho học sinh (Quay chọn 6s hồi hộp)!</span>
          <span className="hidden sm:inline text-amber-400">Đã hái: <strong>{Object.keys(openedLocs).length}</strong>/{totalLoc}</span>
        </div>

        {/* =================================================================== */}
        {/* 2. CÂY MAI VÀNG REAL ĐẠI THỤ GẮN THIỆP LỘC NGÀY TẾT (CHUẨN 100% REAL) */}
        {/* =================================================================== */}
        <div className="flex-1 relative w-full h-[62vh] sm:h-[68vh] rounded-3xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-black">
          {/* HÌNH ẢNH CÂY MAI REAL NỞ HOA VÀNG RỰC RỠ */}
          <img
            src="/images/tet/tree_mai_real.jpg"
            alt="Cây Mai Vàng Real Ngày Tết"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />

          {/* LỚP PHỦ TỐI NHẸ Ở CẠNH ĐỂ LÀM NỔI BẬT CÁC TẤM THIỆP ĐỎ */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* CÁNH HOA MAI VÀNG BAY LƯỢN TRONG GIÓ XUÂN */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[
              { left: '15%', top: '-10px', delay: '0s', dur: '5s', size: '10px' },
              { left: '35%', top: '-10px', delay: '1.5s', dur: '6s', size: '12px' },
              { left: '55%', top: '-10px', delay: '0.8s', dur: '5.5s', size: '9px' },
              { left: '75%', top: '-10px', delay: '2.2s', dur: '6.5s', size: '11px' },
              { left: '88%', top: '-10px', delay: '3.1s', dur: '5.2s', size: '10px' },
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

          {/* DẢI CÂU ĐỐI ĐỎ TẾT HAI BÊN (TRANG TRÍ THÊM KHÔNG KHÍ TẾT) */}
          <div className="absolute top-4 left-3 hidden md:flex flex-col items-center bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] border-2 border-amber-400 py-3 px-1.5 rounded-xl shadow-2xl pointer-events-none z-10 space-y-1">
            <span className="text-[10px] font-black text-amber-300 writing-vertical-lr tracking-widest uppercase">
              🌸 MAI VÀNG ĐÓN XUÂN 🌸
            </span>
          </div>
          <div className="absolute top-4 right-3 hidden md:flex flex-col items-center bg-gradient-to-b from-[#b91c1c] to-[#7f1d1d] border-2 border-amber-400 py-3 px-1.5 rounded-xl shadow-2xl pointer-events-none z-10 space-y-1">
            <span className="text-[10px] font-black text-amber-300 writing-vertical-lr tracking-widest uppercase">
              🧧 VẠN SỰ NHƯ Ý 🧧
            </span>
          </div>

          {/* ================================================================= */}
          {/* CÁC TẤM THIỆP LỘC XUÂN TREO LƠ LỬNG TRÊN TỪNG CÀNH MAI VÀNG       */}
          {/* ================================================================= */}
          <div className="absolute inset-0">
            {Array.from({ length: totalLoc }, (_, i) => i + 1).map((num, idx) => {
              const isOpened = Boolean(openedLocs[num]);
              const assignedStudentId = openedLocs[num];
              const st = students.find((s) => s.id === assignedStudentId);
              
              // Lấy tọa độ cành mai chuẩn xác
              const coord = MAI_BRANCH_COORDINATES[idx % MAI_BRANCH_COORDINATES.length];
              const swingClass = idx % 2 === 0 ? 'lucky-tag-swing' : 'lucky-tag-swing-alt';

              return (
                <div
                  key={num}
                  className={`absolute transform -translate-x-1/2 -translate-y-2 cursor-pointer z-20 ${swingClass}`}
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                  }}
                  onClick={() => handlePickLoc(num)}
                >
                  {/* SỢI DÂY TREO ĐỎ TỪ CÀNH MAI RỦ XUỐNG */}
                  <div className="w-0.5 h-4 sm:h-5 bg-gradient-to-b from-amber-400 to-rose-600 mx-auto relative">
                    {/* HẠT NGỌC VÀNG Ở NÚT TREO */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-300 border border-amber-600 shadow-2xs" />
                  </div>

                  {/* THÂN TẤM THIỆP LỘC ĐỎ GẤM THÊU VIỀN VÀNG */}
                  <div
                    className={`w-9 h-13 sm:w-11 sm:h-15 rounded-xl p-1 text-center transition transform hover:scale-125 hover:z-40 shadow-xl border-2 flex flex-col items-center justify-between ${
                      isOpened
                        ? 'bg-gradient-to-b from-amber-500/90 via-amber-600/90 to-amber-700/90 border-yellow-200 shadow-amber-400/50'
                        : 'bg-gradient-to-b from-[#b91c1c] via-[#991b1b] to-[#7f1d1d] border-amber-400/90 hover:border-yellow-300 hover:shadow-[0_0_12px_#f59e0b]'
                    }`}
                    title={isOpened ? `Đã mở: ${st?.full_name || 'Học sinh'}` : `Bấm để hái lộc số ${num}`}
                  >
                    {isOpened ? (
                      /* THIỆP ĐÃ MỞ: HIỆN ICON LÌ XÌ VÀ TÊN HỌC SINH */
                      <div className="flex flex-col items-center justify-center h-full space-y-0.5">
                        <span className="text-xs sm:text-sm leading-none">🧧</span>
                        <span className="text-[9px] sm:text-[10px] font-black text-slate-950 block truncate max-w-[42px] leading-tight drop-shadow-xs">
                          {st?.full_name?.split(' ').pop() || `#${num}`}
                        </span>
                      </div>
                    ) : (
                      /* THIỆP CHƯA MỞ: HOA MAI VÀNG + CHỮ LỘC + SỐ THỨ TỰ LỘC */
                      <>
                        <div className="text-[8px] sm:text-[9px] text-amber-300 leading-none">🌸</div>
                        <span className="text-[8px] sm:text-[9px] font-black text-amber-200 uppercase tracking-tighter block leading-none">
                          LỘC
                        </span>
                        <span className="text-[11px] sm:text-xs font-black text-amber-300 block leading-none drop-shadow-sm font-mono">
                          {num}
                        </span>
                      </>
                    )}
                  </div>

                  {/* CHÙM TUA RUA ĐỎ VÀNG ĐUÔI PHỤNG DƯỚI ĐÁY THIỆP */}
                  <div className="flex flex-col items-center -mt-0.5 pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 border border-amber-600" />
                    <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-rose-600 via-amber-400 to-rose-700 rounded-b-sm shadow-xs" />
                  </div>

                  {/* DẤU TÍCH ĐÃ HÁI */}
                  {isOpened && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border border-white text-white text-[8px] font-black rounded-full flex items-center justify-center shadow-xs">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. MODAL 6 GIÂY HỒI HỘP KHI ĐANG QUAY LỘC                             */}
        {/* =================================================================== */}
        {isSpinning && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-amber-500 via-rose-600 to-amber-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-4 border-amber-300">
              <div className="bg-gradient-to-b from-[#2b0808] to-[#150202] rounded-[2.2rem] p-6 text-center space-y-5 text-amber-100 relative overflow-hidden">
                
                {/* VỆT SÁNG QUAY TRÒN */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl animate-spin pointer-events-none" />

                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest block animate-pulse">
                    🌸 ĐANG HÁI LỘC XUÂN #{spinningLocNum} 🌸
                  </span>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Ai sẽ là chủ nhân của phong bao lì xì may mắn này?
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
                {spinningCandidate && (
                  <div className="bg-amber-950/60 p-3 rounded-2xl border border-amber-500/50 space-y-2">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/30 p-1 border-2 border-amber-400 shadow-md">
                      <img
                        src={spinningCandidate.avatar}
                        alt={spinningCandidate.full_name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <span className="text-base font-black text-white block truncate tracking-tight">
                      {spinningCandidate.full_name}
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono font-bold block">
                      {spinningCandidate.code ? `${spinningCandidate.code} • ` : ''}Tổ {spinningCandidate.team_group || 1}
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
        {/* 4. MODAL KẾT QUẢ TRÚNG LỘC (SAU KHI ĐẾM NGƯỢC XONG)                  */}
        {/* =================================================================== */}
        {activeWinner && !isSpinning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-3 border-amber-300">
              <div className="bg-gradient-to-b from-[#3a0808] to-[#1f0303] rounded-[2.3rem] p-6 text-center space-y-4 text-amber-100">
                <span className="text-4xl animate-bounce inline-block">🎊 🧧 🎊</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    CHÚC MỪNG BẠN TRÚNG LỘC #{activeWinner.locNum}
                  </span>
                  {/* BỎ SỐ THỨ TỰ, CHỈ ĐỂ TÊN HỌC SINH ĐÚNG YÊU CẦU THẦY */}
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {activeWinner.student?.full_name}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-bold font-mono">
                    {activeWinner.student?.code ? `${activeWinner.student?.code} • ` : ''}Tổ {activeWinner.student?.team_group || 1}
                  </p>
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 p-2 shadow-inner">
                  <img
                    src={activeWinner.student?.avatar}
                    alt={activeWinner.student?.full_name}
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
