import React from 'react';
import { 
  X, Square, Circle, Triangle, Minus, ArrowRight, PaintBucket, CircleDot, Sun, 
  CheckCircle, XCircle, Heart, Smile, Frown, Star, Crown, ThumbsUp 
} from 'lucide-react';

export default function ShapesModulePanel({
  isOpen,
  onClose,
  strokeColor,
  setStrokeColor,
  fillColor,
  setFillColor,
  hasFill,
  setHasFill,
  strokeWidth,
  setStrokeWidth,
  opacity,
  setOpacity,
  isDashed,
  setIsDashed,
  onSelectShape,
  activeObject,
  fabricCanvas
}) {
  if (!isOpen) return null;

  const colorPalette = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#ec4899', '#ffffff', '#09090b', '#71717a', '#a78bfa', '#4ade80', '#fde047'
  ];

  const handleStrokeWidthChange = (val) => {
    setStrokeWidth(val);
    if (activeObject && fabricCanvas) {
      activeObject.set('strokeWidth', Number(val));
      fabricCanvas.renderAll();
    }
  };

  const handleStrokeColorChange = (c) => {
    setStrokeColor(c);
    if (activeObject && fabricCanvas) {
      activeObject.set('stroke', c);
      fabricCanvas.renderAll();
    }
  };

  const handleFillColorChange = (c) => {
    setFillColor(c);
    if (activeObject && fabricCanvas) {
      activeObject.set('fill', hasFill ? c : 'transparent');
      fabricCanvas.renderAll();
    }
  };

  const handleToggleHasFill = () => {
    const nextHasFill = !hasFill;
    setHasFill(nextHasFill);
    if (activeObject && fabricCanvas) {
      activeObject.set('fill', nextHasFill ? fillColor : 'transparent');
      fabricCanvas.renderAll();
    }
  };

  const handleToggleDashed = () => {
    const nextDashed = !isDashed;
    if (setIsDashed) setIsDashed(nextDashed);
    if (activeObject && fabricCanvas) {
      activeObject.set('strokeDashArray', nextDashed ? [8, 8] : null);
      fabricCanvas.renderAll();
    }
  };

  const handleShapeClick = (shapeType) => {
    onSelectShape(shapeType);
    onClose();
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-[#ded8be] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-2.5 w-[360px] font-sans text-slate-900 animate-scale-up">
      {/* HEADER POPUP SHAPES NHỎ GỌN */}
      <div className="flex justify-between items-center border-b border-[#c8c0a3] pb-1.5 mb-2">
        <h3 className="font-extrabold text-xs text-slate-800 tracking-wide flex items-center space-x-1">
          <Square className="w-3.5 h-3.5 text-purple-700" />
          <span>Shapes & Biểu Tượng Chấm Bài</span>
        </h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-[#c8c0a3] hover:bg-[#b8af91] flex items-center justify-center text-slate-800 transition cursor-pointer text-xs font-bold"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* BỐ CỤC 2 CỘT */}
      <div className="flex gap-2">
        <div className="flex-1 space-y-2">
          {/* LƯỚI KHỐI HÌNH HỌC */}
          <span className="text-[10px] font-extrabold text-slate-700 block">Hình Học:</span>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => handleShapeClick('rect')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Vuông"
            >
              <Square className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-[8px] font-bold mt-0.5">Vuông</span>
            </button>

            <button
              onClick={() => handleShapeClick('circle')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Tròn"
            >
              <Circle className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-[8px] font-bold mt-0.5">Tròn</span>
            </button>

            <button
              onClick={() => handleShapeClick('oval')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Bầu Dục"
            >
              <div className="w-3.5 h-2 border-2 border-slate-900 rounded-full" />
              <span className="text-[8px] font-bold mt-0.5">Bầu Dục</span>
            </button>

            <button
              onClick={() => handleShapeClick('triangle')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Tam Giác"
            >
              <Triangle className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-[8px] font-bold mt-0.5">Tam Giác</span>
            </button>

            <button
              onClick={() => handleShapeClick('line')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Đường Thẳng"
            >
              <Minus className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-[8px] font-bold mt-0.5">Thẳng</span>
            </button>

            <button
              onClick={() => handleShapeClick('arrow')}
              className="p-1 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Mũi Tên"
            >
              <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
              <span className="text-[8px] font-bold mt-0.5">Mũi Tên</span>
            </button>
          </div>

          {/* LƯỚI ICONS CHẤM BÀI DỄ THƯƠNG DÀNH CHO HỌC SINH THEO CHỈ ĐẠO THẦY HẢI */}
          <span className="text-[10px] font-extrabold text-amber-900 block pt-1 border-t border-[#c8c0a3]">
            🎯 Stickers & Biểu Tượng Chấm Bài (Vừa Hàng Chữ):
          </span>
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => handleShapeClick('check')}
              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-600 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Tick Xanh (Vừa dải chữ)"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-[9px] text-emerald-900 font-extrabold mt-0.5">Tick</span>
            </button>

            <button
              onClick={() => handleShapeClick('cross')}
              className="p-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-600 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="X Đỏ (Vừa dải chữ)"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-[9px] text-rose-900 font-extrabold mt-0.5">X Đỏ</span>
            </button>

            <button
              onClick={() => handleShapeClick('heart')}
              className="p-1.5 bg-pink-100 hover:bg-pink-200 border border-pink-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Trái Tim Dễ Thương"
            >
              <Heart className="w-4 h-4 text-pink-600 fill-pink-500" />
              <span className="text-[9px] text-pink-900 font-extrabold mt-0.5">Tim ❤️</span>
            </button>

            <button
              onClick={() => handleShapeClick('smile')}
              className="p-1.5 bg-amber-100 hover:bg-amber-200 border border-amber-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Mặt Cười Vui Vẻ"
            >
              <Smile className="w-4 h-4 text-amber-600" />
              <span className="text-[9px] text-amber-900 font-extrabold mt-0.5">Cười 😊</span>
            </button>

            <button
              onClick={() => handleShapeClick('frown')}
              className="p-1.5 bg-sky-100 hover:bg-sky-200 border border-sky-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Mặt Buồn / Khóc"
            >
              <Frown className="w-4 h-4 text-sky-600" />
              <span className="text-[9px] text-sky-900 font-extrabold mt-0.5">Khóc 😢</span>
            </button>

            <button
              onClick={() => handleShapeClick('star')}
              className="p-1.5 bg-yellow-100 hover:bg-yellow-200 border border-yellow-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Ngôi Sao Khen Thưởng"
            >
              <Star className="w-4 h-4 text-yellow-600 fill-yellow-400" />
              <span className="text-[9px] text-yellow-900 font-extrabold mt-0.5">Sao ⭐</span>
            </button>

            <button
              onClick={() => handleShapeClick('crown')}
              className="p-1.5 bg-purple-100 hover:bg-purple-200 border border-purple-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Vương Miện Giỏi Nhất"
            >
              <Crown className="w-4 h-4 text-purple-600 fill-purple-400" />
              <span className="text-[9px] text-purple-900 font-extrabold mt-0.5">Vương Miện</span>
            </button>

            <button
              onClick={() => handleShapeClick('thumbsUp')}
              className="p-1.5 bg-blue-100 hover:bg-blue-200 border border-blue-500 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Ngón Tay Like"
            >
              <ThumbsUp className="w-4 h-4 text-blue-600" />
              <span className="text-[9px] text-blue-900 font-extrabold mt-0.5">Like 👍</span>
            </button>
          </div>

          {/* THANH TRƯỢT ĐỘ DÀY VIỀN & ĐỘ TRONG SUỐT GỌI GÀNG */}
          <div className="bg-[#d2caa9] p-2 rounded-xl border border-[#c8c0a3] space-y-1 text-[10px] font-extrabold">
            <div className="flex justify-between items-center">
              <span>Nét Stroke: <strong className="text-sky-800">{strokeWidth}px</strong></span>
              <button
                type="button"
                onClick={handleToggleDashed}
                className={`px-1.5 py-0.5 rounded border text-[9px] transition ${
                  isDashed ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-800'
                }`}
              >
                {isDashed ? 'Viền Nét Đứt' : 'Viền Nét Liền'}
              </button>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={strokeWidth}
              onChange={(e) => handleStrokeWidthChange(e.target.value)}
              className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-sky-600"
            />

            <div className="flex justify-between items-center pt-1 border-t border-[#c8c0a3]">
              <span>Màu Nền Fill:</span>
              <button
                type="button"
                onClick={handleToggleHasFill}
                className={`px-1.5 py-0.5 rounded border text-[9px] transition ${
                  hasFill ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {hasFill ? '☑️ Có Nền' : '🚫 Trong Suốt (Nền Mặc Định)'}
              </button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: THANH MÀU XẾP DỌC TINH TẾ THEO YÊU CẦU THẦY HẢI */}
        <div className="flex flex-col items-center gap-1 p-1 bg-[#d2caa9] rounded-xl border border-[#c8c0a3] max-h-[220px] overflow-y-auto">
          <span className="text-[8px] font-black uppercase text-slate-700">Màu</span>
          {colorPalette.map((c, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                handleStrokeColorChange(c);
                if (hasFill) handleFillColorChange(c);
              }}
              style={{ backgroundColor: c }}
              className={`w-4 h-4 rounded-full border border-slate-300 shadow-2xs transition transform hover:scale-125 cursor-pointer ${
                strokeColor === c ? 'ring-2 ring-slate-900 scale-110' : ''
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
