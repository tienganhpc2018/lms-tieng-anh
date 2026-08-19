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
  Layers, Lock, Unlock, Copy, ArrowUp, ArrowDown, BookOpen, Edit3, Hand, Minus, MousePointer, Pause, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function WhiteboardView() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activityId = searchParams.get('activityId');
  const canvasRef = useRef(null);

  // BẢO VỆ PHÂN QUYỀN HỌC SINH
  useEffect(() => {
    if (user && !isTeacher) {
      alert('⚠️ Tính năng Bảng Tương Tác Giảng Dạy chỉ dành riêng cho Giáo viên!');
      navigate('/dashboard');
    }
  }, [user, isTeacher, navigate]);

  // CẤU TRÚC TRANG BẢNG CHUẨN (NHƯ QUYỂN VỞ TRẮNG)
  const createEmptyPage = () => ({
    canvasData: '',
    textElements: [],
    objectElements: [],
  });

  const [pages, setPages] = useState([createEmptyPage()]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Công cụ active: 'pointer' (Con trỏ dừng hoạt động - Ảnh 3) | 'hand' (Kéo rê) | 'text' | 'pen' | 'highlighter' | 'eraser' | 'shape_rect' | 'shape_circle' | 'line' | 'underline_box'
  const [tool, setTool] = useState('pointer');
  const [color, setColor] = useState('#dc2626');
  const [fontSize, setFontSize] = useState(32);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);

  // Quản lý Text Objects & Selected State
  const [selectedTextId, setSelectedTextId] = useState(null);

  // Quản lý Ảnh chụp từ Snipping Tool & Thu Phóng Kích Thước (Resize Handles - Ảnh 2)
  const [selectedObjId, setSelectedObjId] = useState(null);
  const [draggingObjId, setDraggingObjId] = useState(null);
  const [resizingObjId, setResizingObjId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Pan Canvas
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // Trạng thái vẽ Canvas & PREVIEW NÉT VẼ
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentMousePos, setCurrentMousePos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Background Nền Bảng
  const [bgType, setBgType] = useState('greenboard');

  // Popups: null | 'save' | 'load' | 'picker' | 'timer' | 'shapes' | 'tools' | 'dice'
  const [activeWindow, setActiveWindow] = useState(null);

  // VÒNG QUAY HỌC SINH
  const [rawStudentInput, setRawStudentInput] = useState(
    "Nguyễn Minh Hoàng\nĐinh Thành Nhơn\nĐoàn Ngọc Khánh Dương\nHà Nguyễn Minh Thư\nĐinh Trần Thảo Ngân\nTrần Quốc Bảo\nLê Thị Mai Anh"
  );
  const [calledStudents, setCalledStudents] = useState([]);
  const [removeCalled, setRemoveCalled] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);

  // YÊU CẦU 5: HỘT XÚC XẮC KHEN THƯỞNG HỌC SINH (ẢNH 3)
  const [diceCount, setDiceCount] = useState(1); // 1 đến 5 hột xúc xắc
  const [diceValues, setDiceValues] = useState([4]);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // YÊU CẦU 4: ĐỒNG HỒ ĐẾM NGƯỢC
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerRemaining, setTimerRemaining] = useState(300);
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

  // LOGIC ĐỒNG HỒ ĐẾM NGƯỢC (TIMER)
  useEffect(() => {
    let timerInterval = null;
    if (timerRunning && timerRemaining > 0) {
      timerInterval = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            playSoundEffect('win');
            alert('⏰ ĐÃ HẾT GIỜ BÀI LÀM / THỜI GIAN THẢO LUẬN!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [timerRunning, timerRemaining]);

  // NẠP TỰ ĐỘNG BÀI DẠY TỪ KHÓA HỌC
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

  // KHỞI TẠO VÀ LẮNG NGHE SỰ KIỆN PASTE TỪ SNIPPING TOOL (CTRL + V DÁN BÀI TẬP VÀO)
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
              width: 650,
              height: 450,
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
            setTool('pointer');
          };
          reader.readAsDataURL(blob);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [panOffset, currentPageIndex]);

  // SOUND EFFECTS
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
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {}
  };

  // YÊU CẦU 5: LẮC HỘT XÚC XẮC KHEN THƯỞNG HỌC SINH (ẢNH 3)
  const rollDice = () => {
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
  };

  // VÒNG QUAY HỌC SINH
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

  // CHUYỂN TRANG SLIDE
  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      saveCurrentPageCanvas();
      const newIndex = currentPageIndex - 1;
      setCurrentPageIndex(newIndex);
      setSelectedTextId(null);
      setSelectedObjId(null);
      renderPageCanvas(pages[newIndex]);
    }
  };

  const handleNextPage = () => {
    saveCurrentPageCanvas();
    const newIndex = currentPageIndex + 1;
    setSelectedTextId(null);
    setSelectedObjId(null);
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
    saveCurrentPageCanvas();
    setSelectedTextId(null);
    setSelectedObjId(null);
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

  // YÊU CẦU 1: TẠO Ô VĂN BẢN MỚI TẠI ĐÚNG VỊ TRÍ TRỎ CHUỘT NHẤP TRÊN BẢNG (ẢNH 1)
  const handleCanvasClickToCreateText = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - panOffset.x;
    const y = e.clientY - rect.top - panOffset.y;

    const newId = 'text_' + Date.now();
    const newBox = {
      id: newId,
      x,
      y,
      text: '', // Trắng tinh rỗng
      color: color,
      fontSize: fontSize,
      isBold: isBold,
      isItalic: isItalic,
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
    setTool('pointer');
  };

  // YÊU CẦU 3: BỎ GIỚI HẠN KÍCH THƯỚC VÀ CHO PHÉP NHẤP CHỌN LẠI ẢNH CHỤP Ở BẤT KỲ ĐẦU
  const handleResizeImage = (id, deltaWidth, deltaHeight, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const updated = (cur.objectElements || []).map((o) => {
        if (o.id === id) {
          const newW = Math.min(2200, Math.max(150, (o.width || 650) + deltaWidth));
          const newH = Math.min(1800, Math.max(100, (o.height || 450) + deltaHeight));
          return { ...o, width: newW, height: newH };
        }
        return o;
      });
      copy[currentPageIndex] = { ...cur, objectElements: updated };
      return copy;
    });
  };

  const handleSendBackward = (id, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const updated = (cur.objectElements || []).map((o) =>
        o.id === id ? { ...o, zIndex: 0 } : o
      );
      copy[currentPageIndex] = { ...cur, objectElements: updated };
      return copy;
    });
  };

  const handleBringForward = (id, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const updated = (cur.objectElements || []).map((o) =>
        o.id === id ? { ...o, zIndex: 5 } : o
      );
      copy[currentPageIndex] = { ...cur, objectElements: updated };
      return copy;
    });
  };

  // KÉO RÊ VẬT THỂ BẰNG BÀN TAY HOẶC NÚT SELECT
  const handleStartDragElement = (id, isImage, e) => {
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

  const handleMouseMoveGlobal = (e) => {
    if (draggingObjId && (tool === 'hand' || tool === 'pointer')) {
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
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      setCurrentMousePos({ x, y });
      draw(e);
    }
  };

  const handleMouseUpGlobal = (e) => {
    if (draggingObjId) {
      setDraggingObjId(null);
    } else if (isDrawing) {
      stopDrawing(e);
    }
  };

  // XÓA ĐỐI TƯỢNG VĂN BẢN VÀ ẢNH
  const handleDeleteTextObj = (id, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const filtered = (cur.textElements || []).filter((b) => b.id !== id);
      copy[currentPageIndex] = { ...cur, textElements: filtered };
      return copy;
    });
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleDeleteImageObj = (id, e) => {
    e.stopPropagation();
    setPages((prev) => {
      const copy = [...prev];
      const cur = copy[currentPageIndex] || createEmptyPage();
      const filtered = (cur.objectElements || []).filter((o) => o.id !== id);
      copy[currentPageIndex] = { ...cur, objectElements: filtered };
      return copy;
    });
    if (selectedObjId === id) setSelectedObjId(null);
  };

  // CANVAS DRAWING LOGIC
  const startDrawing = (e) => {
    if (tool === 'pointer' || tool === 'hand') return;
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
    if (!isDrawing || tool === 'pointer' || tool === 'hand') return;
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

    if ((tool === 'shape_rect' || tool === 'underline_box') && e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left - panOffset.x;
      const y = e.clientY - rect.top - panOffset.y;
      ctx.strokeStyle = color === '#000000' ? '#ff2a6d' : color;
      ctx.lineWidth = tool === 'underline_box' ? 2 : 3;
      ctx.strokeRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    } else if (tool === 'line' && e) {
      const rect = canvas.getBoundingClientRect();
      let x = e.clientX - rect.left - panOffset.x;
      let y = e.clientY - rect.top - panOffset.y;

      if (e.shiftKey) {
        y = startPos.y;
      }

      ctx.strokeStyle = color === '#000000' ? '#ff2a6d' : color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
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

  // LƯU BÀI DẠY VÀO HỆ THỐNG / KHÓA HỌC
  const handleSaveLesson = async () => {
    setSavingLesson(true);
    saveCurrentPageCanvas();
    try {
      if (activityId) {
        await supabase
          .from('activities')
          .update({
            content: JSON.stringify(pages),
          })
          .eq('id', activityId);

        alert(`🎉 ĐÃ LƯU THÀNH CÔNG BÀI GIẢNG WHITEBOARD VÀO MỤC KHÓA HỌC!`);
      } else {
        await supabase.from('activities').insert([
          {
            title: `[WHITEBOARD: ${selectedUnit}] ${lessonTitle.trim()}`,
            type: 'resource',
            content: JSON.stringify(pages),
          },
        ]);

        alert(`🎉 ĐÃ LƯU BÀI DẠY THEO UNiT VÀO HỆ THỐNG THÀNH CÔNG!\n\n• Unit: ${selectedUnit}\n• Tên bài: ${lessonTitle}`);
      }
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
    setSelectedTextId(null);
    setSelectedObjId(null);
    setPages((prev) => {
      const copy = [...prev];
      copy[currentPageIndex] = createEmptyPage();
      return copy;
    });
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
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-[#c4bb9c] rounded-lg transition flex items-center space-x-1">
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
            onClick={handleSaveLesson}
            disabled={savingLesson}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl shadow-xs transition flex items-center space-x-1 border border-emerald-600/40"
          >
            <Save className="w-4 h-4" />
            <span>{savingLesson ? 'Đang Lưu...' : '💾 Lưu Bài Dạy'}</span>
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

      {/* KHU VỰC VẼ CANVAS VÀ LỚP VẬT THỂ */}
      <div
        onClick={() => {
          if (tool === 'pointer') {
            setSelectedTextId(null);
            setSelectedObjId(null);
          }
        }}
        style={{ transform: `translate(${panOffset.x}px, ${panOffset.y}px)` }}
        className="relative w-full h-full"
      >
        {/* YÊU CẦU 3: LỚP ẢNH CHỤP SNIPPING TOOL (CHO PHÉP NHẤP CHỌN LẠI VÀ PHÓNG TO TOÀN MÀN HÌNH - ẢNH 2) */}
        {(currentPage.objectElements || []).map((obj) => {
          const isSelected = selectedObjId === obj.id;
          const imgWidth = obj.width || 650;
          const imgHeight = obj.height || 450;
          const zIdx = obj.zIndex !== undefined ? obj.zIndex : 1;

          return (
            <div
              key={obj.id}
              style={{ left: obj.x, top: obj.y, width: imgWidth, height: imgHeight, zIndex: zIdx }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedObjId(obj.id);
                setSelectedTextId(null);
              }}
              onMouseDown={(e) => handleStartDragElement(obj.id, true, e)}
              className={`absolute transition duration-75 cursor-pointer ${
                isSelected
                  ? 'ring-4 ring-emerald-500 rounded-2xl p-1 bg-white/40 shadow-2xl'
                  : 'p-1 border border-transparent hover:border-emerald-400'
              }`}
            >
              {isSelected && (
                <>
                  <div className="absolute -top-11 right-0 bg-white border border-slate-300 rounded-xl p-1 shadow-xl flex items-center space-x-1.5 z-50 text-xs font-bold animate-fade-in">
                    <button
                      onClick={(e) => handleBringForward(obj.id, e)}
                      className="px-2 py-0.5 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded text-[10px] flex items-center space-x-0.5"
                    >
                      <ArrowUp className="w-3 h-3" />
                      <span>Lên Trên</span>
                    </button>

                    <button
                      onClick={(e) => handleSendBackward(obj.id, e)}
                      className="px-2 py-0.5 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded text-[10px] flex items-center space-x-0.5"
                    >
                      <ArrowDown className="w-3 h-3" />
                      <span>Xuống Dưới</span>
                    </button>

                    <button
                      onClick={(e) => handleResizeImage(obj.id, 150, 100, e)}
                      className="px-2 py-0.5 bg-sky-100 text-sky-800 hover:bg-sky-200 rounded text-[10px] font-extrabold"
                    >
                      ➕ Phóng To Cực Đại
                    </button>

                    <button
                      onClick={(e) => handleDeleteImageObj(obj.id, e)}
                      className="p-1 hover:bg-rose-100 rounded text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* NÚT KÉO CO GIÃN 4 GÓC ẢNH KHÔNG GIỚI HẠN */}
                  <div
                    onMouseDown={(e) => handleResizeImage(obj.id, 100, 80, e)}
                    className="absolute -bottom-3 -right-3 w-6 h-6 bg-emerald-600 border-2 border-white rounded-full cursor-se-resize shadow-lg z-50 hover:scale-125 transition"
                  />
                </>
              )}

              {obj.type === 'image' && (
                <img src={obj.src} alt="Snipped task" className="w-full h-full object-contain rounded-xl shadow-md pointer-events-none" />
              )}
            </div>
          );
        })}

        {/* LỚP 2: CANVAS VẼ NÉT BÚT VÀ GẠCH CHÂN */}
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => {
            if (tool === 'text') {
              handleCanvasClickToCreateText(e);
            } else {
              startDrawing(e);
            }
          }}
          className={`w-full h-[calc(100vh-110px)] block relative z-10 ${
            tool === 'pointer' ? 'cursor-default' : tool === 'hand' ? 'cursor-grab' : 'cursor-crosshair'
          }`}
        />

        {/* PREVIEW KHUNG KHOANH TRÒN / GẠCH CHÂN / ĐƯỜNG THẲNG */}
        {isDrawing && tool !== 'pointer' && tool !== 'hand' && (tool === 'shape_rect' || tool === 'underline_box' || tool === 'line') && (
          <div
            style={{
              left: Math.min(startPos.x, currentMousePos.x),
              top: tool === 'line' ? startPos.y - 2 : Math.min(startPos.y, currentMousePos.y),
              width: Math.max(10, Math.abs(currentMousePos.x - startPos.x)),
              height: tool === 'line' ? 4 : Math.max(8, Math.abs(currentMousePos.y - startPos.y)),
            }}
            className={`absolute border-2 border-rose-500 rounded-md pointer-events-none z-30 ${
              tool === 'line' ? 'bg-rose-500 h-1 border-none' : 'border-dashed bg-rose-500/10'
            }`}
          />
        )}

        {/* YÊU CẦU 2: CÁC Ô VĂN BẢN VỚI SOẠN THẢO NHIỀU DÒNG MULTILINE ENTER XUỐNG DÒNG RỘNG RÃI KHÔNG MẤT NỘI DUNG (ẢNH 1) */}
        {(currentPage.textElements || []).map((box) => {
          const isSelected = selectedTextId === box.id;
          const lineCount = Math.max(1, (box.text || '').split('\n').length);

          return (
            <div
              key={box.id}
              style={{ left: box.x, top: box.y }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedTextId(box.id);
                setSelectedObjId(null);
              }}
              onMouseDown={(e) => handleStartDragElement(box.id, false, e)}
              className="absolute z-30 group cursor-move p-1 rounded-xl transition"
            >
              {/* THANH THUỘC TÍNH RÊ, SỬA, XÓA */}
              {isSelected && (
                <div className="absolute -top-11 left-0 bg-white border border-slate-300 rounded-xl p-1 shadow-2xl flex items-center space-x-1.5 z-50 text-xs font-bold animate-fade-in">
                  <div
                    className="px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded flex items-center space-x-1 cursor-grab"
                    title="Giữ nút này để rê di chuyển"
                  >
                    <Hand className="w-3 h-3" />
                    <span>Rê Di Chuyển</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newText = prompt('Sửa lại nội dung văn bản:', box.text);
                      if (newText !== null) {
                        setPages((prev) => {
                          const copy = [...prev];
                          const cur = copy[currentPageIndex] || createEmptyPage();
                          const updated = (cur.textElements || []).map((b) =>
                            b.id === box.id ? { ...b, text: newText } : b
                          );
                          copy[currentPageIndex] = { ...cur, textElements: updated };
                          return copy;
                        });
                      }
                    }}
                    className="p-1 hover:bg-slate-100 rounded text-sky-700 flex items-center space-x-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Sửa</span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteTextObj(box.id, e)}
                    className="p-1 hover:bg-rose-100 rounded text-rose-600 flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Xóa</span>
                  </button>
                </div>
              )}

              {/* HỘP SOẠN THẢO MULTILINE ENTER XUỐNG DÒNG TỰ ĐỘNG NỚI RỘNG CHIỀU CAO KHÔNG MẤT NỘI DUNG (ẢNH 1) */}
              <textarea
                rows={lineCount}
                placeholder="Nhấp để gõ bài giảng..."
                value={box.text}
                onChange={(e) => {
                  const val = e.target.value;
                  setPages((prev) => {
                    const copy = [...prev];
                    const cur = copy[currentPageIndex] || createEmptyPage();
                    const updated = (cur.textElements || []).map((b) =>
                      b.id === box.id ? { ...b, text: val } : b
                    );
                    copy[currentPageIndex] = { ...cur, textElements: updated };
                    return copy;
                  });
                }}
                style={{
                  color: box.color || color,
                  fontSize: `${box.fontSize || fontSize}px`,
                  fontWeight: box.isBold ? 'bold' : 'normal',
                  fontStyle: box.isItalic ? 'italic' : 'normal',
                }}
                className="bg-transparent border-none outline-none resize min-w-[650px] font-sans p-0 m-0 shadow-none text-slate-900 leading-normal"
              />
            </div>
          );
        })}
      </div>

      {/* POPUP BẢNG MÀU & SHAPES KHOANH TRÒN NGUYÊN BẢN */}
      {activeWindow === 'shapes' && (
        <div className="absolute top-16 left-20 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-4 w-80 space-y-4 animate-scale-up">
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
            <span className="text-[11px] font-bold text-slate-700 block uppercase">KHOANH VÙNG CÔNG THỨC & GẠCH CHÂN CÂU VĂN:</span>
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold">
              <button
                onClick={() => { setTool('line'); setActiveWindow(null); }}
                className="p-2.5 bg-white hover:bg-emerald-50 border border-emerald-400 rounded-xl text-emerald-900 flex items-center space-x-1.5 justify-center shadow-2xs"
              >
                <Minus className="w-4 h-4 text-emerald-600" />
                <span>📏 Đường Thẳng (Shift)</span>
              </button>
              <button
                onClick={() => { setTool('underline_box'); setActiveWindow(null); }}
                className="p-2.5 bg-white hover:bg-rose-50 border border-rose-400 rounded-xl text-rose-800 flex items-center space-x-1.5 justify-center shadow-2xs"
              >
                <Square className="w-4 h-4 text-rose-600" />
                <span>▭ Khung Gạch Chân</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP HỘP CÔNG CỤ DẠY HỌC ĐA NĂNG MAGIC BOX */}
      {activeWindow === 'tools' && (
        <div className="absolute top-16 left-20 z-50 bg-[#e4dec3] border-2 border-[#b8af91] rounded-2xl shadow-2xl p-5 w-[420px] space-y-4 animate-scale-up">
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
              <span className="text-[11px] font-extrabold text-slate-800">Đồng Hồ Bấm Giờ</span>
            </button>

            <button
              onClick={() => setActiveWindow('dice')}
              className="p-3 bg-white hover:bg-rose-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Dices className="w-6 h-6 text-rose-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Hột Xúc Xắc (Ảnh 3)</span>
            </button>

            <button
              onClick={() => setActiveWindow('picker')}
              className="p-3 bg-white hover:bg-purple-50 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center space-y-1 transition"
            >
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-[11px] font-extrabold text-slate-800">Gọi Tên HS</span>
            </button>
          </div>
        </div>
      )}

      {/* YÊU CẦU 4: POPUP ĐỒNG HỒ BẤM GIỜ ĐẾM NGƯỢC */}
      {activeWindow === 'timer' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white rounded-3xl shadow-2xl p-6 w-96 space-y-4 border border-amber-500/40 animate-scale-up font-sans">
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

      {/* YÊU CẦU 5: POPUP HỘT XÚC XẮC KHEN THƯỞNG HỌC SINH (ẢNH 3 - CÓ NÚT + / - VÀ QUAY SỐ THỨ TỰ HỌC SINH) */}
      {activeWindow === 'dice' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-[#e5e5e5] text-slate-900 rounded-3xl shadow-2xl p-6 w-[420px] space-y-4 border-2 border-slate-400 animate-scale-up font-sans">
          <div className="flex justify-between items-center border-b border-slate-300 pb-2">
            <h3 className="font-extrabold text-base flex items-center space-x-2 text-slate-900">
              <Dices className="w-6 h-6 text-rose-600" />
              <span>🎲 Hột Xúc Xắc Khen Thưởng (Ảnh 3)</span>
            </h3>
            <button onClick={() => setActiveWindow(null)} className="text-slate-500 hover:text-slate-900"><X className="w-5 h-5" /></button>
          </div>

          {/* CÁC NÚT TĂNG GIẢM HỘT XÚC XẮC NHƯ ẢNH 3 */}
          <div className="flex items-center justify-between bg-slate-200/80 p-2.5 rounded-2xl border border-slate-300">
            <span className="text-xs font-extrabold text-slate-800">Số Lượng Hột Xúc Xắc:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                className="w-8 h-8 bg-slate-400 hover:bg-slate-500 text-white rounded-full font-extrabold text-base flex items-center justify-center shadow-xs"
              >
                -
              </button>
              <span className="w-8 text-center font-mono font-extrabold text-base text-slate-900">{diceCount}</span>
              <button
                onClick={() => setDiceCount(Math.min(6, diceCount + 1))}
                className="w-8 h-8 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-extrabold text-base flex items-center justify-center shadow-xs"
              >
                +
              </button>
            </div>
          </div>

          {/* HIỂN THỊ CÁC HỘT XÚC XẮC XOAY ĐIỂM CHUẨN 100% ẢNH 3 */}
          <div className="p-6 bg-slate-100 rounded-3xl border-2 border-slate-300 flex flex-wrap items-center justify-center gap-4 min-h-[140px] shadow-inner">
            {diceValues.map((val, i) => (
              <div
                key={i}
                className={`w-20 h-20 bg-white border-3 border-slate-900 rounded-2xl shadow-xl flex items-center justify-center transition transform ${
                  isRollingDice ? 'animate-spin scale-110 border-rose-600' : 'hover:scale-105'
                }`}
              >
                {/* VẼ CÁC NÚT ĐIỂM CHUẨN XÚC XẮC (1 - 6 NÚT) */}
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
            onClick={rollDice}
            disabled={isRollingDice}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-extrabold text-sm rounded-2xl shadow-xl transition uppercase tracking-wider flex items-center justify-center space-x-2"
          >
            <Dices className="w-5 h-5 animate-spin" />
            <span>{isRollingDice ? '🎲 ĐANG LẮC HỘT XÚC XẮC...' : '🚀 LẮC HỘT XÚC XẮC KHEN THƯỞNG'}</span>
          </button>
        </div>
      )}

      {/* POPUP VÒNG QUAY GỌI TÊN HỌC SINH */}
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

      {/* THANH TOOLBAR DỌC NẰM PHÍA TRONG CÙNG BÊN TRÁI (FIXED TOP-16 LEFT-3 - GIAO DIỆN NHỎ GỌN TINH TẾ) */}
      <div className="fixed top-16 left-3 z-50 bg-[#d8d2b8] p-1.5 rounded-2xl shadow-2xl border-2 border-[#b8af91] flex flex-col items-center space-y-1.5">
        {/* NÚT CON TRỎ MŨI TÊN (SELECT TOOL - ẢNH 3: DỪNG TẤT CẢ HOẠT ĐỘNG VẼ/GÕ) */}
        <button
          onClick={() => {
            setTool('pointer');
            setSelectedTextId(null);
            setSelectedObjId(null);
          }}
          className={`p-2 rounded-xl transition ${
            tool === 'pointer'
              ? 'bg-sky-600 text-white shadow-md font-bold ring-2 ring-sky-300'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Con trỏ chuột dừng tất cả hoạt động vẽ/gõ (Select Tool)"
        >
          <MousePointer className="w-4 h-4" />
        </button>

        {/* NÚT BÀN TAY KÉO RÊ DI CHUYỂN BẤT KỲ VẬT THỂ NÀO */}
        <button
          onClick={() => setTool('hand')}
          className={`p-2 rounded-xl transition ${
            tool === 'hand'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold ring-2 ring-amber-300'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bàn tay nhấp chọn và kéo rê di chuyển vật thể / ảnh / text"
        >
          <Hand className="w-4 h-4" />
        </button>

        {/* Gõ Văn Bản Trực Tiếp Tại Đúng Điểm Trỏ Chuột */}
        <button
          onClick={() => setTool('text')}
          className={`p-2 rounded-xl transition ${
            tool === 'text'
              ? 'bg-indigo-600 text-white shadow-md font-bold ring-2 ring-indigo-300'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Tạo ô văn bản trắng tinh tại điểm nhấp chuột (Text Tool)"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* Bút Vẽ */}
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-xl transition ${
            tool === 'pen'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bút vẽ tự do"
        >
          <Pencil className="w-4 h-4" />
        </button>

        {/* Bút Dạ Quang Highlighter */}
        <button
          onClick={() => setTool('highlighter')}
          className={`p-2 rounded-xl transition ${
            tool === 'highlighter'
              ? 'bg-amber-400 text-slate-950 shadow-md'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Bút dạ quang làm nổi bật câu chữ"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {/* Cục Tẩy */}
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-xl transition ${
            tool === 'eraser'
              ? 'bg-rose-600 text-white shadow-md'
              : 'hover:bg-[#c4bb9c] text-slate-800'
          }`}
          title="Cục tẩy"
        >
          <Eraser className="w-4 h-4" />
        </button>

        {/* Bảng Màu & Shapes Khoanh Vùng / Đường Thẳng Gạch Chân */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'shapes' ? null : 'shapes')}
          className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800"
          title="Bảng màu & Đường thẳng kẻ gạch chân / Khoanh tròn"
        >
          <Square className="w-4 h-4 text-purple-700" />
        </button>

        {/* Magic Box */}
        <button
          onClick={() => setActiveWindow(activeWindow === 'tools' ? null : 'tools')}
          className="p-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-md transition"
          title="Hộp công cụ Magic Box"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Undo / Redo */}
        <button onClick={handleUndo} className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Hoàn tác">
          <Undo className="w-4 h-4" />
        </button>
        <button onClick={handleRedo} className="p-2 hover:bg-[#c4bb9c] rounded-xl transition text-slate-800" title="Phục hồi">
          <Redo className="w-4 h-4" />
        </button>

        {/* Xóa Sạch Trang Hiện Tại */}
        <button onClick={clearCurrentPage} className="p-2 hover:bg-rose-100 hover:text-rose-700 rounded-xl transition text-slate-600" title="Xóa sạch trang hiện tại">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* THANH ĐIỀU HƯỚNG TRANG SLIDE */}
      <div className="fixed bottom-3 left-3 z-50 bg-[#d8d2b8] p-1.5 rounded-2xl shadow-xl border border-[#b8af91] flex items-center space-x-1">
        <button
          type="button"
          onClick={handlePrevPage}
          className="p-1.5 hover:bg-[#c4bb9c] rounded-lg transition text-slate-800"
          title="Trang trước (←)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="px-2 py-0.5 bg-white rounded font-extrabold text-[11px] text-slate-800 border">
          {currentPageIndex + 1}/{pages.length}
        </span>

        <button
          type="button"
          onClick={handleNextPage}
          className="p-1.5 hover:bg-[#c4bb9c] rounded-lg transition text-slate-800"
          title="Trang sau (→)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleAddNewPage}
          className="p-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg shadow-xs transition"
          title="Add a new page"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
