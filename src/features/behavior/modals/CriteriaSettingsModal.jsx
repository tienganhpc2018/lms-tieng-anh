import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, RotateCcw, Check, Sparkles, Star, AlertTriangle } from 'lucide-react';
import { loadCriteria, saveCriteria, resetCriteriaToDefault } from '../behaviorStorage';
import { playClick, playCorrect, playDeduct } from '../../../utils/soundEffects';

const EMOJI_SUGGESTIONS = [
  '🙋‍♂️', '🌟', '🤝', '🧹', '💯', '🚀', '🎤', '⭐', '👏', '🏆',
  '📚', '💡', '🎯', '🎨', '🗣️', '📑', '⏰', '😴', '📱', '⚠️',
  '🍬', '👔', '🥊', '❌', '🚫', '💥', '👀', '🏃‍♂️', '📢', '🔥'
];

export default function CriteriaSettingsModal({ isOpen, onClose, initialGrade = 'all' }) {
  const [selectedGrade, setSelectedGrade] = useState(initialGrade || 'all');
  const [plusCriteria, setPlusCriteria] = useState([]);
  const [minusCriteria, setMinusCriteria] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // Form thêm tiêu chí mới
  const [newLabel, setNewLabel] = useState('');
  const [newPoints, setNewPoints] = useState(1);
  const [newIcon, setNewIcon] = useState('🌟');
  const [newType, setNewType] = useState('plus'); // 'plus' | 'minus'

  // Trạng thái đang chỉnh sửa tiêu chí
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadData(selectedGrade);
    }
  }, [isOpen, selectedGrade]);

  const loadData = (grade) => {
    const data = loadCriteria(grade);
    setPlusCriteria(data.plusCriteria || []);
    setMinusCriteria(data.minusCriteria || []);
  };

  if (!isOpen) return null;

  // Thêm tiêu chí mới
  const handleAddCriteria = (e) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    playCorrect();
    const item = {
      id: `crit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      label: newLabel.trim(),
      points: Math.max(1, Number(newPoints) || 1),
      icon: newIcon || (newType === 'plus' ? '🌟' : '⚠️'),
    };

    if (newType === 'plus') {
      const updated = [...plusCriteria, item];
      setPlusCriteria(updated);
      saveCriteria({ plusCriteria: updated, minusCriteria }, selectedGrade);
    } else {
      const updated = [...minusCriteria, item];
      setMinusCriteria(updated);
      saveCriteria({ plusCriteria, minusCriteria: updated }, selectedGrade);
    }

    setNewLabel('');
    setNewPoints(1);
    setToastMessage(`✅ Đã thêm tiêu chí: "${item.label}"`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Xóa tiêu chí
  const handleDeleteCriteria = (id, type) => {
    playDeduct();
    if (type === 'plus') {
      const updated = plusCriteria.filter((c) => c.id !== id);
      setPlusCriteria(updated);
      saveCriteria({ plusCriteria: updated, minusCriteria }, selectedGrade);
    } else {
      const updated = minusCriteria.filter((c) => c.id !== id);
      setMinusCriteria(updated);
      saveCriteria({ plusCriteria, minusCriteria: updated }, selectedGrade);
    }
  };

  // Cập nhật sửa tiêu chí
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingItem || !editingItem.label.trim()) return;

    playCorrect();
    const { id, type, label, points, icon } = editingItem;
    const finalPoints = Math.max(1, Number(points) || 1);

    if (type === 'plus') {
      const updated = plusCriteria.map((c) => (c.id === id ? { ...c, label: label.trim(), points: finalPoints, icon } : c));
      setPlusCriteria(updated);
      saveCriteria({ plusCriteria: updated, minusCriteria }, selectedGrade);
    } else {
      const updated = minusCriteria.map((c) => (c.id === id ? { ...c, label: label.trim(), points: finalPoints, icon } : c));
      setMinusCriteria(updated);
      saveCriteria({ plusCriteria, minusCriteria: updated }, selectedGrade);
    }

    setEditingItem(null);
    setToastMessage('✅ Đã lưu chỉnh sửa tiêu chí');
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Khôi phục mặc định
  const handleResetDefault = () => {
    playClick();
    if (window.confirm('Thầy/Cô có chắc chắn muốn khôi phục danh sách tiêu chí về mẫu chuẩn mặc định?')) {
      const def = resetCriteriaToDefault(selectedGrade);
      setPlusCriteria(def.plusCriteria);
      setMinusCriteria(def.minusCriteria);
      setToastMessage('🔄 Đã khôi phục tiêu chí mặc định thành công!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 my-auto max-h-[94vh] flex flex-col">
        {/* HEADER MODAL */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md text-xl flex-shrink-0">
              ⚙️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cài Đặt Tiêu Chí Nề Nếp & Khen Thưởng
              </h2>
              <p className="text-xs text-slate-500 font-semibold">
                Cấu hình các nội dung cộng, trừ điểm chung tự động áp dụng cho các lớp
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {toastMessage && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in">
                {toastMessage}
              </span>
            )}
            <button
              type="button"
              onClick={handleResetDefault}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer flex items-center space-x-1"
              title="Khôi phục tiêu chí gốc ban đầu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Khôi phục mặc định</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CHỌN KHỐI LỚP ÁP DỤNG */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 select-none">
          <span className="text-xs font-black text-slate-700 whitespace-nowrap">Khối lớp áp dụng:</span>
          {[
            { id: 'all', label: '🌟 Toàn trường (Chung)' },
            { id: '6', label: '🎒 Khối 6' },
            { id: '7', label: '🎒 Khối 7' },
            { id: '8', label: '📖 Khối 8' },
            { id: '9', label: '🎓 Khối 9' },
          ].map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                playClick();
                setSelectedGrade(g.id);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                selectedGrade === g.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* FORM THÊM TIÊU CHÍ MỚI */}
        <form onSubmit={handleAddCriteria} className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>Thêm Tiêu Chí Nhanh Vào Danh Sách:</span>
            </span>
            <div className="flex items-center space-x-1 bg-white p-0.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setNewType('plus');
                  setNewIcon('🌟');
                }}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  newType === 'plus' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                + Điểm Cộng
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewType('minus');
                  setNewIcon('⚠️');
                }}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  newType === 'minus' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                - Điểm Trừ
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
            {/* Chọn Icon */}
            <div className="sm:col-span-2 flex items-center space-x-1">
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-12 h-10 text-center text-xl bg-white border border-slate-300 rounded-xl font-bold outline-none focus:border-emerald-500"
                title="Icon biểu tượng"
              />
              <select
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="h-10 bg-white border border-slate-300 rounded-xl text-sm px-1.5 outline-none cursor-pointer"
              >
                {EMOJI_SUGGESTIONS.map((emo, idx) => (
                  <option key={idx} value={emo}>
                    {emo}
                  </option>
                ))}
              </select>
            </div>

            {/* Nhập tên tiêu chí */}
            <div className="sm:col-span-7">
              <input
                type="text"
                placeholder={newType === 'plus' ? 'VD: Phát biểu tốt, Giúp bạn, Trực nhật...' : 'VD: Nói chuyện, Đi muộn, Quên vở...'}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Nhập số điểm */}
            <div className="sm:col-span-3 flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white px-2 py-1.5 rounded-xl border border-slate-300">
                <span className="text-xs font-black text-slate-500">{newType === 'plus' ? '+' : '-'}</span>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  className="w-12 text-center text-xs font-black text-slate-900 outline-none"
                />
                <span className="text-[10px] font-bold text-slate-400">điểm</span>
              </div>

              <button
                type="submit"
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs text-white shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center space-x-1 ${
                  newType === 'plus' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm</span>
              </button>
            </div>
          </div>
        </form>

        {/* 2 CỘT DANH SÁCH TIÊU CHÍ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto pr-1">
          {/* CỘT 1: KHEN THƯỞNG (+) */}
          <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Tiêu Chí Điểm Cộng (+) ({plusCriteria.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {plusCriteria.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-2 group hover:border-emerald-400 transition"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{c.icon || '🌟'}</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{c.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300">
                      +{c.points}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...c, type: 'plus' })}
                      className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      title="Sửa tiêu chí"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCriteria(c.id, 'plus')}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Xóa tiêu chí"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT 2: NHẮC NHỞ & ĐIỂM TRỪ (-) */}
          <div className="bg-rose-50/30 rounded-2xl p-4 border border-rose-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Tiêu Chí Điểm Trừ (-) ({minusCriteria.length})</span>
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {minusCriteria.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 bg-white rounded-xl border border-rose-200 shadow-2xs flex items-center justify-between gap-2 group hover:border-rose-400 transition"
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <span className="text-xl flex-shrink-0">{c.icon || '⚠️'}</span>
                    <span className="text-xs font-bold text-slate-800 truncate">{c.label}</span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-black text-xs border border-rose-300">
                      -{c.points}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...c, type: 'minus' })}
                      className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Sửa tiêu chí"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCriteria(c.id, 'minus')}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                      title="Xóa tiêu chí"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL CON: SỬA TIÊU CHÍ */}
        {editingItem && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center space-x-2 flex-1 w-full">
              <input
                type="text"
                value={editingItem.icon}
                onChange={(e) => setEditingItem({ ...editingItem, icon: e.target.value })}
                className="w-10 h-10 text-center text-lg bg-white border border-amber-300 rounded-xl"
              />
              <input
                type="text"
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold"
              />
              <input
                type="number"
                min="1"
                max="50"
                value={editingItem.points}
                onChange={(e) => setEditingItem({ ...editingItem, points: e.target.value })}
                className="w-16 px-2 py-2 bg-white border border-amber-300 rounded-xl text-xs font-black text-center"
              />
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs transition cursor-pointer"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* FOOTER ĐÓNG */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            💡 Tiêu chí được lưu tự động và đồng bộ ngay tức thì trên tất cả các màn hình chấm điểm.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
