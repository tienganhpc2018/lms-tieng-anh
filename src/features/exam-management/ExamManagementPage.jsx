import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Edit3,
  CheckCircle2,
  BarChart2,
  Sparkles,
  FlaskConical,
  GraduationCap,
  ArrowRightLeft,
  ShieldCheck,
  ChevronRight,
  Bell
} from 'lucide-react';
import {
  loadAssignedExams,
  saveAssignedExams,
  loadExamSubmissions,
  saveExamSubmissions,
  getActiveRole,
  setActiveRole
} from './examStorage';

// Tabs
import OverviewTab from './tabs/OverviewTab';
import ClassesTab from './tabs/ClassesTab';
import LessonsTab from './tabs/LessonsTab';
import AssignmentsTab from './tabs/AssignmentsTab';
import ExamAuthoringTab from './tabs/ExamAuthoringTab';
import GradingTab from './tabs/GradingTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import ExtractorTab from './tabs/ExtractorTab';
import TestSuiteTab from './tabs/TestSuiteTab';

// Modals & Components
import ExamPreviewModal from './components/ExamPreviewModal';
import AssignExamModal from './components/AssignExamModal';
import StudentPortalView from './components/StudentPortalView';

export default function ExamManagementPage() {
  const [currentRole, setCurrentRole] = useState(() => getActiveRole());
  const [activeTab, setActiveTab] = useState('authoring'); // Default to 'authoring' or 'overview'
  
  // Data state
  const [exams, setExams] = useState(() => loadAssignedExams());
  const [submissions, setSubmissions] = useState(() => loadExamSubmissions());

  // Modal state
  const [previewingExam, setPreviewingExam] = useState(null);
  const [assigningExam, setAssigningExam] = useState(null);

  // Sync role to storage
  const handleSwitchRole = (newRole) => {
    setActiveRole(newRole);
    setCurrentRole(newRole);
  };

  const handleUpdateSubmission = (updatedSub) => {
    const nextList = submissions.map((s) => (s.id === updatedSub.id ? updatedSub : s));
    setSubmissions(nextList);
    saveExamSubmissions(nextList);
  };

  const handleExamCreated = (newExam) => {
    const nextList = [newExam, ...exams];
    setExams(nextList);
    saveAssignedExams(nextList);
  };

  const handleAssignedSuccess = (updatedExam, assignedTarget) => {
    const nextList = exams.map((e) => (e.id === updatedExam.id ? updatedExam : e));
    setExams(nextList);
    saveAssignedExams(nextList);
  };

  const handleExamSubmitted = (newSub) => {
    const nextList = [newSub, ...submissions];
    setSubmissions(nextList);
    saveExamSubmissions(nextList);
  };

  // 9 Sub-Tabs of Teacher Workspace
  const teacherTabs = [
    { id: 'overview', label: '1. Tổng quan', icon: '📊', desc: 'Dashboard chỉ số & thông báo' },
    { id: 'classes', label: '2. Lớp học', icon: '🏫', desc: 'Quản lý HS lớp 8A1 - 8A4' },
    { id: 'lessons', label: '3. Bài học & Học liệu', icon: '📖', desc: '12 Unit SGK & Audio MP3' },
    { id: 'assignments', label: '4. Bài tập', icon: '📚', desc: 'Soạn & giao bài tập kỹ năng' },
    { id: 'authoring', label: '5. Soạn đề (5 phần)', icon: '📝', desc: 'Ma trận chuẩn GDPT 2018' },
    { id: 'grading', label: '6. Chấm bài', icon: '✍️', desc: 'Tự động MCQ & chấm tự luận' },
    { id: 'analytics', label: '7. Thống kê', icon: '📈', desc: 'Phổ điểm & phân tích câu khó' },
    { id: 'extractor', label: '8. Trích xuất đề', icon: '✨', desc: 'AI Material Extractor' },
    { id: 'testsuite', label: '9. Kiểm thử', icon: '🧪', desc: 'Interactive Test Suite' }
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16 font-sans">
      {/* Top Banner & Fast Role Switcher */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb / Title */}
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              🎓
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Phân Hệ Quản Trị & Khảo Thí Tiếng Anh THCS
                </span>
                <span className="text-[10px] font-bold text-slate-400">GDPT 2018</span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                Soạn Đề, Giao Đề, Theo Dõi & Chấm Điểm Học Sinh
              </h1>
            </div>
          </div>

          {/* Role Switcher: Thầy Nguyễn Văn Hải vs Minh Hằng (8A1) */}
          <div className="flex items-center space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => handleSwitchRole('teacher')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
                currentRole === 'teacher'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👨‍🏫</span>
              <span>Giáo viên (Thầy Nguyễn Văn Hải)</span>
            </button>

            <button
              onClick={() => handleSwitchRole('student')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
                currentRole === 'student'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>👩‍🎓</span>
              <span>Học sinh (Vào phòng thi)</span>
            </button>
          </div>
        </div>

        {/* 9 Teacher Sub-Tabs Navigation (Scrollable horizontally on mobile) */}
        {currentRole === 'teacher' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex overflow-x-auto no-scrollbar py-1.5 gap-1.5">
            {teacherTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition flex items-center space-x-1.5 shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-2xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentRole === 'teacher' ? (
          <div>
            {/* 1. Tổng quan */}
            {activeTab === 'overview' && (
              <OverviewTab
                exams={exams}
                submissions={submissions}
                onOpenAuthoring={() => setActiveTab('authoring')}
                onOpenGrading={() => setActiveTab('grading')}
              />
            )}

            {/* 2. Lớp học */}
            {activeTab === 'classes' && <ClassesTab />}

            {/* 3. Bài học & Học liệu */}
            {activeTab === 'lessons' && <LessonsTab />}

            {/* 4. Bài tập */}
            {activeTab === 'assignments' && <AssignmentsTab />}

            {/* 5. Soạn đề (5 phần) */}
            {activeTab === 'authoring' && (
              <ExamAuthoringTab
                exams={exams}
                onPreviewExam={(exam) => setPreviewingExam(exam)}
                onAssignExam={(exam) => setAssigningExam(exam)}
                onViewProgress={() => setActiveTab('grading')}
                onExamCreated={handleExamCreated}
              />
            )}

            {/* 6. Chấm bài */}
            {activeTab === 'grading' && (
              <GradingTab
                submissions={submissions}
                onUpdateSubmission={handleUpdateSubmission}
              />
            )}

            {/* 7. Thống kê */}
            {activeTab === 'analytics' && <AnalyticsTab submissions={submissions} />}

            {/* 8. Trích xuất đề */}
            {activeTab === 'extractor' && (
              <ExtractorTab onExamCreated={handleExamCreated} />
            )}

            {/* 9. Kiểm thử */}
            {activeTab === 'testsuite' && <TestSuiteTab />}
          </div>
        ) : (
          /* Student Portal View */
          <StudentPortalView
            exams={exams}
            submissions={submissions}
            onSwitchToTeacher={() => handleSwitchRole('teacher')}
            onExamSubmitted={handleExamSubmitted}
          />
        )}
      </div>

      {/* Preview Exam Modal */}
      {previewingExam && (
        <ExamPreviewModal
          exam={previewingExam}
          onClose={() => setPreviewingExam(null)}
          onAssign={(exam) => setAssigningExam(exam)}
        />
      )}

      {/* Assign Exam to Classes Modal */}
      {assigningExam && (
        <AssignExamModal
          exam={assigningExam}
          onClose={() => setAssigningExam(null)}
          onAssignedSuccess={handleAssignedSuccess}
        />
      )}
    </div>
  );
}
