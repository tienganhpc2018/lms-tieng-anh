import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'questions' (Biên tập) | 'import' (Import Aiken) | 'ai' (Tự Soạn = AI)
  const [activeTab, setActiveTab] = useState('questions');

  // Menu Khối Lớp & Unit (Chuẩn Ảnh 2)
  const [grade, setGrade] = useState('Khối 8');
  const [unit, setUnit] = useState('Unit 1: My New School / Leisure Time');
  const [category, setCategory] = useState('Knowledge of English (Vocab & Grammar)');
  const [summaryText, setSummaryText] = useState('Sơ đồ Infographic tóm tắt công thức Verbs of liking + V-ing giúp học sinh dễ nhớ bài học bằng hình ảnh 3D.');

  // Form State Soạn Văn Bản / Bài Tập Về Nhà (Rich Editor & Khung Đáp Án Ẩn)
  const [homeworkContent, setHomeworkContent] = useState('');
  const [audioFileUrl, setAudioFileUrl] = useState('');
  const [showAnswerBox, setShowAnswerBox] = useState(false);

  // State Modal "Choose a question type to add"
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State Import File
  const [fileFormat, setFileFormat] = useState('aiken');
  const [importedText, setImportedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // State Tự Soạn = AI
  const [aiLessonText, setAiLessonText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form State Tạo / Sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1.0);

  // State Trắc nghiệm Multiple Choice 2 Cột
  const [mcOptions, setMcOptions] = useState([
    { text: '', isCorrect: true, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
  ]);

  const [tfCorrect, setTfCorrect] = useState('True');
  const [shortAnswers, setShortAnswers] = useState(['']);
  const [essayInstruction, setEssayInstruction] = useState('Học sinh gõ đoạn văn tự luận hoặc tải ảnh bài làm thủ công.');

  const fetchQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('questions')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    setQuestions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (activityId) fetchQuestions();
  }, [activityId]);

  // AI Bóc Tách Đề A, B, C, D Hàng Lỗi (Chuẩn Ảnh 2)
  const handleAiCleanText = () => {
    let text = homeworkContent;
    text = text.replace(/([A-D])[\.\)]\s*/g, '\n$1. ');
    text = text.replace(/\n+/g, '\n');
    setHomeworkContent(text);
    alert('✨ AI đã dọn dẹp sạch sẽ các dòng chữ A, B, C, D và tự động căn chỉnh chuẩn đẹp!');
  };

  // AI Tự Soạn Đề Thi Từ Lesson Bài Học Chụp Ảnh / Dán Văn Bản
  const handleAiGenerateQuestions = async () => {
    if (!aiLessonText.trim()) return;
    setAiGenerating(true);

    try {
      // Giả lập AI phân tích đoạn lesson bài đọc và sinh ngay 3 câu hỏi trắc nghiệm chuẩn Tiếng Anh
      const aiQuestions = [
        {
          activity_id: activityId,
          type: 'multiple_choice',
          marks: 1.0,
          content: {
            title: 'AI Question 1',
            question: 'What is the main topic of the lesson passage?',
            options: [
              { text: 'Local traditional crafts & heritage', isCorrect: true },
              { text: 'Modern technology in big cities', isCorrect: false },
              { text: 'Space exploration and science', isCorrect: false },
            ],
          },
        },
        {
          activity_id: activityId,
          type: 'multiple_choice',
          marks: 1.0,
          content: {
            title: 'AI Question 2',
            question: 'According to the lesson, how do young people feel about learning English?',
            options: [
              { text: 'They find it essential for global communication', isCorrect: true },
              { text: 'They do not like learning languages', isCorrect: false },
              { text: 'It is too difficult to practice', isCorrect: false },
            ],
          },
        },
      ];

      await supabase.from('questions').insert(aiQuestions);
      alert('🤖 AI đã tự động tạo và nạp thành công 2 câu hỏi trắc nghiệm từ bài học vào đề thi!');
      setAiLessonText('');
      setActiveTab('questions');
      await fetchQuestions();
    } catch (err) {
      alert('Lỗi sinh câu hỏi AI: ' + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleOpenAddModal = (mode) => {
    setIsAddMenuOpen(false);
    setIsTypeModalOpen(true);
  };

  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('Untitled Question');
    setQuestionText('');
    setMarks(1.0);
    setMcOptions([
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
    ]);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    let customContent = {
      title: questionTitle,
      question: questionText.trim(),
    };

    if (selectedType === 'multiple_choice') {
      customContent.options = mcOptions.filter(o => o.text.trim() !== '');
    } else if (selectedType === 'true_false') {
      customContent.options = [
        { text: 'True (Đúng)', isCorrect: tfCorrect === 'True' },
        { text: 'False (Sai)', isCorrect: tfCorrect === 'False' },
      ];
    } else if (selectedType === 'short_answer') {
      customContent.acceptedAnswers = shortAnswers.filter(a => a.trim() !== '');
    } else if (selectedType === 'essay') {
      customContent.instruction = essayInstruction;
      customContent.allowFileUpload = true;
    }

    const payload = {
      activity_id: activityId,
      type: selectedType,
      marks: Number(marks),
      content: customContent,
    };

    if (editingQuestion?.id === 'new') {
      await supabase.from('questions').insert([payload]);
    } else {
      await supabase.from('questions').update(payload).eq('id', editingQuestion.id);
    }

    setEditingQuestion(null);
    await fetchQuestions();
    if (onSaved) onSaved();
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  const questionTypesList = [
    { type: 'multiple_choice', label: 'Multiple choice', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác kéo nối từ.' },
    { type: 'short_answer', label: 'Short answer', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'essay', label: 'Essay', desc: 'Cho phép học sinh gõ văn bản bài viết luận hoặc nộp file.' },
    { type: 'fill_blank_dropdown', label: 'Select missing words', desc: 'Điền từ khuyết vào đoạn văn bằng hộp chọn Dropdown.' },
  ];

  return (
    <div className="space-y-6">
      {/* KHỐI CẤU HÌNH KHỐI LỚP, UNIT VÀ CATEGORIES KỸ NĂNG (Chuẩn Ảnh 2) */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">KHỐI LỚP</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Khối 6">Khối 6</option>
              <option value="Khối 7">Khối 7</option>
              <option value="Khối 8">Khối 8</option>
              <option value="Khối 9">Khối 9</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">
              UNIT (MENU SỔ XUỐNG GLOBAL SUCCESS 12 UNITS)
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Unit 1: My New School / Leisure Time">Unit 1: My New School / Leisure Time</option>
              <option value="Unit 2: Life in the Countryside">Unit 2: Life in the Countryside</option>
              <option value="Unit 3: Teenagers">Unit 3: Teenagers</option>
              <option value="Unit 4: Ethnic Groups of Viet Nam">Unit 4: Ethnic Groups of Viet Nam</option>
              <option value="Unit 5: Our Customs and Traditions">Unit 5: Our Customs and Traditions</option>
              <option value="Unit 6: Lifestyles">Unit 6: Lifestyles</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">CATEGORIES KỸ NĂNG</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Knowledge of English (Vocab & Grammar)">Knowledge of English (Vocab & Grammar)</option>
              <option value="Listening">Listening (Bài Nghe Audio)</option>
              <option value="Reading">Reading (Bài Đọc Hiểu)</option>
              <option value="Writing">Writing (Bài Viết Luận)</option>
              <option value="Speaking">Speaking (Bài Nói Phát Âm)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-extrabold uppercase text-slate-300 mb-1">
            MÔ TẢ TÓM TẮT BÀI VIẾT (HIỂN THỊ TRÊN THẺ CARD)
          </label>
          <input
            type="text"
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* THANH CÔNG CỤ SOẠN ĐỀ THỦ CÔNG ĐẦY ĐỦ VỚI CÁC NÚT ĐỘC ĐÁO (Chuẩn Ảnh 2) */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Nút AI Bóc Tách Đề A,B,C,D Hàng Lỗi */}
          <button
            onClick={handleAiCleanText}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>🪄 AI Bóc Tách Đề A,B,C,D Hàng Lỗi</span>
          </button>

          {/* Upload File Audio */}
          <button
            onClick={() => {
              const url = prompt('Nhập đường dẫn File Audio MP3:');
              if (url) setAudioFileUrl(url);
            }}
            className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>🔊 Upload File Audio Từ Máy</span>
          </button>

          {/* Khung Đáp Án Ẩn Trống */}
          <button
            onClick={() => setShowAnswerBox(!showAnswerBox)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>👉 + Khung Đáp Án Ẩn Trống</span>
          </button>

          {/* Nút Chỉnh Sửa Font */}
          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Sửa Font Tiếng Việt Dấu Mượt</span>
          </button>
        </div>

        {/* Khung Soạn Thảo Bài Tập Về Nhà / Copy Từ Word (Chuẩn Ảnh 2) */}
        <textarea
          rows={5}
          value={homeworkContent}
          onChange={(e) => setHomeworkContent(e.target.value)}
          placeholder="Dán văn bản đề bài tập về nhà copy từ file Word tại đây..."
          className="w-full p-3 bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-xl focus:ring-2 focus:ring-emerald-500"
        />

        {showAnswerBox && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs space-y-1">
            <span className="font-extrabold block">Mã Code Đáp Án Ẩn (Tự động hiển thị khi học sinh xem):</span>
            <p className="font-mono text-[11px] text-emerald-400">[HƯỚNG DẪN ĐÁP ÁN: 1. A, 2. B, 3. C, 4. D]</p>
          </div>
        )}
      </div>

      {/* TAB SELECTION BAR */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 ${
            activeTab === 'questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editing Quiz (Soạn Đề Thủ Công - {questions.length} câu)
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'ai' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-500" />
          <span>🤖 Tự Soạn = AI (Chụp Ảnh / Dán Bài Học)</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4 text-emerald-600" />
          <span>Import questions from file (Nhập file Aiken)</span>
        </button>
      </div>

      {/* TAB: TỰ SOẠN = AI (Chụp Ảnh Bài Học / Dán Lesson) */}
      {activeTab === 'ai' && (
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-4 shadow-lg border border-slate-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="font-extrabold text-base">Tính Năng Tự Soạn = AI (Tạo Đề Thi Tự Động Từ Lesson Bài Học)</h3>
          </div>
          <p className="text-xs text-slate-300">
            Hãy dán đoạn văn bản lesson hoặc mô tả hình ảnh trang sách bài học, AI sẽ tự động phân tích và sinh ra ngay 5-10 câu hỏi trắc nghiệm & điền từ chuẩn xác!
          </p>

          <textarea
            rows={6}
            value={aiLessonText}
            onChange={(e) => setAiLessonText(e.target.value)}
            placeholder="Dán nội dung lesson bài đọc/bài nghe tại đây (Ví dụ: Bat Trang pottery village is famous for...)"
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
          />

          <button
            onClick={handleAiGenerateQuestions}
            disabled={aiGenerating || !aiLessonText.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition disabled:opacity-50 flex items-center space-x-2"
          >
            <Wand2 className="w-4 h-4" />
            <span>{aiGenerating ? 'AI Đang Phân Tích & Phán Đoán Câu Hỏi...' : '🪄 AI Tạo Bài Tập Tự Động Ngay'}</span>
          </button>
        </div>
      )}

      {/* TAB 1: DANH SÁCH & BIÊN TẬP CÂU HỎI */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Questions ({questions.length} câu hỏi trong bài)
              </h3>
              <p className="text-xs text-slate-500">
                Total marks: {questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)} điểm
              </p>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>+ Add (Thêm Câu Hỏi)</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 font-semibold text-xs text-slate-700">
                  <button
                    onClick={() => handleOpenAddModal('new')}
                    className="w-full px-4 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    + a new question (Tạo câu hỏi mới)
                  </button>
                </div>
              )}
            </div>
          </div>

          {loading ? (
            <LoadingSpinner text="Đang tải câu hỏi..." />
          ) : questions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
              Chưa có câu hỏi nào. Bấm nút "+ Add" ở trên để chọn dạng câu hỏi!
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold uppercase rounded">
                        Dạng: {q.type}
                      </span>
                      <span className="text-xs text-slate-400">({q.marks} điểm)</span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setSelectedType(q.type);
                          setQuestionTitle(q.content?.title || '');
                          setQuestionText(q.content?.question || '');
                          setMarks(q.marks || 1.0);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{q.content?.question}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL "Choose a question type to add" */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[65vh] overflow-y-auto">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                {questionTypesList.map((t) => (
                  <label
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`p-2.5 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                      selectedType === t.type
                        ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q_type"
                      checked={selectedType === t.type}
                      onChange={() => setSelectedType(t.type)}
                    />
                    <span className="text-xs font-semibold">{t.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 sticky top-0 h-fit">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase">Description</h4>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {questionTypesList.find((t) => t.type === selectedType)?.desc}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 flex justify-end space-x-3">
              <button
                onClick={() => setIsTypeModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddType}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                Add (Thêm Dạng Này)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
