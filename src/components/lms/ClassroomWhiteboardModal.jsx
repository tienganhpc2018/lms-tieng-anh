import React, { useState } from 'react';
import { X, Tv, ChevronLeft, ChevronRight, Highlighting, CheckCircle, Volume2 } from 'lucide-react';
import { speakText } from '../../utils/textToSpeech';

export default function ClassroomWhiteboardModal({ isOpen, onClose, questions = [], activityTitle }) {
  if (!isOpen || questions.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(true);

  const currentQ = questions[currentIndex];
  const cObj = currentQ?.content || {};

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % questions.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + questions.length) % questions.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col p-6 animate-fade-in font-serif">
      {/* Header Chế Độ Máy Chiếu */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <Tv className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-wide text-amber-400 uppercase font-sans">
              📺 CHẾ ĐỘ GIẢNG BÀI TRÊN MÁY CHIẾU / BẢNG TƯƠNG TÁC
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              Bài thi: {activityTitle || 'Tiếng Anh'} • Câu {currentIndex + 1} / {questions.length}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-sans">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 ${
              showExplanation ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Highlighting className="w-4 h-4" />
            <span>{showExplanation ? 'Đang bật Dẫn Chứng & Lời Giải' : 'Ẩn Lời Giải Chi Tiết'}</span>
          </button>

          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Nội dung chữa bài phông chữ cực đại */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* TIÊU ĐỀ HOẶC ĐOẠN VĂN */}
        {(cObj.question || cObj.title) && (
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl text-lg font-bold text-amber-200 leading-relaxed font-sans shadow-lg">
            {cObj.question || cObj.title}
          </div>
        )}

        {/* ĐOẠN VĂN NẾU CÓ */}
        {cObj.passage && (
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl text-lg leading-loose text-slate-200 font-serif text-justify shadow-inner">
            {cObj.passage}
          </div>
        )}

        {/* DANH SÁCH LỰA CHỌN CÂU HỎI */}
        {Array.isArray(cObj.options) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans">
            {cObj.options.map((opt, oIdx) => {
              const label = String.fromCharCode(65 + oIdx);
              const isCorrect = opt.isCorrect;

              return (
                <div
                  key={oIdx}
                  className={`p-5 rounded-2xl border text-base font-extrabold transition flex items-center justify-between ${
                    showExplanation && isCorrect
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/40 shadow-lg'
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-extrabold text-sm border border-slate-700">
                      {label}
                    </span>
                    <span>{opt.text || opt}</span>
                  </div>

                  {showExplanation && isCorrect && (
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 text-xs font-black rounded-lg uppercase">
                      ✅ Đáp án đúng
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* PHẦN HIỂN THỊ PHÂN TÍCH LỜI GIẢI CHI TIẾT KHI GIẢNG BÀI */}
        {showExplanation && cObj.explanation && (
          <div className="p-6 bg-gradient-to-r from-amber-950/80 to-slate-900 border-2 border-amber-500/50 rounded-3xl space-y-3 font-sans shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-300 text-sm uppercase tracking-wide flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-amber-400" />
                <span>🔍 PHÂN TÍCH DẪN CHỨNG & NỘI DUNG CHỮA BÀI CỦA GIÁO VIÊN:</span>
              </span>
              <button
                onClick={() => speakText(cObj.explanation)}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center space-x-1 shadow"
              >
                <Volume2 className="w-4 h-4" />
                <span>Đọc Lời Giải</span>
              </button>
            </div>

            <p className="text-base text-slate-200 leading-relaxed font-serif whitespace-pre-line">
              {cObj.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      <div className="flex justify-between items-center border-t border-slate-800 pt-4 font-sans max-w-5xl mx-auto w-full">
        <button
          onClick={handlePrev}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm rounded-2xl flex items-center space-x-2 shadow transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Câu trước</span>
        </button>

        <span className="text-sm font-extrabold text-amber-400">
          Câu {currentIndex + 1} / {questions.length}
        </span>

        <button
          onClick={handleNext}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl flex items-center space-x-2 shadow transition"
        >
          <span>Câu tiếp</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
