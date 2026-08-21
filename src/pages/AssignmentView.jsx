import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
import QuizEngine from '../components/lms/QuizEngine';
import QuizBuilder from '../components/lms/QuizBuilder';
import AudioRecordEngine from '../components/lms/AudioRecordEngine';
import LoadingSpinner from '../components/common/LoadingSpinner';

// COMPONENT RENDER INTERACTIVE GAME / IFRAME (WORDWALL, QUIZIZZ, GAME HTML5 RESPONSIVE 100%)
function IframeGameView({ activity }) {
  const content = activity?.content || '';

  let iframeUrl = '';
  if (content.includes('src=')) {
    const match = content.match(/src=["']([^"']+)["']/);
    if (match) iframeUrl = match[1];
  } else if (content.startsWith('http://') || content.startsWith('https://')) {
    iframeUrl = content;
  }

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-4 font-sans select-none">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
          <Gamepad2 className="w-5 h-5 text-purple-600" />
          <span>🎮 TRÒ CHƠI TƯƠNG TÁC / GAME HTML5 E-LEARNING</span>
        </h2>
        <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
          Wordwall / Quizizz / HTML5
        </span>
      </div>

      <div className="w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner min-h-[650px] relative">
        {iframeUrl ? (
          <iframe
            src={iframeUrl}
            title={activity?.title || 'Interactive Game'}
            className="w-full h-full min-h-[650px] border-0"
            allow="fullscreen; autoplay; microphone; camera; midi; encrypted-media"
            allowFullScreen
          />
        ) : content.includes('<') ? (
          <iframe
            srcDoc={content}
            title={activity?.title || 'Interactive Game'}
            className="w-full h-full min-h-[650px] border-0"
            allow="fullscreen; autoplay; microphone; camera; midi; encrypted-media"
            allowFullScreen
          />
        ) : (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-bold">⚠️ Chưa có mã Embed Iframe hoặc Đường link Game!</p>
            <p className="text-xs">Thầy Hải vui lòng bấm nút "✏️ Mở Khung Soạn Thảo" và dán mã Embed hoặc link Wordwall / Quizizz vào nhé.</p>
          </div>
        )}
      </div>
    </div>
  );
}

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
    return <LoadingSpinner text="Đang nạp bài học..." />;
  }

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' };
  const userIsTeacher = isTeacher || profile?.is_teacher || false;

  const searchParams = new URLSearchParams(window.location.search);
  const isReviewMode = searchParams.get('review') === 'true' || searchParams.has('submissionId') || searchParams.has('studentId');
  const isExplicitStudentView = searchParams.get('student_view') === 'true';

  const isIframeType = activeAct.type === 'iframe';
  const isAudioRecordType = activeAct.type === 'audio_record';

  const showBuilderMode = userIsTeacher && !isReviewMode && !isExplicitStudentView && !isIframeType && !isAudioRecordType;

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
                {isIframeType
                  ? '🎮 GAME TƯƠNG TÁC E-LEARNING'
                  : isAudioRecordType
                  ? '🎙️ BÀI LUYỆN NÓI GHI ÂM'
                  : showBuilderMode
                  ? 'TRÌNH SOẠN ĐỀ THI 20 DẠNG CÂU HỎI'
                  : isReviewMode
                  ? 'TRUY VẾT BÀI LÀM VÀ LỜI GIẢI HỌC SINH'
                  : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {(activeAct?.title || 'Bài Học').replace('[WHITEBOARD]', '').trim()}
              </h1>
            </div>
          </div>
        </div>

        {/* MỞ GIAO DIỆN CHUẨN XÁC THEO LOẠI HOẠT ĐỘNG */}
        {isIframeType ? (
          <IframeGameView activity={activeAct} />
        ) : isAudioRecordType ? (
          <AudioRecordEngine activity={activeAct} />
        ) : showBuilderMode ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}
      </div>
    </div>
  );
}
