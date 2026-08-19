import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Pencil, Eraser, Move, Type, Square, Circle, Triangle, Undo, Redo, 
  Trash2, Image as ImageIcon, Save, FolderOpen, ArrowLeft, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Dices, Link as LinkIcon, Grid, Layout, 
  Maximize2, Minimize2, Sparkles, X, Play, RotateCcw, Volume2
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Trạng thái Canvas & Trang Bảng (Pages)
  const [pages, setPages] = useState([{ id: 1, data: null }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Công cụ active: 'hand' | 'pen' | 'eraser' | 'shape' | 'text' | 'stamp_check' | 'stamp_x'
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [shapeType, setShapeType] = useState('rectangle'); // 'rectangle' | 'circle' | 'triangle'

  // Trạng thái vẽ Canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = posState => useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Background Nền Bảng: 'blank' | 'grid' | 'greenboard'
  const [bgType, setBgType] = useState('blank');

  // Trạng thái Magic Box Windows Popups (Ảnh 2 & 3)
  const [activeWindow, setActiveWindow] = useState(null); // null | 'shapes' | 'tools' | 'save' | 'load' | 'quiz_projector' | 'timer' | 'picker'

  // Nạp & Chèn Bài Test Quiz
  const [quizList, setQuizList] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [embedLinkInput, setEmbedLinkInput] = useState('');
  const [embeddedUrl, setEmbeddedUrl] = useState('');

  // Đồng Hồ Đếm Ngược (Countdown Timer)
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 phút mặc định
  const [timerRunning, setTimerRunning] = useState(false);

  // Vòng Quay / Gọi Tên Học Sinh Ngẫu Nhiên (Random Student Picker)
  const [studentList, setStudentList] = useState(['Nguyễn Minh Hoàng', 'Đinh Thành Nhơn', 'Đoàn Ngọc Khánh Dương', 'Hà Nguyễn Minh Thư', 'Đinh Trần Thảo Ngân']);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Lưu & Tải Bài Dạy
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh mới');
  const [savedLessons, setSavedLessons] = useState([]);

  // Bảng màu 28 màu sắc nguyên bản theo Ảnh 2
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

  // Lưu trạng thái Undo/Redo
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

  // Vẽ Canvas
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'stamp_check') {
      drawCheckStamp(ctx, x, y);
      setIsDrawing(false);
      saveCanvasState();
    } else if (tool === 'stamp_x') {
      drawXStamp(ctx, x, y);
      setIsDrawing(false);
      saveCanvasState();
    }
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
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(x - lineWidth * 3, y - lineWidth * 3, lineWidth * 6, lineWidth * 6);
    }
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveCanvasState();
    }
  };

  // Đóng dấu Tick Xanh ✔️
  const drawCheckStamp = (ctx, x, y) => {
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#059669';
    ctx.fillText('✔️', x - 18, y + 12);
  };

  // Đóng dấu Dấu X Đỏ ❌
  const drawXStamp = (ctx, x, y) => {
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.fillText('❌', x - 18, y + 12);
  };

  // Xóa sạch trang hiện tại
  const clearCurrentPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveCanvasState();
  };

  // Nạp ảnh chèn vào Bảng Tương Tác
  const handleImageInsert = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.src = evt.target.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 100, 100, Math.min(600, img.width), Math.min(400, img.height));
        saveCanvasState();
      };
    };
    reader.readAsDataURL(file);
  };

  // Gọi Tên Học Sinh Ngẫu Nhiên (Random Picker)
  const spinStudentPicker = () => {
    setIsSpinning(true);
    setSelectedStudent('');
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * studentList.length);
      setSelectedStudent(studentList[idx]);
      count++;
      if (count > 20) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 100);
  };

  // Chuyển trang Slide Bảng
  const handleAddPage = () => {
    const newPage = { id: pages.length + 1, data: null };
    setPages([...pages, newPage]);
    setCurrentPageIndex(pages.length);
    clearCurrentPage();
  };

  return (
    <div className={`min-h-screen relative font-sans select-none overflow-hidden ${
      bgType === 'greenboard' 
        ? 'bg-emerald-950' 
        : bgType === 'grid' 
        ? 'bg-white bg-grid-pattern' 
        : 'bg-white'
    }`}>
      {/* HEADER TOP BAR BẢNG TƯƠNG TÁC CHUẨN MYVIEWBOARD (ẢNH 1) */}
      <div className="bg-[#d5ceb3] text-slate-800 px-4 py-2 flex justify-between items-center border-b border-[#b8af91] shadow-xs text-xs font-bold">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/dashboard')} className="p-1 hover:bg-[#c4bb9c] rounded-lg transition flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Thoát Bảng</span>
          </button>
          <span className="text-rose-700 font-extrabold tracking-wider">myViewBoard LMS</span>
          <span className="text-slate-600 font-mono">| {lessonTitle}</span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setBgType(bgType === 'blank' ? 'grid' : bgType === 'grid' ? 'greenboard' : 'blank')}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-lg shadow-2xs border flex items-center space-x-1"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nền: {bgType === 'blank' ? 'Trơn' : bgType === 'grid' ? 'Kẻ Ôly' : 'Bảng Xanh'}</span>
          </button>

          <span className="px-3 py-1 bg-[#eae5d2] rounded-lg border font-mono">
            {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • Trang {currentPageIndex + 1}/{pages.length}
          </span>
        </div>
      </div>

      {/* CANVAS KHU VỰC VẼ CHÍNH */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-[calc(100vh-120px)] cursor-crosshair block"
      />

      {/* POPUP HỘP CÔNG CỤ SHAPES & BẢNG MÀU (ẢNH 2) */}
      {activeWindow === 'shapes' && (
        <div className="absolute top-16 right-16 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-4 w-80 space-y-4 animate-scale-up">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-xs text-slate-800">
            <span>Shapes & Pen Color Options</span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          {/* PALETTE 24 MÀU BẮT MẮT NGUYÊN BẢN ẢNH 2 */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 block">Chọn Màu Bút / Nét Vẽ:</span>
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

          {/* KÍCH THƯỚC NÉT BÚT */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-600 block">Kích thước nét: {lineWidth}px</span>
            <input
              type="range"
              min="1"
              max="20"
              value={lineWidth}
              onChange={(e) => setLineWidth(parseInt(e.target.value))}
              className="w-full"
            />
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

          <div className="grid grid-cols-4 gap-3 text-center">
            {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
            <button
              onClick={() => setActiveWindow('timer')}
              className="p-3 bg-white hover:bg-amber-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Clock className="w-6 h-6 text-amber-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Đồng Hồ</span>
            </button>

            {/* VÒNG QUAY GỌI TÊN NGẪU NHIÊN */}
            <button
              onClick={() => setActiveWindow('picker')}
              className="p-3 bg-white hover:bg-purple-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Dices className="w-6 h-6 text-purple-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Gọi Tên HS</span>
            </button>

            {/* CHÈN BÀI TEST QUIZ */}
            <button
              onClick={() => setActiveWindow('quiz_projector')}
              className="p-3 bg-white hover:bg-emerald-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <LinkIcon className="w-6 h-6 text-emerald-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Chiếu Test</span>
            </button>

            {/* NẠP ẢNH TẢI BÀI */}
            <label className="p-3 bg-white hover:bg-sky-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition cursor-pointer">
              <ImageIcon className="w-6 h-6 text-sky-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Chèn Ảnh</span>
              <input type="file" accept="image/*" onChange={handleImageInsert} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* POPUP ĐỒNG HỒ ĐẾM NGƯỢC (COUNTDOWN TIMER) */}
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

      {/* POPUP VÒNG QUAY GỌI TÊN HỌC SINH NGẪU NHIÊN */}
      {activeWindow === 'picker' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border border-slate-700 animate-scale-up">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-purple-400">
              <Dices className="w-5 h-5" />
              <span>Vòng Quay Gọi Tên Học Sinh Ngẫu Nhiên</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="text-center space-y-4">
            <div className="p-6 bg-purple-950/60 rounded-2xl border border-purple-500/40 min-h-[100px] flex items-center justify-center">
              <span className={`text-2xl font-extrabold ${isSpinning ? 'animate-pulse text-amber-300' : 'text-purple-200'}`}>
                {selectedStudent || 'Bấm nút để quay ngẫu nhiên!'}
              </span>
            </div>

            <button
              onClick={spinStudentPicker}
              disabled={isSpinning}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-sm rounded-xl shadow-lg transition"
            >
              {isSpinning ? '🎲 Đang Quay Gọi Tên...' : '🚀 QUAY GỌI TÊN HỌC SINH'}
            </button>
          </div>
        </div>
      )}

      {/* THANH TOOLBAR ĐƯỢC THIẾT KẾ ĐÚNG DƯỚI CÙNG NGUYÊN BẢN THEO ẢNH 1, 2, 3 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#d8d2b8] p-2 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-2">
        {/* Bộ Nút Chuyển Slide Bảng Trang */}
        <div className="flex items-center space-x-1 pr-2 border-r border-[#b8af91]">
          <button
            onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
            className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Trang trước"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="px-2 py-1 bg-white rounded-lg font-bold text-xs text-slate-800 border">
            {currentPageIndex + 1}
          </span>
          <button
            onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
            className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Trang sau"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddPage}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition"
            title="Thêm trang bảng mới"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* CÁC CÔNG CỤ VẼ VÀ ĐỒNG HỒ NGUYÊN BẢN THẦY YÊU CẦU */}
        <div className="flex items-center space-x-1">
          {/* Nút Bàn Tay Trượt Bảng */}
          <button
            onClick={() => setTool('hand')}
            className={`p-2.5 rounded-xl transition ${tool === 'hand' ? 'bg-amber-500 text-slate-950 shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
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

          {/* Cục Tẩy */}
          <button
            onClick={() => setTool('eraser')}
            className={`p-2.5 rounded-xl transition ${tool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Cục tẩy"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Nút Bảng Màu & Shapes (Ảnh 2) */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Bảng màu & Hình khối (Shapes)"
          >
            <Square className="w-5 h-5 text-purple-700" />
          </button>

          {/* Đóng Dấu Tick Xanh ✔️ */}
          <button
            onClick={() => setTool('stamp_check')}
            className={`p-2.5 rounded-xl transition ${tool === 'stamp_check' ? 'bg-emerald-100 text-emerald-800 ring-2 ring-emerald-600' : 'hover:bg-[#c4bb9c]'}`}
            title="Đóng dấu Tick Đúng (✔️)"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </button>

          {/* Đóng Dấu X Đỏ ❌ */}
          <button
            onClick={() => setTool('stamp_x')}
            className={`p-2.5 rounded-xl transition ${tool === 'stamp_x' ? 'bg-rose-100 text-rose-800 ring-2 ring-rose-600' : 'hover:bg-[#c4bb9c]'}`}
            title="Đóng dấu Dấu X Sai (❌)"
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
          <button onClick={clearCurrentPage} className="p-2.5 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-slate-600" title="Xóa sạch bảng">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
