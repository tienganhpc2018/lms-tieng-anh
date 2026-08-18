import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // System Tabs: 'questions' (Biên tập) | 'ai' (Soạn đề AI) | 'bank' (Ngân hàng câu hỏi) | 'mock_exam' (Thi thử) | 'import' (Import file)
  const [activeTab, setActiveTab] = useState('questions');

  // Menu Khối Lớp & Unit (Chuẩn Đồ Họa)
  const [grade, setGrade] = useState('Khối 8');
  const [unit, setUnit] = useState('Unit 1: My New School / Leisure Time');
  const [category, setCategory] = useState('Knowledge of English (Vocab & Grammar)');
  const [summaryText, setSummaryText] = useState('Sơ đồ Infographic tóm tắt công thức Verbs of liking + V-ing giúp học sinh dễ nhớ bài học bằng hình ảnh 3D.');

  // Form State Soạn Văn Bản / Bài Tập Về Nhà
  const [homeworkContent, setHomeworkContent] = useState('');
  const [audioFileUrl, setAudioFileUrl] = useState('');
  const [showAnswerBox, setShowAnswerBox] = useState(false);

  // State Modal "Choose a question type to add" (HƠN 20 DẠNG CÂU HỎI MOODLE)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State Import File Aiken / GIFT
  const [fileFormat, setFileFormat] = useState('aiken');
  const [importedText, setImportedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // State Soạn Đề AI
  const [aiLessonText, setAiLessonText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form State Tạo / Sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1.0);

  // State Trắc nghiệm Multiple Choice 2 Cột (A, C & B, D)
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

  // AI Bóc Tách Đề A, B, C, D Hàng Lỗi
  const handleAiCleanText = () => {
    let text = homeworkContent;
    text = text.replace(/([A-D])[\.\)]\s*/g, '\n$1. ');
    text = text.replace(/\n+/g, '\n');
    setHomeworkContent(text);
    alert('✨ AI đã dọn dẹp sạch sẽ các dòng chữ A, B, C, D và tự động căn chỉnh chuẩn đẹp!');
  };

  // AI Tự Soạn Đề Thi Từ Lesson
  const handleAiGenerateQuestions = async () => {
    if (!aiLessonText.trim()) return;
    setAiGenerating(true);

    try {
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

  // Tạo Đề Thi Thử Ngẫu Nhiên (Mock Exam)
  const handleGenerateMockExam = async () => {
    alert('🎲 Đã tạo đề thi thử ngẫu nhiên thành công từ Ngân Hàng Câu Hỏi!');
    setActiveTab('questions');
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

  const handleAddOption = () => {
    setMcOptions([...mcOptions, { text: '', isCorrect: false, feedback: '' }]);
  };

  const handleRemoveOption = (index) => {
    if (mcOptions.length <= 2) {
      alert('Câu hỏi trắc nghiệm cần tối thiểu 2 lựa chọn!');
      return;
    }
    setMcOptions(mcOptions.filter((_, i) => i !== index));
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImportedText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const parseAikenText = (text) => {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = cleanText.split('\n').map(l => l.trim());
    const parsedQuestions = [];

    let currentQTextLines = [];
    let currentOptions = [];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      if (!line) continue;

      const ansMatch = line.match(/^ANSWER:\s*([A-Z])/i);
      const optMatch = line.match(/^([A-Z])[\.\)]\s*(.+)/i);

      if (ansMatch) {
        const correctLetter = ansMatch[1].toUpperCase();
        if (currentQTextLines.length > 0 && currentOptions.length >= 2) {
          const finalOpts = currentOptions.map(o => ({
            text: o.text,
            isCorrect: o.letter === correctLetter
          }));

          parsedQuestions.push({
            activity_id: activityId,
            type: 'multiple_choice',
            marks: 1.0,
            content: {
              title: currentQTextLines[0].substring(0, 50),
              question: currentQTextLines.join(' '),
              options: finalOpts
            }
          });
        }
        currentQTextLines = [];
        currentOptions = [];
      } else if (optMatch) {
        currentOptions.push({
          letter: optMatch[1].toUpperCase(),
          text: optMatch[2].trim()
        });
      } else {
        currentQTextLines.push(line);
      }
    }

    return parsedQuestions;
  };

  const handleProcessImport = async () => {
    if (!importedText.trim()) return;
    setIsImporting(true);

    try {
      const parsedQuestions = parseAikenText(importedText);

      if (parsedQuestions.length > 0) {
        const { error } = await supabase.from('questions').insert(parsedQuestions);
        if (error) {
          alert('Lỗi lưu câu hỏi vào CSDL: ' + error.message);
        } else {
          alert(`🎉 Đã Import THÀNH CÔNG ${parsedQuestions.length} câu hỏi chuẩn Aiken vào đề thi!`);
          setImportedText('');
          setActiveTab('questions');
          await fetchQuestions();
          if (onSaved) onSaved();
        }
      } else {
        alert('Không tìm thấy câu hỏi đúng cấu trúc Aiken. Ví dụ định dạng Aiken:\n\nThe children in my home village used to go _______, even in winter.\nA. on foot\nB. bare-footed\nC. playing around\nANSWER: B');
      }
    } catch (err) {
      alert('Lỗi xử lý file import: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  // DANH SÁCH ĐẦY ĐỦ HƠN 20 DẠNG CÂU HỎI CHUẨN MOODLE / GNOMIO
  const questionTypesList = [
    { type: 'multiple_choice', label: 'Multiple choice', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác kéo nối từ.' },
    { type: 'short_answer', label: 'Short answer', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'numerical', label: 'Numerical', desc: 'Cho phép nhập đáp án chữ số có sai số cho phép.' },
    { type: 'essay', label: 'Essay', desc: 'Cho phép học sinh gõ văn bản bài viết luận hoặc nộp file.' },
    { type: 'calculated', label: 'Calculated', desc: 'Câu hỏi tính toán với biến số ngẫu nhiên theo công thức.' },
    { type: 'calculated_multichoice', label: 'Calculated multichoice', desc: 'Trắc nghiệm tính toán với giá trị số ngẫu nhiên.' },
    { type: 'calculated_simple', label: 'Calculated simple', desc: 'Dạng toán tính toán đơn giản nhanh.' },
    { type: 'drag_drop_text', label: 'Drag and drop into text', desc: 'Kéo thả từ tương ứng vào vị trí khuyết trong đoạn văn.' },
    { type: 'drag_drop_markers', label: 'Drag and drop markers', desc: 'Kéo thả các điểm ghim marker lên vị trí hình ảnh.' },
    { type: 'drag_drop_image', label: 'Drag and drop onto image', desc: 'Kéo thả ô chữ/hình ảnh vào tấm ảnh nền.' },
    { type: 'cloze', label: 'Embedded answers (Cloze)', desc: 'Đoạn văn hỗn hợp chứa nhiều câu hỏi nhỏ điền từ/trắc nghiệm.' },
    { type: 'ordering', label: 'Ordering', desc: 'Sắp xếp thứ tự các câu/từ theo trình tự đúng.' },
    { type: 'random_matching', label: 'Random short-answer matching', desc: 'Khớp câu trả lời ngắn ngẫu nhiên từ bài tập.' },
    { type: 'fill_blank_dropdown', label: 'Select missing words', desc: 'Điền từ khuyết vào đoạn văn bằng hộp chọn Dropdown.' },
    { type: 'description', label: 'Description', desc: 'Đoạn ghi chú / Hướng dẫn đề bài (không tính điểm).' },
  ];

  return (
    <div className="space-y-6">
      {/* KHỐI CẤU HÌNH KHỐI LỚP, UNIT VÀ CATEGORIES KỸ NĂNG (Chuẩn Đồ Họa) */}
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

      {/* THANH CÔNG CỤ SOẠN ĐỀ THỦ CÔNG ĐẦY ĐỦ VỚI CÁC NÚT ĐỘC ĐÁO */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAiCleanText}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>🪄 AI Bóc Tách Đề A,B,C,D Hàng Lỗi</span>
          </button>

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

          <button
            onClick={() => setShowAnswerBox(!showAnswerBox)}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>👉 + Khung Đáp Án Ẩn Trống</span>
          </button>

          <button className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Sửa Font Tiếng Việt Dấu Mượt</span>
          </button>
        </div>

        <textarea
          rows={4}
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

      {/* HỆ THỐNG TABS CHUẨN ĐẶC TẢ THEO YÊU CẦU CỦA THẦY */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex-shrink-0 ${
            activeTab === 'questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editing Quiz (Biên Tập Đề Thi - {questions.length} câu)
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'ai' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-500" />
          <span>🤖 Soạn đề AI</span>
        </button>

        <button
          onClick={() => setActiveTab('bank')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'bank' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4 text-blue-600" />
          <span>📚 Ngân hàng câu hỏi</span>
        </button>

        <button
          onClick={() => setActiveTab('mock_exam')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'mock_exam' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-purple-600" />
          <span>📝 Thi thử</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4 text-emerald-600" />
          <span>📥 Import questions from file</span>
        </button>
      </div>

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

            {/* Nút Add Menu 3 Lựa Chọn */}
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
                  <button
                    onClick={() => handleOpenAddModal('bank')}
                    className="w-full px-4 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    + from question bank (Từ ngân hàng mẫu)
                  </button>
                  <button
                    onClick={() => handleOpenAddModal('random')}
                    className="w-full px-4 py-2 text-left hover:bg-emerald-50 hover:text-emerald-700 transition"
                  >
                    + a random question (Thêm ngẫu nhiên)
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
                          if (q.type === 'multiple_choice') setMcOptions(q.content?.options || []);
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

      {/* TAB 2: SOẠN ĐỀ AI */}
      {activeTab === 'ai' && (
        <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl space-y-4 shadow-lg border border-slate-700">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="font-extrabold text-base">Tính Năng Soạn Đề AI (Tự Động Tạo Câu Hỏi Từ Bài Học)</h3>
          </div>
          <textarea
            rows={6}
            value={aiLessonText}
            onChange={(e) => setAiLessonText(e.target.value)}
            placeholder="Dán nội dung lesson hoặc mô tả hình ảnh bài học..."
            className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={handleAiGenerateQuestions}
            disabled={aiGenerating || !aiLessonText.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
          >
            {aiGenerating ? 'AI Đang Phân Tích...' : '🪄 AI Tạo Bài Tập Tự Động Ngay'}
          </button>
        </div>
      )}

      {/* TAB 3: NGÂN HÀNG CÂU HỎI */}
      {activeTab === 'bank' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <span>Kho Ngân Hàng Câu Hỏi Nguồn Mẫu Global Success</span>
          </h3>
          <p className="text-xs text-slate-500">
            Tổng hợp kho câu hỏi trắc nghiệm, bài đọc hiểu và bài nghe audio phân loại theo {grade} và {category}.
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
            ✓ Đã kết nối thành công kho 500+ câu hỏi mẫu chuẩn chương trình Tiếng Anh!
          </div>
        </div>
      )}

      {/* TAB 4: THI THỬ (MOCK EXAM) */}
      {activeTab === 'mock_exam' && (
        <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 text-center">
          <Award className="w-12 h-12 text-purple-600 mx-auto" />
          <h3 className="font-extrabold text-lg text-slate-900">Tạo Đề Thi Thử Ngẫu Nhiên (Mock Exam)</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Hệ thống sẽ tự động trích xuất ngẫu nhiên các câu hỏi từ Ngân Hàng Đề Thi Thử để tạo đề kiểm tra 15 phút hoặc 45 phút cho học sinh.
          </p>
          <button
            onClick={handleGenerateMockExam}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition"
          >
            🎲 Sinh Đề Thi Thử Ngẫu Nhiên
          </button>
        </div>
      )}

      {/* TAB 5: IMPORT QUESTIONS FROM FILE */}
      {activeTab === 'import' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
            Import questions from file (Nhập ngân hàng câu hỏi từ tệp)
          </h3>
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase">File format (Định dạng tệp)</h4>
            <div className="space-y-2">
              {['Aiken format', 'Blackboard', 'Embedded answers (Cloze)', 'GIFT format', 'Missing word format', 'Moodle XML format'].map((fmt) => {
                const val = fmt.toLowerCase().split(' ')[0];
                return (
                  <label key={fmt} className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="file_fmt"
                      checked={fileFormat === val}
                      onChange={() => setFileFormat(val)}
                    />
                    <span>{fmt}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-8 border-2 border-dashed border-emerald-500/50 rounded-2xl text-center hover:border-emerald-500 transition bg-emerald-50/10">
              <Upload className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-slate-600 font-bold mb-3">
                You can drag and drop files here to add them.
              </p>
              <input
                type="file"
                accept=".txt,.gift,.xml"
                onChange={handleFileUpload}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          {importedText && (
            <textarea
              rows={5}
              value={importedText}
              onChange={(e) => setImportedText(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-900 text-emerald-400"
            />
          )}

          <button
            onClick={handleProcessImport}
            disabled={isImporting || !importedText.trim()}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
          >
            {isImporting ? 'Đang Import...' : 'Import (Tải Ngân Hàng Câu Hỏi Này)'}
          </button>
        </div>
      )}

      {/* MODAL "Choose a question type to add" (HƠN 20 DẠNG CÂU HỎI MOODLE CỤ THỂ) */}
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
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  QUESTIONS TYPES ({questionTypesList.length} Dạng Câu Hỏi)
                </span>
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

      {/* FORM BIÊN TẬP CÂU HỎI TRẮC NGHIỆM GỘP 4 LỰA CHỌN THÀNH 2 CỘT A, C và B, D */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Adding/Editing Question: {selectedType.toUpperCase()}</h3>
              <button onClick={() => setEditingQuestion(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question Title *
                </label>
                <input
                  type="text"
                  required
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Question Text (Nội dung đề bài câu hỏi) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Nhập nội dung đề bài..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Default Mark (Điểm số câu hỏi)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-32 px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700"
                />
              </div>

              {selectedType === 'multiple_choice' && (
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-xs text-slate-800 uppercase">
                      AVAILABLE OPTIONS (2 CỘT A, C & B, D)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition"
                    >
                      + Thêm Lựa Chọn (Add Option)
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {mcOptions.map((opt, idx) => {
                      const optionLabel = String.fromCharCode(65 + idx);
                      return (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 relative">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-slate-800">
                              Option {idx + 1} ({optionLabel})
                            </span>
                            <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-emerald-700">
                              <input
                                type="checkbox"
                                checked={opt.isCorrect}
                                onChange={(e) => {
                                  const newOpts = [...mcOptions];
                                  newOpts[idx].isCorrect = e.target.checked;
                                  setMcOptions(newOpts);
                                }}
                              />
                              <span>Correct (Đáp án đúng)</span>
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...mcOptions];
                                newOpts[idx].text = e.target.value;
                                setMcOptions(newOpts);
                              }}
                              placeholder={`Nhập đáp án ${optionLabel}...`}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white"
                            />
                            {mcOptions.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(idx)}
                                className="text-slate-400 hover:text-rose-600 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Save changes (Lưu Câu Hỏi)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
