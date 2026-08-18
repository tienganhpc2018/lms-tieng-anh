import React, { useState, useEffect } from 'react';
import { Database, ArrowLeft, Search, Filter, BookOpen, Layers, Volume2, CheckCircle, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function QuestionBankView() {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState('Khối 8');
  const [activeTab, setActiveTab] = useState('my_questions');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [fetchErrorMsg, setFetchErrorMsg] = useState(null);

  const fetchAllQuestions = async () => {
    setLoading(true);
    setFetchErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      let loaded = [];
      if (data && data.length > 0) {
        loaded = data.map((q) => {
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
      }

      // Kết hợp dữ liệu database + Dữ liệu đề thi mẫu chuẩn
      const sampleList = [
  {
    "id": "sample_01",
    "type": "reading_section",
    "marks": 10,
    "content": {
      "sectionType": "reading_section",
      "title": "READING SECTION - UNIT 1: LOCAL COMMUNITY (PRACTICE TEST)",
      "passage": "Chuong village in Hanoi is famous for its long history of making conical hats (non la)...",
      "parts": [
        {
          "part_type": "multiple_choice",
          "part_title": "PART 1: Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.",
          "passage": "Chuong village in Hanoi is famous for its long history of making conical hats (non la). Artisan Phong is the third generation of his family keeping up with modern trends...",
          "questions": [
            {
              "question": "1. What traditional craft is Chuong village famous for?",
              "options": [
                {
                  "text": "Making pottery",
                  "isCorrect": false
                },
                {
                  "text": "Weaving silk",
                  "isCorrect": false
                },
                {
                  "text": "Making conical hats",
                  "isCorrect": true
                },
                {
                  "text": "Carving wood",
                  "isCorrect": false
                }
              ],
              "explanation": "💡 Evidence: Chuong village in Hanoi is famous for making conical hats."
            }
          ]
        },
        {
          "part_type": "true_false",
          "part_title": "PART 2: Read the second text and decide whether the statements are True (T) or False (F).",
          "passage": "Visitors come to Chuong village to learn how to make conical hats themselves...",
          "questions": [
            {
              "question": "2. Fewer young people want to learn the craft because they do not know how to make a living from it.",
              "correctAnswer": "T",
              "explanation": "💡 Evidence: Fewer young people want to learn the craft."
            }
          ]
        }
      ]
    }
  },
  {
    "id": "sample_02",
    "type": "listening_section",
    "marks": 10,
    "content": {
      "sectionType": "listening_section",
      "title": "LISTENING SECTION - BAT TRANG POTTERY VILLAGE (PRACTICE TEST)",
      "parts": [
        {
          "part_type": "multiple_choice",
          "part_title": "PART 1: Listen to Phong talking about Bat Trang pottery village. Choose A, B, C, or D.",
          "questions": [
            {
              "question": "1. What generation of artisan is Phong in Bat Trang pottery village?",
              "options": [
                {
                  "text": "First",
                  "isCorrect": false
                },
                {
                  "text": "Second",
                  "isCorrect": false
                },
                {
                  "text": "Third",
                  "isCorrect": true
                },
                {
                  "text": "Fourth",
                  "isCorrect": false
                }
              ],
              "explanation": "💡 Evidence: Phong is the third generation of artisan in his family."
            }
          ]
        },
        {
          "part_type": "true_false",
          "part_title": "PART 2: Listen again and decide whether the statements are True (T) or False (F).",
          "questions": [
            {
              "question": "2. Young people in the community often ask Phong how to keep up with modern trends.",
              "correctAnswer": "T",
              "explanation": "💡 Evidence: Young people often ask how to keep up with modern trends."
            }
          ]
        }
      ]
    }
  },
  {
    "id": "sample_03",
    "type": "cloze_test",
    "marks": 10,
    "content": {
      "sectionType": "cloze_test",
      "title": "KNOWLEDGE OF LANGUAGE - CLOZE TEST (PRACTICE TEST)",
      "tasks": [
        {
          "task_title": "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          "task_sub": "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          "badge_label": "BLOG",
          "passage_title": "Our Beautiful Suburb Blog",
          "passage": "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
          "questions": [
            {
              "question_number": "16",
              "options": [
                {
                  "id": "A",
                  "text": "A. suburb"
                },
                {
                  "id": "B",
                  "text": "B. suitcase"
                },
                {
                  "id": "C",
                  "text": "C. seagull"
                },
                {
                  "id": "D",
                  "text": "D. fragrance"
                }
              ],
              "correct_option": "A"
            }
          ]
        },
        {
          "task_title": "PART 2: READ THE SECOND TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          "task_sub": "Read the following email invitation and choose the best option (A, B, C, or D) for each blank.",
          "badge_label": "EMAIL",
          "passage_title": "Invitation to a House-Warming Party",
          "passage": "Dear Vy,\nHow are you? I am writing to invite you to our (21) _______ party next Saturday...",
          "questions": [
            {
              "question_number": "21",
              "options": [
                {
                  "id": "A",
                  "text": "A. house-warming"
                },
                {
                  "id": "B",
                  "text": "B. hard-working"
                },
                {
                  "id": "C",
                  "text": "C. worldwide"
                },
                {
                  "id": "D",
                  "text": "D. responsible"
                }
              ],
              "correct_option": "A"
            }
          ]
        }
      ]
    }
  }
];
      const combined = [...loaded, ...sampleList];
      setQuestions(combined);
    } catch (err) {
      console.error('Lỗi load ngân hàng đề:', err);
      const sampleList = [
  {
    "id": "sample_01",
    "type": "reading_section",
    "marks": 10,
    "content": {
      "sectionType": "reading_section",
      "title": "READING SECTION - UNIT 1: LOCAL COMMUNITY (PRACTICE TEST)",
      "passage": "Chuong village in Hanoi is famous for its long history of making conical hats (non la)...",
      "parts": [
        {
          "part_type": "multiple_choice",
          "part_title": "PART 1: Read the passage about Chuong conical hat village and choose the correct answer A, B, C, or D.",
          "passage": "Chuong village in Hanoi is famous for its long history of making conical hats (non la). Artisan Phong is the third generation of his family keeping up with modern trends...",
          "questions": [
            {
              "question": "1. What traditional craft is Chuong village famous for?",
              "options": [
                {
                  "text": "Making pottery",
                  "isCorrect": false
                },
                {
                  "text": "Weaving silk",
                  "isCorrect": false
                },
                {
                  "text": "Making conical hats",
                  "isCorrect": true
                },
                {
                  "text": "Carving wood",
                  "isCorrect": false
                }
              ],
              "explanation": "💡 Evidence: Chuong village in Hanoi is famous for making conical hats."
            }
          ]
        },
        {
          "part_type": "true_false",
          "part_title": "PART 2: Read the second text and decide whether the statements are True (T) or False (F).",
          "passage": "Visitors come to Chuong village to learn how to make conical hats themselves...",
          "questions": [
            {
              "question": "2. Fewer young people want to learn the craft because they do not know how to make a living from it.",
              "correctAnswer": "T",
              "explanation": "💡 Evidence: Fewer young people want to learn the craft."
            }
          ]
        }
      ]
    }
  },
  {
    "id": "sample_02",
    "type": "listening_section",
    "marks": 10,
    "content": {
      "sectionType": "listening_section",
      "title": "LISTENING SECTION - BAT TRANG POTTERY VILLAGE (PRACTICE TEST)",
      "parts": [
        {
          "part_type": "multiple_choice",
          "part_title": "PART 1: Listen to Phong talking about Bat Trang pottery village. Choose A, B, C, or D.",
          "questions": [
            {
              "question": "1. What generation of artisan is Phong in Bat Trang pottery village?",
              "options": [
                {
                  "text": "First",
                  "isCorrect": false
                },
                {
                  "text": "Second",
                  "isCorrect": false
                },
                {
                  "text": "Third",
                  "isCorrect": true
                },
                {
                  "text": "Fourth",
                  "isCorrect": false
                }
              ],
              "explanation": "💡 Evidence: Phong is the third generation of artisan in his family."
            }
          ]
        },
        {
          "part_type": "true_false",
          "part_title": "PART 2: Listen again and decide whether the statements are True (T) or False (F).",
          "questions": [
            {
              "question": "2. Young people in the community often ask Phong how to keep up with modern trends.",
              "correctAnswer": "T",
              "explanation": "💡 Evidence: Young people often ask how to keep up with modern trends."
            }
          ]
        }
      ]
    }
  },
  {
    "id": "sample_03",
    "type": "cloze_test",
    "marks": 10,
    "content": {
      "sectionType": "cloze_test",
      "title": "KNOWLEDGE OF LANGUAGE - CLOZE TEST (PRACTICE TEST)",
      "tasks": [
        {
          "task_title": "PART 1: READ THE FIRST TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          "task_sub": "Read the following blog post about a local community and choose the best option (A, B, C, or D) for each blank.",
          "badge_label": "BLOG",
          "passage_title": "Our Beautiful Suburb Blog",
          "passage": "Hi everyone! Welcome back to my blog. Today, I want to talk about my local community. Two years ago, my family decided to move to this (16) _______ of the city...",
          "questions": [
            {
              "question_number": "16",
              "options": [
                {
                  "id": "A",
                  "text": "A. suburb"
                },
                {
                  "id": "B",
                  "text": "B. suitcase"
                },
                {
                  "id": "C",
                  "text": "C. seagull"
                },
                {
                  "id": "D",
                  "text": "D. fragrance"
                }
              ],
              "correct_option": "A"
            }
          ]
        },
        {
          "task_title": "PART 2: READ THE SECOND TEXT AND CHOOSE THE CORRECT WORD TO FILL IN EACH BLANK.",
          "task_sub": "Read the following email invitation and choose the best option (A, B, C, or D) for each blank.",
          "badge_label": "EMAIL",
          "passage_title": "Invitation to a House-Warming Party",
          "passage": "Dear Vy,\nHow are you? I am writing to invite you to our (21) _______ party next Saturday...",
          "questions": [
            {
              "question_number": "21",
              "options": [
                {
                  "id": "A",
                  "text": "A. house-warming"
                },
                {
                  "id": "B",
                  "text": "B. hard-working"
                },
                {
                  "id": "C",
                  "text": "C. worldwide"
                },
                {
                  "id": "D",
                  "text": "D. responsible"
                }
              ],
              "correct_option": "A"
            }
          ]
        }
      ]
    }
  }
];
      setQuestions(sampleList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQuestions();
  }, []);

  const safeQuestions = Array.isArray(questions) ? questions : [];
  const filteredQuestions = safeQuestions.filter((q) => {
    if (!q || !q.content) return false;
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
      return false;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* THANH THÊU VÀ ĐIỀU HƯỚNG TRÊN CÙNG */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition flex items-center space-x-1 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về Khóa Học</span>
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Database className="w-6 h-6 text-sky-500" />
            <span>Ngân Hàng Câu Hỏi Nguồn Mẫu & Đề Thi Đã Soạn</span>
          </h1>
          <p className="text-xs text-slate-500">
            Kho lưu trữ câu hỏi trắc nghiệm, bài đọc hiểu READING SECTION và bài nghe LISTENING SECTION của Giáo Viên.
          </p>
        </div>
      </div>

      {/* TAB CHỌN XEM */}
      <div className="flex border-b border-slate-200 space-x-4">
        <button
          onClick={() => setActiveTab('my_questions')}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'my_questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>📚 Đề Thi Vừa Soạn Trong Bài Học ({safeQuestions.length} đề)</span>
        </button>

        <button
          onClick={() => setActiveTab('global_success')}
          className={`pb-3 text-sm font-extrabold transition border-b-2 flex items-center space-x-2 ${
            activeTab === 'global_success' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4 text-sky-600" />
          <span>🌐 Ngân Hàng Đề Nguồn Mẫu Global Success</span>
        </button>
      </div>

      {/* TÌM KIẾM */}
      <div className="flex items-center space-x-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
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
              Danh Sách Đề Thi Giáo Viên Vừa Soạn ({filteredQuestions.length} câu)
            </h3>
            <button
              onClick={fetchAllQuestions}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Tải lại</span>
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Đang tải ngân hàng đề thi..." />
          ) : fetchErrorMsg ? (
            <div className="p-8 text-center bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold space-y-2">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
              <p>Thông báo: {fetchErrorMsg}</p>
              <button
                onClick={fetchAllQuestions}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
              >
                Thử Tải Lại
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs font-semibold space-y-2">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Chưa có câu hỏi hoặc bài đọc nào trong Ngân hàng đề.</p>
              <p className="text-[11px] text-slate-400">Hãy vào Bài Học và bấm nút "Soạn Bài & Câu Hỏi" để tạo đề thi đầu tiên!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, idx) => {
                const childs = Array.isArray(q.content?.childQuestions) ? q.content.childQuestions : [];
                const sectionType = q.content?.sectionType || q.type || 'multiple_choice';

                return (
                  <div key={q.id || idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-extrabold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-lg">
                          Dạng: {sectionType}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({q.marks} điểm)</span>
                      </div>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">{q.content?.title || q.content?.question || 'Untitled Question'}</h4>

                    {/* NẾU LÀ BÀI ĐỌC READING SECTION */}
                    {q.content?.passage && (
                      <div className="p-3.5 bg-white border border-sky-200 rounded-xl text-xs text-slate-700 leading-relaxed font-medium">
                        <p className="line-clamp-3 italic">"{q.content.passage}"</p>
                      </div>
                    )}

                    {/* NẾU LÀ BÀI NGHE LISTENING SECTION CÓ AUDIO MP3 */}
                    {q.content?.audioUrl && (
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

                    {/* DANH SÁCH CÁC CÂU HỎI CON */}
                    {childs.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <span className="text-[11px] font-extrabold text-slate-600 block">
                          Chứa {childs.length} câu hỏi trắc nghiệm con:
                        </span>
                        {childs.map((c, cIdx) => (
                          <div key={cIdx} className="p-3 bg-white border border-slate-200 rounded-xl text-xs font-semibold space-y-1">
                            <p className="text-slate-800 font-extrabold">{c.question}</p>
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-600">
                              {(c.options || []).map((opt, oIdx) => (
                                <span
                                  key={oIdx}
                                  className={`px-2 py-0.5 rounded border ${
                                    opt.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold' : 'bg-slate-50 border-slate-200'
                                  }`}
                                >
                                  {String.fromCharCode(65 + oIdx)}. {opt.text}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            {['Khối 6', 'Khối 7', 'Khối 8', 'Khối 9'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`p-4 rounded-2xl border text-center font-extrabold text-sm transition ${
                  selectedGrade === g
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {g} - Global Success
              </button>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">
              Danh Sách Câu Hỏi Nguồn Mẫu - {selectedGrade}
            </h3>

            <div className="space-y-3">
              {[
                { q: 'The children in my home village used to go _______, even in winter.', opts: ['on foot', 'bare-footed', 'playing around'], ans: 'B' },
                { q: 'Giving lucky money to the young and the old at Tet is a common _______ in many Asian countries.', opts: ['behavior', 'practice', 'tradition'], ans: 'B' },
                { q: 'In Viet Nam, _______ often refers to age and social position, not to wealth.', opts: ['seniority', 'tradition', 'generation'], ans: 'A' },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <span className="text-[10px] font-extrabold bg-sky-100 text-sky-800 px-2 py-0.5 rounded uppercase">
                    Categories: Knowledge of English (Vocab & Grammar)
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-900">Câu {idx + 1}: {item.q}</h4>
                  <div className="flex flex-wrap gap-2 pt-1 text-xs font-semibold">
                    {item.opts.map((o, i) => (
                      <span key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700">
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
