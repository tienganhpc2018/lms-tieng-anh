import React, { useState, useEffect } from 'react';
import { Database, ArrowLeft, Search, Filter, BookOpen, Layers, Volume2, CheckCircle, Eye, AlertCircle, RefreshCw, FileText, Headphones, Type, Edit3, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { exportQuizToWord } from '../utils/exportQuizWord';

// DỮ LIỆU NGUỒN MẪU GLOBAL SUCCESS THEO KHỐI
const GLOBAL_SUCCESS_DATA = {
  'Khối 6': [
    { q: 'My home town is famous for its silk _______ village.', opts: ['weaving', 'pottery', 'carving'], ans: 'A', cat: 'Vocabulary' },
    { q: 'Look! The students _______ badminton in the schoolyard.', opts: ['play', 'are playing', 'played'], ans: 'B', cat: 'Grammar' },
  ],
  'Khối 7': [
    { q: 'You should eat more vegetables because they provide a lot of _______.', opts: ['vitamins', 'calories', 'junk food'], ans: 'A', cat: 'Vocabulary' },
    { q: 'We _______ to the cinema last Sunday.', opts: ['go', 'went', 'have gone'], ans: 'B', cat: 'Grammar' },
  ],
  'Khối 8': [
    { q: 'The children in my home village used to go _______, even in winter.', opts: ['on foot', 'bare-footed', 'playing around'], ans: 'B', cat: 'Vocabulary' },
    { q: 'Giving lucky money to the young and the old at Tet is a common _______ in many Asian countries.', opts: ['behavior', 'practice', 'tradition'], ans: 'B', cat: 'Culture & Tradition' },
    { q: 'In Viet Nam, _______ often refers to age and social position, not to wealth.', opts: ['seniority', 'tradition', 'generation'], ans: 'A', cat: 'Vocabulary' },
  ],
  'Khối 9': [
    { q: 'Artisan Phong is the third _______ of his family keeping up with conical hat making.', opts: ['generation', 'tradition', 'seniority'], ans: 'A', cat: 'Local Community' },
    { q: 'If we reduce air pollution, our city _______ a better place to live.', opts: ['will become', 'became', 'becomes'], ans: 'A', cat: 'Grammar' },
  ],
};

// DỮ LIỆU ĐỀ THI VỪA SOẠN CHUẨN
const SAMPLE_MY_QUESTIONS = [
  {
    id: 'sample_01',
    type: 'reading_section',
    marks: 10,
    content: {
      sectionType: 'reading_section',
      title: 'READING SECTION - UNIT 1: LOCAL COMMUNITY (PRACTICE TEST)',
      passage: 'Chuong village in Hanoi is famous for its long history of making conical hats (non la)...',
      parts: [
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.',
          passage: 'Chuong village in Hanoi is famous for its long history of making conical hats (non la). Artisan Phong is the third generation of his family keeping up with modern trends...',
          questions: [
            {
              question: '1. What traditional craft is Chuong village famous for?',
              options: [
                { text: 'Making pottery', isCorrect: false },
                { text: 'Weaving silk', isCorrect: false },
                { text: 'Making conical hats', isCorrect: true },
                { text: 'Carving wood', isCorrect: false }
              ],
              explanation: '💡 Evidence: Chuong village in Hanoi is famous for making conical hats.'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'sample_02',
    type: 'listening_section',
    marks: 10,
    content: {
      sectionType: 'listening_section',
      title: 'LISTENING SECTION - BAT TRANG POTTERY VILLAGE (PRACTICE TEST)',
      audioUrl: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg',
      audioFileName: 'bat_trang_pottery_interview.mp3',
      parts: [
        {
          part_type: 'multiple_choice',
          part_title: 'PART 1: Listen to Phong talking about Bat Trang pottery village. Choose A, B, C, or D.',
          questions: [
            {
              question: '1. What generation of artisan is Phong in Bat Trang pottery village?',
              options: [
                { text: 'First', isCorrect: false },
                { text: 'Second', isCorrect: false },
                { text: 'Third', isCorrect: true },
                { text: 'Fourth', isCorrect: false }
              ],
              explanation: '💡 Evidence: Phong is the third generation of artisan in his family.'
            }
          ]
        }
      ]
    }
  },
  {
    id: 'sample_03',
    type: 'cloze_test',
    marks: 10,
    content: {
      sectionType: 'cloze_test',
      title: 'KNOWLEDGE OF LANGUAGE - CLOZE TEST (PRACTICE TEST)',
      tasks: [
        {
          task_title: 'PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.',
          task_sub: 'Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.',
          badge_label: 'BLOG',
          passage_title: 'Our Beautiful Suburb Blog',
          passage: 'Hi everyone! Welcome back to my blog. Today, I want to talk about my local community...',
          questions: [
            {
              question_number: '16',
              options: [
                { id: 'A', text: 'A. suburb' },
                { id: 'B', text: 'B. suitcase' },
                { id: 'C', text: 'C. seagull' },
                { id: 'D', text: 'D. fragrance' }
              ],
              correct_option: 'A'
            }
          ]
        }
      ]
    }
  }
];

export default function QuestionBankView() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('Khối 8');
  const [activeTab, setActiveTab] = useState('my_questions');
  const [questions, setQuestions] = useState(SAMPLE_MY_QUESTIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllQuestions = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        const dbLoaded = data.map((q) => {
          let cObj = {};
          if (q && q.content) {
            if (typeof q.content === 'object') {
              cObj = q.content;
            } else if (typeof q.content === 'string') {
              try {
                cObj = JSON.parse(q.content);
              } catch (e) {
                cObj = { question: q.content };
              }
            }
          }
          return {
            id: q?.id || Math.random().toString(),
            type: q?.type || 'multiple_choice',
            marks: q?.marks || 1,
            content: cObj || {},
          };
        });
        setQuestions([...dbLoaded, ...SAMPLE_MY_QUESTIONS]);
      }
    } catch (err) {
      console.warn('Background fetch notice:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const safeQuestions = (Array.isArray(questions) ? questions : SAMPLE_MY_QUESTIONS) || [];
  const filteredQuestions = safeQuestions.filter((q) => {
    if (!q || !q.content) return true;
    try {
      const title = String(q.content?.title || '');
      const qText = String(q.content?.question || '');
      const passage = String(q.content?.passage || '');
      const query = (searchQuery || '').toLowerCase();
      return (
        title.toLowerCase().includes(query) ||
        qText.toLowerCase().includes(query) ||
        passage.toLowerCase().includes(query)
      );
    } catch (e) {
      return true;
    }
  });

  const gradeQuestions = GLOBAL_SUCCESS_DATA[selectedGrade] || GLOBAL_SUCCESS_DATA['Khối 8'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans select-none">
      {/* THANH THÊU VÀ ĐIỀU HƯỚNG TRÊN CÙNG */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-2xl transition flex items-center space-x-1.5 font-bold text-xs bg-white border border-slate-200 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Về Khóa Học</span>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
              <Database className="w-7 h-7 text-sky-500" />
              <span>Ngân Hàng Câu Hỏi Nguồn Mẫu & Đề Thi Đã Soạn</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Kho lưu trữ câu hỏi trắc nghiệm, bài đọc hiểu READING SECTION và bài nghe LISTENING SECTION của Giáo Viên.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAllQuestions}
          disabled={isRefreshing}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center space-x-1.5"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Đang Cập Nhật...' : 'Làm Mới Dữ Liệu'}</span>
        </button>
      </div>

      {/* TAB CHỌN XEM CHI TIẾT */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('my_questions')}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'my_questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>📚 Đề Thi Vừa Soạn Trong Bài Học ({(filteredQuestions || []).length} bộ đề mẫu)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('global_success')}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'global_success' ? 'border-sky-600 text-sky-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-600" />
          <span>🌐 Ngân Hàng Đề Nguồn Mẫu Global Success</span>
        </button>
      </div>

      {/* TÌM KIẾM */}
      <div className="flex items-center space-x-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
        <Search className="w-5 h-5 text-slate-400 ml-2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm bài đọc hiểu, bài nghe audio, hoặc câu hỏi..."
          className="w-full text-xs font-medium border-0 focus:ring-0 text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* DANH SÁCH CÂU HỎI & ĐỀ THI TRONG NGÂN HÀNG */}
      {activeTab === 'my_questions' ? (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-extrabold text-base text-slate-900">
              Danh Sách Đề Thi Giáo Viên Vừa Soạn ({(filteredQuestions || []).length} bộ đề mẫu & bài soạn)
            </h3>
          </div>

          <div className="space-y-4">
            {(filteredQuestions || []).map((q, idx) => {
              const childs = (Array.isArray(q?.content?.childQuestions) ? q.content.childQuestions : []) || [];
              const sectionType = q?.content?.sectionType || q?.type || 'multiple_choice';

              return (
                <div key={q?.id || idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-lg">
                        Dạng: {sectionType}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">({q?.marks || 1} điểm)</span>
                    </div>

                    <button
                      onClick={() => exportQuizToWord([q], q?.content?.title || 'BÀI KIỂM TRA TIẾNG ANH')}
                      className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Xuất File Word</span>
                    </button>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{q?.content?.title || q?.content?.question || 'Untitled Question'}</h4>

                  {/* NẾU LÀ BÀI ĐỌC READING SECTION */}
                  {q?.content?.passage && (
                    <div className="p-3.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                      <p className="line-clamp-3 italic">"{q.content.passage}"</p>
                    </div>
                  )}

                  {/* NẾU LÀ BÀI NGHE LISTENING SECTION CÓ AUDIO MP3 */}
                  {q?.content?.audioUrl && (
                    <div className="p-3 bg-white border border-purple-200 rounded-xl space-y-1">
                      <span className="text-[11px] font-bold text-purple-900 flex items-center space-x-1">
                        <Volume2 className="w-3.5 h-3.5 text-purple-600" />
                        <span>File Nghe Audio MP3: ({q.content?.audioFileName || 'Audio Track'})</span>
                      </span>
                      <audio controls className="w-full h-8">
                        <source src={q.content.audioUrl} />
                      </audio>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TAB GLOBAL SUCCESS CHỌN THEO KHỐI */
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setSelectedGrade(g)}
                className={`p-4 rounded-2xl border text-center font-extrabold text-sm transition ${
                  selectedGrade === g
                    ? 'border-sky-600 bg-sky-50 text-sky-900 shadow-sm ring-2 ring-sky-500/20'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {g} - Global Success
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
              <Globe className="w-5 h-5 text-sky-600" />
              <span>Danh Sách Câu Hỏi Nguồn Mẫu - {selectedGrade} ({gradeQuestions.length} câu)</span>
            </h3>

            <div className="space-y-3">
              {gradeQuestions.map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
                      Categories: {item.cat}
                    </span>
                    <span className="text-xs font-bold text-emerald-600">Đáp án đúng: {item.ans}</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">Câu {idx + 1}: {item.q}</h4>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
                    {(item.opts || []).map((o, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-xl border ${
                          String.fromCharCode(65 + i) === item.ans
                            ? 'bg-emerald-100 border-emerald-400 text-emerald-950 font-extrabold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}. {o}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
