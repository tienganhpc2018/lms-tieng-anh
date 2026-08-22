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
  Boxes, Group, Ungroup, Scissors, FlipHorizontal, FlipVertical, RefreshCw as RotateIcon, Target, Download, Monitor, PaintBucket
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShapesModulePanel from '../components/whiteboard/ShapesModulePanel';

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

  // VỊ TRÍ THANH TOOLBAR DƯỚI CÙNG SÁT MEP (BOTTOM-3)
  const [toolbarPos, setToolbarPos] = useState('bottom');

  // Công cụ active: 'pointer' | 'hand' | 'text' | 'sticky' | 'pen' | 'highlighter' | 'eraser' | shapes...
  const [tool, setTool] = useState('pointer');
  const [color, setColor] = useState('#dc2626');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Noto Sans');

  // THUỘC TÍNH VẼ SHAPES REAL-TIME CHUẨN MYVIEWBOARD (ẢNH 2)
  const [strokeColor, setStrokeColor] = useState('#09090b');
  const [fillColor, setFillColor] = useState('#ef4444');
  const [hasFill, setHasFill] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [opacity, setOpacity] = useState(1.0);

  // Quản lý Đối Tượng Đang Chọn & Menu Nổi (Floating Toolbar Position)
  const [activeObject, setActiveObject] = useState(null);
  const [floatingMenuPos, setFloatingMenuPos] = useState(null);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups & Tools
  const [activeWindow, setActiveWindow] = useState(null);

  // NẠP & LƯU BÀI DẠY
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

    // 1. CUSTOM BOUNDING BOX CHUẨN MYVIEWBOARD (HÌNH TRÒN TRẮNG, NÉT ĐỨT VÀNG/CAM)
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
    };

    // CẬP NHẬT VỊ TRÍ FLOATING TEXT TOOLBAR NẰM SÁT PHÍA TRÊN ĐỈNH KHUNG TEXT (ẢNH 2)
    const updateFloatingMenu = () => {
      const obj = fc.getActiveObject();
      if (obj) {
        setActiveObject(obj);
        syncShapePropsToUI(obj);
        const bound = obj.getBoundingRect();

        // NẰM SÁT NGAY PHÍA TRÊN ĐỈNH CỦA KHUNG VĂN BẢN ĐANG SOẠN THẢO (ẢNH 2 CHUẨN MYVIEWBOARD)
        if (obj.type === 'textbox') {
          setFloatingMenuPos({
            left: Math.max(20, bound.left),
            top: Math.max(65, bound.top - 62),
          });
        } else {
          setFloatingMenuPos({
            left: bound.left + bound.width + 15,
            top: Math.max(70, bound.top),
          });
        }
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
    fc.on('text:changed', updateFloatingMenu);

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

  // XỬ LÝ CHUYỂN ĐỔI CÔNG CỤ (TOOL SWITCHING)
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
    } else {
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
        if (fabricCanvas && activeObject) {
          e.preventDefault();
          handleDeleteActiveObject();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, activeObject]);

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

  // PHỤC HỒI THUỘC TÍNH ĐỊNH DẠNG FONT SIZE / FAMILY / BOLD / ITALIC / HIGHLIGHT CHO TỪNG ĐOẠN TEXT BÔI ĐEN (CHARACTER-LEVEL STYLING UX)
  const handleApplyTextProp = (propKey, propVal) => {
    if (!fabricCanvas || !activeObject) return;
    if (activeObject.type === 'textbox') {
      const isSelection = activeObject.selectionStart !== activeObject.selectionEnd;
      if (isSelection) {
        // Áp dụng cho từng từ/đoạn text được bôi đen (Character-level styling)
        activeObject.setSelectionStyles({ [propKey]: propVal });
      } else {
        // Áp dụng cho toàn bộ ô Text
        activeObject.set(propKey, propVal);
      }
      fabricCanvas.renderAll();
    }
  };

  // THÊM Ô TEXTBOX SOẠN THẢO VĂN BẢN MỚI
  const handleAddText = () => {
    if (!fabricCanvas) return;
    const textbox = new fabric.Textbox('Nhấp để gõ bài giảng...', {
      left: 200,
      top: 180,
      width: 450,
      fontSize: fontSize,
      fontFamily: fontFamily,
      fill: color === '#000000' ? '#ffffff' : color,
    });
    fabricCanvas.add(textbox);
    fabricCanvas.setActiveObject(textbox);
    textbox.enterEditing(); // Tự động bật chế độ gõ chữ ngay lập tức
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

  // THÊM SHAPES HÌNH HỌC MỚI THEO TRẠNG THÁI 1 (CREATION WITH PROPS)
  const handleSelectShape = (shapeType) => {
    if (!fabricCanvas) return;

    const curFill = hasFill ? fillColor : 'transparent';
    const curStroke = strokeColor;
    const curWidth = Number(strokeWidth);
    const curOpacity = Number(opacity);

    let shape = null;
    if (shapeType === 'rect') {
      shape = new fabric.Rect({ left: 220, top: 160, width: 200, height: 120, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'circle') {
      shape = new fabric.Circle({ left: 220, top: 160, radius: 80, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'oval') {
      shape = new fabric.Ellipse({ left: 220, top: 160, rx: 110, ry: 65, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'triangle') {
      shape = new fabric.Triangle({ left: 220, top: 160, width: 180, height: 150, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'line') {
      shape = new fabric.Line([50, 50, 250, 50], { left: 220, top: 160, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'arrow') {
      shape = new fabric.Path('M 0 0 L 140 0 M 140 0 L 120 -12 M 140 0 L 120 12', {
        left: 220,
        top: 160,
        stroke: curStroke,
        strokeWidth: curWidth,
        fill: 'transparent',
        opacity: curOpacity,
      });
    } else if (shapeType === 'polygon5') {
      shape = new fabric.Polygon([
        { x: 100, y: 0 }, { x: 200, y: 70 }, { x: 160, y: 180 }, { x: 40, y: 180 }, { x: 0, y: 70 }
      ], { left: 220, top: 160, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    } else if (shapeType === 'polygon6') {
      shape = new fabric.Polygon([
        { x: 60, y: 0 }, { x: 140, y: 0 }, { x: 200, y: 80 }, { x: 140, y: 160 }, { x: 60, y: 160 }, { x: 0, y: 80 }
      ], { left: 220, top: 160, fill: curFill, stroke: curStroke, strokeWidth: curWidth, opacity: curOpacity });
    }

    if (shape) {
      fabricCanvas.add(shape);
      fabricCanvas.setActiveObject(shape);
      fabricCanvas.renderAll();
      setTool('pointer');
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

  // PHỤC HỒI TÍNH NĂNG "LƯU BÀI DẠY" CHUẨN KHÔNG LỖI DATABASE
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    try {
      const fullTitle = `[WHITEBOARD:${selectedUnit}] ${lessonTitle}`;
      
      let canvasJson = '{}';
      if (fabricCanvas) {
        canvasJson = JSON.stringify(fabricCanvas.toJSON());
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
      const { data: secData } = await supabase.from('sections').select('id').limit(1);
      if (secData && secData.length > 0) {
        targetSectionId = secData[0].id;
      }

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
        alert('Lỗi lưu bài dạy: ' + error.message);
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
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

          <span className="text-xs text-slate-400 font-bold px-2">
            {new Date().toLocaleDateString('vi-VN')} • Fabric.js v6
          </span>
        </div>
      </div>

      {/* WORKSPACE FABRIC CANVAS CONTAINER */}
      <div ref={containerRef} className="relative w-full h-[calc(100vh-50px)] overflow-hidden">
        <canvas ref={canvasRef} className="absolute top-0 left-0" />

        {/* MENU NỔI FLOATING TEXT TOOLBAR CHUẨN NẰM SÁT NGAY PHÍA TRÊN ĐỈNH KHUNG TEXT (ẢNH 2 CHUẨN MYVIEWBOARD) */}
        {activeObject && floatingMenuPos && (
          <div
            style={{
              left: `${floatingMenuPos.left}px`,
              top: `${floatingMenuPos.top}px`,
            }}
            className="fixed z-[100] bg-[#ded8be] backdrop-blur-md text-slate-900 rounded-2xl shadow-2xl p-2 border-2 border-[#b8af91] flex items-center space-x-2 animate-scale-up font-sans"
          >
            {/* Nếu đang select Textbox ➔ Hiện thanh RICH TEXT EDITOR NẰM SÁT TRÊN ĐỈNH KHUNG TEXT (ẢNH 2 MYVIEWBOARD) */}
            {activeObject.type === 'textbox' ? (
              <>
                <select
                  value={activeObject.fontFamily || 'Noto Sans'}
                  onChange={(e) => handleApplyTextProp('fontFamily', e.target.value)}
                  className="p-1 border border-slate-400 rounded-xl text-xs font-bold bg-white outline-none"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                <select
                  value={activeObject.fontSize || 32}
                  onChange={(e) => handleApplyTextProp('fontSize', Number(e.target.value))}
                  className="p-1 border border-slate-400 rounded-xl text-xs font-bold bg-white outline-none"
                >
                  {FONT_SIZES.map((sz) => (
                    <option key={sz} value={sz}>{sz}px</option>
                  ))}
                </select>

                <span className="w-px h-5 bg-slate-400" />

                <button
                  onClick={() => handleApplyTextProp('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold')}
                  className={`p-1.5 rounded-lg border text-xs font-black cursor-pointer ${
                    activeObject.fontWeight === 'bold' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                  }`}
                  title="In Đậm (B)"
                >
                  <Bold className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleApplyTextProp('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic')}
                  className={`p-1.5 rounded-lg border text-xs italic cursor-pointer ${
                    activeObject.fontStyle === 'italic' ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                  }`}
                  title="In Nghiêng (I)"
                >
                  <Italic className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleApplyTextProp('underline', !activeObject.underline)}
                  className={`p-1.5 rounded-lg border text-xs underline cursor-pointer ${
                    activeObject.underline ? 'bg-amber-600 text-white border-amber-700' : 'bg-white hover:bg-slate-100 border-slate-300'
                  }`}
                  title="Gạch Chân (U)"
                >
                  <Underline className="w-4 h-4" />
                </button>

                <span className="w-px h-5 bg-slate-400" />

                {/* Màu chữ (Text Color) */}
                <input
                  type="color"
                  value={activeObject.fill || color}
                  onChange={(e) => handleApplyTextProp('fill', e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border border-slate-400 p-0"
                  title="Đổi màu chữ"
                />

                {/* Tô màu nền Highlight cho chữ bôi đen */}
                <div className="flex items-center space-x-1 bg-[#d2caa9] p-1 rounded-xl border border-[#c8c0a3]">
                  <span className="text-[10px] font-black text-slate-800">Highlight:</span>
                  {HIGHLIGHT_PALETTE.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => handleApplyTextProp('textBackgroundColor', item.color)}
                      style={{ backgroundColor: item.color }}
                      className="w-5 h-5 rounded-full border border-slate-500 hover:scale-110 transition shadow-2xs cursor-pointer"
                      title={`Tô màu Highlight ${item.name} cho chữ bôi đen`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => handleApplyTextProp('textBackgroundColor', '')}
                    className="px-1.5 py-0.5 text-[9px] font-black bg-white rounded border border-slate-400 cursor-pointer"
                    title="Xóa Highlight"
                  >
                    Bỏ
                  </button>
                </div>

                <span className="w-px h-5 bg-slate-400" />

                {/* Căn lề Trái / Giữa / Phải */}
                <button
                  onClick={() => handleApplyTextProp('textAlign', 'left')}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    activeObject.textAlign === 'left' ? 'bg-sky-600 text-white' : 'bg-white hover:bg-slate-100'
                  }`}
                  title="Căn Trái"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyTextProp('textAlign', 'center')}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    activeObject.textAlign === 'center' ? 'bg-sky-600 text-white' : 'bg-white hover:bg-slate-100'
                  }`}
                  title="Căn Giữa"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApplyTextProp('textAlign', 'right')}
                  className={`p-1.5 rounded-lg border cursor-pointer ${
                    activeObject.textAlign === 'right' ? 'bg-sky-600 text-white' : 'bg-white hover:bg-slate-100'
                  }`}
                  title="Căn Phải"
                >
                  <AlignRight className="w-4 h-4" />
                </button>

                <span className="w-px h-5 bg-slate-400" />

                <button
                  onClick={handleDeleteActiveObject}
                  className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                  title="Xóa ô văn bản (Delete)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              /* MENU NỔI CHO CÁC VẬT THỂ KHÁC (ẢNH DÁN, SHAPES, STICKY) */
              <>
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
              </>
            )}
          </div>
        )}
      </div>

      {/* COMPONENT MODULE SHAPES ĐƯỢC TÁCH CẤU TRÚC RIÊNG BỆNH CHUẨN ẢNH MYVIEWBOARD */}
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
        onSelectShape={handleSelectShape}
        activeObject={activeObject}
        fabricCanvas={fabricCanvas}
      />

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
                        if (fabricCanvas && parsedData) {
                          fabricCanvas.loadFromJSON(parsedData).then(() => {
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
          className={`p-2 rounded-xl transition cursor-pointer ${
            activeWindow === 'shapes'
              ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bảng chọn công cụ Shapes hình học"
        >
          <Square className="w-4 h-4" />
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
