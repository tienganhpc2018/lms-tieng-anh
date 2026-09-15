import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Trophy, User, Coins, RotateCw, Volume2, Award, CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playWheelTick, playWinner, playClick, playDeduct } from '../../../utils/soundEffects';
import {
  deductStudentCoins,
  refundStudentCoins,
  addRedemption,
  generateVoucherCode,
} from '../giftShopStorage';

// 8 Ô GIẢI THƯỞNG BÁNH XE MAY MẮN
const WHEEL_SECTORS = [
  { id: 'sec_1', label: 'Bút Highlight', type: 'gift', icon: '🖍️', color: '#FEF08A', textColor: '#854D0E' },
  { id: 'sec_2', label: 'Thước Dạ Quang', type: 'gift', icon: '📏', color: '#BBF7D0', textColor: '#166534' },
  { id: 'sec_3', label: '+10 Xu Vàng', type: 'coin', amount: 10, icon: '🪙', color: '#FED7AA', textColor: '#9A3412' },
  { id: 'sec_4', label: 'Sổ Tay Lò Xo', type: 'gift', icon: '📒', color: '#BAE6FD', textColor: '#075985' },
  { id: 'sec_5', label: 'Miễn 1 BTVN', type: 'privilege', icon: '🎫', color: '#E9D5FF', textColor: '#6B21A8' },
  { id: 'sec_6', label: '+3 Xu Khích Lệ', type: 'coin', amount: 3, icon: '🪙', color: '#FBCFE8', textColor: '#9D174D' },
  { id: 'sec_7', label: 'Vỗ Tay Cả Lớp', type: 'fun', icon: '👏', color: '#DDD6FE', textColor: '#5B21B6' },
  { id: 'sec_8', label: 'Chúc May Mắn', type: 'miss', icon: '🍀', color: '#F1F5F9', textColor: '#475569' },
];

const SPIN_COST = 5; // Chi phí 5 xu mỗi lượt quay

export default function GiftLuckyWheelModal({
  isOpen,
  onClose,
  classId,
  students = [],
  onRewardWon,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningResult, setWinningResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  const canvasRef = useRef(null);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTickSectorRef = useRef(-1);

  const numSectors = WHEEL_SECTORS.length;
  const arcSize = (2 * Math.PI) / numSectors;

  // Lọc học sinh
  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes(searchStudent.toLowerCase())
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentCoins = currentStudent ? (currentStudent.plus_points ?? currentStudent.coins ?? 0) : 0;

  // Vẽ bánh xe trên canvas
  const drawWheel = (angleOffset) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 16;

    ctx.clearRect(0, 0, width, height);

    // Vành ngoài kim loại sáng bóng
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    const gradRing = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 10);
    gradRing.addColorStop(0, '#F59E0B');
    gradRing.addColorStop(0.5, '#FDE68A');
    gradRing.addColorStop(1, '#D97706');
    ctx.fillStyle = gradRing;
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.restore();

    // Vẽ từng nan rẻ quạt
    for (let i = 0; i < numSectors; i++) {
      const start = angleOffset + i * arcSize;
      const end = start + arcSize;
      const sector = WHEEL_SECTORS[i];

      // Mảnh nan
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, start, end);
      ctx.fillStyle = sector.color;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Vẽ đinh tán trang trí ở viền ngoài
      const pegAngle = start;
      const pegX = centerX + (radius - 2) * Math.cos(pegAngle);
      const pegY = centerY + (radius - 2) * Math.sin(pegAngle);
      ctx.beginPath();
      ctx.arc(pegX, pegY, 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Vẽ chữ và icon
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(start + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = sector.textColor;
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${sector.icon} ${sector.label}`, radius - 20, 0);
      ctx.restore();
    }

    // Tâm bánh xe (trục quay vàng kim)
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, 34, 0, 2 * Math.PI);
    const centerGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 34);
    centerGrad.addColorStop(0, '#FFFFFF');
    centerGrad.addColorStop(0.6, '#F59E0B');
    centerGrad.addColorStop(1, '#B45309');
    ctx.fillStyle = centerGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Biểu tượng ngôi sao ở giữa tâm
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⭐', centerX, centerY);
    ctx.restore();
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        drawWheel(currentAngleRef.current);
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Bắt đầu quay
  const handleStartSpin = () => {
    if (isSpinning) return;
    setErrorMessage('');
    setWinningResult(null);

    if (!selectedStudentId) {
      setErrorMessage('Vui lòng chọn học sinh tham gia quay thưởng!');
      return;
    }

    if (studentCoins < SPIN_COST) {
      setErrorMessage(`Học sinh không đủ xu! Cần tối thiểu ${SPIN_COST} xu (Hiện có: ${studentCoins} xu).`);
      return;
    }

    // Trừ 5 xu vào ví học sinh
    deductStudentCoins(classId, selectedStudentId, SPIN_COST);
    playDeduct();
    setIsSpinning(true);

    // Chọn ngẫu nhiên kết quả trúng
    const targetSectorIndex = Math.floor(Math.random() * numSectors);
    const winningSector = WHEEL_SECTORS[targetSectorIndex];

    // Tính toán góc đích (Kim chỉ ở đỉnh: -Math.PI / 2 tức 270 độ / 12h)
    const extraFullRounds = 6 + Math.floor(Math.random() * 3); // 6-8 vòng quay
    const sectorCenterOffset = targetSectorIndex * arcSize + arcSize / 2;
    // Điểm dừng sao cho sectorCenterOffset thẳng hàng với đỉnh (-PI/2)
    const targetAngle =
      extraFullRounds * (2 * Math.PI) +
      (1.5 * Math.PI - sectorCenterOffset) +
      (Math.random() * (arcSize * 0.6) - arcSize * 0.3); // chút ngẫu nhiên trong nan

    const startAngle = currentAngleRef.current % (2 * Math.PI);
    const totalDelta = targetAngle - startAngle;
    const spinDuration = 5500; // 5.5 giây
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Hàm gia tốc giảm dần (ease-out cubic / quart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const currentAngle = startAngle + totalDelta * easeOut;
      currentAngleRef.current = currentAngle;

      // Tính âm thanh click nan gảy kim
      const normalizedAngle = (currentAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSector = Math.floor(normalizedAngle / arcSize);
      if (currentSector !== lastTickSectorRef.current) {
        playWheelTick();
        lastTickSectorRef.current = currentSector;
      }

      drawWheel(currentAngle);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Dừng vòng quay thành công
        setIsSpinning(false);
        playWinner();
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Xử lý phần thưởng
        handleRewardAward(winningSector, currentStudent);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  // Trao quà và lưu lại
  const handleRewardAward = (sector, student) => {
    let resultInfo = {
      sector,
      message: '',
      voucherCode: null,
    };

    if (sector.type === 'coin') {
      // Cộng xu trực tiếp
      refundStudentCoins(classId, student.id, sector.amount);
      resultInfo.message = `Chúc mừng ${student.name} đã nhận thêm +${sector.amount} Xu vào ví!`;
    } else if (sector.type === 'gift' || sector.type === 'privilege') {
      // Sinh voucher đổi quà
      const vCode = generateVoucherCode();
      resultInfo.voucherCode = vCode;
      resultInfo.message = `Chúc mừng ${student.name} đã trúng phần quà "${sector.label}"!`;

      // Ghi nhận vào lịch sử đổi quà
      addRedemption(classId, {
        id: `spin_${Date.now()}`,
        voucherCode: vCode,
        giftId: `wheel_${sector.id}`,
        giftName: `[Vòng Quay] ${sector.label}`,
        giftCategory: sector.type === 'privilege' ? 'privilege' : 'stationery',
        cost: SPIN_COST,
        studentId: student.id,
        studentName: student.name,
        studentCode: student.code || '',
        redeemedAt: new Date().toISOString(),
        status: 'pending', // Chờ giáo viên trao
        note: 'Trúng thưởng từ Vòng Quay May Mắn (5 Xu)',
      });
    } else if (sector.type === 'fun') {
      resultInfo.message = `Cả lớp hãy dành một tràng pháo tay thật nồng nhiệt chúc mừng ${student.name}! 👏🎉`;
    } else {
      resultInfo.message = `Chúc ${student.name} may mắn ở lần quay tiếp theo nhé! Chăm chỉ tích thêm xu nào! 💪`;
    }

    setWinningResult(resultInfo);
    if (onRewardWon) onRewardWon();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Claymorphism rực rỡ */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              🎡
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                VÒNG QUAY MAY MẮN
                <span className="text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  5 Xu / Lượt
                </span>
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Quay thử vận may - Đón quà trao tay rộn ràng lớp học
              </p>
            </div>
          </div>
          <button
            disabled={isSpinning}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-6 space-y-6">
          {/* Thanh chọn học sinh */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <User className="w-4 h-4 text-amber-600" />
                Chọn học sinh tham gia quay:
              </label>
              {currentStudent && (
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm text-sm">
                  <span className="text-slate-600 font-medium">Số dư:</span>
                  <span className="font-black text-amber-600 flex items-center gap-1">
                    <Coins className="w-4 h-4" />
                    {studentCoins} xu
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                disabled={isSpinning}
                placeholder="Tìm nhanh học sinh..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-400 outline-none"
              />
              <select
                disabled={isSpinning}
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setErrorMessage('');
                  setWinningResult(null);
                }}
                className="w-full px-3 py-2 text-sm bg-white border border-amber-300 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-400 outline-none"
              >
                <option value="">-- Chọn tên học sinh ({filteredStudents.length}) --</option>
                {filteredStudents.map((s) => {
                  const coins = s.plus_points ?? s.coins ?? 0;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name} ({coins} xu)
                    </option>
                  );
                })}
              </select>
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* Khung Canvas vòng quay */}
          <div className="relative flex flex-col items-center justify-center py-2">
            {/* Kim chỉ cố định ở trên đỉnh (12h) */}
            <div className="absolute top-0 z-20 flex flex-col items-center">
              <div className="w-6 h-8 bg-gradient-to-b from-rose-600 to-red-500 rounded-b-md shadow-lg border-2 border-white flex items-center justify-center -translate-y-1">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[14px] border-t-rose-600 drop-shadow-md"></div>
            </div>

            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={380}
              height={380}
              className="max-w-full h-auto drop-shadow-xl"
            />
          </div>

          {/* Popup chúc mừng kết quả */}
          {winningResult && (
            <div className="bg-gradient-to-r from-amber-100 via-orange-100 to-rose-100 border-2 border-amber-400 rounded-2xl p-4 text-center space-y-2 animate-in zoom-in-95 duration-200">
              <div className="text-3xl">🎉</div>
              <h3 className="text-lg font-black text-slate-800">
                {winningResult.sector.icon} TRÚNG THƯỞNG: {winningResult.sector.label}!
              </h3>
              <p className="text-sm font-semibold text-slate-700">{winningResult.message}</p>
              {winningResult.voucherCode && (
                <div className="inline-block bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                  <span className="text-xs text-slate-500">Mã nhận quà: </span>
                  <span className="font-mono font-black text-rose-600 tracking-wider">
                    {winningResult.voucherCode}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Nút bấm quay thưởng */}
          <div className="flex gap-3">
            <button
              disabled={isSpinning || !selectedStudentId}
              onClick={handleStartSpin}
              className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-lg tracking-wide shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3"
            >
              <RotateCw className={`w-6 h-6 ${isSpinning ? 'animate-spin' : ''}`} />
              {isSpinning ? 'ĐANG QUAY BÁNH XE...' : 'QUAY NGAY (5 XU)'}
            </button>
            <button
              disabled={isSpinning}
              onClick={onClose}
              className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all disabled:opacity-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
