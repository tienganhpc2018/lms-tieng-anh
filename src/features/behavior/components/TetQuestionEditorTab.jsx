import React, { useState } from 'react';
import { Plus, Trash2, Edit3, RotateCcw, Check, AlertCircle, HelpCircle, BookOpen, Layers, Bookmark } from 'lucide-react';
import { playClick, playCorrect, playTick } from '../../../utils/soundEffects';

export default function TetQuestionEditorTab({
  bank,
  onUpdateBank,
  onResetBankToDefault,
  currentGrade,
  currentUnit,
  currentLesson
}) {
  const [selectedGrade, setSelectedGrade] = useState(Number(currentGrade) || 3);
  const [selectedUnit, setSelectedUnit] = useState(currentUnit === 'all' ? 1 : Number(currentUnit));
  const [selectedLesson, setSelectedLesson] = useState(currentLesson === 'all' ? 'all' : Number(currentLesson));

  // Form soạn thảo câu hỏi
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null); // null = thêm mới, id = đang sửa

  // State các trường của form
  const [formType, setFormType] = useState('multiple_choice'); // 'multiple_choice' | 'short_answer' | 'word_reorder'
  const [formLesson, setFormLesson] = useState(1);
  const [formQuestion, setFormQuestion] = useState('');
  const [formOptA, setFormOptA] = useState('');
  const [formOptB, setFormOptB] = useState('');
  const [formOptC, setFormOptC] = useState('');
  const [formOptD, setFormOptD] = useState('');
  const [formCorrectOpt, setFormCorrectOpt] = useState('A');
  const [formShortAnswer, setFormShortAnswer] = useState('');
  const [formHint, setFormHint] = useState('');
  const [formSentenceOrder, setFormSentenceOrder] = useState(''); // Chuỗi câu hoàn chỉnh cho word_reorder
  const [formExplanation, setFormExplanation] = useState('');

  // Lấy danh sách câu hỏi của Unit hiện tại
  const gradeData = bank.find((g) => Number(g.grade) === Number(selectedGrade)) || bank[0];
  const unitData = gradeData?.units?.find((u) => Number(u.unit) === Number(selectedUnit)) || gradeData?.units?.[0];

  const questionsList = (unitData?.questions || []).filter((q) => {
    if (selectedLesson === 'all') return true;
    return Number(q.lesson || 1) === Number(selectedLesson);
  });

  // Mở form thêm mới
  const handleOpenAddForm = () => {
    playClick();
    setEditingQuestionId(null);
    setFormType('multiple_choice');
    setFormLesson(selectedLesson === 'all' ? 1 : Number(selectedLesson));
    setFormQuestion('');
    setFormOptA('');
    setFormOptB('');
    setFormOptC('');
    setFormOptD('');
    setFormCorrectOpt('A');
    setFormShortAnswer('');
    setFormHint('');
    setFormSentenceOrder('');
    setFormExplanation('');
    setIsEditing(true);
  };

  // Mở form chỉnh sửa câu hỏi có sẵn
  const handleOpenEditForm = (q) => {
    playClick();
    setEditingQuestionId(q.id);
    setFormType(q.type || 'multiple_choice');
    setFormLesson(Number(q.lesson || 1));
    setFormQuestion(q.question || '');
    setFormExplanation(q.explanation || '');

    if (q.type === 'multiple_choice') {
      const opts = q.options || [];
      setFormOptA(opts[0] || '');
      setFormOptB(opts[1] || '');
      setFormOptC(opts[2] || '');
      setFormOptD(opts[3] || '');
      const correctIdx = opts.findIndex((opt) => String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase());
      setFormCorrectOpt(['A', 'B', 'C', 'D'][correctIdx >= 0 ? correctIdx : 0]);
    } else if (q.type === 'short_answer') {
      setFormShortAnswer(q.correctAnswer || '');
      setFormHint(q.hint || '');
    } else if (q.type === 'word_reorder') {
      setFormSentenceOrder((q.correctOrder || []).join(' '));
    }

    setIsEditing(true);
  };

  // Xóa câu hỏi
  const handleDeleteQuestion = (qId) => {
    playTick();
    if (!window.confirm('Thầy/Cô có chắc chắn muốn xóa câu hỏi này không?')) return;

    const newBank = bank.map((g) => {
      if (Number(g.grade) !== Number(selectedGrade)) return g;
      return {
        ...g,
        units: g.units.map((u) => {
          if (Number(u.unit) !== Number(selectedUnit)) return u;
          return {
            ...u,
            questions: u.questions.filter((q) => q.id !== qId)
          };
        })
      };
    });

    onUpdateBank(newBank);
  };

  // Lưu câu hỏi (Thêm mới hoặc Cập nhật)
  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!formQuestion.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    let newQuestionObj = {
      id: editingQuestionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      lesson: Number(formLesson),
      type: formType,
      question: formQuestion.trim(),
      explanation: formExplanation.trim()
    };

    if (formType === 'multiple_choice') {
      const options = [formOptA.trim(), formOptB.trim(), formOptC.trim(), formOptD.trim()];
      if (options.some((o) => !o)) {
        alert('Vui lòng nhập đủ 4 phương án A, B, C, D!');
        return;
      }
      const correctIdx = ['A', 'B', 'C', 'D'].indexOf(formCorrectOpt);
      newQuestionObj.options = options;
      newQuestionObj.correctAnswer = options[correctIdx >= 0 ? correctIdx : 0];
    } else if (formType === 'short_answer') {
      if (!formShortAnswer.trim()) {
        alert('Vui lòng nhập đáp án đúng!');
        return;
      }
      newQuestionObj.correctAnswer = formShortAnswer.trim();
      newQuestionObj.hint = formHint.trim();
    } else if (formType === 'word_reorder') {
      if (!formSentenceOrder.trim()) {
        alert('Vui lòng nhập câu hoàn chỉnh để hệ thống tự tách từ xáo trộn!');
        return;
      }
      const words = formSentenceOrder.trim().split(/\s+/);
      newQuestionObj.correctOrder = words;
      // Tạo danh sách từ xáo trộn ngẫu nhiên
      newQuestionObj.scrambledWords = [...words].sort(() => 0.5 - Math.random());
    }

    // Cập nhật vào Bank
    const newBank = bank.map((g) => {
      if (Number(g.grade) !== Number(selectedGrade)) return g;
      return {
        ...g,
        units: g.units.map((u) => {
          if (Number(u.unit) !== Number(selectedUnit)) return u;
          const currentQs = u.questions || [];
          let updatedQs;
          if (editingQuestionId) {
            updatedQs = currentQs.map((q) => (q.id === editingQuestionId ? newQuestionObj : q));
          } else {
            updatedQs = [...currentQs, newQuestionObj];
          }
          return {
            ...u,
            questions: updatedQs
          };
        })
      };
    });

    onUpdateBank(newBank);
    playCorrect();
    setIsEditing(false);
  };

  // Khôi phục bộ câu hỏi mẫu
  const handleResetToDefault = () => {
    playTick();
    if (window.confirm('Thầy/Cô có chắc chắn muốn KHÔI PHỤC BỘ CÂU HỎI MẪU GỐC từ hệ thống không? Toàn bộ các câu hỏi đã tự soạn sẽ được đặt lại.')) {
      onResetBankToDefault();
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* THANH ĐIỀU HƯỚNG CHỌN KHỐI / UNIT / LESSON ĐỂ SOẠN */}
      <div className="bg-[#1b0505] p-3 rounded-2xl border border-amber-700/60 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Chọn Khối */}
          <div>
            <label className="text-[10px] font-black text-amber-300 block mb-1">Khối Lớp:</label>
            <select
              value={selectedGrade}
              onChange={(e) => {
                playClick();
                setSelectedGrade(Number(e.target.value));
              }}
              className="w-full bg-[#2a0808] text-amber-200 border border-amber-600/60 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-hidden cursor-pointer"
            >
              {[3, 4, 5, 6].map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Unit */}
          <div>
            <label className="text-[10px] font-black text-amber-300 block mb-1">Unit Bài Học:</label>
            <select
              value={selectedUnit}
              onChange={(e) => {
                playClick();
                setSelectedUnit(Number(e.target.value));
              }}
              className="w-full bg-[#2a0808] text-amber-200 border border-amber-600/60 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-hidden cursor-pointer"
            >
              {(gradeData?.units || []).map((u) => (
                <option key={u.unit} value={u.unit} className="bg-slate-900 text-white">
                  {u.title}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Lesson */}
          <div>
            <label className="text-[10px] font-black text-amber-300 block mb-1">Lesson:</label>
            <select
              value={selectedLesson}
              onChange={(e) => {
                playClick();
                setSelectedLesson(e.target.value === 'all' ? 'all' : Number(e.target.value));
              }}
              className="w-full bg-[#2a0808] text-amber-200 border border-amber-600/60 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-hidden cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-white">Tất cả Lessons</option>
              <option value="1" className="bg-slate-900 text-white">Lesson 1</option>
              <option value="2" className="bg-slate-900 text-white">Lesson 2</option>
              <option value="3" className="bg-slate-900 text-white">Lesson 3</option>
            </select>
          </div>
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG: SOẠN CÂU HỎI MỚI / KHÔI PHỤC MẪU */}
        <div className="flex items-center justify-between pt-1 border-t border-amber-900/60 flex-wrap gap-2">
          <div className="text-[11px] font-bold text-amber-200/80">
            📊 Hiện có: <span className="text-yellow-400 font-extrabold">{questionsList.length} câu hỏi</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs transition cursor-pointer flex items-center space-x-1 shadow-sm active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Thêm Câu Hỏi</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300/80 hover:text-amber-200 border border-amber-800/60 text-xs font-bold transition cursor-pointer flex items-center space-x-1 active:scale-95"
              title="Khôi phục lại toàn bộ bộ câu hỏi mẫu từ hệ thống"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Khôi Phục Mẫu Gốc</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORM SOẠN THẢO / CHỈNH SỬA CÂU HỎI */}
      {isEditing && (
        <form onSubmit={handleSaveQuestion} className="bg-gradient-to-b from-[#3a0808] to-[#220404] p-4 rounded-2xl border-2 border-amber-400 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-amber-800 pb-2">
            <h4 className="text-xs sm:text-sm font-black text-yellow-300 uppercase flex items-center space-x-1.5">
              <Edit3 className="w-4 h-4" />
              <span>{editingQuestionId ? 'CHỈNH SỬA CÂU HỎI' : 'SOẠN CÂU HỎI MỚI'}</span>
            </h4>
            <span className="text-[10px] text-amber-300/80 font-bold">
              Unit {unitData?.unit} • {unitData?.title}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dạng câu hỏi */}
            <div>
              <label className="text-[11px] font-black text-amber-300 block mb-1">Dạng câu hỏi:</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full bg-[#1b0505] text-amber-200 border border-amber-600 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-hidden cursor-pointer"
              >
                <option value="multiple_choice" className="bg-slate-900 text-white">Trắc nghiệm (A, B, C, D)</option>
                <option value="short_answer" className="bg-slate-900 text-white">Trả lời ngắn / Điền từ</option>
                <option value="word_reorder" className="bg-slate-900 text-white">Sắp xếp từ thành câu</option>
              </select>
            </div>

            {/* Thuộc Lesson nào */}
            <div>
              <label className="text-[11px] font-black text-amber-300 block mb-1">Thuộc Lesson:</label>
              <select
                value={formLesson}
                onChange={(e) => setFormLesson(Number(e.target.value))}
                className="w-full bg-[#1b0505] text-amber-200 border border-amber-600 rounded-xl px-2.5 py-1.5 text-xs font-bold outline-hidden cursor-pointer"
              >
                <option value="1" className="bg-slate-900 text-white">Lesson 1 (Cơ bản / Từ vựng)</option>
                <option value="2" className="bg-slate-900 text-white">Lesson 2 (Mẫu câu / Ngữ pháp)</option>
                <option value="3" className="bg-slate-900 text-white">Lesson 3 (Phonics / Luyện tập)</option>
              </select>
            </div>
          </div>

          {/* Nội dung câu hỏi */}
          <div>
            <label className="text-[11px] font-black text-amber-300 block mb-1">
              {formType === 'word_reorder' ? 'Yêu cầu đề bài:' : 'Nội dung câu hỏi:'}
            </label>
            <input
              type="text"
              required
              value={formQuestion}
              onChange={(e) => setFormQuestion(e.target.value)}
              placeholder={formType === 'word_reorder' ? 'VD: Sắp xếp các từ sau thành câu chào hỏi:' : 'VD: Hello, my name _____ Nam.'}
              className="w-full bg-[#170303] text-white border border-amber-600 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold outline-hidden shadow-inner"
            />
          </div>

          {/* CÁC TRƯỜNG DÀNH CHO TRẮC NGHIỆM */}
          {formType === 'multiple_choice' && (
            <div className="space-y-2 bg-[#1b0505] p-3 rounded-xl border border-amber-900/60">
              <label className="text-[11px] font-black text-amber-300 block">
                4 Phương án lựa chọn (Chọn nút tròn bên cạnh đáp án ĐÚNG):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'A', val: formOptA, setVal: setFormOptA },
                  { label: 'B', val: formOptB, setVal: setFormOptB },
                  { label: 'C', val: formOptC, setVal: setFormOptC },
                  { label: 'D', val: formOptD, setVal: setFormOptD }
                ].map((item) => (
                  <div key={item.label} className="flex items-center space-x-1.5">
                    <input
                      type="radio"
                      name="correctOpt"
                      checked={formCorrectOpt === item.label}
                      onChange={() => setFormCorrectOpt(item.label)}
                      className="accent-amber-400 cursor-pointer w-4 h-4"
                    />
                    <span className="text-xs font-black text-amber-400 w-4">{item.label}:</span>
                    <input
                      type="text"
                      required
                      value={item.val}
                      onChange={(e) => item.setVal(e.target.value)}
                      placeholder={`Phương án ${item.label}`}
                      className="flex-1 bg-[#250606] text-white border border-amber-800 rounded-lg px-2 py-1 text-xs outline-hidden"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CÁC TRƯỜNG DÀNH CHO TRẢ LỜI NGẮN */}
          {formType === 'short_answer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#1b0505] p-3 rounded-xl border border-amber-900/60">
              <div>
                <label className="text-[11px] font-black text-amber-300 block mb-1">Đáp án đúng chuẩn:</label>
                <input
                  type="text"
                  required
                  value={formShortAnswer}
                  onChange={(e) => setFormShortAnswer(e.target.value)}
                  placeholder="VD: you"
                  className="w-full bg-[#250606] text-yellow-300 border border-amber-800 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-hidden"
                />
              </div>
              <div>
                <label className="text-[11px] font-black text-amber-300 block mb-1">Gợi ý cho học sinh (nếu có):</label>
                <input
                  type="text"
                  value={formHint}
                  onChange={(e) => setFormHint(e.target.value)}
                  placeholder="VD: Từ có 3 chữ cái, nghĩa là bạn"
                  className="w-full bg-[#250606] text-white border border-amber-800 rounded-lg px-2.5 py-1.5 text-xs outline-hidden"
                />
              </div>
            </div>
          )}

          {/* CÁC TRƯỜNG DÀNH CHO SẮP XẾP TỪ */}
          {formType === 'word_reorder' && (
            <div className="bg-[#1b0505] p-3 rounded-xl border border-amber-900/60 space-y-1.5">
              <label className="text-[11px] font-black text-amber-300 block">
                Nhập câu hoàn chỉnh (Hệ thống sẽ tự động tách các từ và xáo trộn):
              </label>
              <input
                type="text"
                required
                value={formSentenceOrder}
                onChange={(e) => setFormSentenceOrder(e.target.value)}
                placeholder="VD: How are you ?"
                className="w-full bg-[#250606] text-yellow-300 border border-amber-800 rounded-lg px-2.5 py-1.5 text-xs font-bold outline-hidden"
              />
              <p className="text-[10px] text-amber-400/70 italic">
                * Mẹo: Các từ cách nhau bởi dấu cách. Dấu chấm hoặc hỏi chấm nếu muốn xếp riêng hãy đặt dấu cách ở trước (VD: `you ?`).
              </p>
            </div>
          )}

          {/* Lời giải thích */}
          <div>
            <label className="text-[11px] font-black text-amber-300 block mb-1">Giải thích đáp án (Hiện khi HS trả lời xong):</label>
            <input
              type="text"
              value={formExplanation}
              onChange={(e) => setFormExplanation(e.target.value)}
              placeholder="VD: Với danh từ số ít dùng to be 'is'."
              className="w-full bg-[#170303] text-amber-100 border border-amber-800 rounded-xl px-3 py-1.5 text-xs outline-hidden"
            />
          </div>

          {/* Nút lưu / Hủy */}
          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-amber-800">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl bg-transparent hover:bg-white/10 text-amber-300 text-xs font-bold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-md transition cursor-pointer active:scale-95"
            >
              {editingQuestionId ? 'Cập Nhật Câu Hỏi' : 'Lưu Câu Hỏi Mới'}
            </button>
          </div>
        </form>
      )}

      {/* DANH SÁCH CÂU HỎI ĐANG CÓ TRONG UNIT / LESSON */}
      <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1">
        {questionsList.length === 0 ? (
          <div className="p-6 text-center bg-[#180404] rounded-2xl border border-dashed border-amber-800/60 text-amber-400/60 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-xs font-bold">Chưa có câu hỏi nào cho Lesson này.</p>
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs transition cursor-pointer"
            >
              ➕ Soạn câu hỏi đầu tiên ngay
            </button>
          </div>
        ) : (
          questionsList.map((q, idx) => {
            const typeLabel =
              q.type === 'multiple_choice'
                ? 'Trắc nghiệm'
                : q.type === 'short_answer'
                ? 'Điền từ'
                : 'Sắp xếp';

            return (
              <div
                key={q.id}
                className="bg-[#1e0505] hover:bg-[#250707] p-3 rounded-2xl border border-amber-800/70 transition space-y-2 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-1">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center flex-shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-bold">
                      Lesson {q.lesson || 1}
                    </span>
                    <span className="text-[10px] bg-rose-900/60 text-rose-200 border border-rose-700/60 px-2 py-0.5 rounded-md font-bold">
                      {typeLabel}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditForm(q)}
                      className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-800 text-amber-300 hover:text-white transition cursor-pointer"
                      title="Chỉnh sửa câu hỏi"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-800 text-rose-400 hover:text-white transition cursor-pointer"
                      title="Xóa câu hỏi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Nội dung câu hỏi */}
                <p className="text-xs sm:text-sm font-black text-amber-100 pl-7 leading-relaxed">
                  {q.question}
                </p>

                {/* Chi tiết đáp án */}
                <div className="pl-7 text-[11px] font-bold text-amber-300/80">
                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
                      {(q.options || []).map((opt, oIdx) => {
                        const isCorrect = String(opt).trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
                        return (
                          <span
                            key={oIdx}
                            className={`px-2 py-0.5 rounded-md text-[10px] truncate ${
                              isCorrect
                                ? 'bg-emerald-600 text-white font-black border border-white/50'
                                : 'bg-black/40 text-amber-200/70 border border-amber-900/50'
                            }`}
                          >
                            {['A', 'B', 'C', 'D'][oIdx]}: {opt}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="pt-0.5">
                      Đáp án đúng: <span className="text-emerald-400 font-extrabold">{q.correctAnswer}</span>
                      {q.hint && <span className="text-amber-400/60 font-medium ml-2">💡 Gợi ý: {q.hint}</span>}
                    </div>
                  )}

                  {q.type === 'word_reorder' && (
                    <div className="pt-0.5">
                      Câu đúng: <span className="text-emerald-400 font-extrabold">{(q.correctOrder || []).join(' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
