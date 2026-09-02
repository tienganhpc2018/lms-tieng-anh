import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Volume2, Award, Download, Save, CheckCircle2, User, FileSpreadsheet } from 'lucide-react';

export default function TeacherAudioGradingModal({ isOpen, onClose, activity }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingState, setGradingState] = useState({});

  const fetchSubmissions = async () => {
    if (!activity?.id) return;
    setLoading(true);
    try {
      let { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('activity_id', activity.id)
        .order('submitted_at', { ascending: false });

      if (error || !data || data.length === 0) {
        const fallbackRes = await supabase
          .from('activity_submissions')
          .select('*')
          .eq('activity_id', activity.id)
          .order('created_at', { ascending: false });
        if (fallbackRes.data) data = fallbackRes.data;
      }

      if (data) {
        setSubmissions(data);
        const initialGrading = {};
        data.forEach((sub) => {
          initialGrading[sub.id] = {
            score: sub.score !== null ? sub.score : (sub.answers?.ai_score ? (sub.answers.ai_score / 10).toFixed(1) : '9.0'),
            feedback: sub.teacher_feedback || 'Em phát âm Tiếng Anh rất tốt!',
          };
        });
        setGradingState(initialGrading);
      }
    } catch (err) {}
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && activity) {
      fetchSubmissions();
    }
  }, [isOpen, activity]);

  const handleSaveGrade = async (subId) => {
    const item = gradingState[subId];
    if (!item) return;

    try {
      await supabase
        .from('activity_submissions')
        .update({
          score: parseFloat(item.score),
          teacher_feedback: item.feedback,
        })
        .eq('id', subId);

      setSubmissions((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, score: parseFloat(item.score), teacher_feedback: item.feedback } : s))
      );

      alert('✅ Đã lưu điểm số và lời nhận xét thành công cho học sinh!');
    } catch (err) {
      alert('Lỗi lưu điểm: ' + err.message);
    }
  };

  // NÂNG CẤP THẦN KỲ: XUẤT BÁO CÁO ĐIỂM BÀI THI / BÀI GHI ÂM RA FILE EXCEL (.CSV) 1-CLICK
  const handleExportExcel = () => {
    if (submissions.length === 0) {
      alert('Chưa có bài nộp nào để xuất file Excel!');
      return;
    }

    let csvContent = '\uFEFF'; // BOM UTF-8 cho Excel đọc tiếng Việt không bị lỗi font
    csvContent += 'STT,Họ và Tên Học Sinh,Tên Bài Học,Thời Gian Nộp,Điểm AI (% Chuẩn),Điểm Giáo Viên,Lời Nhận Xét Của Thầy Hải\n';

    submissions.forEach((sub, idx) => {
      const name = `"${(sub.student_name || 'Học Sinh').replace(/"/g, '""')}"`;
      const actTitle = `"${(activity?.title || 'Bài Học').replace(/"/g, '""')}"`;
      const dateStr = `"${new Date(sub.created_at).toLocaleString('vi-VN')}"`;
      const aiScore = sub.answers?.ai_score ? `${sub.answers.ai_score}%` : 'N/A';
      const score = sub.score !== null ? sub.score : 'Chưa chấm';
      const feedback = `"${(sub.teacher_feedback || sub.answers?.ai_feedback || '').replace(/"/g, '""')}"`;

      csvContent += `${idx + 1},${name},${actTitle},${dateStr},${aiScore},${score},${feedback}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `Bao_Cao_Diem_${activity?.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'LMS'}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 font-sans select-none">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-base">
              🎙️ QỦAN LÝ & CHẤM ĐIỂM BÀI GHI ÂM TIẾNG ANH CỦA HỌC SINH
            </h3>
          </div>
          <div className="flex items-center space-x-3">
            {/* NÚT XUẤT EXCEL THẦN KỲ */}
            <button
              onClick={handleExportExcel}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
              title="Tải file Excel danh sách điểm về máy tính"
            >
              <FileSpreadsheet className="w-4 h-4 text-amber-300" />
              <span>📊 XUẤT BÁO CÁO EXCEL (CSV)</span>
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-extrabold text-sm">
              ✕
            </button>
          </div>
        </div>

        {/* CƠ SỞ BÀI NỘP */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Bài học: <span className="text-emerald-800 uppercase">{activity?.title}</span></span>
            <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg">Tổng số bài nộp: {submissions.length} học sinh</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">Đang tải danh sách bài ghi âm...</div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl space-y-2">
              <p className="text-xs text-slate-400 font-bold">Chưa có học sinh nào nộp bài ghi âm cho bài học này.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub, idx) => {
                const audioUrl = sub.answers?.audio_url;
                const aiScore = sub.answers?.ai_score;
                const aiTranscript = sub.answers?.ai_transcript;
                const currentGrade = gradingState[sub.id] || { score: '', feedback: '' };

                return (
                  <div key={sub.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-extrabold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm flex items-center space-x-2">
                            <span>{sub.student_name || 'Học Sinh'}</span>
                            {aiScore && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-[10px] font-black rounded-md">
                                🎯 AI: {aiScore}% Chuẩn
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] text-slate-400">
                            📅 Nộp lúc: {new Date(sub.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {audioUrl && (
                        <div className="w-full sm:w-72">
                          <audio src={audioUrl} controls className="w-full h-9 rounded-xl" />
                        </div>
                      )}
                    </div>

                    {/* VĂN BẢN GIỌNG NÓI AI NHẬN DIỆN NẾU CÓ */}
                    {aiTranscript && (
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px]">
                        <span className="font-bold text-slate-500">💬 Văn bản AI nhận diện:</span>
                        <p className="italic text-slate-800 font-semibold mt-0.5">"{aiTranscript}"</p>
                      </div>
                    )}

                    {/* FORM NHẬP ĐIỂM THẦY HẢI */}
                    <div className="flex flex-col sm:flex-row items-end gap-3 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100">
                      <div className="w-full sm:w-28">
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">ĐIỂM SỐ (0-10)</label>
                        <input
                          type="number"
                          step="0.1"
                          max="10"
                          min="0"
                          value={currentGrade.score}
                          onChange={(e) =>
                            setGradingState({
                              ...gradingState,
                              [sub.id]: { ...currentGrade, score: e.target.value },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <label className="block text-[10px] font-extrabold text-slate-700 uppercase mb-1">LỜI NHẬN XÉT CỦA THẦY HẢI</label>
                        <input
                          type="text"
                          value={currentGrade.feedback}
                          onChange={(e) =>
                            setGradingState({
                              ...gradingState,
                              [sub.id]: { ...currentGrade, feedback: e.target.value },
                            })
                          }
                          placeholder="Nhập nhận xét dặn dò học sinh..."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-500 text-slate-900 bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSaveGrade(sub.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center space-x-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Lưu Điểm</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
