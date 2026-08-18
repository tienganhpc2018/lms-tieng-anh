import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import CourseSidebar from '../components/lms/CourseSidebar';
import ActivityModal from '../components/lms/ActivityModal';
import QuizEngine from '../components/lms/QuizEngine';
import QuizBuilder from '../components/lms/QuizBuilder';
import ScormPlayer from '../components/lms/ScormPlayer';
import H5PViewer from '../components/lms/H5PViewer';
import InteractiveVideo from '../components/lms/InteractiveVideo';
import AssignmentGrade from '../components/lms/AssignmentGrade';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { HelpCircle, Package, Layers, FileText, Video, BookOpen, Link as LinkIcon, Plus, Trash2, Edit3, ArrowLeft, Settings } from 'lucide-react';

export default function CourseView() {
  const { id: courseId } = useParams();
  const { user, isTeacher } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isQuizBuilderOpen, setIsQuizBuilderOpen] = useState(false);
  const [activeQuizForBuilder, setActiveQuizForBuilder] = useState(null);

  // Tiến độ học tập %
  const [progressPercentage, setProgressPercentage] = useState(0);

  const fetchCourseData = async () => {
    setLoading(true);
    // 1. Fetch Course details
    const { data: cData, error: cErr } = await supabase
      .from('courses')
      .select('*, teacher:teacher_id (full_name)')
      .eq('id', courseId)
      .single();

    if (cErr || !cData) {
      alert('Không tìm thấy khóa học!');
      navigate('/dashboard');
      return;
    }
    setCourse(cData);

    // 2. Fetch Course Sections
    const { data: sData } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true });

    const loadedSections = sData || [];
    setSections(loadedSections);

    if (loadedSections.length > 0 && !activeSectionId) {
      setActiveSectionId(loadedSections[0].id);
    }

    setLoading(false);
  };

  const fetchActivities = async (sectionId) => {
    if (!sectionId) return;
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('section_id', sectionId)
      .order('order_index', { ascending: true });

    setActivities(data || []);
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  useEffect(() => {
    if (activeSectionId) {
      fetchActivities(activeSectionId);
      setSelectedActivity(null);
    }
  }, [activeSectionId]);

  // Thêm Section mới
  const handleAddSection = async () => {
    const title = prompt('Nhập tên Chủ đề / Tuần học mới:');
    if (!title?.trim()) return;

    const { data, error } = await supabase
      .from('course_sections')
      .insert([
        {
          course_id: courseId,
          title: title.trim(),
          order_index: sections.length,
        },
      ])
      .select()
      .single();

    if (!error && data) {
      setSections([...sections, data]);
      setActiveSectionId(data.id);
    }
  };

  // Sửa tên Section
  const handleEditSection = async (section) => {
    const newTitle = prompt('Đổi tên Chủ đề / Tuần học:', section.title);
    if (!newTitle?.trim() || newTitle.trim() === section.title) return;

    const { error } = await supabase
      .from('course_sections')
      .update({ title: newTitle.trim() })
      .eq('id', section.id);

    if (error) {
      alert('Lỗi cập nhật tên chủ đề: ' + error.message);
    } else {
      await fetchCourseData();
    }
  };

  // Xóa Section
  const handleDeleteSection = async (sectionId, sectionTitle) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa chủ đề "${sectionTitle}" cùng tất cả các bài học bên trong?`)) {
      return;
    }

    const { error } = await supabase.from('course_sections').delete().eq('id', sectionId);
    if (error) {
      alert('Lỗi xóa chủ đề: ' + error.message);
    } else {
      const remaining = sections.filter((s) => s.id !== sectionId);
      setSections(remaining);
      if (remaining.length > 0) {
        setActiveSectionId(remaining[0].id);
      } else {
        setActiveSectionId(null);
      }
    }
  };

  // Thêm Activity mới
  const handleAddActivity = async (activityData) => {
    const { error } = await supabase.from('activities').insert([activityData]);
    if (error) {
      alert('Lỗi tạo hoạt động: ' + error.message);
    } else {
      await fetchActivities(activeSectionId);
    }
  };

  // Sửa tên Activity
  const handleEditActivityTitle = async (act, e) => {
    e.stopPropagation();
    const newTitle = prompt('Đổi tên bài học / hoạt động:', act.title);
    if (!newTitle?.trim() || newTitle.trim() === act.title) return;

    const { error } = await supabase
      .from('activities')
      .update({ title: newTitle.trim() })
      .eq('id', act.id);

    if (error) {
      alert('Lỗi sửa tên bài học: ' + error.message);
    } else {
      await fetchActivities(activeSectionId);
    }
  };

  // Xóa Activity
  const handleDeleteActivity = async (actId, actTitle, e) => {
    e.stopPropagation();
    if (!confirm(`Bạn có chắc muốn xóa bài học "${actTitle}"?`)) return;
    await supabase.from('activities').delete().eq('id', actId);
    await fetchActivities(activeSectionId);
    if (selectedActivity?.id === actId) setSelectedActivity(null);
  };

  if (loading) return <LoadingSpinner text="Đang tải dữ liệu khóa học..." />;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'quiz': return <HelpCircle className="w-5 h-5 text-emerald-600" />;
      case 'h5p': return <Package className="w-5 h-5 text-sky-600" />;
      case 'scorm': return <Layers className="w-5 h-5 text-amber-600" />;
      case 'assignment': return <FileText className="w-5 h-5 text-blue-600" />;
      case 'video': return <Video className="w-5 h-5 text-rose-600" />;
      case 'page': return <BookOpen className="w-5 h-5 text-teal-600" />;
      default: return <LinkIcon className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Subheader Title */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 leading-tight">{course?.title}</h1>
            <p className="text-xs text-slate-500">Giáo viên phụ trách: {course?.teacher?.full_name}</p>
          </div>
        </div>

        {isTeacher && activeSectionId && (
          <button
            onClick={() => setIsActivityModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Bài Học / Hoạt Động</span>
          </button>
        )}
      </div>

      {/* Main Grid: Sidebar trái + Content phải */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar điều hướng các Tuần/Chủ đề */}
        <CourseSidebar
          sections={sections}
          activeSectionId={activeSectionId}
          onSelectSection={setActiveSectionId}
          isTeacher={isTeacher}
          onAddSection={handleAddSection}
          onEditSection={handleEditSection}
          onDeleteSection={handleDeleteSection}
          progressPercentage={progressPercentage}
        />

        {/* Content hiển thị bài học chính bên phải */}
        <main className="flex-1 space-y-6">
          {/* Nếu đang chọn 1 Activity cụ thể -> Render Viewer */}
          {selectedActivity ? (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-slate-100 rounded-xl">
                    {getActivityIcon(selectedActivity.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{selectedActivity.title}</h2>
                    <span className="text-xs font-semibold text-slate-400 uppercase">
                      Loại Module: {selectedActivity.type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-3.5 py-1.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold"
                >
                  Quay lại danh sách bài
                </button>
              </div>

              {/* RENDER VIEWER CHO TỪNG LOẠI HOẠT ĐỘNG */}
              {selectedActivity.type === 'quiz' && (
                <QuizEngine activity={selectedActivity} />
              )}

              {selectedActivity.type === 'scorm' && (
                <ScormPlayer activity={selectedActivity} />
              )}

              {selectedActivity.type === 'h5p' && (
                <H5PViewer activity={selectedActivity} />
              )}

              {selectedActivity.type === 'video' && (
                <InteractiveVideo activity={selectedActivity} isTeacher={isTeacher} />
              )}

              {selectedActivity.type === 'assignment' && (
                <div>
                  {isTeacher ? (
                    <AssignmentGrade activityId={selectedActivity.id} />
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <h4 className="font-bold text-sm text-slate-800 mb-2">Đề Bài / Yêu Cầu:</h4>
                        <div
                          className="prose prose-sm max-w-none text-slate-700"
                          dangerouslySetInnerHTML={{ __html: selectedActivity.settings?.richText || 'Làm bài và nộp file bên dưới.' }}
                        />
                      </div>
                      <button
                        onClick={() => navigate(`/assignment/${selectedActivity.id}`)}
                        className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition shadow-sm"
                      >
                        Nộp Bài Tập Ngay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {selectedActivity.type === 'page' && (
                <div className="space-y-4">
                  <div
                    className="prose prose-slate max-w-none text-slate-800"
                    dangerouslySetInnerHTML={{ __html: selectedActivity.settings?.richText || 'Nội dung bài học.' }}
                  />
                  {selectedActivity.content_url && (
                    <div className="pt-4 border-t border-slate-100">
                      <a
                        href={selectedActivity.content_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-600 hover:underline"
                      >
                        <span>Tải file đính kèm kèm theo bài học</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedActivity.type === 'url' && (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
                  <p className="text-sm text-slate-700">Liên kết tài liệu bên ngoài:</p>
                  <a
                    href={selectedActivity.content_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition"
                  >
                    Mở Đường Dẫn Trực Tiếp
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* Danh sách các Hoạt động thuộc Section đang mở */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
                Danh Sách Bài Học Trong Chủ Đề
              </h2>

              {activities.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <p className="text-xs text-slate-400 italic">
                    Chủ đề này chưa có hoạt động học tập nào.
                  </p>
                  {isTeacher && (
                    <button
                      onClick={() => setIsActivityModalOpen(true)}
                      className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
                    >
                      + Thêm Học Liệu Mới
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      onClick={() => setSelectedActivity(act)}
                      className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-emerald-100 transition">
                          {getActivityIcon(act.type)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
                            {act.title}
                          </h4>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase">
                            Module: {act.type}
                          </span>
                        </div>
                      </div>

                      {/* Công cụ Giáo viên/Admin: Sửa tên / Soạn Quiz / Xóa Activity */}
                      <div className="flex items-center space-x-1.5">
                        {isTeacher && act.type === 'quiz' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveQuizForBuilder(act);
                              setIsQuizBuilderOpen(true);
                            }}
                            title="Quản lý ngân hàng câu hỏi Quiz"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center space-x-1 border border-slate-200"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Soạn Câu Hỏi</span>
                          </button>
                        )}

                        {isTeacher && (
                          <button
                            onClick={(e) => handleEditActivityTitle(act, e)}
                            title="Sửa tên bài học"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {isTeacher && (
                          <button
                            onClick={(e) => handleDeleteActivity(act.id, act.title, e)}
                            title="Xóa bài học này"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
          )}
        </main>
      </div>

      {/* Modal Thêm Activity mới */}
      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        onAddActivity={handleAddActivity}
        sectionId={activeSectionId}
      />

      {/* Modal Quiz Builder cho Giáo viên */}
      {isQuizBuilderOpen && activeQuizForBuilder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-base">Soạn Thảo Ngân Hàng Câu Hỏi Quiz</h3>
              <button
                onClick={() => setIsQuizBuilderOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              <QuizBuilder
                activityId={activeQuizForBuilder.id}
                onSaved={() => fetchActivities(activeSectionId)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
