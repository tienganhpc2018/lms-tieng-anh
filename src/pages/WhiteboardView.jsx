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
  Layers, Lock, Unlock, Copy, ArrowUp, ArrowDown, BookOpen, VolumeX, UserCheck, Minus
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // PHÂN QUYỀN BẢO VỆ
  useEffect(() => {
    if (user && !isTeacher) {
      alert('⚠️ Tính năng Bảng Tương Tác Giảng Dạy chỉ dành riêng cho Giáo viên!');
      navigate('/dashboard');
    }
  }, [user, isTeacher, navigate]);

  // ĐỊNH NGHĨA TRANG BẢNG CHUẨN (NHƯ QUYỂN VỞ TRẮNG)
  const createEmptyPage = () => ({
    canvasData: '',
    textElements: [],
    objectElements: [],
  });

  const [pages, setPages] = useState([createEmptyPage()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Công cụ active: 'select' | 'hand' | 'text' | 'pen' | 'highlighter' | 'eraser' | 'shape_rect' | 'shape_circle' | 'underline_box'
  const [tool, setTool] = useState('text');
  const [color, setColor] = useState('#dc2626'); // Đỏ rực rỡ
  const [fontSize, setFontSize] = useState(28);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // SOẠN THẢO VĂN BẢN TRỰC TIẾP (KHI NHẤP RA NGOÀI TỰ BIẾN MẤT KHUNG VIỀN - ẢNH 1)
  const [activeTextId, setActiveTextId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 100, y: 100 });

  // Trạng thái trượt Pan Bàn Tay (Move Hand Drag)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Trạng thái vẽ Canvas
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups
  const [activeWindow, setActiveWindow] = useState(null); // null | 'save' | 'load' | 'picker' | 'timer' | 'shapes' | 'tools'

  // VÒNG QUAY HỌC SINH (ẢNH 2): RỘNG HƠN + LOẠI BỎ HS ĐÃ GỌI + ÂM THANH
  const [rawStudentInput, setRawStudentInput] = useState(
    "Nguyễn Minh Hoàng\nĐinh Thành Nhơn\nĐoàn Ngọc Khánh Dương\nHà Nguyễn Minh Thư\nĐinh Trần Thảo Ngân\nTrần Quốc Bảo\nLê Thị Mai Anh"
  );
  const [calledStudents, setCalledStudents] = useState([]);
  const [removeCalled, setRemoveCalled] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // Đồng Hồ Đếm Ngược
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  // Lưu & Mở Bài Dạy
  const [savedLessons, setSavedLessons] = useState([]);
  const [loadingSavedLessons, setLoadingSavedLessons] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  // Palette 24 Màu Sắc
  const colorPalette = [
    '#ff0000', '#ff8700', '#ffd300', '#00a83e', '#0026a8', '#670014', '#ffffff', '#000000',
    '#ff66a1', '#ff944d', '#ffe680', '#80ffaa', '#6680ff', '#b366ff', '#808080', '#4d4d4d',
    '#ffb3d1', '#ffd9b3', '#ffffcc', '#d9ffb3', '#80d4ff', '#d9b3ff', '#cccccc', '#333333'
  ];

  // KHỞI TẠO VÀ LẮNG NGHE SỰ KIỆN PASTE TỪ SNIPPING TOOL (CTRL + V)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    saveCanvasState();

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
              x: 250 - panOffset.x,
              y: 150 - panOffset.y,
            };
            setPages((prev) => {
              const copy = [...prev];
              const cur = copy[currentPageIndex] || createEmptyPage();
              copy[currentPageIndex] = {
                ...cur,
                objectElements: [...(cur.objectElements || []), newObj],
              };
              return copy;
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [panOffset, currentPageIndex]);

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

  // PHÁT ÂM THANH HIỆU ỨNG TỰ ĐỘNG BẰNG WEB AUDIO API
  const playSoundEffect = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'tick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // VÒNG QUAY HỌC SINH RỘNG HƠN + LOẠI TRỪ HỌC SINH ĐÃ GỌI + ÂM THANH
  const spinRandomStudent = () => {
    const allList = rawStudentInput.split('\n').map((s) => s.trim()).filter((s) => s.length > 0);
    const availableList = removeCalled
      ? allList.filter((s) => !calledStudents.includes(s))
      : allList;

    if (availableList.length === 0) {
      alert('Tất cả học sinh trong danh sách đã được gọi hết! Bấm nút Reset để bắt đầu lượt mới.');
      return;
    }

    setIsSpinning(true);
    setSelectedStudent('');
    let count = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * availableList.length);
      const namePicked = availableList[idx];
      setSelectedStudent(namePicked);
      playSoundEffect('tick');
      count++;
      if (count > 22) {
        clearInterval(interval);
        setIsSpinning(false);
        playSoundEffect('win');
        if (removeCalled) {
          setCalledStudents((prev) => [...prev, namePicked]);
        }
      }
    }, 90);
  };

  // NẠP VÀ LƯU BÀI GIẢNG
  const fetchSavedLessons = async () => {
    setLoadingSavedLessons(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .like('title', '[WHITEBOARD:%')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSavedLessons(data);
      }
    } catch (err) {}
    setLoadingSavedLessons(false);
  };

  const handleLoadLesson = (lesson) => {
    try {
      const parsedPages = JSON.parse(lesson.content);
      if (Array.isArray(parsedPages) && parsedPages.length > 0) {
        setPages(parsedPages);
        setCurrentPageIndex(0);
        setTimeout(() => renderPageCanvas(parsedPages[0]), 100);
        alert(`🚀 ĐÃ MỞ THÀNH CÔNG BÀI GIẢNG: "${lesson.title.replace(/\[WHITEBOARD:.*?\]/, '').trim()}"`);
        setActiveWindow(null);
      }
    } catch (e) {
      alert('Lỗi nạp bài giảng: ' + e.message);
    }
  };

  const renderPageCanvas = (pageObj) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pageObj && pageObj.canvasData) {
      const img = new Image();
      img.src = pageObj.canvasData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const saveCurrentPageCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      copy[currentPageIndex] = { ...cur, canvasData: dataUrl };
      return copy;
    });
  };

  // CHUYỂN TRANG SLIDE (SANG TRANG MỚI LÀ TRANG TRẮNG TINH 100%)
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      commitActiveTextToCanvas();
      saveCurrentPageCanvas();
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      renderPageCanvas(pages[newIndex]);
    }
  };

  const handleNextPage = () => {
    commitActiveTextToCanvas();
    saveCurrentPageCanvas();
    const newIndex = currentPageIndex + 1;
    if (newIndex >= pages.length) {
      const newEmpty = createEmptyPage();
      setPages([...pages, newEmpty]);
      setCurrentPageIndex(newIndex);
      renderPageCanvas(newEmpty);
    } else {
      setCurrentPageIndex(newIndex);
      renderPageCanvas(pages[newIndex]);
    }
  };

  const handleAddNewPage = () => {
    commitActiveTextToCanvas();
    saveCurrentPageCanvas();
    const newEmpty = createEmptyPage();
    const newIndex = pages.length;
    setPages([...pages, newEmpty]);
    setCurrentPageIndex(newIndex);
    renderPageCanvas(newEmpty);
  };

  // UNDO / REDO
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

  // KHI GÕ XONG HOẶC NHẤP RA NGOÀI -> VẼ VĂN BẢN MỊN ĐẸP LÊN CANVAS VÀ KHUNG VIỀN BIẾN MẤT HOÀN TOÀN (ẢNH 1)
  const commitActiveTextToCanvas = () => {
    if (!activeTextId || !editingText.trim()) {
      setActiveTextId(null);
      setEditingText('');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let fontStyle = '';
    if (isBold) fontStyle += 'bold ';
    if (isItalic) fontStyle += 'italic ';
    fontStyle += `${fontSize}px sans-serif`;

    ctx.font = fontStyle;
    ctx.fillStyle = color;

    const lines = editingText.split('\n');
    let currentY = textPosition.y + fontSize;

    lines.forEach((line) => {
      ctx.fillText(line, textPosition.x, currentY);
      if (isUnderline) {
        const metrics = ctx.measureText(line);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(textPosition.x, currentY + 4);
        ctx.lineTo(textPosition.x + metrics.width, currentY + 4);
        ctx.stroke();
      }
      currentY += fontSize * 1.35;
    });

    setActiveTextId(null);
    setEditingText('');
    saveCanvasState();
  };

  // NHẤP CHUỘT VÀO BẢNG TẠO Ô GÕ RỘNG HƠN
  const handleCanvasMouseDown = (e) => {
    if (tool === 'text') {
      commitActiveTextToCanvas();
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;

      setTextPosition({ x, y });
      setActiveTextId('text_' + Date.now());
      setEditingText('');
    } else if (tool === 'hand') {
      commitActiveTextToCanvas();
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else {
      commitActiveTextToCanvas();
      startDrawing(e);
    }
  };

  const handleMouseMoveGlobal = (e) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (isDrawing) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      setCurrentMousePos({ x, y });
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
    setCurrentMousePos({ x, y });
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
      ctx.lineWidth = 4;
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
      ctx.clearRect(x - 20, y - 20, 40, 40);
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;

    if ((tool === 'shape_rect' || tool === 'underline_box') && e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      ctx.strokeStyle = color === '#000000' ? '#dc2626' : color;
      ctx.lineWidth = tool === 'underline_box' ? 2 : 3;
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

  // LƯU BÀI DẠY VÀO SUPABASE
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    commitActiveTextToCanvas();
    saveCurrentPageCanvas();
    try {
      await supabase.from('activities').insert([
        {
          title: `[WHITEBOARD: ${selectedUnit}] ${lessonTitle.trim()}`,
          type: 'resource',
          content: JSON.stringify(pages),
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

  const clearCurrentPage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setActiveTextId(null);
    setEditingText('');
    saveCanvasState();
  };

  const currentPage = pages[currentPageIndex] || createEmptyPage();

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
          <button
            onClick={() => {
              fetchSavedLessons();
              setActiveWindow('load');
            }}
            className="px-3 py-1.5 bg-sky-700 hover:bg-sky-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center space-x-1 border border-sky-600/40"
          >
            <FolderOpen className="w-4 h-4" />
            <span>📂 Mở Bài Dạy Đã Lưu</span>
          </button>

          <button
            onClick={() => setActiveWindow('save')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center space-x-1 border border-emerald-600/40"
          >
            <Save className="w-4 h-4" />
            <span>💾 Lưu Bài Dạy</span>
          </button>

          <button
            onClick={() => setBgType(bgType === 'blank' ? 'grid' : bgType === 'grid' ? 'greenboard' : 'blank')}
            className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-lg border flex items-center space-x-1 shadow-2xs"
          >
            <Grid className="w-3.5 h-3.5 text-emerald-600" />
            <span>Nền: {bgType === 'blank' ? 'Trơn' : bgType === 'grid' ? 'Kẻ Ôly' : 'Bảng Xanh'}</span>
          </button>

          <span className="px-3 py-1 bg-[#eae5d2] rounded-lg border font-mono">
            {new Date().toLocaleDateString('vi-VN')} • Trang {currentPageIndex + 1}/{pages.length}
          </span>
        </div>
      </div>

      {/* KHU VỰC VẼ CANVAS CHÍNH VỚI PAN OFFSET */}
      <div style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }} className="relative w-full h-full">
        {/* CANVAS VẼ */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className="w-full h-[calc(100vh-110px)] cursor-text block"
        />

        {/* PREVIEW KHUNG KHOANH TRÒN / GẠCH CHÂN CÂU TRỰC TIẾP KHI ĐANG KÉO RÊ CHUỘT */}
        {isDrawing && (tool === 'shape_rect' || tool === 'underline_box') && (
          <div
            style={{
              left: Math.min(startPos.x, currentMousePos.x),
              top: Math.min(startPos.y, currentMousePos.y),
              width: Math.abs(currentMousePos.x - startPos.x),
              height: Math.abs(currentMousePos.y - startPos.y),
            }}
            className="absolute border-2 border-red-500 rounded-lg border-dashed pointer-events-none z-30"
          />
        )}

        {/* Ô NHẬP VĂN BẢN TRỰC TIẾP (KHI NHẤP RA NGOÀI VIỀN BIẾN MẤT HOÀN TOÀN VẼ MỊN LÊN CANVAS - ẢNH 1) */}
        {activeTextId && (
          <div
            style={{ left: textPosition.x, top: textPosition.y }}
            className="absolute z-40 bg-white/95 backdrop-blur-xs p-2 rounded-2xl shadow-2xl border-2 border-emerald-500 animate-scale-up"
          >
            {/* TOOLBAR ĐỊNH DẠNG TEXT */}
            <div className="flex items-center space-x-1.5 mb-2 pb-1.5 border-b border-slate-200 text-xs font-bold">
              <button onClick={() => setIsBold(!isBold)} className={`p-1.5 rounded ${isBold ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}><Bold className="w-4 h-4" /></button>
              <button onClick={() => setIsItalic(!isItalic)} className={`p-1.5 rounded ${isItalic ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}><Italic className="w-4 h-4" /></button>
              <button onClick={() => setIsUnderline(!isUnderline)} className={`p-1.5 rounded ${isUnderline ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'}`}><Underline className="w-4 h-4" /></button>
              
              <select value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="p-1 bg-slate-50 border rounded text-xs font-bold">
                <option value={20}>20px</option>
                <option value={28}>28px (Chuẩn)</option>
                <option value={36}>36px</option>
                <option value={48}>48px (Lớn)</option>
              </select>

              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-none" />

              <button
                onClick={commitActiveTextToCanvas}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg text-xs shadow-2xs ml-2"
              >
                ✓ Hoàn Thành Gõ
              </button>
            </div>

            {/* KHUNG SOẠN THẢO VĂN BẢN RỘNG HƠN VỚI ENTER XUỐNG DÒNG */}
            <textarea
              autoFocus
              rows={3}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              placeholder="Gõ văn bản bài giảng tại đây (Bấm '✓ Hoàn Thành Gõ' hoặc nhấp ra ngoài để chèn)..."
              style={{
                color: color,
                fontSize: `${fontSize}px`,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
              }}
              className="w-[450px] p-3 border border-slate-300 rounded-xl outline-none resize-y font-sans bg-amber-50 text-slate-900 shadow-inner"
            />
          </div>
        )}

        {/* ẢNH BÀI TẬP CHỤP TỪ SNIPPING TOOL (CTRL + V) */}
        {(currentPage.objectElements || []).map((obj) => (
          <div
            key={obj.id}
            style={{ left: obj.x, top: obj.y }}
            className="absolute z-20 group cursor-move border-2 border-dashed border-sky-400 rounded-xl p-1 bg-white/30"
          >
            <div className="absolute -top-9 right-0 bg-white border rounded-lg p-1 shadow flex items-center space-x-1">
              <button
                onClick={() => {
                  setPages((prev) => {
                    const copy = [...prev];
                    const cur = copy[currentPageIndex] || createEmptyPage();
                    const filtered = (cur.objectElements || []).filter((o) => o.id !== obj.id);
                    copy[currentPageIndex] = { ...cur, objectElements: filtered };
                    return copy;
                  });
                }}
                className="p-1 text-rose-600 hover:bg-rose-100 rounded"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {obj.type === 'image' && (
              <img src={obj.src} alt="Snipped task" className="max-w-xl max-h-[500px] object-contain rounded-xl shadow-md" />
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
            <span className="text-[11px] font-bold text-slate-700 block uppercase">Khoanh Vùng Công Thức & Gạch Chân Câu Văn:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <button
                onClick={() => { setTool('underline_box'); setActiveWindow(null); }}
                className="p-2.5 bg-white hover:bg-rose-50 border border-rose-400 rounded-xl text-rose-800 flex items-center space-x-1.5 justify-center shadow-2xs"
              >
                <Square className="w-4 h-4 text-rose-600" />
                <span>▭ Khung Gạch Chân Câu</span>
              </button>
              <button
                onClick={() => { setTool('shape_circle'); setActiveWindow(null); }}
                className="p-2.5 bg-white hover:bg-sky-50 border border-sky-400 rounded-xl text-sky-800 flex items-center space-x-1.5 justify-center shadow-2xs"
              >
                <Circle className="w-4 h-4 text-sky-600" />
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

      {/* POPUP MỞ BÀI DẠY ĐÃ LƯU */}
      {activeWindow === 'load' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-3xl shadow-2xl p-6 w-[500px] space-y-4 border border-slate-200 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-sky-700">
              <FolderOpen className="w-5 h-5" />
              <span>📂 DANH SÁCH BÀI GIẢNG ĐÃ LƯU (MỞ HỌC TIẾP)</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
          </div>

          {loadingSavedLessons ? (
            <LoadingSpinner text="Đang tải danh sách bài giảng đã lưu..." />
          ) : savedLessons.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Chưa có bài dạy nào được lưu. Thầy hãy bấm nút "💾 Lưu Bài Dạy" để lưu lại bài học!</p>
          ) : (
            <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
              {savedLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-3 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-2xl flex items-center justify-between transition"
                >
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{lesson.title.replace(/\[WHITEBOARD:.*?\]/, '').trim()}</h4>
                    <span className="text-[10px] font-extrabold text-sky-700 uppercase bg-sky-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {lesson.title.match(/\[WHITEBOARD:(.*?)\]/)?.[1] || 'Unit 1'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleLoadLesson(lesson)}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-xs"
                  >
                    🚀 Mở Học Tiếp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POPUP VÒNG QUAY GỌI TÊN HỌC SINH (ẢNH 2 - THIẾT KẾ RỘNG HƠN + LOẠI TRỪ HS + ÂM THANH) */}
      {activeWindow === 'picker' && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white rounded-3xl shadow-2xl p-6 w-[560px] space-y-4 border border-purple-500/40 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base flex items-center space-x-2 text-purple-400">
              <Dices className="w-6 h-6 text-purple-400" />
              <span>🎲 Vòng Quay Gọi Tên Học Sinh Ngẫu Nhiên</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-extrabold text-slate-300 uppercase">
                  Dán / Nhập Danh Sách Học Sinh (Mỗi HS 1 Dòng):
                </label>
                <label className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeCalled}
                    onChange={(e) => setRemoveCalled(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>☑️ Tự động loại bỏ HS đã được gọi</span>
                </label>
              </div>
              <textarea
                rows={4}
                value={rawStudentInput}
                onChange={(e) => setRawStudentInput(e.target.value)}
                placeholder="Dán danh sách cả lớp vào đây..."
                className="w-full p-3 border border-slate-800 bg-slate-900 text-slate-100 rounded-2xl text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* KHUNG HIỂN THỊ TÊN HỌC SINH TRÚNG THƯỞNG */}
            <div className="p-6 bg-gradient-to-br from-purple-950 via-slate-900 to-purple-900 rounded-3xl border-2 border-purple-500/50 min-h-[110px] flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
              <span className={`text-3xl font-extrabold tracking-wide ${isSpinning ? 'animate-bounce text-amber-300' : 'text-emerald-400 drop-shadow-md'}`}>
                {selectedStudent || 'Bấm nút bên dưới để quay ngẫu nhiên!'}
              </span>
              {selectedStudent && !isSpinning && (
                <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-widest mt-1 animate-pulse">
                  🎉 CHÚC MỪNG HỌC SINH ĐƯỢC CHỌN!
                </span>
              )}
            </div>

            {/* DANH SÁCH HỌC SINH ĐÃ ĐƯỢC GỌI */}
            {calledStudents.length > 0 && (
              <div className="p-2.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-1 text-[11px] font-extrabold text-slate-400">
                  <span>Học sinh đã gọi ({calledStudents.length}):</span>
                  <button onClick={() => setCalledStudents([])} className="text-rose-400 hover:underline">Reset danh sách</button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                  {calledStudents.map((name, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-900/60 text-purple-200 border border-purple-500/30 rounded-lg text-[10px] font-bold">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={spinRandomStudent}
              disabled={isSpinning}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition uppercase tracking-wider flex items-center justify-center space-x-2 border border-purple-400/30"
            >
              <Dices className="w-5 h-5 animate-spin" />
              <span>{isSpinning ? '🎲 Đang Quay Gọi Tên...' : '🚀 QUAY GỌI TÊN HỌC SINH'}</span>
            </button>
          </div>
        </div>
      )}

      {/* THANH TOOLBAR DƯỚI CÙNG NGUYÊN BẢN THEO ẢNH 3 & ẢNH 5 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#d8d2b8] p-2 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-2">
        {/* Bộ Nút Chuyển Slide Bảng Trang (SANG TRANG MỚI LÀ TRANG TRẮNG TINH 100%) */}
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

          <button
            type="button"
            onClick={handleAddNewPage}
            className="p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-xs transition"
            title="Add a new page. Ctrl + Shift + N"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* CÁC CÔNG CỤ VẼ & GÕ VĂN BẢN NGUYÊN BẢN */}
        <div className="flex items-center space-x-1">
          {/* Nút Bàn Tay Trượt Bảng 4 Hướng */}
          <button
            onClick={() => { commitActiveTextToCanvas(); setTool('hand'); }}
            className={`p-2.5 rounded-xl transition ${tool === 'hand' ? 'bg-amber-500 text-slate-950 shadow-md font-bold' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bàn tay di chuyển trượt bảng 4 hướng"
          >
            <Move className="w-5 h-5" />
          </button>

          {/* Gõ Văn Bản Nhảy Trỏ Chuột Trực Tiếp */}
          <button
            onClick={() => setTool('text')}
            className={`p-2.5 rounded-xl transition ${tool === 'text' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Gõ văn bản trực tiếp (Text Tool)"
          >
            <Type className="w-5 h-5" />
          </button>

          {/* Bút Vẽ */}
          <button
            onClick={() => { commitActiveTextToCanvas(); setTool('pen'); }}
            className={`p-2.5 rounded-xl transition ${tool === 'pen' ? 'bg-emerald-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bút vẽ tự do"
          >
            <Pencil className="w-5 h-5" />
          </button>

          {/* Bút Dạ Quang Highlighter */}
          <button
            onClick={() => { commitActiveTextToCanvas(); setTool('highlighter'); }}
            className={`p-2.5 rounded-xl transition ${tool === 'highlighter' ? 'bg-amber-400 text-slate-950 shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Bút dạ quang làm nổi bật câu chữ"
          >
            <Highlighter className="w-5 h-5" />
          </button>

          {/* Cục Tẩy */}
          <button
            onClick={() => { commitActiveTextToCanvas(); setTool('eraser'); }}
            className={`p-2.5 rounded-xl transition ${tool === 'eraser' ? 'bg-rose-600 text-white shadow-md' : 'hover:bg-[#c4bb9c] text-slate-800'}`}
            title="Cục tẩy"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Bảng Màu & Shapes Khoanh Vùng / Gạch Chân Câu Văn */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
            className="p-2.5 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
            title="Bảng màu & Khung gạch chân câu / khoanh tròn"
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

          {/* Xóa Sạch Trang Hiện Tại */}
          <button onClick={clearCurrentPage} className="p-2.5 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-slate-600" title="Xóa sạch trang hiện tại">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
