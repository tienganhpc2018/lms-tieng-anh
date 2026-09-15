import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { playClick, playPrintVoucher } from '../../../utils/soundEffects';

export default function BatchVoucherModal({ isOpen, onClose, redemptions = [], classNameInfo }) {
  if (!isOpen || redemptions.length === 0) return null;

  const handlePrint = () => {
    playPrintVoucher();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-6 space-y-4 my-auto print:border-0 print:shadow-none print:max-w-none print:w-full print:p-0">
        {/* HEADER KHÔNG IN */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:hidden">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
              <span>🖨️ In Hàng Loạt Voucher ({redemptions.length} phiếu / Dàn trang 4 phiếu 1 trang A4)</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Thiết kế dạng lưới 2x2 có đường cắt nét đứt, tiết kiệm tối đa giấy in
            </p>
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

        {/* LƯỚI IN 2x2 TRÊN 1 TỜ A4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-2 print:gap-2 print:m-0">
          {redemptions.map((r, idx) => {
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
              r.voucherCode
            )}`;
            return (
              <div
                key={r.id || idx}
                className="bg-white border-2 border-dashed border-slate-400 rounded-2xl p-4 space-y-2.5 relative shadow-inner print:shadow-none print:border-black print:break-inside-avoid"
              >
                {/* TIÊU ĐỀ PHIẾU */}
                <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 print:border-black">
                  <div>
                    <span className="text-[9px] font-black tracking-wider text-rose-600 uppercase block print:text-black">
                      {classNameInfo || 'LỚP HỌC 4.0'} • VOUCHER THƯỞNG
                    </span>
                    <h4 className="text-xs font-black text-slate-900">PHIẾU ĐỔI QUÀ THI ĐUA</h4>
                  </div>
                  <span className="text-base">🎁</span>
                </div>

                {/* THÔNG TIN */}
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Học sinh:</span>
                    <strong className="text-slate-900">{r.studentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Phần quà:</span>
                    <span className="font-black text-rose-600 truncate max-w-[150px]">{r.giftName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Giá đổi:</span>
                    <span className="font-black text-amber-700">🪙 {r.coinsSpent} xu</span>
                  </div>
                </div>

                {/* QR & MÃ */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between print:border-black">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-black text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 print:border-black">
                      {r.voucherCode}
                    </span>
                    <div className="flex items-center space-x-1 text-[8px] text-rose-700 font-bold print:text-black">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                      <span>CHỈ SỬ DỤNG 1 LẦN</span>
                    </div>
                  </div>

                  <div className="w-12 h-12 bg-white p-0.5 rounded border border-slate-300 flex-shrink-0">
                    <img src={qrUrl} alt="QR" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* NÚT THAO TÁC KHÔNG IN */}
        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100 print:hidden">
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
            onClick={handlePrint}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-lg transition cursor-pointer flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>🖨️ In Khổ A4 ({redemptions.length} Phiếu)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
