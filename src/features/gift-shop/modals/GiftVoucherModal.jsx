import React from 'react';
import { X, Printer, QrCode, ShieldCheck, Check } from 'lucide-react';
import { playClick, playPrintVoucher } from '../../../utils/soundEffects';

export default function GiftVoucherModal({ isOpen, onClose, redemption, classNameInfo }) {
  if (!isOpen || !redemption) return null;

  const handlePrint = () => {
    playPrintVoucher();
    window.print();
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
    redemption.voucherCode
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md border border-slate-200 shadow-2xl p-6 space-y-5 my-auto print:border-0 print:shadow-none print:max-w-none print:w-auto">
        {/* NÚT CLOSE KHÔNG IN RA */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🎟️</span>
            <h3 className="text-base font-black text-slate-900">Phiếu Voucher Đổi Quà (Khổ A6)</h3>
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

        {/* THIẾT KẾ VÉ KHỔ A6 TRANG TRỌNG */}
        <div className="bg-gradient-to-br from-amber-50/80 via-white to-rose-50/80 border-2 border-dashed border-amber-400 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-inner print:border-black">
          {/* VỆT TRANG TRÍ */}
          <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 print:border-black">
            <div>
              <span className="text-[10px] font-black tracking-widest text-rose-600 uppercase block print:text-black">
                {classNameInfo || 'LỚP HỌC 4.0'} • VOUCHER THƯỞNG
              </span>
              <h2 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                PHIẾU ĐỔI QUÀ THI ĐUA
              </h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-xl font-black shadow-xs">
              🎁
            </div>
          </div>

          {/* THÔNG TIN HỌC SINH & QUÀ */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Họ và tên:</span>
              <span className="font-black text-slate-900 text-sm">{redemption.studentName}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Mã học sinh:</span>
              <span className="font-mono font-black text-purple-700">{redemption.studentCode || 'HS'}</span>
            </div>

            <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-amber-200 print:border-black">
              <span className="text-slate-600 font-bold">Phần quà:</span>
              <span className="font-black text-rose-600 text-sm truncate max-w-[180px]">
                {redemption.giftName}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Số xu đã khấu trừ:</span>
              <span className="font-black text-amber-600">🪙 {redemption.coinsSpent} xu</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-bold">Ngày đổi phiếu:</span>
              <span className="font-mono text-slate-700">
                {new Date(redemption.timestamp).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>

          {/* MÃ QR CODE & TEM BẢO MẬT */}
          <div className="pt-2 border-t-2 border-amber-200 flex items-center justify-between print:border-black">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-black text-slate-700 bg-amber-100 px-2 py-1 rounded-md inline-block border border-amber-300 print:border-black">
                MÃ: {redemption.voucherCode}
              </span>
              <div className="flex items-center space-x-1 text-[9px] text-rose-700 font-extrabold print:text-black">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>CHỈ SỬ DỤNG 1 LẦN</span>
              </div>
            </div>

            <div className="w-16 h-16 bg-white p-1 rounded-xl border border-slate-300 shadow-2xs flex-shrink-0">
              <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC IN */}
        <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-100 print:hidden">
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ In Phiếu A6 (Print)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
