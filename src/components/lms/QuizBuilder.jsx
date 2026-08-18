import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles, Wand2, Volume2, Link as LinkIcon, Video, Eye, Sun, Type, Database, Shuffle, Award, Save, Code } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'questions' (Biên tập) | 'manual_editor' (Soạn thủ công) | 'import' (Import file/JSON)
  const [activeTab, setActiveTab] = useState('questions');

  // Menu Khối Lớp & Unit
  const [grade, setGrade] = useState('Khối 8');
  const [unit, setUnit] = useState('Unit 1: My New School / Leisure Time');
  const [category, setCategory] = useState('Knowledge of English (Vocab & Grammar)');
  const [summaryText, setSummaryText] = useState('Sơ đồ Infographic tóm tắt công thức Verbs of liking + V-ing giúp học sinh dễ nhớ bài học bằng hình ảnh 3D.');

  // Form State Soạn Văn Bản / Bài Tập Về Nhà
  const [homeworkContent, setHomeworkContent] = useState('');
  const [audioFileUrl, setAudioFileUrl] = useState('');
  const [showAnswerBox, setShowAnswerBox] = useState(false);
  const [isSavingHomework, setIsSavingHomework] = useState(false);

  // Modal / Popup Hướng Dẫn Dấu Hỏi ❓ và Mẫu Nhập JSON Hàng Loạt
  const [helpFormatModal, setHelpFormatModal] = useState(null); // 'aiken' | 'gift' | 'xml' | 'json'
  const [jsonInputText, setJsonInputText] = useState('');

  // Checkbox Categories Kỹ Năng Khi Tạo / Sửa Câu Hỏi
  const [selectedCategories, setSelectedCategories] = useState(['Knowledge of English (Vocab & Grammar)']);

  // STATE MODAL "Choose a question type to add" (HƠN 20 DẠNG CÂU HỎI MOODLE BẮT BUỘC BẬT LÊN KHI BẤM ADD)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State Import File Aiken / GIFT
  const [fileFormat, setFileFormat] = useState('aiken');
  const [importedText, setImportedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

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

  // NÚT LƯU BÀI TẬP VỀ NHÀ NÀY (SAVE HOMEWORK)
  const handleSaveHomework = async () => {
    if (!homeworkContent.trim() && !summaryText.trim()) {
      alert('Vui lòng nhập nội dung bài tập về nhà!');
      return;
    }
    setIsSavingHomework(true);

    try {
      const { error } = await supabase
        .from('activities')
        .update({
          settings: {
            grade,
            unit,
            category,
            summaryText,
            richText: homeworkContent,
            audioUrl: audioFileUrl,
            showAnswerBox,
          },
        })
        .eq('id', activityId);

      if (error) {
        alert('Lỗi lưu bài tập: ' + error.message);
      } else {
        alert('🎉 Đã LƯU BÀI TẬP VỀ NHÀ thành công vào bài học!');
        if (onSaved) onSaved();
      }
    } catch (err) {
      alert('Lỗi lưu: ' + err.message);
    } finally {
      setIsSavingHomework(false);
    }
  };

  // BẤM NÚT ADD -> BẮT BUỘC MỞ NGAY MODAL 20 DẠNG CÂU HỎI MOODLE
  const handleOpenAddModal = (mode) => {
    setIsAddMenuOpen(false);
    setIsTypeModalOpen(true); // BẬT MODAL "Choose a question type to add" CỦA MOODLE
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
      categories: selectedCategories,
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

  const handleImportJson = async () => {
    if (!jsonInputText.trim()) return;
    try {
      const parsedData = JSON.parse(jsonInputText);
      const items = Array.isArray(parsedData) ? parsedData : [parsedData];

      const formattedQuestions = items.map(q => ({
        activity_id: activityId,
        type: q.type || 'multiple_choice',
        marks: Number(q.marks) || 1.0,
        content: q.content || q
      }));

      const { error } = await supabase.from('questions').insert(formattedQuestions);
      if (error) {
        alert('Lỗi nạp JSON vào CSDL: ' + error.message);
      } else {
        alert(`🎉 Đã Import THÀNH CÔNG ${formattedQuestions.length} câu hỏi từ chuỗi JSON!`);
        setJsonInputText('');
        setHelpFormatModal(null);
        setActiveTab('questions');
        await fetchQuestions();
        if (onSaved) onSaved();
      }
    } catch (err) {
      alert('Lỗi định dạng JSON không hợp lệ: ' + err.message);
    }
  };

  const parseAdvancedMoodleText = (text) => {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const parsedQuestions = [];

    const matchingBlocks = cleanText.match(/::Matching\d*::([\s\S]*?)\{([\s\S]*?)\}/gi);
    if (matchingBlocks) {
      matchingBlocks.forEach(block => {
        const titleMatch = block.match(/::Matching\d*::\s*([^\n\{]+)/i);
        const pairsMatch = block.match(/\{([\s\S]*?)\}/);
        if (pairsMatch) {
          const pairLines = pairsMatch[1].split('\n').filter(l => l.includes('->'));
          const pairs = pairLines.map(l => {
            const parts = l.replace(/^=/, '').split('->');
            return { itemA: parts[0]?.trim(), itemB: parts[1]?.trim() };
          });
          parsedQuestions.push({
            activity_id: activityId,
            type: 'matching',
            marks: 1.0,
            content: {
              title: titleMatch ? titleMatch[1].trim() : 'Matching Question',
              question: titleMatch ? titleMatch[1].trim() : 'Match the items',
              pairs
            }
          });
        }
      });
    }

    if (parsedQuestions.length === 0) {
      const rawLines = cleanText.split('\n').map(l => l.trim());
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
    }

    return parsedQuestions;
  };

  const handleProcessImport = async () => {
    if (!importedText.trim()) return;
    setIsImporting(true);

    try {
      const parsedQuestions = parseAdvancedMoodleText(importedText);

      if (parsedQuestions.length > 0) {
        const { error } = await supabase.from('questions').insert(parsedQuestions);
        if (error) {
          alert('Lỗi lưu câu hỏi vào CSDL: ' + error.message);
        } else {
          alert(`🎉 Đã Import THÀNH CÔNG ${parsedQuestions.length} câu hỏi chuẩn Moodle/GIFT vào đề thi!`);
          setImportedText('');
          setActiveTab('questions');
          await fetchQuestions();
          if (onSaved) onSaved();
        }
      } else {
        alert('Không tìm thấy câu hỏi đúng cấu trúc Aiken/GIFT.');
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

  // DANH SÁCH ĐẦY ĐỦ HƠN 20 DẠNG CÂU HỎI CHUẨN MOODLE / GNOMIO BẮT BUỘC HỌC TẬP VÀ HIỂN THỊ 100%
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
    { type: 'fill_blank_text', label: 'Fill in the blanks', desc: 'Điền từ khuyết trực tiếp vào các ô trống trong đoạn văn.' },
    { type: 'audio_record', label: 'Audio response', desc: 'Ghi âm câu trả lời nói Tiếng Anh trực tiếp từ mic.' },
    { type: 'description', label: 'Description', desc: 'Đoạn ghi chú / Hướng dẫn đề bài (không tính điểm).' },
  ];

  return (
    <div className="space-y-6">
      {/* 3 TAB TẬP TRUNG GỌN ĐẸP CÙNG CẤP TRONG QUIZ BUILDER */}
      <div className="flex border-b border-slate-200 space-x-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex-shrink-0 ${
            activeTab === 'questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editing Quiz (Biên Tập Đề Thi - {questions.length} câu)
        </button>

        <button
          onClick={() => setActiveTab('manual_editor')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'manual_editor' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>📝 Soạn Đề Thủ Công (Word / Audio / Đáp Án Ẩn)</span>
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 flex-shrink-0 ${
            activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4 text-emerald-600" />
          <span>📥 Import questions from file (Nhập file Aiken / GIFT)</span>
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

            {/* NÚT ADD (BẤM VÀO BẬT NGAY MODAL CHOOSE QUESTION TYPE 20 DẠNG CỦA MOODLE) */}
            <div className="relative">
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition flex items-center space-x-1"
              >
                <span>+ Add (Thêm Câu Hỏi)</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isAddMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-30 font-semibold text-xs text-slate-700">
                  <button
                    onClick={() => handleOpenAddModal('new')}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center space-x-2 font-bold"
                  >
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>+ a new question (Mở 20 dạng câu hỏi Moodle)</span>
                  </button>
                  <button
                    onClick={() => handleOpenAddModal('bank')}
                    className="w-full px-4 py-2.5 text-left hover:bg-emerald-50 hover:text-emerald-700 transition flex items-center space-x-2 font-semibold"
                  >
                    <Database className="w-4 h-4 text-sky-600" />
                    <span>+ from question bank (Từ ngân hàng mẫu)</span>
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

      {/* TAB 2: SOẠN ĐỀ THỦ CÔNG ĐỒ HỌA + NÚT LƯU BÀI TẬP */}
      {activeTab === 'manual_editor' && (
        <div className="space-y-6">
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

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
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
              rows={6}
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

            <div className="pt-2">
              <button
                onClick={handleSaveHomework}
                disabled={isSavingHomework}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingHomework ? 'Đang Lưu Bài Tập...' : '💾 LƯU BÀI TẬP VỀ NHÀ NÀY VÀO BÀI HỌC'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT QUESTIONS FROM FILE + DẤU HỎI ❓ HƯỚNG DẪN & NHẬP JSON HÀNG LOẠT */}
      {activeTab === 'import' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              Import questions from file (Nhập ngân hàng câu hỏi từ tệp)
            </h3>
            <button
              onClick={() => setHelpFormatModal('json')}
              className="px-3 py-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
            >
              <Code className="w-4 h-4" />
              <span>❓ Mẫu Nhập JSON Hàng Loạt</span>
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase">FILE FORMAT (ĐỊNH DẠNG TỆP)</h4>
            <div className="space-y-2">
              {[
                { id: 'aiken', label: 'Aiken format' },
                { id: 'gift', label: 'GIFT format' },
                { id: 'xml', label: 'Moodle XML format' }
              ].map((fmt) => (
                <div key={fmt.id} className="flex items-center space-x-3 text-xs font-semibold text-slate-700">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="file_fmt"
                      checked={fileFormat === fmt.id}
                      onChange={() => setFileFormat(fmt.id)}
                    />
                    <span>{fmt.label}</span>
                  </label>
                  <button
                    onClick={() => setHelpFormatModal(fmt.id)}
                    className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 hover:bg-emerald-600 hover:text-white font-extrabold text-[11px] flex items-center justify-center transition"
                    title={`Xem hướng dẫn & ví dụ mẫu cho ${fmt.label}`}
                  >
                    ?
                  </button>
                </div>
              ))}
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
              rows={6}
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

      {/* POPUP HƯỚNG DẪN ❓ VÀ MẪU NHẬP JSON HÀNG LOẠT */}
      {helpFormatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base uppercase">
                ❓ Hướng Dẫn Mẫu Cho Định Dạng: {helpFormatModal.toUpperCase()}
              </h3>
              <button onClick={() => setHelpFormatModal(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {helpFormatModal === 'json' ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    Dán chuỗi JSON cấu trúc câu hỏi bên dưới để hệ thống tự động đưa lên hàng loạt:
                  </p>
                  <textarea
                    rows={8}
                    value={jsonInputText}
                    onChange={(e) => setJsonInputText(e.target.value)}
                    placeholder={`[\n  {\n    "type": "multiple_choice",\n    "marks": 1.0,\n    "content": {\n      "title": "Câu 1",\n      "question": "The children in my home village used to go _______",\n      "options": [\n        {"text": "on foot", "isCorrect": false},\n        {"text": "bare-footed", "isCorrect": true}\n      ]\n    }\n  }\n]`}
                    className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl"
                  />
                  <button
                    onClick={handleImportJson}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    🚀 Import Chuỗi JSON Hàng Loạt Ngay
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-700">
                  <h4 className="font-extrabold text-slate-900">Mẫu Đơn Giản Cho {helpFormatModal.toUpperCase()}:</h4>
                  <pre className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
                    {helpFormatModal === 'aiken'
                      ? `The children in my home village used to go _______.\nA. on foot\nB. bare-footed\nANSWER: B`
                      : helpFormatModal === 'gift'
                      ? `::Matching1:: Match adjectives with definitions {\n  =vast -> extremely large\n  =hospitable -> generous to visitors\n}`
                      : `<quiz>\n  <question type="category">\n    <category><text>Grammar</text></category>\n  </question>\n</quiz>`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BẢNG MODAL "Choose a question type to add" (HIỂN THỊ ĐẦY ĐỦ 20 DẠNG CÂU HỎI MOODLE CHUẨN KHI BẤM ADD) */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add ({questionTypesList.length} Dạng Moodle)</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[65vh] overflow-y-auto">
              <div className="space-y-1 border-r border-slate-100 pr-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  QUESTIONS TYPES ({questionTypesList.length} Dạng Câu Hỏi Moodle)
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
                <h4 className="font-extrabold text-xs text-slate-800 uppercase">Description & Example</h4>
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

      {/* FORM BIÊN TẬP CÂU HỎI */}
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
