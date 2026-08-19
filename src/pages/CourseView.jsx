import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/lms/CourseSidebar';
import EnrolledUsersModal from '../components/lms/EnrolledUsersModal';
import CenterToastModal from '../components/common/CenterToastModal';
import { BookOpen, Plus, Users, ArrowLeft, Key, Eye, EyeOff, Copy, Check, Lock, ChevronRight, PlayCircle, FileText, CheckSquare, Palette } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function CourseView() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile, isTeacher } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState('whiteboard'); // Mặc định chọn Whiteboard chuẩn Ảnh
  const [creatingAct, setCreatingAct] = useState(false);

  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, type: 'info', title: '', message: '' });

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      const { data: cData } = await supabase
        .from('courses')
        .select('*, teacher:teacher_id (full_name, email)')
        .eq('id', courseId)
        .single();
      setCourse(cData);

      const { data: sData } = await supabase
        .from('course_sections')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (sData && sData.length > 0) {
        setSections(sData);
        setActiveSectionId(sData[0].id);
      }
    } catch (e) {}
    setLoading(false);
  };

  const fetchActivities = async () => {
    if (!activeSectionId) return;
    try {
      const { data: aData } = await supabase
        .from('activities')
        .select('*')
        .eq('section_id', activeSectionId)
        .order('order_index', { ascending: true });
      setActivities(aData || []);
    } catch (e) {}
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    fetchActivities();
  }, [activeSectionId]);

  const handleSelectSection = (sId) => {
    setActiveSectionId(sId);
  };

  const handleAddSection = async (title) => {
    try {
      const { data, error } = await supabase
        .from('course_sections')
        .insert([
          {
            course_id: courseId,
            title,
            order_index: sections.length,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        setSections([...sections, data]);
        setActiveSectionId(data.id);
        setToast({ isOpen: true, type: 'success', title: 'Thành Công', message: 'Đã thêm chủ đề mới!' });
      }
    } catch (e) {}
  };

  // TẠO BÀI HỌC MỚI VÀ FIX TRIỆT ĐỂ LỖI LƯU (TỰ ĐỘNG TẠO CHỦ ĐỀ NẾU CHƯA CÓ VÀ ĐẢM BẢO COMPATIBILITY BẢNG SUPABASE)
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActTitle.trim()) {
      alert('Vui lòng nhập tên bài học!');
      return;
    }

    setCreatingAct(true);
    try {
      let targetSectionId = activeSectionId;

      // Nếu chưa có chủ đề (section) nào trong khóa học, tự động tạo "Chủ đề 1: Bài Học & Giảng Dạy"
      if (!targetSectionId) {
        const { data: newSec, error: secErr } = await supabase
          .from('course_sections')
          .insert([
            {
              course_id: courseId,
              title: 'Chủ đề 1: Bài Học & Giảng Dạy',
              order_index: 0,
            },
          ])
          .select()
          .single();

        if (secErr || !newSec) {
          throw new Error('Khóa học chưa có chủ đề bài học. Không thể tạo bài mới!');
        }
        targetSectionId = newSec.id;
        setSections([newSec]);
        setActiveSectionId(newSec.id);
      }

      // Đảm bảo type thích ứng 100% với DB Supabase: lưu type = 'resource' cho Whiteboard kèm tiền tố [WHITEBOARD]
      const dbType = newActType === 'whiteboard' ? 'resource' : newActType;
      const formattedTitle = newActType === 'whiteboard'
        ? `[WHITEBOARD] ${newActTitle.trim()}`
        : newActTitle.trim();

      const { data: newAct, error: actErr } = await supabase
        .from('activities')
        .insert([
          {
            section_id: targetSectionId,
            title: formattedTitle,
            type: dbType,
            order_index: activities.length,
          },
        ])
        .select()
        .single();

      if (actErr) {
        throw new Error(actErr.message || 'Lỗi lưu bài học vào hệ thống!');
      }

      if (newAct) {
        setIsAddActivityOpen(false);
        setNewActTitle('');
        setActivities((prev) => [...prev, newAct]);
        setToast({ isOpen: true, type: 'success', title: 'Thành Công', message: 'Đã tạo bài học mới thành công!' });

        if (newActType === 'whiteboard') {
          // Mở ngay trang Whiteboard với ID bài học này
          navigate(`/whiteboard?activityId=${newAct.id}`);
        }
      }
    } catch (err) {
      alert('❌ LỖI LƯU BÀI HỌC: ' + err.message);
    } finally {
      setCreatingAct(false);
    }
  };

  const handleActivityClick = (act) => {
    const isWhiteboard = act.type === 'whiteboard' || (act.title && act.title.includes('[WHITEBOARD]'));
    if (isWhiteboard) {
      navigate(`/whiteboard?activityId=${act.id}`);
    } else {
      navigate(`/assignment/${act.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-slate-100 rounded-xl transition text-slate-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md">
                Khóa Học E-Learning
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {course?.title || 'Đang tải khóa học...'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Giáo viên phụ trách: {course?.teacher?.full_name || 'Giáo viên'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isTeacher && (
              <button
                onClick={() => setIsEnrolledModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg transition flex items-center space-x-2"
              >
                <Users className="w-4 h-4" />
                <span>Danh Sách Học Viên Enrolled</span>
              </button>
            )}
          </div>
        </div>

        {/* CẤU TRÚC 2 CỘT SIDEBAR & BÀI HỌC */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CourseSidebar
              sections={sections}
              activeSectionId={activeSectionId}
              onSelectSection={handleSelectSection}
              onAddSection={handleAddSection}
              isTeacher={isTeacher}
              activities={activities}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {sections.find((s) => s.id === activeSectionId)?.title || 'Danh Sách Bài Học'}
                  </h2>
                  <p className="text-xs text-slate-500">Hiển thị {activities.length} bài học trong chủ đề này</p>
                </div>

                {isTeacher && (
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Bài Học Mới</span>
                  </button>
                )}
              </div>

              {loading ? (
                <LoadingSpinner text="Đang tải bài học..." />
              ) : activities.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <p className="text-xs text-slate-400 font-semibold">Chủ đề này chưa có bài học nào.</p>
                  {isTeacher && (
                    <button
                      onClick={() => setIsAddActivityOpen(true)}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md"
                    >
                      + Thêm Bài Học Mới Ngay
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => {
                    const isWhiteboard = act.type === 'whiteboard' || (act.title && act.title.includes('[WHITEBOARD]'));

                    return (
                      <div
                        key={act.id}
                        onClick={() => handleActivityClick(act)}
                        className={`p-4 rounded-2xl border transition flex items-center justify-between cursor-pointer group ${
                          isWhiteboard
                            ? 'bg-amber-50 hover:bg-amber-100 border-amber-300'
                            : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold shadow-2xs ${
                            isWhiteboard ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
                          }`}>
                            {isWhiteboard ? <Palette className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                          </div>

                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition">
                              {act.title.replace('[WHITEBOARD]', '').trim()}
                            </h3>
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase">
                              {isWhiteboard ? '🎨 Whiteboard Bảng Tương Tác' : act.type}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="px-3 py-1 bg-white rounded-lg text-xs font-extrabold text-slate-700 shadow-2xs border">
                            {isWhiteboard ? 'Vào Giảng Dạy' : 'Mở Bài Học'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THÊM BÀI HỌC / HOẠT ĐỘNG MỚI (TÍCH HỢP WHITEBOARD - FIX LỖI LƯU 100%) */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">+ Thêm Bài Học / Hoạt Động Mới</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TÊN BÀI HỌC (TÊN TIẾT HỌC)</label>
                <input
                  type="text"
                  required
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  placeholder="Ví dụ: A closer look 2, Getting started..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LOẠI HOẠT ĐỘNG</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-amber-50 text-slate-900"
                >
                  <option value="whiteboard">🎨 Whiteboard (Bảng Tương Tác Giảng Dạy - Lưu Trực Tiếp)</option>
                  <option value="quiz">Quiz (Bài Kiểm Tra Trắc Nghiệm / Reading / Listening)</option>
                  <option value="page">Page (Trang Bài Giảng / Tài Liệu)</option>
                  <option value="video">Interactive Video H5P (Video Tương Tác)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-slate-600 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingAct}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {creatingAct ? 'Đang Tạo Bài Học...' : '🚀 Tạo Bài Học & Mở Bảng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ENROLLED USERS MODAL */}
      <EnrolledUsersModal
        isOpen={isEnrolledModalOpen}
        onClose={() => setIsEnrolledModalOpen(false)}
        courseId={courseId}
        courseTitle={course?.title}
      />

      {/* TOAST MODAL */}
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
