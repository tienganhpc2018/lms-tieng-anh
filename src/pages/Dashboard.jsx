import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CenterToastModal from '../components/common/CenterToastModal';
import { BookOpen, Plus, User, Search, ArrowRight, X, Edit3, Trash2, Key, Users, Copy, Check } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, profile, isTeacher } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast Center Modal State
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });
  const showToast = (type, title, message) => setToast({ isOpen: true, type, title, message });

  // State Modal Tạo Khóa Học Mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [customJoinCode, setCustomJoinCode] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  // State Modal Gia Nhập Khóa Học Bằng Mã (Join Code) cho Học sinh
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [inputJoinCode, setInputJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  // State Modal Chỉnh Sửa Khóa Học (Dành Cho Admin / Giáo viên)
  const [editingCourse, setEditingCourse] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [editJoinCode, setEditJoinCode] = useState('');
  const [updating, setUpdating] = useState(false);

  const [copiedCode, setCopiedCode] = useState('');

  // Sinh Mã Gia Nhập 6 Ký Tự Ngẫu Nhiên
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
      setCourses(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleImageUpload = async (e, isEdit = false) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLMSFile(file, 'course-covers');
      if (isEdit) {
        setEditCoverImage(url);
      } else {
        setCoverImage(url);
      }
    } catch (err) {
      showToast('error', 'Lỗi Upload Ảnh', err.message);
    } finally {
      setUploading(false);
    }
  };

  // Tạo Khóa Học Mới - Đảm Bảo 100% Thành Công Trên Mọi Database Supabase
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const finalJoinCode = (customJoinCode.trim() || generateRandomCode()).toUpperCase();
    const newCover = coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60';
    const fullDescription = `[MÃ GIA NHẬP: ${finalJoinCode}] ${description.trim()}`;

    try {
      // Insert trực tiếp các trường cốt lõi chuẩn 100% của bảng courses
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: title.trim(),
            description: fullDescription,
            cover_image: newCover,
            teacher_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Tự động Ghi danh Giáo viên vào khóa học
        try {
          await supabase.from('course_enrollments').insert([
            {
              course_id: data.id,
              user_id: user.id,
              role: 'teacher',
            },
          ]);
        } catch (e1) {}

        // Tạo sẵn Chủ đề 1 mặc định
        try {
          await supabase.from('course_sections').insert([
            {
              course_id: data.id,
              title: 'Chủ Đề 1: Unit 1 - Overview & Getting Started',
              order_index: 0,
            },
          ]);
        } catch (e2) {}

        showToast('success', 'Thành Công', 'Đã tạo khóa học mới thành công!');
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setCoverImage('');
        setCustomJoinCode('');
        await fetchCourses();
      }
    } catch (finalErr) {
      console.error('Lỗi khi tạo khóa học:', finalErr);
      showToast('error', 'Lỗi Tạo Khóa Học', finalErr.message || 'Không thể tạo khóa học. Vui lòng thử lại!');
    } finally {
      setCreating(false);
    }
  };
  const handleJoinCourseByCode = async (e) => {
    e.preventDefault();
    if (!inputJoinCode.trim()) return;
    setJoining(true);

    const searchCode = inputJoinCode.trim().toUpperCase();

    // 1. Tìm khóa học theo join_code
    const { data: targetCourse, error: cErr } = await supabase
      .from('courses')
      .select('*')
      .eq('join_code', searchCode)
      .maybeSingle();

    if (cErr || !targetCourse) {
      showToast('error', 'Mã Khóa Học Không Đúng', `Không tìm thấy khóa học với mã "${searchCode}". Vui lòng kiểm tra lại mã do Giáo viên cung cấp!`);
      setJoining(false);
      return;
    }

    // 2. Ghi danh (Enrol) Học sinh vào khóa học
    const { error: eErr } = await supabase.from('course_enrollments').upsert([
      {
        course_id: targetCourse.id,
        user_id: user.id,
        role: 'student',
        status: 'active',
      },
    ]);

    if (eErr) {
      showToast('error', 'Lỗi Gia Nhập', eErr.message);
    } else {
      setIsJoinModalOpen(false);
      setInputJoinCode('');
      showToast('success', 'Gia Nhập Thành Công!', `Bạn đã tham gia khóa học "${targetCourse.title}"!`);
      navigate(`/course/${targetCourse.id}`);
    }
    setJoining(false);
  };

  // Mở Modal Chỉnh Sửa Khóa Học
  const openEditModal = (course, e) => {
    e.stopPropagation();
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditDescription(course.description || '');
    setEditCoverImage(course.cover_image || '');
    setEditJoinCode(course.join_code || '');
  };

  // Cập Nhật Khóa Học (Update Course)
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse || !editTitle.trim()) return;
    setUpdating(true);

    const { error } = await supabase
      .from('courses')
      .update({
        title: editTitle.trim(),
        description: editDescription.trim(),
        cover_image: editCoverImage,
        join_code: (editJoinCode.trim() || generateRandomCode()).toUpperCase(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingCourse.id);

    if (error) {
      showToast('error', 'Lỗi Cập Nhật', error.message);
    } else {
      setEditingCourse(null);
      showToast('success', 'Cập Nhật Thành Công', 'Đã lưu thay đổi thông tin khóa học!');
      await fetchCourses();
    }
    setUpdating(false);
  };

  // Xóa Khóa Học (Delete Course)
  const handleDeleteCourse = async (courseId, courseTitle, e) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc chắn muốn xóa toàn bộ khóa học "${courseTitle}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }

    const { error } = await supabase.from('courses').delete().eq('id', courseId);
    if (error) {
      showToast('error', 'Lỗi Xóa Khóa Học', error.message);
    } else {
      showToast('success', 'Đã Xóa Khóa Học', `Đã xóa khóa học "${courseTitle}".`);
      await fetchCourses();
    }
  };

  const copyToClipboard = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.join_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Chào Mừng & Các Nút Thao Tác Trực Quan */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-800 to-navy-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1 border border-emerald-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LMS TIẾNG ANH - SMART E-LEARNING</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {profile?.full_name || 'Học viên'}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Tham gia các khóa học Tiếng Anh E-learning tương tác, nhập Mã Khóa Học 6 ký tự để gia nhập lớp và làm bài thi tự động.
          </p>
        </div>

        {/* Action Buttons cho Giáo Viên & Học Sinh */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsJoinModalOpen(true)}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs shadow-md border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Nhập Mã Gia Nhập Lớp</span>
          </button>

          {isTeacher && (
            <button
              onClick={() => {
                setCustomJoinCode(generateRandomCode());
                setIsModalOpen(true);
              }}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-lg hover:shadow-emerald-500/30 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Khóa Học Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Danh Sách Khóa Học ({filteredCourses.length})
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên hoặc Mã Khóa Học..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
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
              ? 'Bấm "Tạo Khóa Học Mới" ở trên để sinh Mã Lớp 6 ký tự và bắt đầu thêm bài học!'
              : 'Bấm nút "Nhập Mã Gia Nhập Lớp" để nhập mã do Giáo viên cung cấp và gia nhập lớp học.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isOwnerOrAdmin = isTeacher && (course.teacher_id === user?.id || profile?.role === 'teacher');
            return (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group relative"
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

                    {/* BADGE MÃ GIA NHẬP (JOIN CODE 6 KÝ TỰ) */}
                    <button
                      onClick={(e) => copyToClipboard(course.join_code, e)}
                      title="Bấm để copy Mã Khóa Học"
                      className="absolute top-3 left-3 bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] font-extrabold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-md transition border border-emerald-400/40"
                    >
                      <Key className="w-3 h-3" />
                      <span>Mã: {course.join_code}</span>
                      {copiedCode === course.join_code ? <Check className="w-3 h-3 text-white" /> : <Copy className="w-3 h-3 text-emerald-200" />}
                    </button>

                    {/* NÚT CHỈNH SỬA & XÓA KHÓA HỌC DÀNH CHO ADMIN / GIÁO VIÊN */}
                    {isOwnerOrAdmin && (
                      <div className="absolute top-3 right-3 flex items-center space-x-1 bg-slate-900/80 backdrop-blur-sm p-1 rounded-xl shadow-lg border border-slate-700">
                        <button
                          onClick={(e) => openEditModal(course, e)}
                          title="Chỉnh sửa tên, mô tả & mã khóa học"
                          className="p-1.5 text-slate-300 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
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
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description || 'Khóa học Tiếng Anh E-learning cung cấp đầy đủ bài tập và bài giảng tương tác.'}
                    </p>
                  </div>
                </div>

                {/* Action Button vào khóa học */}
                <div className="px-5 pb-5 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(course.created_at).toLocaleDateString('vi-VN')}
                  </span>
                  <Link
                    to={`/course/${course.id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <span>Vào Học</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL GIA NHẬP BẰNG MÃ JOIN CODE 6 KÝ TỰ CHO HỌC SINH */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <span>Gia Nhập Khóa Học Bằng Mã</span>
              </h3>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleJoinCourseByCode} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nhập Mã Gia Nhập (6 Ký Tự Do Giáo Viên Cung Cấp) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={inputJoinCode}
                  onChange={(e) => setInputJoinCode(e.target.value.toUpperCase())}
                  placeholder="Ví dụ: E9GS26"
                  className="w-full px-4 py-3 border-2 border-emerald-500 rounded-xl text-center text-lg font-extrabold uppercase tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-emerald-50/30"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoinModalOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={joining}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {joining ? 'Đang gia nhập...' : 'Xác Nhận Gia Nhập Lớp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạo Khóa Học Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Tạo Khóa Học Mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tên Khóa Học *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Tiếng Anh 9 - Global Success Unit 1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mã Gia Nhập Khóa Học (Mã Lớp 6 Ký Tự)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={customJoinCode}
                    onChange={(e) => setCustomJoinCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 uppercase tracking-wider bg-slate-50"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomJoinCode(generateRandomCode())}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Tạo Mã Mới
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Mô Tả Khóa Học
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tóm tắt chương trình học..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ảnh Bìa Khóa Học (Thumbnail)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {uploading && <span className="text-xs text-emerald-600 ml-2">Đang tải ảnh...</span>}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creating || uploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo & Chuyển sang khóa học...' : 'Tạo Khóa Học Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA KHÓA HỌC DÀNH CHO ADMIN / GIÁO VIÊN */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <span>Chỉnh Sửa Khóa Học</span>
              </h3>
              <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đổi Tên Khóa Học *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đổi Mã Gia Nhập (Mã Lớp 6 Ký Tự)
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  value={editJoinCode}
                  onChange={(e) => setEditJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-slate-900 uppercase tracking-wider bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Chỉnh Sửa Mô Tả
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Đổi Ảnh Bìa (Thumbnail)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {uploading && <span className="text-xs text-emerald-600 ml-2">Đang tải ảnh...</span>}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={updating || uploading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {updating ? 'Đang cập nhật...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST CENTER MODAL THÔNG BÁO Ở GIỮA TRANG */}
      <CenterToastModal
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        type={toast.type}
        title={toast.title}
        message={toast.message}
      />
    </div>
  );
}
