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
import { Plus, Edit3, Trash2, HelpCircle, FileText, Video, Eye, ArrowLeft, Users, Key, Sparkles, CheckCircle } from 'lucide-react';

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
    // Fetch Khóa học
    const { data: cData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (!cData) {
      setLoading(false);
      return;
    }
    setCourse(cData);

    // Fetch Các Sections (Units)
    const { data: sData } = await supabase.from('course_sections').select('*').eq('course_id', courseId).order('order_index', { ascending: true });
    setSections(sData || []);

    if (sData && sData.length > 0) {
      const defaultSecId = activeSectionId || sData[0].id;
      setActiveSectionId(defaultSecId);

      // Fetch Tất cả Activities trong Khóa Học
      const secIds = sData.map((s) => s.id);
      const { data: aData } = await supabase.from('activities').select('*').in('section_id', secIds).order('order_index', { ascending: true });
      setActivities(aData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [courseId]);

  // Tạo Bài Học Mới (Activity)
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newActTitle.trim() || !activeSectionId) return;

    const { error } = await supabase.from('activities').insert([
      {
        section_id: activeSectionId,
        title: newActTitle.trim(),
        type: newActType,
        order_index: activities.length + 1,
      },
    ]);

    if (error) {
      showToast('error', 'Lỗi Tạo Bài Học', error.message);
    } else {
      showToast('success', 'Thành Công 🎉', 'Đã thêm bài học mới vào Unit!');
      setNewActTitle('');
      setIsAddActivityOpen(false);
      await fetchCourseData();
    }
  };

  // Xóa Bài Học
  const handleDeleteActivity = async (actId) => {
    if (!confirm('Bạn có chắc muốn xóa bài học này khỏi Unit?')) return;
    await supabase.from('activities').delete().eq('id', actId);
    showToast('success', 'Đã Xóa Bài Học', 'Bài học đã được xóa khỏi hệ thống!');
    await fetchCourseData();
  };

  if (loading) return <LoadingSpinner text="Đang tải dữ liệu khóa học..." />;

  const activeSection = sections.find((s) => s.id === activeSectionId);
  const currentSectionActivities = activities.filter((a) => a.section_id === activeSectionId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* HEADER KHÓA HỌC */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{course?.title}</h1>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold rounded-lg flex items-center space-x-1">
                <Key className="w-3.5 h-3.5" />
                <span>Mã Lớp: {course?.join_code}</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Giáo viên phụ trách: {profile?.full_name || 'Nguyễn Văn Hải'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEnrolledModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-md transition flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Danh Sách Học Viên Enrolled</span>
        </button>
      </div>

      {/* BỐ CỤC CHÍNH (SIDEBAR NAVIGATION DỮ LIỆU ĐỘNG VÀ KHU VỰC NỘI DUNG) */}
      <div className="flex flex-col lg:flex-row gap-8">
        <CourseSidebar
          courseTitle={course?.title}
          sections={sections}
          activities={activities}
          activeSectionId={activeSectionId}
          onSelectSection={(secId) => setActiveSectionId(secId)}
          onSelectActivity={(actId) => {
            const act = activities.find((a) => a.id === actId);
            if (act) {
              if (act.type === 'quiz') {
                if (isTeacher) setEditingQuizActivityId(act.id);
                else setTakingQuizActivity(act);
              } else if (act.type === 'video' || act.type === 'h5p') {
                setH5pVideoActivityId(act.id);
              }
            }
          }}
          isTeacher={isTeacher}
          onOpenEnrolledModal={() => setIsEnrolledModalOpen(true)}
        />

        {/* KHU VỰC HIỂN THỊ DANH SÁCH BÀI HỌC TRONG UNIT */}
        <main className="flex-1 space-y-6">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">{activeSection?.title || 'Danh Sách Bài Học'}</h2>
              <p className="text-xs text-slate-500">
                Hiển thị {currentSectionActivities.length} bài học trong chủ đề này
              </p>
            </div>

            {isTeacher && (
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Bài Học Mới</span>
              </button>
            )}
          </div>

          {/* DANH SÁCH BÀI HỌC THỰC TẾ TRONG UNIT */}
          {currentSectionActivities.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
              Chủ đề này chưa có bài học nào. Bấm nút "+ Thêm Bài Học Mới" ở trên để khởi tạo bài học đầu tiên!
            </div>
          ) : (
            <div className="space-y-3">
              {currentSectionActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center hover:border-emerald-300 transition"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                      {act.type === 'quiz' && <HelpCircle className="w-5 h-5" />}
                      {act.type === 'video' && <Video className="w-5 h-5 text-rose-600" />}
                      {act.type === 'h5p' && <Sparkles className="w-5 h-5 text-purple-600" />}
                      {act.type === 'page' && <FileText className="w-5 h-5 text-sky-600" />}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{act.title}</h4>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        Module: {act.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* GIÁO VIÊN BẤM SOẠN CÂU HỎI */}
                    {isTeacher && act.type === 'quiz' && (
                      <button
                        onClick={() => setEditingQuizActivityId(act.id)}
                        className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-extrabold text-xs rounded-xl transition flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Soạn Câu Hỏi</span>
                      </button>
                    )}

                    {/* GIÁO VIÊN BẤM BIÊN TẬP VIDEO H5P */}
                    {isTeacher && (act.type === 'video' || act.type === 'h5p') && (
                      <button
                        onClick={() => setH5pVideoActivityId(act.id)}
                        className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 font-extrabold text-xs rounded-xl transition flex items-center space-x-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Thiết Kế Video H5P</span>
                      </button>
                    )}

                    {/* HỌC SINH BẤM LÀM BÀI */}
                    {!isTeacher && act.type === 'quiz' && (
                      <button
                        onClick={() => setTakingQuizActivity(act)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
                      >
                        Làm Bài Thi
                      </button>
                    )}

                    {isTeacher && (
                      <button
                        onClick={() => handleDeleteActivity(act.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition"
                        title="Xóa bài học này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MODAL ENROLLED USERS */}
      {isEnrolledModalOpen && (
        <EnrolledUsersModal courseId={courseId} onClose={() => setIsEnrolledModalOpen(false)} />
      )}

      {/* MODAL QUIZ BUILDER (GIÁO VIÊN SOẠN CÂU HỎI) */}
      {editingQuizActivityId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Soạn Thảo Ngân Hàng Câu Hỏi Quiz</h3>
              <button onClick={() => setEditingQuizActivityId(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <div className="p-6">
              <QuizBuilder activityId={editingQuizActivityId} onSaved={() => fetchCourseData()} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL QUIZ ENGINE (HỌC SINH LÀM BÀI THI) */}
      {takingQuizActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Làm Bài Kiểm Tra Quiz: {takingQuizActivity.title}</h3>
              <button onClick={() => setTakingQuizActivity(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <div className="p-6">
              <QuizEngine activity={takingQuizActivity} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL H5P INTERACTIVE VIDEO BUILDER */}
      {h5pVideoActivityId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Thiết Kế Video Tương Tác H5P</h3>
              <button onClick={() => setH5pVideoActivityId(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <div className="p-6">
              <InteractiveVideoBuilder activityId={h5pVideoActivityId} onSaved={() => setH5pVideoActivityId(null)} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO BÀI HỌC MỚI */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Thêm Bài Học Mới Vào Unit</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên Bài Học *</label>
                <input
                  type="text"
                  required
                  value={newActTitle}
                  onChange={(e) => setNewActTitle(e.target.value)}
                  placeholder="Ví dụ: Getting started, A closer look 1..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Loại Bài Học (Module) *</label>
                <select
                  value={newActType}
                  onChange={(e) => setNewActType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="quiz">Quiz (Bài Thi Trắc Nghiệm / Điền Từ)</option>
                  <option value="page">Page (Trang Bài Học Văn Bản / Lý Thuyết)</option>
                  <option value="video">Video (Bài Học Video)</option>
                  <option value="h5p">H5P (Bài Học Interactive Video H5P)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-slate-600 font-semibold text-xs rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  + Thêm Bài Học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENTER TOAST POPUP */}
      <CenterToastModal
        isOpen={toast.isOpen}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </div>
  );
}
