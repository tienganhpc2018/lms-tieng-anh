import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Plus, User, Search, ShieldCheck, ArrowRight, X } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user, profile, isTeacher } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal Tạo Khóa Học Mới
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLMSFile(file, 'course-covers');
      setCoverImage(url);
    } catch (err) {
      alert('Lỗi upload ảnh cover: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          title: title.trim(),
          description: description.trim(),
          cover_image: coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
          teacher_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      alert('Lỗi tạo khóa học: ' + error.message);
    } else {
      // Tạo sẵn Section mặc định "Getting Started / Bài Mở Đầu"
      if (data) {
        await supabase.from('course_sections').insert([
          {
            course_id: data.id,
            title: 'Chủ Đề 1: Tổng Quan & Bài Mở Đầu',
            order_index: 0,
          },
        ]);
      }
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setCoverImage('');
      await fetchCourses();
    }
    setCreating(false);
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Chào Mừng & Thanh Tìm Kiếm */}
      <div className="bg-gradient-to-r from-navy-900 via-slate-800 to-navy-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 max-w-xl">
          <span className="px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center space-x-1 border border-brand-500/30">
            <BookOpen className="w-3.5 h-3.5" />
            <span>LMS HỌC LIỆU E-LEARNING</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {profile?.full_name || 'Học viên'}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Khám phá các khóa học E-learning tương tác, bài thi Quiz chuẩn SCORM / H5P và theo dõi tiến độ học tập toàn diện.
          </p>
        </div>

        {/* Action Button cho Giáo Viên */}
        {isTeacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-brand-500/30 transition flex items-center space-x-2 flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Tạo Khóa Học Mới</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Danh Sách Khóa Học ({filteredCourses.length})
        </h2>
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm khóa học..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
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
              ? 'Hãy bấm nút "Tạo Khóa Học Mới" ở trên để bắt đầu thêm bài giảng đầu tiên!'
              : 'Hiện chưa có khóa học nào được đăng tải trên hệ thống.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Thumbnail Image */}
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={course.cover_image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                    <User className="w-3 h-3 text-brand-600" />
                    <span>GV: {course.teacher?.full_name || 'Giáo viên'}</span>
                  </span>
                </div>

                {/* Nội dung Card */}
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-brand-600 transition">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {course.description || 'Khóa học cung cấp đầy đủ kiến thức E-learning tương tác.'}
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
                  className="px-4 py-2 bg-slate-900 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                >
                  <span>Vào Học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo Khóa Học Mới */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">Tạo Khóa Học Mới</h3>
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
                  placeholder="Ví dụ: Tiếng Anh Lớp 10 - Unit 1: Family Life"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Ảnh Bìa Khóa Học (Thumbnail)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {uploading && <span className="text-xs text-brand-600 ml-2">Đang tải ảnh...</span>}
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
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  {creating ? 'Đang tạo...' : 'Tạo Khóa Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
