import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase, uploadLMSFile } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { FileText, Upload, Send, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function AssignmentView() {
  const { activityId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);

  const [textAnswer, setTextAnswer] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    // 1. Activity detail
    const { data: act } = await supabase
      .from('activities')
      .select('*')
      .eq('id', activityId)
      .single();

    setActivity(act);

    // 2. Existing submission
    if (user) {
      const { data: sub } = await supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activityId)
        .eq('student_id', user.id)
        .maybeSingle();

      if (sub) {
        setSubmission(sub);
        setTextAnswer(sub.answers_data?.textAnswer || '');
        setFileUrl(sub.file_url || '');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activityId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!textAnswer.trim() && !fileUrl) {
      alert('Vui lòng nhập nội dung bài làm hoặc tải file đính kèm!');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('submissions').upsert([
      {
        activity_id: activityId,
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
      alert('Đã nộp bài tập thành công!');
      await fetchData();
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner text="Đang chuẩn bị trang nộp bài tập..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại bài học</span>
      </button>

      {/* Header Đề Bài */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{activity?.title}</h1>
            {activity?.settings?.deadline && (
              <span className="inline-flex items-center space-x-1 text-xs text-rose-600 font-semibold mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Hạn nộp: {new Date(activity.settings.deadline).toLocaleString('vi-VN')}</span>
              </span>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đề Bài & Yêu Cầu</h4>
          <div
            className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200"
            dangerouslySetInnerHTML={{ __html: activity?.settings?.richText || 'Làm bài và tải file nộp bài bên dưới.' }}
          />
        </div>
      </div>

      {/* Kết Quả Điểm Số & Phản Hồi Từ Giáo Viên (Nếu Đã Chấm) */}
      {submission?.status === 'graded' && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>Bài tập đã được chấm điểm!</span>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {submission.score} <span className="text-xs font-semibold text-slate-600">/ 10 điểm</span>
          </div>
          {submission.feedback && (
            <div className="mt-3 p-3 bg-white border border-emerald-200 rounded-xl text-xs text-slate-700">
              <strong className="block text-slate-900 mb-1">Nhận xét từ Giáo viên:</strong>
              {submission.feedback}
            </div>
          )}
        </div>
      )}

      {/* Form Nộp Bài Tập */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-3">Bài Làm Của Bạn</h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Nội dung bài làm (Nhập văn bản)
          </label>
          <textarea
            rows={5}
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="Nhập nội dung trả lời bài tập..."
            className="w-full p-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Tải File Bài Làm (.pdf, .docx, .zip, .png)
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="file"
              onChange={handleFileUpload}
              className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
            {uploading && <span className="text-xs text-blue-600 font-medium">Đang tải file...</span>}
          </div>
          {fileUrl && (
            <p className="text-xs text-emerald-600 mt-2 truncate font-semibold">
              ✓ Đã đính kèm: {fileUrl}
            </p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || uploading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{submission ? 'Cập Nhật Bài Nộp' : 'Nộp Bài Tập'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
