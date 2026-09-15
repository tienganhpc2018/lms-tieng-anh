import React, { useState, useEffect } from 'react';
import { X, Gift, Plus, Check } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';

const COLOR_OPTIONS = [
  { key: 'amber', label: 'Vàng Hổ Phách', bg: 'bg-amber-400', border: 'border-amber-300' },
  { key: 'sky', label: 'Xanh Da Trời', bg: 'bg-sky-400', border: 'border-sky-300' },
  { key: 'emerald', label: 'Xanh Ngọc Lục', bg: 'bg-emerald-400', border: 'border-emerald-300' },
  { key: 'rose', label: 'Đỏ Hồng Pastel', bg: 'bg-rose-400', border: 'border-rose-300' },
  { key: 'purple', label: 'Tím Hoàng Gia', bg: 'bg-purple-400', border: 'border-purple-300' },
  { key: 'indigo', label: 'Xanh Chàm Đậm', bg: 'bg-indigo-400', border: 'border-indigo-300' },
];

const CATEGORY_OPTIONS = [
  { key: 'stationery', label: 'Dụng cụ học tập' },
  { key: 'souvenir', label: 'Đồ lưu niệm' },
  { key: 'privilege', label: 'Đặc quyền học tập' },
  { key: 'snack', label: 'Bánh kẹo / Đồ ăn nhẹ' },
  { key: 'other', label: 'Khác' },
];

const ICON_PRESETS = [
  { key: 'highlighter', label: 'Bút dạ quang', emoji: '🖍️' },
  { key: 'notebook', label: 'Sổ tay lò xo', emoji: '📓' },
  { key: 'ruler', label: 'Thước kẻ phản quang', emoji: '📐' },
  { key: 'bear', label: 'Móc khóa gấu bông', emoji: '🧸' },
  { key: 'ticket', label: 'Thẻ đặc quyền', emoji: '🎟️' },
  { key: 'pen', label: 'Bút gel bấm', emoji: '🖊️' },
];

export default function AddEditGiftModal({ isOpen, onClose, giftToEdit, onSaveGift }) {
  const [name, setName] = useState('');
  const [requiredCoins, setRequiredCoins] = useState(10);
  const [stock, setStock] = useState(20);
  const [category, setCategory] = useState('stationery');
  const [color, setColor] = useState('amber');
  const [iconKey, setIconKey] = useState('highlighter');
  const [redemptionLimit, setRedemptionLimit] = useState('none');

  useEffect(() => {
    if (giftToEdit) {
      setName(giftToEdit.name || '');
      setRequiredCoins(giftToEdit.requiredCoins || 10);
      setStock(giftToEdit.stock ?? 20);
      setCategory(giftToEdit.category || 'stationery');
      setColor(giftToEdit.color || 'amber');
      setIconKey(giftToEdit.iconKey || 'highlighter');
      setRedemptionLimit(giftToEdit.redemptionLimit || 'none');
    } else {
      setName('');
      setRequiredCoins(10);
      setStock(20);
      setCategory('stationery');
      setColor('amber');
      setIconKey('highlighter');
      setRedemptionLimit('none');
    }
  }, [giftToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Vui lòng nhập tên phần quà!');
      return;
    }

    playCorrect();
    const giftData = {
      ...(giftToEdit || {}),
      id: giftToEdit?.id || `gift-${Date.now()}`,
      name: name.trim(),
      requiredCoins: Math.max(1, Number(requiredCoins)),
      stock: Math.max(0, Number(stock)),
      category,
      color,
      iconKey,
      redemptionLimit,
      updatedAt: new Date().toISOString(),
    };

    onSaveGift(giftData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-[2rem] w-full max-w-lg border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl">
              🎁
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {giftToEdit ? 'Chỉnh Sửa Phần Quà' : 'Thêm Phần Quà Mới Vào Kho'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">Cấu hình giá xu, số lượng và danh mục quà</p>
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
              Tên Món Quà *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Bút highlight dạ quang pastel..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Giá Đổi (Xu) *
              </label>
              <input
                type="number"
                min={1}
                max={500}
                required
                value={requiredCoins}
                onChange={(e) => setRequiredCoins(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-black text-xs text-amber-600 focus:bg-white focus:border-rose-500 outline-hidden transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Số Lượng Tồn Kho *
              </label>
              <input
                type="number"
                min={0}
                max={1000}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Danh Mục Quà
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden transition cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 mb-1 uppercase tracking-wider">
                Giới Hạn Đổi
              </label>
              <select
                value={redemptionLimit}
                onChange={(e) => setRedemptionLimit(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden transition cursor-pointer"
              >
                <option value="none">Không giới hạn</option>
                <option value="week">Tối đa 1 lần/tuần</option>
                <option value="month">Tối đa 1 lần/tháng</option>
              </select>
            </div>
          </div>

          {/* CHỌN MẪU BIỂU TƯỢNG */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
              Biểu Tượng Hoạt Hình
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ICON_PRESETS.map((ic) => (
                <button
                  key={ic.key}
                  type="button"
                  onClick={() => setIconKey(ic.key)}
                  className={`p-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    iconKey === ic.key
                      ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-base">{ic.emoji}</span>
                  <span className="truncate">{ic.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MÀU VIỀN THẺ CHỦ ĐỀ */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5 uppercase tracking-wider">
              Màu Viền Thẻ Quà
            </label>
            <div className="flex items-center space-x-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setColor(c.key)}
                  className={`w-7 h-7 rounded-full border-2 transition cursor-pointer ${c.bg} ${
                    color === c.key ? 'scale-115 border-slate-950 shadow-md ring-2 ring-white' : 'border-transparent opacity-75'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
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
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white text-xs font-black rounded-xl shadow-md transition cursor-pointer flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{giftToEdit ? 'Lưu Thay Đổi' : 'Thêm Vào Kho Quà'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
