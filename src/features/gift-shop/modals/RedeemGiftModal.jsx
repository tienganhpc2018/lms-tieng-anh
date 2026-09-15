import React, { useState } from 'react';
import { X, Search, Check, AlertCircle, Coins, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playCorrect, playDeduct } from '../../../utils/soundEffects';
import { generateVoucherCode } from '../giftShopStorage';
import GiftIconRenderer from '../components/GiftIconRenderer';

export default function RedeemGiftModal({
  isOpen,
  onClose,
  gift,
  effectivePrice,
  students = [],
  onConfirmRedeem,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen || !gift) return null;

  const cost = effectivePrice ?? gift.requiredCoins;

  const eligibleStudents = students.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.full_name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const studentCoins = selectedStudent?.plus_points || selectedStudent?.coins || 0;
  const isAffordable = studentCoins >= cost;

  const handleConfirm = () => {
    if (!selectedStudent) {
      alert('Vui lòng chọn học sinh đổi quà!');
      return;
    }

    if (!isAffordable) {
      playDeduct();
      alert(`Học sinh ${selectedStudent.full_name} chỉ có ${studentCoins} xu, không đủ ${cost} xu để đổi phần quà này!`);
      return;
    }

    if (gift.stock <= 0) {
      alert('Phần quà này hiện đã hết hàng trong kho!');
      return;
    }

    playCorrect();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
    });

    const voucherCode = generateVoucherCode();

    const redemptionData = {
      id: `rd-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      classId: gift.classId,
      studentId: selectedStudent.id,
      studentName: selectedStudent.full_name,
      studentCode: selectedStudent.code,
      studentAvatar: selectedStudent.avatar,
      giftId: gift.id,
      giftName: gift.name,
      giftIconKey: gift.iconKey,
      coinsSpent: cost,
      timestamp: new Date().toISOString(),
      status: 'pending', // 'pending' | 'given'
      voucherCode,
    };

    onConfirmRedeem(redemptionData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
              <GiftIconRenderer iconKey={gift.iconKey} className="w-9 h-9" />
            </div>
            <div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md">
                QUY ĐỔI PHẦN THƯỞNG
              </span>
              <h3 className="text-base font-black text-slate-900 mt-0.5">{gift.name}</h3>
              <p className="text-xs font-black text-amber-600">
                Giá đổi: 🪙 {cost} xu • Tồn kho: {gift.stock} món
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ô TÌM KIẾM HỌC SINH */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm học sinh trong lớp theo tên hoặc mã..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden transition"
          />
        </div>

        {/* DANH SÁCH HỌC SINH ĐỂ CHỌN */}
        <div className="flex-1 overflow-y-auto max-h-60 space-y-1.5 pr-1 border border-slate-100 rounded-2xl p-2 bg-slate-50/50">
          {eligibleStudents.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 font-semibold italic">
              Không tìm thấy học sinh nào trong lớp.
            </div>
          ) : (
            eligibleStudents.map((st) => {
              const coins = st.plus_points || st.coins || 0;
              const enough = coins >= cost;
              const isSelected = selectedStudentId === st.id;

              return (
                <div
                  key={st.id}
                  onClick={() => {
                    playClick();
                    setSelectedStudentId(st.id);
                  }}
                  className={`p-2.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-300 shadow-xs'
                      : enough
                      ? 'bg-white hover:bg-slate-100 border-slate-200'
                      : 'bg-slate-100/70 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <img src={st.avatar} alt={st.full_name} className="w-8 h-8 rounded-full border border-slate-300" />
                    <div>
                      <h4 className="text-xs font-black text-slate-900">{st.full_name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {st.code} • Tổ {st.team_group}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg inline-block ${
                        enough ? 'bg-amber-100 text-amber-900' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      🪙 {coins} xu
                    </span>
                    {!enough && (
                      <span className="text-[9px] text-rose-600 block font-bold mt-0.5">
                        Thiếu {cost - coins} xu
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* THÔNG TIN XÁC NHẬN */}
        {selectedStudent && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              isAffordable ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <span>
              {isAffordable ? '✓ Đủ điều kiện đổi quà:' : '⚠️ Chưa đủ xu đổi quà:'}{' '}
              <strong>{selectedStudent.full_name}</strong>
            </span>
            <span className="font-black font-mono">
              {studentCoins} xu ➔ còn lại {Math.max(0, studentCoins - cost)} xu
            </span>
          </div>
        )}

        {/* ACTIONS */}
        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!selectedStudent || !isAffordable || gift.stock <= 0}
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 disabled:opacity-40 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Xác Nhận Đổi Quà (-{cost} xu)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
