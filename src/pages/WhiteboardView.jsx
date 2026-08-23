import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
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

// COMPONENT RENDER MẶT HỘT XÚC XẮC THỰC TẾ
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
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const queryId = searchParams.get('activityId');
  const activityId = pathId || queryId;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Instance Fabric Canvas
  const [fabricCanvas, setFabricCanvas] = useState(null);

  // ĐỒNG HỒ THỜI GIAN THỰC REAL-TIME CLOCK
  const [realtimeClock, setRealtimeClock] = useState('');
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const m = months[now.getMonth()];
      const d = now.getDate();
      const y = now.getFullYear();
      let h = now.getHours();
      const min = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      setRealtimeClock(`${m}/${d}/${y} ${h}:${min} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // VỊ TRÍ THANH TOOLBAR DƯỚI CÙNG SÁT MEP (BOTTOM-3)
  const [toolbarPos, setToolbarPos] = useState('bottom');

  // Công cụ active: 'pointer' | 'hand' | 'text' | 'sticky' | 'pen' | 'highlighter' | 'eraser' | 'drawShape'...
  const [tool, setTool] = useState('pointer');
  const [activeShapeType, setActiveShapeType] = useState(null);
  const [color, setColor] = useState('#ef4444');
  const [fontSize, setFontSize] = useState(36);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // THUỘC TÍNH VẼ SHAPES REAL-TIME CHUẨN MYVIEWBOARD
  const [strokeColor, setStrokeColor] = useState('#ef4444');
  const [fillColor, setFillColor] = useState('#ef4444');
  const [hasFill, setHasFill] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(5);
  const [opacity, setOpacity] = useState(1.0);
  const [isDashed, setIsDashed] = useState(false);

  // QUẢN LÝ THÔNG SỐ ĐO KÍCH THƯỚC KHI ĐANG KÉO SHAPE REAL-TIME
  const [drawingDimension, setDrawingDimension] = useState(null);

  // QUẢN LÝ TRANG BÀI GIẢNG MULTI-PAGES (PAGE 1, PAGE 2...)
  const [pages, setPages] = useState([{ id: 1, name: 'Trang 1', data: null, textElements: [] }]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // QUẢN LÝ Ô GÕ TEXT TRỰC QUAN NGUYÊN BẢN SANG TRỌNG V40
  const [textElements, setTextElements] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);

  // KÉO RÊ DI CHUYỂN Ô TEXT (DRAG & DROP TEXT)
  const [draggingTextId, setDraggingTextId] = useState(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // Quản lý Đối Tượng Đang Chọn & Menu Nổi (Floating Toolbar Position)
  const [activeObject, setActiveObject] = useState(null);
  const [activeSelectionObjects, setActiveSelectionObjects] = useState([]);
  const [floatingMenuPos, setFloatingMenuPos] = useState(null);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups & Teaching Tools
  const [activeWindow, setActiveWindow] = useState(null);
  const [showHighlightDropdown, setShowHighlightDropdown] = useState(false);

  // MINI-GAMES GIẢNG DẠY
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // XÚC XẮC ĐỒNG BỘ NÚT + -
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([1]);
  const [isSpinningDice, setIsSpinningDice] = useState(false);

  // VÒNG QUAY GỌI TÊN HỌC SINH NGẪU NHIÊN
  const [studentNames, setStudentNames] = useState('Minh Anh, Hải Nam, Bảo Ngọc, Đức Anh, Tuấn Kiệt, Phương Thảo, Gia Huy, Thanh Hà');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isPickingStudent, setIsPickingStudent] = useState(false);
  const [showRuler, setShowRuler] = useState(false);

  // NẠP & LƯU BÀI DẠY
  const [savedLessons, setSavedLessons] = useState([]);
  const [loadingSavedLessons, setLoadingSavedLessons] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Getting started');
  const [savingLesson, setSavingLesson] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

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

  // BẢNG MÀU HIGHLIGHT DẠ QUANG RỰC RỠ SÁNG NẾT
  const HIGHLIGHT_PALETTE = [
    { name: 'Vàng Dạ Quang', color: '#fef08a', text: '#854d0e' },
    { name: 'Cam Rực Rỡ', color: '#fed7aa', text: '#9a3412' },
    { name: 'Hồng Tươi', color: '#fbcfe8', text: '#9d174d' },
    { name: 'Xanh Lá Sáng', color: '#bbf7d0', text: '#166534' },
    { name: 'Xanh Dương Sáng', color: '#bae6fd', text: '#075985' },
    { name: 'Tím Dạ Quang', color: '#e9d5ff', text: '#6b21a8' },
    { name: 'Trắng Sáng', color: '#ffffff', text: '#0f172a' },
  ];

  const FONT_FAMILIES = ['Noto Sans', 'Arial', 'Roboto', 'Dancing Script', 'Courier New', 'Georgia', 'Impact'];
  const FONT_SIZES = [14, 18, 24, 32, 40, 48, 64, 80, 96];

  // LOGIC ĐỒNG HỒ BẤM GIỜ
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

  // LOGIC LẮC XÚC XẮC
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

  // LOGIC GỌI TÊN HỌC SINH NGẪU NHIÊN
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
      height: window.innerHeight - 110,
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
      const activeObjs = fc.getActiveObjects();
      setActiveSelectionObjects(activeObjs);

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
      setActiveSelectionObjects([]);
      setFloatingMenuPos(null);
    });
    fc.on('object:moving', updateFloatingMenu);
    fc.on('object:scaling', updateFloatingMenu);
    fc.on('object:rotating', updateFloatingMenu);
    fc.on('object:modified', updateFloatingMenu);

    setFabricCanvas(fc);

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

  // NẠP VÀ HIỂN THỊ CHÍNH XÁC NỘI DUNG VẼ VÀ TÊN LESSON CỦA BÀI HỌC V47
  useEffect(() => {
    if (!fabricCanvas) return;

    const loadActivityContent = async () => {
      if (activityId) {
        try {
          const { data, error } = await supabase
            .from('activities')
            .select('*')
            .eq('id', activityId)
            .single();

          if (!error && data) {
            let cleanTitle = data.title ? data.title.replace(/[WHITEBOARD.*?]/gi, '').trim() : '';
            if (!cleanTitle) cleanTitle = data.title || 'Getting started';
            setLessonTitle(cleanTitle);

            if (data.content && data.content !== '{}') {
              const parsed = JSON.parse(data.content);
              if (parsed.textElements) setTextElements(parsed.textElements);
              else setTextElements([]);

              if (parsed.pages) setPages(parsed.pages);

              if (parsed.fabric) {
                fabricCanvas.loadFromJSON(parsed.fabric).then(() => {
                  fabricCanvas.renderAll();
                });
              } else {
                fabricCanvas.clear();
              }
            } else {
              fabricCanvas.clear();
              setTextElements([]);
            }
            return;
          }
        } catch (e) {}
      }

      fabricCanvas.clear();
      setTextElements([]);
    };

    loadActivityContent();
  }, [fabricCanvas, activityId]);

  // NHÓM (GROUP) VÀ BỎ NHÓM (UNGROUP)
  const handleGroupSelectedObjects = () => {
    if (!fabricCanvas) return;
    const activeObj = fabricCanvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') {
      alert('Thầy Hải hãy khoanh vùng chọn từ 2 đối tượng trở lên để Nhóm lại nhé!');
      return;
    }

    const group = activeObj.toGroup();
    fabricCanvas.setActiveObject(group);
    fabricCanvas.requestRenderAll();
  };

  const handleUngroupSelectedObject = () => {
    if (!fabricCanvas) return;
    const activeObj = fabricCanvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') {
      alert('Thầy Hải hãy chọn 1 Khối Nhóm để Bỏ Nhóm ra nhé!');
      return;
    }

    const items = activeObj.toActiveSelection();
    fabricCanvas.setActiveObject(items);
    fabricCanvas.requestRenderAll();
  };

  // VẼ SHAPES DRAG-TO-DRAW
  useEffect(() => {
    if (!fabricCanvas || tool !== 'drawShape' || !activeShapeType) return;

    fabricCanvas.isDrawingMode = false;
    fabricCanvas.selection = false;
    fabricCanvas.defaultCursor = 'crosshair';

    let isMouseDown = false;
    let startX = 0;
    let startY = 0;
    let shapeObj = null;

    const curFill = hasFill ? fillColor : 'transparent';
    const curStroke = activeShapeType === 'highlightBox' ? color : (strokeColor || '#ef4444');
    const curWidth = Number(strokeWidth || 5);
    const curOpacity = Number(opacity || 1.0);
    const curDash = isDashed ? [8, 8] : null;

    const getPointerPos = (e) => {
      if (fabricCanvas.getScenePoint) {
        return fabricCanvas.getScenePoint(e);
      }
      return fabricCanvas.getPointer(e);
    };

    const onMouseDown = (opt) => {
      const pointer = getPointerPos(opt.e);
      isMouseDown = true;
      startX = pointer.x;
      startY = pointer.y;

      if (activeShapeType === 'rect' || activeShapeType === 'highlightBox') {
        shapeObj = new fabric.Rect({
          left: startX,
          top: startY,
          width: 2,
          height: 2,
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
          radius: 2,
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
          rx: 2,
          ry: 2,
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
          width: 2,
          height: 2,
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
      } else if (activeShapeType === 'arrow') {
        shapeObj = new fabric.Path('M 0 0 L 140 0 M 140 0 L 120 -12 M 140 0 L 120 12', {
          left: startX,
          top: startY,
          stroke: curStroke,
          strokeWidth: curWidth,
          fill: 'transparent',
          opacity: curOpacity,
          strokeDashArray: curDash,
        });
      }

      if (shapeObj) {
        fabricCanvas.add(shapeObj);
        fabricCanvas.requestRenderAll();
      }
    };

    const onMouseMove = (opt) => {
      if (!isMouseDown || !shapeObj) return;
      const pointer = getPointerPos(opt.e);

      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);
      const left = Math.min(startX, pointer.x);
      const top = Math.min(startY, pointer.y);

      const widthCm = (width / 37.8).toFixed(1);
      const heightCm = (height / 37.8).toFixed(1);
      setDrawingDimension({
        x: left + width / 2,
        y: top + height + 15,
        text: `${widthCm} cm × ${heightCm} cm (${Math.round(width)}px × ${Math.round(height)}px)`,
      });

      if (activeShapeType === 'rect' || activeShapeType === 'highlightBox' || activeShapeType === 'triangle') {
        shapeObj.set({
          left: left,
          top: top,
          width: Math.max(5, width),
          height: Math.max(5, height),
        });
      } else if (activeShapeType === 'circle') {
        const radius = Math.sqrt(Math.pow(pointer.x - startX, 2) + Math.pow(pointer.y - startY, 2)) / 2;
        shapeObj.set({
          left: left,
          top: top,
          radius: Math.max(5, radius),
        });
      } else if (activeShapeType === 'oval') {
        shapeObj.set({
          left: left,
          top: top,
          rx: Math.max(5, width / 2),
          ry: Math.max(5, height / 2),
        });
      } else if (activeShapeType === 'line') {
        shapeObj.set({
          x2: pointer.x,
          y2: pointer.y,
        });
      } else if (activeShapeType === 'arrow') {
        const scaleX = Math.max(0.2, width / 140);
        const scaleY = Math.max(0.2, height / 50);
        shapeObj.set({
          left: left,
          top: top,
          scaleX: scaleX,
          scaleY: scaleY,
        });
      }

      if (shapeObj.setCoords) shapeObj.setCoords();
      fabricCanvas.requestRenderAll();
    };

    const onMouseUp = () => {
      if (isMouseDown && shapeObj) {
        isMouseDown = false;
        setDrawingDimension(null);
        fabricCanvas.selection = true;
        fabricCanvas.setActiveObject(shapeObj);
        fabricCanvas.requestRenderAll();
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
      setDrawingDimension(null);
    };
  }, [fabricCanvas, tool, activeShapeType, hasFill, fillColor, strokeColor, color, strokeWidth, opacity, isDashed]);

  // BÚT KHOANH KHUNG NỔI BẬT CÔNG THỨC
  const handleAddHighlightBox = () => {
    setActiveShapeType('highlightBox');
    setTool('drawShape');
    setActiveWindow(null);
  };

  // XỬ LÝ TẢI ẢNH TỪ MÁY TÍNH LÊN BẢNG
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

  // UNDO
  const handleUndo = () => {
    if (!fabricCanvas) return;
    const objects = fabricCanvas.getObjects();
    if (objects.length > 0) {
      fabricCanvas.remove(objects[objects.length - 1]);
      fabricCanvas.renderAll();
    }
  };

  // XÓA SẠCH BẢNG
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

  // MULTI-PAGES
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

  // DRAG TEXT
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

  // CLICK OUTSIDE
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
        htmlContent: 'Nhấp để gõ bài giảng...',
        color: bgType === 'greenboard' || bgType === 'blackboard' || bgType === 'green_grid' || bgType === 'english_lines' ? '#ffffff' : '#000000',
        fontSize: fontSize || 36,
        fontFamily: fontFamily || 'Noto Sans',
      };

      setTextElements((prev) => [...prev, newBox]);
      setSelectedTextId(newId);
      setTool('pointer');
    } else {
      setSelectedTextId(null);
    }
  };

  // EXEC COMMAND RICH TEXT
  const applyExecCommand = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const applySelectionHighlight = (item) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      alert('Thầy Hải hãy bôi đen từ/cụm từ cần Highlight trước nhé!');
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = item.color;
    span.style.color = item.text || '#000000';
    span.style.borderRadius = '4px';
    span.style.padding = '1px 4px';
    span.style.fontWeight = 'bold';
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

  // DELETE TEXT
  const handleDeleteSelectedText = (id) => {
    setTextElements((prev) => prev.filter((t) => t.id !== id));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  // HAND PAN
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
          const deltaX = e.clientX - lastPosX;
          const deltaY = e.clientY - lastPosY;

          const vpt = fabricCanvas.viewportTransform;
          vpt[4] += deltaX;
          vpt[5] += deltaY;
          fabricCanvas.requestRenderAll();

          setTextElements((prev) =>
            prev.map((t) => ({
              ...t,
              x: t.x + deltaX,
              y: t.y + deltaY,
            }))
          );

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

  // DELETE KEYBOARD
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

  // FLOATING MENU
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

  const handleAddText = () => {
    setTool('text');
  };

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

  const handleSelectShape = (shapeType) => {
    if (!fabricCanvas) return;

    const isSticker = ['check', 'cross', 'heart', 'smile', 'frown', 'star', 'crown', 'thumbsUp'].includes(shapeType);

    if (isSticker) {
      let shape = null;
      const initX = 300;
      const initY = 200;

      if (shapeType === 'check') {
        shape = new fabric.Path('M 10 30 L 25 45 L 60 10', {
          left: initX,
          top: initY,
          stroke: '#22c55e',
          strokeWidth: 6,
          fill: 'transparent',
          strokeLineCap: 'round',
          strokeLineJoin: 'round',
          scaleX: 0.55,
          scaleY: 0.55,
        });
      } else if (shapeType === 'cross') {
        shape = new fabric.Path('M 15 15 L 50 50 M 50 15 L 15 50', {
          left: initX,
          top: initY,
          stroke: '#ef4444',
          strokeWidth: 6,
          fill: 'transparent',
          strokeLineCap: 'round',
          scaleX: 0.55,
          scaleY: 0.55,
        });
      } else if (shapeType === 'heart') {
        shape = new fabric.Path('M 24 42 S 4 28 4 16 A 10 10 0 0 1 24 10 A 10 10 0 0 1 44 16 C 44 28 24 42 24 42 Z', {
          left: initX,
          top: initY,
          fill: '#ec4899',
          stroke: '#db2777',
          strokeWidth: 2,
          scaleX: 0.8,
          scaleY: 0.8,
        });
      } else if (shapeType === 'smile') {
        const circle = new fabric.Circle({ radius: 20, fill: '#fef08a', stroke: '#eab308', strokeWidth: 3 });
        const eye1 = new fabric.Circle({ radius: 2.5, fill: '#854d0e', left: 11, top: 12 });
        const eye2 = new fabric.Circle({ radius: 2.5, fill: '#854d0e', left: 24, top: 12 });
        const mouth = new fabric.Path('M 12 24 Q 20 34 28 24', { stroke: '#854d0e', strokeWidth: 3, fill: 'transparent', strokeLineCap: 'round' });
        shape = new fabric.Group([circle, eye1, eye2, mouth], { left: initX, top: initY });
      } else if (shapeType === 'frown') {
        const circle = new fabric.Circle({ radius: 20, fill: '#e0f2fe', stroke: '#0284c7', strokeWidth: 3 });
        const eye1 = new fabric.Circle({ radius: 2.5, fill: '#0369a1', left: 11, top: 12 });
        const eye2 = new fabric.Circle({ radius: 2.5, fill: '#0369a1', left: 24, top: 12 });
        const mouth = new fabric.Path('M 12 28 Q 20 20 28 28', { stroke: '#0369a1', strokeWidth: 3, fill: 'transparent', strokeLineCap: 'round' });
        const tear = new fabric.Path('M 26 18 Q 28 22 26 18 Z', { fill: '#38bdf8' });
        shape = new fabric.Group([circle, eye1, eye2, mouth, tear], { left: initX, top: initY });
      } else if (shapeType === 'star') {
        shape = new fabric.Path('M 20 0 L 26 12 L 40 14 L 30 24 L 32 38 L 20 31 L 8 38 L 10 24 L 0 14 L 14 12 Z', {
          left: initX,
          top: initY,
          fill: '#fde047',
          stroke: '#ca8a04',
          strokeWidth: 2,
          scaleX: 0.8,
          scaleY: 0.8,
        });
      } else if (shapeType === 'crown') {
        shape = new fabric.Path('M 5 32 L 0 12 L 12 20 L 20 4 L 28 20 L 40 12 L 35 32 Z', {
          left: initX,
          top: initY,
          fill: '#a855f7',
          stroke: '#7e22ce',
          strokeWidth: 2,
          scaleX: 0.85,
          scaleY: 0.85,
        });
      } else if (shapeType === 'thumbsUp') {
        shape = new fabric.Path('M 8 18 L 8 36 L 14 36 L 22 42 Q 26 42 26 38 L 26 28 L 38 28 Q 42 28 42 24 Q 42 20 38 20 L 28 20 L 30 10 Q 30 4 26 4 L 24 4 L 14 18 Z', {
          left: initX,
          top: initY,
          fill: '#60a5fa',
          stroke: '#1d4ed8',
          strokeWidth: 2,
          scaleX: 0.75,
          scaleY: 0.75,
        });
      }

      if (shape) {
        fabricCanvas.add(shape);
        fabricCanvas.setActiveObject(shape);
        fabricCanvas.requestRenderAll();
        setTool('pointer');
      }
    } else {
      setActiveShapeType(shapeType);
      setTool('drawShape');
    }
  };

  const fetchSavedLessons = async () => {
    setLoadingSavedLessons(true);
    let list = [];

    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        list = data;
      }
    } catch (err) {}

    setSavedLessons(list);
    setLoadingSavedLessons(false);
  };

  // NÂNG CẤP LƯU BÀI DẠY V47 CHUẨN XÁC CHỈ ĐẠO THẦY HẢI (ẢNH media_1787464016635.png):
  // BỎ HOÀN TOÀN TRƯỜNG 'updated_at' KHI UPDATE SUPABASE ĐỂ FIX TRIỆT ĐỂ LỖI SCHEMA CACHE!
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    try {
      let canvasJson = '{}';
      if (fabricCanvas) {
        canvasJson = JSON.stringify({
          fabric: fabricCanvas.toJSON(),
          textElements: textElements,
          pages: pages,
        });
      }

      if (activityId) {
        // CẬP NHẬT CHÍNH XÁC CHỈ CỘT CONTENT TRÁNH LỖI SCHEMA CACHE UPDATED_AT SUPABASE
        const { error } = await supabase
          .from('activities')
          .update({
            content: canvasJson,
          })
          .eq('id', activityId);

        if (error) {
          alert('❌ Lỗi CSDL Supabase khi lưu: ' + error.message);
        } else {
          setToastMessage(`💾 Đã lưu thành công bài dạy vào CSDL Lesson [${lessonTitle}]! Đang quay lại Khóa học...`);
          setTimeout(() => {
            navigate(-1);
          }, 1200);
          return;
        }
      }

      // NẾU CHƯA CÓ LESSON ID KÈM THEO ➔ TỰ ĐỘNG KHỞI TẠO VÀ LƯU VÀO CSDL
      let targetSectionId = null;
      const { data: secData } = await supabase.from('course_sections').select('id').limit(1);
      if (secData && secData.length > 0) targetSectionId = secData[0].id;

      const payload = {
        title: lessonTitle || 'Getting started',
        type: 'whiteboard',
        content: canvasJson,
        created_at: new Date().toISOString(),
      };
      if (targetSectionId) payload.section_id = targetSectionId;

      const { data: newAct, error: insErr } = await supabase.from('activities').insert([payload]).select().single();

      if (insErr) {
        alert('❌ Lỗi CSDL Supabase khi tạo bài mới: ' + insErr.message);
      } else {
        setToastMessage(`💾 Đã lưu thành công vào CSDL Lesson [${lessonTitle}]! Đang quay lại Khóa học...`);
        setTimeout(() => {
          navigate(-1);
        }, 1200);
      }
    } catch (e) {
      alert('❌ Lỗi hệ thống: ' + e.message);
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
          : bgType === 'paper_note'
          ? 'bg-[#fdfbf7] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]'
          : bgType === 'green_grid'
          ? 'bg-[#0a2e23] bg-[linear-gradient(to_right,#0d382b_1px,transparent_1px),linear-gradient(to_bottom,#0d382b_1px,transparent_1px)] bg-[size:24px_24px]'
          : bgType === 'english_lines'
          ? 'bg-[#0f382c]'
          : 'bg-white'
      }`}
    >
      {/* THÔNG BÁO TOAST LƯU & QUAY VỀ MÀN HÌNH KHÓA HỌC */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[150] bg-emerald-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-2xl shadow-2xl border-2 border-emerald-300 animate-bounce flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* INPUT FILE ẨN CHÈN ẢNH TỪ MÁY TÍNH */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER BAR WHITEBOARD V47 */}
      <div className="bg-[#24211a] text-white px-4 py-1.5 flex items-center justify-between shadow-xl border-b border-[#3b362b] z-40 relative">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
            title="Quay lại Khóa học"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
            <span>Thoát Bảng</span>
          </button>

          <span className="text-xs font-black text-amber-300 bg-amber-950/80 px-3 py-1 rounded-lg border border-amber-500/40 truncate max-w-xs shadow-inner">
            {lessonTitle}
          </span>
        </div>

        {/* BẢNG CHUYỂN TRANG THÔNG MINH (MULTI-PAGES) */}
        <div className="flex items-center space-x-2 bg-slate-800/90 px-2.5 py-0.5 rounded-xl border border-slate-700">
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
          {/* ĐỒNG HỒ THỜI GIAN THỰC REAL-TIME CLOCK BADGE GÓC PHẢI TRÊN CÙNG */}
          <div className="bg-slate-900/90 text-amber-300 border border-amber-500/50 px-2 py-1 rounded-xl text-xs font-mono font-bold shadow-inner flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{realtimeClock || 'Aug/23/2026 12:46 PM'} {currentPageIndex + 1}/{pages.length}</span>
          </div>

          <button
            onClick={() => {
              fetchSavedLessons();
              setActiveWindow('load');
            }}
            className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>📁 Mở Bài Dạy</span>
          </button>

          {/* NÚT LƯU BÀI DẠY V47 */}
          <button
            onClick={handleSaveLesson}
            disabled={savingLesson}
            className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1.5 cursor-pointer border border-emerald-400"
            title={`💾 Lưu bài dạy vào [${lessonTitle}] và quay về Khóa học` }
          >
            <Save className="w-4 h-4" />
            <span>{savingLesson ? 'Đang Lưu...' : '💾 Lưu Bài Dạy'}</span>
          </button>

          {/* QUẢN LÝ NỀN BẢNG BACKGROUND MANAGEMENT */}
          <button
            onClick={() => setActiveWindow(activeWindow === 'bgMgmt' ? null : 'bgMgmt')}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-extrabold rounded-xl border border-slate-700 flex items-center space-x-1 cursor-pointer"
            title="🖼️ Quản Lý Nền Bảng"
          >
            <Layout className="w-3.5 h-3.5 text-purple-400" />
            <span>Quản Lý Nền</span>
          </button>
        </div>
      </div>

      {/* WORKSPACE FABRIC CANVAS CONTAINER */}
      <div 
        ref={containerRef} 
        onClick={handleCanvasContainerClick}
        className={`relative w-full h-[calc(100vh-110px)] overflow-hidden ${tool === 'text' ? 'cursor-text' : tool === 'drawShape' ? 'cursor-crosshair' : tool === 'hand' ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0" />

        {/* NHÃN HIỂN THỊ KÍCH THƯỚC REAL-TIME KHI KÉO HÌNH */}
        {drawingDimension && (
          <div
            style={{
              left: `${drawingDimension.x}px`,
              top: `${drawingDimension.y}px`,
            }}
            className="fixed z-[95] -translate-x-1/2 bg-rose-600/90 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-lg border border-rose-300 pointer-events-none animate-pulse font-mono"
          >
            {drawingDimension.text}
          </div>
        )}

        {/* THƯỚC KẺ HỌC TẬP */}
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

        {/* Ô GÕ TEXT TRỰC QUAN NGUYÊN BẢN SANG TRỌNG V40 */}
        {textElements.map((box) => {
          const isSelected = selectedTextId === box.id;

          return (
            <div
              key={box.id}
              style={{
                left: `${box.x}px`,
                top: `${box.y}px`,
                width: box.width ? `${box.width}px` : 'fit-content',
                maxWidth: '85vw',
                minWidth: '150px',
                zIndex: 80,
              }}
              className={`absolute p-2 rounded-2xl transition-all duration-75 pointer-events-auto resize-x overflow-visible ${
                isSelected
                  ? 'border-2 border-dashed border-amber-400 ring-4 ring-amber-400/30 shadow-2xl bg-slate-900/30'
                  : 'border border-transparent bg-transparent'
              }`}
            >
              {isSelected && (
                <div
                  onMouseDown={(e) => handleStartDragText(e, box.id)}
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-[110] bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-lg cursor-grab active:cursor-grabbing flex items-center space-x-1 border border-amber-300"
                  title="Nhấn giữ chuột tại đây để Kéo Rê di chuyển ô Text"
                >
                  <GripHorizontal className="w-3.5 h-3.5" />
                  <span>Kéo Di Chuyển</span>
                </div>
              )}

              {isSelected && (
                <div
                  className="absolute bottom-full mb-5 left-1/2 -translate-x-1/2 z-[100] bg-[#ded8be] backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-[#b8af91] flex items-center space-x-2 animate-scale-up font-sans whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    value={box.fontFamily || 'Noto Sans'}
                    onChange={(e) => {
                      const val = e.target.value;
                      applyExecCommand('fontName', val);
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
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyExecCommand('bold');
                    }}
                    className="p-1.5 rounded-lg border text-xs font-black cursor-pointer bg-white hover:bg-amber-100 border-slate-300 text-slate-900"
                    title="In Đậm (B) cho 1 hoặc 2 từ bôi đen"
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyExecCommand('italic');
                    }}
                    className="p-1.5 rounded-lg border text-xs italic cursor-pointer bg-white hover:bg-amber-100 border-slate-300 text-slate-900"
                    title="In Nghiêng (I) cho 1 hoặc 2 từ bôi đen"
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyExecCommand('underline');
                    }}
                    className="p-1.5 rounded-lg border text-xs underline cursor-pointer bg-white hover:bg-amber-100 border-slate-300 text-slate-900"
                    title="Gạch Chân (U) cho 1 hoặc 2 từ bôi đen"
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <span className="w-px h-5 bg-slate-400" />

                  <input
                    type="color"
                    value={box.color || color}
                    onChange={(e) => {
                      const val = e.target.value;
                      applyExecCommand('foreColor', val);
                    }}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-400 p-0"
                    title="Đổi màu chữ cho cụm từ bôi đen"
                  />

                  <div className="relative">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowHighlightDropdown(!showHighlightDropdown);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-extrabold text-xs flex items-center space-x-1 shadow-sm transition border border-amber-300 cursor-pointer"
                      title="Chọn màu Highlight nền rực rỡ cho chữ bôi đen"
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              applySelectionHighlight(item);
                            }}
                            style={{ backgroundColor: item.color }}
                            className="w-6 h-6 rounded-full border border-slate-300 hover:scale-125 transition shadow-2xs cursor-pointer"
                            title={`Tô màu Highlight ${item.name} rực rỡ cho chữ bôi đen`}
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

              <div
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
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
                  color: box.color || (bgType === 'greenboard' || bgType === 'blackboard' || bgType === 'green_grid' || bgType === 'english_lines' ? '#ffffff' : '#000000'),
                  fontSize: `${box.fontSize || fontSize}px`,
                  fontFamily: box.fontFamily || fontFamily,
                }}
                className="bg-transparent border-none outline-none font-sans p-0 m-0 shadow-none leading-normal w-full min-h-[40px] cursor-text select-text whitespace-pre-wrap"
              />
            </div>
          );
        })}

        {/* MENU NỔI FLOATING MENU CHO FABRIC OBJECTS */}
        {activeObject && floatingMenuPos && (
          <div
            style={{
              left: `${floatingMenuPos.left}px`,
              top: `${floatingMenuPos.top}px`,
            }}
            className="fixed z-[100] bg-[#ded8be] backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-[#b8af91] flex items-center space-x-2 animate-scale-up font-sans"
          >
            {activeSelectionObjects.length > 1 && (
              <button
                onClick={handleGroupSelectedObjects}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 transition shadow-md cursor-pointer border border-emerald-400"
                title="🔗 Nhóm các đối tượng đang chọn lại thành 1 Khối duy nhất"
              >
                <Group className="w-4 h-4 text-emerald-200" />
                <span>🔗 Nhóm Khối</span>
              </button>
            )}

            {activeObject.type === 'group' && (
              <button
                onClick={handleUngroupSelectedObject}
                className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center space-x-1 transition shadow-md cursor-pointer border border-amber-400"
                title="🔓 Bỏ Nhóm rời rạc từng đối tượng"
              >
                <Ungroup className="w-4 h-4 text-amber-200" />
                <span>🔓 Bỏ Nhóm</span>
              </button>
            )}

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

      {/* POPUP CHỌN BẢNG NỀN BACKGROUND MANAGEMENT */}
      {activeWindow === 'bgMgmt' && (
        <div className="fixed top-24 right-12 z-[100] bg-slate-900 border-2 border-purple-500 rounded-3xl shadow-2xl p-4 w-96 text-white animate-scale-up font-sans space-y-3">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-xs text-purple-400 flex items-center space-x-2">
              <Layout className="w-4 h-4 text-purple-400" />
              <span>🖼️ QUẢN LÝ NỀN BẢNG (BACKGROUND MANAGEMENT)</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white font-black">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto pr-1">
            <button
              onClick={() => { setBgType('greenboard'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'greenboard' ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-[#0f382c] rounded-xl border border-emerald-600 flex items-center justify-center text-xs font-black text-emerald-200">Bảng Xanh</div>
              <span className="text-[11px] font-extrabold block text-slate-200">1. Bảng Xanh Lá</span>
            </button>

            <button
              onClick={() => { setBgType('blackboard'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'blackboard' ? 'bg-slate-900 border-amber-400 ring-2 ring-amber-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-slate-950 rounded-xl border border-slate-700 flex items-center justify-center text-xs font-black text-slate-300">Bảng Đen</div>
              <span className="text-[11px] font-extrabold block text-slate-200">2. Bảng Đen Tuyền</span>
            </button>

            <button
              onClick={() => { setBgType('whiteboard'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'whiteboard' ? 'bg-slate-800 border-sky-400 ring-2 ring-sky-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-white rounded-xl border border-slate-300 flex items-center justify-center text-xs font-black text-slate-900">Bảng Trắng</div>
              <span className="text-[11px] font-extrabold block text-slate-200">3. Bảng Trắng Tinh</span>
            </button>

            <button
              onClick={() => { setBgType('paper_note'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'paper_note' ? 'bg-amber-950 border-amber-400 ring-2 ring-amber-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-[#fdfbf7] rounded-xl border border-amber-300 flex items-center justify-center text-xs font-black text-amber-900 shadow-inner">Giấy Tập</div>
              <span className="text-[11px] font-extrabold block text-slate-200">4. Giấy Note Kẻ Ngang</span>
            </button>

            <button
              onClick={() => { setBgType('green_grid'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'green_grid' ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-[#0a2e23] rounded-xl border border-emerald-500 flex items-center justify-center text-xs font-black text-emerald-300">Ô Kẻ Tập</div>
              <span className="text-[11px] font-extrabold block text-slate-200">5. Ô Kẻ Tập Vuông</span>
            </button>

            <button
              onClick={() => { setBgType('english_lines'); setActiveWindow(null); }}
              className={`p-3 rounded-2xl border-2 text-left space-y-1 transition cursor-pointer ${
                bgType === 'english_lines' ? 'bg-emerald-950 border-emerald-400 ring-2 ring-emerald-400' : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <div className="w-full h-12 bg-[#0f382c] rounded-xl border border-emerald-400 flex items-center justify-center text-xs font-black text-emerald-100">Kẻ 4 Dòng</div>
              <span className="text-[11px] font-extrabold block text-slate-200">6. Kẻ 4 Dòng Tiếng Anh</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPONENT MODULE SHAPES */}
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

      {/* POPUP HỘP CÔNG CỤ BÚT VẼ */}
      {activeWindow === 'penToolbox' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 border-2 border-emerald-500 rounded-3xl shadow-2xl p-4 w-96 space-y-3 animate-scale-up font-sans text-white">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-xs text-emerald-400 flex items-center space-x-2">
              <Pencil className="w-4 h-4 text-emerald-400" />
              <span>✏️ HỘP CÔNG CỤ BÚT VẼ & KHOANH KHUNG</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white text-xs font-extrabold">✕</button>
          </div>

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

            <button
              onClick={handleAddHighlightBox}
              className="p-2.5 bg-rose-950/80 hover:bg-rose-900 border-2 border-rose-500 rounded-xl text-xs font-black flex flex-col items-center justify-center space-y-1 transition cursor-pointer text-rose-300 shadow-md"
              title="Khoanh Khung Chữ Nhật / Vuông Nổi Bật Công Thức (Kéo chuột đến đâu khoanh đến đó)"
            >
              <BoxSelect className="w-5 h-5 text-rose-400" />
              <span className="text-[10px] text-rose-200 font-extrabold">3. Bút Khoanh Khung</span>
            </button>
          </div>

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

      {/* MENU CHỌN 3 CÔNG CỤ MINI-GAMES GIẢNG DẠY */}
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
        <div className="fixed top-24 left-16 z-[100] bg-white border-2 border-slate-300 rounded-2xl shadow-2xl p-4 w-72 space-y-3 animate-scale-up font-sans text-slate-900">
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

      {/* POPUP ĐỒNG HỒ BẤM GIỜ */}
      {activeWindow === 'timer' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-80 space-y-4 border-2 border-sky-500 animate-scale-up font-sans">
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

      {/* POPUP XÚC XẮC THÔNG MINH */}
      {activeWindow === 'dice' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border-2 border-purple-500 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-700 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-purple-400">
              <Dices className="w-5 h-5" />
              <span>🎲 XÚC XẮC NGẪU NHIÊN BÀI TẬP</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

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

      {/* POPUP GỌI TÊN HỌC SINH NGẪU NHIÊN */}
      {activeWindow === 'picker' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border-2 border-amber-500 animate-scale-up font-sans">
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

      {/* POPUP MỞ BÀI DẠY ĐÃ LƯU */}
      {activeWindow === 'load' && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-white rounded-3xl shadow-2xl p-6 w-[520px] space-y-4 border border-slate-200 animate-scale-up font-sans text-slate-900">
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
                    <h4 className="font-extrabold text-xs text-slate-900">{lesson.title.replace(/[WHITEBOARD:.*?]/, '').replace(/[WHITEBOARD]/, '').trim()}</h4>
                    <span className="text-[10px] font-extrabold text-sky-700 uppercase bg-sky-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {lesson.title.match(/[WHITEBOARD:(.*?)]/)?.[1] || 'UNIT 1'}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-2">
                      {new Date(lesson.created_at || Date.now()).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      try {
                        const parsedData = JSON.parse(lesson.content);
                        if (parsedData.textElements) {
                          setTextElements(parsedData.textElements);
                        } else {
                          setTextElements([]);
                        }

                        if (parsedData.pages) setPages(parsedData.pages);

                        if (fabricCanvas && parsedData.fabric) {
                          fabricCanvas.loadFromJSON(parsedData.fabric).then(() => {
                            fabricCanvas.renderAll();
                            alert(`🚀 ĐÃ MỞ THÀNH CÔNG BÀI GIẢNG: "${lesson.title.replace(/\[WHITEBOARD:.*?\]/, '').replace(/\[WHITEBOARD\]/, '').trim()}"`);
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

        {/* 3. HAND PAN CANVAS TRƯỢT 100% CÁC ĐỐI TƯỢNG SHAPES & CÁC Ô CHỮ NGUYÊN TRANG BÀI GIẢNG CHUẨN XÁC MYVIEWBOARD */}
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
          title="Bàn tay đè giữ trượt nguyên 1 trang tất cả chữ và đối tượng lên, xuống, trái, phải"
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

        {/* 8. SHAPES PANEL */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeWindow === 'shapes' || tool === 'drawShape'
              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bảng chọn công cụ Shapes hình học"
        >
          <Square className="w-4 h-4" />
        </button>

        <span className="w-px h-6 bg-slate-400/60 my-auto" />

        {/* 9. ICON DUY NHẤT GOM 3 CÔNG CỤ MINI-GAMES GIẢNG DẠY */}
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

        {/* 10. IMAGE UPLOAD NGUYÊN BẢN */}
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

        {/* 12. UNDO NGUYÊN BẢN */}
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
