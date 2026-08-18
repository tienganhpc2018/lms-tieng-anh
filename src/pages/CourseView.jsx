import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/lms/CourseSidebar';
import EnrolledUsersModal from '../components/lms/EnrolledUsersModal';
import QuizBuilder from '../components/lms/QuizBuilder';
import QuizEngine from '../components/lms/QuizEngine';
import InteractiveVideoBuilder from '../components/lms/InteractiveVideoBuilder';
import CenterToastModal from '../components/common/CenterToastModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Edit3, Trash2, HelpCircle, FileText, Video, Eye, ArrowLeft, Users, Key, Sparkles, CheckCircle, BookOpen } from 'lucide-react';

export default function CourseView() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { profile, isTeacher } = useAuth();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal Enrolled Users
  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);

  // State Soạn Thảo Quiz (QuizBuilder Modal)
  const [editingQuizActivityId, setEditingQuizActivityId] = useState(null);

  // State Làm Bài Quiz (QuizEngine Modal)
  const [takingQuizActivity, setTakingQuizActivity] = useState(null);

  // State H5P Video Interactive Builder
  const [h5pVideoActivityId, setH5pVideoActivityId] = useState(null);

  // State Modal Tạo Bài Học / Hoạt Động Mới
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState('quiz');

  // Center Toast Popup State
  const [toast, setToast] = useState({ isOpen: false, type: 'success', title: '', message: '' });

  const showToast = (type, title, message) => {
    setToast({ isOpen: true, type, title, message });
  };

  const fetchCourseData = async () => {
    setLoading(true);
    const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (!cData) {
      setLoading(false);
      return;
    }
    setCourse(cData);

    const { data: sData } = await supabase.from('course_sections').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
    setSections(sData || []);

    if (sData && sData.length > 0) {
      const activeId = activeSectionId || sData[0].id;
      setActiveSectionId(activeId);
      const { data: aData } = await supabase.from('activities').select('*').eq('section_id', activeId).order('order_index', { ascending: true });
      setActivities(aData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [courseId, activeSectionId]);

  const handleSelectSection = (secId) => {
    setActiveSectionId(secId);
  };

  const handleAddSection = async () => {
    const title = prompt('Nhập tên chủ đề/Unit mới (Ví dụ: Unit 3: Teenagers):');
    if (!title) return;
    const nextIdx = sections.length;
    await supabase.from('course_sections').insert([{ course_id: courseId, title, order_index: nextIdx }]);
    fetchCourseData();
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActTitle.trim() || !activeSectionId) return;

    const nextIdx = activities.length;
    const { error } = await supabase.from('activities').insert([
      {
        section_id: activeSectionId,
        title: newActTitle.trim(),
        type: newActType,
        order_index: nextIdx,
        settings: {},
      },
    ]);

    if (error) {
      showToast('error', 'Lỗi tạo bài học', error.message);
    } else {
      showToast('success', 'Thành công', 'Đã thêm bài học mới!');
      setIsAddActivityOpen(false);
      setNewActTitle('');
      fetchCourseData();
    }
  };

  const handleDeleteActivity = async (actId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    await supabase.from('activities').delete().eq('id', actId);
    fetchCourseData();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* HEADER KHÓA HỌC */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-2xl text-slate-300 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-extrabold tracking-tight">{course?.title || 'Khóa Học Tiếng Anh'}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">
                  Mã Lớp: {course?.enrollment_code || 'ENGLISH9'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Giáo viên phụ trách: {profile?.full_name || 'Nguyễn Văn Hải'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
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
                      className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs"
                    >
                      + Thêm Bài Học Mới Ngay
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-5 bg-white border border-emerald-100 rounded-2xl shadow-xs hover:shadow-md transition flex items-center justify-between group"
                    >
                      <div
                        onClick={() => {
                          if (isTeacher) setEditingQuizActivityId(act.id);
                          else setTakingQuizActivity(act);
                        }}
                        className="flex items-center space-x-4 cursor-pointer flex-1"
                      >
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          {act.type === 'video' ? <Video className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-emerald-600 transition">
                            {act.title}
                          </h3>
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            MODULE: {act.type?.toUpperCase() || 'QUIZ'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* NÚT "SOẠN BÀI & CÂU HỎI" XUẤT HIỆN TRÊN TẤT CẢ CÁC LOẠI BÀI HỌC (PAGE / QUIZ / LESSON) CHUẨN ẢNH 3 */}
                        {isTeacher && (
                          <button
                            onClick={() => setEditingQuizActivityId(act.id)}
                            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-xl text-xs font-extrabold transition border border-emerald-200 flex items-center space-x-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Soạn Bài & Câu Hỏi</span>
                          </button>
                        )}

                        <button
                          onClick={() => setTakingQuizActivity(act)}
                          className="px-3.5 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-600 hover:text-white rounded-xl text-xs font-extrabold transition border border-sky-200 flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Thi Thử</span>
                        </button>

                        {isTeacher && (
                          <button
                            onClick={() => handleDeleteActivity(act.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL SOẠN BÀI QUIZBUILDER */}
      {editingQuizActivityId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200 my-6 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Soạn Thảo Bài Học & Ngân Hàng Câu Hỏi Quiz</h3>
              <button onClick={() => setEditingQuizActivityId(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[82vh] overflow-y-auto">
              <QuizBuilder activityId={editingQuizActivityId} onSaved={() => fetchCourseData()} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL THI THỬ QUIZENGINE */}
      {takingQuizActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-6 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Làm Bài Thi Thử: {takingQuizActivity.title}</h3>
              <button onClick={() => setTakingQuizActivity(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[82vh] overflow-y-auto">
              <QuizEngine activity={takingQuizActivity} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO BÀI HỌC MỚI */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
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
                  placeholder="Ví dụ: A closer look 1, Getting started..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">LOẠI HOẠT ĐỘNG</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                >
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Tạo Bài Học
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
