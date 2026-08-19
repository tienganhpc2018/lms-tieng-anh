import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CenterToastModal from '../components/common/CenterToastModal';
import UserManagementModal from '../components/lms/UserManagementModal';
import { 
  BookOpen, Plus, Users, Search, Key, Sparkles, FolderOpen, Crown, ChevronRight, 
  ChevronDown, Home, Lock, BarChart3, HelpCircle, FileText, CheckCircle2, Copy, 
  Check, Palette, Layers, Award, FileQuestion, ArrowRight, X, Clock
} from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [isQuestionBankOpen, setIsQuestionBankOpen] = useState(false); // Modal Ngân hàng câu hỏi & Đề thi

  // Form Tạo Khóa Học
  const [courseFullName, setCourseFullName] = useState('');
  const [courseShortName, setCourseShortName] = useState('');
  const [courseIdNumber, setCourseIdNumber] = useState('');
  const [courseCategory, setCategory] = useState('Tiếng Anh THCS (CV7991)');
  const [courseVisibility, setVisibility] = useState('Show');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [creating, setCreating] = useState(false);

  // Form Gia Nhập Khóa Học
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [joining, setJoining] = useState(false);

  // Ngân Hàng Đề Thi State
  const [questionBankActivities, setQuestionBankActivities] = useState([]);
  const [loadingQB, setLoadingQB] = useState(false);

  // Accordion Navigation Tree States
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isSitePagesOpen, setIsSitePagesOpen] = useState(true);
  const [isMyCoursesOpen, setIsMyCoursesOpen] = useState(true);

  // Code Hướng Dẫn & Toast
  const [visibleCodeIds, setVisibleCodeIds] = useState([]);
  const [copiedCode, setCopiedCode] = useState('');
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const showToast = (type, title, message) => {
    setToast({ isOpen: true, type, title, message });
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data: cData, error: cErr } = await supabase
        .from('courses')
        .select('*, teacher:teacher_id (full_name, email)')
        .order('created_at', { ascending: false });

      if (!cErr && cData) {
        setCourses(cData);
      }

      if (user) {
        const { data: eData } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', user.id);

        if (eData) {
          setUserEnrollments(eData.map((e) => e.course_id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionBank = async () => {
    setLoadingQB(true);
    try {
      const { data, error } = await supabase
        .from('activities')
        .select('*, section:section_id (title, course:course_id (title))')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setQuestionBankActivities(data);
      }
    } catch (e) {}
    setLoadingQB(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = 'LMS-';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const toggleCodeVisibility = (courseId, e) => {
    e.stopPropagation();
    setVisibleCodeIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseFullName.trim()) return;
    setCreating(true);

    const finalJoinCode = (courseIdNumber.trim() || generateRandomCode()).toUpperCase();
    const newCover = coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';
    const fullDesc = `[SHORT_NAME: ${courseShortName.trim()}] [CATEGORY: ${courseCategory}] [VISIBILITY: ${courseVisibility}] ${description.trim()}`;

    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: courseFullName.trim(),
            description: fullDesc,
            cover_image: newCover,
            teacher_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        try {
          await supabase.from('course_enrollments').insert([
            {
              course_id: data.id,
              user_id: user.id,
              role: 'teacher',
            },
          ]);
        } catch (e1) {}

        try {
          await supabase.from('course_sections').insert([
            {
              course_id: data.id,
              title: 'Chủ Đề 1: Unit 1 - Overview & Getting Started',
              order_index: 0,
            },
          ]);
        } catch (e2) {}

        showToast('success', 'Thành Công', `Đã tạo khóa học mới thành công! Mã bảo mật: ${finalJoinCode}`);
        setIsModalOpen(false);
        setCourseFullName('');
        setCourseShortName('');
        setCourseIdNumber('');
        setDescription('');
        setCoverImage('');
        await fetchCourses();
      }
    } catch (err) {
      showToast('error', 'Lỗi', err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;

    setJoining(true);
    try {
      const { data: targetCourse, error: searchErr } = await supabase
        .from('courses')
        .select('*')
        .or(`id.eq.${code},title.ilike.%${code}%`)
        .maybeSingle();

      const matchedCourse = targetCourse || courses.find((c) => c.title.toLowerCase().includes(code.toLowerCase()));

      if (!matchedCourse) {
        showToast('error', 'Không Thấy Khóa Học', 'Mã mã bảo mật hoặc tên khóa học không chính xác.');
        setJoining(false);
        return;
      }

      const { data: existing } = await supabase
        .from('course_enrollments')
        .select('*')
        .eq('course_id', matchedCourse.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        showToast('info', 'Đã Gia Nhập', 'Bạn đã là học viên của khóa học này rồi!');
        setIsJoinModalOpen(false);
        setJoining(false);
        navigate(`/course/${matchedCourse.id}`);
        return;
      }

      const { error: enrollErr } = await supabase.from('course_enrollments').insert([
        {
          course_id: matchedCourse.id,
          user_id: user.id,
          role: 'student',
        },
      ]);

      if (enrollErr) throw enrollErr;

      showToast('success', 'Gia Nhập Thành Công!', `Chào mừng bạn đến với khóa học: ${matchedCourse.title}`);
      setIsJoinModalOpen(false);
      setJoinCodeInput('');
      await fetchCourses();
      navigate(`/course/${matchedCourse.id}`);
    } catch (err) {
      showToast('error', 'Lỗi Gia Nhập', err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('info', 'Đã Coppy', `Đã sao chép mã khóa học: ${code}`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredCourses = courses.filter((c) => {
    const isEnrolled = userEnrollments.includes(c.id);
    const isHidden = c.description?.includes('[VISIBILITY: Hide]');

    if (!isTeacher && isHidden && !isEnrolled) {
      return false;
    }

    const q = searchQuery.toLowerCase();
    const titleMatch = (c.title || '').toLowerCase().includes(q);
    const descMatch = (c.description || '').toLowerCase().includes(q);
    return titleMatch || descMatch;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <CenterToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* BANNER HEADER */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 text-white min-h-[200px] flex items-center">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25 scale-105 transition duration-700 hover:scale-100"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1600&auto=format&fit=crop&q=80')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/40" />

          <div className="relative z-10 p-6 sm:p-8 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <span className="text-[11px] font-extrabold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center space-x-1.5 backdrop-blur-xs w-fit">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>SỔ TAY DẠY HỌC THCS • GLOBAL SUCCESS</span>
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Chào mừng trở lại, {profile?.full_name || user?.email?.split('@')[0]}! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Khám phá nền tảng giáo dục thông minh với đầy đủ công cụ quản lý chuyên môn, bài giảng E-learning tương tác và ngân hàng đề thi bám sát ma trận CV7991.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => setIsJoinModalOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg transition flex items-center space-x-2 border border-amber-300/40"
                >
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>🔑 Nhập Mã Gia Nhập Lớp</span>
                </button>

                {isTeacher && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-lg transition flex items-center space-x-2 border border-emerald-400/40"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add a new course (Tạo Khóa Học)</span>
                  </button>
                )}
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-2 px-5 py-2.5 bg-amber-500/20 border border-amber-400/40 rounded-2xl text-amber-300 text-xs font-extrabold backdrop-blur-md shadow-lg">
              <Crown className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>{isTeacher ? '👑 Đặc quyền VIP Giáo Viên' : '🎓 Học Sinh Chính Thức'}</span>
            </div>
          </div>
        </div>

        {/* BỐ CỤC 2 CỘT: SIDEBAR NAVIGATION NGUYÊN BẢN CHUẨN MOODLE + MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CỘT TRÁI: NAVIGATION BLOCK CỐ ĐỊNH CHUẨN MOODLE 100% */}
          <div className="lg:col-span-1 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4 font-sans text-xs">
            <h2 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-2.5 flex items-center justify-between">
              <span>Navigation</span>
            </h2>

            <div className="space-y-1.5 font-bold">
              {/* LEVEL 1: DASHBOARD ACCORDION */}
              <div>
                <button
                  type="button"
                  onClick={() => setIsDashboardOpen(!isDashboardOpen)}
                  className="w-full flex items-center space-x-1.5 text-sky-700 hover:text-sky-900 py-1 transition font-extrabold text-left"
                >
                  {isDashboardOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  <span>Dashboard</span>
                </button>

                {isDashboardOpen && (
                  <div className="pl-4 space-y-2 mt-1 border-l-2 border-slate-100 ml-1.5">
                    {/* Site home */}
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-2 text-slate-700 hover:text-emerald-700 py-1 transition"
                    >
                      <Home className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-emerald-700">Site home</span>
                    </Link>

                    {/* Site pages Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsSitePagesOpen(!isSitePagesOpen)}
                        className="w-full flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 py-1 transition text-left"
                      >
                        {isSitePagesOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <span>Site pages</span>
                      </button>

                      {isSitePagesOpen && (
                        <div className="pl-4 space-y-1.5 mt-1 border-l-2 border-slate-100 ml-1.5">
                          {/* 1. NGÂN HÀNG CÂU HỎI & ĐỀ THI */}
                          <button
                            type="button"
                            onClick={() => {
                              fetchQuestionBank();
                              setIsQuestionBankOpen(true);
                            }}
                            className="w-full flex items-center space-x-2 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-xl border border-indigo-200 transition font-extrabold text-left shadow-2xs"
                          >
                            <FileQuestion className="w-4 h-4 text-indigo-600" />
                            <span>📚 Ngân Hàng Câu Hỏi & Đề Thi</span>
                          </button>

                          {/* 2. CỘNG ĐỒNG LỚP HỌC & AI NÂNG CAO (MODULE 9 & 10) */}
                          <Link
                            to="/community"
                            className="flex items-center space-x-2 text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2 py-1.5 rounded-xl border border-emerald-300/50 transition font-extrabold shadow-2xs"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span>💬 Bảng Tin & AI Trợ Giảng (Module 9-10)</span>
                          </Link>

                          {/* 2. BẢNG TƯƠNG TÁC GIẢNG DẠY WHITEBOARD */}
                          {isTeacher && (
                            <Link
                              to="/whiteboard"
                              className="flex items-center space-x-2 text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 px-2 py-1.5 rounded-xl border border-amber-300/50 transition font-extrabold shadow-2xs"
                            >
                              <Palette className="w-4 h-4 text-amber-600" />
                              <span>🎨 Bảng Tương Tác (Whiteboard)</span>
                            </Link>
                          )}

                          {/* 3. TAB KHÓA HỌC (MY COURSES) */}
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 py-1 transition font-semibold"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>My courses (Khóa học)</span>
                          </Link>

                          {/* 4. TAB QUẢN LÝ HỌC SINH (USERS) */}
                          {isTeacher && (
                            <button
                              type="button"
                              onClick={() => setIsUserMgmtOpen(true)}
                              className="w-full flex items-center space-x-2 text-purple-700 hover:text-purple-900 py-1 transition font-extrabold text-left"
                            >
                              <Users className="w-3.5 h-3.5 text-purple-600" />
                              <span>Quản Lý Học Sinh (Users)</span>
                            </button>
                          )}

                          {/* 5. TAB BẢNG ĐIỂM & ANALYTICS */}
                          {isTeacher && (
                            <Link
                              to="/analytics"
                              className="flex items-center space-x-2 text-sky-700 hover:text-sky-900 py-1 transition font-extrabold"
                            >
                              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
                              <span>Analytics & Bảng Điểm</span>
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* LEVEL 2: MY COURSES ACCORDION TREE */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMyCoursesOpen(!isMyCoursesOpen)}
                  className="w-full flex items-center space-x-1.5 text-slate-800 hover:text-emerald-700 py-1 transition font-extrabold text-left uppercase text-[11px]"
                >
                  {isMyCoursesOpen ? <ChevronDown className="w-3.5 h-3.5 text-emerald-600" /> : <ChevronRight className="w-3.5 h-3.5 text-emerald-600" />}
                  <span>My courses ({courses.length})</span>
                </button>

                {isMyCoursesOpen && (
                  <div className="pl-3 space-y-1 mt-1 border-l-2 border-slate-100 ml-1">
                    {courses.map((c) => (
                      <Link
                        key={c.id}
                        to={`/course/${c.id}`}
                        className="block py-1 px-2 hover:bg-emerald-50 rounded-lg text-slate-700 hover:text-emerald-800 font-bold truncate transition text-xs"
                      >
                        • {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MAIN CONTENT DANH SÁCH KHÓA HỌC */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Khóa Học Của Tôi & Hệ Thống</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Hiển thị {filteredCourses.length} khóa học E-learning
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm khóa học..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                  />
                </div>
              </div>

              {loading ? (
                <LoadingSpinner text="Đang tải danh sách khóa học..." />
              ) : filteredCourses.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <p className="text-xs text-slate-400 font-semibold">Chưa có khóa học nào khớp với tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((courseItem) => (
                    <div
                      key={courseItem.id}
                      onClick={() => navigate(`/course/${courseItem.id}`)}
                      className="p-5 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-3xl transition duration-200 cursor-pointer group space-y-3 shadow-2xs hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg uppercase">
                          Tiếng Anh THCS
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition">
                          {courseItem.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1">
                          {courseItem.description?.replace(/\[.*?\]/g, '').trim() || 'Khóa học tiếng Anh THCS chuẩn ma trận CV7991'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 border-t border-slate-200/60 pt-2.5">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>GV: {courseItem.teacher?.full_name || 'Nguyễn Văn Hải'}</span>
                        </span>
                        <span className="text-emerald-600 group-hover:underline flex items-center space-x-1">
                          <span>Vào Học</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL NGÂN HÀNG CÂU HỎI & ĐỀ THI (THƯ MỤC NGÂN HÀNG ĐỀ THƯƠNG HIỆU) */}
      {isQuestionBankOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-indigo-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2 text-indigo-300">
                <FileQuestion className="w-5 h-5 text-indigo-400" />
                <span>📚 Ngân Hàng Câu Hỏi & Danh Sách Đề Thi Thử</span>
              </h3>
              <button onClick={() => setIsQuestionBankOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[450px] overflow-y-auto">
              {loadingQB ? (
                <LoadingSpinner text="Đang tải ngân hàng đề thi..." />
              ) : questionBankActivities.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Chưa có đề thi nào trong ngân hàng.</p>
              ) : (
                <div className="space-y-3">
                  {questionBankActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-2xl flex items-center justify-between transition"
                    >
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{act.title.replace('[WHITEBOARD]', '').trim()}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-extrabold text-indigo-700 uppercase bg-indigo-100 px-2 py-0.5 rounded-md">
                            {act.type === 'whiteboard' ? '🎨 Whiteboard' : act.type === 'quiz' ? '📝 Đề Thi Thử Quiz' : act.type}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Khóa học: {act.section?.course?.title || 'English'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setIsQuestionBankOpen(false);
                          navigate(`/assignment/${act.id}`);
                        }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center space-x-1"
                      >
                        <span>{isTeacher ? '👑 Soạn / Chỉnh Sửa' : '🚀 Thi Thử Ngay'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN USER MANAGEMENT MODAL */}
      {isUserMgmtOpen && (
        <UserManagementModal isOpen={isUserMgmtOpen} onClose={() => setIsUserMgmtOpen(false)} />
      )}

      {/* CREATE COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">+ Add a new course</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Course full name</label>
                <input
                  type="text"
                  required
                  value={courseFullName}
                  onChange={(e) => setCourseFullName(e.target.value)}
                  placeholder="Ví dụ: Tiếng Anh 9 - Global Success"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 text-xs font-bold">Hủy</button>
                <button type="submit" disabled={creating} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md">
                  {creating ? 'Đang Tạo...' : 'Save and display'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN COURSE MODAL */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-amber-600 text-slate-950 px-6 py-4 flex justify-between items-center font-bold">
              <h3 className="font-extrabold text-base flex items-center space-x-2 text-slate-950">
                <Key className="w-5 h-5 text-slate-950" />
                <span>🔑 Gia Nhập Lớp Học Bằng Mã Bảo Mật</span>
              </h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="hover:text-white">✕</button>
            </div>
            <form onSubmit={handleJoinCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mã Khóa Học Hoặc Tên Lớp</label>
                <input
                  type="text"
                  required
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value)}
                  placeholder="Ví dụ: LMS-X8A2K9 hoặc Tiếng Anh 9..."
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-extrabold tracking-wider focus:ring-2 focus:ring-amber-500 uppercase bg-amber-50/50"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="px-4 py-2 text-slate-600 text-xs font-bold">Hủy</button>
                <button type="submit" disabled={joining} className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-md">
                  {joining ? 'Đang Gia Nhập...' : '🚀 XÁC NHẬN GIA NHẬP'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
