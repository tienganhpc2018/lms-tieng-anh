import React, { useState, useEffect } from 'react';
import { Plus, Trash2, HelpCircle, CheckSquare, ListFilter, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import LoadingSpinner from '../common/LoadingSpinner';

export default function QuizBuilder({ activityId, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State Form Thêm Câu Hỏi Mới
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { id: '1', text: 'Lựa chọn A' },
    { id: '2', text: 'Lựa chọn B' },
    { id: '3', text: 'Lựa chọn C' },
    { id: '4', text: 'Lựa chọn D' },
  ]);
  const [correctOptionId, setCorrectOptionId] = useState('1');
  const [marks, setMarks] = useState(1);

  // State riêng cho Fill Blank Dropdown (Select missing words)
  const [fillSentence, setFillSentence] = useState('Việt Nam nằm ở bán đảo [1] và có thủ đô là [2].');
  const [dropdowns, setDropdowns] = useState([
    { id: '1', optionsText: 'Đông Dương, Triều Tiên, Balkan', answer: 'Đông Dương' },
    { id: '2', optionsText: 'Hà Nội, TP Hồ Chí Minh, Đà Nẵng', answer: 'Hà Nội' },
  ]);

  // Fetch danh sách câu hỏi hiện có
  const fetchQuestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('activity_id', activityId)
      .order('created_at', { ascending: true });

    if (!error) {
      setQuestions(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activityId) fetchQuestions();
  }, [activityId]);

  // Thêm câu hỏi Trắc nghiệm mới
  const handleAddMultipleChoice = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    setSaving(true);
    const content = {
      questionText: questionText.trim(),
      options: options,
      correctAnswer: correctOptionId,
    };

    const { error } = await supabase.from('questions').insert([
      {
        activity_id: activityId,
        type: 'multiple_choice',
        content: content,
        marks: parseFloat(marks) || 1,
      },
    ]);

    if (error) {
      alert('Lỗi tạo câu hỏi: ' + error.message);
    } else {
      setQuestionText('');
      await fetchQuestions();
      if (onSaved) onSaved();
    }
    setSaving(false);
  };

  // Thêm câu hỏi Dropdown Điền Khuyết mới
  const handleAddFillBlankDropdown = async (e) => {
    e.preventDefault();
    if (!fillSentence.trim()) {
      alert('Vui lòng nhập đoạn văn có ký hiệu [1], [2]!');
      return;
    }

    setSaving(true);
    const formattedDropdowns = dropdowns.map((d) => ({
      id: d.id,
      options: d.optionsText.split(',').map((s) => s.trim()),
      answer: d.answer.trim(),
    }));

    const content = {
      textWithPlaceholders: fillSentence.trim(),
      dropdowns: formattedDropdowns,
    };

    const { error } = await supabase.from('questions').insert([
      {
        activity_id: activityId,
        type: 'fill_blank_dropdown',
        content: content,
        marks: parseFloat(marks) || 1,
      },
    ]);

    if (error) {
      alert('Lỗi tạo câu hỏi: ' + error.message);
    } else {
      await fetchQuestions();
      if (onSaved) onSaved();
    }
    setSaving(false);
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (!error) {
      fetchQuestions();
    }
  };

  if (loading) return <LoadingSpinner text="Đang tải ngân hàng câu hỏi..." />;

  return (
    <div className="space-y-6">
      {/* Tiêu đề & Tổng quan */}
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-xl">
        <div>
          <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-brand-600" />
            <span>Ngân Hàng Câu Hỏi Cho Bài Quiz</span>
          </h3>
          <p className="text-xs text-slate-500">
            Hiện có <strong className="text-brand-600">{questions.length}</strong> câu hỏi. Tổng điểm:{' '}
            <strong className="text-emerald-600">
              {questions.reduce((acc, q) => acc + (parseFloat(q.marks) || 0), 0)}
            </strong>
          </p>
        </div>
      </div>

      {/* Form Tạo Câu Hỏi Mới */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase">Loại Câu Hỏi Mới:</span>
          <button
            type="button"
            onClick={() => setQuestionType('multiple_choice')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
              questionType === 'multiple_choice'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Trắc Nghiệm (Multiple Choice)</span>
          </button>
          <button
            type="button"
            onClick={() => setQuestionType('fill_blank_dropdown')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition ${
              questionType === 'fill_blank_dropdown'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Điền Từ Dropdown Trong Đoạn Văn</span>
          </button>
        </div>

        {/* DẠNG 1: TRẮC NGHIỆM */}
        {questionType === 'multiple_choice' && (
          <form onSubmit={handleAddMultipleChoice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Nội dung câu hỏi trắc nghiệm
              </label>
              <textarea
                required
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Nhập nội dung câu hỏi..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Các phương án lựa chọn (Chọn 1 đáp án đúng)
              </label>
              {options.map((opt, idx) => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={correctOptionId === opt.id}
                    onChange={() => setCorrectOptionId(opt.id)}
                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                  />
                  <input
                    type="text"
                    required
                    value={opt.text}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx].text = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Điểm số:</span>
                <input
                  type="number"
                  step="0.5"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Câu Hỏi Trắc Nghiệm</span>
              </button>
            </div>
          </form>
        )}

        {/* DẠNG 2: FILL BLANK DROPDOWN */}
        {questionType === 'fill_blank_dropdown' && (
          <form onSubmit={handleAddFillBlankDropdown} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Đoạn văn có vị trí điền (Ký hiệu [1], [2]...)
              </label>
              <textarea
                required
                rows={2}
                value={fillSentence}
                onChange={(e) => setFillSentence(e.target.value)}
                placeholder="Nhập đoạn văn dạng: Nước Việt Nam có thủ đô là [1] và danh thắng [2]..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Cấu hình danh sách Lựa chọn Dropdown
              </label>
              {dropdowns.map((d, idx) => (
                <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Vị trí [{d.id}]</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500">Các từ tùy chọn (phân cách bằng dấu phẩy):</span>
                      <input
                        type="text"
                        required
                        value={d.optionsText}
                        onChange={(e) => {
                          const newD = [...dropdowns];
                          newD[idx].optionsText = e.target.value;
                          setDropdowns(newD);
                        }}
                        className="w-full px-2 py-1 border rounded text-xs mt-1"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500">Đáp án đúng chính xác:</span>
                      <input
                        type="text"
                        required
                        value={d.answer}
                        onChange={(e) => {
                          const newD = [...dropdowns];
                          newD[idx].answer = e.target.value;
                          setDropdowns(newD);
                        }}
                        className="w-full px-2 py-1 border border-emerald-300 bg-emerald-50 text-emerald-900 rounded text-xs mt-1 font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Điểm số:</span>
                <input
                  type="number"
                  step="0.5"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-20 px-2 py-1 border border-slate-300 rounded text-sm text-center"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Câu Hỏi Dropdown</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Danh sách Câu hỏi hiện có trong Quiz */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Danh Sách Câu Hỏi Đã Tạo ({questions.length})
        </h4>
        {questions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4 italic border border-dashed rounded-xl">
            Chưa có câu hỏi nào. Hãy sử dụng form trên để thêm câu hỏi vào Quiz.
          </p>
        ) : (
          questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded mr-2">
                    Câu {idx + 1} ({q.marks} điểm) - {q.type === 'multiple_choice' ? 'Trắc nghiệm' : 'Điền Dropdown'}
                  </span>
                  <div className="text-sm font-semibold text-slate-800">
                    {q.type === 'multiple_choice' ? q.content.questionText : q.content.textWithPlaceholders}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="text-slate-400 hover:text-red-600 p-1 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
