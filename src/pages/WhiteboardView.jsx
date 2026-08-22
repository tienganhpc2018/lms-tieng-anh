import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Pencil, Eraser, Move, Type, Square, Circle, Triangle, Undo, Redo, 
  Trash2, Image as ImageIcon, Save, FolderOpen, ArrowLeft, ArrowRight, Plus, 
  CheckCircle2, XCircle, Clock, Dices, Link as LinkIcon, Grid, Layout, 
  Maximize2, Minimize2, Sparkles, X, Play, RotateCcw, Volume2, Ruler, 
  Highlighter, Bold, Italic, Underline, Search, ZoomIn, ZoomOut, Check, ChevronLeft, ChevronRight,
  Layers, Lock, Unlock, Copy, ArrowUp, ArrowDown, BookOpen, Edit3, Hand, Minus, MousePointer, Pause, RefreshCw, Users,
  StickyNote, AlignLeft, AlignCenter, AlignRight, CornerUpRight, ArrowUpRight, Star, Diamond, Layers3, ArrowDownToLine, ArrowUpToLine,
  Boxes, Group, Ungroup
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // BẢO VỆ PHÂN QUYỀN HỌC SINH
  useEffect(() => {
    if (user && !isTeacher) {
      alert('⚠️ Tính năng Bảng Tương Tác Giảng Dạy chỉ dành riêng cho Giáo viên!');
      navigate('/dashboard');
    }
  }, [user, isTeacher, navigate]);

  // CẤU TRÚC TRANG BẢNG CHUẨN
  const createEmptyPage = () => ({
    canvasData: '',
    textElements: [],
    objectElements: [],
  });

  const [pages, setPages] = useState([createEmptyPage()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // DUY NHẤT 1 THANH TOOLBAR NẰM DƯỚI CÙNG SÁT MEP (BOTTOM-3)
  const [toolbarPos, setToolbarPos] = useState('bottom');

  // Công cụ active: 'pointer' | 'hand' | 'text' | 'sticky' | 'pen' | 'highlighter' | 'eraser' ...
  const [tool, setTool] = useState('pointer');
  const [color, setColor] = useState('#dc2626');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Noto Sans');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  // Quản lý Text / Sticky Objects & Selected State
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Quản lý Ảnh chụp từ Snipping Tool & Shapes & Thu Phóng Kích Thước
  const [selectedObjId, setSelectedObjId] = useState(null);
  const [draggingObjId, setDraggingObjId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // PAN CANVAS VÔ HẠN BẰNG BÀN TAY
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // GROUP ALL TẤT CẢ VẬT THỂ
  const [isGroupedAll, setIsGroupedAll] = useState(false);

  // VẼ REALTIME LIVE PREVIEW
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });

  // LỊCH SỬ UNDO / REDO HOÀN CHỈNH CHO CẢ CANVAS VÀ CÁC ĐỐI TƯỢNG
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups
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

  // MÀU SẮC STICKY NOTE
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

  // TRẢ LẠI CON TRỎ CHUỘT HỆ THỐNG RÕ RÀNG 100% RÕ NẾT KHÔNG BAO GIỜ BỊ CHE HOẶC ẨN
  const getCursorStyle = () => {
    if (tool === 'hand') {
      return isPanning ? 'grabbing' : 'grab';
    }
    if (tool === 'pointer') {
      return 'default';
    }
    if (tool === 'text') {
      return 'text';
    }
    if (tool === 'eraser') {
      return 'cell';
    }
    return 'crosshair';
  };

  // XÓA CHUẨN XÁC KHI NHẤP PHÍM DELETE HOẶC NÚT THÙNG RÁC CHO SHAPES, Ô TEXT, STICKY VÀ ẢNH DÁN
  const handleDeleteSelectedElement = () => {
    if (selectedTextId) {
      setPages((prev) => {
        const copy = [...prev];
        const cur = copy[currentPageIndex] || createEmptyPage();
        const filtered = (cur.textElements || []).filter((b) => b.id !== selectedTextId);
        copy[currentPageIndex] = { ...cur, textElements: filtered };
        return copy;
      });
      setSelectedTextId(null);
      saveSnapshotState();
    } else if (selectedObjId) {
      setPages((prev) => {
        const copy = [...prev];
        const cur = copy[currentPageIndex] || createEmptyPage();
        const filtered = (cur.objectElements || []).filter((o) => o.id !== selectedObjId);
        copy[currentPageIndex] = { ...cur, objectElements: filtered };
        return copy;
      });
      setSelectedObjId(null);
      saveSnapshotState();
    } else {
      alert('Thầy Hải hãy nhấp chọn ô Text, Sticky, Shapes hoặc Ảnh dán cần xóa trước nhé!');
    }
  };

  // PHÍM DELETE HOẶC BACKSPACE XÓA VẬT THỂ 1-CLICK
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedTextId || selectedObjId) {
          e.preventDefault();
          handleDeleteSelectedElement();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTextId, selectedObjId, currentPageIndex]);

  const handleIncreaseDice = () => {
    if (diceCount < 6) {
      const newCount = diceCount + 1;
      setDiceCount(newCount);
      setDiceValues((prev) => [...prev, Math.floor(Math.random() * 6) + 1]);
    }
  };

  const handleDecreaseDice = () => {
    if (diceCount > 1) {
      const newCount = diceCount - 1;
      setDiceCount(newCount);
      setDiceValues((prev) => prev.slice(0, newCount));
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
      } else if (type === 'tictoc') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
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
          playSoundEffect('tictoc');
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning, timerRemaining]);

  // NẠP BÀI DẠY
  const [savedLessons, setSavedLessons] = useState([]);
  const [loadingSavedLessons, setLoadingSavedLessons] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unit 1: Local Community');
  const [lessonTitle, setLessonTitle] = useState('Bài Giảng Tiếng Anh 9');
  const [savingLesson, setSavingLesson] = useState(false);

  const colorPalette = [
    '#ff0000', '#ff8700', '#ffd300', '#00a83e', '#0026a8', '#670014', '#ffffff', '#000000',
    '#ff66a1', '#ff944d', '#ffe680', '#80ffaa', '#6680ff', '#b366ff', '#808080', '#4d4d4d',
    '#ffb3d1', '#ffd9b3', '#ffffcc', '#d9ffb3', '#80d4ff', '#d9b3ff', '#cccccc', '#333333'
  ];

  useEffect(() => {
    if (activityId) {
      const fetchActivityLesson = async () => {
        const { data, error } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .single();

        if (!error && data && data.content) {
          setLessonTitle(data.title.replace('[WHITEBOARD]', '').trim());
          try {
            const parsed = JSON.parse(data.content);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPages(parsed);
              setCurrentPageIndex(0);
              setTimeout(() => renderPageCanvas(parsed[0]), 100);
            }
          } catch (e) {}
        }
      };
      fetchActivityLesson();
    }
  }, [activityId]);

  // INITIALIZE CANVAS & PASTE LISTENER
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    saveSnapshotState();

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
              width: 700,
              height: 480,
              zIndex: 1,
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
            setSelectedObjId(newObj.id);
            setSelectedTextId(null);
            setTool('pointer');
            saveSnapshotState();
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [panOffset, currentPageIndex]);

  // UNDO & REDO SNAPSHOT STATE MANAGEMENT
  const saveSnapshotState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL();
    const curPage = pages[currentPageIndex] || createEmptyPage();
    const snapshot = {
      canvasData: dataUrl,
      textElements: JSON.parse(JSON.stringify(curPage.textElements || [])),
      objectElements: JSON.parse(JSON.stringify(curPage.objectElements || [])),
    };

    const newStack = historyStack.slice(0, historyIndex + 1);
    setHistoryStack([...newStack, snapshot]);
    setHistoryIndex(newStack.length);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const snapshot = historyStack[newIndex];
      if (snapshot) {
        restoreSnapshot(snapshot);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const snapshot = historyStack[newIndex];
      if (snapshot) {
        restoreSnapshot(snapshot);
      }
    }
  };

  const restoreSnapshot = (snapshot) => {
    const canvas = canvasRef.current;
    if (!canvas || !snapshot) return;
    const ctx = canvas.getContext('2d');
    const dataUrl = snapshot.canvasData;

    setPages((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = {
        ...copy[currentPageIndex],
        textElements: snapshot.textElements || [],
        objectElements: snapshot.objectElements || [],
        canvasData: dataUrl,
      };
      return copy;
    });

    if (dataUrl) {
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
    }
  };

  const toggleToolbarPosition = () => {
    const posList = ['bottom', 'left', 'top', 'right'];
    const nextIdx = (posList.indexOf(toolbarPos) + 1) % posList.length;
    const nextPos = posList[nextIdx];
    setToolbarPos(nextPos);
  };

  // TẠO STICKY NOTE MỚI
  const handleAddStickyNote = (colorObj) => {
    const newId = 'sticky_' + Date.now();
    const newBox = {
      id: newId,
      type: 'sticky',
      x: 300 - panOffset.x,
      y: 180 - panOffset.y,
      width: 280,
      height: 240,
      htmlContent: '📌 Nhập ghi chú tại đây...',
      color: colorObj.text,
      bgColor: colorObj.bg,
      borderColor: colorObj.border,
      fontSize: 24,
      fontFamily: 'Noto Sans',
      isBold: false,
      isItalic: false,
      isUnderline: false,
    };

    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      copy[currentPageIndex] = {
        ...cur,
        textElements: [...(cur.textElements || []), newBox],
      };
      return copy;
    });

    setSelectedTextId(newId);
    setSelectedObjId(null);
    setTool('pointer');
    setActiveWindow(null);
    saveSnapshotState();
  };

  // TÍNH TỌA ĐỘ NẠP Ô TEXT CHUẨN XÁC
  const handleCanvasClickToCreateText = (e) => {
    const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : { left: 0, top: 50 };
    const clickX = e.clientX - rect.left - panOffset.x;
    const clickY = e.clientY - rect.top - panOffset.y;

    const newId = 'text_' + Date.now();
    const newBox = {
      id: newId,
      type: 'text',
      x: Math.max(20, clickX),
      y: Math.max(20, clickY),
      width: 650,
      htmlContent: 'Nhấp để gõ bài giảng...',
      color: color === '#000000' ? '#ffffff' : color,
      fontSize: fontSize,
      fontFamily: fontFamily,
      isBold: isBold,
      isItalic: isItalic,
      isUnderline: isUnderline,
    };

    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      copy[currentPageIndex] = {
        ...cur,
        textElements: [...(cur.textElements || []), newBox],
      };
      return copy;
    });

    setSelectedTextId(newId);
    setSelectedObjId(null);
    setTool('pointer');
    saveSnapshotState();
  };

  // HIGHLIGHT CHỌN MÀU PHONG PHÚ
  const applySelectionHighlight = (selectedColor) => {
    const selection = window.getSelection();
    if (!selection.rangeCount || selection.isCollapsed) {
      alert('Thầy Hải hãy bôi đen từ/cụm từ cần Highlight trước nhé!');
      return;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.backgroundColor = selectedColor;
    span.style.color = '#0f172a';
    span.style.borderRadius = '4px';
    span.style.padding = '1px 4px';
    span.style.fontWeight = 'bold';

    try {
      range.surroundContents(span);
    } catch (e) {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }
  };

  // Z-INDEX ẢNH DÁN
  const handleSetZIndexImage = (id, targetZIndex) => {
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const updated = (cur.objectElements || []).map((o) => {
        if (o.id === id) {
          return { ...o, zIndex: targetZIndex };
        }
        return o;
      });
      copy[currentPageIndex] = { ...cur, objectElements: updated };
      return copy;
    });
    saveSnapshotState();
  };

  // THU PHÓNG ẢNH DÁN
  const handleResizeImage = (id, deltaWidth, deltaHeight, e) => {
    if (e) e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const updated = (cur.objectElements || []).map((o) => {
        if (o.id === id) {
          const newW = Math.min(2400, Math.max(200, (o.width || 700) + deltaWidth));
          const newH = Math.min(2000, Math.max(150, (o.height || 480) + deltaHeight));
          return { ...o, width: newW, height: newH };
        }
        return o;
      });
      copy[currentPageIndex] = { ...cur, objectElements: updated };
      return copy;
    });
    saveSnapshotState();
  };

  // KÉO RÊ VẬT THỂ BẰNG CON TRỎ HOẶC MOVER
  const handleStartDragElement = (id, isImage, e) => {
    if (tool !== 'pointer') return;
    e.stopPropagation();
    setDraggingObjId(id);

    const curPage = pages[currentPageIndex] || createEmptyPage();
    if (isImage) {
      setSelectedObjId(id);
      setSelectedTextId(null);
      const target = (curPage.objectElements || []).find((o) => o.id === id);
      if (target) {
        setDragOffset({ x: e.clientX - target.x, y: e.clientY - target.y });
      }
    } else {
      setSelectedTextId(id);
      setSelectedObjId(null);
      const target = (curPage.textElements || []).find((b) => b.id === id);
      if (target) {
        setDragOffset({ x: e.clientX - target.x, y: e.clientY - target.y });
      }
    }
  };

  // CÔNG CỤ BÀN TAY PAN CANVAS TRƯỢT NỘI DUNG SANG TRÁI / PHẢI HOẶC TRÊN / DƯỚI
  const handleStartPan = (e) => {
    if (tool === 'hand') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    } else {
      startDrawing(e);
    }
  };

  const handleMouseMoveGlobal = (e) => {
    if (isPanning && tool === 'hand') {
      const newOffsetX = e.clientX - panStart.x;
      const newOffsetY = e.clientY - panStart.y;
      setPanOffset({ x: newOffsetX, y: newOffsetY });
    } else if (draggingObjId) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setPages((prev) => {
        const copy = [...prev];
        const cur = copy[currentPageIndex] || createEmptyPage();
        if (draggingObjId.startsWith('img_')) {
          const updated = (cur.objectElements || []).map((o) =>
            o.id === draggingObjId ? { ...o, x: newX, y: newY } : o
          );
          copy[currentPageIndex] = { ...cur, objectElements: updated };
        } else {
          const updated = (cur.textElements || []).map((b) =>
            b.id === draggingObjId ? { ...b, x: newX, y: newY } : b
          );
          copy[currentPageIndex] = { ...cur, textElements: updated };
        }
        return copy;
      });
    } else if (isDrawing && tool !== 'pointer' && tool !== 'hand') {
      const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      setCurrentMousePos({ x, y });
      draw(e);
    }
  };

  const handleMouseUpGlobal = (e) => {
    if (isPanning) {
      setIsPanning(false);
    } else if (draggingObjId) {
      setDraggingObjId(null);
      saveSnapshotState();
    } else if (isDrawing) {
      stopDrawing(e);
    }
  };

  // CANVAS DRAWING LOGIC
  const startDrawing = (e) => {
    if (tool === 'pointer' || tool === 'hand') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : canvas.getBoundingClientRect();
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
    if (!isDrawing || tool === 'pointer' || tool === 'hand') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : canvas.getBoundingClientRect();
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
      ctx.strokeStyle = color === '#000000' ? '#ff2a6d' : color;
      ctx.lineWidth = 24;
      ctx.globalAlpha = 0.45;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.clearRect(x - 20, y - 20, 40, 40);
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing || tool === 'pointer' || tool === 'hand') return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 1.0;

    if (e) {
      const rect = containerRef.current ? containerRef.current.getBoundingClientRect() : canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;

      if (tool === 'line') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawArrow(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'elbow_arrow') {
        drawElbowArrow(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'block_arrow') {
        drawBlockArrow(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'shape_rect' || tool === 'underline_box') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
      } else if (tool === 'shape_circle') {
        const rx = Math.abs(x - startPos.x) / 2;
        const ry = Math.abs(y - startPos.y) / 2;
        const cx = Math.min(startPos.x, x) + rx;
        const cy = Math.min(startPos.y, y) + ry;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'shape_diamond') {
        drawDiamond(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'shape_star') {
        drawStar(ctx, startPos.x, startPos.y, x, y, color);
      } else if (tool === 'stamp_check') {
        drawCheckmark(ctx, x, y);
      } else if (tool === 'stamp_cross') {
        drawCrossmark(ctx, x, y);
      }
    }

    saveSnapshotState();
  };

  // HELPER DRAW FUNCTIONS
  function drawArrow(ctx, fromx, fromy, tox, toy, strokeColor) {
    const headlen = 16;
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  }

  function drawElbowArrow(ctx, x1, y1, x2, y2, strokeColor) {
    const midX = x1 + (x2 - x1) / 2;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(midX, y1);
    ctx.lineTo(midX, y2);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    drawArrow(ctx, midX, y2, x2, y2, strokeColor);
  }

  function drawBlockArrow(ctx, x1, y1, x2, y2, strokeColor) {
    const w = x2 - x1;
    const h = y2 - y1;
    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = strokeColor + '44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + h * 0.3);
    ctx.lineTo(x1 + w * 0.6, y1 + h * 0.3);
    ctx.lineTo(x1 + w * 0.6, y1);
    ctx.lineTo(x2, y1 + h * 0.5);
    ctx.lineTo(x1 + w * 0.6, y2);
    ctx.lineTo(x1 + w * 0.6, y1 + h * 0.7);
    ctx.lineTo(x1, y1 + h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawDiamond(ctx, x1, y1, x2, y2, strokeColor) {
    const cx = x1 + (x2 - x1) / 2;
    const cy = y1 + (y2 - y1) / 2;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, y1);
    ctx.lineTo(x2, cy);
    ctx.lineTo(cx, y2);
    ctx.lineTo(x1, cy);
    ctx.closePath();
    ctx.stroke();
  }

  function drawStar(ctx, x1, y1, x2, y2, strokeColor) {
    const cx = x1 + (x2 - x1) / 2;
    const cy = y1 + (y2 - y1) / 2;
    const outerR = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
    const innerR = outerR / 2.2;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (i * Math.PI) / 5 - Math.PI / 2;
      const x = cx + r * Math.cos(a);
      const y = cy + r * Math.sin(a);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  function drawCheckmark(ctx, x, y) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 5, y + 12);
    ctx.lineTo(x + 18, y - 14);
    ctx.stroke();
  }

  function drawCrossmark(ctx, x, y) {
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 14, y - 14);
    ctx.lineTo(x + 14, y + 14);
    ctx.moveTo(x + 14, y - 14);
    ctx.lineTo(x - 14, y + 14);
    ctx.stroke();
  }

  const clearCurrentPage = () => {
    if (confirm('Thầy Hải có chắc muốn xóa sạch toàn bộ nội dung vẽ trên trang này?')) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPages((prev) => {
        const copy = [...prev];
        copy[currentPageIndex] = createEmptyPage();
        return copy;
      });
      setSelectedTextId(null);
      setSelectedObjId(null);
      saveSnapshotState();
    }
  };

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

  const handleSaveLesson = async () => {
    setSavingLesson(true);
    try {
      const fullTitle = `[WHITEBOARD:${selectedUnit}] ${lessonTitle}`;
      const payloadStr = JSON.stringify(pages);

      const { data, error } = await supabase.from('activities').insert({
        title: fullTitle,
        type: 'whiteboard',
        content: payloadStr,
        created_at: new Date().toISOString(),
      });

      if (!error) {
        alert(`💾 ĐÃ LƯU BÀI DẠY CHUẨN XÁC VÀO SYSTEM TẠI: "${selectedUnit}"!`);
        setActiveWindow(null);
      } else {
        alert('Lỗi lưu bài dạy: ' + error.message);
      }
    } catch (e) {
      alert('Lỗi: ' + e.message);
    }
    setSavingLesson(false);
  };

  const currentPage = pages[currentPageIndex] || createEmptyPage();

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

  const activeCursor = getCursorStyle();

  return (
    <div
      onMouseMove={handleMouseMoveGlobal}
      onMouseUp={handleMouseUpGlobal}
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
              {lessonTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsGroupedAll(!isGroupedAll);
              alert(isGroupedAll ? '🔓 Đã HỦY NHÓM các vật thể.' : '📦 Đã NHÓM TẤT CẢ các vật thể thành 1 khối duy nhất để dễ kéo rê!');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 border ${
              isGroupedAll ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
            title="Nhóm tất cả các ô chữ & ảnh dán thành 1 khối để kéo đi"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>{isGroupedAll ? '📦 Đã Nhóm' : '📦 Nhóm Tất Cả'}</span>
          </button>

          <button
            onClick={() => {
              fetchSavedLessons();
              setActiveWindow('load');
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1.5"
          >
            <FolderOpen className="w-4 h-4" />
            <span>📁 Mở Bài Dạy</span>
          </button>

          <button
            onClick={() => setActiveWindow('save')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm transition flex items-center space-x-1.5"
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
            {new Date().toLocaleDateString('vi-VN')} • Trang {currentPageIndex + 1}/{pages.length}
          </span>
        </div>
      </div>

      {/* WORKSPACE CANVAS AREA */}
      <div
        ref={containerRef}
        onMouseDown={handleStartPan}
        style={{
          cursor: activeCursor,
        }}
        className="relative w-full h-[calc(100vh-50px)] overflow-hidden"
        onClick={(e) => {
          if (tool === 'text') {
            handleCanvasClickToCreateText(e);
          } else if (tool === 'pointer') {
            setSelectedTextId(null);
            setSelectedObjId(null);
          }
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ cursor: activeCursor }}
          className="absolute top-0 left-0 z-10 touch-none"
        />

        {/* SVG LAYER REALTIME LIVE PREVIEW */}
        {isDrawing && (tool.startsWith('shape_') || tool === 'line' || tool.endsWith('_arrow')) && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-20">
            {tool === 'line' && (
              <line x1={startPos.x} y1={startPos.y} x2={currentMousePos.x} y2={currentMousePos.y} stroke={color} strokeWidth="3" strokeDasharray="4" />
            )}
            {tool === 'shape_rect' && (
              <rect
                x={Math.min(startPos.x, currentMousePos.x)}
                y={Math.min(startPos.y, currentMousePos.y)}
                width={Math.abs(currentMousePos.x - startPos.x)}
                height={Math.abs(currentMousePos.y - startPos.y)}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray="4"
              />
            )}
            {tool === 'shape_circle' && (
              <ellipse
                cx={startPos.x + (currentMousePos.x - startPos.x) / 2}
                cy={startPos.y + (currentMousePos.y - startPos.y) / 2}
                rx={Math.abs(currentMousePos.x - startPos.x)}
                ry={Math.abs(currentMousePos.y - startPos.y)}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeDasharray="4"
              />
            )}
          </svg>
        )}

        {/* RENDER CÁC ẢNH CHỤP ĐÃ DÁN VÀO BẢNG */}
        {(currentPage.objectElements || []).map((obj) => {
          const isSelected = selectedObjId === obj.id;
          return (
            <div
              key={obj.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObjId(obj.id);
                setSelectedTextId(null);
              }}
              onMouseDown={(e) => {
                if (tool === 'pointer') {
                  handleStartDragElement(obj.id, true, e);
                }
              }}
              style={{
                left: `${obj.x + panOffset.x}px`,
                top: `${obj.y + panOffset.y}px`,
                width: `${obj.width || 700}px`,
                height: `${obj.height || 480}px`,
                zIndex: obj.zIndex ?? 1,
              }}
              className={`absolute group select-none ${
                tool === 'pointer' ? 'cursor-move' : ''
              } ${
                isSelected ? 'ring-4 ring-sky-500 shadow-2xl' : 'hover:ring-2 hover:ring-sky-300/60'
              }`}
            >
              <img
                src={obj.src}
                alt="Uploaded"
                className="w-full h-full object-contain pointer-events-none rounded-xl"
              />

              {/* THANH ĐIỀU CHỈNH ẢNH DÁN */}
              {isSelected && (
                <div className="absolute -top-11 left-0 bg-slate-900 text-white rounded-2xl shadow-2xl px-3 py-1 flex items-center space-x-2 text-xs border border-slate-700 z-50 animate-scale-up font-sans">
                  <span className="font-extrabold text-amber-400">🖼️ Ảnh dán bài tập</span>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetZIndexImage(obj.id, 50); }}
                    className="px-2 py-0.5 bg-sky-900 hover:bg-sky-800 rounded text-[11px] font-bold text-sky-200 flex items-center space-x-1"
                    title="Đưa ảnh lên trên cùng"
                  >
                    <ArrowUpToLine className="w-3.5 h-3.5" />
                    <span>Lên Trên</span>
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetZIndexImage(obj.id, 0); }}
                    className="px-2 py-0.5 bg-amber-900 hover:bg-amber-800 rounded text-[11px] font-bold text-amber-200 flex items-center space-x-1"
                    title="Đưa ảnh xuống dưới cùng để vẽ chú thích đè lên"
                  >
                    <ArrowDownToLine className="w-3.5 h-3.5" />
                    <span>Xuống Dưới</span>
                  </button>

                  <span className="w-px h-4 bg-slate-700" />

                  <button
                    onClick={(e) => handleResizeImage(obj.id, 100, 70, e)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-bold text-sky-300"
                    title="Phóng to ảnh"
                  >
                    ➕
                  </button>
                  <button
                    onClick={(e) => handleResizeImage(obj.id, -100, -70, e)}
                    className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px] font-bold text-amber-300"
                    title="Thu nhỏ ảnh"
                  >
                    ➖
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSelectedElement();
                    }}
                    className="p-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition flex items-center space-x-1 cursor-pointer"
                    title="Xóa ảnh này (hoặc nhấn phím Delete)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* RENDER Ô TEXT & STICKY (SỬA LỖI CHE THANH ĐIỀU KHIỂN ĐỈNH BẢNG: TỰ ĐỘNG ĐẨY ĐỊNH DẠNG XUỐNG DƯỚI KHI Ô TEXT NẰM Ở ĐỈNH (box.y < 90px)) */}
        {(currentPage.textElements || []).map((box) => {
          const isSelected = selectedTextId === box.id;
          const isSticky = box.type === 'sticky';
          const isNearTop = box.y < 90; // Ô text sát đỉnh trên cùng

          return (
            <div
              key={box.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTextId(box.id);
                setSelectedObjId(null);
              }}
              onMouseDown={(e) => {
                if (tool === 'pointer') {
                  handleStartDragElement(box.id, false, e);
                }
              }}
              style={{
                left: `${box.x + panOffset.x}px`,
                top: `${box.y + panOffset.y}px`,
                width: isSticky ? `${box.width || 280}px` : `${box.width || 650}px`,
                height: isSticky ? `${box.height || 240}px` : 'auto',
                backgroundColor: isSticky ? (box.bgColor || '#fef08a') : 'transparent',
                borderColor: isSticky ? (box.borderColor || '#fde047') : 'transparent',
                zIndex: 40,
              }}
              className={`absolute group p-3 transition duration-150 rounded-2xl relative ${
                tool === 'pointer' ? 'cursor-pointer' : ''
              } ${
                isSticky ? 'shadow-xl border-2 rotate-1 hover:rotate-0' : ''
              } ${isSelected ? 'ring-4 ring-indigo-500 shadow-2xl bg-slate-900/60 backdrop-blur-xs' : 'hover:ring-2 hover:ring-indigo-300'}`}
            >
              {/* NÚT MOVER DRAG HANDLE */}
              <div
                onMouseDown={(e) => handleStartDragElement(box.id, false, e)}
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-3 py-0.5 text-[10px] font-black shadow-md cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition flex items-center space-x-1"
                title="Nắm vào đây để kéo di chuyển ô chữ"
              >
                <Move className="w-3 h-3" />
                <span>Kéo rê</span>
              </div>

              {/* THANH TOOLBAR DÍNH LIỀN Ô VĂN BẢN (KHÔNG BAO GIỜ CHE CON TRỎ / HEADER: TỰ ĐỘNG XUỐNG DƯỚI KHI Ở ĐỈNH (top-full mt-2)) */}
              {isSelected && (
                <div
                  className={`absolute left-0 z-[90] bg-white text-slate-900 rounded-2xl shadow-2xl border-2 border-indigo-500/60 p-2 flex items-center space-x-2 text-xs font-bold animate-scale-up font-sans ${
                    isNearTop ? 'top-full mt-2' : 'bottom-full mb-2'
                  }`}
                >
                  <select
                    value={box.fontFamily || 'Noto Sans'}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, fontFamily: val } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className="p-1 border border-slate-300 rounded-xl bg-slate-50 font-bold outline-none"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>

                  <select
                    value={box.fontSize || 32}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, fontSize: val } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className="p-1 border border-slate-300 rounded-xl bg-slate-50 font-bold outline-none"
                  >
                    {FONT_SIZES.map((sz) => (
                      <option key={sz} value={sz}>{sz}px</option>
                    ))}
                  </select>

                  <span className="w-px h-5 bg-slate-300" />

                  <div className="flex items-center space-x-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
                    <span className="text-[11px] font-black text-amber-900 flex items-center space-x-0.5">
                      <Highlighter className="w-3.5 h-3.5 text-amber-600" />
                      <span>Highlight:</span>
                    </span>
                    {HIGHLIGHT_PALETTE.map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => applySelectionHighlight(item.color)}
                        style={{ backgroundColor: item.color }}
                        className="w-5 h-5 rounded-full border border-slate-400 hover:scale-110 transition shadow-2xs cursor-pointer"
                        title={`Tô màu Highlight ${item.name} cho chữ bôi đen`}
                      />
                    ))}
                  </div>

                  <span className="w-px h-5 bg-slate-300" />

                  <button
                    onClick={() => {
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, isBold: !b.isBold } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className={`p-1.5 rounded-lg border ${
                      box.isBold ? 'bg-indigo-600 text-white font-black' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Bold className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, isItalic: !b.isItalic } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className={`p-1.5 rounded-lg border ${
                      box.isItalic ? 'bg-indigo-600 text-white italic' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, isUnderline: !b.isUnderline } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className={`p-1.5 rounded-lg border ${
                      box.isUnderline ? 'bg-indigo-600 text-white underline' : 'hover:bg-slate-100'
                    }`}
                  >
                    <Underline className="w-4 h-4" />
                  </button>

                  <span className="w-px h-5 bg-slate-300" />

                  <input
                    type="color"
                    value={box.color || color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPages((prev) => {
                        const copy = [...prev];
                        const cur = copy[currentPageIndex] || createEmptyPage();
                        const updated = (cur.textElements || []).map((b) =>
                          b.id === box.id ? { ...b, color: val } : b
                        );
                        copy[currentPageIndex] = { ...cur, textElements: updated };
                        return copy;
                      });
                    }}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 p-0"
                  />

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSelectedElement();
                    }}
                    className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition ml-2 flex items-center space-x-1 cursor-pointer"
                    title="Xóa ô văn bản này (hoặc nhấn phím Delete)"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                </div>
              )}

              <div
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const html = e.target.innerHTML;
                  setPages((prev) => {
                    const copy = [...prev];
                    const cur = copy[currentPageIndex] || createEmptyPage();
                    const updated = (cur.textElements || []).map((b) =>
                      b.id === box.id ? { ...b, htmlContent: html } : b
                    );
                    copy[currentPageIndex] = { ...cur, textElements: updated };
                    return copy;
                  });
                }}
                dangerouslySetInnerHTML={{ __html: box.htmlContent || box.text || 'Nhấp để gõ bài giảng...' }}
                style={{
                  color: box.color || (bgType === 'greenboard' || bgType === 'blackboard' ? '#ffffff' : '#000000'),
                  fontSize: `${box.fontSize || fontSize}px`,
                  fontFamily: box.fontFamily || fontFamily,
                  fontWeight: box.isBold ? 'bold' : 'normal',
                  fontStyle: box.isItalic ? 'italic' : 'normal',
                  textDecoration: box.isUnderline ? 'underline' : 'none',
                }}
                className="bg-transparent border-none outline-none font-sans p-0 m-0 shadow-none leading-normal w-full min-h-[50px] cursor-text select-text"
              />
            </div>
          );
        })}
      </div>

      {/* POPUP BẢNG MÀU & SHAPES HÌNH HỌC */}
      {activeWindow === 'shapes' && (
        <div className="fixed top-16 left-16 z-[100] bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-4 w-88 space-y-4 animate-scale-up font-sans text-slate-900">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-2 font-extrabold text-xs text-slate-800">
            <span>Bảng Màu & Shapes Hình Học</span>
            <button onClick={() => setActiveWindow(null)} className="hover:text-rose-600"><X className="w-4 h-4" /></button>
          </div>

          <div className="p-2.5 bg-white/80 rounded-xl border border-[#c4bb9c] space-y-1.5">
            <span className="text-[11px] font-black text-slate-700 block uppercase">✔️ ICON CHẤM BÀI ĐÚNG / SAI ❌:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              <button
                onClick={() => { setTool('stamp_check'); setActiveWindow(null); }}
                className="p-2 bg-emerald-100 hover:bg-emerald-200 border border-emerald-400 rounded-xl text-emerald-900 flex items-center space-x-1.5 justify-center shadow-2xs cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>✔️ Tick Đúng (Xanh)</span>
              </button>

              <button
                onClick={() => { setTool('stamp_cross'); setActiveWindow(null); }}
                className="p-2 bg-rose-100 hover:bg-rose-200 border border-rose-400 rounded-xl text-rose-900 flex items-center space-x-1.5 justify-center shadow-2xs cursor-pointer"
              >
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>❌ Dấu X Sai (Đỏ)</span>
              </button>
            </div>
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

          <div className="space-y-2 border-t border-[#c4bb9c] pt-2">
            <span className="text-[11px] font-bold text-slate-700 block uppercase">DANH SÁCH HÌNH HỌC SHAPES CHUẨN ẢNH 2:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <button
                onClick={() => { setTool('line'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'line' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <Minus className="w-4 h-4 text-slate-700" />
                <span>Line (Đường thẳng)</span>
              </button>

              <button
                onClick={() => { setTool('arrow'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'arrow' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <ArrowUpRight className="w-4 h-4 text-slate-700" />
                <span>Arrow (Mũi tên)</span>
              </button>

              <button
                onClick={() => { setTool('elbow_arrow'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'elbow_arrow' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <CornerUpRight className="w-4 h-4 text-slate-700" />
                <span>Elbow Arrow</span>
              </button>

              <button
                onClick={() => { setTool('block_arrow'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'block_arrow' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <ArrowRight className="w-4 h-4 text-slate-700" />
                <span>Block Arrow</span>
              </button>

              <button
                onClick={() => { setTool('shape_rect'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'shape_rect' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <Square className="w-4 h-4 text-slate-700" />
                <span>Rectangle (Chữ nhật)</span>
              </button>

              <button
                onClick={() => { setTool('shape_circle'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'shape_circle' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <Circle className="w-4 h-4 text-slate-700" />
                <span>Oval / Circle (Tròn)</span>
              </button>

              <button
                onClick={() => { setTool('shape_diamond'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'shape_diamond' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <Diamond className="w-4 h-4 text-slate-700" />
                <span>Diamond (Thoi)</span>
              </button>

              <button
                onClick={() => { setTool('shape_star'); setActiveWindow(null); }}
                className={`p-2 bg-white hover:bg-emerald-50 border rounded-xl flex items-center space-x-1.5 justify-start ${tool === 'shape_star' ? 'border-emerald-600 text-emerald-800 bg-emerald-50' : 'border-slate-300'}`}
              >
                <Star className="w-4 h-4 text-amber-500" />
                <span>Star (Ngôi sao)</span>
              </button>
            </div>
          </div>
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

      {/* POPUP HỘP CÔNG CỤ DẠY HỌC MAGIC BOX */}
      {activeWindow === 'tools' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#e4dec3] border-4 border-[#b8af91] rounded-3xl shadow-2xl p-6 w-[450px] space-y-5 animate-scale-up font-sans text-slate-900">
          <div className="flex justify-between items-center border-b border-[#c4bb9c] pb-3 font-extrabold text-base text-slate-900">
            <span className="flex items-center space-x-2 text-amber-900">
              <Sparkles className="w-6 h-6 text-amber-600 animate-bounce" />
              <span>Hộp Công Cụ Giảng Dạy Magic Box</span>
            </span>
            <button onClick={() => setActiveWindow(null)} className="p-1 hover:bg-[#c4bb9c] rounded-xl text-slate-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <button
              onClick={() => setActiveWindow('timer')}
              className="p-4 bg-white hover:bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-md flex flex-col items-center space-y-2 transition transform hover:scale-105 cursor-pointer"
            >
              <Clock className="w-8 h-8 text-amber-600" />
              <span className="text-xs font-extrabold text-slate-900">Đồng Hồ Bấm Giờ</span>
            </button>

            <button
              onClick={() => setActiveWindow('dice')}
              className="p-4 bg-white hover:bg-rose-50 rounded-2xl border-2 border-rose-300 shadow-md flex flex-col items-center space-y-2 transition transform hover:scale-105 cursor-pointer"
            >
              <Dices className="w-8 h-8 text-rose-600" />
              <span className="text-xs font-extrabold text-slate-900">Hột Xúc Xắc</span>
            </button>

            <button
              onClick={() => setActiveWindow('picker')}
              className="p-4 bg-white hover:bg-purple-50 rounded-2xl border-2 border-purple-300 shadow-md flex flex-col items-center space-y-2 transition transform hover:scale-105 cursor-pointer"
            >
              <Users className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-extrabold text-slate-900">Gọi Tên Học Sinh</span>
            </button>
          </div>
        </div>
      )}

      {/* POPUP ĐỒNG HỒ BẤM GIỜ */}
      {activeWindow === 'timer' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border-2 border-amber-500/50 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <h3 className="font-extrabold text-sm flex items-center space-x-2 text-amber-400">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>⏰ ĐỒNG HỒ ĐẾM NGƯỢC THẢO LUẬN</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center">
            <span className="text-5xl font-mono font-extrabold text-amber-400 tracking-wider">
              {Math.floor(timerRemaining / 60).toString().padStart(2, '0')}:{(timerRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center text-xs font-extrabold">
            {[1, 3, 5, 10].map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setTimerSeconds(mins * 60);
                  setTimerRemaining(mins * 60);
                  setTimerRunning(false);
                }}
                className="py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-amber-300 border border-slate-700"
              >
                {mins} Phút
              </button>
            ))}
          </div>

          <div className="flex justify-center space-x-3 pt-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md flex items-center space-x-1.5 ${
                timerRunning ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
              }`}
            >
              {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{timerRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
            </button>

            <button
              onClick={() => {
                setTimerRemaining(timerSeconds);
                setTimerRunning(false);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Đặt Lại</span>
            </button>
          </div>
        </div>
      )}

      {/* POPUP HỘT XÚC XẮC */}
      {activeWindow === 'dice' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-[#e5e5e5] text-slate-900 rounded-3xl shadow-2xl p-6 w-[440px] space-y-4 border-4 border-slate-400 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-300 pb-2">
            <h3 className="font-extrabold text-base flex items-center space-x-2 text-slate-900">
              <Dices className="w-6 h-6 text-rose-600" />
              <span>🎲 Hột Xúc Xắc Khen Thưởng</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center justify-between bg-slate-200/80 p-2.5 rounded-2xl border border-slate-300">
            <span className="text-xs font-extrabold text-slate-800">Số Lượng Hột Xúc Xắc:</span>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDecreaseDice}
                disabled={diceCount <= 1}
                className="w-8 h-8 bg-slate-500 hover:bg-slate-600 disabled:opacity-40 text-white rounded-full font-extrabold text-base flex items-center justify-center shadow-xs"
              >
                -
              </button>
              <span className="w-6 text-center font-mono font-extrabold text-base text-slate-900">{diceCount}</span>
              <button
                onClick={handleIncreaseDice}
                disabled={diceCount >= 6}
                className="w-8 h-8 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white rounded-full font-extrabold text-base flex items-center justify-center shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          <div className="p-6 bg-slate-100 rounded-3xl border-2 border-slate-300 flex flex-wrap items-center justify-center gap-4 min-h-[140px] shadow-inner">
            {diceValues.map((val, i) => (
              <div
                key={i}
                className={`w-20 h-20 bg-white border-3 border-slate-900 rounded-2xl shadow-xl flex items-center justify-center transition transform ${
                  isRollingDice ? 'animate-spin scale-110 border-rose-600' : 'hover:scale-105'
                }`}
              >
                <div className="grid grid-cols-3 gap-1.5 p-2 w-full h-full items-center justify-items-center">
                  {val === 1 && <div className="col-start-2 row-start-2 w-4 h-4 bg-rose-600 rounded-full shadow-xs" />}
                  {val === 2 && (
                    <>
                      <div className="col-start-1 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                    </>
                  )}
                  {val === 3 && (
                    <>
                      <div className="col-start-1 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-2 row-start-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                    </>
                  )}
                  {val === 4 && (
                    <>
                      <div className="col-start-1 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-1 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                    </>
                  )}
                  {val === 5 && (
                    <>
                      <div className="col-start-1 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-2 row-start-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-1 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                    </>
                  )}
                  {val === 6 && (
                    <>
                      <div className="col-start-1 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-1 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-1 row-start-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-2 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-1 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                      <div className="col-start-3 row-start-3 w-3.5 h-3.5 bg-slate-900 rounded-full" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setIsRollingDice(true);
              let count = 0;
              const interval = setInterval(() => {
                const newVals = Array.from({ length: diceCount }, () => Math.floor(Math.random() * 6) + 1);
                setDiceValues(newVals);
                playSoundEffect('tick');
                count++;
                if (count > 15) {
                  clearInterval(interval);
                  setIsRollingDice(false);
                  playSoundEffect('win');
                }
              }, 80);
            }}
            disabled={isRollingDice}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Dices className="w-5 h-5 animate-spin" />
            <span>{isRollingDice ? '🎲 ĐANG LẮC HỘT XÚC XẮC...' : '🚀 LẮC HỘT XÚC XẮC KHEN THƯỞNG'}</span>
          </button>
        </div>
      )}

      {/* POPUP VÒNG QUAY HỌC SINH */}
      {activeWindow === 'picker' && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] bg-slate-950 text-white rounded-3xl shadow-2xl p-6 w-[560px] space-y-4 border-2 border-purple-500/50 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="font-extrabold text-base flex items-center space-x-2 text-purple-400">
              <Users className="w-6 h-6 text-purple-400" />
              <span>🎲 Vòng Quay Gọi Tên Học Sinh Ngẫu Nhiên</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-extrabold text-slate-300 uppercase">
                  Dán / Nhập Danh Sách Học Sinh:
                </label>
                <label className="flex items-center space-x-1.5 text-xs font-bold text-amber-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeCalled}
                    onChange={(e) => setRemoveCalled(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                  <span>☑️ Loại bỏ HS đã được gọi</span>
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
              onClick={() => {
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
              }}
              disabled={isSpinning}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition uppercase tracking-wider flex items-center justify-center space-x-2 border border-purple-400/30 cursor-pointer"
            >
              <Dices className="w-5 h-5 animate-spin" />
              <span>{isSpinning ? '🎲 Đang Quay Gọi Tên...' : '🚀 QUAY GỌI TÊN HỌC SINH'}</span>
            </button>
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
              <button onClick={() => setActiveWindow(null)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl">
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
                        const parsedPages = JSON.parse(lesson.content);
                        if (Array.isArray(parsedPages) && parsedPages.length > 0) {
                          setPages(parsedPages);
                          setCurrentPageIndex(0);
                          setTimeout(() => {
                            const canvas = canvasRef.current;
                            if (canvas && parsedPages[0]?.canvasData) {
                              const ctx = canvas.getContext('2d');
                              const img = new Image();
                              img.src = parsedPages[0].canvasData;
                              img.onload = () => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);
                              };
                            }
                          }, 100);
                          alert(`🚀 ĐÃ MỞ THÀNH CÔNG BÀI GIẢNG: "${lesson.title.replace(/[WHITEBOARD:.*?]/, '').trim()}"`);
                          setActiveWindow(null);
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

      {/* DUY NHẤT 1 THANH TOOLBAR NẰM DƯỚI CÙNG SÁT MEP (BOTTOM-3) */}
      <div className={getToolbarStyle()}>
        <button
          onClick={toggleToolbarPosition}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-md font-bold cursor-pointer"
          title="Xoay chuyển vị trí thanh công cụ (Dưới -> Trái -> Trên -> Phải)"
        >
          <Move className="w-4 h-4 animate-pulse" />
        </button>

        <button
          onClick={() => {
            setTool('pointer');
            setSelectedTextId(null);
            setSelectedObjId(null);
          }}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'pointer'
              ? 'bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Con trỏ dừng vẽ / Chọn & di chuyển bất kỳ vật thể nào"
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
          title="Bàn tay kéo trượt toàn bộ nội dung sang Trái / Phải để mở rộng không gian gõ tiếp"
        >
          <Hand className="w-4 h-4" />
        </button>

        <button
          onClick={() => setTool('text')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'text'
              ? 'bg-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Tạo ô văn bản trắng tại điểm nhấp chuột"
        >
          <Type className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveWindow(activeWindow === 'stickies' ? null : 'stickies')}
          className={`p-2 rounded-xl transition cursor-pointer ${
            tool === 'sticky' || activeWindow === 'stickies'
              ? 'bg-amber-400 text-slate-950 shadow-md ring-2 ring-amber-300 scale-105'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Sticky Note ghi chú nổi bật 3D"
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
          title="Bút vẽ tự do"
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
          title="Cục tẩy"
        >
          <Eraser className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
          className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800 cursor-pointer"
          title="Bảng màu & Shapes hình học đầy đủ"
        >
          <Square className="w-4 h-4 text-purple-700" />
        </button>

        <button
          onClick={() => setActiveWindow(activeWindow === 'tools' ? null : 'tools')}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition cursor-pointer"
          title="Hộp công cụ Magic Box"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={handleUndo}
          disabled={historyIndex <= 0}
          className="p-2 hover:bg-[#c4bb9c] disabled:opacity-30 rounded-xl transition text-slate-800 cursor-pointer"
          title="Hoàn tác (Undo)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIndex >= historyStack.length - 1}
          className="p-2 hover:bg-[#c4bb9c] disabled:opacity-30 rounded-xl transition text-slate-800 cursor-pointer"
          title="Phục hồi (Redo)"
        >
          <Redo className="w-4 h-4" />
        </button>

        <button
          onClick={handleDeleteSelectedElement}
          className="p-2 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-rose-600 cursor-pointer font-bold"
          title="Xóa vật thể đang được chọn (Shapes, Text, Sticky, Ảnh dán) hoặc phím Delete"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
        </button>
      </div>

      {/* THANH ĐIỀU HƯỚNG TRANG SLIDE */}
      <div className="fixed bottom-3 left-3 z-[60] bg-[#d8d2b8] p-1.5 rounded-2xl shadow-xl border border-[#b8af91] flex items-center space-x-1 font-sans">
        <button
          type="button"
          onClick={() => {
            if (currentPageIndex > 0) {
              const newIdx = currentPageIndex - 1;
              setCurrentPageIndex(newIdx);
              const canvas = canvasRef.current;
              if (canvas && pages[newIdx]?.canvasData) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = pages[newIdx].canvasData;
                img.onload = () => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                };
              }
            }
          }}
          className="p-1.5 hover:bg-[#c4bb9c] rounded-lg transition text-slate-800 cursor-pointer"
          title="Trang trước (←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 bg-white rounded font-extrabold text-[11px] text-slate-800 border">
          {currentPageIndex + 1}/{pages.length}
        </span>

        <button
          type="button"
          onClick={() => {
            const newIdx = currentPageIndex + 1;
            if (newIdx >= pages.length) {
              const newEmpty = createEmptyPage();
              setPages([...pages, newEmpty]);
              setCurrentPageIndex(newIdx);
            } else {
              setCurrentPageIndex(newIdx);
              const canvas = canvasRef.current;
              if (canvas && pages[newIdx]?.canvasData) {
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.src = pages[newIdx].canvasData;
                img.onload = () => {
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                };
              }
            }
          }}
          className="p-1.5 hover:bg-[#c4bb9c] rounded-lg transition text-slate-800 cursor-pointer"
          title="Trang sau (→)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            const newEmpty = createEmptyPage();
            const newIndex = pages.length;
            setPages([...pages, newEmpty]);
            setCurrentPageIndex(newIndex);
          }}
          className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-xs transition cursor-pointer"
          title="Thêm trang bảng mới"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
