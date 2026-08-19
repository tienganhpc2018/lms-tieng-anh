import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Pencil, Eraser, Move, Type, Square, Circle, Triangle, Undo, Redo, 
  Trash2, Image as ImageIcon, Save, FolderOpen, ArrowLeft, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Dices, Link as LinkIcon, Grid, Layout, 
  Maximize2, Minimize2, Sparkles, X, Play, RotateCcw, Volume2, Ruler, 
  Highlighter, Bold, Italic, Underline, Search, ZoomIn, ZoomOut, Check, ChevronLeft, ChevronRight
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Quản lý các Slide Trang Bảng (Pages)
  const [pagesData, setPagesData] = useState(['']); // Mảng chứa dataUrl của từng trang
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Công cụ active: 'hand' | 'pen' | 'highlighter' | 'eraser' | 'shape_rect' | 'shape_circle' | 'text' | 'ruler'
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);

  // Trạng thái vẽ Canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Background Nền Bảng: 'blank' | 'grid' | 'greenboard'
  const [bgType, setBgType] = useState('blank');

  // Trạng thái Magic Box Windows Popups (Ảnh 2 & 3)
  const [activeWindow, setActiveWindow] = useState(null); // null | 'shapes' | 'tools' | 'text_editor' | 'save' | 'picker' | 'timer'

  // Text Editor State (Ảnh 2)
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(28);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Thước Kẻ Di Động (Ruler Tool)
  const [showRuler, setShowRuler] = useState(false);
  const [rulerPos, setRulerPos] = useState({ x: 150, y: 200 });

  // Nhúng Link Liên Kết Chính Giữa Bảng (Ảnh 3)
  const [embedUrlInput, setEmbedUrlInput] = useState('');
  const [embeddedFrameUrl, setEmbeddedFrameUrl] = useState('');

  // Tương Tác Dấu Tick ✔️ & ❌ (Stamps Layer)
  const [stamps, setStamps] = useState([]);

  // Vòng Quay Gọi Tên Học Sinh (Ô Dán Danh Sách)
  const [rawStudentInput, setRawStudentInput] = useState(
    "Nguyễn Minh Hoàng\nĐinh Thành Nhơn\nĐoàn Ngọc Khánh Dương\nHà Nguyễn Minh Thư\nĐinh Trần Thảo Ngân"
  );
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Đồng Hồ Đếm Ngược (Timer)
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  // Lưu Bài Dạy
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  // Palette 24 Màu Sắc Rực Rỡ Nguyên Bản Ảnh 2
  const colorPalette = [
    '#ff0000', '#ff8700', '#ffd300', '#00a83e', '#0026a8', '#670014', '#ffffff', '#000000',
    '#ff66a1', '#ff944d', '#ffe680', '#80ffaa', '#6680ff', '#b366ff', '#808080', '#4d4d4d',
    '#ffb3d1', '#ffd9b3', '#ffffcc', '#d9ffb3', '#80d4ff', '#d9b3ff', '#cccccc', '#333333'
  ];

  // Khởi tạo Canvas & Resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    saveCanvasState();
  }, []);

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

  // CHUYỂN SLIDE BẢNG (KÈM LƯU VÀ KHÔI PHỤC NỘI DUNG TỰ ĐỘNG KHÔNG BỊ MẤT)
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

  // BẮT ĐẦU VẼ TRÊN CANVAS
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
      ctx.globalAlpha = 0.35; // Làm nổi bật dạ quang mờ
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
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ctx.strokeStyle = color === '#000000' ? '#dc2626' : color;
      ctx.lineWidth = 3;
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    } else if (tool === 'shape_circle' && e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.strokeStyle = color === '#000000' ? '#2563eb' : color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    saveCanvasState();
  };

  // CHÈN VĂN BẢN (TEXT EDITOR - ẢNH 2)
  const handleInsertText = () => {
    if (!textInput.trim()) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let fontStyle = '';
    if (isBold) fontStyle += 'bold ';
    if (isItalic) fontStyle += 'italic ';
    fontStyle += `${fontSize}px sans-serif`;

    ctx.font = fontStyle;
    ctx.fillStyle = color;
    ctx.fillText(textInput, 200, 250);

    if (isUnderline) {
      const metrics = ctx.measureText(textInput);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 250 + 4);
      ctx.lineTo(200 + metrics.width, 250 + 4);
      ctx.stroke();
    }

    setTextInput('');
    setActiveWindow(null);
    saveCanvasState();
  };

  // ĐÓNG DẤU TOCK ✔️ & ❌ DẠNG THẺ TƯƠNG TÁC (CÓ NÚT XÓA THU NHỎ)
  const addStamp = (type) => {
    const newStamp = {
      id: Date.now(),
      type,
      x: window.innerWidth / 2 - 50,
      y: window.innerHeight / 3,
      size: 48,
    };
    setStamps([...stamps, newStamp]);
  };

  const removeStamp = (id) => {
    setStamps(stamps.filter((s) => s.id !== id));
  };

  // VÒNG QUAY GỌI TÊN HỌC SINH (DÁN DANH SÁCH)
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

  // NẠP LINK EMBED NHÚNG WEB CHÍNH GIỮA BẢNG (ẢNH 3)
  const handleEmbedWebUrl = () => {
    if (!embedUrlInput.trim()) return;
    setEmbeddedFrameUrl(embedUrlInput.trim());
    setActiveWindow(null);
  };

  // LƯU BÀI DẠY VÀO SUPABASE CSDL
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    saveCurrentPageData();
    try {
      const payload = {
        title: lessonTitle.trim() || 'Bài Giảng Tiếng Anh',
        teacher_id: user?.id,
        content: JSON.stringify(pagesData),
        created_at: new Date().toISOString(),
      };

      await supabase.from('activities').insert([
        {
          title: `[WHITEBOARD] ${lessonTitle.trim()}`,
          type: 'resource',
          content: JSON.stringify(pagesData),
        },
      ]);

      alert(`🎉 ĐÃ LƯU BÀI DẠY VÀO HỆ THỐNG THÀNH CÔNG!\n\n• Tên bài: ${lessonTitle}`);
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
    saveCanvasState();
  };

  return (
    <div className={`min-h-screen relative font-sans select-none overflow-hidden ${
      bgType === 'greenboard' 
        ? 'bg-emerald-950' 
        : bgType === 'grid' 
        ? 'bg-white bg-grid-pattern' 
        : 'bg-white'
    }`}>
      {/* HEADER BAR CHUẨN MYVIEWBOARD (ẢNH 1) */}
      <div className="bg-[#d5ceb3] text-slate-800 px-4 py-2 flex justify-between items-center border-b border-[#b8af91] shadow-xs text-xs font-bold z-40 relative">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-[#c4bb9c] rounded-lg transition flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Bảng</span>
          </button>
          <span className="text-rose-700 font-extrabold tracking-wider">myViewBoard LMS</span>
          <span className="text-slate-600 font-mono">| {lessonTitle}</span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Nút 💾 Lưu Bài Dạy */}
          <button
            onClick={() => setActiveWindow('save')}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center space-x-1 border border-emerald-600/40"
          >
            <Save className="w-4 h-4" />
            <span>💾 Lưu Bài Dạy</span>
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

      {/* THƯỚC KẺ DI ĐỘNG (RULER TOOL) */}
      {showRuler && (
        <div className="absolute top-32 left-40 z-30 bg-amber-100/90 border-2 border-amber-500 rounded-xl p-2 shadow-2xl flex items-center space-x-2 text-xs font-mono font-bold text-amber-900 cursor-move border-dashed">
          <Ruler className="w-5 h-5 text-amber-700" />
          <span>THƯỚC KẺ THẮNG: 0cm —— 5cm —— 10cm —— 15cm —— 20cm —— 25cm —— 30cm</span>
          <button onClick={() => setShowRuler(false)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* KHUNG NHÚNG WEB / BÀI TEST CHÍNH GIỮA MÀN HÌNH (ẢNH 3) */}
      {embeddedFrameUrl && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 bg-white rounded-3xl shadow-2xl border-4 border-emerald-600 overflow-hidden w-[85%] h-[75vh] flex flex-col">
          <div className="bg-slate-900 text-white px-4 py-2 flex justify-between items-center text-xs font-bold">
            <span className="truncate flex items-center space-x-2">
              <LinkIcon className="w-4 h-4 text-emerald-400" />
              <span>Khung Trình Chiếu Web / Bài Test Soạn Sẵn: {embeddedFrameUrl}</span>
            </span>
            <button onClick={() => setEmbeddedFrameUrl('')} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe src={embeddedFrameUrl} title="Embedded Web Quiz" className="w-full h-full border-none" />
        </div>
      )}

      {/* DANH SÁCH CÁC ICON STAMPS TICK ✔️ VÀ ❌ TƯƠNG TÁC (CÓ NÚT XÓA THU NHỎ) */}
      {stamps.map((stamp) => (
        <div
          key={stamp.id}
          style={{ left: stamp.x, top: stamp.y }}
          className="absolute z-30 p-2 bg-white/90 backdrop-blur-xs rounded-2xl shadow-xl border border-slate-300 flex items-center space-x-2 group hover:ring-2 hover:ring-emerald-500"
        >
          <span style={{ fontSize: `${stamp.size}px` }} className="select-none leading-none">
            {stamp.type === 'check' ? '✔️' : '❌'}
          </span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => removeStamp(stamp.id)}
              className="p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
              title="Xóa icon này"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {/* CANVAS VẼ CHÍNH */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-[calc(100vh-110px)] cursor-crosshair block"
      />

      {/* POPUP TEXT EDITOR NGUYÊN BẢN (ẢNH 2) */}
      {activeWindow === 'text_editor' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-5 w-[480px] space-y-4 animate-scale-up">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-sm text-slate-900">
            <span className="flex items-center space-x-2">
              <Type className="w-4 h-4 text-emerald-700" />
              <span>Text Editor (Bộ Gõ Văn Bản & Tô Đậm Nổi Bật)</span>
            </span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Gõ văn bản Tiếng Anh hoặc công thức bài giảng vào đây..."
              className="w-full p-3 border border-slate-300 rounded-xl text-sm font-bold bg-white text-slate-900"
            />

            {/* THANH ĐỊNH DẠNG TEXT FONT / BOLD / ITALIC / UNDERLINE (ẢNH 2) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-[#d8d2b8] rounded-xl border border-[#c4bb9c]">
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`p-1.5 rounded-lg border font-bold text-xs ${isBold ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-1.5 rounded-lg border font-bold text-xs ${isItalic ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-1.5 rounded-lg border font-bold text-xs ${isUnderline ? 'bg-emerald-600 text-white' : 'bg-white text-slate-800'}`}
                >
                  <Underline className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Cỡ chữ:</span>
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="p-1.5 border rounded-lg text-xs font-bold bg-white"
                >
                  <option value={18}>18px</option>
                  <option value={24}>24px</option>
                  <option value={28}>28px (Chuẩn)</option>
                  <option value={36}>36px</option>
                  <option value={48}>48px (Lớn)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleInsertText}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              🚀 Chèn Văn Bản Vào Bảng
            </button>
          </div>
        </div>
      )}

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

      {/* POPUP HỘP CÔNG CỤ DẠY HỌC ĐA NĂNG MAGIC BOX (ẢNH 3) */}
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

            <button
              onClick={() => { setShowRuler(true); setActiveWindow(null); }}
              className="p-3 bg-white hover:bg-sky-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Ruler className="w-6 h-6 text-sky-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Thước Kẻ</span>
            </button>
          </div>

          {/* Ô DÁN LINK LIÊN KẾT NHÚNG WEB (ẢNH 3) */}
          <div className="space-y-2 border-t border-[#c4bb9c] pt-3">
            <label className="block text-xs font-extrabold text-slate-800 uppercase">
              Dán Link Web / Bài Test Soạn Sẵn Chiếu Chính Giữa Bảng:
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={embedUrlInput}
                onChange={(e) => setEmbedUrlInput(e.target.value)}
                placeholder="VD: https://myviewboard.com/ hay URL Quiz..."
                className="flex-1 p-2 border border-slate-300 rounded-xl text-xs bg-white font-medium"
              />
              <button
                type="button"
                onClick={handleEmbedWebUrl}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-xs"
              >
                Nhúng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP LƯU BÀI DẠY */}
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
                Tên bài dạy:
              </label>
              <input
                type="text"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                placeholder="VD: Bài giảng Unit 1 - Grade 9"
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

      {/* POPUP VÒNG QUAY GỌI TÊN HỌC SINH (CÓ Ô DÁN DANH SÁCH) */}
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

      {/* POPUP ĐỒNG HỒ ĐẾM NGƯỢC */}
      {activeWindow === 'timer' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-80 space-y-4 border border-slate-700 animate-scale-up">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-amber-400">
              <Clock className="w-5 h-5" />
              <span>Đồng Hồ Đếm Ngược Làm Bài</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="text-center space-y-2">
            <div className="text-5xl font-extrabold font-mono text-amber-400 tracking-widest bg-slate-950 p-4 rounded-2xl border border-amber-500/30">
              {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </div>

            <div className="flex justify-center space-x-2 pt-2">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow-md"
              >
                <Play className="w-4 h-4" />
                <span>{timerRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
              </button>
              <button
                onClick={() => { setTimerRunning(false); setTimerSeconds(300); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Đặt Lại</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* THANH TOOLBAR ĐƯỢC THIẾT KẾ ĐÚNG DƯỚI CÙNG NGUYÊN BẢN THEO ẢNH 1, 2, 3 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#d8d2b8] p-2 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-2">
        {/* Bộ Nút Chuyển Slide Bảng Trang (Đã Fix Triệt Để Logic Nút Mũi Tên) */}
        <div className="flex items-center space-x-1 pr-2 border-r border-[#b8af91]">
          <button
            type="button"
            onClick={handlePrevPage}
            className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Trang trước"
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
            title="Trang sau"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleAddNewPage}
            className="p-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition"
            title="Thêm trang bảng mới"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* CÁC CÔNG CỤ VẼ & ĐỒNG HỒ NGUYÊN BẢN */}
        <div className="flex items-center space-x-1">
          {/* Nút Bàn Tay Trượt Bảng Vô Tận */}
          <button
            onClick={() => setTool('hand')}
            className={`p-2.5 rounded-xl transition ${tool === 'hand' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bàn tay trượt bảng vô tận"
          >
            <Move className="w-5 h-5" />
          </button>

          {/* Bút Vẽ */}
          <button
            onClick={() => setTool('pen')}
            className={`p-2.5 rounded-xl transition ${tool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bút vẽ tự do"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Bút Dạ Quang Highlighter Làm Nổi Bật */}
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

          {/* Bộ Gõ Văn Bản Text Editor (Ảnh 2) */}
          <button
            onClick={() => setActiveWindow('text_editor')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800 font-extrabold"
            title="Bộ gõ văn bản & Tô đậm nổi bật"
          >
            <Type className="w-5 h-5 text-indigo-700" />
          </button>

          {/* Bảng Màu & Shapes (Ảnh 2) */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Bảng màu & Khoanh vùng công thức"
          >
            <Square className="w-5 h-5 text-purple-700" />
          </button>

          {/* Đóng Dấu Tick ✔️ Tương Tác */}
          <button
            onClick={() => addStamp('check')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-emerald-700"
            title="Chèn icon Tick Đúng (✔️)"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Đóng Dấu X ❌ Tương Tác */}
          <button
            onClick={() => addStamp('x')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-rose-700"
            title="Chèn icon Dấu X Sai (❌)"
          >
            <XCircle className="w-5 h-5 text-rose-600" />
          </button>

          {/* Undo / Redo */}
          <button onClick={handleUndo} className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Hoàn tác">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Phục hồi">
            <Redo className="w-5 h-5" />
          </button>

          {/* Nút Hộp Công Cụ Giảng Dạy Đa Năng Magic Box (Ảnh 3) */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'tools' ? null : 'tools')}
            className="p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-md transition flex items-center space-x-1"
            title="Hộp công cụ giảng dạy Magic Box"
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
