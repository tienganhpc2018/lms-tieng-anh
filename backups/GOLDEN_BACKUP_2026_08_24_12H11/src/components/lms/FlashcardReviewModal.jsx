import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, RotateCw, Volume2, CheckCircle, XCircle, Sparkles, BookOpen } from 'lucide-react';
import { speakText } from '../../utils/textToSpeech';

export default function FlashcardReviewModal({ isOpen, onClose, wrongQuestions = [] }) {
  if (!isOpen || wrongQuestions.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentQ = wrongQuestions[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % wrongQuestions.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + wrongQuestions.length) % wrongQuestions.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-300 uppercase tracking-wide">
                🗂️ SỔ TAY ÔN TẬP CÂU SAI (FLASHCARDS)
              </h3>
              <p className="text-[10px] text-teal-200">
                Thẻ {currentIndex + 1} / {wrongQuestions.length} • Thuật toán lặp lại ngắt quãng (Spaced Repetition)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thẻ Flashcard 3D */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center min-h-[320px]">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full bg-white rounded-3xl border-2 border-slate-200 shadow-xl p-6 cursor-pointer hover:border-emerald-400 transition transform hover:-translate-y-1 relative flex flex-col justify-between min-h-[260px]"
          >
            <span className="absolute top-3 right-3 text-[10px] font-extrabold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <RotateCw className="w-3 h-3 text-emerald-600" />
              <span>Chạm để lật thẻ ({isFlipped ? 'Mặt sau' : 'Mặt trước'})</span>
            </span>

            {!isFlipped ? (
              /* MẶT TRƯỚC: CÂU HỎI & LỰA CHỌN SAI */
              <div className="space-y-3 pt-2">
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-md inline-block">
                  ❌ Câu học sinh chọn chưa đúng
                </span>

                <h4 className="font-extrabold text-sm text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h4>

                {currentQ.userAnswer && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                    <span className="font-bold block text-[10px] uppercase text-rose-700">Lựa chọn của bạn:</span>
                    <span className="line-through">{currentQ.userAnswer}</span>
                  </div>
                )}
              </div>
            ) : (
              /* MẶT SAU: ĐÁP ÁN ĐÚNG & LỜI GIẢI THÍCH */
              <div className="space-y-3 pt-2">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-md inline-block">
                  ✅ Đáp án đúng chuẩn xác
                </span>

                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-extrabold flex items-center justify-between">
                  <span>➔ {currentQ.correctAnswer}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentQ.correctAnswer);
                    }}
                    className="p-1 bg-emerald-200 hover:bg-emerald-300 text-emerald-900 rounded-lg text-[10px] flex items-center space-x-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Phát âm</span>
                  </button>
                </div>

                {currentQ.explanation && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
                    <span className="font-bold text-slate-900 block mb-0.5">🔍 Phân tích chi tiết:</span>
                    {currentQ.explanation}
                  </div>
                )}
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 text-center text-[10px] text-slate-400 italic">
              💡 Chuyển thẻ tiếp theo để xem toàn bộ câu làm sai
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center space-x-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <span className="text-xs font-extrabold text-slate-600">
            {currentIndex + 1} / {wrongQuestions.length}
          </span>

          <button
            onClick={handleNext}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center space-x-1"
          >
            <span>Câu tiếp</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
