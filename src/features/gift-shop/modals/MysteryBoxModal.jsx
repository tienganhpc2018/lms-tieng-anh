import React, { useState } from 'react';
import { X, Sparkles, User, Coins, Package, Gift, Award, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMysteryBoxOpen, playWinner, playDeduct, playClick } from '../../../utils/soundEffects';
import {
  deductStudentCoins,
  refundStudentCoins,
  addRedemption,
  generateVoucherCode,
} from '../giftShopStorage';

const BOX_COST = 15; // Chi phí 15 xu mỗi lượt mở

// DANH MỤC QUÀ THEO PHẨM CẤP GACHA
const LOOT_TABLE = {
  legendary: [
    { id: 'leg_1', name: 'Thẻ Miễn BTVN 1 Tuần', type: 'privilege', tier: 'Huyền thoại', rate: '10%', icon: '👑', color: 'from-amber-400 via-yellow-300 to-amber-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50' },
    { id: 'leg_2', name: 'Bộ Hộp Bút Khổng Lồ 36 Món', type: 'gift', tier: 'Huyền thoại', rate: '10%', icon: '🎁', color: 'from-amber-400 via-yellow-300 to-amber-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50' },
    { id: 'leg_3', name: 'Thần Tài Gõ Cửa +50 Xu', type: 'coin', amount: 50, tier: 'Huyền thoại', rate: '10%', icon: '💰', color: 'from-amber-400 via-yellow-300 to-amber-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/50' },
  ],
  epic: [
    { id: 'epic_1', name: 'Móc Khóa Thú Bông Mini', type: 'gift', tier: 'Sử thi', rate: '30%', icon: '🧸', color: 'from-purple-500 via-pink-500 to-indigo-500', border: 'border-purple-400', shadow: 'shadow-purple-500/50' },
    { id: 'epic_2', name: 'Sổ Tay Lò Xo Bìa Hoạt Hình', type: 'gift', tier: 'Sử thi', rate: '30%', icon: '📓', color: 'from-purple-500 via-pink-500 to-indigo-500', border: 'border-purple-400', shadow: 'shadow-purple-500/50' },
    { id: 'epic_3', name: 'Kho Báu Bí Mật +20 Xu', type: 'coin', amount: 20, tier: 'Sử thi', rate: '30%', icon: '💎', color: 'from-purple-500 via-pink-500 to-indigo-500', border: 'border-purple-400', shadow: 'shadow-purple-500/50' },
  ],
  common: [
    { id: 'com_1', name: 'Bút Gel Xóa Được Ngòi 0.5', type: 'gift', tier: 'Phổ thông', rate: '60%', icon: '✒️', color: 'from-sky-400 via-teal-400 to-emerald-400', border: 'border-teal-400', shadow: 'shadow-teal-500/40' },
    { id: 'com_2', name: 'Thước Kẻ Dạ Quang 20cm', type: 'gift', tier: 'Phổ thông', rate: '60%', icon: '📏', color: 'from-sky-400 via-teal-400 to-emerald-400', border: 'border-teal-400', shadow: 'shadow-teal-500/40' },
    { id: 'com_3', name: 'Túi Sticker Hoạt Hình', type: 'gift', tier: 'Phổ thông', rate: '60%', icon: '🐱', color: 'from-sky-400 via-teal-400 to-emerald-400', border: 'border-teal-400', shadow: 'shadow-teal-500/40' },
    { id: 'com_4', name: 'Khích Lệ Tích Cực +10 Xu', type: 'coin', amount: 10, tier: 'Phổ thông', rate: '60%', icon: '🪙', color: 'from-sky-400 via-teal-400 to-emerald-400', border: 'border-teal-400', shadow: 'shadow-teal-500/40' },
  ],
};

export default function MysteryBoxModal({
  isOpen,
  onClose,
  classId,
  students = [],
  onRewardWon,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [revealedItem, setRevealedItem] = useState(null);
  const [voucherCode, setVoucherCode] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchStudent, setSearchStudent] = useState('');

  if (!isOpen) return null;

  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes(searchStudent.toLowerCase())
  );

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentCoins = currentStudent ? (currentStudent.plus_points ?? currentStudent.coins ?? 0) : 0;

  // Thuật toán Gacha xác suất
  const rollLoot = () => {
    const rand = Math.random() * 100;
    let pool;
    if (rand < 10) {
      // 10% Huyền Thoại
      pool = LOOT_TABLE.legendary;
    } else if (rand < 40) {
      // 30% Sử Thi
      pool = LOOT_TABLE.epic;
    } else {
      // 60% Phổ Thông
      pool = LOOT_TABLE.common;
    }
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleOpenBox = () => {
    if (isOpening) return;
    setErrorMessage('');
    setRevealedItem(null);
    setVoucherCode(null);

    if (!selectedStudentId) {
      setErrorMessage('Vui lòng chọn học sinh mở rương!');
      return;
    }

    if (studentCoins < BOX_COST) {
      setErrorMessage(`Học sinh không đủ xu! Cần ${BOX_COST} xu (Hiện có: ${studentCoins} xu).`);
      return;
    }

    // Trừ 15 xu
    deductStudentCoins(classId, selectedStudentId, BOX_COST);
    playDeduct();
    setIsOpening(true);

    // Phát âm thanh rương ma thuật rung lắc
    playMysteryBoxOpen();

    // Rung lắc trong 2.5 giây sau đó mở tung
    setTimeout(() => {
      const item = rollLoot();
      let vCode = null;

      if (item.type === 'coin') {
        refundStudentCoins(classId, selectedStudentId, item.amount);
      } else {
        vCode = generateVoucherCode();
        addRedemption(classId, {
          id: `mystery_${Date.now()}`,
          voucherCode: vCode,
          giftId: `box_${item.id}`,
          giftName: `[Rương Ma Thuật] ${item.name}`,
          giftCategory: item.type === 'privilege' ? 'privilege' : 'souvenir',
          cost: BOX_COST,
          studentId: currentStudent.id,
          studentName: currentStudent.name,
          studentCode: currentStudent.code || '',
          redeemedAt: new Date().toISOString(),
          status: 'pending',
          note: `Trúng từ Rương Bí Ẩn (Phẩm cấp: ${item.tier})`,
        });
      }

      setRevealedItem(item);
      setVoucherCode(vCode);
      setIsOpening(false);
      playWinner();

      // Confetti rực rỡ theo phẩm cấp
      confetti({
        particleCount: item.tier === 'Huyền thoại' ? 180 : item.tier === 'Sử thi' ? 120 : 70,
        spread: 90,
        origin: { y: 0.55 },
      });

      if (onRewardWon) onRewardWon();
    }, 2500);
  };

  const resetBox = () => {
    setRevealedItem(null);
    setVoucherCode(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 text-white rounded-3xl shadow-2xl border-4 border-purple-500/50 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Hào quang nền phía trên */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-5 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-2xl shadow-inner animate-pulse">
              📦
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-amber-200 flex items-center gap-2">
                RƯƠNG BÁU MA THUẬT GACHA
                <span className="text-xs bg-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full border border-purple-400/30">
                  15 Xu / Lượt
                </span>
              </h2>
              <p className="text-xs text-purple-300/80 font-medium">
                Khai mở thần bí - Săn phần thưởng Huyền Thoại cực hiếm!
              </p>
            </div>
          </div>
          <button
            disabled={isOpening}
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center disabled:opacity-50"
          >
            <X className="w-5 h-5 text-purple-200" />
          </button>
        </div>

        {/* Thân Modal */}
        <div className="relative z-10 p-6 space-y-6">
          {/* Thanh chọn học sinh */}
          <div className="bg-purple-950/60 border border-purple-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-bold text-purple-200 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Học sinh mở rương:
              </label>
              {currentStudent && (
                <div className="inline-flex items-center gap-2 bg-purple-900/60 px-3 py-1 rounded-xl border border-purple-400/40 text-sm">
                  <span className="text-purple-300 text-xs">Số dư xu:</span>
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-400" />
                    {studentCoins} xu
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                disabled={isOpening}
                placeholder="Tìm tên học sinh..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-purple-900/40 border border-purple-500/40 rounded-xl text-white placeholder-purple-400/50 focus:ring-2 focus:ring-purple-400 outline-none"
              />
              <select
                disabled={isOpening}
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setErrorMessage('');
                  resetBox();
                }}
                className="w-full px-3 py-2 text-sm bg-purple-900/70 border border-purple-500/40 rounded-xl font-bold text-purple-100 focus:ring-2 focus:ring-purple-400 outline-none"
              >
                <option value="">-- Chọn học sinh ({filteredStudents.length}) --</option>
                {filteredStudents.map((s) => {
                  const coins = s.plus_points ?? s.coins ?? 0;
                  return (
                    <option key={s.id} value={s.id} className="bg-slate-900 text-white">
                      {s.name} ({coins} xu)
                    </option>
                  );
                })}
              </select>
            </div>

            {errorMessage && (
              <p className="text-xs font-bold text-rose-300 bg-rose-950/60 p-2.5 rounded-lg border border-rose-500/50">
                ⚠️ {errorMessage}
              </p>
            )}
          </div>

          {/* Sân khấu Rương bí ẩn 3D */}
          <div className="min-h-[260px] flex flex-col items-center justify-center py-4 relative">
            {!revealedItem ? (
              // Trạng thái Rương đóng hoặc đang rung lắc
              <div
                className={`flex flex-col items-center justify-center transition-transform duration-300 ${
                  isOpening ? 'animate-bounce' : 'hover:scale-105'
                }`}
              >
                {/* Hộp quà 3D icon */}
                <div
                  className={`w-36 h-36 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 p-1 shadow-2xl ${
                    isOpening
                      ? 'shadow-purple-500/80 animate-spin-slow'
                      : 'shadow-purple-900/50'
                  }`}
                  style={{
                    animation: isOpening
                      ? 'wiggle 0.2s ease-in-out infinite'
                      : undefined,
                  }}
                >
                  <div className="w-full h-full bg-slate-900/80 backdrop-blur-sm rounded-[22px] flex flex-col items-center justify-center border border-white/20">
                    <span className="text-6xl drop-shadow-lg">
                      {isOpening ? '✨' : '🎁'}
                    </span>
                    <span className="text-xs font-black tracking-widest text-amber-300 uppercase mt-2">
                      {isOpening ? 'Đang Giải Mã...' : 'MYSTERY BOX'}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-xs font-bold text-purple-300 tracking-wide text-center">
                  {isOpening
                    ? '⚡ Rương cổ đang nứt ra... Hãy chờ trong giây lát!'
                    : 'Nhấn nút bên dưới để mở phong ấn rương ma thuật!'}
                </p>
              </div>
            ) : (
              // Trạng thái Quà đã lộ ra (3D Reveal Card)
              <div className="w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 border-2 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden"
                style={{
                  borderColor: revealedItem.tier === 'Huyền thoại' ? '#FACC15' : revealedItem.tier === 'Sử thi' ? '#C084FC' : '#2DD4BF',
                  boxShadow: revealedItem.tier === 'Huyền thoại' ? '0 0 40px rgba(250, 204, 21, 0.4)' : revealedItem.tier === 'Sử thi' ? '0 0 35px rgba(192, 132, 252, 0.4)' : '0 0 25px rgba(45, 212, 191, 0.3)',
                }}
              >
                {/* Huy hiệu phẩm cấp */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm"
                  style={{
                    backgroundColor: revealedItem.tier === 'Huyền thoại' ? '#FEF08A' : revealedItem.tier === 'Sử thi' ? '#F3E8FF' : '#CCFBF1',
                    color: revealedItem.tier === 'Huyền thoại' ? '#854D0E' : revealedItem.tier === 'Sử thi' ? '#6B21A8' : '#115E59',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  PHẨM CẤP: {revealedItem.tier}
                </div>

                {/* Biểu tượng quà */}
                <div className="text-6xl my-2 animate-bounce">
                  {revealedItem.icon}
                </div>

                <div>
                  <h3 className="text-xl font-black text-white tracking-wide">
                    {revealedItem.name}
                  </h3>
                  <p className="text-xs text-purple-300 mt-1">
                    {revealedItem.type === 'coin'
                      ? `Đã cộng trực tiếp +${revealedItem.amount} xu vào ví của ${currentStudent?.name}!`
                      : `Phần quà đã được xuất voucher đổi thưởng!`}
                  </p>
                </div>

                {voucherCode && (
                  <div className="bg-purple-950/80 border border-purple-400/40 rounded-xl p-2.5">
                    <span className="text-[11px] text-purple-300">Mã Voucher Nhận Quà: </span>
                    <span className="font-mono font-black text-amber-300 tracking-wider text-sm block">
                      {voucherCode}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bảng tỷ lệ Gacha */}
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
            <div className="bg-amber-950/40 border border-yellow-500/40 p-2 rounded-xl text-yellow-300">
              👑 Huyền Thoại: 10%
            </div>
            <div className="bg-purple-950/40 border border-purple-500/40 p-2 rounded-xl text-purple-300">
              💎 Sử Thi: 30%
            </div>
            <div className="bg-teal-950/40 border border-teal-500/40 p-2 rounded-xl text-teal-300">
              🌿 Phổ Thông: 60%
            </div>
          </div>

          {/* Các nút hành động */}
          <div className="flex gap-3 pt-2">
            {!revealedItem ? (
              <button
                disabled={isOpening || !selectedStudentId}
                onClick={handleOpenBox}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-lg tracking-wide shadow-lg shadow-purple-600/40 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 text-amber-300" />
                {isOpening ? 'ĐANG MỞ RƯƠNG...' : 'MỞ RƯƠNG (15 XU)'}
              </button>
            ) : (
              <button
                onClick={resetBox}
                className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-base tracking-wide shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                MỞ THÊM LƯỢT NỮA (15 XU)
              </button>
            )}
            <button
              disabled={isOpening}
              onClick={onClose}
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all disabled:opacity-50"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
