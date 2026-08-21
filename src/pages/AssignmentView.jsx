import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Compass } from 'lucide-react';
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
  const [previewMode, setPreviewMode] = useState(false);

  const fetchData = async () => {
    if (!targetActivityId) return;
    setLoading(true);
    try {
      const { data: act } = await supabase
        .from('activities')
        .select('*')
        .eq('id', targetActivityId)
        .maybeSingle();

      if (act) {
        setActivity(act);
      } else {
        setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' });
      }
    } catch (e) {
      setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [targetActivityId]);

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' };
  const userIsTeacher = isTeacher || profile?.is_teacher || false;

  if (loading) {
    return <LoadingSpinner text="Đang nạp đề thi thử..." />;
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-3">
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
                {userIsTeacher && !previewMode ? 'TRÌNH SOẠN ĐỀ THI 20 DẠNG CÂU HỎI' : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {(activeAct?.title || 'Bài Kiểm Tra / Thi Thử').replace('[WHITEBOARD]', '').trim()}
              </h1>
            </div>
          </div>

          {userIsTeacher && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-md transition flex items-center space-x-1.5 ${
                  previewMode
                    ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>{previewMode ? '⚙️ QUAY LẠI CHẾ ĐỘ SOẠN ĐỀ' : '👁️ XEM THỬ VỚI GIAO DIỆN HỌC SINH'}</span>
              </button>

              <span className="px-3 py-2 bg-slate-900 text-amber-400 rounded-xl text-xs font-extrabold border border-amber-500/30">
                👑 Giáo Viên
              </span>
            </div>
          )}
        </div>

        {/* NẾU LÀ GIÁO VIÊN VÀ KHÔNG Ở CHẾ ĐỘ XEM THỬ -> MỞ QUIZ BUILDER. NẾU LÀ HỌC SINH HOẶC BẤM XEM THỬ -> MỞ QUIZ ENGINE */}
        {userIsTeacher && !previewMode ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}
      </div>
    </div>
  );
}
