import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function InvoicePrintModal({ invoice, centerConfig, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const bank = centerConfig?.bankInfo?.bankId || 'MB';
  const acc = centerConfig?.bankInfo?.accountNo || '0988123456';
  const amount = invoice.totalAmount || 0;
  const memo = `${invoice.id} ${invoice.studentName.replace(/\s+/g, '')} HP`;
  const accName = centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI';
  const qrUrl = `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accName)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8 print:p-0 print:border-none print:shadow-none">
        {/* Nút đóng / in ở chế độ màn hình */}
        <div className="flex justify-between items-center mb-6 print:hidden border-b border-slate-200 pb-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Xem trước phiếu thu (Khổ A5 / A4)
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition flex items-center space-x-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Thu</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black"
            >
              ✕
            </button>
          </div>
        </div>

        {/* NỘI DUNG PHIẾU THU CHÍNH THỨC */}
        <div className="border-2 border-emerald-800 p-6 rounded-2xl space-y-6 text-slate-900 font-serif">
          {/* Header trung tâm */}
          <div className="flex justify-between items-start border-b-2 border-emerald-800 pb-4">
            <div>
              <h2 className="text-sm font-black text-emerald-900 uppercase tracking-tight">
                {centerConfig?.centerName || 'TRUNG TÂM BỒI DƯỠNG VĂN HÓA HOA MAI'}
              </h2>
              <div className="text-[11px] text-slate-600 font-sans mt-0.5">
                {centerConfig?.address || 'Số 86 Đường Lê Lợi, TP. Bắc Giang'}
              </div>
              <div className="text-[11px] text-slate-600 font-sans">
                Hotline: <span className="font-bold">{centerConfig?.hotline || '0988.123.456'}</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-slate-500">Mẫu số: 01-TT/HP</div>
              <div className="text-xs font-mono font-black text-emerald-800 mt-1">
                Số: {invoice.id}
              </div>
            </div>
          </div>

          {/* Tiêu đề chính */}
          <div className="text-center space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 uppercase tracking-wide">
              PHIẾU THU HỌC PHÍ
            </h1>
            <div className="text-xs italic text-slate-600 font-sans">
              Kỳ học: {invoice.month || 'Tháng 10/2026'}
            </div>
          </div>

          {/* Thông tin học sinh */}
          <div className="grid grid-cols-2 gap-3 text-xs font-sans">
            <div>
              <span className="text-slate-500">Họ và tên học sinh:</span>{' '}
              <span className="font-black text-slate-950 text-sm uppercase">{invoice.studentName}</span>
            </div>
            <div>
              <span className="text-slate-500">Lớp học:</span>{' '}
              <span className="font-bold text-slate-950">{invoice.className}</span>
            </div>
            <div>
              <span className="text-slate-500">Số điện thoại liên hệ:</span>{' '}
              <span className="font-bold text-slate-950">{invoice.phone || '0912.xxx.xxx'}</span>
            </div>
            <div>
              <span className="text-slate-500">Trạng thái:</span>{' '}
              <span className="font-bold text-emerald-800">
                {invoice.status !== 'unpaid' ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
              </span>
            </div>
          </div>

          {/* Bảng kê chi tiết học phí */}
          <div className="font-sans">
            <table className="w-full text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 text-left">Nội dung thu</th>
                  <th className="p-2 text-center">Số buổi</th>
                  <th className="p-2 text-right">Đơn giá</th>
                  <th className="p-2 text-right">Miễn giảm</th>
                  <th className="p-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Học phí bổ trợ chuyên môn</td>
                  <td className="p-2 text-center font-bold">{invoice.sessionsAttended}</td>
                  <td className="p-2 text-right">{formatVND(invoice.pricePerSession)}</td>
                  <td className="p-2 text-right text-rose-600">
                    {invoice.deduction > 0 ? `-${formatVND(invoice.deduction)}` : '0đ'}
                  </td>
                  <td className="p-2 text-right font-black">
                    {formatVND(invoice.sessionsAttended * invoice.pricePerSession - (invoice.deduction || 0))}
                  </td>
                </tr>
                {invoice.materialsFee > 0 && (
                  <tr>
                    <td className="p-2 font-medium">Phụ phí tài liệu & đề thi in ấn</td>
                    <td className="p-2 text-center font-bold">1</td>
                    <td className="p-2 text-right">{formatVND(invoice.materialsFee)}</td>
                    <td className="p-2 text-right text-slate-400">0đ</td>
                    <td className="p-2 text-right font-black">{formatVND(invoice.materialsFee)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-emerald-50/60 font-black border-t-2 border-emerald-800">
                <tr>
                  <td colSpan={4} className="p-2.5 text-right uppercase text-emerald-950">
                    TỔNG CỘNG TIỀN PHẢI NỘP:
                  </td>
                  <td className="p-2.5 text-right text-emerald-900 text-base">
                    {formatVND(invoice.totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Phần VietQR và Chữ ký */}
          <div className="flex justify-between items-center pt-2 font-sans border-t border-slate-200">
            <div className="flex items-center space-x-3">
              <img src={qrUrl} alt="VietQR" className="w-24 h-24 rounded-lg border border-slate-200" />
              <div className="text-[10px] space-y-0.5 text-slate-600">
                <div className="font-bold text-slate-800">Quét VietQR nộp nhanh:</div>
                <div>{centerConfig?.bankInfo?.bankName || 'MBBank'}</div>
                <div className="font-mono font-bold text-slate-900">STK: {centerConfig?.bankInfo?.accountNo || '0988123456'}</div>
                <div className="uppercase">CTK: {centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI'}</div>
              </div>
            </div>

            <div className="text-center space-y-12">
              <div className="text-xs">
                <div className="italic text-slate-500">Ngày ..... tháng ..... năm 2026</div>
                <div className="font-bold text-slate-800 uppercase mt-1">Người lập phiếu / Giáo viên</div>
              </div>
              <div className="font-bold text-slate-900 text-xs uppercase">
                {centerConfig?.bankInfo?.accountName || 'Nguyễn Văn Hải'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
