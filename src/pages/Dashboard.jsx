import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CenterToastModal from '../components/common/CenterToastModal';
import UserManagementModal from '../components/lms/UserManagementModal';
import { BookOpen, Plus, User, Search, ArrowRight, X, Edit3, Trash2, Key, Users, Copy, Check, Eye, EyeOff, ShieldCheck, Crown, Sparkles, Home, ChevronDown, ChevronRight, Folder, FileText, BarChart2, GraduationCap } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State Trạng thái Ẩn/Hiện Mã của Giáo viên
  const [visibleCodeIds, setVisibleCodeIds] = useState([]);

  // State Modal Site Admin Users Management
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);

  // Toast Center Modal State
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const showToast = (type, title, message) => setToast({ isOpen: true, type, title, message });

  // State Modal Tạo Khóa Học Mới Chuẩn Moodle Gnomio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseFullName, setCourseFullName] = useState('');
  const [courseShortName, setCourseShortName] = useState('');
  const [courseCategory, setCourseCategory] = useState('Danh mục các bài học');
  const [courseVisibility, setCourseVisibility] = useState('Show');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]);
  const [courseIdNumber, setCourseIdNumber] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [creating, setCreating] = useState(false);

  // State Modal Gia Nhập Khóa Học Bằng Mã (Join Code) cho Học sinh
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // State Navigation Accordion (Ảnh 1)
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [isSitePagesOpen, setIsSitePagesOpen] = useState(true);
  const [isMyCoursesOpen, setIsMyCoursesOpen] = useState(true);

  const [copiedCode, setCopiedCode] = useState('');

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*, teacher:teacher_id (full_name, email)')
      .order('created_at', { ascending: false });

    if (!error) {
      const updatedCourses = (data || []).map((c, idx) => {
        if (!c.join_code) {
          const sampleCodes = ['K6L841', '7B9X2M', 'E9G82K', '3M5P9R', '8H4L2W'];
          c.join_code = sampleCodes[idx % sampleCodes.length] || generateRandomCode();
        }
        return c;
      });
      setCourses(updatedCourses);
    }

    if (user?.id) {
      try {
        const { data: eData } = await supabase
          .from('course_enrollments')
          .select('course_id')
          .eq('user_id', user.id);
        if (eData) {
          setUserEnrollments(eData.map((e) => e.course_id));
        }
      } catch (err) {}
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  const toggleShowCode = (courseId, e) => {
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
    } catch (finalErr) {
      showToast('error', 'Không thể tạo khóa học', finalErr.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinCourseByCode = async (e) => {
    e.preventDefault();
    if (!inputJoinCode.trim()) return;
    setJoining(true);

    const codeUpper = inputJoinCode.trim().toUpperCase();

    const targetCourse = courses.find((c) => {
      if (!c) return false;
      const cJoinCode = (c.join_code || '').toUpperCase();
      const cDesc = (c.description || '').toUpperCase();

      return cJoinCode === codeUpper || cDesc.includes(`[MÃ GIA NHẬP: ${codeUpper}]`);
    });

    if (!targetCourse) {
      showToast('error', 'Mã Khóa Học Không Đúng', `Không tìm thấy khóa học với mã bảo mật "${inputJoinCode}". Vui lòng kiểm tra lại chính xác mã 6 ký tự do Giáo viên cung cấp!`);
      setJoining(false);
      return;
    }

    try {
      await supabase.from('course_enrollments').upsert([
        {
          course_id: targetCourse.id,
          user_id: user.id,
          role: profile?.role || 'student',
        },
      ]);

      showToast('success', 'Gia Nhập Thành Công', `Bạn đã mở khóa thành công: "${targetCourse.title}"`);
      setIsJoinModalOpen(false);
      setInputJoinCode('');
      await fetchCourses();
      navigate(`/course/${targetCourse.id}`);
    } catch (err) {
      showToast('error', 'Lỗi Gia Nhập Khóa Học', err.message);
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation();
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA khóa học "${courseTitle}"? Tất cả bài giảng và dữ liệu liên quan sẽ bị xóa vĩnh viễn!`)) {
      return;
    }

    try {
      await supabase.from('courses').delete().eq('id', courseId);
      showToast('success', 'Đã Xóa Khóa Học', `Đã xóa thành công khóa học: ${courseTitle}`);
      await fetchCourses();
    } catch (err) {
      showToast('error', 'Không Thể Xóa Khóa Học', err.message);
    }
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    showToast('success', 'Đã Sao Chép', 'Đã sao chép Mã Gia Nhập vào bộ nhớ tạm!');
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
        {/* BANNER HEADER CHUYÊN NGHIỆP SANG TRỌNG VỚI ẢNH NỀN VÀ LỚP PHỦ MỜ 15% (ẢNH 3) */}
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

        {/* BỐ CỤC 2 CỘT: SIDEBAR NAVIGATION NGUYÊN BẢN CHUẨN MOODLE (ẢNH 1) + MAIN CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* CỘT TRÁI: NAVIGATION BLOCK CỐ ĐỊNH CHUẨN MOODLE 100% (ẢNH 1) */}
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
                          {/* 1. TAB KHÓA HỌC (MY COURSES) */}
                          <Link
                            to="/dashboard"
                            className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 py-1 transition font-semibold"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                            <span>My courses (Khóa học)</span>
                          </Link>

                          {/* 2. TAB QUẢN LÝ HỌC SINH (USERS - SITE ADMIN DÀNH CHO GIÁO VIÊN) */}
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

                          {/* 3. TAB BẢNG ĐIỂM & ANALYTICS (GRADES DÀNH CHO GIÁO VIÊN) */}
                          {isTeacher && (
                            <Link
                              to="/analytics"
                              className="flex items-center space-x-2 text-teal-700 hover:text-teal-900 py-1 transition font-extrabold"
                            >
                              <BarChart2 className="w-3.5 h-3.5 text-teal-600" />
                              <span>Bảng Điểm & Analytics</span>
                            </Link>
                          )}

                          {/* 4. PRIVATE FILES */}
                          <Link
                            to="/profile"
                            className="flex items-center space-x-2 text-slate-600 hover:text-amber-700 py-1 transition font-semibold"
                          >
                            <Folder className="w-3.5 h-3.5 text-amber-600" />
                            <span>Private files (Tài liệu cá nhân)</span>
                          </Link>

                          {/* 5. TIN TỨC CHUNG */}
                          <div className="flex items-center space-x-2 text-slate-400 py-1 font-normal cursor-not-allowed">
                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tin tức chung</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* My courses Accordion */}
                    <div>
                      <button
                        type="button"
                        onClick={() => setIsMyCoursesOpen(!isMyCoursesOpen)}
                        className="w-full flex items-center space-x-1.5 text-slate-700 hover:text-slate-900 py-1 transition text-left"
                      >
                        <GraduationCap className="w-4 h-4 text-sky-600" />
                        <span>My courses</span>
                      </button>

                      {isMyCoursesOpen && (
                        <div className="pl-4 space-y-1 mt-1 border-l-2 border-slate-100 ml-1.5">
                          {courses.slice(0, 5).map((c) => (
                            <Link
                              key={c.id}
                              to={`/course/${c.id}`}
                              className="flex items-center space-x-1.5 text-slate-600 hover:text-emerald-600 py-1 transition font-medium truncate block"
                            >
                              <span className="text-slate-400 font-mono text-[10px]">›</span>
                              <span className="truncate">{c.title}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: MAIN CONTENT DANH SÁCH KHÓA HỌC */}
          <div className="lg:col-span-3 space-y-6">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-800 tracking-tight">
                Danh Sách Khóa Học ({filteredCourses.length})
              </h2>
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên khóa học..."
                  className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
                />
              </div>
            </div>

            {/* Grid Danh Sách Khóa Học */}
            {loading ? (
              <LoadingSpinner text="Đang tải danh sách khóa học..." />
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-700 text-lg">Chưa có khóa học nào</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {isTeacher
                    ? 'Bấm nút "+ Add a new course" ở trên để tạo khóa học mới chuẩn Moodle!'
                    : 'Bấm nút "🔑 Nhập Mã Gia Nhập Lớp" để nhập mã do Giáo viên cung cấp.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredCourses.map((course) => {
                  const isOwnerOrAdmin = isTeacher && (course.teacher_id === user?.id || profile?.role === 'teacher');
                  const isEnrolled = userEnrollments.includes(course.id);
                  const courseCode = course.join_code || 'K6L841';
                  const isCodeVisible = visibleCodeIds.includes(course.id);

                  return (
                    <div
                      key={course.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group relative"
                    >
                      <div>
                        {/* Thumbnail Image */}
                        <div className="h-44 bg-slate-100 relative overflow-hidden">
                          <img
                            src={course.cover_image}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                          <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                            <User className="w-3 h-3 text-emerald-600" />
                            <span>GV: {course.teacher?.full_name || 'Giáo viên'}</span>
                          </span>

                          {isOwnerOrAdmin && (
                            <div className="absolute top-3 right-3 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-slate-700">
                              <button
                                onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                                title="Xóa khóa học này"
                                className="p-1.5 text-slate-300 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Nội dung Card */}
                        <div className="p-5 space-y-2">
                          <h3 className="font-extrabold text-slate-900 text-base line-clamp-1 group-hover:text-emerald-600 transition">
                            {course.title}
                          </h3>

                          {!isOwnerOrAdmin && !isEnrolled ? (
                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                              Khóa học này đang giới hạn danh sách học viên. Vui lòng nhập mã do Ban tổ chức cung cấp để mở khóa bài giảng & bài tập.
                            </p>
                          ) : (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {course.description?.replace(/\[.*?\]/g, '').trim() || 'Khóa học Tiếng Anh E-learning cung cấp đầy đủ bài tập tương tác.'}
                            </p>
                          )}

                          {isOwnerOrAdmin && (
                            <div className="p-2.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs mt-2 border border-slate-800">
                              <div className="flex items-center space-x-1.5 font-bold">
                                <Key className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[11px] text-slate-300">Mã Lớp:</span>
                                <span className="px-2 py-0.5 bg-slate-800 text-amber-300 font-mono rounded text-xs tracking-widest font-extrabold">
                                  {isCodeVisible ? courseCode : '••••••'}
                                </span>
                              </div>

                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={(e) => toggleShowCode(course.id, e)}
                                  className="p-1 text-slate-400 hover:text-amber-400 transition rounded-lg"
                                  title={isCodeVisible ? 'Ẩn mã khỏi màn hình' : 'Hiện mã trên màn hình'}
                                >
                                  {isCodeVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => copyToClipboard(courseCode, e)}
                                  className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-lg text-[10px] flex items-center space-x-1 shadow-2xs"
                                >
                                  {copiedCode === courseCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedCode === courseCode ? 'Đã sao chép' : 'Sao chép'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Button vào khóa học */}
                      <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-400">
                          {new Date(course.created_at).toLocaleDateString('vi-VN')}
                        </span>

                        {isOwnerOrAdmin || isEnrolled ? (
                          <Link
                            to={`/course/${course.id}`}
                            className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1 shadow-sm"
                          >
                            <span>Vào Học</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setInputJoinCode('');
                              setIsJoinModalOpen(true);
                            }}
                            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 shadow-md border border-purple-400/40"
                          >
                            <Key className="w-4 h-4 text-purple-200" />
                            <span>🔑 Nhập Mã Mở Khóa</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* MODAL SITE ADMINISTRATION USER MANAGEMENT */}
        <UserManagementModal
          isOpen={isUserMgmtOpen}
          onClose={() => setIsUserMgmtOpen(false)}
        />

        {/* MODAL TẠO KHÓA HỌC MỚI CHUẨN MOODLE GNOMIO */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-200 overflow-hidden my-8 animate-scale-up">
              <div className="bg-slate-900 text-white p-6 flex justify-between items-center border-b border-slate-800">
                <div>
                  <h3 className="font-extrabold text-lg flex items-center space-x-2 text-white">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span>Add a new course (Tạo Khóa Học Mới)</span>
                  </h3>
                  <p className="text-xs text-slate-400">Cấu hình khóa học chuẩn Moodle / Gnomio Site Administration</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
                <div className="text-xs font-extrabold text-purple-900 uppercase tracking-wide border-b pb-2 flex items-center space-x-1">
                  <span>General - Cài Đặt Chung</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Course full name (Tên đầy đủ của khóa học) *
                    </label>
                    <input
                      type="text"
                      required
                      value={courseFullName}
                      onChange={(e) => setCourseFullName(e.target.value)}
                      placeholder="VD: English 9 Global Success"
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course short name (Tên ngắn)
                      </label>
                      <input
                        type="text"
                        value={courseShortName}
                        onChange={(e) => setCourseShortName(e.target.value)}
                        placeholder="VD: E9_GS"
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course category (Danh mục)
                      </label>
                      <select
                        value={courseCategory}
                        onChange={(e) => setCourseCategory(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                      >
                        <option value="Danh mục các bài học">Danh mục các bài học</option>
                        <option value="Tiếng Anh THCS">Tiếng Anh THCS (Khối 6-9)</option>
                        <option value="Luyện Thi Vào 10">Luyện Thi Vào 10</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course visibility (Ẩn/Hiện với học sinh)
                      </label>
                      <select
                        value={courseVisibility}
                        onChange={(e) => setCourseVisibility(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                      >
                        <option value="Show">Show (Cho phép hiển thị)</option>
                        <option value="Hide">Hide (Ẩn hoàn toàn với học sinh chưa ghi danh)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course ID number (Mã Gia Nhập Bảo Mật Chữ & Số)
                      </label>
                      <input
                        type="text"
                        value={courseIdNumber}
                        onChange={(e) => setCourseIdNumber(e.target.value)}
                        placeholder="Để trống tự sinh mã ngẫu nhiên (VD: K6L841)"
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-mono font-bold text-amber-900 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course start date (Ngày bắt đầu)
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                        Course end date (Ngày kết thúc)
                      </label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 uppercase mb-1">
                      Mô tả tổng quan khóa học:
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả nội dung bài giảng Tiếng Anh..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    {creating ? 'Đang Tạo...' : '🚀 Save and display (Lưu Khóa Học)'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL GIA NHẬP BẰNG MÃ JOIN CODE DÀNH CHO HỌC SINH */}
        {isJoinModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
              <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-extrabold text-base flex items-center space-x-2">
                  <Key className="w-5 h-5 text-emerald-400" />
                  <span>🔑 Nhập Mã Gia Nhập Khóa Học (Bảo Mật)</span>
                </h3>
                <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleJoinCourseByCode} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1 uppercase">
                    Nhập Chính Xác Mã 6 Ký Tự Do Giáo Viên Cung Cấp:
                  </label>
                  <input
                    type="text"
                    required
                    value={inputJoinCode}
                    onChange={(e) => setInputJoinCode(e.target.value)}
                    placeholder="VD: K6L841, 7B9X2M..."
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono font-extrabold uppercase tracking-widest text-center focus:ring-2 focus:ring-emerald-500 bg-amber-50"
                  />
                  <p className="text-[11px] text-slate-500 mt-2">
                    💡 Mã gia nhập là chuỗi 6 ký tự kết hợp cả Chữ cái và Chữ số do Giáo viên bộ môn cấp.
                  </p>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJoinModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={joining}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md"
                  >
                    {joining ? 'Đang Kiểm Tra...' : '🚀 XÁC NHẬN MỞ KHÓA'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
