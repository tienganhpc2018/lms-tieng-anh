import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import * as fabric from 'fabric';
import { 
  Pencil, Eraser, Move, Type, Square, Circle, Triangle, Undo, Redo, 
  Trash2, Image as ImageIcon, Save, FolderOpen, ArrowLeft, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Dices, Link as LinkIcon, Grid, Layout, 
  Maximize2, Minimize2, Sparkles, X, Play, RotateCcw, Volume2, Ruler, 
  Highlighter, Bold, Italic, Underline, Search, ZoomIn, ZoomOut, Check, ChevronLeft, ChevronRight,
  Layers, Lock, Unlock, Copy, ArrowUp, ArrowDown, BookOpen, Edit3, Hand, Minus, MousePointer, Pause, RefreshCw, Users,
  StickyNote, AlignLeft, AlignCenter, AlignRight, CornerUpRight, ArrowUpRight, Star, Diamond, Layers3, ArrowDownToLine, ArrowUpToLine,
  Boxes, Group, Ungroup, Scissors, FlipHorizontal, FlipVertical, RefreshCw as RotateIcon, Target, Download, Monitor
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Instance Fabric Canvas
  const [fabricCanvas, setFabricCanvas] = useState(null);

  // BẢO VỆ PHÂN QUYỀN HỌC SINH
  useEffect(() => {
    if (user && !isTeacher) {
      alert('⚠️ Tính năng Bảng Tương Tác Giảng Dạy chỉ dành riêng cho Giáo viên!');
      navigate('/dashboard');
    }
  }, [user, isTeacher, navigate]);

  // ĐUỔI VỊ TRÍ THANH TOOLBAR DƯỚI CÙNG SÁT MEP (BOTTOM-3)
  const [toolbarPos, setToolbarPos] = useState('bottom');

  // Công cụ active: 'pointer' | 'hand' | 'text' | 'sticky' | 'pen' | 'highlighter' | 'eraser' | shapes...
  const [tool, setTool] = useState('pointer');
  const [color, setColor] = useState('#dc2626');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // Quản lý Đối Tượng Đang Chọn & Menu Nổi (Floating Toolbar Position)
  const [activeObject, setActiveObject] = useState(null);
  const [floatingMenuPos, setFloatingMenuPos] = useState(null); // { left, top }

  // Quản lý các trang Slide
  const [pagesJSON, setPagesJSON] = useState(['{}']);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups & Tools
  const [activeWindow, setActiveWindow] = useState(null);

  // VÒNG QUAY HỌC SINH
  const [rawStudentInput, setRawStudentInput] = useState(
    "Nguyễn Minh Hoàng\nĐinh Thành Nhơn\nĐoàn Ngọc Khánh Dương\nHà Nguyễn Minh Thư\nĐinh Trần Thảo Ngân\nTrần Quốc Bảo\nLê Thị Mai Anh"
  );
  const [calledStudents, setCalledStudents] = useState([]);
  const [removeCalled, setRemoveCalled] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // HỘT XÚC XẮC
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([4]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // ĐỒNG HỒ ĐẾM NGƯỢC
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  // NẠP BÀI DẠY
  const [savedLessons, setSavedLessons] = useState([]);
  const [loadingSavedLessons, setLoadingSavedLessons] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  const STICKY_COLORS = [
    { name: 'Yellow', bg: '#fef08a', text: '#854d0e', border: '#fde047' },
    { name: 'Warm Yellow', bg: '#fde68a', text: '#78350f', border: '#fcd34d' },
    { name: 'Orange', bg: '#ffedd5', text: '#9a3412', border: '#fed7aa' },
    { name: 'Pink', bg: '#fce7f3', text: '#9d174d', border: '#fbcfe8' },
    { name: 'Purple', bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' },
    { name: 'Green', bg: '#dcfce7', text: '#166534', border: '#bbf7d0' },
    { name: 'Blue', bg: '#e0f2fe', text: '#075985', border: '#bae6fd' },
    { name: 'White', bg: '#ffffff', text: '#0f172a', border: '#e2e8f0' },
  ];

  const HIGHLIGHT_PALETTE = [
    { name: 'Yellow', color: '#fef08a' },
    { name: 'Orange', color: '#fed7aa' },
    { name: 'Pink', color: '#fbcfe8' },
    { name: 'Green', color: '#bbf7d0' },
    { name: 'Blue', color: '#bae6fd' },
    { name: 'Purple', color: '#e9d5ff' },
    { name: 'White', color: '#ffffff' },
  ];

  const FONT_FAMILIES = ['Noto Sans', 'Arial', 'Roboto', 'Dancing Script', 'Courier New', 'Georgia', 'Impact'];
  const FONT_SIZES = [14, 18, 24, 32, 40, 48, 64, 80, 96];

  const colorPalette = [
    '#ff0000', '#ff8700', '#ffd300', '#00a83e', '#0026a8', '#670014', '#ffffff', '#000000',
    '#ff66a1', '#ff944d', '#ffe680', '#80ffaa', '#6680ff', '#b366ff', '#808080', '#4d4d4d',
    '#ffb3d1', '#ffd9b3', '#ffffcc', '#d9ffb3', '#80d4ff', '#d9b3ff', '#cccccc', '#333333'
  ];

  // KHỞI TẠO FABRIC CANVAS VÀ THEO DÕI SELECTION
  useEffect(() => {
    if (!canvasRef.current) return;

    const fc = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: 'transparent',
      selection: true, // Rubberband Lasso Select Tool
      preserveObjectStacking: true,
    });

    // Cấu hình Bounding box handles mặc định đẹp mắt
    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerColor = '#0ea5e9';
    fabric.FabricObject.prototype.cornerStyle = 'circle';
    fabric.FabricObject.prototype.cornerSize = 12;
    fabric.FabricObject.prototype.borderColor = '#38bdf8';
    fabric.FabricObject.prototype.borderDashArray = [4, 4];

    // Cập nhật vị trí Floating Menu Nổi theo Bounding Box của Active Object
    const updateFloatingMenu = () => {
      const obj = fc.getActiveObject();
      if (obj) {
        setActiveObject(obj);
        const bound = obj.getBoundingRect();
        setFloatingMenuPos({
          left: bound.left + bound.width + 15,
          top: Math.max(70, bound.top),
        });
      } else {
        setActiveObject(null);
        setFloatingMenuPos(null);
      }
    };

    fc.on('selection:created', updateFloatingMenu);
    fc.on('selection:updated', updateFloatingMenu);
    fc.on('selection:cleared', () => {
      setActiveObject(null);
      setFloatingMenuPos(null);
    });
    fc.on('object:moving', updateFloatingMenu);
    fc.on('object:scaling', updateFloatingMenu);
    fc.on('object:rotating', updateFloatingMenu);
    fc.on('object:modified', updateFloatingMenu);

    setFabricCanvas(fc);

    // Lắng nghe Paste ảnh từ Clipboard
    const handlePaste = (e) => {
      const items = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          const reader = new FileReader();
          reader.onload = (evt) => {
            fabric.Image.fromURL(evt.target.result).then((img) => {
              // Tự động scale ảnh nếu quá to
              const maxW = window.innerWidth * 0.6;
              if (img.width > maxW) {
                img.scaleToWidth(maxW);
              }
              img.set({
                left: 200,
                top: 100,
              });
              fc.add(img);
              fc.setActiveObject(img);
              fc.renderAll();
              updateFloatingMenu();
            });
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
      fc.dispose();
    };
  }, []);

  // XỬ LÝ CHUYỂN ĐỔI CÔNG CỤ (TOOL SWITCHING)
  useEffect(() => {
    if (!fabricCanvas) return;

    if (tool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = color;
      brush.width = 4;
      fabricCanvas.freeDrawingBrush = brush;
    } else if (tool === 'highlighter') {
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = color === '#000000' ? 'rgba(255, 42, 109, 0.45)' : (color + '77');
      brush.width = 24;
      fabricCanvas.freeDrawingBrush = brush;
    } else if (tool === 'eraser') {
      fabricCanvas.isDrawingMode = false;
      // Nhấp xóa object trực tiếp
      const handleEraserClick = (options) => {
        if (options.target) {
          fabricCanvas.remove(options.target);
          fabricCanvas.renderAll();
        }
      };
      fabricCanvas.on('mouse:down', handleEraserClick);
      return () => fabricCanvas.off('mouse:down', handleEraserClick);
    } else if (tool === 'hand') {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.defaultCursor = 'grab';
      let isDragging = false;
      let lastPosX = 0;
      let lastPosY = 0;

      const onMouseDown = (opt) => {
        const evt = opt.e;
        isDragging = true;
        fabricCanvas.selection = false;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      };

      const onMouseMove = (opt) => {
        if (isDragging) {
          const e = opt.e;
          const vpt = fabricCanvas.viewportTransform;
          vpt[4] += e.clientX - lastPosX;
          vpt[5] += e.clientY - lastPosY;
          fabricCanvas.requestRenderAll();
          lastPosX = e.clientX;
          lastPosY = e.clientY;
        }
      };

      const onMouseUp = () => {
        isDragging = false;
        fabricCanvas.selection = true;
      };

      fabricCanvas.on('mouse:down', onMouseDown);
      fabricCanvas.on('mouse:move', onMouseMove);
      fabricCanvas.on('mouse:up', onMouseUp);

      return () => {
        fabricCanvas.off('mouse:down', onMouseDown);
        fabricCanvas.off('mouse:move', onMouseMove);
        fabricCanvas.off('mouse:up', onMouseUp);
      };
    } else {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.selection = true;
    }
  }, [fabricCanvas, tool, color]);

  // PHÍM DELETE HOẶC BACKSPACE XÓA ĐỐI TƯỢNG ĐANG SELECT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (fabricCanvas && activeObject) {
          e.preventDefault();
          handleDeleteActiveObject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, activeObject]);

  // CÁC HÀM THAO TÁC TRÊN ĐỐI TƯỢNG (FLOATING MENU ACTIONS)
  const handleDeleteActiveObject = () => {
    if (!fabricCanvas) return;
    const activeObjects = fabricCanvas.getActiveObjects();
    if (activeObjects.length > 0) {
      activeObjects.forEach((obj) => fabricCanvas.remove(obj));
      fabricCanvas.discardActiveObject();
      fabricCanvas.renderAll();
      setActiveObject(null);
      setFloatingMenuPos(null);
    }
  };

  const handleBringToFront = () => {
    if (!fabricCanvas || !activeObject) return;
    fabricCanvas.bringObjectToFront(activeObject);
    fabricCanvas.renderAll();
  };

  const handleSendToBack = () => {
    if (!fabricCanvas || !activeObject) return;
    fabricCanvas.sendObjectToBack(activeObject);
    fabricCanvas.renderAll();
  };

  const handleToggleLock = () => {
    if (!fabricCanvas || !activeObject) return;
    const isLocked = activeObject.lockMovementX;
    activeObject.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      lockRotation: !isLocked,
      hasControls: isLocked, // Bật lại nút handles nếu mở khóa
    });
    fabricCanvas.renderAll();
    setActiveObject({ ...activeObject, lockMovementX: !isLocked });
  };

  const handleFlipHorizontal = () => {
    if (!fabricCanvas || !activeObject) return;
    activeObject.set('flipX', !activeObject.flipX);
    fabricCanvas.renderAll();
  };

  const handleFlipVertical = () => {
    if (!fabricCanvas || !activeObject) return;
    activeObject.set('flipY', !activeObject.flipY);
    fabricCanvas.renderAll();
  };

  const handleRotate90 = () => {
    if (!fabricCanvas || !activeObject) return;
    const currentAngle = activeObject.angle || 0;
    activeObject.set('angle', (currentAngle + 90) % 360);
    fabricCanvas.renderAll();
  };

  // THÊM Ô TEXTBOX MỚI
  const handleAddText = () => {
    if (!fabricCanvas) return;
    const textbox = new fabric.Textbox('Nhấp để gõ bài giảng...', {
      left: 200,
      top: 150,
      width: 400,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: color === '#000000' ? '#ffffff' : color,
    });
    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    fabricCanvas.renderAll();
    setTool('pointer');
  };

  // THÊM STICKY NOTE MỚI
  const handleAddStickyNote = (stk) => {
    if (!fabricCanvas) return;

    const rect = new fabric.Rect({
      width: 260,
      height: 200,
      fill: stk.bg,
      stroke: stk.border,
      strokeWidth: 2,
      rx: 16,
      ry: 16,
    });

    const text = new fabric.Textbox('📌 Nhập ghi chú tại đây...', {
      width: 230,
      fontSize: 22,
      fontFamily: 'Noto Sans',
      fill: stk.text,
      left: 15,
      top: 15,
    });

    const group = new fabric.Group([rect, text], {
      left: 250,
      top: 150,
    });

    fabricCanvas.add(group);
    fabricCanvas.setActiveObject(group);
    fabricCanvas.renderAll();
    setTool('pointer');
    setActiveWindow(null);
  };

  // THÊM SHAPES HÌNH HỌC MỚI
  const handleAddShape = (shapeType) => {
    if (!fabricCanvas) return;

    let shape = null;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({ left: 200, top: 150, width: 200, height: 120, fill: 'transparent', stroke: color, strokeWidth: 3 });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({ left: 200, top: 150, radius: 80, fill: 'transparent', stroke: color, strokeWidth: 3 });
    } else if (shapeType === 'triangle') {
      shape = new fabric.Triangle({ left: 200, top: 150, width: 160, height: 140, fill: 'transparent', stroke: color, strokeWidth: 3 });
    } else if (shapeType === 'line') {
      shape = new fabric.Line([50, 50, 250, 50], { left: 200, top: 150, stroke: color, strokeWidth: 3 });
    }

    if (shape) {
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
      setTool('pointer');
      setActiveWindow(null);
    }
  };

  // SOUND EFFECTS
  const playSoundEffect = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.04);
      } else if (type === 'win' || type === 'alarm') {
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.25);
        });
      }
    } catch (e) {}
  };

  // TIMER EFFECT
  useEffect(() => {
    let timerInterval = null;
    if (timerRunning && timerRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            playSoundEffect('alarm');
            alert('⏰ ĐÃ HẾT GIỜ BÀI LÀM / THỜI GIAN THẢO LUẬN!');
            return 0;
          }
          playSoundEffect('tick');
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning, timerRemaining]);

  const toggleToolbarPosition = () => {
    const posList = ['bottom', 'left', 'top', 'right'];
    const nextIdx = (posList.indexOf(toolbarPos) + 1) % posList.length;
    setToolbarPos(posList[nextIdx]);
  };

  const getToolbarStyle = () => {
    switch (toolbarPos) {
      case 'top':
        return 'fixed top-14 left-1/2 -translate-x-1/2 z-[60] bg-[#d8d2b8] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-1.5 animate-scale-up font-sans';
      case 'right':
        return 'fixed top-1/2 -translate-y-1/2 right-3 z-[60] bg-[#d8d2b8] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex flex-col items-center space-y-1.5 animate-scale-up font-sans';
      case 'left':
        return 'fixed top-1/2 -translate-y-1/2 left-3 z-[60] bg-[#d8d2b8] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex flex-col items-center space-y-1.5 animate-scale-up font-sans';
      case 'bottom':
      default:
        return 'fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] bg-[#d8d2b8] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-1.5 animate-scale-up font-sans';
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative overflow-hidden select-none font-sans ${
        bgType === 'greenboard'
          ? 'bg-[#0f382c]'
          : bgType === 'blackboard'
          ? 'bg-slate-950'
          : bgType === 'grid'
          ? 'bg-slate-100'
          : 'bg-white'
      }`}
    >
      {/* HEADER BAR WHITEBOARD */}
      <div className="bg-[#24211a] text-white px-4 py-2 flex items-center justify-between shadow-xl border-b border-[#3b362b] z-50 relative">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Thoát Bảng</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-black text-rose-500 text-sm tracking-wide">myViewBoard LMS</span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-xs font-extrabold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/30 truncate max-w-md">
              {lessonTitle} (Fabric Object-Oriented Canvas)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={bgType}
            onChange={(e) => setBgType(e.target.value)}
            className="bg-slate-800 text-slate-100 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-700 outline-none"
          >
            <option value="greenboard">🟩 Nền: Bảng Xanh</option>
            <option value="blackboard">⬛ Nền: Bảng Đen</option>
            <option value="whiteboard">⬜ Nền: Trắng Tinh</option>
            <option value="grid">▦ Nền: Ô Kẻ Tập</option>
          </select>

          <span className="text-xs text-slate-400 font-bold px-2">
            {new Date().toLocaleDateString('vi-VN')} • Fabric.js v6
          </span>
        </div>
      </div>

      {/* WORKSPACE FABRIC CANVAS CONTAINER */}
      <div ref={containerRef} className="relative w-full h-[calc(100vh-50px)] overflow-hidden">
        <canvas ref={canvasRef} className="absolute top-0 left-0" />

        {/* MENU NỔI (FLOATING TOOLBAR KẾ BÊN ĐỐI TƯỢNG ĐANG SELECT) */}
        {activeObject && floatingMenuPos && (
          <div
            style={{
              left: `${floatingMenuPos.left}px`,
              top: `${floatingMenuPos.top}px`,
            }}
            className="fixed z-[100] bg-white/95 backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-sky-400/80 flex items-center space-x-2 animate-scale-up font-sans"
          >
            <button
              onClick={handleDeleteActiveObject}
              className="p-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl flex items-center justify-center transition border border-rose-300 shadow-2xs cursor-pointer"
              title="🗑️ Xóa đối tượng này (Delete)"
            >
              <Trash2 className="w-4 h-4 text-rose-700" />
            </button>

            <span className="w-px h-5 bg-slate-300" />

            <button
              onClick={handleBringToFront}
              className="p-2 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-xl flex items-center justify-center transition border border-sky-300 shadow-2xs cursor-pointer"
              title="🥞 Đưa lớp vật thể Lên Trên Cùng (Bring to Front)"
            >
              <Layers className="w-4 h-4 text-sky-700" />
            </button>

            <button
              onClick={handleSendToBack}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center transition border border-slate-300 shadow-2xs cursor-pointer"
              title="🥞 Đưa lớp vật thể Về Sau Cùng (Send to Back)"
            >
              <Layers3 className="w-4 h-4 text-slate-700" />
            </button>

            <span className="w-px h-5 bg-slate-300" />

            <button
              onClick={handleToggleLock}
              className={`p-2 rounded-xl flex items-center justify-center transition border shadow-2xs cursor-pointer ${
                activeObject.lockMovementX ? 'bg-rose-600 text-white border-rose-700' : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300'
              }`}
              title={activeObject.lockMovementX ? '🔒 Đang Khóa Vị Trí (Mở khóa)' : '🔒 Khóa vị trí vật thể'}
            >
              {activeObject.lockMovementX ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-amber-800" />}
            </button>

            <span className="w-px h-5 bg-slate-300" />

            <button
              onClick={handleFlipHorizontal}
              className="p-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-xl flex items-center justify-center transition border border-purple-300 shadow-2xs cursor-pointer"
              title="↔️ Lật ngang (Flip Horizontal)"
            >
              <FlipHorizontal className="w-4 h-4 text-purple-700" />
            </button>

            <button
              onClick={handleRotate90}
              className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl flex items-center justify-center transition border border-amber-300 shadow-2xs cursor-pointer"
              title="🎯 Xoay 90° (Rotate)"
            >
              <RotateIcon className="w-4 h-4 text-amber-700" />
            </button>
          </div>
        )}
      </div>

      {/* POPUP BẢNG CHỌN STICKY NOTE */}
      {activeWindow === 'stickies' && (
        <div className="fixed top-16 left-16 z-[100] bg-white border-2 border-slate-300 rounded-2xl shadow-2xl p-4 w-72 space-y-3 animate-scale-up font-sans text-slate-900">
          <div className="flex justify-between items-center border-b pb-2 font-extrabold text-xs text-slate-800">
            <span className="flex items-center space-x-1.5 text-amber-700">
              <StickyNote className="w-4 h-4 text-amber-500" />
              <span>Ghi Chú Sticky Notes</span>
            </span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {STICKY_COLORS.map((stk) => (
              <button
                key={stk.name}
                onClick={() => handleAddStickyNote(stk)}
                style={{ backgroundColor: stk.bg, borderColor: stk.border, color: stk.text }}
                className="p-3 rounded-xl border-2 font-extrabold text-xs shadow-xs hover:shadow-md transition transform hover:scale-105 text-center flex flex-col items-center justify-center space-y-1 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-md border shadow-xs" style={{ backgroundColor: stk.bg, borderColor: stk.border }} />
                <span>{stk.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* POPUP SHAPES HÌNH HỌC */}
      {activeWindow === 'shapes' && (
        <div className="fixed top-16 left-16 z-[100] bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-4 w-72 space-y-4 animate-scale-up font-sans text-slate-900">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-xs text-slate-800">
            <span>Shapes Hình Học & Bảng Màu</span>
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
                  className={`w-6 h-6 rounded-full border border-slate-300 shadow-2xs transition transform hover:scale-110 ${
                    color === c ? 'ring-2 ring-emerald-600 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-extrabold pt-2 border-t border-[#c4bb9c]">
            <button onClick={() => handleAddShape('rect')} className="p-2 bg-white border border-slate-300 rounded-xl flex items-center space-x-1.5">
              <Square className="w-4 h-4 text-slate-700" />
              <span>Hình Chữ Nhật</span>
            </button>
            <button onClick={() => handleAddShape('circle')} className="p-2 bg-white border border-slate-300 rounded-xl flex items-center space-x-1.5">
              <Circle className="w-4 h-4 text-slate-700" />
              <span>Hình Tròn</span>
            </button>
            <button onClick={() => handleAddShape('triangle')} className="p-2 bg-white border border-slate-300 rounded-xl flex items-center space-x-1.5">
              <Triangle className="w-4 h-4 text-slate-700" />
              <span>Hình Tam Giác</span>
            </button>
            <button onClick={() => handleAddShape('line')} className="p-2 bg-white border border-slate-300 rounded-xl flex items-center space-x-1.5">
              <Minus className="w-4 h-4 text-slate-700" />
              <span>Đường Thẳng</span>
            </button>
          </div>
        </div>
      )}

      {/* THANH TOOLBAR DƯỚI CÙNG SÁT MEP (BOTTOM-3) */}
      <div className={getToolbarStyle()}>
        <button
          onClick={toggleToolbarPosition}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-md font-bold cursor-pointer"
          title="Xoay chuyển vị trí thanh công cụ (Dưới -> Trái -> Trên -> Phải)"
        >
          <Move className="w-4 h-4 animate-pulse" />
        </button>

        {/* NÚT SELECT TOOL MŨI TÊN (FABRIC OBJECT TRANSFORMER) */}
        <button
          onClick={() => setTool('pointer')}
          className={`p-2 rounded-xl transition cursor-pointer relative ${
            tool === 'pointer'
              ? 'bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Select Tool (Nhấp hoặc khoanh vùng chọn & di chuyển đối tượng)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTool('hand')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'hand'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bàn tay kéo trượt toàn bộ canvas"
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          onClick={handleAddText}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'text'
              ? 'bg-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Tạo ô văn bản Fabric Textbox"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveWindow(activeWindow === 'stickies' ? null : 'stickies')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeWindow === 'stickies'
              ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Sticky Note ghi chú nổi bật"
        >
          <StickyNote className="w-4 h-4 text-amber-600" />
        </button>

        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'pen'
              ? 'bg-emerald-600 text-white shadow-md scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bút vẽ tự do Fabric Pencil"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTool('highlighter')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'highlighter'
              ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bút dạ quang làm nổi bật câu chữ"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'eraser'
              ? 'bg-rose-600 text-white shadow-md scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Cục tẩy nhấp xóa object"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
          className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800 cursor-pointer"
          title="Bảng màu & Shapes hình học"
        >
          <Square className="w-4 h-4 text-purple-700" />
        </button>

        <button
          onClick={handleDeleteActiveObject}
          className="p-2 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-rose-600 cursor-pointer font-bold"
          title="Xóa đối tượng đang được chọn (phím Delete)"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
        </button>
      </div>
    </div>
  );
}
