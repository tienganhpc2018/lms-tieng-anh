import React, { useState } from 'react';
import { X, Globe, Download, Share2, Search, CheckCircle, BookOpen, Star, FileText } from 'lucide-react';

export default function CommunityExamBankModal({ isOpen, onClose, onSelectExam }) {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');

  // Kho đề thi cộng đồng mẫu
  const sampleCommunityExams = [
    {
      id: 'exam_01',
      title: 'ĐỀ THI GIỮA KỲ 1 TIẾNG ANH LỚP 9 (CHƯƠNG TRÌNH MỚI 2026)',
      author: 'Cô Nguyễn Thị Mai (Tổ Trưởng Bộ Môn)',
      downloads: 142,
      rating: 5.0,
      partsCount: 4,
      questionsCount: 25,
      data: {
        title: 'ĐỀ THI GIỮA KỲ 1 TIẾNG ANH LỚP 9 (CHƯƠNG TRÌNH MỚI)',
        parts: [
          {
            part_type: 'multiple_choice',
            part_title: 'PART 1: Listen to Phong talking about Bat Trang pottery village. Choose A, B, C or D.',
            questions: [
              {
                question: '1. What generation of artisan is Phong in Bat Trang pottery village?',
                options: [{ text: 'First', isCorrect: false }, { text: 'Second', isCorrect: false }, { text: 'Third', isCorrect: true }, { text: 'Fourth', isCorrect: false }],
                explanation: '💡 Evidence: Phong is the third generation of artisan.',
              },
            ],
          },
        ],
      },
    },
    {
      id: 'exam_02',
      title: 'ĐỀ KÍỂM TRA 15 PHÚT UNIT 1: LOCAL COMMUNITY (READING & CLOZE TEST)',
      author: 'Thầy Trần Hoàng Nam',
      downloads: 98,
      rating: 4.9,
      partsCount: 2,
      questionsCount: 15,
      data: {
        title: 'ĐỀ KÍỂM TRA 15 PHÚT UNIT 1: LOCAL COMMUNITY',
        parts: [
          {
            part_type: 'cloze_test',
            part_title: 'PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD.',
            questions: [
              {
                question_number: '16',
                options: [{ id: 'A', text: 'A. suburb' }, { id: 'B', text: 'B. suitcase' }, { id: 'C', text: 'C. seagull' }, { id: 'D', text: 'D. fragrance' }],
                correct_option: 'A',
              },
            ],
          },
        ],
      },
    },
  ];

  const filtered = sampleCommunityExams.filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-amber-300 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                🌐 KHO ĐỀ THI CỘNG ĐỒNG BỘ MÔN TIẾNG ANH
              </h3>
              <p className="text-[10px] text-teal-200">Chia sẻ & sử dụng lại các bộ đề thi chuẩn hóa từ Giáo viên toàn quốc</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ô Tìm Kiếm */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm đề thi theo tên bài học, khối lớp, giáo viên..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Danh sách đề thi */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1 text-xs">
          {filtered.map((exam) => (
            <div key={exam.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs hover:border-teal-500 transition space-y-2">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{exam.title}</h4>
                <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-extrabold rounded-full flex-shrink-0 flex items-center space-x-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{exam.rating}</span>
                </span>
              </div>

              <div className="flex items-center space-x-3 text-[10px] text-slate-500">
                <span>Tác giả: <strong>{exam.author}</strong></span>
                <span>• {exam.downloads} lượt tải</span>
                <span>• {exam.questionsCount} câu hỏi ({exam.partsCount} Parts)</span>
              </div>

              <button
                onClick={() => {
                  onSelectExam(exam.data);
                  onClose();
                  alert(`🎉 Đã tải đề thi "${exam.title}" về khung soạn thảo của Thầy!`);
                }}
                className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Bộ Đề Thi Này Về Sử Dụng</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
