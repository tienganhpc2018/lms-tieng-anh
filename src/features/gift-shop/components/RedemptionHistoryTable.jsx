import React, { useState } from 'react';
import {
  Search,
  Filter,
  Printer,
  QrCode,
  RotateCcw,
  CheckCircle2,
  Clock,
  Trash2,
  FileSpreadsheet,
  Coins,
  Package,
  User,
  AlertTriangle,
  Gift,
} from 'lucide-react';
import { playUndoRestore, playClick, playCorrect } from '../../../utils/soundEffects';
import {
  refundStudentCoins,
  saveRedemptions,
  loadGifts,
  saveGifts,
} from '../giftShopStorage';

export default function RedemptionHistoryTable({
  classId,
  redemptions = [],
  onRedemptionsChanged,
  onOpenSingleVoucher,
  onOpenBatchVouchers,
  onOpenScanner,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'claimed'
  const [selectedIds, setSelectedIds] = useState([]);
  const [confirmUndoItem, setConfirmUndoItem] = useState(null);

  // Lọc danh sách
  const filteredList = redemptions.filter((item) => {
    const matchesSearch =
      (item.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.giftName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.voucherCode || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Chọn / Bỏ chọn từng item
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Chọn tất cả
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((item) => item.id));
    }
  };

  // Đánh dấu đã trao quà
  const handleMarkClaimed = (item) => {
    playCorrect();
    const updated = redemptions.map((r) =>
      r.id === item.id
        ? {
            ...r,
            status: 'claimed',
            claimedAt: new Date().toISOString(),
          }
        : r
    );
    saveRedemptions(classId, updated);
    if (onRedemptionsChanged) onRedemptionsChanged(updated);
  };

  // Xác nhận hoàn tác (hoàn trả xu + cộng lại kho quà)
  const handleExecuteUndo = () => {
    if (!confirmUndoItem) return;
    playUndoRestore();

    // 1. Hoàn lại xu cho học sinh
    refundStudentCoins(classId, confirmUndoItem.studentId, confirmUndoItem.cost);

    // 2. Cộng lại 1 tồn kho cho phần quà (nếu là quà thường từ kho)
    if (confirmUndoItem.giftId && !confirmUndoItem.giftId.startsWith('wheel_') && !confirmUndoItem.giftId.startsWith('box_')) {
      const gifts = loadGifts(classId);
      const updatedGifts = gifts.map((g) => {
        if (g.id === confirmUndoItem.giftId) {
          return { ...g, stock: (g.stock || 0) + 1 };
        }
        return g;
      });
      saveGifts(classId, updatedGifts);
    }

    // 3. Xóa hoặc gỡ bỏ giao dịch khỏi lịch sử
    const updatedRedemptions = redemptions.filter((r) => r.id !== confirmUndoItem.id);
    saveRedemptions(classId, updatedRedemptions);

    // 4. Bỏ chọn nếu có
    setSelectedIds((prev) => prev.filter((id) => id !== confirmUndoItem.id));

    setConfirmUndoItem(null);
    if (onRedemptionsChanged) onRedemptionsChanged(updatedRedemptions);
  };

  // Các mục được chọn để in hàng loạt A4
  const selectedItemsForBatch = redemptions.filter((r) => selectedIds.includes(r.id));

  // Thống kê nhanh
  const totalCoinsSpent = redemptions.reduce((acc, cur) => acc + (cur.cost || 0), 0);
  const pendingCount = redemptions.filter((r) => r.status === 'pending').length;
  const claimedCount = redemptions.filter((r) => r.status === 'claimed').length;

  return (
    <div className="space-y-4">
      {/* 3 Thẻ thống kê mini */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Tổng xu đã quy đổi</div>
            <div className="text-xl font-black text-slate-800">{totalCoinsSpent} xu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Chờ trao quà thực tế</div>
            <div className="text-xl font-black text-orange-600">{pendingCount} phiếu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500">Đã hoàn thành trao quà</div>
            <div className="text-xl font-black text-emerald-600">{claimedCount} phiếu</div>
          </div>
        </div>
      </div>

      {/* Thanh công cụ và bộ lọc */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên học sinh, quà tặng, mã voucher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all"
            />
          </div>

          {/* Lọc trạng thái */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => { playClick(); setStatusFilter('all'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({redemptions.length})
            </button>
            <button
              onClick={() => { playClick(); setStatusFilter('pending'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ trao ({pendingCount})
            </button>
            <button
              onClick={() => { playClick(); setStatusFilter('claimed'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === 'claimed'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã trao ({claimedCount})
            </button>
          </div>
        </div>

        {/* Các nút thao tác hàng loạt & Quét mã */}
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <button
              onClick={() => {
                playClick();
                if (onOpenBatchVouchers) onOpenBatchVouchers(selectedItemsForBatch);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              In Hàng Loạt A4 ({selectedIds.length})
            </button>
          )}

          <button
            onClick={() => {
              playClick();
              if (onOpenScanner) onOpenScanner();
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            Quét Mã Tra Cứu
          </button>
        </div>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-4xl">📜</div>
            <h4 className="text-base font-bold text-slate-700">Chưa có dữ liệu đổi quà nào</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Khi học sinh thực hiện đổi quà, quay thưởng hoặc mở rương bí ẩn, toàn bộ lịch sử sẽ tự động ghi nhận tại đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredList.length > 0 &&
                        selectedIds.length === filteredList.length
                      }
                      onChange={handleToggleSelectAll}
                      className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="p-3">Mã Phiếu Voucher</th>
                  <th className="p-3">Học Sinh</th>
                  <th className="p-3">Phần Quà Đổi</th>
                  <th className="p-3">Chi Phí Xu</th>
                  <th className="p-3">Thời Gian Đổi</th>
                  <th className="p-3 text-center">Trạng Thái</th>
                  <th className="p-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isClaimed = item.status === 'claimed';

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? 'bg-amber-50/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="rounded text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Mã Voucher */}
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                          <QrCode className="w-3 h-3" />
                          {item.voucherCode || 'N/A'}
                        </span>
                      </td>

                      {/* Học sinh */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{item.studentName}</div>
                        {item.studentCode && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            Mã: {item.studentCode}
                          </div>
                        )}
                      </td>

                      {/* Quà tặng */}
                      <td className="p-3">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Gift className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{item.giftName}</span>
                        </div>
                        {item.note && (
                          <div className="text-[10px] text-slate-400">{item.note}</div>
                        )}
                      </td>

                      {/* Chi phí xu */}
                      <td className="p-3">
                        <span className="font-black text-amber-600 flex items-center gap-1">
                          <Coins className="w-3.5 h-3.5" />
                          {item.cost} xu
                        </span>
                      </td>

                      {/* Thời gian */}
                      <td className="p-3 text-xs text-slate-500">
                        {item.redeemedAt
                          ? new Date(item.redeemedAt).toLocaleString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: '2-digit',
                              month: '2-digit',
                            })
                          : 'Vừa xong'}
                      </td>

                      {/* Trạng thái */}
                      <td className="p-3 text-center">
                        {isClaimed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Đã Trao Quà
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3" />
                            Chờ Nhận Quà
                          </span>
                        )}
                      </td>

                      {/* Nút hành động */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút in voucher lẻ */}
                          <button
                            title="In Phiếu Voucher (A6)"
                            onClick={() => {
                              playClick();
                              if (onOpenSingleVoucher) onOpenSingleVoucher(item);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Nút xác nhận trao quà nhanh */}
                          {!isClaimed && (
                            <button
                              title="Xác nhận đã trao quà"
                              onClick={() => handleMarkClaimed(item)}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Nút hoàn tác trả lại xu và kho */}
                          <button
                            title="Hoàn tác / Hủy giao dịch (Hoàn xu & kho)"
                            onClick={() => setConfirmUndoItem(item)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal xác nhận hoàn tác */}
      {confirmUndoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-rose-300 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">Xác Nhận Hủy Đổi Quà?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Thao tác này sẽ tự động{' '}
                <strong className="text-amber-600">hoàn trả +{confirmUndoItem.cost} xu</strong> vào ví
                học sinh <strong>{confirmUndoItem.studentName}</strong>, đồng thời cộng lại số lượng vào kho quà.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <div>Phần quà: <strong>{confirmUndoItem.giftName}</strong></div>
              <div>Mã voucher: <span className="font-mono text-purple-600">{confirmUndoItem.voucherCode}</span></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setConfirmUndoItem(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={handleExecuteUndo}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30"
              >
                Đồng Ý Hoàn Tác
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
