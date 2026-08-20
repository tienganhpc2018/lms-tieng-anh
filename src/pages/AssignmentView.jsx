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

  const [isEditMode, setIsEditMode] = useState(false);

  if (loading) {
    return <LoadingSpinner text="Đang tải bài thi..." />;
  }

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' };
  const userIsTeacher = isTeacher || profile?.is_teacher || false;

  // NẾU BÀI HỌC LÀ DẠNG TÀI LIỆU / BÀI ĐỌC (PAGE HOẶC VIDEO)
  if (activeAct.type === 'page' || activeAct.type === 'video') {
    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
        <div className="max-w-4xl mx-auto space-y-6">
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
                <span className="text-[10px] font-extrabold text-sky-600 uppercase bg-sky-50 px-2 py-0.5 rounded-md">
                  {activeAct.type === 'video' ? '📺 BÀI GIẢNG VIDEO' : '📖 TÀI LIỆU LÝ THUYẾT / BÀI ĐỌC'}
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {(activeAct?.title || 'Tài Liệu Bài Học').replace('[WHITEBOARD]', '').trim()}
                </h1>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
                NỘI DUNG TÀI LIỆU & BÀI HỌC:
              </h2>
              <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-line shadow-inner">
                {activeAct.content || 'Nội dung bài học lý thuyết chưa có thông tin chi tiết.'}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  alert('🎉 Cảm ơn em đã đọc và hoàn thành bài học này!');
                  navigate(-1);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
              >
                ✅ ĐÃ HOÀN THÀNH BÀI HỌC NÀY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                {userIsTeacher ? 'BÀI THI & SOẠN ĐỀ 20 DẠNG CÂU HỎI' : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {(activeAct?.title || 'Bài Kiểm Tra / Thi Thử').replace('[WHITEBOARD]', '').trim()}
              </h1>
            </div>
          </div>

          {userIsTeacher && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm transition flex items-center space-x-1.5 cursor-pointer ${
                isEditMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isEditMode ? (
                <span>👁️ Mở Xem Giao Diện Thi Thử (QuizEngine)</span>
              ) : (
                <span>✏️ Chỉnh Sửa / Soạn Đề Thi Này (QuizBuilder)</span>
              )}
            </button>
          )}
        </div>

        {/* NẾU LÀ GIÁO VIÊN VÀ BẤM CHỈNH SỬA -> MỞ QUIZ BUILDER. MẶC ĐỊNH LUÔN MỞ QUIZ ENGINE DẠNG PILL BO VỪA TEXT 1 HÀNG CHUẨN 100% */}
        {userIsTeacher && isEditMode ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}
      </div>
    </div>
  );
}
