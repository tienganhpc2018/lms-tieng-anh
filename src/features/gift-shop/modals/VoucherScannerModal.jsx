import React, { useState } from 'react';
import { X, Search, CheckCircle, AlertTriangle, ShieldCheck, QrCode } from 'lucide-react';
import { playClick, playCorrect, playDeduct } from '../../../utils/soundEffects';

export default function VoucherScannerModal({ isOpen, onClose, redemptions = [], onConfirmDelivery }) {
  const [inputCode, setInputCode] = useState('');
  const [foundRedemption, setFoundRedemption] = useState(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;

    playClick();
    const cleanCode = inputCode.trim().toUpperCase();
    const match = redemptions.find(
      (r) => (r.voucherCode || '').toUpperCase() === cleanCode
    );

    setFoundRedemption(match || null);
    setSearched(true);
  };

  const handleDeliver = () => {
    if (!foundRedemption) return;
    if (foundRedemption.status === 'given') {
      alert('Voucher này đã được trao quà trước đó!');
      return;
    }

    playCorrect();
    onConfirmDelivery(foundRedemption.id);
    setFoundRedemption({
      ...foundRedemption,
      status: 'given',
      givenAt: new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Kiểm Tra & Khóa Mã Voucher</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tra cứu mã voucher 1 lần và xác nhận trao quà thực tế
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

        {/* Ô NHẬP MÃ TRA CỨU */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <input
            type="text"
            required
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              setSearched(false);
            }}
            placeholder="Nhập mã voucher (VD: VC-SCAN-991A)..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-xs text-slate-900 focus:bg-white focus:border-indigo-600 outline-hidden uppercase transition"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer flex items-center space-x-1"
          >
            <Search className="w-4 h-4" />
            <span>Tra Cứu</span>
          </button>
        </form>

        {/* KẾT QUẢ TRA CỨU */}
        {searched && (
          <div className="flex-1 overflow-y-auto space-y-3 pt-1">
            {foundRedemption ? (
              <div
                className={`p-4 rounded-3xl border-2 space-y-3 ${
                  foundRedemption.status === 'given'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between border-b border-black/10 pb-2">
                  <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-white/80 border border-black/10">
                    {foundRedemption.voucherCode}
                  </span>
                  <span
                    className={`text-xs font-black px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                      foundRedemption.status === 'given'
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-emerald-200 text-emerald-800'
                    }`}
                  >
                    {foundRedemption.status === 'given' ? (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>ĐÃ TRAO QUÀ (HẾT HẠN)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>HỢP LỆ - CHỜ TRAO QUÀ</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Học sinh:</span>
                    <strong className="text-slate-950 text-sm">{foundRedemption.studentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Phần quà:</span>
                    <strong className="text-rose-600 text-sm">{foundRedemption.giftName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Số xu đã trừ:</span>
                    <span className="font-black text-amber-700">🪙 {foundRedemption.coinsSpent} xu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-bold">Thời gian đổi:</span>
                    <span className="font-mono">
                      {new Date(foundRedemption.timestamp).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>

                {foundRedemption.status === 'given' ? (
                  <div className="p-2.5 bg-white/80 rounded-xl text-center text-xs font-bold text-rose-700">
                    ⚠️ Phiếu này đã được sử dụng và trao quà vào lúc:{' '}
                    {foundRedemption.givenAt
                      ? new Date(foundRedemption.givenAt).toLocaleString('vi-VN')
                      : 'trước đó'}
                    . Không được nhận lần 2!
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeliver}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Xác Nhận Trao Quà & Vô Hiệu Hóa Phiếu</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl font-bold text-xs">
                ❌ Không tìm thấy thông tin cho mã voucher: <strong>{inputCode}</strong>. Thầy/Cô vui lòng kiểm tra lại mã trên phiếu!
              </div>
            )}
          </div>
        )}

        {/* NÚT ĐÓNG */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
