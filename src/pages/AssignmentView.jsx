import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import QuizBuilder from '../components/lms/QuizBuilder';
import QuizEngine from '../components/lms/QuizEngine';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { FileText, Upload, Send, ArrowLeft, CheckCircle, Clock, BookOpen, PenTool } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AssignmentView() {
  const params = useParams();
  const targetActivityId = params.id || params.activityId;
  const { user, isTeacher } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const [textAnswer, setTextAnswer] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // GỢI Ý 2: CHỨC NĂNG ĐẶT MẬT KHẨU PASSCODE TRUY CẬP RIÊNG CHO ĐỀ THI THỬ HỌC KỲ I
  const [inputPasscode, setInputPasscode] = useState('');
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState(false);

  const fetchData = async () => {
    if (!targetActivityId) return;
    setLoading(true);
    try {
      // 1. Chi tiết bài học / Hoạt động Quiz
      const { data: act } = await supabase
        .from('activities')
        .select('*, section:section_id (course_id)')
        .eq('id', targetActivityId)
        .single();

      if (act) {
        setActivity(act);
      } else {
        setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' });
      }

      // 2. Nạp dữ liệu submission nếu có
      if (user) {
        const { data: sub } = await supabase
          .from('submissions')
          .select('*')
          .eq('activity_id', targetActivityId)
          .eq('student_id', user.id)
          .maybeSingle();

        if (sub) {
          setSubmission(sub);
          setTextAnswer(sub.answers_data?.textAnswer || '');
          setFileUrl(sub.file_url || '');
        }
      }
    } catch (e) {
      setActivity({ id: targetActivityId, title: 'Bài Kiểm Tra / Thi Thử', type: 'quiz' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [targetActivityId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLMSFile(file, 'submissions');
      setFileUrl(url);
    } catch (err) {
      alert('Lỗi upload file nộp bài: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!textAnswer.trim() && !fileUrl) {
      alert('Vui lòng nhập nội dung bài làm hoặc tải file đính kèm!');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('submissions').upsert([
        {
          activity_id: targetActivityId,
          student_id: user.id,
          answers_data: { textAnswer: textAnswer },
          file_url: fileUrl,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        alert('Lỗi nộp bài: ' + error.message);
      } else {
        alert('🎉 ĐÃ NỘP BÀI TẬP THÀNH CÔNG!');
        await fetchData();
      }
    } catch (err) {
      alert('Lỗi: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải nội dung bài học & đề thi..." />;

  // XÁC ĐỊNH LOẠI BÀI HỌC
  const isWhiteboard = activity?.type === 'whiteboard' || (activity?.title && activity.title.includes('[WHITEBOARD]'));
  const isPageAssignmentOnly = activity?.type === 'page';

  // NẾU LÀ BÀI WHITEBOARD -> MỞ BẢNG WHITEBOARD
  if (isWhiteboard) {
    navigate(`/whiteboard?activityId=${targetActivityId}`);
    return null;
  }

  // TRẢ VỀ CHUẨN 100% GIAO DIỆN QUIZ 20 DẠNG CÂU HỎI & THI THỬ (ẢNH 1 & ẢNH 2)
  if (!isPageAssignmentOnly) {
    const activeAct = activity || { id: targetActivityId, title: 'Practice Test Thi Thử', type: 'quiz' };
    const requiredPasscode = activeAct.content?.passcode;

    // NẾU BÀI THI CÓ CÀI ĐẶT PASSCODE MẬT KHẨU VÀ HỌC SINH CHƯA MỞ KHÓA (GỢI Ý 2)
    if (requiredPasscode && !isTeacher && !isPasscodeUnlocked) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans select-none">
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-w-md w-full text-center space-y-4 border border-slate-200 animate-scale-up">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-extrabold shadow-sm">
              🔑
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 uppercase">
                YÊU CẦU MẬT KHẨU VÀO THI THỬ
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Bài thi "{activeAct.title?.replace('[WHITEBOARD]', '').trim()}" được Giáo viên đặt mật khẩu bảo mật riêng. Vui lòng nhập passcode do Thầy cung cấp để mở đề!
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputPasscode.trim() === requiredPasscode.trim()) {
                  setIsPasscodeUnlocked(true);
                } else {
                  alert('❌ MẬT KHẨU BÀI THI KHÔNG CHÍNH XÁC!\n\nVui lòng kiểm tra lại mật khẩu do Thầy Hải cung cấp.');
                }
              }}
              className="space-y-3 pt-2"
            >
              <input
                type="text"
                required
                value={inputPasscode}
                onChange={(e) => setInputPasscode(e.target.value)}
                placeholder="Nhập mật khẩu bài thi (VD: THCS2026)..."
                className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-center text-sm font-extrabold uppercase tracking-widest bg-slate-50 focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-2xl shadow-md transition"
              >
                🔓 MỞ ĐỀ & BẮT ĐẦU LÀM BÀI THI
              </button>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* HEADER NAV */}
          <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-slate-100 rounded-2xl transition text-slate-700 flex items-center space-x-2 font-bold text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại bài học</span>
              </button>
              <div>
                <span className="text-[10px] font-extrabold text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-md">
                  {isTeacher ? 'Trình Soạn Đề Thi 20 Dạng Câu Hỏi' : 'ĐỀ THI THỬ TRỰC TUYẾN'}
                </span>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                  {activeAct.title.replace('[WHITEBOARD]', '').trim()}
                </h1>
              </div>
            </div>

            {isTeacher && (
              <span className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-2xs">
                👑 Chế Độ Giáo Viên Soạn Đề
              </span>
            )}
          </div>

          {/* NẾU LÀ GIÁO VIÊN -> MỞ TRÌNH SOẠN ĐỀ QUIZ 20 DẠNG CÂU HỎI (QUIZ BUILDER) */}
          {isTeacher ? (
            <QuizBuilder activity={activeAct} activityId={targetActivityId} />
          ) : (
            /* NẾU LÀ HỌC SINH -> MỞ TRÌNH LÀM BÀI THI THỬ TRỰC TUYẾN (QUIZ ENGINE) */
            <QuizEngine activity={activeAct} activityId={targetActivityId} />
          )}
        </div>
      </div>
    );
  }

  // GIAO DIỆN BÀI TẬP TỰ LUẬN NỘP FILE DÀNH DỰ PHÒNG CHO BÀI CHỈ LÀ TRANG VĂN BẢN
  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8 font-sans select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại bài học</span>
        </button>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900">{activity?.title || 'Bài Tập Tự Luận'}</h2>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <h3 className="text-xs font-extrabold text-slate-700 uppercase mb-1">ĐỀ BÀI & YÊU CẦU</h3>
            <p className="text-sm text-slate-800 leading-relaxed font-semibold">
              Làm bài và tải file nộp bài bên dưới.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitAssignment} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900">Bài Làm Của Bạn</h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">NỘI DUNG BÀI LÀM (NHẬP VĂN BẢN)</label>
            <textarea
              rows={5}
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Nhập nội dung trả lời bài tập..."
              className="w-full p-3 border border-slate-300 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">TẢI FILE BÀI LÀM (.PDF, .DOCX, .ZIP, .PNG)</label>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                onChange={handleFileUpload}
                className="text-xs font-semibold text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              {uploading && <span className="text-xs text-amber-600 font-bold animate-pulse">Đang tải file...</span>}
            </div>
            {fileUrl && (
              <a href={fileUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-sky-600 underline mt-2 block">
                📎 File đã tải lên thành công (Bấm để xem)
              </a>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              {submitting ? 'Đang Nộp Bài...' : '🚀 NỘP BÀI TẬP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
