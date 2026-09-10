import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Maximize2,
  Minimize2,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  Plus,
  Play,
  FileText
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import InteractiveBookToolbar from '../components/lms/InteractiveBookToolbar';
import InteractiveTaskRenderer from '../components/lms/InteractiveTaskRenderer';
import { LESSON_TEMPLATES, DEFAULT_BOOK_DATA } from '../data/defaultLessonBookData';

export default function InteractiveLessonBookView() {
  const { courseId, sectionId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile, isTeacher } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(sectionId || null);
  const [loading, setLoading] = useState(true);

  // Cấu trúc Sách Mềm: View Level (1 = Lesson List, 2 = Task List, 3 = Task Interactive)
  const [viewLevel, setViewLevel] = useState(3);
  const [selectedLessonKey, setSelectedLessonKey] = useState('getting_started');
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);

  // Thanh công cụ Annotation & Toolbar
  const [activeTool, setActiveTool] = useState('select'); // 'select' | 'pen' | 'highlighter' | 'eraser'
  const [penColor, setPenColor] = useState('#ef4444');
  const [penSize, setPenSize] = useState(3);
  const [highlighterColor, setHighlighterColor] = useState('rgba(253, 224, 71, 0.45)');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioRate, setAudioRate] = useState(0.9);

  // Canvas Refs cho bảng vẽ Annotation Overlay
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Nạp dữ liệu Khóa học & Sections từ Supabase
  useEffect(() => {
    let isMounted = true;
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        const { data: cData } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .maybeSingle();

        const { data: sData } = await supabase
          .from('course_sections')
          .select('*')
          .eq('course_id', courseId)
          .order('order_index', { ascending: true });

        if (isMounted) {
          setCourse(cData);
          if (sData && sData.length > 0) {
            setSections(sData);
            if (!activeSectionId || !sData.some((s) => s.id === activeSectionId)) {
              setActiveSectionId(sData[0].id);
            }
          }
        }
      } catch (err) {
        console.error('Lỗi nạp khóa học:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCourseData();
    return () => {
      isMounted = false;
    };
  }, [courseId]);

  // Xác định Grade từ tiêu đề khóa học (Lớp 7 / Lớp 9)
  const courseTitle = (course?.title || '').toLowerCase();
  const isGrade7 = courseTitle.includes('7') || courseTitle.includes('bảy');
  const gradeKey = isGrade7 ? 'grade_7' : 'grade_9';

  // Lấy dữ liệu Unit & Lesson tương ứng
  const currentUnitData = DEFAULT_BOOK_DATA[gradeKey]?.unit_1 || DEFAULT_BOOK_DATA.grade_9.unit_1;
  const currentLessonData =
    currentUnitData?.lessons?.[selectedLessonKey] || currentUnitData?.lessons?.getting_started;
  const currentTasks = currentLessonData?.tasks || [];
  const activeTask = currentTasks[currentTaskIndex] || currentTasks[0];

  // Active Section Info
  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0] || {
    title: 'Unit 1: Local community',
    order_index: 0
  };

  // Canvas Drawing Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [viewLevel, activeTask?.id]);

  const handleStartDraw = (e) => {
    if (activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;

    isDrawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 24;
    } else if (activeTool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = highlighterColor;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = penSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  };

  const handleDrawMove = (e) => {
    if (!isDrawingRef.current || activeTool === 'select') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY || (e.touches && e.touches[0]?.clientY)) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleStopDraw = () => {
    isDrawingRef.current = false;
  };

  const handleClearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Đang mở Sách Mềm Tương Tác..." />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* 1. THANH HEADER ĐIỀU HƯỚNG CHUẨN SÁCH MỀM (CHUẨN ẢNH 2, 3, 4) */}
      <header className="bg-amber-800 text-white px-3 sm:px-6 py-2.5 shadow-md flex items-center justify-between border-b border-amber-900 z-30 flex-wrap gap-2">
        {/* NÚT BACK & TÊN UNIT */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            type="button"
            onClick={() => {
              if (viewLevel === 3) {
                setViewLevel(2); // Về danh sách Tasks
              } else if (viewLevel === 2) {
                setViewLevel(1); // Về danh sách Lessons
              } else {
                navigate(`/course/${courseId}`); // Quay lại trang Course
              }
            }}
            className="w-8 h-8 rounded-full bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center transition cursor-pointer shadow-xs"
            title="Quay lại bước trước"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* DROPDOWN CHỌN UNIT */}
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1.5 bg-amber-900/60 px-3 py-1 rounded-xl border border-amber-700/60">
              <span className="text-sm sm:text-base font-black tracking-tight">
                {activeSection?.title?.split(':')[0] || 'Unit 1'}
              </span>
              <span className="text-sm sm:text-base font-bold text-amber-200">
                {activeSection?.title?.split(':')[1] || currentUnitData?.unitTitle || 'Local community'}
              </span>
            </div>

            {sections.length > 1 && (
              <select
                value={activeSectionId || ''}
                onChange={(e) => setActiveSectionId(e.target.value)}
                className="bg-amber-900 text-amber-100 text-xs font-bold px-2 py-1.5 rounded-lg border border-amber-700 cursor-pointer outline-hidden"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* NHÃN BÀI HỌC (GETTING STARTED) & TRANG SÁCH & CHẾ ĐỘ TOÀN MÀN HÌNH */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {viewLevel === 3 && (
            <div className="hidden sm:flex items-center space-x-2 bg-amber-900/50 px-3 py-1 rounded-xl border border-amber-700/50">
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                {currentLessonData?.title || 'GETTING STARTED'}
              </span>
            </div>
          )}

          <div className="flex items-center space-x-1 bg-amber-700 px-2.5 py-1 rounded-lg text-xs font-black text-white shadow-xs">
            <FileText className="w-3.5 h-3.5 text-amber-300" />
            <span>Page {currentLessonData?.pageNumber || 8}</span>
          </div>

          <button
            type="button"
            onClick={() => setViewLevel(viewLevel === 1 ? 3 : 1)}
            className="p-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white transition cursor-pointer"
            title={viewLevel === 1 ? 'Vào bài tập' : 'Xem danh mục bài học'}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. NỘI DUNG CHÍNH (THEO 3 CẤP VIEW) */}
      <main className="flex-1 bg-slate-100 p-3 sm:p-6 lg:p-8 relative min-h-[calc(100vh-120px)] pb-24">
        {/* CANVAS VẼ ANNOTATION TRÊN CÙNG KHI BẬT BÚT VẼ */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleStartDraw}
          onMouseMove={handleDrawMove}
          onMouseUp={handleStopDraw}
          onMouseLeave={handleStopDraw}
          onTouchStart={handleStartDraw}
          onTouchMove={handleDrawMove}
          onTouchEnd={handleStopDraw}
          className={`absolute inset-0 z-20 w-full h-full ${
            activeTool === 'select' ? 'pointer-events-none' : 'pointer-events-auto cursor-crosshair'
          }`}
        />

        {/* =================================================================== */}
        {/* CẤP 1: DANH SÁCH BÀI HỌC TRONG UNIT (CHUẨN ẢNH 2) */}
        {/* =================================================================== */}
        {viewLevel === 1 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
            <div className="bg-amber-800 text-white px-6 py-3 rounded-2xl font-black text-base shadow-sm">
              DANH SÁCH BÀI HỌC (LESSONS)
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-md space-y-2">
              {LESSON_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => {
                    setSelectedLessonKey(tmpl.id);
                    setViewLevel(2); // Chuyển sang danh sách Tasks của bài đó
                  }}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-amber-50 text-slate-800 hover:text-amber-950 font-black text-sm sm:text-base text-left transition border border-slate-200 hover:border-amber-400 flex items-center justify-between group cursor-pointer shadow-2xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{tmpl.icon}</span>
                    <span className="tracking-wide uppercase">{tmpl.title}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-amber-700">
                    Trang {tmpl.page} ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CẤP 2: DANH SÁCH CÁC TASK CON TRONG BÀI (CHUẨN ẢNH 3) */}
        {/* =================================================================== */}
        {viewLevel === 2 && (
          <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
            <div className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-base shadow-sm uppercase">
              {currentLessonData?.title || 'GETTING STARTED'}
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-md space-y-3">
              {currentTasks.map((t, idx) => (
                <button
                  key={t.id || idx}
                  type="button"
                  onClick={() => {
                    setCurrentTaskIndex(idx);
                    setViewLevel(3); // Mở giao diện tương tác Task
                  }}
                  className="w-full p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-950 font-bold text-sm sm:text-base text-left transition border border-slate-200 hover:border-emerald-400 flex items-center space-x-3 group cursor-pointer shadow-2xs"
                >
                  <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-black flex items-center justify-center flex-shrink-0 shadow-xs">
                    {t.taskNumber || idx + 1}
                  </span>
                  <span className="flex-1 leading-snug">{t.taskTitle}</span>
                  <span className="text-xs font-extrabold text-slate-400 group-hover:text-emerald-700">
                    Bắt đầu ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* CẤP 3: MÀN HÌNH TƯƠNG TÁC TỪNG TASK (CHUẨN ẢNH 4 & ẢNH 5) */}
        {/* =================================================================== */}
        {viewLevel === 3 && (
          <div className="animate-fade-in">
            <InteractiveTaskRenderer
              task={activeTask}
              lesson={currentLessonData}
              showAnswerKey={showAnswerKey}
              audioRate={audioRate}
              isTeacher={isTeacher}
            />
          </div>
        )}
      </main>

      {/* 3. THANH CÔNG CỤ GIẢNG DẠY DƯỚI ĐÁY MÀN HÌNH (CHUẨN ẢNH 4 & 5) */}
      <InteractiveBookToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        penColor={penColor}
        setPenColor={setPenColor}
        penSize={penSize}
        setPenSize={setPenSize}
        highlighterColor={highlighterColor}
        setHighlighterColor={setHighlighterColor}
        onClearCanvas={handleClearCanvas}
        showAnswerKey={showAnswerKey}
        onToggleAnswerKey={() => setShowAnswerKey(!showAnswerKey)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        currentTaskIndex={currentTaskIndex}
        totalTasks={currentTasks.length}
        onPrevTask={() => setCurrentTaskIndex((prev) => Math.max(0, prev - 1))}
        onNextTask={() => setCurrentTaskIndex((prev) => Math.min(currentTasks.length - 1, prev + 1))}
        audioRate={audioRate}
        onChangeAudioRate={setAudioRate}
        onReplayAudio={() => {
          window.speechSynthesis?.cancel();
        }}
      />
    </div>
  );
}
