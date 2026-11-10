import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CreditCard, QrCode, Printer, CheckCircle2, Search, Filter, 
  ArrowDownToLine, Copy, Check, DollarSign, Calendar, Eye, Sparkles 
} from 'lucide-react';
import { formatVND } from './AttendanceGridTab';

export default function InvoicesFinanceTab({
  invoices = [],
  centerConfig,
  onUpdateInvoice,
  onOpenPrintModal
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [selectedQrInvoice, setSelectedQrInvoice] = useState(null);
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Lọc hóa đơn
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = inv.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.className?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'unpaid') return matchesSearch && inv.status === 'unpaid';
    if (filterStatus === 'paid') return matchesSearch && inv.status !== 'unpaid';
    return matchesSearch;
  });

  // Xác nhận thanh toán & bắn pháo hoa confetti
  const handleConfirmPayment = (invoiceId, paymentType = 'paid_transfer') => {
    onUpdateInvoice(invoiceId, {
      status: paymentType,
      paidAt: new Date().toLocaleDateString('vi-VN')
    });

    // Bắn pháo hoa rực rỡ
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Sao chép STK
  const handleCopyAccount = (stk) => {
    navigator.clipboard.writeText(stk);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // URL VietQR Động Chuẩn NAPAS
  const getVietQrUrl = (invoice) => {
    const bank = centerConfig?.bankInfo?.bankId || 'MB';
    const acc = centerConfig?.bankInfo?.accountNo || '0988123456';
    const amount = invoice.totalAmount || 0;
    const memo = `${invoice.id} ${invoice.studentName.replace(/\s+/g, '')} HP`;
    const accName = centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI';

    return `https://img.vietqr.io/image/${bank}-${acc}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accName)}`;
  };

  // Thống kê nhanh
  const totalAmountSum = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const collectedSum = invoices
    .filter((inv) => inv.status !== 'unpaid')
    .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const unpaidSum = totalAmountSum - collectedSum;

  return (
    <div className="space-y-4">
      {/* 1. THẺ THỐNG KÊ TỔNG THU HỌC PHÍ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Doanh Thu Hóa Đơn</div>
          <div className="text-xl font-black text-slate-900 mt-1">{formatVND(totalAmountSum)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{invoices.length} hóa đơn phát hành</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-800 uppercase">Đã Thu Thực Tế (Xác Nhận)</div>
          <div className="text-xl font-black text-emerald-700 mt-1">{formatVND(collectedSum)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Tiền mặt & Chuyển khoản VietQR</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-800 uppercase">Còn Nợ Cần Thu</div>
          <div className="text-xl font-black text-rose-700 mt-1">{formatVND(unpaidSum)}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">Chờ phụ huynh thanh toán</div>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học sinh, mã HD (VD: HD-2609-001)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'all'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({invoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'unpaid'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Chưa nộp ({invoices.filter((i) => i.status === 'unpaid').length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterStatus === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            Đã nộp ({invoices.filter((i) => i.status !== 'unpaid').length})
          </button>
        </div>
      </div>

      {/* 3. BẢNG DANH SÁCH HÓA ĐƠN */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-100 text-slate-700 uppercase font-black text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Mã Hóa Đơn</th>
                <th className="py-3 px-3">Học Sinh</th>
                <th className="py-3 px-3">Lớp & Kỳ Học</th>
                <th className="py-3 px-2 text-center">Số Buổi</th>
                <th className="py-3 px-2 text-right">Đơn Giá</th>
                <th className="py-3 px-2 text-right">Miễn Giảm</th>
                <th className="py-3 px-3 text-right">Tổng Tiền</th>
                <th className="py-3 px-2 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status !== 'unpaid';
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-3 font-mono font-black text-slate-700">
                      {inv.id}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      <div>{inv.studentName}</div>
                      {inv.phone && <div className="text-[10px] text-slate-400 font-normal">{inv.phone}</div>}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-700">{inv.className}</div>
                      <div className="text-[10px] text-slate-400">{inv.month}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                      {inv.sessionsAttended}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      {formatVND(inv.pricePerSession)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-rose-600 font-semibold">
                      {inv.deduction > 0 ? `-${formatVND(inv.deduction)}` : '0đ'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-800 text-sm">
                      {formatVND(inv.totalAmount)}
                    </td>
                    <td className="py-2.5 px-2 text-center">
                      {inv.status === 'paid_transfer' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                          <span>💳 Chuyển khoản</span>
                        </span>
                      )}
                      {inv.status === 'paid_cash' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <span>💵 Tiền mặt</span>
                        </span>
                      )}
                      {inv.status === 'unpaid' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                          <span>⏳ Chưa nộp</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        {/* Nút xem VietQR */}
                        <button
                          onClick={() => setSelectedQrInvoice(inv)}
                          className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg transition"
                          title="Mở mã thanh toán VietQR NAPAS"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Nút In phiếu thu */}
                        <button
                          onClick={() => onOpenPrintModal(inv)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                          title="In phiếu thu học phí A4/A5"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {/* Nút Xác nhận đã nộp nếu chưa nộp */}
                        {!isPaid && (
                          <button
                            onClick={() => handleConfirmPayment(inv.id, 'paid_transfer')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black transition shadow-2xs"
                            title="Xác nhận đã nhận học phí"
                          >
                            Xác nhận nộp
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL MÃ VIETQR ĐỘNG CHUẨN NAPAS */}
      {selectedQrInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
            <button
              onClick={() => setSelectedQrInvoice(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900">
                MÃ THANH TOÁN VIETQR 24/7
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Quét bằng ứng dụng Ngân hàng bất kỳ hoặc Ví MoMo
              </p>
            </div>

            {/* Ảnh VietQR động */}
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex justify-center">
              <img
                src={getVietQrUrl(selectedQrInvoice)}
                alt="VietQR NAPAS"
                className="w-64 h-auto rounded-xl shadow-xs"
              />
            </div>

            {/* Thông tin chuyển khoản chi tiết */}
            <div className="mt-4 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Ngân hàng:</span>
                <span className="font-black text-slate-900">{centerConfig?.bankInfo?.bankName || 'MBBank'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Số tài khoản:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {centerConfig?.bankInfo?.accountNo || '0988123456'}
                  </span>
                  <button
                    onClick={() => handleCopyAccount(centerConfig?.bankInfo?.accountNo || '0988123456')}
                    className="p-1 text-slate-400 hover:text-emerald-700"
                    title="Sao chép số tài khoản"
                  >
                    {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Chủ tài khoản:</span>
                <span className="font-black text-slate-900 uppercase">{centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Số tiền:</span>
                <span className="font-black text-rose-700 text-sm">{formatVND(selectedQrInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-emerald-200">
                <span className="text-slate-500 font-medium">Nội dung CK:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {selectedQrInvoice.id} {selectedQrInvoice.studentName.replace(/\s+/g, '')} HP
                </span>
              </div>
            </div>

            {/* Nút hành động trong modal */}
            <div className="mt-4 flex space-x-2">
              {selectedQrInvoice.status === 'unpaid' ? (
                <button
                  onClick={() => {
                    handleConfirmPayment(selectedQrInvoice.id, 'paid_transfer');
                    setSelectedQrInvoice(null);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác Nhận Đã Nhận Tiền</span>
                </button>
              ) : (
                <div className="w-full py-2 bg-slate-100 text-emerald-800 font-black text-xs rounded-xl text-center">
                  ✓ Hóa đơn này đã được thanh toán
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
