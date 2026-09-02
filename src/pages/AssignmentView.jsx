import { isWhiteboardAct, isAudioRecordAct, isInteractiveVideoAct, isDictationAct, isWorksheetAct, isVocabularyAct, getCleanTitle } from '../utils/activityTypeHelpers';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Gamepad2, BarChart2 } from 'lucide-react';
import QuizEngine from '../components/lms/QuizEngine';
import QuizBuilder from '../components/lms/QuizBuilder';
import AudioRecordEngine from '../components/lms/AudioRecordEngine';
import DictationEngine from '../components/lms/DictationEngine';
import WorksheetEngine from '../components/lms/WorksheetEngine';
import VocabularyEngine from '../components/lms/VocabularyEngine';
import InteractiveVideoPlayer from '../components/lms/InteractiveVideoPlayer';
import InteractiveVideoStudio from '../components/lms/InteractiveVideoStudio';
import TeacherAudioGradingModal from '../components/lms/TeacherAudioGradingModal';
import GradingDashboard from '../components/lms/GradingDashboard';
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
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [isStudentPreviewMode, setIsStudentPreviewMode] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!targetActivityId) return;
      setLoading(true);
      try {
        const { data: act } = await supabase
          .from('activities')
          .select('*, section:section_id (course_id)')
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

  const handleSaveInteractiveVideo = async (videoData) => {
    try {
      const updatedSettings = {
        ...(activity?.settings || {}),
        videoUrl: videoData.videoUrl,
        waypoints: videoData.interactions?.map((item) => ({
          id: item.id || ('wp_' + Date.now()),
          timeSec: Number(item.timestamp),
          type: item.type || 'multiple_choice',
          question: item.question,
          options: item.options || [],
          answer: item.options ? item.options[item.correctIndex] || item.options[0] : '',
          textWithBlanks: item.textWithBlanks || '',
        })),
      };

      const { data, error } = await supabase
        .from('activities')
        .update({
          title: videoData.title ? `[INTERACTIVE_VIDEO] ${videoData.title.replace('[INTERACTIVE_VIDEO]', '').replace('[WHITEBOARD]', '').replace('[DICTATION]', '').trim()}` : activity.title,
          content_url: videoData.videoUrl,
          settings: updatedSettings,
        })
        .eq('id', targetActivityId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActivity(data);
        alert('✓ Đã lưu bài giảng Video Tương Tác thành công!');
      }
    } catch (err) {
      alert('❌ Lỗi lưu cài đặt Video Tương Tác: ' + err.message);
    }
  };

  const handleSaveDictationSettings = async (dictationSettings) => {
    try {
      const updatedSettings = {
        ...(activity?.settings || {}),
        title: dictationSettings.title,
        description: dictationSettings.description,
        samples: dictationSettings.samples,
      };

      const { data, error } = await supabase
        .from('activities')
        .update({
          title: dictationSettings.title ? `[DICTATION] ${dictationSettings.title.replace('[DICTATION]', '').replace('[INTERACTIVE_VIDEO]', '').replace('[WHITEBOARD]', '').trim()}` : activity.title,
          settings: updatedSettings,
        })
        .eq('id', targetActivityId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActivity(data);
        alert('✓ Đã lưu cài đặt Bài Tập Dictation (Nghe Chép Chính Tả) thành công!');
      }
    } catch (err) {
      alert('❌ Lỗi lưu bài Dictation: ' + err.message);
    }
  };

  const handleSaveAudioRecordSettings = async (audioSettings) => {
    try {
      const updatedSettings = {
        ...(activity?.settings || {}),
        taskDescription: audioSettings.taskDescription,
      };

      // Bảo vệ tiêu đề ngắn gốc mà Thầy đã đặt
      const cleanNewTitle = audioSettings.title ? audioSettings.title.replace('[AUDIO_RECORD]', '').replace('[WHITEBOARD]', '').trim() : '';
      const finalTitle = cleanNewTitle && cleanNewTitle !== (activity?.settings?.taskDescription || '')
        ? `[AUDIO_RECORD] ${cleanNewTitle}`
        : activity.title;

      const { data, error } = await supabase
        .from('activities')
        .update({
          title: finalTitle,
          content: audioSettings.taskDescription || activity.content,
          settings: updatedSettings,
        })
        .eq('id', targetActivityId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActivity(data);
        alert('✓ Đã lưu cài đặt Bài Luyện Nói H5P Audio Recorder thành công!');
      }
    } catch (err) {
      alert('❌ Lỗi lưu bài Audio Recorder: ' + err.message);
    }
  };

  const handleSaveWorksheetSettings = async (worksheetSettings) => {
    try {
      const updatedSettings = {
        ...(activity?.settings || {}),
        title: worksheetSettings.title,
        description: worksheetSettings.description,
        tasks: worksheetSettings.tasks,
        customType: 'worksheet',
      };

      const cleanNewTitle = worksheetSettings.title ? getCleanTitle(worksheetSettings.title) : '';
      const finalTitle = cleanNewTitle || activity.title;

      const { data, error } = await supabase
        .from('activities')
        .update({
          title: finalTitle,
          content: worksheetSettings.description || activity.content,
          settings: updatedSettings,
        })
        .eq('id', targetActivityId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActivity(data);
        alert('✓ Đã lưu cài đặt Tập Bài Tập Worksheet thành công!');
      }
    } catch (err) {
      alert('❌ Lỗi lưu bài Worksheet: ' + err.message);
    }
  };

  const handleSaveVocabularySettings = async (vocabSettings) => {
    try {
      const updatedSettings = {
        ...(activity?.settings || {}),
        vocabularyList: vocabSettings.vocabularyList,
      };

      const { data, error } = await supabase
        .from('activities')
        .update({
          settings: updatedSettings,
        })
        .eq('id', targetActivityId)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setActivity(data);
        // Silent default alert when auto-saving vocabulary settings
        console.log('Saved vocab settings to DB');
      }
    } catch (err) {
      alert('❌ Lỗi lưu từ vựng: ' + err.message);
    }
  };

  const activeAct = activity || { id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử Online', type: 'quiz' };
  const userEmail = (user?.email || profile?.email || '').toLowerCase();
  const isMasterTeacherEmail = userEmail.includes('nguyensea') || userEmail.includes('nguyenvanhai') || userEmail.includes('tienganhpc2018');
  const userIsTeacher = (isTeacher || profile?.is_teacher || profile?.role === 'teacher' || profile?.role === 'admin') && isMasterTeacherEmail;

  const searchParams = new URLSearchParams(window.location.search);
  const isReviewMode = searchParams.get('review') === 'true' || searchParams.has('submissionId') || searchParams.has('studentId');
  const isExplicitStudentView = searchParams.get('student_view') === 'true';

  const handleGoBack = () => {
    const courseId = activeAct?.section?.course_id;
    if (courseId) {
      navigate(`/course/${courseId}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  };

  const isIframeType = activeAct.type === 'iframe';
  const isAudioRecordType = isAudioRecordAct(activeAct);
  const isInteractiveVideoType = isInteractiveVideoAct(activeAct);
  const isDictationType = isDictationAct(activeAct);
  const isWorksheetType = isWorksheetAct(activeAct);
  const isVocabularyType = isVocabularyAct(activeAct);

  const showBuilderMode = userIsTeacher && !isReviewMode && !isExplicitStudentView && !isIframeType && !isAudioRecordType && !isInteractiveVideoType && !isDictationType && !isWorksheetType && !isVocabularyType;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm gap-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleGoBack}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-2xl transition text-slate-800 flex items-center space-x-2 font-extrabold text-xs cursor-pointer shadow-2xs border border-slate-300"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span>← Quay lại Khóa Học</span>
            </button>
            <div>
              <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                {isVocabularyType
                  ? '📚 TỪ VỰNG TƯƠNG TÁC (GLOSSARY H5P)'
                  : isIframeType
                  ? '🎮 GAME TƯƠNG TÁC E-LEARNING'
                  : isWorksheetType
                  ? '📑 WORKSHEET (TẬP BÀI TẬP TỔNG HỢP H5P)'
                  : isDictationType
                  ? '🎧 BÀI TẬP DICTATION (NGHE CHÉP CHÍNH TẢ H5P)'
                  : isAudioRecordType
                  ? '🎙️ BÀI LUYỆN NÓI GHI ÂM'
                  : isInteractiveVideoType
                  ? '🎥 VIDEO TƯƠNG TÁC H5P TỰ ĐỘNG DỪNG CÂU HỎI'
                  : showBuilderMode
                  ? 'TRÌNH SOẠN ĐỀ THI 20 DẠNG CÂU HỎI'
                  : isReviewMode
                  ? 'TRUY VẾT BÀI LÀM VÀ LỜI GIẢI HỌC SINH'
                  : 'ĐỀ THI THỬ TRỰC TUYẾN'}
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                {getCleanTitle(activeAct?.title || 'Bài Học')}
              </h1>
            </div>
          </div>

          {userIsTeacher && (
            <div className="flex flex-wrap items-center space-x-2 self-end sm:self-center gap-2">
              <button
                type="button"
                onClick={() => setIsGradingModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center space-x-1.5 border border-indigo-700 active:scale-95"
              >
                <BarChart2 className="w-4 h-4 text-amber-300" />
                <span>📊 Bảng Chấm Điểm & Quản Lý Bài Nộp</span>
              </button>

              {isInteractiveVideoType && (
                <button
                  type="button"
                  onClick={() => setIsStudentPreviewMode(!isStudentPreviewMode)}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-sm transition cursor-pointer border border-amber-600 flex items-center space-x-1.5"
                >
                  <span>{isStudentPreviewMode ? '✏️ Mở Khung Soạn Thảo H5P Studio' : '👁️ Xem Thử Trải Nghiệm Học Sinh'}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* MỞ GIAO DIỆN CHUẨN XÁC THEO LOẠI HOẠT ĐỘNG */}
        {isVocabularyType ? (
          <VocabularyEngine activity={activeAct} isTeacher={userIsTeacher} onSaveActivity={handleSaveVocabularySettings} />
        ) : isIframeType ? (
          <IframeGameView activity={activeAct} />
        ) : isWorksheetType ? (
          <WorksheetEngine activity={activeAct} isTeacher={userIsTeacher} onSaveActivity={handleSaveWorksheetSettings} />
        ) : isDictationType ? (
          <DictationEngine activity={activeAct} isTeacher={userIsTeacher} onSaveActivity={handleSaveDictationSettings} />
        ) : isAudioRecordType ? (
          <AudioRecordEngine activity={activeAct} isTeacher={userIsTeacher} onSaveActivity={handleSaveAudioRecordSettings} />
        ) : isInteractiveVideoType ? (
          userIsTeacher && !isReviewMode && !isExplicitStudentView && !isStudentPreviewMode ? (
            <InteractiveVideoStudio
              initialSettings={{
                title: getCleanTitle(activeAct?.title || ''),
                videoUrl: activeAct?.settings?.videoUrl || activeAct?.content_url || activeAct?.content || '',
                interactions: (activeAct?.settings?.waypoints || []).map((w) => ({
                  id: w.id || ('int_' + w.timeSec),
                  timestamp: w.timeSec,
                  type: w.type || 'multiple_choice',
                  question: w.question,
                  options: w.options || [],
                  correctIndex: (w.options || []).indexOf(w.answer) >= 0 ? (w.options || []).indexOf(w.answer) : 0,
                  textWithBlanks: w.textWithBlanks || '',
                })),
              }}
              onSave={handleSaveInteractiveVideo}
            />
          ) : (
            <InteractiveVideoPlayer activity={activeAct} isTeacher={userIsTeacher} />
          )
        ) : showBuilderMode ? (
          <QuizBuilder activity={activeAct} activityId={targetActivityId} />
        ) : (
          <QuizEngine activity={activeAct} activityId={targetActivityId} />
        )}

        {/* MODAL BẢNG CHẤM ĐIỂM CHUNG CHO GIÁO VIÊN */}
        {isGradingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-900/80 p-4 pt-16 sm:pt-20 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 max-w-5xl w-full space-y-4 max-h-[85vh] overflow-y-auto relative shadow-2xl animate-scale-up my-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <span>📊 BẢNG CHẤM ĐIỂM & QUẢN LÝ BÀI NỘP CỦA HỌC SINH</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGradingModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 font-extrabold text-lg px-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {isAudioRecordType ? (
                <TeacherAudioGradingModal
                  isOpen={true}
                  onClose={() => setIsGradingModalOpen(false)}
                  activity={activeAct}
                />
              ) : (
                <GradingDashboard activityId={targetActivityId} activityTitle={activeAct?.title} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
