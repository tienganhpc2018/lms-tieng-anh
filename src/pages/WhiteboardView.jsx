import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Pencil, Eraser, Move, Type, Square, Circle, Triangle, Undo, Redo, 
  Trash2, Image as ImageIcon, Save, FolderOpen, ArrowLeft, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Dices, Link as LinkIcon, Grid, Layout, 
  Maximize2, Minimize2, Sparkles, X, Play, RotateCcw, Volume2, Ruler, 
  Highlighter, Bold, Italic, Underline, Search, ZoomIn, ZoomOut, Check, ChevronLeft, ChevronRight,
  Layers, Lock, Unlock, Copy, Scissors, ArrowUp, ArrowDown, BookOpen
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Quản lý Slide Trang Bảng (Pages)
  const [pagesData, setPagesData] = useState(['']);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Công cụ active: 'select' | 'hand' | 'pen' | 'highlighter' | 'eraser' | 'shape_rect' | 'shape_circle' | 'text'
  const [tool, setTool] = useState('text'); // Mặc định chế độ gõ văn bản
  const [color, setColor] = useState('#dc2626'); // Màu đỏ mặc định (như Ảnh 4)
  const [fontSize, setFontSize] = useState(26);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // GÕ VĂN BẢN TRỰC TIẾP NHẢY TRỎ CHUỘT NGAY TẠI BẢNG (INLINE LIVE TEXT BOX - ẢNH 4)
  const [inlineTextBoxes, setInlineTextBoxes] = useState([]);
  const [activeTextId, setActiveTextId] = useState(null);

  // ẢNH BÀI TẬP VÀ ĐỐI TƯỢNG TƯƠNG TÁC (IMAGES & OBJECT LAYERS - ẢNH 5)
  const [placedObjects, setPlacedObjects] = useState([]);
  const [selectedObjectId, setSelectedObjectId] = useState(null);

  // Trạng thái trượt Pan Bàn Tay (Move Hand Drag)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Trạng thái vẽ Canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Background Nền Bảng: 'blank' | 'grid' | 'greenboard'
  const [bgType, setBgType] = useState('blank');

  // Trạng thái Magic Box Windows Popups
  const [activeWindow, setActiveWindow] = useState(null); // null | 'shapes' | 'tools' | 'save' | 'picker' | 'timer'

  // Vòng Quay Gọi Tên Học Sinh (Có ô dán danh sách)
  const [rawStudentInput, setRawStudentInput] = useState(
    "Nguyễn Minh Hoàng\nĐinh Thành Nhơn\nĐoàn Ngọc Khánh Dương\nHà Nguyễn Minh Thư\nĐinh Trần Thảo Ngân"
  );
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Đồng Hồ Đếm Ngược
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  // Quản lý Lưu Bài Dạy Theo Unit
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  // Palette 24 Màu Sắc Rực Rỡ Nguyên Bản Ảnh 2
  const colorPalette = [
    '#ff0000', '#ff8700', '#ffd300', '#00a83e', '#0026a8', '#670014', '#ffffff', '#000000',
    '#ff66a1', '#ff944d', '#ffe680', '#80ffaa', '#6680ff', '#b366ff', '#808080', '#4d4d4d',
    '#ffb3d1', '#ffd9b3', '#ffffcc', '#d9ffb3', '#80d4ff', '#d9b3ff', '#cccccc', '#333333'
  ];

  // Khởi tạo Canvas & Lắng nghe Sự kiện Paste Snipping Tool (Ctrl + V)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    saveCanvasState();

    // LẮNG NGHE SỰ KIỆN PASTE TỪ SNIPPING TOOL (CTRL + V CHỤP BÀI TẬP DÁN VÀO)
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (event) => {
            const newObj = {
              id: 'img_' + Date.now(),
              type: 'image',
              src: event.target.result,
              x: 200 - panOffset.x,
              y: 150 - panOffset.y,
              width: 500,
              height: 350,
              zIndex: placedObjects.length + 1,
            };
            setPlacedObjects((prev) => [...prev, newObj]);
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [panOffset, placedObjects]);

  // Đếm ngược Timer
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // LƯU & KHÔI PHỤC VẼ CANVAS THEO TRANG
  const saveCurrentPageData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setPagesData((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = dataUrl;
      return copy;
    });
  };

  const loadPageData = (index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const targetData = pagesData[index];
    if (targetData) {
      const img = new Image();
      img.src = targetData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      saveCurrentPageData();
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      setTimeout(() => loadPageData(newIndex), 50);
    }
  };

  const handleNextPage = () => {
    saveCurrentPageData();
    const newIndex = currentPageIndex + 1;
    if (newIndex >= pagesData.length) {
      setPagesData([...pagesData, '']);
    }
    setCurrentPageIndex(newIndex);
    setTimeout(() => loadPageData(newIndex), 50);
  };

  const handleAddNewPage = () => {
    saveCurrentPageData();
    const newIndex = pagesData.length;
    setPagesData([...pagesData, '']);
    setCurrentPageIndex(newIndex);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // QUẢN LÝ UNDO / REDO
  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, dataUrl]);
    setHistoryStep(newHistory.length);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      const newStep = historyStep - 1;
      setHistoryStep(newStep);
      restoreCanvasState(history[newStep]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      const newStep = historyStep + 1;
      setHistoryStep(newStep);
      restoreCanvasState(history[newStep]);
    }
  };

  const restoreCanvasState = (dataUrl) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  // NHẤP CHUỘT VÀO BẢNG TẠO Ô GÕ TRỰC TIẾP (INLINE LIVE TEXT BOX - ẢNH 4)
  const handleCanvasClick = (e) => {
    if (tool === 'text') {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;

      const newBox = {
        id: 'text_' + Date.now(),
        x,
        y,
        text: '',
        color: color,
        fontSize: fontSize,
        isBold: isBold,
        isItalic: isItalic,
        isUnderline: isUnderline,
      };

      setInlineTextBoxes([...inlineTextBoxes, newBox]);
      setActiveTextId(newBox.id);
    } else if (tool === 'hand') {
      // Pan Hand Mouse Down
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else {
      startDrawing(e);
    }
  };

  // XỬ LÝ TRƯỢT BẢN TAY PAN DRAG 4 HƯỚNG
  const handleMouseMoveGlobal = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isDrawing) {
      draw(e);
    }
  };

  const handleMouseUpGlobal = (e) => {
    if (isPanning) {
      setIsPanning(false);
    } else if (isDrawing) {
      stopDrawing(e);
    }
  };

  // CANVAS DRAWING LOGIC
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    setIsDrawing(true);
    setStartPos({ x, y });
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;
    const ctx = canvas.getContext('2d');

    if (tool === 'pen') {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'highlighter') {
      ctx.strokeStyle = color === '#000000' ? '#f59e0b' : color;
      ctx.lineWidth = 24;
      ctx.globalAlpha = 0.35;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(x - lineWidth * 4, y - lineWidth * 4, lineWidth * 8, lineWidth * 8);
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;

    if (tool === 'shape_rect' && e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      ctx.strokeStyle = color === '#000000' ? '#dc2626' : color;
      ctx.lineWidth = 3;
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    } else if (tool === 'shape_circle' && e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.strokeStyle = color === '#000000' ? '#2563eb' : color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveCanvasState();
  };

  // QUẢN LÝ THỨ TỰ LỚP (LAYER Z-INDEX - ẢNH 5)
  const bringToFront = (id) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, zIndex: prev.length + 10 } : obj))
    );
  };

  const sendToBack = (id) => {
    setPlacedObjects((prev) =>
      prev.map((obj) => (obj.id === id ? { ...obj, zIndex: 1 } : obj))
    );
  };

  const deleteObject = (id) => {
    setPlacedObjects((prev) => prev.filter((obj) => obj.id !== id));
  };

  // VÒNG QUAY GỌI TÊN HỌC SINH
  const spinRandomStudent = () => {
    const list = rawStudentInput.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
    if (list.length === 0) {
      alert('Vui lòng dán danh sách học sinh vào ô bên dưới!');
      return;
    }

    setIsSpinning(true);
    setSelectedStudent('');
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * list.length);
      setSelectedStudent(list[idx]);
      count++;
      if (count > 25) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 90);
  };

  // LƯU BÀI DẠY VÀO SUPABASE CSDL THEO UNIT
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    saveCurrentPageData();
    try {
      const payload = {
        unit: selectedUnit,
        title: lessonTitle.trim() || 'Bài Giảng Tiếng Anh',
        teacher_id: user?.id,
        content: JSON.stringify(pagesData),
        created_at: new Date().toISOString(),
      };

      await supabase.from('activities').insert([
        {
          title: `[WHITEBOARD: ${selectedUnit}] ${lessonTitle.trim()}`,
          type: 'resource',
          content: JSON.stringify(pagesData),
        },
      ]);

      alert(`🎉 ĐÃ LƯU BÀI DẠY THEO UNiT VÀO HỆ THỐNG THÀNH CÔNG!\n\n• Unit: ${selectedUnit}\n• Tên bài: ${lessonTitle}`);
      setActiveWindow(null);
    } catch (err) {
      alert('Lỗi lưu bài dạy: ' + err.message);
    } finally {
      setSavingLesson(false);
    }
  };

  // Clear sạch bảng
  const clearCurrentCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setInlineTextBoxes([]);
    setPlacedObjects([]);
    saveCanvasState();
  };

  return (
    <div
      onMouseMove={handleMouseMoveGlobal}
      onMouseUp={handleMouseUpGlobal}
      className={`min-h-screen relative font-sans select-none overflow-hidden ${
        bgType === 'greenboard' 
          ? 'bg-emerald-950' 
          : bgType === 'grid' 
          ? 'bg-white bg-grid-pattern' 
          : 'bg-white'
      }`}
    >
      {/* HEADER BAR CHUẨN MYVIEWBOARD (ẢNH 1) */}
      <div className="bg-[#d5ceb3] text-slate-800 px-4 py-2 flex justify-between items-center border-b border-[#b8af91] shadow-xs text-xs font-bold z-40 relative">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-[#c4bb9c] rounded-lg transition flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Bảng</span>
          </button>
          <span className="text-rose-700 font-extrabold tracking-wider">myViewBoard LMS</span>
          <span className="text-slate-600 font-mono">| {selectedUnit} • {lessonTitle}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Nút 💾 Lưu Bài Dạy */}
          <button
            onClick={() => setActiveWindow('save')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center space-x-1 border border-emerald-600/40"
          >
            <Save className="w-4 h-4" />
            <span>💾 Lưu Bài Dạy (Theo Unit)</span>
          </button>

          {/* Đổi Nền Bảng */}
          <button
            onClick={() => setBgType(bgType === 'blank' ? 'grid' : bgType === 'grid' ? 'greenboard' : 'blank')}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-lg border flex items-center space-x-1 shadow-2xs"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nền: {bgType === 'blank' ? 'Trơn' : bgType === 'grid' ? 'Kẻ Ôly' : 'Bảng Xanh'}</span>
          </button>

          <span className="px-3 py-1 bg-[#eae5d2] rounded-lg border font-mono">
            {new Date().toLocaleDateString('vi-VN')} • Trang {currentPageIndex + 1}/{pagesData.length}
          </span>
        </div>
      </div>

      {/* CONTAINER DỌC TRƯỢT VÔ TẬN VỚI PAN OFFSET */}
      <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }} className="relative w-full h-full">
        {/* CANVAS VẼ CHÍNH */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasClick}
          className="w-full h-[calc(100vh-110px)] cursor-text block"
        />

        {/* DẠNG GÕ VĂN BẢN TRỰC TIẾP NHẢY TRỎ CHUỘT VỚI ENTER XUỐNG HÀNG (ẢNH 4) */}
        {inlineTextBoxes.map((box) => (
          <div
            key={box.id}
            style={{ left: box.x, top: box.y }}
            className="absolute z-30 group"
          >
            {/* TOOLBAR ĐỊNH DẠNG TEXT ATTACHED PHÍA TRÊN (ẢNH 4) */}
            {activeTextId === box.id && (
              <div className="absolute -top-12 left-0 bg-[#e4dec3] border border-[#b8af91] rounded-xl p-1 shadow-lg flex items-center space-x-1 z-40 text-xs font-bold animate-fade-in">
                <button onClick={() => setIsBold(!isBold)} className={`p-1 rounded ${isBold ? 'bg-emerald-600 text-white' : 'bg-white'}`}><Bold className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsItalic(!isItalic)} className={`p-1 rounded ${isItalic ? 'bg-emerald-600 text-white' : 'bg-white'}`}><Italic className="w-3.5 h-3.5" /></button>
                <button onClick={() => setIsUnderline(!isUnderline)} className={`p-1 rounded ${isUnderline ? 'bg-emerald-600 text-white' : 'bg-white'}`}><Underline className="w-3.5 h-3.5" /></button>
                <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="p-1 text-[11px] bg-white border rounded">
                  <option value={18}>18px</option>
                  <option value={26}>26px</option>
                  <option value={36}>36px</option>
                  <option value={48}>48px</option>
                </select>
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-5 h-5 rounded cursor-pointer border-none" />
                <button onClick={() => setInlineTextBoxes(inlineTextBoxes.filter((b) => b.id !== box.id))} className="p-1 text-rose-600 hover:bg-rose-100 rounded"><X className="w-3.5 h-3.5" /></button>
              </div>
            )}

            {/* Ô TEXTAREA NHẢY TRỎ CHUỘT NHẬP TRỰC TIẾP CÓ ENTER XUỐNG DÒNG (ẢNH 4) */}
            <textarea
              autoFocus
              rows={2}
              value={box.text}
              onClick={() => setActiveTextId(box.id)}
              onChange={(e) => {
                const val = e.target.value;
                setInlineTextBoxes(inlineTextBoxes.map((b) => (b.id === box.id ? { ...b, text: val } : b)));
              }}
              style={{
                color: color,
                fontSize: `${fontSize}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
              }}
              placeholder="Gõ văn bản bài giảng..."
              className="bg-transparent border-2 border-sky-400 focus:border-emerald-600 rounded-lg p-2 outline-none resize min-w-[250px] font-sans shadow-xs"
            />
          </div>
        ))}

        {/* ẢNH BÀI TẬP CHỤP SNIPPING TOOL / ĐỐI TƯỢNG VỚI MENU CONTEXT LAYER (ẢNH 5) */}
        {placedObjects.map((obj) => (
          <div
            key={obj.id}
            style={{ left: obj.x, top: obj.y, zIndex: obj.zIndex || 10 }}
            onClick={() => setSelectedObjectId(obj.id)}
            className={`absolute group cursor-move ${selectedObjectId === obj.id ? 'ring-2 ring-emerald-500 rounded-xl p-1 bg-white/40' : ''}`}
          >
            {/* CONTEXT MENU QUẢN LÝ LỚP LAYER (ẢNH 5) */}
            {selectedObjectId === obj.id && (
              <div className="absolute -top-12 right-0 bg-white border border-slate-300 rounded-xl shadow-2xl p-1 flex items-center space-x-1 z-50 text-xs font-bold animate-fade-in">
                <button onClick={() => bringToFront(obj.id)} title="Đưa lên lớp trên cùng" className="p-1 hover:bg-slate-100 rounded text-slate-700"><ArrowUp className="w-4 h-4 text-emerald-600" /></button>
                <button onClick={() => sendToBack(obj.id)} title="Đưa xuống lớp dưới cùng" className="p-1 hover:bg-slate-100 rounded text-slate-700"><ArrowDown className="w-4 h-4 text-sky-600" /></button>
                <button onClick={() => deleteObject(obj.id)} title="Xóa ảnh này" className="p-1 hover:bg-rose-100 rounded text-rose-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}

            {obj.type === 'image' && (
              <img src={obj.src} alt="Snipped task" className="max-w-xl max-h-[500px] object-contain rounded-xl shadow-md border" />
            )}
          </div>
        ))}
      </div>

      {/* POPUP BẢNG MÀU & SHAPES KHOANH TRÒN NGUYÊN BẢN (ẢNH 2) */}
      {activeWindow === 'shapes' && (
        <div className="absolute top-16 right-16 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-4 w-80 space-y-4 animate-scale-up">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-xs text-slate-800">
            <span>Shapes & Palette Options (Ảnh 2)</span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 block">Bảng 24 Màu Sắc Bút & Hình Khối:</span>
            <div className="grid grid-cols-8 gap-1.5">
              {colorPalette.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border border-slate-300 shadow-2xs transition transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-emerald-600 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2 border-t pt-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">Khoanh Vùng Công Thức & Đáp Án:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <button
                onClick={() => { setTool('shape_rect'); setActiveWindow(null); }}
                className="p-2 bg-white hover:bg-rose-50 border border-rose-300 rounded-xl text-rose-800 flex items-center space-x-1 justify-center"
              >
                <Square className="w-4 h-4" />
                <span>Khung Đỏ</span>
              </button>
              <button
                onClick={() => { setTool('shape_circle'); setActiveWindow(null); }}
                className="p-2 bg-white hover:bg-sky-50 border border-sky-300 rounded-xl text-sky-800 flex items-center space-x-1 justify-center"
              >
                <Circle className="w-4 h-4" />
                <span>Khoanh Tròn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP HỘP CÔNG CỤ DẠY HỌC ĐA NĂNG MAGIC BOX */}
      {activeWindow === 'tools' && (
        <div className="absolute top-16 right-16 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-5 w-[420px] space-y-4 animate-scale-up">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-sm text-slate-900">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Hộp Công Cụ Giảng Dạy Đa Năng (Magic Box)</span>
            </span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <button
              onClick={() => setActiveWindow('timer')}
              className="p-3 bg-white hover:bg-amber-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Clock className="w-6 h-6 text-amber-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Đồng Hồ</span>
            </button>

            <button
              onClick={() => setActiveWindow('picker')}
              className="p-3 bg-white hover:bg-purple-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Dices className="w-6 h-6 text-purple-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Gọi Tên HS</span>
            </button>
          </div>
        </div>
      )}

      {/* POPUP LƯU BÀI DẠY THEO UNIT */}
      {activeWindow === 'save' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border border-slate-200 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-emerald-700">
              <Save className="w-5 h-5" />
              <span>💾 LƯU BÀI DẠY VÀO HỆ THỐNG</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Chọn Unit bài giảng:
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-extrabold bg-slate-50 text-slate-900"
              >
                <option value="Unit 1: Local Community">Unit 1: Local Community</option>
                <option value="Unit 2: City Life">Unit 2: City Life</option>
                <option value="Unit 3: Healthy Living">Unit 3: Healthy Living</option>
                <option value="Unit 4: Remembering the Past">Unit 4: Remembering the Past</option>
                <option value="Unit 5: Our Experiences">Unit 5: Our Experiences</option>
                <option value="Unit 6: Vietnams Heritage">Unit 6: Vietnam's Heritage</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 uppercase mb-1">
                Tên bài giảng:
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="VD: Getting Started - Vocabulary"
                className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button onClick={() => setActiveWindow(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
                Hủy
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={savingLesson}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                {savingLesson ? 'Đang Lưu...' : '🚀 XÁC NHẬN LƯU BÀI DẠY'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP VÒNG QUAY GỌI TÊN HỌC SINH (CÓ Ô DÁN DANH SÁCH CHUẨN) */}
      {activeWindow === 'picker' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-[420px] space-y-4 border border-slate-700 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-purple-400">
              <Dices className="w-5 h-5" />
              <span>Vòng Quay Gọi Tên Học Sinh Ngẫu Nhiên</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-300 uppercase mb-1">
                Dán / Nhập Danh Sách Học Sinh (Mỗi HS 1 Dòng):
              </label>
              <textarea
                rows={4}
                value={rawStudentInput}
                onChange={(e) => setRawStudentInput(e.target.value)}
                className="w-full p-2.5 border border-slate-700 bg-slate-950 text-slate-200 rounded-xl text-xs font-medium"
              />
            </div>

            <div className="p-4 bg-purple-950/80 rounded-2xl border border-purple-500/40 min-h-[70px] flex items-center justify-center text-center">
              <span className={`text-xl font-extrabold ${isSpinning ? 'animate-pulse text-amber-300' : 'text-purple-200'}`}>
                {selectedStudent || 'Bấm nút để quay ngẫu nhiên!'}
              </span>
            </div>

            <button
              onClick={spinRandomStudent}
              disabled={isSpinning}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition uppercase tracking-wider"
            >
              {isSpinning ? '🎲 Đang Quay Gọi Tên...' : '🚀 QUAY GỌI TÊN HỌC SINH'}
            </button>
          </div>
        </div>
      )}

      {/* THANH TOOLBAR DƯỚI CÙNG NGUYÊN BẢN THEO ẢNH 3 & ẢNH 5 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#d8d2b8] p-2 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-2">
        {/* Bộ Nút Chuyển Slide Bảng Trang & NÚT ICON ADD A NEW PAGE (ẢNH 3) */}
        <div className="flex items-center space-x-1 pr-2 border-r border-[#b8af91]">
          <button
            type="button"
            onClick={handlePrevPage}
            className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Trang trước (←)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="px-2.5 py-1 bg-white rounded-lg font-extrabold text-xs text-slate-800 border">
            {currentPageIndex + 1}
          </span>

          <button
            type="button"
            onClick={handleNextPage}
            className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Trang sau (→)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* ICON ADD A NEW PAGE NGUYÊN BẢN (ẢNH 3) */}
          <button
            type="button"
            onClick={handleAddNewPage}
            className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs transition relative group"
            title="Add a new page. Ctrl + Shift + N"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* CÁC CÔNG CỤ VẼ & GÕ VĂN BẢN NGUYÊN BẢN */}
        <div className="flex items-center space-x-1">
          {/* Nút Bàn Tay Trượt Bảng 4 Hướng */}
          <button
            onClick={() => setTool('hand')}
            className={`p-2.5 rounded-xl transition ${tool === 'hand' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bàn tay di chuyển trượt bảng 4 hướng"
          >
            <Move className="w-5 h-5" />
          </button>

          {/* Gõ Văn Bản Nhảy Trỏ Chuột Trực Tiếp (Mặc Định Active) */}
          <button
            onClick={() => setTool('text')}
            className={`p-2.5 rounded-xl transition ${tool === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Gõ văn bản trực tiếp (Text Tool)"
          >
            <Type className="w-5 h-5" />
          </button>

          {/* Bút Vẽ */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2.5 rounded-xl transition ${tool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bút vẽ tự do"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Bút Dạ Quang Highlighter */}
          <button
            onClick={() => setTool('highlighter')}
            className={`p-2.5 rounded-xl transition ${tool === 'highlighter' ? 'bg-amber-400 text-slate-950 shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bút dạ quang làm nổi bật câu chữ"
          >
            <Highlighter className="w-5 h-5" />
          </button>

          {/* Cục Tẩy */}
          <button
            onClick={() => setTool('eraser')}
            className={`p-2.5 rounded-xl transition ${tool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Cục tẩy"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Bảng Màu & Shapes Khoanh Vùng (Ảnh 2) */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Bảng màu & Khoanh vùng công thức"
          >
            <Square className="w-5 h-5 text-purple-700" />
          </button>

          {/* Undo / Redo */}
          <button onClick={handleUndo} className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Hoàn tác">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Phục hồi">
            <Redo className="w-5 h-5" />
          </button>

          {/* Nút Magic Box */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'tools' ? null : 'tools')}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center space-x-1"
            title="Hộp công cụ Magic Box"
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Xóa Sạch Bảng */}
          <button onClick={clearCurrentCanvas} className="p-2.5 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-slate-600" title="Xóa sạch bảng">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
