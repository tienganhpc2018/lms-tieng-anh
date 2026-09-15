import React, { useState, useEffect } from 'react';
import { X, PiggyBank, ArrowDownRight, ArrowUpRight, TrendingUp, Sparkles, Coins, User, CheckCircle2, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playWinner, playClick, playDeduct, playUndoRestore } from '../../../utils/soundEffects';
import {
  loadPiggyBank,
  savePiggyBank,
  deductStudentCoins,
  refundStudentCoins,
} from '../giftShopStorage';

export default function PiggyBankModal({
  isOpen,
  onClose,
  classId,
  students = [],
  onDataChanged,
}) {
  const [piggyData, setPiggyData] = useState({});
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('');
  const [actionType, setActionType] = useState('deposit'); // 'deposit' | 'withdraw'
  const [searchStudent, setSearchStudent] = useState('');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (isOpen && classId) {
      setPiggyData(loadPiggyBank(classId));
      setMessage(null);
    }
  }, [isOpen, classId]);

  if (!isOpen) return null;

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const studentWalletCoins = currentStudent ? (currentStudent.plus_points ?? currentStudent.coins ?? 0) : 0;
  const studentPiggy = selectedStudentId && piggyData[selectedStudentId] ? piggyData[selectedStudentId] : { balance: 0, totalInterestEarned: 0 };

  const filteredStudents = students.filter((s) =>
    (s.name || '').toLowerCase().includes(searchStudent.toLowerCase())
  );

  // Xử lý Gửi / Rút xu
  const handleTransaction = () => {
    setMessage(null);
    const num = parseInt(amount, 10);
    if (!selectedStudentId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn học sinh thực hiện giao dịch!' });
      return;
    }
    if (isNaN(num) || num <= 0) {
      setMessage({ type: 'error', text: 'Vui lòng nhập số xu hợp lệ lớn hơn 0!' });
      return;
    }

    if (actionType === 'deposit') {
      // Gửi xu vào heo
      if (studentWalletCoins < num) {
        setMessage({ type: 'error', text: `Học sinh không đủ xu trong ví! Hiện có ${studentWalletCoins} xu.` });
        return;
      }
      deductStudentCoins(classId, selectedStudentId, num);
      playDeduct();

      const updated = {
        ...piggyData,
        [selectedStudentId]: {
          balance: (studentPiggy.balance || 0) + num,
          lastDepositAt: new Date().toISOString(),
          totalInterestEarned: studentPiggy.totalInterestEarned || 0,
        },
      };
      savePiggyBank(classId, updated);
      setPiggyData(updated);
      setAmount('');
      setMessage({ type: 'success', text: `Đã gửi thành công +${num} xu vào Heo Đất của ${currentStudent.name}!` });
    } else {
      // Rút xu từ heo về ví
      if ((studentPiggy.balance || 0) < num) {
        setMessage({ type: 'error', text: `Số dư Heo Đất không đủ để rút! Hiện có ${studentPiggy.balance || 0} xu.` });
        return;
      }
      refundStudentCoins(classId, selectedStudentId, num);
      playUndoRestore();

      const updated = {
        ...piggyData,
        [selectedStudentId]: {
          balance: Math.max(0, (studentPiggy.balance || 0) - num),
          lastDepositAt: studentPiggy.lastDepositAt || new Date().toISOString(),
          totalInterestEarned: studentPiggy.totalInterestEarned || 0,
        },
      };
      savePiggyBank(classId, updated);
      setPiggyData(updated);
      setAmount('');
      setMessage({ type: 'success', text: `Đã rút thành công ${num} xu từ Heo Đất về ví của ${currentStudent.name}!` });
    }

    if (onDataChanged) onDataChanged();
  };

  // Quyết toán lãi tuần (+5%) cho tất cả học sinh đang gửi tiết kiệm
  const handleCalculateInterest = () => {
    let totalInterestPaid = 0;
    let studentCount = 0;
    const updated = { ...piggyData };

    students.forEach((s) => {
      const p = updated[s.id];
      if (p && p.balance > 0) {
        // Lãi 5% làm tròn lên ít nhất 1 xu
        const interest = Math.max(1, Math.ceil(p.balance * 0.05));
        totalInterestPaid += interest;
        studentCount += 1;
        updated[s.id] = {
          ...p,
          balance: p.balance + interest,
          totalInterestEarned: (p.totalInterestEarned || 0) + interest,
        };
      }
    });

    if (studentCount === 0) {
      setMessage({ type: 'error', text: 'Hiện chưa có học sinh nào gửi xu tiết kiệm để nhận lãi!' });
      return;
    }

    savePiggyBank(classId, updated);
    setPiggyData(updated);
    playWinner();
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });

    setMessage({
      type: 'success',
      text: `🎉 QUYẾT TOÁN THÀNH CÔNG! Đã chi trả +${totalInterestPaid} xu tiền lãi (+5%) cho ${studentCount} học sinh!`,
    });

    if (onDataChanged) onDataChanged();
  };

  // Danh sách học sinh xếp hạng tiết kiệm nhiều nhất
  const saverLeaderboard = students
    .map((s) => {
      const p = piggyData[s.id] || { balance: 0, totalInterestEarned: 0 };
      return {
        ...s,
        piggyBalance: p.balance || 0,
        totalInterest: p.totalInterestEarned || 0,
      };
    })
    .filter((s) => s.piggyBalance > 0)
    .sort((a, b) => b.piggyBalance - a.piggyBalance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-pink-300 overflow-hidden my-auto animate-in fade-in zoom-in duration-200">
        {/* Header Claymorphism màu Hồng Heo Đất */}
        <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 p-5 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30">
              🐷
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                HEO ĐẤT TIẾT KIỆM 4.0
                <span className="text-xs bg-pink-200 text-pink-900 px-2.5 py-0.5 rounded-full font-bold">
                  Lãi Suất +5%/Tuần
                </span>
              </h2>
              <p className="text-xs text-pink-100 font-medium">
                Nuôi heo tích xu - Giáo dục thói quen tiết kiệm tài chính cho học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Thông báo kết quả */}
          {message && (
            <div
              className={`p-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Form Gửi / Rút xu */}
          <div className="bg-pink-50/70 border-2 border-pink-200 rounded-2xl p-4 space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  playClick();
                  setActionType('deposit');
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'deposit'
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                    : 'bg-white text-slate-600 hover:bg-pink-100 border border-pink-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                Gửi Xu Vào Heo
              </button>
              <button
                onClick={() => {
                  playClick();
                  setActionType('withdraw');
                }}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1.5 transition-all ${
                  actionType === 'withdraw'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                    : 'bg-white text-slate-600 hover:bg-rose-100 border border-pink-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                Rút Xu Về Ví
              </button>
            </div>

            {/* Chọn học sinh */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-pink-950 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-600" />
                  Chọn học sinh:
                </label>
                {currentStudent && (
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-slate-600">
                      Ví: <strong className="text-amber-600">{studentWalletCoins} xu</strong>
                    </span>
                    <span className="text-slate-600">
                      Heo: <strong className="text-pink-600">{studentPiggy.balance || 0} xu</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Lọc tên..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-pink-200 rounded-xl outline-none focus:ring-2 focus:ring-pink-400"
                />
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    setSelectedStudentId(e.target.value);
                    setMessage(null);
                  }}
                  className="w-full px-3 py-2 text-sm bg-white border border-pink-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="">-- Chọn học sinh ({filteredStudents.length}) --</option>
                  {filteredStudents.map((s) => {
                    const pb = piggyData[s.id]?.balance || 0;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} (Nuôi: {pb} xu)
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Nhập số xu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-pink-950">
                Số xu {actionType === 'deposit' ? 'gửi vào heo' : 'rút về ví'}:
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Nhập số xu..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm bg-white border border-pink-200 rounded-xl font-black text-pink-600 outline-none focus:ring-2 focus:ring-pink-400"
                />
                {/* Nút nạp nhanh */}
                <button
                  type="button"
                  onClick={() => setAmount('5')}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-pink-200 rounded-lg hover:bg-pink-100 text-pink-700"
                >
                  +5
                </button>
                <button
                  type="button"
                  onClick={() => setAmount('10')}
                  className="px-2.5 py-1 text-xs font-bold bg-white border border-pink-200 rounded-lg hover:bg-pink-100 text-pink-700"
                >
                  +10
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (actionType === 'deposit') setAmount(String(studentWalletCoins));
                    else setAmount(String(studentPiggy.balance || 0));
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-pink-200 rounded-lg hover:bg-pink-300 text-pink-900"
                >
                  Tất cả
                </button>
              </div>
            </div>

            <button
              onClick={handleTransaction}
              className={`w-full py-3 rounded-xl font-black text-sm text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 ${
                actionType === 'deposit'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 shadow-rose-500/30'
              }`}
            >
              <PiggyBank className="w-4 h-4" />
              XÁC NHẬN {actionType === 'deposit' ? 'GỬI XU TIẾT KIỆM' : 'RÚT XU VỀ VÍ'}
            </button>
          </div>

          {/* Banner Quyết toán lãi tuần dành cho Thầy Cô */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-base flex items-center gap-1.5">
                <TrendingUp className="w-5 h-5 text-yellow-200" />
                Quyết Toán Lãi Suất Tuần (+5%)
              </h4>
              <p className="text-xs text-amber-100 mt-0.5">
                Tự động cộng 5% lãi cho tất cả heo đất có số dư trong lớp!
              </p>
            </div>
            <button
              onClick={handleCalculateInterest}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-orange-600 font-black text-xs uppercase tracking-wider shadow-md hover:bg-amber-50 active:scale-95 transition-all shrink-0"
            >
              💰 Tính Lãi Ngay
            </button>
          </div>

          {/* Bảng Xếp Hạng Heo Vàng Của Lớp */}
          <div className="space-y-3">
            <h4 className="font-black text-sm text-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              BẢNG XẾP HẠNG "ĐẠI GIA HEO ĐẤT" ({saverLeaderboard.length} bạn đang gửi)
            </h4>

            {saverLeaderboard.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                <p className="text-xs text-slate-500 font-medium">
                  Chưa có bạn nào gửi xu vào heo. Hãy khích lệ các em rèn luyện tiết kiệm nhé!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                {saverLeaderboard.map((item, idx) => (
                  <div key={item.id} className="p-3 bg-white hover:bg-pink-50/50 flex items-center justify-between gap-3 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                        idx === 1 ? 'bg-slate-200 text-slate-700' :
                        idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          Lãi đã nhận: +{item.totalInterest} xu
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-sm text-pink-600 flex items-center justify-end gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        {item.piggyBalance} xu
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm transition-all"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
