import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RotateCcw, Dices, Settings, Award, BookOpen, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playSuspenseSpin, playTick } from '../../../utils/soundEffects';
import TetQuestionConfigModal from '../components/TetQuestionConfigModal';
import TetQuestionPlayer from '../components/TetQuestionPlayer';
import { getFilteredTetQuestions } from '../data/tetQuestionsBank';

// Bảng tọa độ chuẩn xác gắn các đèn lồng LỘC lên các nhánh cành cây mai vàng Real
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
  // Trạng thái lưu trữ Lộc đã mở: { [locNumber]: student }
  const [openedLocs, setOpenedLocs] = useState({});
  const [calledStudentIds, setCalledStudentIds] = useState([]);
  
  // Trạng thái quay bốc thăm 6s hồi hộp
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCountdown, setSpinCountdown] = useState(6);
  const [spinningStudent, setSpinningStudent] = useState(null);
  const [targetLocNumber, setTargetLocNumber] = useState(null);
  const [highlightLocIndex, setHighlightLocIndex] = useState(null);

  // Màn hình kết quả người trúng lộc
  const [winnerModalData, setWinnerModalData] = useState(null); // { student, locNumber }

  // Màn hình trả lời câu hỏi Tiếng Anh
  const [activeQuestionSession, setActiveQuestionSession] = useState(null); // { student, locNumber, questions }

  // Modal cấu hình câu hỏi Tiếng Anh
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [questionConfig, setQuestionConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('tet_haihoa_question_config');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      grade: 3,
      unit: 'all',
      count: 2,
      questionType: 'all' // 'all' | 'multiple_choice' | 'short_answer' | 'word_reorder'
    };
  });

  const spinTimerRef = useRef(null);
  const countTimerRef = useRef(null);

  // Lưu cấu hình vào localStorage khi thay đổi
  const handleUpdateConfig = (newCfg) => {
    setQuestionConfig(newCfg);
    try {
      localStorage.setItem('tet_haihoa_question_config', JSON.stringify(newCfg));
    } catch (e) {
      // ignore
    }
  };

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

  // Tổng số lộc treo trên cây mai (tương ứng với sĩ số lớp)
  const totalLocCount = Math.max(displayStudents.length, 1);
  const locList = Array.from({ length: totalLocCount }, (_, i) => i + 1);

  // Danh sách các số lộc chưa được hái
  const availableLocNumbers = locList.filter((num) => !openedLocs[num]);

  // Bắt đầu bốc thăm hái lộc
  const startPickProcess = (locNum) => {
    if (isSpinning) return;

    // Nếu lộc này đã có người hái rồi thì mở xem lại
    if (openedLocs[locNum]) {
      const pastWinner = openedLocs[locNum];
      setWinnerModalData({ student: pastWinner, locNumber: locNum, isPast: true });
      return;
    }

    playClick();

    const pool = availableStudents.length > 0 ? availableStudents : displayStudents;
    setTargetLocNumber(locNum);
    setIsSpinning(true);
    setSpinCountdown(6);
    setSpinningStudent(pool[0]);

    let secondsLeft = 6;
    let tickCount = 0;

    // Vòng lặp xoay chớp nhoáng (80ms)
    spinTimerRef.current = setInterval(() => {
      tickCount++;
      const randLocIdx = Math.floor(Math.random() * locList.length);
      setHighlightLocIndex(randLocIdx);
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
        setHighlightLocIndex(null);

        // Chọn học sinh may mắn
        const chosen = pool[Math.floor(Math.random() * pool.length)];

        // Ghi nhận học sinh đã được gọi và lộc đã được mở
        setCalledStudentIds((prev) => (prev.includes(chosen.id) ? prev : [...prev, chosen.id]));
        setOpenedLocs((prev) => ({
          ...prev,
          [locNum]: chosen
        }));

        playWinner();
        confetti({
          particleCount: 220,
          spread: 140,
          origin: { y: 0.5 },
        });

        // Mở popup chúc mừng trước khi vào trả lời câu hỏi
        setWinnerModalData({ student: chosen, locNumber: locNum, isPast: false });
      }
    }, 1000);
  };

  // Nút quay ngẫu nhiên một lộc
  const handleRandomPick = () => {
    if (isSpinning) return;
    const locPool = availableLocNumbers.length > 0 ? availableLocNumbers : locList;
    if (locPool.length === 0) return;
    const randomLoc = locPool[Math.floor(Math.random() * locPool.length)];
    startPickProcess(randomLoc);
  };

  // Khi bấm "Bắt Đầu Trả Lời Câu Hỏi" từ popup chúc mừng
  const handleStartQuestionSession = () => {
    if (!winnerModalData) return;
    playClick();

    const questions = getFilteredTetQuestions({
      grade: questionConfig.grade,
      unit: questionConfig.unit,
      questionType: questionConfig.questionType,
      count: questionConfig.count
    });

    const student = winnerModalData.student;
    const locNum = winnerModalData.locNumber;
    setWinnerModalData(null);

    setActiveQuestionSession({
      student,
      locNumber: locNum,
      questions
    });
  };

  // Đặt lại toàn bộ cành mai
  const handleResetAll = () => {
    playClick();
    if (spinTimerRef.current) clearInterval(spinTimerRef.current);
    if (countTimerRef.current) clearInterval(countTimerRef.current);
    setIsSpinning(false);
    setHighlightLocIndex(null);
    setCalledStudentIds([]);
    setOpenedLocs({});
    setWinnerModalData(null);
    setActiveQuestionSession(null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none overflow-hidden">
      {/* KHUNG MODAL CHIỀU CAO CỐ ĐỊNH 92VH - KHÔNG BAO GIỜ BỊ CO NHỎ */}
      <div className="relative w-full max-w-6xl h-[92vh] sm:h-[94vh] bg-gradient-to-b from-[#2b0808] via-[#1a0404] to-[#0d0101] border-[3.5px] border-amber-500 rounded-[2.2rem] shadow-2xl p-3 sm:p-5 flex flex-col text-amber-100 overflow-hidden space-y-2.5">
        
        {/* CSS CHUYỂN ĐỘNG ĐÈN LỒNG BẦU DỤC ĐUNG ĐƯA THEO GIÓ & CÁNH HOA MAI */}
        <style>{`
          @keyframes swingLantern {
            0%, 100% {
              transform: translate(-50%, 0) rotate(-4deg);
              transform-origin: top center;
            }
            50% {
              transform: translate(-50%, 0) rotate(4deg);
              transform-origin: top center;
            }
          }
          .lantern-swing {
            animation: swingLantern 3.2s ease-in-out infinite;
          }
          .lantern-swing-alt {
            animation: swingLantern 2.6s ease-in-out infinite reverse;
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
                Sĩ số lớp: <span className="text-amber-400">{displayStudents.length} học sinh</span> • Đã hái: <span className="text-emerald-400 font-extrabold">{calledStudentIds.length}</span>/{displayStudents.length} lộc
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 sm:space-x-2.5">
            {/* NÚT CẤU HÌNH CÂU HỎI TIẾNG ANH */}
            <button
              type="button"
              onClick={() => {
                playClick();
                setIsConfigOpen(true);
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-2 border-amber-600/70 text-xs font-black transition cursor-pointer flex items-center space-x-1.5 shadow-md active:scale-95"
              title="Cài đặt Lớp, Unit, Số câu và Dạng bài tập Tiếng Anh"
            >
              <Settings className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Cấu Hình Câu Hỏi</span>
              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded-full border border-amber-400/40">
                Lớp {questionConfig.grade}
              </span>
            </button>

            {/* NÚT QUAY HÁI HOA NGẪU NHIÊN */}
            <button
              type="button"
              onClick={handleRandomPick}
              disabled={isSpinning || availableLocNumbers.length === 0}
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm transition cursor-pointer flex items-center space-x-1.5 shadow-lg active:scale-95 disabled:opacity-50"
            >
              <Dices className="w-4 h-4 stroke-[2.5]" />
              <span>Quay Ngẫu Nhiên</span>
            </button>

            {/* NÚT MỞ LẠI TẤT CẢ */}
            <button
              type="button"
              onClick={handleResetAll}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/60 text-xs font-bold transition cursor-pointer flex items-center space-x-1 shadow-md active:scale-95"
              title="Đặt lại toàn bộ cành mai"
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
          <span>🏮 Bấm vào từng chiếc đèn lồng LỘC trên cây mai hoặc bấm "Quay Ngẫu Nhiên" để chọn học sinh trả lời câu hỏi nhận Lì Xì!</span>
          <span className="hidden sm:inline text-amber-400">Còn lại: <strong>{availableLocNumbers.length}</strong> lộc</span>
        </div>

        {/* =================================================================== */}
        {/* 2. CÂY MAI VÀNG REAL 8K GẮN CÁC ĐÈN LỒNG BẦU DỤC ĐỎ CHUẨN ẢNH 2      */}
        {/* =================================================================== */}
        <div className="flex-1 relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-amber-500/80 shadow-2xl bg-black min-h-[380px]">
          {/* HÌNH ẢNH CÂY MAI REAL NỞ HOA VÀNG RỰC RỠ 8K */}
          <img
            src="/images/tet/tree_mai_real.jpg"
            alt="Cây Mai Vàng Real Ngày Tết"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />

          {/* LỚP PHỦ GRADIENT TỐI NHẸ ĐỂ NỔI BẬT CÁC CHIẾC ĐÈN LỒNG */}
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
          {/* CÁC ĐÈN LỒNG BẦU DỤC ĐỎ VIỀN VÀNG KIM CHUẨN 100% THEO ẢNH 2      */}
          {/* ================================================================= */}
          <div className="absolute inset-0">
            {locList.map((locNum, idx) => {
              const isOpened = Boolean(openedLocs[locNum]);
              const openedStudent = openedLocs[locNum];
              const isHighlighted = highlightLocIndex === idx;

              // Lấy tọa độ cành mai chuẩn xác
              const coord = MAI_BRANCH_COORDINATES[idx % MAI_BRANCH_COORDINATES.length];
              const swingClass = idx % 2 === 0 ? 'lantern-swing' : 'lantern-swing-alt';

              return (
                <div
                  key={locNum}
                  className={`absolute cursor-pointer z-20 ${swingClass} ${
                    isHighlighted ? 'scale-125 z-40 animate-pulse' : ''
                  }`}
                  style={{
                    left: `${coord.x}%`,
                    top: `${coord.y}%`,
                  }}
                  onClick={() => startPickProcess(locNum)}
                  title={
                    isOpened
                      ? `Lộc ${locNum}: ${openedStudent?.full_name} (Bấm để xem lại)`
                      : `Bấm để hái Lộc ${locNum}`
                  }
                >
                  {/* TRỤC QUE VÀNG NHÔ LÊN PHÍA TRÊN ĐÈN LỒNG (CHUẨN ẢNH 2) */}
                  <div className="w-1 sm:w-1.5 h-2.5 sm:h-3.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-t-full shadow-xs mx-auto" />

                  {/* THÂN ĐÈN LỒNG HÌNH BẦU DỤC ĐỨNG ĐỎ VIỀN VÀNG (CHUẨN ẢNH 2) */}
                  <div
                    className={`w-9 sm:w-11 h-13 sm:h-15 rounded-[1.2rem] text-center transition transform hover:scale-120 hover:z-40 shadow-2xl border-2 flex flex-col items-center justify-center p-0.5 relative ${
                      isHighlighted
                        ? 'bg-yellow-400 text-slate-950 border-white shadow-[0_0_20px_#fde047]'
                        : isOpened
                        ? 'bg-gradient-to-b from-[#991b1b] via-[#7f1d1d] to-[#450a0a] border-yellow-400/60 opacity-80'
                        : 'bg-gradient-to-b from-[#e11d48] via-[#dc2626] to-[#991b1b] border-yellow-300 hover:border-white shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                    }`}
                  >
                    {/* DÒNG TRÊN: CHỮ LỘC VÀNG KIM */}
                    <span
                      className={`text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider leading-none ${
                        isHighlighted ? 'text-slate-950' : 'text-yellow-300 drop-shadow-sm'
                      }`}
                    >
                      LỘC
                    </span>

                    {/* DÒNG DƯỚI: SỐ THỨ TỰ LỘC MÀU TRẮNG DÀY NỔI BẬT */}
                    <span
                      className={`text-sm sm:text-base font-black font-mono leading-none mt-0.5 ${
                        isHighlighted ? 'text-slate-950' : 'text-white drop-shadow-md'
                      }`}
                    >
                      {locNum}
                    </span>

                    {/* DẤU TÍCH XANH HOẶC LÌ XÌ NẾU ĐÃ MỞ */}
                    {isOpened && (
                      <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center text-[8px] font-black shadow-xs">
                        ✓
                      </div>
                    )}
                  </div>

                  {/* TRỤC QUE VÀNG NHÔ XUỐNG PHÍA DƯỚI ĐÈN LỒNG (CHUẨN ẢNH 2) */}
                  <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 rounded-b-full shadow-xs mx-auto" />
                </div>
              );
            })}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 3. MODAL 6 GIÂY HỒI HỘP KHI ĐANG QUAY CHỌN HỌC SINH                  */}
        {/* =================================================================== */}
        {isSpinning && (
          <div className="fixed inset-0 z-[115] flex items-center justify-center bg-black/85 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-amber-500 via-rose-600 to-amber-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-4 border-amber-300">
              <div className="bg-gradient-to-b from-[#2b0808] to-[#150202] rounded-[2.2rem] p-6 text-center space-y-5 text-amber-100 relative overflow-hidden">
                
                {/* VỆT SÁNG QUAY TRÒN */}
                <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl animate-spin pointer-events-none" />

                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest block animate-pulse">
                    🌸 ĐANG HÁI LỘC #{targetLocNumber} TRÊN CÂY MAI 🌸
                  </span>
                  <p className="text-xs text-amber-200/80 font-medium">
                    Ai sẽ là chủ nhân may mắn của chiếc đèn lồng này?
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
        {/* 4. MODAL CHÚC MỪNG HỌC SINH TRÚNG LỘC & MỜI TRẢ LỜI CÂU HỎI         */}
        {/* =================================================================== */}
        {winnerModalData && !isSpinning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-scale-up">
            <div className="bg-gradient-to-b from-amber-500 to-amber-700 p-1.5 rounded-[2.5rem] shadow-2xl max-w-sm w-full border-3 border-amber-300">
              <div className="bg-gradient-to-b from-[#3a0808] to-[#1f0303] rounded-[2.3rem] p-6 text-center space-y-4 text-amber-100">
                <span className="text-4xl animate-bounce inline-block">🎊 🏮 🎊</span>
                <div className="space-y-1">
                  <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                    CHÚC MỪNG BẠN ĐÃ TRÚNG LỘC #{winnerModalData.locNumber}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                    {winnerModalData.student.full_name}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-bold font-mono">
                    {winnerModalData.student.code ? `${winnerModalData.student.code} • ` : ''}Tổ {winnerModalData.student.team_group || 1}
                  </p>
                </div>

                <div className="w-24 h-24 mx-auto rounded-3xl bg-amber-500/20 border-2 border-amber-400 p-2 shadow-inner">
                  <img
                    src={winnerModalData.student.avatar}
                    alt={winnerModalData.student.full_name}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>

                <div className="p-3 bg-amber-950/80 rounded-2xl border border-amber-600/40 text-xs font-bold text-amber-200">
                  🎯 Hãy trả lời câu hỏi Tiếng Anh để rước lì xì may mắn đầu xuân!
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleStartQuestionSession}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition cursor-pointer active:scale-95"
                  >
                    Bắt Đầu Trả Lời Câu Hỏi 🎯
                  </button>

                  <button
                    type="button"
                    onClick={() => setWinnerModalData(null)}
                    className="w-full py-2 bg-transparent hover:bg-white/10 text-amber-300/80 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 5. MÀN HÌNH TRẢ LỜI CÂU HỎI TIẾNG ANH TƯƠNG TÁC                     */}
        {/* =================================================================== */}
        {activeQuestionSession && (
          <TetQuestionPlayer
            student={activeQuestionSession.student}
            locNumber={activeQuestionSession.locNumber}
            questions={activeQuestionSession.questions}
            onComplete={() => setActiveQuestionSession(null)}
            onAwardStudent={onAwardStudent}
          />
        )}

        {/* =================================================================== */}
        {/* 6. MODAL CẤU HÌNH CÂU HỎI TIẾNG ANH (LỚP, UNIT, SỐ CÂU, DẠNG BÀI)    */}
        {/* =================================================================== */}
        <TetQuestionConfigModal
          isOpen={isConfigOpen}
          onClose={() => setIsConfigOpen(false)}
          config={questionConfig}
          onChangeConfig={handleUpdateConfig}
        />

      </div>
    </div>
  );
}
