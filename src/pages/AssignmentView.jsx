import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft } from 'lucide-react';
import QuizEngine from '../components/lms/QuizEngine';
import QuizBuilder from '../components/lms/QuizBuilder';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AssignmentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isTeacher = profile?.is_teacher || false;

  const targetActivityId = id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!targetActivityId) return;
    setLoading(true);
    try {
      const { data: act } = await supabase
        .from('activities')
        .select('*, section:section_id (course_id)')
        .eq('id', targetActivityId)
        .maybeSingle();

      if (act) {
        setActivity(act);
      } else {
        setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' });
      }
    } catch (e) {
      setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [targetActivityId]);

  if (loading) {
    return <LoadingSpinner text="Đang tải bài thi..." />;
  }

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition text-slate-700 flex items-center space-x-2 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại bài học</span>
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                {isTeacher ? 'Trình Soạn Đề Thi 20 Dạng Câu Hỏi' : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {(activeAct?.title || 'Bài Kiểm Tra / Thi Thử').replace('[WHITEBOARD]', '').trim()}
              </h1>
            </div>
          </div>

          {isTeacher && (
            <span className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-2xs">
              👑 Chế Độ Giáo Viên Soạn Đề
            </span>
          )}
        </div>

        {/* NẾU LÀ GIÁO VIÊN -> MỞ TRÌNH SOẠN ĐỀ QUIZ BUILDER. NẾU LÀ HỌC SINH -> MỞ TRÌNH LÀM BÀI QUIZ ENGINE */}
        {isTeacher ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}
      </div>
    </div>
  );
}
