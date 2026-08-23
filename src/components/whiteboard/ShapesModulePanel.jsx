import React from 'react';
import { X, Square, Circle, Triangle, Minus, ArrowRight, PaintBucket, CircleDot, Sun, CheckCircle, XCircle } from 'lucide-react';

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

  // Bảng màu tinh gọn 14 màu sặc sỡ chuẩn nhất
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

  // KHI NGƯỜI DÙNG CLICK CHỌN 1 SHAPE ➔ TỰ ĐỘNG ĐÓNG POPUP ĐỂ TRẢ LẠI MÀN HÌNH QUAN SÁT VẼ THEO YÊU CẦU THẦY HẢI
  const handleShapeClick = (shapeType) => {
    onSelectShape(shapeType);
    onClose(); // Tự động ẩn popup!
  };

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-[#ded8be] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-2.5 w-[330px] font-sans text-slate-900 animate-scale-up">
      {/* HEADER POPUP SHAPES NHỎ GỌN */}
      <div className="flex justify-between items-center border-b border-[#c8c0a3] pb-1.5 mb-2">
        <h3 className="font-extrabold text-xs text-slate-800 tracking-wide flex items-center space-x-1">
          <Square className="w-3.5 h-3.5 text-purple-700" />
          <span>Shapes (Công Cụ Hình Học)</span>
        </h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full bg-[#c8c0a3] hover:bg-[#b8af91] flex items-center justify-center text-slate-800 transition cursor-pointer text-xs font-bold"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* BỐ CỤC 2 CỘT: CỘT TRÁI CHỨA CÁC SHAPES & CỘT PHẢI CHỨA THANH MÀU DỌC GỌN GÀNG */}
      <div className="flex gap-2">
        {/* CỘT TRÁI: GRID SHAPES & THANH TRƯỢT */}
        <div className="flex-1 space-y-2">
          {/* GRID ICONS DẠNG KHỐI HÌNH HỌC & TICK XANH / X ĐỎ */}
          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={() => handleShapeClick('rect')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Vuông"
            >
              <Square className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-bold mt-0.5">Vuông</span>
            </button>

            <button
              onClick={() => handleShapeClick('circle')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Tròn"
            >
              <Circle className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-bold mt-0.5">Tròn</span>
            </button>

            <button
              onClick={() => handleShapeClick('oval')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Bầu Dục"
            >
              <div className="w-4 h-2.5 border-2 border-slate-900 rounded-full" />
              <span className="text-[9px] font-bold mt-0.5">Bầu Dục</span>
            </button>

            <button
              onClick={() => handleShapeClick('triangle')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Tam Giác"
            >
              <Triangle className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-bold mt-0.5">Tam Giác</span>
            </button>

            <button
              onClick={() => handleShapeClick('line')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Đường Thẳng"
            >
              <Minus className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-bold mt-0.5">Thẳng</span>
            </button>

            <button
              onClick={() => handleShapeClick('arrow')}
              className="p-1.5 bg-[#ded8be] hover:bg-[#c8c0a3] rounded-lg border border-slate-500 flex flex-col items-center justify-center transition cursor-pointer"
              title="Mũi Tên"
            >
              <ArrowRight className="w-4 h-4 text-slate-900" />
              <span className="text-[9px] font-bold mt-0.5">Mũi Tên</span>
            </button>

            <button
              onClick={() => handleShapeClick('check')}
              className="p-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-600 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="Tick Xanh"
            >
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-[9px] text-emerald-900 font-extrabold mt-0.5">Tick</span>
            </button>

            <button
              onClick={() => handleShapeClick('cross')}
              className="p-1.5 bg-rose-100 hover:bg-rose-200 border border-rose-600 rounded-lg flex flex-col items-center justify-center transition cursor-pointer"
              title="X Đỏ"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span className="text-[9px] text-rose-900 font-extrabold mt-0.5">X Đỏ</span>
            </button>
          </div>

          {/* THANH TRƯỢT ĐỘ DÀY VIỀN & ĐỘ TRONG SUỐT GỌI GÀNG */}
          <div className="bg-[#d2caa9] p-2 rounded-xl border border-[#c8c0a3] space-y-1.5 text-[10px] font-extrabold">
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
        <div className="flex flex-col items-center gap-1 p-1 bg-[#d2caa9] rounded-xl border border-[#c8c0a3] max-h-[170px] overflow-y-auto">
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
