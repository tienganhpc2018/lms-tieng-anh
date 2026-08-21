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
  const { user, profile, isTeacher } = useAuth();

  const targetActivityId = id;

  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!targetActivityId) return;
      setLoading(true);
      try {
        const { data: act } = await supabase
          .from('activities')
          .select('*')
          .eq('id', targetActivityId)
          .maybeSingle();

        if (isMounted) {
          if (act) {
            setActivity(act);
          } else {
            setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' });
          }
        }
      } catch (e) {
        if (isMounted) {
          setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [targetActivityId]);

  if (loading) {
    return <LoadingSpinner text="Đang nạp đề thi thử..." />;
  }

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' };
  const userIsTeacher = isTeacher || profile?.is_teacher || false;

  // PHÂN TÍCH THAM SỐ URL ĐỂ QUYẾT ĐỊNH MỞ GIAO DIỆN SOI BÀI LÀM CỦA HỌC SINH HOẶC KHUNG SOẠN ĐỀ
  const searchParams = new URLSearchParams(window.location.search);
  const isReviewMode = searchParams.get('review') === 'true' || searchParams.has('submissionId') || searchParams.has('studentId');
  const isExplicitStudentView = searchParams.get('student_view') === 'true';

  // Nếu là Giáo viên và KHÔNG ở chế độ xem lại bài làm học sinh -> MẶC ĐỊNH MỞ NGAY KHUNG SOẠN ĐỀ (QUIZBUILDER)!
  const showBuilderMode = userIsTeacher && !isReviewMode && !isExplicitStudentView;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 hover:bg-slate-100 rounded-2xl transition text-slate-700 flex items-center space-x-2 font-bold text-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                {showBuilderMode ? 'TRÌNH SOẠN ĐỀ THI 20 DẠNG CÂU HỎI' : isReviewMode ? 'TRUY VẾT BÀI LÀM VÀ LỜI GIẢI HỌC SINH' : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {(activeAct?.title || 'Bài Kiểm Tra / Thi Thử').replace('[WHITEBOARD]', '').trim()}
              </h1>
            </div>
          </div>

          {userIsTeacher && (
            <div className="flex items-center space-x-2 self-end sm:self-center">
              {showBuilderMode ? (
                <button
                  type="button"
                  onClick={() => navigate(`/assignment/${targetActivityId}?student_view=true`)}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  👁️ Xem Giao Diện Học Sinh
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate(`/assignment/${targetActivityId}`)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  ✏️ Mở Khung Soạn Thảo Đề Thi
                </button>
              )}
            </div>
          )}
        </div>

        {/* MỞ GIAO DIỆN CHUẨN XÁC THEO MỤC ĐÍCH */}
        {showBuilderMode ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}
      </div>
    </div>
  );
}
