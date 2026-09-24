import React, { useState } from 'react';
import { Sparkles, CheckCircle2, XCircle, Lightbulb, RotateCcw, ArrowRight, Award, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playClick, playWinner, playTick } from '../../../utils/soundEffects';

export default function TetQuestionPlayer({
  student,
  locNumber,
  questions = [],
  onComplete,
  onAwardStudent
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [qId]: { answer, isCorrect, explanation } }
  const [isAnswered, setIsAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shortInput, setShortInput] = useState('');
  
  // State riêng cho dạng sắp xếp từ
  const [selectedWords, setSelectedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);

  const currentQ = questions[currentIndex];

  // Khởi tạo trạng thái cho câu hỏi hiện tại
  React.useEffect(() => {
    if (!currentQ) return;
    setIsAnswered(false);
    setShowHint(false);
    setShortInput('');

    if (currentQ.type === 'word_reorder') {
      // Xáo trộn từ và gán id duy nhất cho từng từ để tránh trùng từ
      const indexed = (currentQ.scrambledWords || []).map((w, idx) => ({ id: `${idx}-${w}`, text: w }));
      setAvailableWords(indexed);
      setSelectedWords([]);
    }
  }, [currentIndex, currentQ]);

  if (!student || !questions || questions.length === 0) return null;

  // 1. XỬ LÝ TRẮC NGHIỆM
  const handleSelectOption = (opt) => {
    if (isAnswered) return;
    playClick();

    const isCorrect = String(opt).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();
    recordAnswer(opt, isCorrect);
  };

  // 2. XỬ LÝ TRẢ LỜI NGẮN
  const handleCheckShortAnswer = (e) => {
    if (e) e.preventDefault();
    if (isAnswered || !shortInput.trim()) return;
    playClick();

    const cleanInput = shortInput.trim().toLowerCase().replace(/[.,?!]/g, '');
    const cleanCorrect = String(currentQ.correctAnswer).trim().toLowerCase().replace(/[.,?!]/g, '');
    const isCorrect = cleanInput === cleanCorrect;
    recordAnswer(shortInput, isCorrect);
  };

  // 3. XỬ LÝ SẮP XẾP TỪ
  const handlePickWord = (wordObj) => {
    if (isAnswered) return;
    playClick();
    setAvailableWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setSelectedWords((prev) => [...prev, wordObj]);
  };

  const handleReturnWord = (wordObj) => {
    if (isAnswered) return;
    playClick();
    setSelectedWords((prev) => prev.filter((w) => w.id !== wordObj.id));
    setAvailableWords((prev) => [...prev, wordObj]);
  };

  const handleResetWords = () => {
    if (isAnswered) return;
    playClick();
    const indexed = (currentQ.scrambledWords || []).map((w, idx) => ({ id: `${idx}-${w}`, text: w }));
    setAvailableWords(indexed);
    setSelectedWords([]);
  };

  const handleCheckWordReorder = () => {
    if (isAnswered || selectedWords.length === 0) return;
    playClick();

    const userSentence = selectedWords.map((w) => w.text).join(' ').trim().toLowerCase().replace(/[.,?!]/g, '');
    const correctSentence = (currentQ.correctOrder || []).join(' ').trim().toLowerCase().replace(/[.,?!]/g, '');
    const isCorrect = userSentence === correctSentence;
    recordAnswer(selectedWords.map((w) => w.text).join(' '), isCorrect);
  };

  // GHI NHẬN KẾT QUẢ VÀ THƯỞNG ĐIỂM
  const recordAnswer = (answer, isCorrect) => {
    setIsAnswered(true);
    setUserAnswers((prev) => ({
      ...prev,
      [currentQ.id]: { answer, isCorrect, explanation: currentQ.explanation }
    }));

    if (isCorrect) {
      playWinner();
      confetti({
        particleCount: 160,
        spread: 120,
        origin: { y: 0.6 }
      });
      // Cộng sao lì xì cho học sinh
      if (onAwardStudent && student.id) {
        onAwardStudent(student.id, 1);
      }
    } else {
      playTick();
    }
  };

  // CHUYỂN CÂU TIẾP THEO HOẶC HOÀN THÀNH
  const handleNext = () => {
    playClick();
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentResult = userAnswers[currentQ?.id];

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 select-none animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2b0808] via-[#1a0404] to-[#0d0101] border-[3.5px] border-amber-500 rounded-[2.5rem] shadow-2xl p-4 sm:p-6 text-amber-100 flex flex-col space-y-4 max-h-[92vh] overflow-y-auto">
        
        {/* HEADER: THÔNG TIN HỌC SINH & LỘC TẾT */}
        <div className="flex items-center justify-between border-b-2 border-amber-800/80 pb-3 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Lồng đèn bầu dục đại diện lộc vừa hái */}
            <div className="w-10 h-13 rounded-2xl bg-gradient-to-b from-[#dc2626] to-[#991b1b] border-2 border-yellow-300 shadow-md flex flex-col items-center justify-center relative flex-shrink-0">
              <span className="text-[8px] font-black text-yellow-300 leading-none">LỘC</span>
              <span className="text-sm font-black text-white leading-none font-mono mt-0.5">{locNumber}</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base sm:text-lg font-black text-white drop-shadow">
                  {student.full_name}
                </h3>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold">
                  {student.code ? `${student.code} • ` : ''}Tổ {student.team_group || 1}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/80 font-bold">
                🎯 Trả lời câu hỏi Tiếng Anh để rước Lì Xì đầu năm!
              </p>
            </div>
          </div>

          {/* SỐ THỨ TỰ CÂU HỎI */}
          <div className="text-right">
            <span className="text-xs font-black text-amber-400 bg-amber-950/80 px-3 py-1.5 rounded-xl border border-amber-600/60 shadow-inner">
              Câu {currentIndex + 1} / {questions.length}
            </span>
          </div>
        </div>

        {/* TIÊU ĐỀ UNIT */}
        <div className="flex items-center justify-between text-[11px] font-bold text-amber-300/80 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-900/50">
          <span>📚 {currentQ.unitTitle || `Unit ${currentQ.unitNumber}`}</span>
          <span className="text-yellow-400 font-extrabold uppercase">
            {currentQ.type === 'multiple_choice' && 'Trắc nghiệm 1 lựa chọn'}
            {currentQ.type === 'short_answer' && 'Trả lời ngắn / Điền từ'}
            {currentQ.type === 'word_reorder' && 'Sắp xếp từ thành câu'}
          </span>
        </div>

        {/* NỘI DUNG CÂU HỎI */}
        <div className="bg-gradient-to-r from-amber-950/70 via-rose-950/50 to-amber-950/70 p-4 sm:p-5 rounded-2xl border-2 border-amber-600/60 shadow-lg text-center space-y-2">
          <p className="text-base sm:text-xl font-black text-yellow-200 leading-relaxed drop-shadow-md">
            {currentQ.question}
          </p>
        </div>

        {/* =================================================================== */}
        {/* DẠNG 1: TRẮC NGHIỆM (A, B, C, D)                                   */}
        {/* =================================================================== */}
        {currentQ.type === 'multiple_choice' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {(currentQ.options || []).map((opt, idx) => {
              const letter = ['A', 'B', 'C', 'D'][idx] || '';
              const isSelected = currentResult?.answer === opt;
              const isCorrectOpt = String(opt).trim().toLowerCase() === String(currentQ.correctAnswer).trim().toLowerCase();

              let btnStyle = 'bg-amber-950/50 border-amber-700/60 text-amber-100 hover:bg-amber-900/70 hover:border-amber-400';
              if (isAnswered) {
                if (isCorrectOpt) {
                  btnStyle = 'bg-emerald-600 border-white text-white shadow-[0_0_15px_#22c55e] scale-102 font-black';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-700 border-rose-400 text-white line-through opacity-80';
                } else {
                  btnStyle = 'bg-amber-950/30 border-amber-900/40 text-amber-400/50 opacity-50';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(opt)}
                  className={`p-3 sm:p-3.5 rounded-2xl border-2 text-left transition transform active:scale-98 flex items-center space-x-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center flex-shrink-0 shadow-sm">
                    {letter}
                  </span>
                  <span className="text-sm sm:text-base font-bold flex-1">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* =================================================================== */}
        {/* DẠNG 2: TRẢ LỜI NGẮN / ĐIỀN TỪ                                      */}
        {/* =================================================================== */}
        {currentQ.type === 'short_answer' && (
          <div className="space-y-3 pt-1">
            <form onSubmit={handleCheckShortAnswer} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  disabled={isAnswered}
                  value={shortInput}
                  onChange={(e) => setShortInput(e.target.value)}
                  placeholder="Gõ đáp án tiếng Anh vào đây..."
                  className="w-full bg-[#170303] text-yellow-100 border-2 border-amber-500 rounded-2xl px-4 py-3 text-base sm:text-lg font-bold outline-hidden placeholder:text-amber-400/40 shadow-inner"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                {currentQ.hint && (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setShowHint((prev) => !prev);
                    }}
                    className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 border border-amber-700/60 cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{showHint ? 'Ẩn gợi ý' : 'Xem gợi ý'}</span>
                  </button>
                )}

                {!isAnswered && (
                  <button
                    type="submit"
                    disabled={!shortInput.trim()}
                    className="ml-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                  >
                    Kiểm Tra Đáp Án 🎯
                  </button>
                )}
              </div>
            </form>

            {showHint && currentQ.hint && (
              <div className="p-2.5 bg-yellow-950/60 rounded-xl border border-yellow-600/60 text-xs text-yellow-200 font-semibold animate-fade-in">
                💡 Gợi ý: {currentQ.hint}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* DẠNG 3: SẮP XẾP TỪ THÀNH CÂU HOÀN CHỈNH                             */}
        {/* =================================================================== */}
        {currentQ.type === 'word_reorder' && (
          <div className="space-y-3 pt-1">
            {/* DÒNG HIỂN THỊ CÂU ĐÃ SẮP XẾP */}
            <div className="min-h-[58px] p-3 rounded-2xl bg-[#170303] border-2 border-dashed border-amber-600/70 flex flex-wrap gap-2 items-center">
              {selectedWords.length === 0 ? (
                <span className="text-xs text-amber-400/50 font-medium italic">
                  Bấm các thẻ từ bên dưới để đưa lên đây tạo câu hoàn chỉnh...
                </span>
              ) : (
                selectedWords.map((w) => (
                  <button
                    key={w.id}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleReturnWord(w)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-md hover:bg-rose-500 transition cursor-pointer active:scale-95"
                    title="Bấm để gỡ từ này"
                  >
                    {w.text}
                  </button>
                ))
              )}
            </div>

            {/* KHO TỪ XÁO TRỘN ĐỂ BẤM CHỌN */}
            <div className="flex flex-wrap gap-2 justify-center p-2 bg-amber-950/40 rounded-2xl border border-amber-800/50">
              {availableWords.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handlePickWord(w)}
                  className="px-3.5 py-2 rounded-xl bg-amber-900/80 hover:bg-amber-800 text-amber-100 font-black text-xs sm:text-sm border border-amber-600 transition cursor-pointer active:scale-95 shadow-xs"
                >
                  {w.text}
                </button>
              ))}
            </div>

            {/* NÚT THAO TÁC SẮP XẾP */}
            {!isAnswered && (
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetWords}
                  className="px-3 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-xs font-bold transition flex items-center space-x-1.5 border border-amber-700/60 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xếp lại từ đầu</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckWordReorder}
                  disabled={selectedWords.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  Kiểm Tra Câu Đã Xếp 🎯
                </button>
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* KẾT QUẢ VÀ LỜI GIẢI THÍCH CHI TIẾT                                  */}
        {/* =================================================================== */}
        {isAnswered && currentResult && (
          <div
            className={`p-3.5 rounded-2xl border-2 space-y-2 animate-fade-in ${
              currentResult.isCorrect
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-100'
                : 'bg-rose-950/80 border-rose-500 text-rose-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              {currentResult.isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-black text-sm text-emerald-300">
                    🎉 XUẤT SẮC! CÂU TRẢ LỜI HOÀN TOÀN CHÍNH XÁC! (+1 ĐIỂM LÌ XÌ)
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-400" />
                  <span className="font-black text-sm text-rose-300">
                    CHƯA CHÍNH XÁC! Hãy cố gắng ở các câu sau nhé!
                  </span>
                </>
              )}
            </div>

            <p className="text-xs font-bold">
              Đáp án chuẩn: <span className="text-yellow-300 font-extrabold">{currentQ.correctAnswer || (currentQ.correctOrder || []).join(' ')}</span>
            </p>

            {currentQ.explanation && (
              <p className="text-[11px] opacity-90 italic">
                📖 Giải thích: {currentQ.explanation}
              </p>
            )}
          </div>
        )}

        {/* NÚT TIẾP TỤC / HOÀN THÀNH */}
        {isAnswered && (
          <div className="pt-2 flex items-center justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-sm transition cursor-pointer shadow-lg hover:from-amber-300 hover:to-yellow-200 flex items-center justify-center space-x-2 active:scale-95"
            >
              <span>{currentIndex < questions.length - 1 ? 'Câu Tiếp Theo' : 'Hoàn Thành & Rước Lộc'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
