import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle, Download, Award, MessageSquare } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AssignmentGrade({ activityId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('submissions')
      .select('*, profiles:student_id (full_name, email)')
      .eq('activity_id', activityId)
      .order('submitted_at', { ascending: false });

    if (!error) {
      setSubmissions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activityId) fetchSubmissions();
  }, [activityId]);

  const handleGrade = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSaving(true);

    const { error } = await supabase
      .from('submissions')
      .update({
        score: parseFloat(score) || 0,
        feedback: feedback,
        status: 'graded',
        graded_at: new Date().toISOString(),
      })
      .eq('id', selectedSub.id);

    if (error) {
      alert('Lỗi lưu điểm: ' + error.message);
    } else {
      alert('Đã chấm điểm thành công!');
      setSelectedSub(null);
      await fetchSubmissions();
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner text="Đang lấy danh sách bài nộp của học sinh..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
        <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>Danh Sách Nộp Bài ({submissions.length})</span>
        </h3>
      </div>

      {submissions.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-8 italic border border-dashed rounded-xl">
          Chưa có học sinh nào nộp bài tập này.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* List danh sách bài nộp */}
          <div className="space-y-2">
            {submissions.map((sub) => {
              const isSelected = selectedSub?.id === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSub(sub);
                    setScore(sub.score || '');
                    setFeedback(sub.feedback || '');
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {sub.profiles?.full_name || 'Học sinh'}
                      </h4>
                      <p className="text-xs text-slate-500">{sub.profiles?.email}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Nộp lúc: {new Date(sub.submitted_at).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      {sub.status === 'graded' ? (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                          {sub.score} / 10 điểm
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold text-xs rounded-full">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form Chấm Điểm & Phản Hồi */}
          {selectedSub ? (
            <form onSubmit={handleGrade} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">
                Chấm Bài: {selectedSub.profiles?.full_name}
              </h4>

              {/* Nút Tải File Nộp Bài */}
              {selectedSub.file_url ? (
                <a
                  href={selectedSub.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  <span>Xem / Tải File Bài Làm Của Học Sinh</span>
                </a>
              ) : (
                <p className="text-xs text-slate-400 italic">Học sinh không đính kèm file.</p>
              )}

              {/* Nội dung bài làm text */}
              {selectedSub.answers_data?.textAnswer && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700">
                  <span className="font-bold block mb-1">Văn bản bài nộp:</span>
                  {selectedSub.answers_data.textAnswer}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nhập Điểm Số (Thang điểm 10) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nhận Xét & Phản Hồi (Feedback)
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Nhập lời nhận xét góp ý cho học sinh..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition"
              >
                Lưu Nhận Xét & Chấm Điểm
              </button>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center">
              <Award className="w-8 h-8 text-slate-300 mb-2" />
              <span>Chọn một học sinh ở danh sách bên trái để chấm điểm.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
