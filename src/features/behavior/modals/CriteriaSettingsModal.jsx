import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, RotateCcw, Check, Sparkles, Star, AlertTriangle, Settings, ShieldCheck } from 'lucide-react';
import { loadCriteria, saveCriteria, resetCriteriaToDefault, loadBehaviorSettings, saveBehaviorSettings } from '../behaviorStorage';
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
  const [maxKttxBonus, setMaxKttxBonus] = useState(2);
  const [warningMinusThreshold, setWarningMinusThreshold] = useState(3);

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
      const settings = loadBehaviorSettings();
      setMaxKttxBonus(settings.maxKttxBonus || 2);
      setWarningMinusThreshold(settings.warningMinusThreshold || 3);
    }
  }, [isOpen, selectedGrade]);

  const loadData = (grade) => {
    const data = loadCriteria(grade);
    setPlusCriteria(data.plusCriteria || []);
    setMinusCriteria(data.minusCriteria || []);
  };

  const handleUpdateMaxKttx = (val) => {
    playCorrect();
    setMaxKttxBonus(val);
    const settings = loadBehaviorSettings();
    saveBehaviorSettings({ ...settings, maxKttxBonus: val });
    setToastMessage(`✅ Đã lưu mức trần KTTX tối đa: +${val} điểm!`);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleUpdateWarningThreshold = (val) => {
    playCorrect();
    setWarningMinusThreshold(val);
    const settings = loadBehaviorSettings();
    saveBehaviorSettings({ ...settings, warningMinusThreshold: val });
    setToastMessage(`🔔 Đã lưu ngưỡng cảnh báo sớm: Bị trừ từ ${val} điểm trở lên!`);
    setTimeout(() => setToastMessage(''), 2500);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-2 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-2xl sm:rounded-[2rem] w-full max-w-4xl border border-slate-200 shadow-2xl flex flex-col h-[92vh] max-h-[860px] overflow-hidden">
        {/* HEADER MODAL (CỐ ĐỊNH Ở ĐẦU) */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 p-4 sm:p-5 flex-shrink-0 bg-white">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md text-xl flex-shrink-0">
              ⚙️
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                Cài Đặt Tiêu Chí Nề Nếp & Khen Thưởng
              </h2>
              <p className="text-xs text-slate-500 font-semibold truncate hidden sm:block">
                Cấu hình các nội dung cộng, trừ điểm chung tự động áp dụng cho các lớp
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {toastMessage && (
              <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-fade-in hidden sm:inline-block">
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

        {/* THÂN MODAL CUỘN TOÀN DIỆN (SCROLLABLE BODY) */}
        <div 
          className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 pr-2 sm:pr-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          {toastMessage && (
            <div className="sm:hidden text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200 animate-fade-in text-center">
              {toastMessage}
            </div>
          )}

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

          {/* CẤU HÌNH NÂNG CAO: CAP LIMIT & EARLY WARNING XẾP 2 CỘT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* CẤU HÌNH MỨC TRẦN ĐIỂM THƯỞNG KTTX (CAP LIMIT) */}
            <div className="bg-amber-50/80 border border-amber-200 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-sm font-black shadow-xs flex-shrink-0">
                  🎓
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-amber-950 block leading-tight truncate">
                    Mức trần thưởng KTTX (Cap Limit)
                  </span>
                  <span className="text-[11px] text-amber-800 font-medium block mt-0.5 line-clamp-1">
                    Tối đa điểm nề nếp đổi sang điểm KTTX
                  </span>
                </div>
              </div>
              <select
                value={maxKttxBonus}
                onChange={(e) => handleUpdateMaxKttx(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white border border-amber-300 rounded-xl text-xs font-black text-amber-950 outline-hidden cursor-pointer shadow-xs flex-shrink-0"
              >
                <option value={1}>Tối đa +1 đ</option>
                <option value={2}>Tối đa +2 đ (Khuyên dùng)</option>
                <option value={3}>Tối đa +3 đ</option>
                <option value={4}>Tối đa +4 đ</option>
                <option value={5}>Tối đa +5 đ</option>
              </select>
            </div>

            {/* CẤU HÌNH CẢNH BÁO SỚM HỌC SINH BỊ TRỪ ĐIỂM (EARLY WARNING SYSTEM) */}
            <div className="bg-rose-50/70 border border-rose-200 p-3 sm:p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center text-sm font-black shadow-xs flex-shrink-0">
                  🔔
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-black text-rose-950 block leading-tight truncate">
                    Cảnh Báo Sớm 🔔 (Early Warning)
                  </span>
                  <span className="text-[11px] text-rose-800 font-medium block mt-0.5 line-clamp-1">
                    Bật chuông vàng khi HS bị trừ nhiều điểm
                  </span>
                </div>
              </div>
              <select
                value={warningMinusThreshold}
                onChange={(e) => handleUpdateWarningThreshold(Number(e.target.value))}
                className="px-2.5 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-black text-rose-950 outline-hidden cursor-pointer shadow-xs flex-shrink-0"
              >
                <option value={2}>Trừ từ 2 điểm</option>
                <option value={3}>Trừ từ 3 điểm (Khuyên dùng)</option>
                <option value={4}>Trừ từ 4 điểm</option>
                <option value={5}>Trừ từ 5 điểm</option>
              </select>
            </div>
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

          {/* FORM CHỈNH SỬA TIÊU CHÍ (HIỂN THỊ KHI BẤM SỬA) */}
          {editingItem && (
            <div className="p-3.5 sm:p-4 bg-amber-50 rounded-2xl border-2 border-amber-400 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-fade-in">
              <div className="flex items-center space-x-2 flex-1 w-full">
                <span className="text-xs font-black text-amber-900 whitespace-nowrap">Đang sửa:</span>
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
                <div className="flex items-center space-x-1 bg-white px-2 py-1.5 rounded-xl border border-amber-300">
                  <span className="text-xs font-black text-slate-500">{editingItem.type === 'plus' ? '+' : '-'}</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={editingItem.points}
                    onChange={(e) => setEditingItem({ ...editingItem, points: e.target.value })}
                    className="w-12 px-1 py-1 bg-transparent text-xs font-black text-center outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400">điểm</span>
                </div>
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

          {/* 2 CỘT DANH SÁCH TIÊU CHÍ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CỘT 1: KHEN THƯỞNG (+) */}
            <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Tiêu Chí Điểm Cộng (+) ({plusCriteria.length})</span>
                </span>
              </div>

              <div className="space-y-2">
                {plusCriteria.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">Chưa có tiêu chí điểm cộng nào</div>
                ) : (
                  plusCriteria.map((c) => (
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
                  ))
                )}
              </div>
            </div>

            {/* CỘT 2: NHẮC NHỞ & ĐIỂM TRỪ (-) */}
            <div className="bg-rose-50/30 rounded-2xl p-4 border border-rose-200/80 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-rose-200/60">
                <span className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Tiêu Chí Điểm Trừ (-) ({minusCriteria.length})</span>
                </span>
              </div>

              <div className="space-y-2">
                {minusCriteria.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-medium">Chưa có tiêu chí điểm trừ nào</div>
                ) : (
                  minusCriteria.map((c) => (
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
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER ĐÓNG (CỐ ĐỊNH Ở ĐÁY) */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            💡 Tiêu chí được lưu tự động và đồng bộ ngay tức thì trên tất cả các màn hình chấm điểm.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs sm:text-sm transition cursor-pointer shadow-md flex-shrink-0 active:scale-95"
          >
            Hoàn tất & Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
