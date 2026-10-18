import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Eye,
  Send,
  Edit3,
  BarChart2,
  Share2,
  Clock,
  Award,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Copy,
  Download,
  Database,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { SEED_EXAMS, assignExamToClass } from '../examStorage';

export default function ExamAuthoringTab({
  exams = [],
  onPreviewExam,
  onAssignExam,
  onViewProgress,
  onExamCreated
}) {
  const [activeMenu, setActiveMenu] = useState('created'); // 'created' | 'editor' | 'bank' | 'export'
  const [selectedExamForExport, setSelectedExamForExport] = useState(exams[0] || SEED_EXAMS[0]);
  const [copiedNotification, setCopiedNotification] = useState('');

  // Form State for Soạn đề 5 Phần mới
  const [examTitle, setExamTitle] = useState('ĐỀ KIỂM TRA ĐỊNH KỲ TIẾNG ANH 8 (GLOBAL SUCCESS) - SỐ 2');
  const [examCode, setExamCode] = useState('ENG8-EX2');
  const [examDuration, setExamDuration] = useState(45);
  const [examTargetClass, setExamTargetClass] = useState('8A1');
  const [activeSectionTab, setActiveSectionTab] = useState('listening'); // 'listening' | 'lang' | 'reading' | 'comm' | 'writing'

  const handleCopyText = (text, msg) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(msg || 'Đã sao chép vào bộ nhớ tạm!');
    setTimeout(() => setCopiedNotification(''), 3000);
  };

  const handleCreateNewExam = () => {
    const newExam = {
      id: `exam-${Date.now()}`,
      title: examTitle,
      code: examCode,
      durationMinutes: Number(examDuration) || 45,
      totalPoints: 10,
      assignedClass: examTargetClass,
      deadline: '2026-10-30 23:59',
      status: 'draft',
      createdAt: new Date().toISOString(),
      sections: SEED_EXAMS[0]?.sections ? JSON.parse(JSON.stringify(SEED_EXAMS[0].sections)) : {}
    };

    if (onExamCreated) {
      onExamCreated(newExam);
    }
    setActiveMenu('created');
  };

  return (
    <div className="space-y-6">
      {/* 4 Menus Navigation Bar */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-1.5 sm:gap-2">
        {[
          { id: 'created', label: 'A. Đề đã tạo (Quản lý đề thi)', icon: '📋' },
          { id: 'editor', label: 'B. Soạn đề (5 phần ma trận)', icon: '✏️' },
          { id: 'bank', label: 'C. Ngân hàng câu hỏi (4 mức độ)', icon: '🗄️' },
          { id: 'export', label: 'D. Xuất LMS / Antigravity', icon: '🚀' }
        ].map((menu) => (
          <button
            key={menu.id}
            onClick={() => setActiveMenu(menu.id)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition flex items-center space-x-2 ${
              activeMenu === menu.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>{menu.icon}</span>
            <span>{menu.label}</span>
          </button>
        ))}
      </div>

      {copiedNotification && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* ========================================================
          MENU A: ĐỀ ĐÃ TẠO (Exam List & Management)
      ======================================================== */}
      {activeMenu === 'created' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-800">Danh sách các Đề Thi đã tạo</h3>
              <p className="text-xs text-slate-500">
                Quản lý trạng thái mở cho học sinh làm bài, xem trước đề, theo dõi tiến độ nộp bài
              </p>
            </div>
            <button
              onClick={() => setActiveMenu('editor')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition flex items-center space-x-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo đề thi mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const isPublished = exam.status === 'published';
              return (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-300 transition"
                >
                  <div>
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {exam.code}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center space-x-1 border ${
                          isPublished
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        <span>{isPublished ? 'Đang mở cho lớp' : 'Bản nháp (Chưa mở)'}</span>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base line-clamp-2 mb-3">
                      {exam.title}
                    </h4>

                    {/* Meta specs */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-4 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Lớp nhận đề:</span>
                        <span className="font-extrabold text-slate-800">{exam.assignedClass || 'Chưa giao'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Thời lượng & Thang điểm:</span>
                        <span className="font-extrabold text-slate-800">
                          {exam.durationMinutes} phút • {exam.totalPoints || 10}đ
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Hạn nộp bài:</span>
                        <span className="font-semibold text-emerald-800">{exam.deadline || 'Chưa đặt hạn'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar: 5 buttons as requested */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <button
                      onClick={() => onPreviewExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition flex items-center space-x-1 border border-emerald-200"
                      title="Xem trước toàn bộ đề thi trực tuyến như HS nhìn thấy"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Xem lại đề</span>
                    </button>

                    <button
                      onClick={() => onAssignExam(exam)}
                      className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1 shadow-2xs"
                      title="Giao cho lớp và kích hoạt mở đề ngay"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Giao cho lớp</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveMenu('editor');
                        setExamTitle(exam.title);
                        setExamCode(exam.code);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1"
                      title="Chỉnh sửa nội dung đề thi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Sửa đề</span>
                    </button>

                    <button
                      onClick={() => onViewProgress(exam)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center space-x-1 border border-indigo-200"
                      title="Theo dõi bảng điểm học sinh nộp bài"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      <span>Tiến độ</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedExamForExport(exam);
                        setActiveMenu('export');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center space-x-1 ml-auto"
                      title="Xuất sang định dạng LMS hoặc JSON"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>LMS</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU B: SOẠN ĐỀ (Editor 5 Phần Chuẩn Ma Trận)
      ======================================================== */}
      {activeMenu === 'editor' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Trình soạn đề ma trận chuẩn Bộ GD&ĐT</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">Soạn Đề Kiểm Tra 5 Phần (Tiếng Anh 8)</h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveMenu('created')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateNewExam}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                Lưu vào kho đề
              </button>
            </div>
          </div>

          {/* Form Thông tin chung đề thi */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Tiêu đề đề thi:</label>
              <input
                type="text"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Mã đề:</label>
              <input
                type="text"
                value={examCode}
                onChange={(e) => setExamCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Thời lượng (phút):</label>
              <input
                type="number"
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 5 Tabs Phần thi */}
          <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
            {[
              { id: 'listening', label: '1. Listening (2.0đ)', icon: '🎧' },
              { id: 'lang', label: '2. Language Focus (2.5đ)', icon: '🔤' },
              { id: 'reading', label: '3. Reading (2.5đ)', icon: '📖' },
              { id: 'comm', label: '4. Communication (1.0đ)', icon: '💬' },
              { id: 'writing', label: '5. Writing (2.0đ)', icon: '✍️' }
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSectionTab(sec.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center space-x-1.5 ${
                  activeSectionTab === sec.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
              </button>
            ))}
          </div>

          {/* Nội dung tab soạn */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-4">
            {activeSectionTab === 'listening' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm">Cấu hình Phần 1: LISTENING (8 câu • 2.0 điểm)</div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-extrabold text-slate-700 mb-2">Task 1: True / False (4 câu)</div>
                  <div className="text-slate-500 mb-2">Đường dẫn file Audio MP3 nghe 2 lần:</div>
                  <input
                    type="text"
                    defaultValue={SEED_EXAMS[0]?.sections?.listening?.task1?.audioUrl || SEED_EXAMS[0]?.listening?.task1?.audioUrl || ''}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <div className="font-extrabold text-slate-700 mb-2">Task 2: Điền từ vào chỗ trống (4 câu)</div>
                  <div className="text-slate-500 mb-2">Đường dẫn file Audio MP3 nghe 2 lần:</div>
                  <input
                    type="text"
                    defaultValue={SEED_EXAMS[0]?.sections?.listening?.task2?.audioUrl || SEED_EXAMS[0]?.listening?.task2?.audioUrl || ''}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>
            )}

            {activeSectionTab === 'lang' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm">Cấu hình Phần 2: LANGUAGE FOCUS (10 câu • 2.5 điểm)</div>
                <p className="text-slate-600">Bao gồm: Ngữ âm (Phát âm gạch chân, trọng âm 2 âm tiết) và Ngữ pháp - Từ vựng 4 lựa chọn A, B, C, D.</p>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-emerald-700">Đã tích hợp sẵn 10 câu trắc nghiệm chuẩn ma trận học kỳ I.</span>
                </div>
              </div>
            )}

            {activeSectionTab === 'reading' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm">Cấu hình Phần 3: READING (10 câu • 2.5 điểm)</div>
                <p className="text-slate-600">Bao gồm 2 bài đọc: 1 bài Cloze Test (điền khuyết) + 1 bài Đọc hiểu văn bản trả lời câu hỏi.</p>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="font-bold text-cyan-700">Đã cấu hình 2 văn bản về Chủ đề Lối sống nông thôn & Cuộc sống thiếu niên.</span>
                </div>
              </div>
            )}

            {activeSectionTab === 'comm' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm">Cấu hình Phần 4: COMMUNICATION (4 câu • 1.0 điểm)</div>
                <p className="text-slate-600">Tình huống giao tiếp thực tế hàng ngày: Đưa ra lời khuyên, đề xuất, phản hồi sở thích.</p>
              </div>
            )}

            {activeSectionTab === 'writing' && (
              <div className="space-y-3">
                <div className="font-bold text-slate-800 text-sm">Cấu hình Phần 5: WRITING (8 câu + Đoạn văn • 2.0 điểm)</div>
                <p className="text-slate-600">Bao gồm: Sắp xếp từ thành câu hoàn chỉnh, Viết lại câu không đổi nghĩa, và Viết đoạn văn 80-100 từ có AI chấm gợi ý.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          MENU C: NGÂN HÀNG CÂU HỎI (Question Bank)
      ======================================================== */}
      {activeMenu === 'bank' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase">Ngân hàng câu hỏi Tiếng Anh 8</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">Kho Câu Hỏi Chuẩn 4 Mức Độ Nhận Thức</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold">Tổng: 450+ câu hỏi</span>
            </div>
          </div>

          {/* 4 Mức độ nhận thức */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { level: 'Nhận biết', count: '140 câu', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              { level: 'Thông hiểu', count: '160 câu', color: 'bg-blue-50 text-blue-800 border-blue-200' },
              { level: 'Vận dụng', count: '100 câu', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              { level: 'Vận dụng cao', count: '50 câu', color: 'bg-rose-50 text-rose-800 border-rose-200' }
            ].map((lvl, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-center ${lvl.color}`}>
                <div className="font-extrabold text-xs">{lvl.level}</div>
                <div className="text-[11px] font-bold mt-0.5">{lvl.count}</div>
              </div>
            ))}
          </div>

          {/* Mẫu câu hỏi trong ngân hàng */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 mr-2">
                  Nhận biết • Unit 1
                </span>
                <span className="font-semibold text-slate-800">
                  Find the word which has a different sound in the part underlined: A. leisure B. eight C. celebrate D. penalty
                </span>
              </div>
              <button
                onClick={() => handleCopyText('A. leisure B. eight C. celebrate D. penalty', 'Đã thêm câu hỏi vào đề!')}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 ml-3 shrink-0"
              >
                + Thêm vào đề
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 mr-2">
                  Thông hiểu • Unit 2
                </span>
                <span className="font-semibold text-slate-800">
                  Farmers usually have to work ______ at harvest time than any other time of the year. (hard / harder / more hard / hardly)
                </span>
              </div>
              <button
                onClick={() => handleCopyText('harder', 'Đã thêm câu hỏi vào đề!')}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 ml-3 shrink-0"
              >
                + Thêm vào đề
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between">
              <div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 mr-2">
                  Vận dụng • Unit 3
                </span>
                <span className="font-semibold text-slate-800">
                  She participated actively in school activities, so she felt very confident. ➔ (Because...)
                </span>
              </div>
              <button
                onClick={() => handleCopyText('Because she participated...', 'Đã thêm câu hỏi vào đề!')}
                className="px-2.5 py-1 rounded bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 ml-3 shrink-0"
              >
                + Thêm vào đề
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MENU D: XUẤT LMS / ANTIGRAVITY (Export)
      ======================================================== */}
      {activeMenu === 'export' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase">Xuất dữ liệu & Liên thông</span>
            <h3 className="text-lg font-black text-slate-900 mt-0.5">Xuất Đề Thi Ra Nền Tảng LMS & AI Antigravity</h3>
            <p className="text-xs text-slate-500 mt-1">
              Đang chọn đề: <b className="text-slate-800">{selectedExamForExport.title}</b> ({selectedExamForExport.code})
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleCopyText(JSON.stringify(selectedExamForExport, null, 2), 'Đã sao chép cấu trúc JSON của đề thi!')}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40 text-left transition"
            >
              <div className="font-black text-sm text-slate-800 flex items-center space-x-1.5">
                <Copy className="w-4 h-4 text-emerald-600" />
                <span>Sao chép JSON Chuẩn</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tương thích API Backend và đồng bộ LocalStorage <code>tienganh8_assigned_homework_v1</code>
              </div>
            </button>

            <button
              onClick={() => {
                const mdContent = `# ${selectedExamForExport.title}\n\nMã đề: ${selectedExamForExport.code}\nThời lượng: ${selectedExamForExport.durationMinutes} phút\n\n## I. LISTENING\nAudio 1: ${selectedExamForExport.sections?.listening?.task1?.audioUrl}\n...`;
                handleCopyText(mdContent, 'Đã sao chép bản Markdown!');
              }}
              className="p-4 rounded-xl border border-slate-200 hover:border-teal-500 bg-slate-50/70 hover:bg-teal-50/40 text-left transition"
            >
              <div className="font-black text-sm text-slate-800 flex items-center space-x-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>Sao chép Markdown / Word</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Định dạng sẵn tiêu đề, in ra giấy thi hoặc dán vào tài liệu Word
              </div>
            </button>

            <button
              onClick={() => alert('Đã kích hoạt đồng bộ đám mây tới máy chủ LMS!')}
              className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 bg-slate-50/70 hover:bg-indigo-50/40 text-left transition"
            >
              <div className="font-black text-sm text-slate-800 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Đồng bộ máy chủ LMS</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Gửi mã nhúng LMS Moodle / Gnomio và Antigravity Agent
              </div>
            </button>
          </div>

          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto">
            <pre>{JSON.stringify(selectedExamForExport, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
