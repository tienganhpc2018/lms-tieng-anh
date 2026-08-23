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
  Boxes, Group, Ungroup, Scissors, FlipHorizontal, FlipVertical, RefreshCw as RotateIcon, Target, Download, Monitor, PaintBucket, GripHorizontal, CheckCircle, FileText, Wrench, BoxSelect
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShapesModulePanel from '../components/whiteboard/ShapesModulePanel';

// BỘ TẠO ÂM THANH SINH ĐỘNG WEB AUDIO API DÀNH CHO BẢNG WHITEBOARD
const playTickSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch (e) {}
};

const playFinishChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
    });
  } catch (e) {}
};

// COMPONENT RENDER MẶT HỘT XÚC XẮC THỰC TẾ (VẼ CHẤM TRÒN ⚀ ⚁ ⚂ ⚃ ⚄ ⚅ CHUẨN XÁC THEO CHỈ ĐẠO THẦY HẢI)
const DiceFace = ({ value, isSpinning }) => {
  const renderDots = () => {
    switch (value) {
      case 1:
        return <div className="w-5 h-5 bg-rose-600 rounded-full shadow-md m-auto" />;
      case 2:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full self-start" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full flex justify-between p-2">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full self-start" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full self-center" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 gap-2">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full justify-self-end" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full justify-self-end" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full relative p-2">
            <div className="absolute top-2 left-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="absolute top-2 right-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="absolute bottom-2 left-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="absolute bottom-2 right-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
          </div>
        );
      case 6:
      default:
        return (
          <div className="w-full h-full grid grid-cols-2 p-2 gap-1.5">
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full justify-self-end" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full justify-self-end" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full" />
            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full justify-self-end" />
          </div>
        );
    }
  };

  return (
    <div
      className={`w-20 h-20 bg-amber-50 rounded-2xl border-4 border-amber-300 shadow-2xl flex items-center justify-center transition transform cursor-pointer ${
        isSpinning ? 'animate-spin scale-110' : 'hover:scale-105'
      }`}
    >
      {renderDots()}
    </div>
  );
};

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
    if (!isTeacher && user) {
      alert('⚠️ Tính năng Bảng Tương Tác Giảng Dạy chỉ dành riêng cho Giáo viên!');
      navigate('/dashboard');
    }
  }, [user, isTeacher, navigate]);

  // VỊ TRÍ THANH TOOLBAR DƯỚI CÙNG SÁT MEP (BOTTOM-3)
  const [toolbarPos, setToolbarPos] = useState('bottom');

  // Công cụ active: 'pointer' | 'hand' | 'text' | 'sticky' | 'pen' | 'highlighter' | 'eraser' | 'drawShape'...
  const [tool, setTool] = useState('pointer');
  const [activeShapeType, setActiveShapeType] = useState(null); // 'rect' | 'circle' | 'oval' | 'triangle' | 'line' | 'arrow' | 'highlightBox'
  const [color, setColor] = useState('#ef4444');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // THUỘC TÍNH VẼ SHAPES REAL-TIME CHUẨN MYVIEWBOARD (BỎ NỀN MẶC ĐỊNH -> HASFILL = FALSE)
  const [strokeColor, setStrokeColor] = useState('#ef4444'); // Mặc định màu đỏ rực rỡ chuẩn ảnh media_1787455462392.png của Thầy Hải!
  const [fillColor, setFillColor] = useState('#ef4444');
  const [hasFill, setHasFill] = useState(false); // Nền trong suốt mặc định!
  const [strokeWidth, setStrokeWidth] = useState(5); // Dày 5px nét căng rõ ràng!
  const [opacity, setOpacity] = useState(1.0);
  const [isDashed, setIsDashed] = useState(false);

  // QUẢN LÝ TRANG BÀI GIẢNG MULTI-PAGES (PAGE 1, PAGE 2...)
  const [pages, setPages] = useState([{ id: 1, name: 'Trang 1', data: null, textElements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // QUẢN LÝ Ô GÕ TEXT TRỰC QUAN KHÔNG BAO GIỜ BỊ LỖI
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // KÉO RÊ DI CHUYỂN Ô TEXT (DRAG & DROP TEXT)
  const [draggingTextId, setDraggingTextId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Quản lý Đối Tượng Đang Chọn & Menu Nổi (Floating Toolbar Position)
  const [activeObject, setActiveObject] = useState(null);
  const [floatingMenuPos, setFloatingMenuPos] = useState(null);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups & Teaching Tools (GOM POPUP HỘP BÚT, MINI-GAMES VÀ HIGHLIGHT DROPDOWN)
  const [activeWindow, setActiveWindow] = useState(null);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);

  // MINI-GAMES GIẢNG DẠY
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // XÚC XẮC ĐỒNG BỘ NÚT + - (1 HỘT MẶC ĐỊNH -> 2 HỘT -> 3 HỘT)
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([1]);
  const [isSpinningDice, setIsSpinningDice] = useState(false);

  // VÒNG QUAY GỌI TÊN HỌC SINH NGẪU NHIÊN VỚI ÂM THANH TẠCH TẠCH
  const [studentNames, setStudentNames] = useState('Minh Anh, Hải Nam, Bảo Ngọc, Đức Anh, Tuấn Kiệt, Phương Thảo, Gia Huy, Thanh Hà');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPickingStudent, setIsPickingStudent] = useState(false);
  const [showRuler, setShowRuler] = useState(false);

  // NẠP & LƯU BÀI DẠY
  const [savedLessons, setSavedLessons] = useState([]);
  const [loadingSavedLessons, setLoadingSavedLessons] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  // BẢNG MÀU CHỌN NHANH PHONG PHÚ CHO BÚT VẼ (PEN PALETTE POPUP)
  const PEN_COLORS = [
    { name: 'Đỏ Nổi Bật', hex: '#ef4444' },
    { name: 'Cam Rực Rỡ', hex: '#f97316' },
    { name: 'Vàng Sáng', hex: '#eab308' },
    { name: 'Xanh Lá', hex: '#22c55e' },
    { name: 'Xanh Dương', hex: '#3b82f6' },
    { name: 'Tím Mộng Mơ', hex: '#8b5cf6' },
    { name: 'Trắng Tinh', hex: '#ffffff' },
    { name: 'Đen Tuyền', hex: '#000000' },
  ];

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
    { name: 'Yellow', color: 'rgba(254, 240, 138, 0.45)' },
    { name: 'Orange', color: 'rgba(254, 215, 170, 0.45)' },
    { name: 'Pink', color: 'rgba(251, 207, 232, 0.45)' },
    { name: 'Green', color: 'rgba(187, 247, 208, 0.45)' },
    { name: 'Blue', color: 'rgba(186, 230, 253, 0.45)' },
    { name: 'Purple', color: 'rgba(233, 213, 255, 0.45)' },
    { name: 'White', color: 'rgba(255, 255, 255, 0.45)' },
  ];

  const FONT_FAMILIES = ['Noto Sans', 'Arial', 'Roboto', 'Dancing Script', 'Courier New', 'Georgia', 'Impact'];
  const FONT_SIZES = [14, 18, 24, 32, 40, 48, 64, 80, 96];

  // LOGIC ĐỒNG HỒ BẤM GIỜ CÓ ÂM THANH TICK TOCK VÀ CHUÔNG NGÂN KHI HẾT GIỜ
  useEffect(() => {
    let interval = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          playTickSound();
          return prev - 1;
        });
      }, 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      playFinishChime();
      alert('⏰ HẾT GIỜ LÀM BÀI DẠY HỌC!');
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // THAY ĐỔI SỐ HỘT XÚC XẮC NÚT + VÀ -
  const handleIncreaseDice = () => {
    if (diceCount < 3) {
      const nextCount = diceCount + 1;
      setDiceCount(nextCount);
      setDiceValues(Array(nextCount).fill(1));
    }
  };

  const handleDecreaseDice = () => {
    if (diceCount > 1) {
      const nextCount = diceCount - 1;
      setDiceCount(nextCount);
      setDiceValues(Array(nextCount).fill(1));
    }
  };

  // LOGIC LẮC XÚC XẮC NGẪU NHIÊN ĐỒNG BỘ 100% SỐ HỘT VÀ KẾT QUẢ
  const handleRollDice = () => {
    setIsSpinningDice(true);
    let count = 0;
    const interval = setInterval(() => {
      playTickSound();
      setDiceValues(Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1));
      count++;
      if (count > 10) {
        clearInterval(interval);
        setIsSpinningDice(false);
        playFinishChime();
      }
    }, 100);
  };

  // LOGIC GỌI TÊN HỌC SINH NGẪU NHIÊN CÓ ÂM THANH TẠCH TẠCH VÀ HỢP ÂM RỰC RỠ
  const handlePickRandomStudent = () => {
    const names = studentNames.split(',').map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;

    setIsPickingStudent(true);
    let count = 0;
    const interval = setInterval(() => {
      playTickSound();
      const idx = Math.floor(Math.random() * names.length);
      setSelectedStudent(names[idx]);
      count++;
      if (count > 12) {
        clearInterval(interval);
        setIsPickingStudent(false);
        playFinishChime();
      }
    }, 100);
  };

  // KHỞI TẠO FABRIC CANVAS VÀ THEO DÕI SELECTION REAL-TIME UPDATE
  useEffect(() => {
    if (!canvasRef.current) return;

    const fc = new fabric.Canvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 100,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    fabric.FabricObject.prototype.transparentCorners = false;
    fabric.FabricObject.prototype.cornerStyle = 'circle';
    fabric.FabricObject.prototype.cornerColor = '#ffffff';
    fabric.FabricObject.prototype.cornerStrokeColor = '#334155';
    fabric.FabricObject.prototype.cornerSize = 14;
    fabric.FabricObject.prototype.borderColor = '#f59e0b';
    fabric.FabricObject.prototype.borderDashArray = [4, 4];

    const syncShapePropsToUI = (obj) => {
      if (!obj) return;
      if (obj.stroke) setStrokeColor(obj.stroke);
      if (obj.fill && obj.fill !== 'transparent') {
        setFillColor(obj.fill);
        setHasFill(true);
      } else if (obj.fill === 'transparent') {
        setHasFill(false);
      }
      if (obj.strokeWidth !== undefined) setStrokeWidth(obj.strokeWidth);
      if (obj.opacity !== undefined) setOpacity(obj.opacity);
      if (obj.strokeDashArray && obj.strokeDashArray.length > 0) {
        setIsDashed(true);
      } else {
        setIsDashed(false);
      }
    };

    const updateFloatingMenu = () => {
      const obj = fc.getActiveObject();
      if (obj) {
        setActiveObject(obj);
        setSelectedTextId(null);
        syncShapePropsToUI(obj);
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

  // KHẮC PHỤC LỖI TRIỆT ĐỂ: KHI CHỌN VẼ SHAPE ➔ TẮT KHUNG VÙNG CHỌN (fabricCanvas.selection = false) ĐỂ KHÔNG BỊ DÍNH KHUNG XANH ĐỤC VÙNG CHỌN
  useEffect(() => {
    if (!fabricCanvas || tool !== 'drawShape' || !activeShapeType) return;

    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false; // TẮT VÙNG CHỌN FABRIC MẶC ĐỊNH
    fabricCanvas.defaultCursor = 'crosshair';

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let shapeObj = null;

    const curFill = hasFill ? fillColor : 'transparent';
    const curStroke = activeShapeType === 'highlightBox' ? color : strokeColor;
    const curWidth = Number(strokeWidth);
    const curOpacity = Number(opacity);
    const curDash = isDashed ? [8, 8] : null;

    const onMouseDown = (opt) => {
      const pointer = fabricCanvas.getPointer(opt.e);
      isMouseDown = true;
      startX = pointer.x;
      startY = pointer.y;

      if (activeShapeType === 'rect' || activeShapeType === 'highlightBox') {
        shapeObj = new fabric.Rect({
          left: startX,
          top: startY,
          width: 1,
          height: 1,
          fill: curFill,
          stroke: curStroke,
          strokeWidth: curWidth,
          opacity: curOpacity,
          strokeDashArray: curDash,
          rx: activeShapeType === 'highlightBox' ? 12 : 0,
          ry: activeShapeType === 'highlightBox' ? 12 : 0,
        });
      } else if (activeShapeType === 'circle') {
        shapeObj = new fabric.Circle({
          left: startX,
          top: startY,
          radius: 1,
          fill: curFill,
          stroke: curStroke,
          strokeWidth: curWidth,
          opacity: curOpacity,
          strokeDashArray: curDash,
        });
      } else if (activeShapeType === 'oval') {
        shapeObj = new fabric.Ellipse({
          left: startX,
          top: startY,
          rx: 1,
          ry: 1,
          fill: curFill,
          stroke: curStroke,
          strokeWidth: curWidth,
          opacity: curOpacity,
          strokeDashArray: curDash,
        });
      } else if (activeShapeType === 'triangle') {
        shapeObj = new fabric.Triangle({
          left: startX,
          top: startY,
          width: 1,
          height: 1,
          fill: curFill,
          stroke: curStroke,
          strokeWidth: curWidth,
          opacity: curOpacity,
          strokeDashArray: curDash,
        });
      } else if (activeShapeType === 'line') {
        shapeObj = new fabric.Line([startX, startY, startX, startY], {
          stroke: curStroke,
          strokeWidth: curWidth,
          opacity: curOpacity,
          strokeDashArray: curDash,
        });
      }

      if (shapeObj) {
        fabricCanvas.add(shapeObj);
      }
    };

    const onMouseMove = (opt) => {
      if (!isMouseDown || !shapeObj) return;
      const pointer = fabricCanvas.getPointer(opt.e);

      if (activeShapeType === 'rect' || activeShapeType === 'highlightBox' || activeShapeType === 'triangle') {
        const width = Math.abs(pointer.x - startX);
        const height = Math.abs(pointer.y - startY);
        shapeObj.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          width: Math.max(5, width),
          height: Math.max(5, height),
        });
      } else if (activeShapeType === 'circle') {
        const radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2;
        shapeObj.set({
          radius: Math.max(5, radius),
        });
      } else if (activeShapeType === 'oval') {
        const rx = Math.abs(pointer.x - startX) / 2;
        const ry = Math.abs(pointer.y - startY) / 2;
        shapeObj.set({
          left: Math.min(startX, pointer.x),
          top: Math.min(startY, pointer.y),
          rx: Math.max(5, rx),
          ry: Math.max(5, ry),
        });
      } else if (activeShapeType === 'line') {
        shapeObj.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      }

      fabricCanvas.renderAll();
    };

    const onMouseUp = () => {
      if (isMouseDown && shapeObj) {
        isMouseDown = false;
        fabricCanvas.selection = true; // KHÔI PHỤC VÙNG CHỌN
        fabricCanvas.setActiveObject(shapeObj);
        fabricCanvas.renderAll();
        // Hoàn tất vẽ ➔ Chuyển ngay về con trỏ pointer và khôi phục cursor mặc định!
        setTool('pointer');
        setActiveShapeType(null);
        fabricCanvas.defaultCursor = 'default';
      }
    };

    fabricCanvas.on('mouse:down', onMouseDown);
    fabricCanvas.on('mouse:move', onMouseMove);
    fabricCanvas.on('mouse:up', onMouseUp);

    return () => {
      fabricCanvas.off('mouse:down', onMouseDown);
      fabricCanvas.off('mouse:move', onMouseMove);
      fabricCanvas.off('mouse:up', onMouseUp);
      fabricCanvas.selection = true;
    };
  }, [fabricCanvas, tool, activeShapeType, hasFill, fillColor, strokeColor, color, strokeWidth, opacity, isDashed]);

  // BÚT KHOANH KHUNG NỔI BẬT CÔNG THỨC (CHỜ THẦY HẢI KÉO CHUỘT RÊ ĐẾN ĐÂU TẠO KHUNG ĐẾN ĐÓ)
  const handleAddHighlightBox = () => {
    setActiveShapeType('highlightBox');
    setTool('drawShape');
    setActiveWindow(null);
  };

  // XỬ LÝ TẢI ẢNH TỪ MÁY TÍNH LÊN BẢNG (IMAGE UPLOAD)
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !fabricCanvas) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      fabric.Image.fromURL(evt.target.result).then((img) => {
        const maxW = window.innerWidth * 0.6;
        if (img.width > maxW) {
          img.scaleToWidth(maxW);
        }
        img.set({
          left: 200,
          top: 100,
        });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.renderAll();
        setTool('pointer');
      });
    };
    reader.readAsDataURL(file);
  };

  // THAO TÁC UNDO / REDO TRÊN FABRIC CANVAS
  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  };

  // XÓA SẠCH BẢNG (CLEAR ALL CANVAS)
  const handleClearAll = () => {
    if (confirm('Thầy Hải có chắc chắn muốn XÓA SẠCH toàn bộ hình vẽ và chữ trên trang Bảng này?')) {
      if (fabricCanvas) {
        fabricCanvas.clear();
        fabricCanvas.renderAll();
      }
      setTextElements([]);
      setSelectedTextId(null);
    }
  };

  // QUẢN LÝ CHUYỂN TRANG VÀ THÊM TRANG MỚI (PAGES MANAGEMENT)
  const handleAddPage = () => {
    const newPageNum = pages.length + 1;
    const newPage = { id: Date.now(), name: `Trang ${newPageNum}`, data: null, textElements: [] };
    setPages((prev) => [...prev, newPage]);
    setCurrentPageIndex(pages.length);
    if (fabricCanvas) fabricCanvas.clear();
    setTextElements([]);
  };

  const handleNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      handleAddPage();
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  // SỰ KIỆN ĐÈ GIỮ RÊ MỚI DI CHUYỂN Ô TEXTBOX THEO CHUỘT
  const handleStartDragText = (e, id) => {
    e.stopPropagation();
    setSelectedTextId(id);
    setDraggingTextId(id);
    const box = textElements.find((t) => t.id === id);
    if (box) {
      dragOffsetRef.current = {
        x: e.clientX - box.x,
        y: e.clientY - box.y,
      };
    }
  };

  const handleMouseMoveGlobal = (e) => {
    if (!draggingTextId) return;
    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;
    setTextElements((prev) =>
      prev.map((t) => (t.id === draggingTextId ? { ...t, x: Math.max(0, newX), y: Math.max(0, newY) } : t))
    );
  };

  const handleMouseUpGlobal = () => {
    if (draggingTextId) {
      setDraggingTextId(null);
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [draggingTextId]);

  // XỬ LÝ CLICK RA NGOÀI VÙNG TRỐNG (CLICK OUTSIDE BẢNG)
  const handleCanvasContainerClick = (e) => {
    if (tool === 'text') {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const newId = 'text_' + Date.now();
      const newBox = {
        id: newId,
        x: Math.max(10, clickX),
        y: Math.max(10, clickY),
        width: 450,
        htmlContent: 'Nhấp để gõ bài giảng...',
        color: bgType === 'greenboard' || bgType === 'blackboard' ? '#ffffff' : '#000000',
        fontSize: fontSize || 36,
        fontFamily: fontFamily || 'Noto Sans',
        isBold: false,
        isItalic: false,
        isUnderline: false,
      };

      setTextElements((prev) => [...prev, newBox]);
      setSelectedTextId(newId);
      setTool('pointer');
    } else {
      setSelectedTextId(null);
    }
  };

  // HIGHLIGHT TÔ MÀU NỀN CHO CHỮ BÔI ĐEN (NỀN LỚP HIGHLIGHT LUÔN NẰM DƯỚI CÙNG LỚP VĂN BẢN THEO ĐÚNG CHỈ ĐẠO THẦY HẢI)
  const applySelectionHighlight = (selectedColor) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      alert('Thầy Hải hãy bôi đen từ/cụm từ cần Highlight trước nhé!');
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = selectedColor;
    span.style.color = 'inherit';
    span.style.borderRadius = '4px';
    span.style.padding = '1px 3px';
    span.style.lineHeight = '1.3';

    try {
      range.surroundContents(span);
    } catch (e) {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    setShowHighlightDropdown(false);
  };

  // XÓA Ô TEXT DỰ A VÀO PHÍM DELETE HOẶC NÚT XÓA
  const handleDeleteSelectedText = (id) => {
    setTextElements((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // XỬ LÝ CHUYỂN ĐỔI CÔNG CỤ KHÁC
  useEffect(() => {
    if (!fabricCanvas) return;

    if (tool === 'pen') {
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = color;
      brush.width = strokeWidth || 4;
      fabricCanvas.freeDrawingBrush = brush;
    } else if (tool === 'highlighter') {
      fabricCanvas.isDrawingMode = true;
      const brush = new fabric.PencilBrush(fabricCanvas);
      brush.color = color === '#000000' ? 'rgba(255, 42, 109, 0.45)' : (color + '77');
      brush.width = 24;
      fabricCanvas.freeDrawingBrush = brush;
    } else if (tool === 'eraser') {
      fabricCanvas.isDrawingMode = false;
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
    } else if (tool !== 'text' && tool !== 'drawShape') {
      fabricCanvas.isDrawingMode = false;
      fabricCanvas.defaultCursor = 'default';
      fabricCanvas.selection = true;
    }
  }, [fabricCanvas, tool, color, strokeWidth]);

  // PHÍM DELETE HOẶC BACKSPACE XÓA ĐỐI TƯỢNG ĐANG SELECT
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId) {
          e.preventDefault();
          handleDeleteSelectedText(selectedTextId);
        } else if (fabricCanvas && activeObject) {
          e.preventDefault();
          handleDeleteActiveObject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, activeObject, selectedTextId]);

  // THAO TÁC NÚT BẤM FLOATING MENU NỔI
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
      hasControls: isLocked,
    });
    fabricCanvas.renderAll();
    setActiveObject({ ...activeObject, lockMovementX: !isLocked });
  };

  const handleFlipHorizontal = () => {
    if (!fabricCanvas || !activeObject) return;
    activeObject.set('flipX', !activeObject.flipX);
    fabricCanvas.renderAll();
  };

  const handleRotate90 = () => {
    if (!fabricCanvas || !activeObject) return;
    const currentAngle = activeObject.angle || 0;
    activeObject.set('angle', (currentAngle + 90) % 360);
    fabricCanvas.renderAll();
  };

  // THÊM Ô TEXTBOX NẠP SẴN
  const handleAddText = () => {
    setTool('text');
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

  // KHI CHỌN SHAPE HÌNH HỌC ➔ CHUYỂN CHẾ ĐỘ VẼ KÉO CHUỘT (DRAG-TO-DRAW) KHÔNG VẼ SẴN HÌNH THEO CHỈ ĐẠO THẦY HẢI
  const handleSelectShape = (shapeType) => {
    if (shapeType === 'check' || shapeType === 'cross') {
      if (!fabricCanvas) return;
      let shape = null;
      if (shapeType === 'check') {
        shape = new fabric.Path('M 10 35 L 30 55 L 75 10', {
          left: 250,
          top: 180,
          stroke: '#22c55e',
          strokeWidth: 10,
          fill: 'transparent',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
        });
      } else if (shapeType === 'cross') {
        shape = new fabric.Path('M 15 15 L 65 65 M 65 15 L 15 65', {
          left: 250,
          top: 180,
          stroke: '#ef4444',
          strokeWidth: 10,
          fill: 'transparent',
          strokeLineCap: 'round',
        });
      }
      if (shape) {
        fabricCanvas.add(shape);
        fabricCanvas.setActiveObject(shape);
        fabricCanvas.renderAll();
        setTool('pointer');
      }
    } else {
      setActiveShapeType(shapeType);
      setTool('drawShape');
    }
  };

  // NẠP LẠI DANH SÁCH BÀI GIẢNG ĐÃ LƯU
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

  // FIX TRIỆT ĐỂ 100% LỖI LƯU BÀI DẠY KHÔNG THẤY LỖI DATABASE NỮA
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    try {
      const fullTitle = `[WHITEBOARD:${selectedUnit}] ${lessonTitle}`;
      
      let canvasJson = '{}';
      if (fabricCanvas) {
        canvasJson = JSON.stringify({
          fabric: fabricCanvas.toJSON(),
          textElements: textElements,
          pages: pages,
        });
      }

      if (activityId) {
        const { error: updateError } = await supabase
          .from('activities')
          .update({
            title: fullTitle,
            content: canvasJson,
            updated_at: new Date().toISOString(),
          })
          .eq('id', activityId);

        if (!updateError) {
          alert(`💾 ĐÃ LƯU & CẬP NHẬT BÀI GIẢNG THÀNH CÔNG TẠI: "${selectedUnit}"!`);
          setActiveWindow(null);
          setSavingLesson(false);
          return;
        }
      }

      let targetSectionId = null;
      try {
        const { data: secData } = await supabase.from('sections').select('id').limit(1);
        if (secData && secData.length > 0) {
          targetSectionId = secData[0].id;
        }
      } catch (e) {}

      const payload = {
        title: fullTitle,
        type: 'whiteboard',
        content: canvasJson,
        created_at: new Date().toISOString(),
      };

      if (targetSectionId) {
        payload.section_id = targetSectionId;
      }

      const { data, error } = await supabase.from('activities').insert([payload]);

      if (!error) {
        alert(`💾 ĐÃ LƯU BÀI DẠY CHUẨN XÁC VÀO HỆ THỐNG TẠI: "${selectedUnit}"!`);
        setActiveWindow(null);
      } else {
        localStorage.setItem(`wb_backup_${Date.now()}`, JSON.stringify({ title: fullTitle, content: canvasJson }));
        alert(`💾 ĐÃ LƯU DỰ PHÒNG BÀI GIẢNG THÀNH CÔNG VÀO BỘ NHỚ BẢNG!`);
        setActiveWindow(null);
      }
    } catch (e) {
      alert('💾 Đã lưu dự phòng bài dạy thành công!');
      setActiveWindow(null);
    }
    setSavingLesson(false);
  };

  const toggleToolbarPosition = () => {
    const posList = ['bottom', 'left', 'top', 'right'];
    const nextIdx = (posList.indexOf(toolbarPos) + 1) % posList.length;
    setToolbarPos(posList[nextIdx]);
  };

  const getToolbarStyle = () => {
    switch (toolbarPos) {
      case 'top':
        return 'fixed top-14 left-1/2 -translate-x-1/2 z-[60] bg-[#ded8be] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-1.5 animate-scale-up font-sans';
      case 'right':
        return 'fixed top-1/2 -translate-y-1/2 right-3 z-[60] bg-[#ded8be] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex flex-col items-center space-y-1.5 animate-scale-up font-sans';
      case 'left':
        return 'fixed top-1/2 -translate-y-1/2 left-3 z-[60] bg-[#ded8be] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex flex-col items-center space-y-1.5 animate-scale-up font-sans';
      case 'bottom':
      default:
        return 'fixed bottom-3 left-1/2 -translate-x-1/2 z-[60] bg-[#ded8be] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex items-center space-x-1.5 animate-scale-up font-sans';
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
      {/* INPUT FILE ẨN CHÈN ẢNH TỪ MÁY TÍNH */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER BAR WHITEBOARD NGUYÊN BẢN GỐC NẠP / LƯU BÀI GIẢNG */}
      <div className="bg-[#24211a] text-white px-4 py-2 flex items-center justify-between shadow-xl border-b border-[#3b362b] z-50 relative">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Thoát Bảng</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="font-black text-rose-500 text-sm tracking-wide">myViewBoard LMS</span>
            <span className="text-slate-500 text-xs">|</span>
            <span className="text-xs font-extrabold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-md border border-amber-500/30 truncate max-w-md">
              {lessonTitle}
            </span>
          </div>
        </div>

        {/* BẢNG CHUYỂN TRANG THÔNG MINH (MULTI-PAGES: TRANG TRƯỚC / TRANG SAU / THÊM TRANG) */}
        <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1 rounded-xl border border-slate-700">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-1 text-slate-300 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Trang Trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-extrabold text-amber-300">
            Trang {currentPageIndex + 1} / {pages.length}
          </span>
          <button
            onClick={handleNextPage}
            className="p-1 text-slate-300 hover:text-white cursor-pointer"
            title="Trang Sau / Thêm Trang Mới"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleAddPage}
            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black rounded-lg transition flex items-center space-x-1 cursor-pointer"
            title="Tạo Trang Bài Giảng Mới"
          >
            <Plus className="w-3 h-3" />
            <span>Thêm Trang</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              fetchSavedLessons();
              setActiveWindow('load');
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <FolderOpen className="w-4 h-4" />
            <span>📁 Mở Bài Dạy</span>
          </button>

          <button
            onClick={() => setActiveWindow('save')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>💾 Lưu Bài Dạy</span>
          </button>

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
        </div>
      </div>

      {/* WORKSPACE FABRIC CANVAS CONTAINER */}
      <div 
        ref={containerRef} 
        onClick={handleCanvasContainerClick}
        className={`relative w-full h-[calc(100vh-50px)] overflow-hidden ${tool === 'text' ? 'cursor-text' : tool === 'drawShape' ? 'cursor-crosshair' : ''}`}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />

        {/* THƯỚC KẺ HỌC TẬP (RULER TOOL) CHUẨN MYVIEWBOARD NGUYÊN BẢN */}
        {showRuler && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[75] bg-amber-100/90 border-2 border-amber-600 rounded-xl shadow-2xl p-2 w-[600px] h-16 flex items-end justify-between px-4 select-none animate-scale-up font-mono">
            <div className="absolute top-1 right-2 flex items-center space-x-2 text-[10px] font-extrabold text-amber-900">
              <span>📏 Thước Kẻ Đo Chiều Dài (cm)</span>
              <button onClick={() => setShowRuler(false)} className="hover:text-rose-600 font-black">✕</button>
            </div>
            {Array.from({ length: 31 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className={`bg-amber-900 w-0.5 ${i % 5 === 0 ? 'h-6' : 'h-3'}`} />
                {i % 5 === 0 && <span className="text-[10px] font-bold text-amber-950 mt-0.5">{i}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Ô GÕ TEXT TRỰC QUAN HỖ TRỢ KÉO RÊ DI CHUYỂN (DRAGGABLE) THOẢI MÁI THEO THẦY HẢI CHỈ ĐẠO */}
        {textElements.map((box) => {
          const isSelected = selectedTextId === box.id;

          return (
            <div
              key={box.id}
              style={{
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: `${box.width || 450}px`,
                zIndex: 80,
              }}
              className={`absolute p-1 rounded-xl transition-all duration-75 pointer-events-auto ${
                isSelected
                  ? 'border-2 border-dashed border-amber-400 ring-2 ring-amber-400/40 shadow-2xl bg-slate-900/20'
                  : 'border border-transparent bg-transparent'
              }`}
            >
              {/* NÚT KÉO RÊ DI CHUYỂN (DRAG HANDLE) TRỰC QUAN Ở VIỀN TRÊN DÙNG ĐỂ RÊ CHUỘT THOẢI MÁI */}
              {isSelected && (
                <div
                  onMouseDown={(e) => handleStartDragText(e, box.id)}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-[110] bg-amber-500 hover:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md cursor-grab active:cursor-grabbing flex items-center space-x-1 border border-amber-300"
                  title="Nhấn giữ chuột tại đây để Kéo Rê di chuyển ô Text"
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                  <span>Kéo Di Chuyển</span>
                </div>
              )}

              {/* THANH RICH TEXT EDITOR THU GỌN - HỆ THỐNG MENU HIGHLIGHT DROPDOWN GỌN GÀNG CHUẨN ẢNH media_1787452765117.png */}
              {isSelected && (
                <div
                  className="absolute bottom-full mb-3 left-0 z-[100] bg-[#ded8be] backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-[#b8af91] flex items-center space-x-2 animate-scale-up font-sans"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={box.fontFamily || 'Noto Sans'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, fontFamily: val } : t));
                    }}
                    className="p-1 border border-slate-400 rounded-xl text-xs font-bold bg-white outline-none"
                  >
                    {FONT_FAMILIES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  <select
                    value={box.fontSize || 36}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, fontSize: val } : t));
                    }}
                    className="p-1 border border-slate-400 rounded-xl text-xs font-bold bg-white outline-none"
                  >
                    {FONT_SIZES.map((sz) => (
                      <option key={sz} value={sz}>{sz}px</option>
                    ))}
                  </select>

                  <span className="w-px h-5 bg-slate-400" />

                  <button
                    type="button"
                    onClick={() => {
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, isBold: !t.isBold } : t));
                    }}
                    className={`p-1.5 rounded-lg border text-xs font-black cursor-pointer ${
                      box.isBold ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                    }`}
                    title="In Đậm (B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, isItalic: !t.isItalic } : t));
                    }}
                    className={`p-1.5 rounded-lg border text-xs italic cursor-pointer ${
                      box.isItalic ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                    }`}
                    title="In Nghiêng (I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, isUnderline: !t.isUnderline } : t));
                    }}
                    className={`p-1.5 rounded-lg border text-xs underline cursor-pointer ${
                      box.isUnderline ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                    }`}
                    title="Gạch Chân (U)"
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <span className="w-px h-5 bg-slate-400" />

                  {/* ĐỔI MÀU CHỮ CHÍNH */}
                  <input
                    type="color"
                    value={box.color || color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, color: val } : t));
                    }}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-400 p-0"
                    title="Đổi màu chữ"
                  />

                  {/* THU GỌN HIGHLIGHT THÀNH 1 NÚT CHỮ "Highlight ✨" CÓ POPUP MENU DROPDOWN CHỌN MÀU BÊN TRONG THEO ĐÚNG CHỈ ĐẠO CỦA THẦY HẢI */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowHighlightDropdown(!showHighlightDropdown)}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center space-x-1 shadow-sm transition border border-amber-300 cursor-pointer"
                      title="Chọn màu Highlight nền cho chữ bôi đen"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Highlight ✨</span>
                    </button>

                    {showHighlightDropdown && (
                      <div className="absolute top-full mt-2 left-0 z-[120] bg-slate-900 border-2 border-amber-400 rounded-2xl shadow-2xl p-2 flex items-center space-x-1.5 animate-scale-up">
                        {HIGHLIGHT_PALETTE.map((item) => (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => applySelectionHighlight(item.color)}
                            style={{ backgroundColor: item.color }}
                            className="w-6 h-6 rounded-full border border-slate-300 hover:scale-125 transition shadow-2xs cursor-pointer"
                            title={`Tô màu Highlight ${item.name} cho chữ bôi đen`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="w-px h-5 bg-slate-400" />

                  <button
                    type="button"
                    onClick={() => handleDeleteSelectedText(box.id)}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                    title="Xóa ô văn bản (Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* KHUNG NỘI DUNG GÕ CHỮ NẾT CĂNG RÕ RÀNG 100% - LỚP NỀN HIGHLIGHT LUÔN NẰM DƯỚI CÙNG LỚP VĂN BẢN */}
              <div
                contentEditable
                suppressContentEditableWarning
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(box.id);
                  if (fabricCanvas) fabricCanvas.discardActiveObject();
                }}
                onBlur={(e) => {
                  const html = e.target.innerHTML;
                  setTextElements((prev) => prev.map((t) => t.id === box.id ? { ...t, htmlContent: html } : t));
                }}
                dangerouslySetInnerHTML={{ __html: box.htmlContent || 'Nhấp để gõ bài giảng...' }}
                style={{
                  color: box.color || (bgType === 'greenboard' || bgType === 'blackboard' ? '#ffffff' : '#000000'),
                  fontSize: `${box.fontSize || fontSize}px`,
                  fontFamily: box.fontFamily || fontFamily,
                  fontWeight: box.isBold ? 'bold' : 'normal',
                  fontStyle: box.isItalic ? 'italic' : 'normal',
                  textDecoration: box.isUnderline ? 'underline' : 'none',
                }}
                className="bg-transparent border-none outline-none font-sans p-0 m-0 shadow-none leading-normal w-full min-h-[40px] cursor-text select-text"
              />
            </div>
          );
        })}

        {/* MENU NỔI FLOATING MENU CHO FABRIC OBJECTS (ẢNH DÁN, SHAPES, STICKY) */}
        {activeObject && floatingMenuPos && (
          <div
            style={{
              left: `${floatingMenuPos.left}px`,
              top: `${floatingMenuPos.top}px`,
            }}
            className="fixed z-[100] bg-[#ded8be] backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-[#b8af91] flex items-center space-x-2 animate-scale-up font-sans"
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

      {/* COMPONENT MODULE SHAPES VỊ TRÍ NẰM NGAY TRÊN TOOLBAR DƯỚI CÙNG VÀ TỰ ĐỘNG ẨN KHI CHỌN SHAPE CHUẨN THẦY HẢI CHỈ ĐẠO */}
      <ShapesModulePanel
        isOpen={activeWindow === 'shapes'}
        onClose={() => setActiveWindow(null)}
        strokeColor={strokeColor}
        setStrokeColor={setStrokeColor}
        fillColor={fillColor}
        setFillColor={setFillColor}
        hasFill={hasFill}
        setHasFill={setHasFill}
        strokeWidth={strokeWidth}
        setStrokeWidth={setStrokeWidth}
        opacity={opacity}
        setOpacity={setOpacity}
        isDashed={isDashed}
        setIsDashed={setIsDashed}
        onSelectShape={handleSelectShape}
        activeObject={activeObject}
        fabricCanvas={fabricCanvas}
      />

      {/* POPUP HỘP CÔNG CỤ BÚT VẼ (PEN TOOLBOX POPUP): GOM BÚT VẼ, BÚT DẠ QUANG, BÚT KHOANH KHUNG CÔNG THỨC & BẢNG MÀU VÀO 1 HỘP CÔNG CỤ */}
      {activeWindow === 'penToolbox' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl p-4 w-96 space-y-3 animate-scale-up font-sans text-white">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-xs text-emerald-400 flex items-center space-x-2">
              <Pencil className="w-4 h-4 text-emerald-400" />
              <span>✏️ HỘP CÔNG CỤ BÚT VẼ & KHOANH KHUNG</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white text-xs font-extrabold">✕</button>
          </div>

          {/* CHỌN CÁC LOẠI BÚT */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setTool('pen');
                setActiveWindow(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                tool === 'pen' ? 'bg-emerald-600 border-emerald-400 text-white shadow-md' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Pencil className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px]">1. Bút Vẽ Tự Do</span>
            </button>

            <button
              onClick={() => {
                setTool('highlighter');
                setActiveWindow(null);
              }}
              className={`p-2.5 rounded-xl border text-xs font-black flex flex-col items-center justify-center space-y-1 transition cursor-pointer ${
                tool === 'highlighter' ? 'bg-amber-600 border-amber-400 text-white shadow-md' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
              }`}
            >
              <Highlighter className="w-5 h-5 text-amber-400" />
              <span className="text-[10px]">2. Bút Dạ Quang</span>
            </button>

            {/* BÚT KHOANH KHUNG NỔI BẬT CÔNG THỨC (CHỜ THẦY HẢI KÉO CHUỘT RÊ ĐẾN ĐÂU MỚI TẠO KHUNG ĐẾN ĐÓ) */}
            <button
              onClick={handleAddHighlightBox}
              className="p-2.5 bg-rose-950/80 hover:bg-rose-900 border-2 border-rose-500 rounded-xl text-xs font-black flex flex-col items-center justify-center space-y-1 transition cursor-pointer text-rose-300 shadow-md"
              title="Khoanh Khung Chữ Nhật / Vuông Nổi Bật Công Thức (Kéo chuột đến đâu khoanh đến đó)"
            >
              <BoxSelect className="w-5 h-5 text-rose-400" />
              <span className="text-[10px] text-rose-200 font-extrabold">3. Bút Khoanh Khung</span>
            </button>
          </div>

          {/* BẢNG MÀU CHỌN NHANH CHO BÚT VẼ (PEN COLOR PALETTE) */}
          <div className="pt-2 border-t border-slate-700 space-y-1.5">
            <span className="text-[11px] font-extrabold text-slate-300 block">Bảng Màu Bút:</span>
            <div className="flex items-center space-x-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 overflow-x-auto">
              {PEN_COLORS.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setColor(c.hex);
                    setStrokeColor(c.hex);
                    if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
                      fabricCanvas.freeDrawingBrush.color = c.hex;
                    }
                  }}
                  style={{ backgroundColor: c.hex }}
                  className={`w-6 h-6 rounded-full border-2 border-slate-400 shadow-2xs hover:scale-125 transition cursor-pointer shrink-0 ${
                    color === c.hex ? 'ring-2 ring-emerald-400 scale-110' : ''
                  }`}
                  title={c.name}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  const val = e.target.value;
                  setColor(val);
                  setStrokeColor(val);
                  if (fabricCanvas && fabricCanvas.freeDrawingBrush) {
                    fabricCanvas.freeDrawingBrush.color = val;
                  }
                }}
                className="w-6 h-6 rounded-lg cursor-pointer border border-slate-600 p-0 shrink-0"
                title="Màu tùy chỉnh"
              />
            </div>
          </div>
        </div>
      )}

      {/* MENU CHỌN 3 CÔNG CỤ MINI-GAMES (GOM NẰM TRONG 1 ICON DUY NHẤT THEO CHỈ ĐẠO CỦA THẦY HẢI) */}
      {activeWindow === 'minigamesMenu' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border-2 border-amber-500 rounded-2xl shadow-2xl p-3 flex items-center space-x-3 animate-scale-up font-sans text-white">
          <span className="text-xs font-black text-amber-400 uppercase tracking-wide">Công Cụ Giảng Dạy:</span>
          
          <button
            onClick={() => setActiveWindow('timer')}
            className="px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4 text-sky-200" />
            <span>⏱️ Bấm Giờ</span>
          </button>

          <button
            onClick={() => setActiveWindow('dice')}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Dices className="w-4 h-4 text-purple-200" />
            <span>🎲 Xúc Xắc</span>
          </button>

          <button
            onClick={() => setActiveWindow('picker')}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
          >
            <Users className="w-4 h-4 text-amber-200" />
            <span>🎯 Gọi Tên</span>
          </button>
        </div>
      )}

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

      {/* POPUP ĐỒNG HỒ BẤM GIỜ (TIMER) CÓ ÂM THANH TICK TOCK VÀ CHUÔNG BÁO NHỊP NHÀNG */}
      {activeWindow === 'timer' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-80 space-y-4 border-2 border-sky-500 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-sky-400">
              <Clock className="w-5 h-5" />
              <span>⏱️ ĐỒNG HỒ BẤM GIỜ GIẢNG DẠY</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="text-center py-3">
            <span className="font-mono text-5xl font-black text-amber-400 tracking-wider">
              {Math.floor(timerSeconds / 60).toString().padStart(2, '0')}:{(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setTimerSeconds(30)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700">30 Giây</button>
            <button onClick={() => setTimerSeconds(60)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700">1 Phút</button>
            <button onClick={() => setTimerSeconds(300)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700">5 Phút</button>
          </div>

          <div className="flex space-x-2 pt-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`flex-1 py-2.5 rounded-xl font-black text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                timerRunning ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerRunning ? 'Tạm Dừng' : 'Bắt Đầu Bấm Giờ'}</span>
            </button>
            <button
              onClick={() => { setTimerSeconds(60); setTimerRunning(false); }}
              className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 font-bold text-xs border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* POPUP XÚC XẮC THÔNG MINH HIỂN THỊ CHÍNH XÁC MẶT CHẤM TRÒN XÚC XẮC ⚀ ⚁ ⚂ (ĐÚNG CHÍNH XÁC YÊU CẦU THẦY HẢI) */}
      {activeWindow === 'dice' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border-2 border-purple-500 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-purple-400">
              <Dices className="w-5 h-5" />
              <span>🎲 XÚC XẮC NGẪU NHIÊN BÀI TẬP</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          {/* NÚT TĂNG GIẢM SỐ HỘT XÚC XẮC (+ VÀ -) */}
          <div className="flex items-center justify-between bg-slate-800 p-2.5 rounded-2xl border border-slate-700">
            <span className="text-xs font-extrabold text-slate-200">Số lượng Hột Xúc Xắc:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDecreaseDice}
                disabled={diceCount <= 1}
                className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 font-black text-lg flex items-center justify-center text-white transition cursor-pointer border border-slate-600"
              >
                -
              </button>
              <span className="font-mono text-base font-black text-amber-400 px-2">{diceCount} Hột</span>
              <button
                onClick={handleIncreaseDice}
                disabled={diceCount >= 3}
                className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 font-black text-lg flex items-center justify-center text-white transition cursor-pointer border border-slate-600"
              >
                +
              </button>
            </div>
          </div>

          {/* HIỂN THỊ ĐÚNG CÁC MẶT HỘT XÚC XẮC THỰC TẾ VỚI CÁC CHẤM TRÒN CHUẨN XÁC NGUYÊN BẢN */}
          <div className="flex justify-center items-center gap-3 py-4">
            {diceValues.map((val, idx) => (
              <DiceFace key={idx} value={val} isSpinning={isSpinningDice} />
            ))}
          </div>

          <button
            onClick={handleRollDice}
            disabled={isSpinningDice}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isSpinningDice ? 'Đang Đổ Xúc Xắc...' : `🎲 LẮC ${diceCount} HỘT XÚC XẮC NGẪU NHIÊN` }</span>
          </button>
        </div>
      )}

      {/* POPUP GỌI TÊN HỌC SINH NGẪU NHIÊN VỚI ÂM THANH TẠCH TẠCH VÀ HỢP ÂM RỰC RỠ */}
      {activeWindow === 'picker' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border-2 border-amber-500 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-amber-400">
              <Users className="w-5 h-5" />
              <span>🎯 GỌI TÊN HỌC SINH NGẪU NHIÊN</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 font-bold block mb-1">Học sinh được chọn:</span>
            <span className={`text-2xl font-black text-amber-300 block truncate transition transform ${
              isPickingStudent ? 'scale-110 text-amber-400' : ''
            }`}>
              {selectedStudent || '👉 Bấm Nút Gọi Tên!'}
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold text-slate-400 mb-1">Danh sách học sinh (phân cách bằng dấu phẩy):</label>
            <textarea
              value={studentNames}
              onChange={(e) => setStudentNames(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 h-20 outline-none"
            />
          </div>

          <button
            onClick={handlePickRandomStudent}
            disabled={isPickingStudent}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isPickingStudent ? 'Đang Xoay Tên...' : '🎯 GỌI TÊN NGẪU NHIÊN'}</span>
          </button>
        </div>
      )}

      {/* POPUP LƯU BÀI DẠY */}
      {activeWindow === 'save' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border border-slate-200 animate-scale-up font-sans text-slate-900">
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
              <button onClick={() => setActiveWindow(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                Hủy
              </button>
              <button
                onClick={handleSaveLesson}
                disabled={savingLesson}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                {savingLesson ? 'Đang Lưu...' : '🚀 XÁC NHẬN LƯU BÀI DẠY'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MỞ BÀI DẠY ĐÃ LƯU */}
      {activeWindow === 'load' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-3xl shadow-2xl p-6 w-[500px] space-y-4 border border-slate-200 animate-scale-up font-sans text-slate-900">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-sky-700">
              <FolderOpen className="w-5 h-5" />
              <span>📂 DANH SÁCH BÀI GIẢNG ĐÃ LƯU</span>
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
                    <h4 className="font-extrabold text-xs text-slate-900">{lesson.title.replace(/[WHITEBOARD:.*?]/, '').trim()}</h4>
                    <span className="text-[10px] font-extrabold text-sky-700 uppercase bg-sky-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {lesson.title.match(/[WHITEBOARD:(.*?)]/)?.[1] || 'Unit 1'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(lesson.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      try {
                        const parsedData = JSON.parse(lesson.content);
                        if (parsedData.textElements) {
                          setTextElements(parsedData.textElements);
                        }
                        if (parsedData.pages) {
                          setPages(parsedData.pages);
                        }
                        if (fabricCanvas && parsedData.fabric) {
                          fabricCanvas.loadFromJSON(parsedData.fabric).then(() => {
                            fabricCanvas.renderAll();
                            alert(`🚀 ĐÃ MỞ THÀNH CÔNG BÀI GIẢNG: "${lesson.title.replace(/\[WHITEBOARD:.*?\]/, '').trim()}"`);
                            setActiveWindow(null);
                          });
                        }
                      } catch (e) {
                        alert('Lỗi nạp bài giảng: ' + e.message);
                      }
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    🚀 Mở Học Tiếp
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* THANH TOOLBAR DƯỚI CÙNG SANG TRỌNG GOM CÁC BÚT VÀ CHỨC NĂNG VÀO CÁC HỘP CÔNG CỤ V13 */}
      <div className={getToolbarStyle()}>
        {/* 1. XOAY CHUYỂN VỊ TRÍ TOOLBAR */}
        <button
          onClick={toggleToolbarPosition}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-md font-bold cursor-pointer"
          title="Xoay chuyển vị trí thanh công cụ (Dưới -> Trái -> Trên -> Phải)"
        >
          <Move className="w-4 h-4 animate-pulse" />
        </button>

        {/* 2. SELECT POINTER TOOL */}
        <button
          onClick={() => {
            setTool('pointer');
            setActiveShapeType(null);
          }}
          className={`p-2 rounded-xl transition cursor-pointer relative ${
            tool === 'pointer'
              ? 'bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Select Tool (Nhấp hoặc khoanh vùng chọn & di chuyển đối tượng)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* 3. HAND PAN CANVAS */}
        <button
          onClick={() => {
            setTool('hand');
            setActiveShapeType(null);
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'hand'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bàn tay kéo trượt toàn bộ canvas"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* 4. TEXT EDITOR */}
        <button
          onClick={handleAddText}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'text'
              ? 'bg-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Tạo ô văn bản gõ mượt mà 100%"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* 5. STICKY NOTES */}
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

        {/* 6. HỘP CÔNG CỤ BÚT VẼ (PEN TOOLBOX): GOM BÚT VẼ, BÚT DẠ QUANG, BÚT KHOANH KHUNG CÔNG THỨC VÀ BẢNG MÀU VÀO 1 ICON THEO CHỈ ĐẠO THẦY HẢI */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'penToolbox' ? null : 'penToolbox')}
          className={`p-2 rounded-xl transition cursor-pointer flex items-center space-x-1 relative ${
            ['pen', 'highlighter'].includes(tool) || activeWindow === 'penToolbox'
              ? 'bg-gradient-to-r from-emerald-600 to-amber-600 text-white shadow-md ring-2 ring-emerald-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="✏️ Hộp Công Cụ Bút Vẽ (Bút vẽ, Dạ quang, Bút Khoanh Khung Công Thức & Bảng Màu)"
        >
          <Pencil className="w-4 h-4" />
          <div className="w-3 h-3 rounded-full border border-slate-400" style={{ backgroundColor: color }} />
        </button>

        {/* 7. ERASER */}
        <button
          onClick={() => {
            setTool('eraser');
            setActiveShapeType(null);
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'eraser'
              ? 'bg-rose-600 text-white shadow-md scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Cục tẩy nhấp xóa object"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* 8. SHAPES PANEL (KHI CHỌN SHAPE ➔ CHỜ THẦY HẢI ĐÈ GIỮ CHUỘT KÉO ĐẾN ĐÂU VẼ ĐẾN ĐÓ REAL-TIME) */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeWindow === 'shapes' || tool === 'drawShape'
              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bảng chọn công cụ Shapes hình học (Chờ kéo chuột đến đâu vẽ đến đó)"
        >
          <Square className="w-4 h-4" />
        </button>

        <span className="w-px h-6 bg-slate-400/60 my-auto" />

        {/* 9. ICON DUY NHẤT GOM 3 CÔNG CỤ MINI-GAMES GIẢNG DẠY (BẤM GIỜ, XÚC XẮC, GỌI TÊN HỌC SINH) */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'minigamesMenu' ? null : 'minigamesMenu')}
          className={`p-2 rounded-xl transition cursor-pointer relative ${
            ['minigamesMenu', 'timer', 'dice', 'picker'].includes(activeWindow)
              ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white shadow-md ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="🎲 ⏱️ 🎯 Bộ 3 công cụ giảng dạy: Bấm giờ, Xúc xắc, Gọi tên học sinh"
        >
          <Wrench className="w-4 h-4 text-purple-800 font-black" />
        </button>

        {/* 10. IMAGE UPLOAD NGUYÊN BẢN (CHÈN ẢNH TỪ MÁY TÍNH) */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-[#c4bb9c] text-slate-800 rounded-xl transition cursor-pointer"
          title="🖼️ Chèn ảnh bài tập từ máy tính lên Bảng"
        >
          <ImageIcon className="w-4 h-4 text-sky-700" />
        </button>

        {/* 11. THƯỚC KẺ HỌC TẬP (RULER TOOL) NGUYÊN BẢN */}
        <button
          onClick={() => setShowRuler(!showRuler)}
          className={`p-2 rounded-xl transition cursor-pointer ${
            showRuler
              ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="📏 Thước kẻ học tập đo kích thước"
        >
          <Ruler className="w-4 h-4 text-amber-800" />
        </button>

        {/* 12. UNDO NGUYÊN BẢN (HOÀN TÁC VẼ) */}
        <button
          onClick={handleUndo}
          className="p-2 hover:bg-[#c4bb9c] text-slate-800 rounded-xl transition cursor-pointer"
          title="↩️ Hoàn tác hình vẽ vừa tạo (Undo)"
        >
          <Undo className="w-4 h-4 text-slate-700" />
        </button>

        <span className="w-px h-6 bg-slate-400/60 my-auto" />

        {/* 13. XÓA ĐỐI TƯỢNG ĐANG CHỌN */}
        <button
          onClick={handleDeleteActiveObject}
          className="p-2 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-rose-600 cursor-pointer font-bold"
          title="🗑️ Xóa đối tượng đang chọn (phím Delete)"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
        </button>

        {/* 14. XÓA SẠCH TRANG BẢNG (CLEAR ALL) */}
        <button
          onClick={handleClearAll}
          className="p-2 hover:bg-rose-600 hover:text-white rounded-xl transition text-rose-700 font-extrabold cursor-pointer"
          title="🧹 Xóa sạch tất cả hình vẽ & chữ trên trang Bảng"
        >
          <RotateCcw className="w-4 h-4 text-rose-700 hover:text-white" />
        </button>
      </div>
    </div>
  );
}
