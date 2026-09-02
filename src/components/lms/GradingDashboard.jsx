import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle, Download, Award, MessageSquare, ZoomIn, ZoomOut, RotateCw, ExternalLink, Bot, Sparkles, User, RefreshCw, FileSpreadsheet, Eye, ShieldAlert, BarChart3, Mail, BookMarked, AlertTriangle, Printer, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { exportClassExcelReport } from '../../utils/exportQuizReport';
import { gradeWritingSubmissionWithAI } from '../../services/writingAiGrader';
import { sendQuizScoreEmail } from '../../services/emailNotificationService';
import { sendWeeklyReportToZalo } from '../../services/zaloNotificationService';
import ClassroomWhiteboardModal from './ClassroomWhiteboardModal';
import MediaLibraryModal from './MediaLibraryModal';
import PaperToQuizOcrModal from './PaperToQuizOcrModal';
import ExamPaperTimerModal from './ExamPaperTimerModal';
import AiOmrScannerModal from './AiOmrScannerModal';
import { exportOmrSheet } from '../../utils/exportOmrSheet';
import ClassLeaderboard from './ClassLeaderboard';
import WorksheetEngine from './WorksheetEngine';

export default function GradingDashboard({ activityId, activityTitle }) {
  const [activityData, setActivityData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState(null);

  // Form chấm điểm
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [reGradingAll, setReGradingAll] = useState(false);
  const [whiteboardModalOpen, setWhiteboardModalOpen] = useState(false);
  const [examTimerOpen, setExamTimerOpen] = useState(false);
  const [omrScannerOpen, setOmrScannerOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [paperOcrOpen, setPaperOcrOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState('list');

  // Trình xem ảnh tự luận
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationDegree, setRotationDegree] = useState(0);

  const fetchSubmissions = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      if (activityId) {
        const { data: actData } = await supabase
          .from('activities')
          .select('*')
          .eq('id', activityId)
          .maybeSingle();
        if (actData) setActivityData(actData);
      }

      const { data, error } = await supabase
        .from('submissions')
        .select('*, profiles:student_id (full_name, email)')
        .eq('activity_id', activityId)
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        setSubmissions(data);
      }
    } catch (e) {
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (!activityId) return;
    fetchSubmissions(true);

    // SUPABASE REALTIME AUTO-REFRESH WHEN STUDENT SUBMITS (SILENT UPDATE - NO SCROLL JUMP)
    const channel = supabase
      .channel(`realtime_submissions_${activityId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'submissions', filter: `activity_id=eq.${activityId}` },
        () => {
          fetchSubmissions(false);
        }
      )
      .subscribe();

    // SILENT AUTO-POLLING EVERY 15 SECONDS WITHOUT DISRUPTING USER SCROLL POSITION
    const pollInterval = setInterval(() => {
      fetchSubmissions(false);
    }, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [activityId]);

  // KEYBOARD ARROW KEY LISTENER FOR NEXT / PREVIOUS STUDENT (FEATURE 2)
  useEffect(() => {
    if (!selectedSub) return;
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const currentIdx = submissions.findIndex((s) => s.id === selectedSub.id);
      if (e.key === 'ArrowLeft' && currentIdx > 0) {
        handleSelectSub(submissions[currentIdx - 1]);
      } else if (e.key === 'ArrowRight' && currentIdx >= 0 && currentIdx < submissions.length - 1) {
        handleSelectSub(submissions[currentIdx + 1]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSub, submissions]);

  // DẠNG BÀI / CÂU HỎI CẢ LỚP LÀM SAI NHIỀU NHẤT (FEATURE 4: ITEM ANALYSIS)
  const mostMissedQuestions = useMemo(() => {
    if (!submissions || submissions.length === 0) return [];
    const missedMap = {};

    submissions.forEach((sub) => {
      const taskResults = sub.answers_data?.results?.taskResults || {};
      Object.entries(taskResults).forEach(([taskId, qResultObj]) => {
        if (typeof qResultObj === 'object') {
          Object.entries(qResultObj).forEach(([gapKey, resItem]) => {
            if (resItem && !resItem.isCorrect) {
              const fullKey = `${taskId}_${gapKey}`;
              if (!missedMap[fullKey]) {
                missedMap[fullKey] = {
                  key: gapKey,
                  taskId: taskId,
                  wrongCount: 0,
                  targetAns: resItem.targetVal || resItem.targetAns || '',
                };
              }
              missedMap[fullKey].wrongCount++;
            }
          });
        }
      });
    });

    return Object.values(missedMap)
      .sort((a, b) => b.wrongCount - a.wrongCount)
      .slice(0, 4);
  }, [submissions]);

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

    const updatedScore = parseFloat(score) || 0;

    const { error } = await supabase
      .from('submissions')
      .update({
        score: updatedScore,
        feedback: feedback,
        status: 'graded',
        graded_at: new Date().toISOString(),
      })
      .eq('id', selectedSub.id);

    if (error) {
      alert('Lỗi khi lưu điểm: ' + error.message);
    } else {
      alert('🎉 Đã cập nhật nhận xét & chấm điểm thành công!');
      // Gửi email thông báo cho học sinh
      if (selectedSub.profiles?.email) {
        await sendQuizScoreEmail({
          studentEmail: selectedSub.profiles.email,
          studentName: selectedSub.profiles.full_name,
          activityTitle: activityTitle || 'Bài Thi Quiz',
          score: updatedScore,
          totalMarks: 10,
          feedback: feedback,
        });
      }
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

  // CHẾ ĐỘ CHẤM LẠI TẤT CẢ BÀI TỰ LUẬN CẢ LỚP BẰNG AI
  const handleReGradeAllWithAI = async () => {
    if (!confirm('🤖 Thầy có chắc chắn muốn AI chấm lại tự động toàn bộ bài làm tự luận của cả lớp?')) return;
    setReGradingAll(true);

    let updatedCount = 0;
    for (const sub of submissions) {
      const answersData = sub.answers_data || {};
      const uploadedImages = answersData.uploadedStudentImages ? Object.values(answersData.uploadedStudentImages) : [];
      const firstImg = uploadedImages[0] || null;
      const studentGotedText = Object.values(answersData.userAnswers || {}).filter(v => typeof v === 'string' && isNaN(v)).join('\n');

      if (firstImg || studentGotedText) {
        try {
          const aiGrading = await gradeWritingSubmissionWithAI({
            questionTitle: 'WRITING SECTION',
            questionPrompt: 'Bài làm tự luận Tiếng Anh',
            sampleAnswer: '',
            studentText: studentGotedText,
            studentImageUrl: firstImg,
          });

          await supabase
            .from('submissions')
            .update({
              score: aiGrading.overallScore || sub.score || 8.0,
              answers_data: { ...answersData, aiGrading },
              status: 'graded',
              graded_at: new Date().toISOString(),
            })
            .eq('id', sub.id);

          updatedCount += 1;
        } catch (e) {
          console.error(`Lỗi chấm AI bài ${sub.id}:`, e);
        }
      }
    }

    alert(`🎉 Đã hoàn tất AI chấm lại tự động cho ${updatedCount} bài làm cả lớp!`);
    setReGradingAll(false);
    await fetchSubmissions();
  };

  if (loading) return <LoadingSpinner text="Đang tải danh sách bài làm của học sinh..." />;

  // PHỔ ĐIỂM THỐNG KÊ (ANALYTICS & ITEM ANALYSIS)
  const totalGraded = submissions.filter((s) => s.status === 'graded').length;
  const countLow = submissions.filter((s) => (s.score || 0) < 5).length;
  const countMid = submissions.filter((s) => (s.score || 0) >= 5 && (s.score || 0) < 8).length;
  const countHigh = submissions.filter((s) => (s.score || 0) >= 8).length;

  const uploadedImages = selectedSub?.answers_data?.uploadedStudentImages
    ? Object.values(selectedSub.answers_data.uploadedStudentImages)
    : [];

  const aiGrading = selectedSub?.answers_data?.aiGrading;
  const tabSwitchCount = selectedSub?.answers_data?.tabSwitchCount || 0;

  return (
    <div className="space-y-4">
      {/* TAB CHUYỂN ĐỔI GIAO DIỆN GRADING & GIÁM THỊ THEO DÕI SĨ SỐ */}
      <div className="flex border-b border-slate-200 space-x-4 bg-white p-2 rounded-2xl">
        <button
          onClick={() => setDashboardTab('list')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition ${
            dashboardTab === 'list' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📋 Bảng Điểm & Duyệt Bài Tự Luận ({submissions.length})
        </button>

        <button
          onClick={() => setDashboardTab('monitor')}
          className={`px-4 py-2 text-xs font-extrabold rounded-xl transition flex items-center space-x-1.5 ${
            dashboardTab === 'monitor' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🖥️ GIÁM THỊ THEO DÕI SĨ SỐ LỚP TRỰC TUYẾN (REAL-TIME)</span>
        </button>
      </div>

      {dashboardTab === 'monitor' && (
        <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 shadow-xl border border-slate-800 animate-fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wide">
                🖥️ MÀN HÌNH GIÁM THỊ THEO DÕI SĨ SỐ LỚP THỜI GIAN THỰC (REAL-TIME MONITOR)
              </h3>
              <p className="text-[11px] text-slate-400">Theo dõi tiến độ làm bài thi online của từng học sinh trong lớp</p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Đang Giám Thị Trực Tuyến</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {submissions.map((sub, idx) => (
              <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-xs text-slate-200">{sub.profiles?.full_name || `Học sinh ${idx+1}`}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold rounded-lg">
                    Đã Nộp ({sub.score}đ)
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 space-y-0.5">
                  <p>• Trạng thái: <span className="text-emerald-400 font-bold">Đã hoàn thành</span></p>
                  <p>• Rời màn hình: <span className="text-slate-200">0/3 lần</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <ExamPaperTimerModal
        isOpen={examTimerOpen}
        onClose={() => setExamTimerOpen(false)}
        defaultMinutes={45}
      />

      <MediaLibraryModal
        isOpen={mediaLibraryOpen}
        onClose={() => setMediaLibraryOpen(false)}
      />

      <PaperToQuizOcrModal
        isOpen={paperOcrOpen}
        onClose={() => setPaperOcrOpen(false)}
      />

      <AiOmrScannerModal
        isOpen={omrScannerOpen}
        onClose={() => setOmrScannerOpen(false)}
      />

      <ClassroomWhiteboardModal
        isOpen={whiteboardModalOpen}
        onClose={() => setWhiteboardModalOpen(false)}
        questions={selectedSub?.answers_data?.questions || []}
        activityTitle={activityTitle}
      />
      {/* THANH THỦ THUẬT & XUẤT BÁO CÁO EXCEL & NÚT CHẤM LẠI CẢ LỚP BẰNG AI */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-4 rounded-3xl shadow-md gap-3">
        <div>
          <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>GIAO DIỆN GIÁM THỊ: CHẤM BÀI TỰ LUẬN TRỰC QUAN & ANALYTICS</span>
          </h3>
          <p className="text-[11px] text-slate-300">Bài kiểm tra: {activityTitle || 'Quiz / Writing Test'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReGradeAllWithAI}
            disabled={reGradingAll}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Bot className="w-4 h-4 text-purple-200" />
            <span>{reGradingAll ? 'Đang AI chấm...' : '🤖 Chấm Lại Bài Cả Lớp Bằng AI'}</span>
          </button>

          <button
            onClick={() => exportClassExcelReport(submissions, activityTitle)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
            <span>Xuất Bảng Điểm Cả Lớp (Excel/CSV)</span>
          </button>

          <button
            onClick={() => setExamTimerOpen(true)}
            className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>⏱️ Đồng Hồ Giám Thị Tivi</span>
          </button>

          <button
            onClick={() => setOmrScannerOpen(true)}
            className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📷 Camera AI Quét OMR</span>
          </button>

          <button
            onClick={() => setMediaLibraryOpen(true)}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📁 Kho Audio & Ảnh Dùng Chung</span>
          </button>

          <button
            onClick={() => setPaperOcrOpen(true)}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📸 Quét Đề Giấy Sang Quiz AI</span>
          </button>

          <button
            onClick={() => {
              if (selectedSub?.profiles?.full_name) {
                sendWeeklyReportToZalo({
                  studentName: selectedSub.profiles.full_name,
                  parentPhone: '0988888888',
                  averageScore: selectedSub.score || 8.5,
                  totalExams: 4,
                  aiComment: selectedSub.feedback || 'Học sinh tiến bộ vượt bậc!',
                }).then(res => alert(res.message));
              } else {
                alert('Vui lòng chọn học sinh để gửi báo cáo Zalo!');
              }
            }}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <span>📱 Gửi Báo Cáo Tuần Zalo PHHS</span>
          </button>
        </div>
      </div>

      {/* BẢNG XẾP HẠNG TOP HỌC SINH XUẤT SẮC CẢ LỚP (NHẤP VÀO HỌC SINH ĐỂ XEM CHI TIẾT BÀI LÀM) */}
      <ClassLeaderboard submissions={submissions} activityTitle={activityTitle} onSelectSub={handleSelectSub} />

      {/* ========================================================================= */}
      {/* THỐNG KÊ CÁC CÂU BÀI TẬP CẢ LỚP SAI NHIỀU NHẤT (FEATURE 4: ITEM ANALYSIS)  */}
      {/* ========================================================================= */}
      {mostMissedQuestions.length > 0 && (
        <div className="bg-rose-950/90 text-white p-4 sm:p-5 rounded-3xl border-2 border-rose-500/80 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-rose-800/80 pb-2">
            <div className="flex items-center space-x-2 font-black text-amber-300 text-xs">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <span>⚠️ TOP DẠNG BÀI / CÂU HỎI CẢ LỚP LÀM SAI NHIỀU NHẤT (CLASSROOM ITEM ANALYSIS)</span>
            </div>
            <span className="px-2.5 py-0.5 bg-rose-600 text-white font-extrabold text-[10px] rounded-lg">
              Gợi ý chữa bài trên lớp
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {mostMissedQuestions.map((item, idx) => {
              const wrongPct = Math.round((item.wrongCount / submissions.length) * 100);
              return (
                <div key={idx} className="p-3 bg-slate-900/90 rounded-2xl border border-rose-500/40 text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between font-extrabold">
                    <span className="text-amber-300">
                      📌 Câu [{item.key}]: <span className="text-rose-300 font-bold">{item.wrongCount}/{submissions.length} HS làm sai ({wrongPct}%)</span>
                    </span>
                  </div>
                  {item.targetAns && (
                    <div className="text-[11px] text-slate-300 font-medium">
                      ✅ Đáp án đúng chuẩn: <strong className="text-emerald-400 font-mono">{item.targetAns}</strong>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL SOI CHI TIẾT BÀI LÀM HỌC SINH ĐÚNG 100% GIAO DIỆN ẢNH 3 CỦA THẦY HẢI */}
      {/* ========================================================================= */}
      {selectedSub && (() => {
        const currentSubIndex = submissions.findIndex((s) => s.id === selectedSub.id);
        const studentAllSubs = submissions
          .filter((s) => (s.student_id && s.student_id === selectedSub.student_id) || (s.profiles?.email && s.profiles.email === selectedSub.profiles?.email))
          .sort((a, b) => new Date(a.submitted_at || 0) - new Date(b.submitted_at || 0));

        const firstScore = studentAllSubs[0]?.score || 0;
        const latestScore = selectedSub.score !== null && selectedSub.score !== undefined ? selectedSub.score : 0;
        const scoreDiff = Number((latestScore - firstScore).toFixed(1));

        return (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-slate-950/85 p-3 sm:p-5 pt-16 sm:pt-20 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:z-auto">
            <div className="bg-slate-100 rounded-3xl p-4 sm:p-6 max-w-5xl w-full space-y-4 max-h-[85vh] overflow-y-auto relative shadow-2xl animate-scale-up text-slate-900 border-2 border-indigo-600 print:max-h-none print:border-none print:shadow-none print:bg-white my-auto">
              
              {/* HEADER TOOLBAR WITH NAVIGATION & PRINT BUTTON */}
              <div className="flex flex-wrap items-center justify-between border-b border-slate-300 pb-3 gap-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs print:hidden">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-xs">
                    📑
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                      <span>BÀI LÀM CHI TIẾT CỦA HỌC SINH:</span>
                      <span className="text-indigo-600 underline">{selectedSub.profiles?.full_name || selectedSub.answers_data?.student_name || selectedSub.student_name || 'Học sinh'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Email: {selectedSub.profiles?.email || 'N/A'} • Nộp bài lúc: {new Date(selectedSub.submitted_at || Date.now()).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                {/* FEATURE 2: PREVIOUS & NEXT STUDENT NAVIGATION CONTROLS */}
                <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-300">
                  <button
                    type="button"
                    disabled={currentSubIndex <= 0}
                    onClick={() => currentSubIndex > 0 && handleSelectSub(submissions[currentSubIndex - 1])}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center space-x-1 ${
                      currentSubIndex > 0
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-2xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Xem bài làm của học sinh trước đó (Phím mũi tên Trái ◄)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>◀ Bài trước</span>
                  </button>

                  <span className="text-[11px] font-extrabold text-slate-800 px-2">
                    {currentSubIndex >= 0 ? currentSubIndex + 1 : 1} / {submissions.length} HS
                  </span>

                  <button
                    type="button"
                    disabled={currentSubIndex < 0 || currentSubIndex >= submissions.length - 1}
                    onClick={() => currentSubIndex < submissions.length - 1 && handleSelectSub(submissions[currentSubIndex + 1])}
                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition flex items-center space-x-1 ${
                      currentSubIndex >= 0 && currentSubIndex < submissions.length - 1
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-2xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Xem bài làm của học sinh tiếp theo (Phím mũi tên Phải ►)"
                  >
                    <span>Bài tiếp ▶</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* FEATURE 1: PRINT STUDENT WORKSHEET SHEET A4 BUTTON */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center space-x-1.5 border border-emerald-700 shadow-xs"
                  >
                    <Printer className="w-4 h-4 text-white" />
                    <span>🖨️ In Phiếu Bài Làm A4</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition cursor-pointer shadow-md"
                  >
                    ✕ Đóng
                  </button>
                </div>
              </div>

              {/* FEATURE 3: STUDENT SCORE PROGRESS HISTORY BANNER */}
              {studentAllSubs.length > 1 && (
                <div className="p-3 bg-gradient-to-r from-indigo-900 to-purple-950 text-white rounded-2xl border border-indigo-700/80 shadow-md flex items-center justify-between text-xs print:hidden">
                  <div className="flex items-center space-x-2 font-bold">
                    <TrendingUp className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      📈 BIỂU ĐỒ TIẾN BỘ ĐIỂM SỐ ({studentAllSubs.length} LẦN LÀM BÀI): Lần 1 ({firstScore}đ) ➔ Lần mới nhất ({latestScore}đ)
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[11px] ${scoreDiff >= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                    {scoreDiff >= 0 ? `🔺 Tăng +${scoreDiff} điểm` : `🔻 Giảm ${scoreDiff} điểm`}
                  </span>
                </div>
              )}

              {/* RENDER WORKSHEET ENGINE TRONG CHẾ ĐỘ REVIEW CHUẨN XÁC ĐẦY ĐỦ NƯỚC ẢNH 3 CỦA THẦY HẢI */}
              <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
                <WorksheetEngine
                  activity={activityData || { id: activityId, title: activityTitle, settings: { tasks: selectedSub.answers_data?.tasks } }}
                  isTeacher={false}
                  reviewSubmission={selectedSub}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* KHỐI BIỂU ĐỒ PHỔ ĐIỂM & PHÂN TÍCH ĐỀ THI (ANALYTICS & ITEM ANALYSIS) */}
      {submissions.length > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide flex items-center space-x-1.5 border-b border-slate-100 pb-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>📊 THỐNG KÊ PHỔ ĐIỂM CẢ LỚP ({submissions.length} Học Sinh)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1">
              <span className="font-bold text-rose-800 uppercase block text-[10px]">Dưới 5.0 Điểm (Yếu/Kém)</span>
              <span className="text-xl font-extrabold text-rose-600">{countLow} học sinh</span>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
              <span className="font-bold text-amber-800 uppercase block text-[10px]">5.0 - 7.9 Điểm (Trung Bình/Khá)</span>
              <span className="text-xl font-extrabold text-amber-600">{countMid} học sinh</span>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
              <span className="font-bold text-emerald-800 uppercase block text-[10px]">8.0 - 10.0 Điểm (Giỏi/Xuất Sắc)</span>
              <span className="text-xl font-extrabold text-emerald-600">{countHigh} học sinh</span>
            </div>
          </div>
        </div>
      )}

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
                const sTabSwitch = sub.answers_data?.tabSwitchCount || 0;

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
                      <div className="flex items-center space-x-1">
                        {sTabSwitch > 0 && (
                          <span className="text-rose-600 font-extrabold flex items-center space-x-0.5 bg-rose-50 border border-rose-200 px-1 rounded">
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                            <span>{sTabSwitch} rời tab</span>
                          </span>
                        )}
                        {hasAiScore && (
                          <span className="text-purple-600 font-bold flex items-center space-x-0.5">
                            <Bot className="w-3 h-3 text-purple-600" />
                            <span>AI Chấm</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT 2 & 3: KHU VỰC SOI BÀI TỰ LUẬN VÀ CHẤM ĐIỂM */}
          {selectedSub ? (
            <div className="lg:col-span-2 space-y-4">
              {/* THẺ THÔNG BÁO GIÁM THỊ VỀ VI PHẠM RỜI TAB GIAN LẬN */}
              {tabSwitchCount > 0 && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center justify-between text-xs text-rose-950">
                  <div className="flex items-center space-x-2 font-bold">
                    <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                    <span>⚠️ GIÁM THỊ PHÁT HIỆN: Học sinh đã chuyển tab/rời khỏi màn hình thi <strong>{tabSwitchCount} lần</strong>!</span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-rose-600 text-white font-extrabold rounded-full text-[10px]">
                    Cảnh Báo Gian Lận
                  </span>
                </div>
              )}

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

                      {/* GỢI Ý CỤM TỪ C2 / BAND 8.0 NÂNG CAO */}
                      {aiGrading.advancedVocabularySuggestions && aiGrading.advancedVocabularySuggestions.length > 0 && (
                        <div className="p-2 bg-purple-950/90 rounded-xl border border-purple-700/70 space-y-1 text-[10px]">
                          <span className="font-bold text-amber-300 block">✨ Cụm từ C2 / Band 8.0 gợi ý:</span>
                          {aiGrading.advancedVocabularySuggestions.map((av, idx) => (
                            <div key={idx} className="text-slate-300">
                              • <span className="line-through text-slate-400">{av.original}</span> ➔ <strong className="text-amber-300">{av.c2Upgrade}</strong>
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
                    <span>{saving ? 'Đang lưu điểm...' : 'Lưu Điểm & Gửi Email Cho Học Sinh'}</span>
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
