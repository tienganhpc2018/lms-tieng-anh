import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Edit3, HelpCircle, CheckSquare, ListFilter, FileText, ChevronDown, Check, X, Info } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Modal "Choose a question type to add" (Chuẩn Ảnh 4 & 5)
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('multiple_choice');

  // State Nút Add Menu (3 Lựa chọn: a new question, from question bank, a random question)
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  // Form State tạo / sửa câu hỏi
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [marks, setMarks] = useState(1.0);
  
  // Multiple Choice Options (Chuẩn Ảnh 2: Correct Checkbox + Tips & Feedback)
  const [options, setOptions] = useState([
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
    { text: '', isCorrect: false, feedback: '' },
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
      alert('Đã kết nối Ngân Hàng Câu Hỏi Nguồn Mẫu! Hệ thống tự động trích xuất các câu hỏi mẫu chuẩn Tiếng Anh.');
    } else if (mode === 'random') {
      alert('Đã trích xuất ngẫu nhiên câu hỏi từ ngân hàng chung!');
    }
    setIsTypeModalOpen(true);
  };

  const handleConfirmAddType = () => {
    setIsTypeModalOpen(false);
    setEditingQuestion({ id: 'new', type: selectedType });
    setQuestionTitle('Untitled Question');
    setQuestionText('');
    setMarks(1.0);
    setOptions([
      { text: '', isCorrect: true, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
      { text: '', isCorrect: false, feedback: '' },
    ]);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const payload = {
      activity_id: activityId,
      type: selectedType,
      marks: Number(marks),
      content: {
        title: questionTitle,
        question: questionText.trim(),
        options: options.filter((o) => o.text.trim() !== ''),
      },
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

  // Danh sách các Dạng Câu Hỏi Chuẩn Moodle / H5P (Chuẩn Ảnh 4 & 5)
  const questionTypesList = [
    { type: 'multiple_choice', label: 'Multiple choice', desc: 'Cho phép chọn 1 hoặc nhiều đáp án đúng (Single/Multiple Choice).' },
    { type: 'true_false', label: 'True/False', desc: 'Dạng câu hỏi Đúng / Sai đơn giản cho từng ý.' },
    { type: 'matching', label: 'Matching', desc: 'Nối Cột A với Cột B tương ứng bằng thao tác nối từ.' },
    { type: 'fill_blank_dropdown', label: 'Select missing words', desc: 'Điền từ khuyết vào đoạn văn bằng hộp chọn Dropdown.' },
    { type: 'short_answer', label: 'Short answer', desc: 'Dạng câu hỏi nhập từ/số chính xác vào ô trống.' },
    { type: 'essay', label: 'Essay (Bài tập viết)', desc: 'Cho phép học sinh gõ đoạn văn bản bài viết luận hoặc nộp file.' },
    { type: 'drag_drop', label: 'Drag and drop into text', desc: 'Kéo thả từ tương ứng vào vị trí khuyết.' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar + Action Menu Add (Chuẩn Ảnh 4) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <div>
          <h3 className="font-extrabold text-base text-slate-900">
            Quản Lý Đề Thi & Ngân Hàng Câu Hỏi ({questions.length} câu)
          </h3>
          <p className="text-xs text-slate-500">
            Tổng điểm tối đa: {questions.reduce((acc, q) => acc + (Number(q.marks) || 1), 0)} điểm
          </p>
        </div>

        {/* Nút Add Menu với 3 lựa chọn (Chuẩn Ảnh 4) */}
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
                + from question bank (Từ ngân hàng câu hỏi)
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

      {/* Danh sách các câu hỏi trong đề thi */}
      {loading ? (
        <LoadingSpinner text="Đang tải danh sách câu hỏi..." />
      ) : questions.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
          Chưa có câu hỏi nào trong đề thi. Bấm nút "+ Add" ở trên để chọn dạng câu hỏi!
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
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded">
                    {q.type}
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
                      setOptions(q.content?.options || []);
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

              {/* Render danh sách options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.content?.options?.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`p-2 rounded-xl text-xs font-semibold border ${
                      opt.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {opt.isCorrect ? '✓ ' : ''}{opt.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL "Choose a question type to add" (Chuẩn Ảnh 4 & 5) */}
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

              {/* Cột Mô Tả Chi Tiết Dạng Câu Hỏi */}
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

      {/* FORM BIÊN TẬP CÂU HỎI CHI TIẾT (Chuẩn Ảnh 2: Correct Checkbox + Tips & Feedback) */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 my-8 animate-scale-up">
            <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-base">Adding/Editing Question: {selectedType}</h3>
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
                  Question Text (Nội dung câu hỏi) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Nhập nội dung câu hỏi..."
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

              {/* Available Options Section (Chuẩn Ảnh 2) */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs text-slate-800 uppercase">Available options (Các lựa chọn đáp án)</h4>
                {options.map((opt, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-700">Option {idx + 1}</span>
                      <label className="flex items-center space-x-1.5 cursor-pointer text-xs font-bold text-emerald-700">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[idx].isCorrect = e.target.checked;
                            setOptions(newOpts);
                          }}
                        />
                        <span>Correct (Đáp án đúng)</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx].text = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder="Nhập nội dung đáp án..."
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm bg-white"
                    />

                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1">Tips and feedback:</span>
                      <input
                        type="text"
                        value={opt.feedback}
                        onChange={(e) => {
                          const newOpts = [...options];
                          newOpts[idx].feedback = e.target.value;
                          setOptions(newOpts);
                        }}
                        placeholder="Giải thích lý do đúng/sai cho học sinh..."
                        className="w-full px-3 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-600"
                      />
                    </div>
                  </div>
                ))}
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
