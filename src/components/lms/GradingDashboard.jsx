import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle, Download, Award, MessageSquare, ZoomIn, ZoomOut, RotateCw, ExternalLink, Bot, Sparkles, User, RefreshCw, FileSpreadsheet, Eye } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { exportClassExcelReport } from '../../utils/exportQuizReport';

export default function GradingDashboard({ activityId, activityTitle }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  // Form chấm điểm
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  // Trình xem ảnh tự luận
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationDegree, setRotationDegree] = useState(0);

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

  const handleSelectSub = (sub) => {
    setSelectedSub(sub);
    setScore(sub.score !== undefined && sub.score !== null ? sub.score : '');
    setFeedback(sub.feedback || sub.answers_data?.aiGrading?.detailedFeedback || '');
    setZoomLevel(1);
    setRotationDegree(0);
  };

  const handleGradeSubmit = async (e) => {
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
      alert('Lỗi khi lưu điểm: ' + error.message);
    } else {
      alert('🎉 Đã cập nhật nhận xét & chấm điểm thành công!');
      await fetchSubmissions();
    }
    setSaving(false);
  };

  const handleApplyAiFeedback = () => {
    const aiData = selectedSub?.answers_data?.aiGrading;
    if (!aiData) return;
    if (aiData.overallScore !== undefined) setScore(aiData.overallScore);
    if (aiData.detailedFeedback) setFeedback(aiData.detailedFeedback);
  };

  if (loading) return <LoadingSpinner text="Đang tải danh sách bài làm của học sinh..." />;

  // Tìm tất cả ảnh tự luận từ answers_data
  const uploadedImages = selectedSub?.answers_data?.uploadedStudentImages
    ? Object.values(selectedSub.answers_data.uploadedStudentImages)
    : [];

  const aiGrading = selectedSub?.answers_data?.aiGrading;

  return (
    <div className="space-y-4">
      {/* THANH THỦ THUẬT & XUẤT BÁO CÁO EXCEL */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-900 text-white p-4 rounded-2xl shadow-md gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>GIAO DIỆN GIÁM THỊ: CHẤM BÀI TỰ LUẬN TRỰC QUAN</span>
          </h3>
          <p className="text-[11px] text-slate-300">Bài kiểm tra: {activityTitle || 'Quiz / Writing Test'}</p>
        </div>

        <button
          onClick={() => exportClassExcelReport(submissions, activityTitle)}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>Xuất Bảng Điểm Cả Lớp (Excel/CSV)</span>
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="p-8 text-center bg-white border border-dashed rounded-2xl space-y-2">
          <p className="text-xs text-slate-500 font-medium italic">Chưa có học sinh nào nộp bài thi này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* CỘT 1: DANH SÁCH HỌC SINH NỘP BÀI */}
          <div className="space-y-2 lg:col-span-1">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between px-1">
              <span>Danh Sách Học Sinh ({submissions.length})</span>
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:rotate-180 transition" onClick={fetchSubmissions} />
            </h4>

            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {submissions.map((sub) => {
                const isSelected = selectedSub?.id === sub.id;
                const hasAiScore = sub.answers_data?.aiGrading?.overallScore !== undefined;

                return (
                  <div
                    key={sub.id}
                    onClick={() => handleSelectSub(sub)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition space-y-1.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-900 flex items-center space-x-1">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{sub.profiles?.full_name || 'Học Viên'}</span>
                        </h5>
                        <p className="text-[10px] text-slate-500">{sub.profiles?.email}</p>
                      </div>

                      {sub.status === 'graded' ? (
                        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-300 text-emerald-800 font-extrabold text-[10px] rounded-full">
                          {sub.score} điểm
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-100 border border-amber-300 text-amber-800 font-extrabold text-[10px] rounded-full">
                          Chờ duyệt
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-1">
                      <span>{new Date(sub.submitted_at || Date.now()).toLocaleString('vi-VN')}</span>
                      {hasAiScore && (
                        <span className="text-purple-600 font-bold flex items-center space-x-0.5">
                          <Bot className="w-3 h-3 text-purple-600" />
                          <span>AI Chấm</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT 2 & 3: KHU VỰC SOI BÀI TỰ LUẬN VÀ CHẤM ĐIỂM */}
          {selectedSub ? (
            <div className="lg:col-span-2 space-y-4">
              {/* PHẦN 1: BÀI LÀM TỰ LUẬN CỦA HỌC SINH (TEXT + ẢNH CHỤP TAY) */}
              <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    📝 Bài Làm Tự Luận: {selectedSub.profiles?.full_name}
                  </h4>
                  <span className="text-[10px] text-slate-400">ID Nộp bài: {selectedSub.id?.substring(0, 8)}</span>
                </div>

                {/* SOI ẢNH CHỤP TAY NẾU CÓ */}
                {uploadedImages.length > 0 ? (
                  <div className="space-y-2 bg-slate-900 p-3 rounded-2xl">
                    <div className="flex justify-between items-center text-white text-xs">
                      <span className="font-bold text-amber-400 flex items-center space-x-1">
                        <Eye className="w-4 h-4 text-amber-400" />
                        <span>Ảnh Bài Làm Chụp Tay ({uploadedImages.length} ảnh):</span>
                      </span>

                      {/* Công cụ phóng to / xoay ảnh */}
                      <div className="flex items-center space-x-1.5 bg-slate-800 px-2 py-1 rounded-xl border border-slate-700">
                        <button
                          onClick={() => setZoomLevel((prev) => Math.min(prev + 0.25, 3))}
                          className="p-1 hover:bg-slate-700 rounded text-slate-200"
                          title="Phóng to"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-bold text-slate-400">{Math.round(zoomLevel * 100)}%</span>
                        <button
                          onClick={() => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))}
                          className="p-1 hover:bg-slate-700 rounded text-slate-200"
                          title="Thu nhỏ"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRotationDegree((prev) => (prev + 90) % 360)}
                          className="p-1 hover:bg-slate-700 rounded text-slate-200 ml-1 border-l border-slate-700 pl-2"
                          title="Xoay ảnh 90°"
                        >
                          <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-auto max-h-96 text-center p-2 border border-slate-800 rounded-xl bg-slate-950/80">
                      {uploadedImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="inline-block relative">
                          <img
                            src={imgUrl}
                            alt={`Bài làm học sinh ${imgIdx + 1}`}
                            style={{
                              transform: `scale(${zoomLevel}) rotate(${rotationDegree}deg)`,
                              transition: 'transform 0.2s ease-in-out',
                            }}
                            className="max-w-full rounded-lg shadow-lg border border-slate-800 my-2"
                          />
                          <a
                            href={imgUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black text-white rounded-lg text-[10px] font-bold flex items-center space-x-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Mở ảnh gốc</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    Học sinh không gửi kèm ảnh chụp bài viết tay.
                  </p>
                )}

                {/* VĂN BẢN HỌC SINH GÕ TRỰC TIẾP */}
                {selectedSub.answers_data?.userAnswers && (
                  <div className="space-y-1 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
                    <span className="font-extrabold text-slate-800 block">Văn bản bài nộp gõ trực tiếp:</span>
                    <div className="space-y-1 font-serif text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                      {Object.entries(selectedSub.answers_data.userAnswers).map(([k, v]) => {
                        if (typeof v === 'string' && v.trim() !== '' && isNaN(v)) {
                          return (
                            <p key={k} className="p-2 bg-white rounded-xl border border-slate-200">
                              {v}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* PHẦN 2: ĐÁNH GIÁ VÀ NHẬN XẾT CỦA AI CÙNG FORM GIÁO VIÊN CHẤM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* CỘT AI ĐÁNH GIÁ */}
                {aiGrading && (
                  <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white p-4 rounded-3xl space-y-3 border border-purple-800 shadow-md">
                    <div className="flex justify-between items-center border-b border-purple-800/80 pb-2">
                      <h5 className="font-extrabold text-xs text-purple-300 uppercase flex items-center space-x-1.5">
                        <Bot className="w-4 h-4 text-purple-400" />
                        <span>🤖 AI AGENT ĐÁNH GIÁ BÀI</span>
                      </h5>
                      <button
                        onClick={handleApplyAiFeedback}
                        className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-extrabold rounded-lg transition shadow-xs flex items-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 text-amber-300" />
                        <span>Dùng Nhận Xét AI</span>
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center p-2 bg-purple-900/60 rounded-xl border border-purple-700/50">
                        <span className="font-bold text-slate-300">Điểm AI Gợi Ý:</span>
                        <span className="text-base font-extrabold text-amber-400">{aiGrading.overallScore} / 10 điểm</span>
                      </div>

                      {aiGrading.criteriaScores && (
                        <div className="space-y-1 text-[11px]">
                          {Object.entries(aiGrading.criteriaScores).map(([ck, cv]) => (
                            <div key={ck} className="p-1.5 bg-purple-950/70 rounded-lg text-purple-200">
                              • <strong className="text-purple-300">{ck}:</strong> {cv}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2.5 bg-purple-950/90 rounded-xl border border-purple-800/80 leading-relaxed text-[11px] text-slate-200 max-h-36 overflow-y-auto">
                        <span className="font-bold text-amber-300 block mb-1">Nhận xét chi tiết:</span>
                        {aiGrading.detailedFeedback}
                      </div>
                    </div>
                  </div>
                )}

                {/* FORM GIÁO VIÊN NHẬP ĐIỂM THỦ CÔNG */}
                <form
                  onSubmit={handleGradeSubmit}
                  className={`bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 ${
                    !aiGrading ? 'md:col-span-2' : ''
                  }`}
                >
                  <h5 className="font-extrabold text-xs text-slate-900 uppercase border-b border-slate-100 pb-2 flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <span>LỜI PHÊ & CHẤM ĐIỂM CỦA GIÁO VIÊN</span>
                  </h5>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Điểm Số Thỏa Đáng (Thang điểm 10) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      required
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-sm font-extrabold text-indigo-900 bg-indigo-50/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Lời Nhận Xét & Phản Hồi Cho Học Sinh *
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Gõ lời phê, góp ý sửa lỗi cho học sinh..."
                      className="w-full p-2.5 border border-slate-300 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>{saving ? 'Đang lưu điểm...' : 'Lưu Điểm & Gửi Lời Phê Cho Học Sinh'}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
              <Award className="w-10 h-10 text-slate-300" />
              <span className="font-extrabold text-slate-600">Vui lòng chọn một học sinh ở danh sách bên trái để chấm bài.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
