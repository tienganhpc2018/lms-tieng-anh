import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Upload, FileUp, Sparkles } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'questions' (Danh sách câu hỏi) | 'import' (Import từ file chuẩn Ảnh 1)
  const [activeTab, setActiveTab] = useState('questions');

  // State Modal "Choose a question type to add" (Chuẩn Ảnh 2 & 3)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');

  // State Nút Add Menu (3 Lựa chọn: a new question, from question bank, a random question)
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State Import File (Chuẩn Ảnh 1)
  const [fileFormat, setFileFormat] = useState('aiken');
  const [importedText, setImportedText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form State Tạo / Sửa câu hỏi riêng biệt theo từng dạng
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1.0);

  // State riêng cho Multiple Choice (Trắc nghiệm)
  const [mcOptions, setMcOptions] = useState([
    { text: '', isCorrect: true, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
  ]);

  // State riêng cho True / False (Đúng / Sai)
  const [tfCorrect, setTfCorrect] = useState('True');

  // State riêng cho Short Answer (Điền từ ngắn)
  const [shortAnswers, setShortAnswers] = useState(['']);

  // State riêng cho Essay (Tự luận / Bài viết)
  const [essayInstruction, setEssayInstruction] = useState('Học sinh gõ đoạn văn tự luận hoặc tải ảnh bài làm thủ công.');

  // State riêng cho Matching (Nối từ Cột A - Cột B)
  const [matchingPairs, setMatchingPairs] = useState([
    { itemA: '', itemB: '' },
    { itemA: '', itemB: '' }
  ]);

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

  const handleOpenAddModal = (mode) => {
    setIsAddMenuOpen(false);
    if (mode === 'bank') {
      alert('Đã mở kho câu hỏi mẫu Moodle!');
    } else if (mode === 'random') {
      alert('Đã trích xuất ngẫu nhiên câu hỏi từ ngân hàng!');
    }
    setIsTypeModalOpen(true);
  };

  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('Untitled Question');
    setQuestionText('');
    setMarks(1.0);

    // Reset state theo từng dạng
    if (selectedType === 'true_false') {
      setTfCorrect('True');
    } else if (selectedType === 'short_answer') {
      setShortAnswers(['']);
    } else if (selectedType === 'essay') {
      setEssayInstruction('Học sinh nhập bài làm tự luận...');
    } else if (selectedType === 'matching') {
      setMatchingPairs([{ itemA: '', itemB: '' }, { itemA: '', itemB: '' }]);
    } else {
      setMcOptions([
        { text: '', isCorrect: true, feedback: '' },
        { text: '', isCorrect: false, feedback: '' },
        { text: '', isCorrect: false, feedback: '' },
        { text: '', isCorrect: false, feedback: '' },
      ]);
    }
  };

  // Xử lý Lưu Câu Hỏi tùy biến theo từng loại riêng biệt
  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    let customContent = {
      title: questionTitle,
      question: questionText.trim(),
    };

    // Tạo cấu trúc dữ liệu chuẩn cho từng loại riêng biệt
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
    } else if (selectedType === 'matching') {
      customContent.pairs = matchingPairs.filter(p => p.itemA.trim() !== '' && p.itemB.trim() !== '');
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

  // Xử lý Import File Định Dạng Aiken / GIFT (Chuẩn Ảnh 1)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setImportedText(evt.target.result);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = async () => {
    if (!importedText.trim()) return;
    setIsImporting(true);

    try {
      // Parser đơn giản định dạng Aiken (Moodle standard)
      const lines = importedText.split('\n');
      let currentQ = null;
      const parsedQuestions = [];

      lines.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        if (trimmed.startsWith('ANSWER:')) {
          if (currentQ) {
            const ansChar = trimmed.replace('ANSWER:', '').trim();
            const charIdx = ansChar.charCodeAt(0) - 65;
            if (currentQ.options[charIdx]) {
              currentQ.options[charIdx].isCorrect = true;
            }
            parsedQuestions.push(currentQ);
            currentQ = null;
          }
        } else if (/^[A-Z][\.\)]\s/.test(trimmed)) {
          if (currentQ) {
            currentQ.options.push({ text: trimmed.replace(/^[A-Z][\.\)]\s/, ''), isCorrect: false });
          }
        } else {
          if (!currentQ) {
            currentQ = {
              activity_id: activityId,
              type: 'multiple_choice',
              marks: 1.0,
              content: { title: 'Imported Question', question: trimmed, options: [] }
            };
          }
        }
      });

      if (parsedQuestions.length > 0) {
        await supabase.from('questions').insert(parsedQuestions);
        alert(`Đã Import thành công ${parsedQuestions.length} câu hỏi vào đề thi!`);
        setImportedText('');
        setActiveTab('questions');
        await fetchQuestions();
      } else {
        alert('Không tìm thấy câu hỏi đúng định dạng Aiken. Ví dụ định dạng Aiken:\n\nWhat is the capital of Vietnam?\nA. Hanoi\nB. Hue\nANSWER: A');
      }
    } catch (err) {
      alert('Lỗi import file: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này khỏi đề thi?')) return;
    await supabase.from('questions').delete().eq('id', id);
    await fetchQuestions();
  };

  // Danh sách các Dạng Câu Hỏi Moodle (Chuẩn Ảnh 2 & 3)
  const questionTypesList = [
    { type: 'multiple_choice', label: 'Multiple choice', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác kéo nối từ.' },
    { type: 'short_answer', label: 'Short answer', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'essay', label: 'Essay (Bài tập viết tự luận)', desc: 'Cho phép học sinh gõ văn bản bài viết luận hoặc nộp file.' },
    { type: 'fill_blank_dropdown', label: 'Select missing words', desc: 'Điền từ khuyết vào đoạn văn bằng hộp chọn Dropdown.' },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Header Bar (Chuẩn Ảnh 1) */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('questions')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 ${
            activeTab === 'questions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Editing Quiz (Biên Tập Đề Thi - {questions.length} câu)
        </button>

        <button
          onClick={() => setActiveTab('import')}
          className={`pb-3 text-xs font-extrabold transition border-b-2 flex items-center space-x-1.5 ${
            activeTab === 'import' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4 text-emerald-600" />
          <span>Import questions from file (Nhập từ file - Ảnh 1)</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH & BIÊN TẬP CÂU HỎI */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Questions ({questions.length} câu hỏi)
              </h3>
              <p className="text-xs text-slate-500">
                Total marks: {questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)} điểm
              </p>
            </div>

            {/* Nút Add Menu 3 Lựa Chọn (Chuẩn Ảnh 4) */}
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
              Chưa có câu hỏi nào. Bấm nút "+ Add" ở trên để chọn dạng câu hỏi hoặc chuyển qua tab "Import questions from file"!
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

                    {/* Nút Sửa & Xóa trực tiếp trong từng câu hỏi */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          setEditingQuestion(q);
                          setSelectedType(q.type);
                          setQuestionTitle(q.content?.title || '');
                          setQuestionText(q.content?.question || '');
                          setMarks(q.marks || 1.0);
                          if (q.type === 'multiple_choice') setMcOptions(q.content?.options || []);
                          if (q.type === 'short_answer') setShortAnswers(q.content?.acceptedAnswers || ['']);
                        }}
                        className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                        title="Chỉnh sửa câu hỏi"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        title="Xóa câu hỏi này"
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

      {/* TAB 2: IMPORT QUESTIONS FROM FILE (Chuẩn Ảnh 1) */}
      {activeTab === 'import' && (
        <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 border-b pb-3">
            Import questions from file (Nhập ngân hàng câu hỏi từ tệp)
          </h3>

          {/* Khối Chọn Định Dạng File Format (Chuẩn Ảnh 1) */}
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

          {/* Khối Choose a file / Drag and Drop (Chuẩn Ảnh 1) */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-extrabold text-slate-700 uppercase">Import questions from file</h4>
            
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-2xl text-center hover:border-emerald-500 transition bg-slate-50">
              <Upload className="w-10 h-10 text-slate-400 mx-auto mb-2" />
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
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Xem trước nội dung file:</label>
              <textarea
                rows={5}
                value={importedText}
                onChange={(e) => setImportedText(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-900 text-emerald-400"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleProcessImport}
              disabled={isImporting || !importedText.trim()}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50"
            >
              {isImporting ? 'Đang Import...' : 'Import (Tải Ngân Hàng Câu Hỏi Này)'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL "Choose a question type to add" (Chuẩn Ảnh 2 & 3) */}
      {isTypeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Choose a question type to add</h3>
              <button onClick={() => setIsTypeModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-1.5 border-r border-slate-100 pr-4">
                <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                  QUESTIONS TYPES
                </span>
                {questionTypesList.map((t) => (
                  <label
                    key={t.type}
                    onClick={() => setSelectedType(t.type)}
                    className={`p-3 rounded-xl border flex items-center space-x-3 cursor-pointer transition ${
                      selectedType === t.type
                        ? 'border-emerald-600 bg-emerald-50/60 text-emerald-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="q_type"
                      checked={selectedType === t.type}
                      onChange={() => setSelectedType(t.type)}
                    />
                    <span className="text-xs">{t.label}</span>
                  </label>
                ))}
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
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

      {/* FORM BIÊN TẬP CÂU HỎI TÙY BIẾN CHO TỪNG DẠNG (KHÔNG DÙNG CHUNG FORM TRẮC NGHIỆM!) */}
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

              {/* GIAO DIỆN RIÊNG CHO DẠNG ESSAY (TỰ LUẬN - KHÔNG HIỆN OPTION 1,2,3!) */}
              {selectedType === 'essay' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <h4 className="font-extrabold text-xs text-emerald-900 uppercase">Giao Diện Soạn Bài Tập Tự Luận / Viết Văn</h4>
                  <label className="block text-xs font-semibold text-emerald-800">Hướng dẫn cho Học sinh:</label>
                  <textarea
                    rows={2}
                    value={essayInstruction}
                    onChange={(e) => setEssayInstruction(e.target.value)}
                    className="w-full p-2.5 border border-emerald-300 rounded-xl text-xs bg-white"
                  />
                  <p className="text-[11px] text-emerald-700 italic">
                    ✓ Học sinh sẽ có ô gõ bài viết văn bản dài và nút cho phép Tải file ảnh chụp bài làm lên.
                  </p>
                </div>
              )}

              {/* GIAO DIỆN RIÊNG CHO DẠNG TRUE / FALSE (ĐÚNG / SAI) */}
              {selectedType === 'true_false' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase">Correct Answer (Chọn đáp án đúng)</h4>
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={tfCorrect === 'True'}
                        onChange={() => setTfCorrect('True')}
                      />
                      <span>True (Đúng)</span>
                    </label>

                    <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                      <input
                        type="radio"
                        name="tf_opt"
                        checked={tfCorrect === 'False'}
                        onChange={() => setTfCorrect('False')}
                      />
                      <span>False (Sai)</span>
                    </label>
                  </div>
                </div>
              )}

              {/* GIAO DIỆN RIÊNG CHO DẠNG SHORT ANSWER (ĐIỀN TỪ NGẮN) */}
              {selectedType === 'short_answer' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase">Accepted Correct Answers (Các từ chấp nhận đáp án đúng)</h4>
                  {shortAnswers.map((ans, aIdx) => (
                    <div key={aIdx} className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">Đáp án {aIdx + 1}:</span>
                      <input
                        type="text"
                        value={ans}
                        onChange={(e) => {
                          const newAns = [...shortAnswers];
                          newAns[aIdx] = e.target.value;
                          setShortAnswers(newAns);
                        }}
                        placeholder="Ví dụ: August"
                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white font-bold text-emerald-700"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShortAnswers([...shortAnswers, ''])}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    + Thêm từ chấp nhận khác
                  </button>
                </div>
              )}

              {/* GIAO DIỆN RIÊNG CHO DẠNG MULTIPLE CHOICE (TRẮC NGHIỆM) */}
              {selectedType === 'multiple_choice' && (
                <div className="space-y-3 pt-2">
                  <h4 className="font-extrabold text-xs text-slate-800 uppercase">Available options (Các lựa chọn trắc nghiệm)</h4>
                  {mcOptions.map((opt, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-700">Option {idx + 1}</span>
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

                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const newOpts = [...mcOptions];
                          newOpts[idx].text = e.target.value;
                          setMcOptions(newOpts);
                        }}
                        placeholder="Nhập nội dung đáp án..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white"
                      />
                    </div>
                  ))}
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
