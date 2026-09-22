import React, { useState, useEffect } from 'react';
import {
  X,
  Archive,
  Calendar,
  Award,
  Trash2,
  ChevronRight,
  Plus,
  RotateCcw,
  Sparkles,
  Printer,
  Users,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { loadSnapshots, saveSnapshot, deleteSnapshot } from '../behaviorStorage';
import { playClick, playCorrect, playWinner, playDeduct } from '../../../utils/soundEffects';

export default function ArchiveSnapshotsModal({
  isOpen,
  onClose,
  classId,
  classNameTitle = '',
  activeClass = null,
  students = [],
}) {
  const [snapshots, setSnapshots] = useState([]);
  const [selectedSnapshot, setSelectedSnapshot] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (isOpen && classId) {
      const list = loadSnapshots(classId);
      setSnapshots(list);
      if (list.length > 0) {
        setSelectedSnapshot(list[0]);
      } else {
        setSelectedSnapshot(null);
      }
      setIsCreatingNew(false);
      setNewTitle(`Thi đua tuần ${new Date().toLocaleDateString('vi-VN')}`);
    }
  }, [isOpen, classId]);

  if (!isOpen) return null;

  // Xử lý tạo Snapshot mới
  const handleCreateSnapshot = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    playWinner();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const created = saveSnapshot(classId, newTitle.trim(), students, activeClass);
    if (created) {
      const updatedList = [created, ...snapshots];
      setSnapshots(updatedList);
      setSelectedSnapshot(created);
      setIsCreatingNew(false);
      setToastMsg(`✅ Đã chốt sổ và lưu trữ kỳ thi đua: "${created.title}"!`);
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  // Xóa snapshot
  const handleDeleteSnapshot = (snapId, title) => {
    playClick();
    if (window.confirm(`Thầy/Cô có chắc chắn muốn xóa bản lưu trữ "${title}" không?`)) {
      playDeduct();
      const remaining = deleteSnapshot(classId, snapId);
      setSnapshots(remaining);
      if (selectedSnapshot?.id === snapId) {
        setSelectedSnapshot(remaining[0] || null);
      }
      setToastMsg('🗑️ Đã xóa kỳ thi đua khỏi sổ lưu trữ!');
      setTimeout(() => setToastMsg(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 my-auto max-h-[94vh] flex flex-col">
        {/* HEADER MODAL */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md text-lg">
              🗂️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                Sổ Lưu Trữ Thi Đua & Bảng Vàng {classNameTitle}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Xem lại lịch sử các kỳ thi đua đã chốt sổ (Tuần / Tháng) và danh sách khen thưởng
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                playClick();
                setIsCreatingNew(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition cursor-pointer flex items-center space-x-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Chốt Sổ Kỳ Này</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TOAST THÔNG BÁO */}
        {toastMsg && (
          <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-fade-in flex items-center space-x-2">
            <span>{toastMsg}</span>
          </div>
        )}

        {/* FORM CHỐT SỔ KỲ NÀY */}
        {isCreatingNew && (
          <form onSubmit={handleCreateSnapshot} className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Lưu Trữ & Chốt Sổ Kỳ Thi Đua Hiện Tại:</span>
              </span>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Hủy
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ví dụ: Thi đua Tuần 3 - Tháng 9/2026..."
                className="flex-1 px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-amber-500 shadow-2xs"
                autoFocus
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl transition cursor-pointer shadow-xs whitespace-nowrap"
              >
                Xác Nhận Chốt Sổ
              </button>
            </div>
            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
              * Hệ thống sẽ chụp lại toàn bộ điểm số, thứ hạng và điểm thưởng KTTX của {students.length} học sinh hiện tại để lưu vĩnh viễn vào sổ. Sau đó Thầy có thể yên tâm bấm "Reset Điểm Cả Lớp" để sang tuần mới!
            </p>
          </form>
        )}

        {/* NỘI DUNG 2 CỘT: DANH SÁCH CÁC KỲ VÀ CHI TIẾT BẢNG VÀNG */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* CỘT TRÁI: DANH SÁCH CÁC KỲ ĐÃ CHỐT */}
          <div className="md:col-span-5 border border-slate-200 rounded-2xl p-3 flex flex-col space-y-2 overflow-y-auto max-h-[58vh]">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider px-1">
              LỊCH SỬ CÁC KỲ ĐÃ CHỐT ({snapshots.length})
            </span>

            {snapshots.length === 0 ? (
              <div className="p-8 text-center space-y-2 my-auto">
                <Archive className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-400">Chưa có kỳ thi đua nào được lưu trữ.</p>
                <p className="text-[11px] text-slate-400">Hãy bấm nút "+ Chốt Sổ Kỳ Này" để tạo bản lưu đầu tiên nhé!</p>
              </div>
            ) : (
              snapshots.map((snap) => {
                const isSelected = selectedSnapshot?.id === snap.id;
                return (
                  <div
                    key={snap.id}
                    onClick={() => {
                      playClick();
                      setSelectedSnapshot(snap);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between space-x-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-2xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <h4 className={`text-xs font-black truncate ${isSelected ? 'text-amber-950' : 'text-slate-800'}`}>
                        {snap.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {new Date(snap.createdAt).toLocaleDateString('vi-VN')} • {snap.totalStudents} HS • +{snap.stats?.totalPlus || 0} đ
                      </p>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSnapshot(snap.id, snap.title);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Xóa kỳ này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* CỘT PHẢI: CHI TIẾT BẢNG VÀNG CỦA KỲ ĐƯỢC CHỌN */}
          <div className="md:col-span-7 border border-slate-200 rounded-2xl p-4 flex flex-col space-y-4 overflow-y-auto max-h-[58vh]">
            {selectedSnapshot ? (
              <div className="space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      📅 {new Date(selectedSnapshot.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className="text-xs font-black text-slate-700">
                      Sĩ số: {selectedSnapshot.totalStudents} học sinh
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-1">
                    {selectedSnapshot.title}
                  </h3>
                </div>

                {/* THỐNG KÊ KỲ ĐÓ */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 font-bold">
                    <span className="text-[10px] text-emerald-700 block uppercase">Tổng Điểm Cộng</span>
                    <span className="text-base font-black text-emerald-800">+{selectedSnapshot.stats?.totalPlus || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 font-bold">
                    <span className="text-[10px] text-rose-700 block uppercase">Tổng Điểm Trừ</span>
                    <span className="text-base font-black text-rose-800">-{selectedSnapshot.stats?.totalMinus || 0}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 font-bold">
                    <span className="text-[10px] text-blue-700 block uppercase">Tổng Thưởng KTTX</span>
                    <span className="text-base font-black text-blue-800">+{selectedSnapshot.stats?.totalKttxAwarded || 0} đ</span>
                  </div>
                </div>

                {/* BẢNG VÀNG TOP 5 VINH DANH */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Bảng Vàng Vinh Danh Top Học Sinh Xuất Sắc:</span>
                  </span>

                  <div className="space-y-1.5">
                    {selectedSnapshot.topStudents?.map((st, idx) => {
                      const medalBg =
                        idx === 0
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : idx === 1
                          ? 'bg-slate-100 text-slate-900 border-slate-300'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-900 border-orange-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200';

                      return (
                        <div
                          key={st.id || idx}
                          className={`px-3.5 py-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${medalBg}`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <span className="font-black text-sm">
                              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                            </span>
                            <span className="font-black">{st.name}</span>
                            <span className="text-[10px] opacity-70 font-mono">({st.code})</span>
                          </div>

                          <div className="flex items-center space-x-3 text-right">
                            <span className="font-black text-emerald-700">+{st.plus} đ</span>
                            {st.kttxBonus > 0 && (
                              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                +{st.kttxBonus} KTTX
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 my-auto text-slate-400">
                <p className="text-xs font-bold">Vui lòng chọn một kỳ thi đua bên trái để xem chi tiết.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
