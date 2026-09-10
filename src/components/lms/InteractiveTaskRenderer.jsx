import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  Headphones,
  Check,
  X,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Languages,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Play,
  Pause
} from 'lucide-react';

export default function InteractiveTaskRenderer({
  task,
  lesson,
  showAnswerKey,
  audioRate = 0.9,
  onSpeechPlay,
  isTeacher = false
}) {
  // Trạng thái chung
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(-1);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const [showTranslations, setShowTranslations] = useState(false);

  // Trạng thái Task 2 (Điền từ)
  const [fillAnswers, setFillAnswers] = useState({});
  const [fillChecked, setFillChecked] = useState(false);

  // Trạng thái Task 3 (Nối từ)
  const [selectedWord, setSelectedWord] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState({}); // { word: defId }
  const [matchingChecked, setMatchingChecked] = useState(false);

  // Trạng thái Task 4 (Hoàn thành câu)
  const [sentenceAnswers, setSentenceAnswers] = useState({});
  const [sentenceChecked, setSentenceChecked] = useState(false);

  // Trạng thái Task 5 (Quiz)
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizChecked, setQuizChecked] = useState(false);

  // Reset khi đổi Task
  useEffect(() => {
    setActiveDialogueIndex(-1);
    setIsPlayingAll(false);
    setFillAnswers({});
    setFillChecked(false);
    setSelectedWord(null);
    setMatchedPairs({});
    setMatchingChecked(false);
    setSentenceAnswers({});
    setSentenceChecked(false);
    setQuizAnswers({});
    setQuizChecked(false);
    window.speechSynthesis?.cancel();
  }, [task?.id]);

  // HÀM PHÁT ÂM THANH TỪNG CÂU VỚI GIỌNG PHÙ HỢP
  const playSpeech = (text, speaker = 'Ann', onEndCallback = null) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = audioRate;

    const voices = window.speechSynthesis.getVoices();
    const isMale = ['nick', 'phong', 'nam', 'mr', 'man', 'boy', 'doctor'].some((k) =>
      speaker.toLowerCase().includes(k)
    );

    const voice = voices.find((v) =>
      isMale ? v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('guy') : v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('samantha')
    ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];

    if (voice) utterance.voice = voice;
    utterance.pitch = isMale ? 0.9 : 1.15;

    if (onEndCallback) {
      utterance.onend = onEndCallback;
      utterance.onerror = onEndCallback;
    }

    window.speechSynthesis.speak(utterance);
    if (onSpeechPlay) onSpeechPlay(speaker, text);
  };

  // PHÁT TUẦN TỰ TOÀN BỘ ĐOẠN ĐỐI THOẠI (TASK 1)
  const handlePlayFullDialogue = () => {
    const dialogue = task?.dialogue || lesson?.tasks?.[0]?.dialogue || [];
    if (!dialogue.length) return;

    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
      setActiveDialogueIndex(-1);
      return;
    }

    setIsPlayingAll(true);
    let index = 0;

    const playNextLine = () => {
      if (index >= dialogue.length) {
        setIsPlayingAll(false);
        setActiveDialogueIndex(-1);
        return;
      }
      setActiveDialogueIndex(index);
      const line = dialogue[index];
      index++;
      playSpeech(line.text, line.speaker, () => {
        setTimeout(playNextLine, 350);
      });
    };

    playNextLine();
  };

  if (!task) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Vui lòng chọn một Task để bắt đầu bài học.</p>
      </div>
    );
  }

  // =========================================================================
  // TASK 1: LISTEN AND READ (CHUẨN ẢNH 4)
  // =========================================================================
  if (task.type === 'listen_and_read') {
    const dialogue = task.dialogue || [];
    const images = task.images || [];

    return (
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* TIÊU ĐỀ PHỤ XANH NGỌC & HEADER TASK */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div className="space-y-1">
            {lesson?.headline && (
              <span className="inline-block px-3 py-1 bg-cyan-600 text-white font-extrabold text-sm rounded-full shadow-xs">
                {lesson.headline}
              </span>
            )}
            <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-xs">
                {task.taskNumber || 1}
              </span>
              <span>{task.taskTitle}</span>
              <button
                type="button"
                onClick={handlePlayFullDialogue}
                className={`p-1.5 rounded-full transition cursor-pointer flex items-center space-x-1 ${
                  isPlayingAll ? 'bg-rose-500 text-white animate-pulse' : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                }`}
                title={isPlayingAll ? 'Dừng đọc' : 'Phát toàn bộ bài đọc'}
              >
                <Headphones className="w-5 h-5 text-amber-700" />
              </button>
            </h2>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowTranslations(!showTranslations)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer border ${
                showTranslations ? 'bg-cyan-600 text-white border-cyan-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{showTranslations ? 'Ẩn Dịch Nghĩa' : 'Hiện Dịch Nghĩa'}</span>
            </button>
          </div>
        </div>

        {/* NỘI DUNG 2 CỘT: TRÁI LÀ HỘI THOẠI, PHẢI LÀ HÌNH ẢNH MINH HỌA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI: ĐOẠN ĐỐI THOẠI (7 CỘT TRÊN MÀN HÌNH LỚN) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            {dialogue.map((line, idx) => {
              const isCurrent = activeDialogueIndex === idx;
              return (
                <div
                  key={line.id || idx}
                  className={`p-2.5 sm:p-3 rounded-2xl transition flex items-start justify-between gap-2 group ${
                    isCurrent
                      ? 'bg-amber-100/90 border border-amber-300 shadow-xs'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans">
                      <span className="font-extrabold italic text-slate-950 mr-2">{line.speaker}:</span>
                      <span className={isCurrent ? 'font-bold text-amber-950' : 'text-slate-800'}>{line.text}</span>
                    </div>

                    {showTranslations && line.vi && (
                      <p className="text-xs text-slate-500 font-medium italic pl-4 border-l-2 border-cyan-400">
                        {line.vi}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveDialogueIndex(idx);
                      playSpeech(line.text, line.speaker);
                    }}
                    className={`p-1.5 rounded-xl transition cursor-pointer flex-shrink-0 ${
                      isCurrent
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50'
                    }`}
                    title={`Nghe ${line.speaker} đọc câu này`}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* CỘT PHẢI: ẢNH MINH HỌA (5 CỘT) */}
          <div className="lg:col-span-5 space-y-4">
            {images.map((imgUrl, imgIdx) => (
              <div
                key={imgIdx}
                className="w-full rounded-3xl overflow-hidden border border-slate-200 shadow-md bg-slate-100 group"
              >
                <img
                  src={imgUrl}
                  alt={`Illustration ${imgIdx + 1}`}
                  className="w-full h-48 sm:h-56 object-cover transform group-hover:scale-105 transition duration-500"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TASK 2: SPLIT-VIEW READING COMPREHENSION / FILL IN BLANKS (CHUẨN ẢNH 5)
  // =========================================================================
  if (task.type === 'fill_in_blanks_split') {
    const dialogue = lesson?.tasks?.[0]?.dialogue || [];
    const questions = task.questions || [];

    const handleCheckTask2 = () => {
      setFillChecked(true);
    };

    const handleResetTask2 = () => {
      setFillAnswers({});
      setFillChecked(false);
    };

    return (
      <div className="space-y-4 max-w-7xl mx-auto">
        {/* HEADER TASK */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="space-y-1">
            {lesson?.headline && (
              <span className="inline-block px-3 py-0.5 bg-cyan-600 text-white font-extrabold text-xs rounded-full shadow-xs">
                {lesson.headline}
              </span>
            )}
            <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center space-x-2">
              <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-xs">
                {task.taskNumber || 2}
              </span>
              <span>{task.taskTitle}</span>
            </h2>
          </div>
        </div>

        {/* GIAO DIỆN CHIA ĐÔI MÀN HÌNH (SPLIT-VIEW) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CỘT TRÁI (5 CỘT): VĂN BẢN ĐỐI THOẠI ĐỂ ĐỐI CHIẾU */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm max-h-[70vh] overflow-y-auto space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
              <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
                📖 Đoạn Hội Thoại (Ann & Mi / Trang)
              </span>
              <button
                type="button"
                onClick={handlePlayFullDialogue}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center space-x-1 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Nghe lại</span>
              </button>
            </div>

            {dialogue.map((line, idx) => (
              <div key={line.id || idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                <span className="font-extrabold italic text-slate-950 mr-1.5">{line.speaker}:</span>
                <span>{line.text}</span>
              </div>
            ))}
          </div>

          {/* CỘT PHẢI (7 CỘT): CÁC CÂU HỎI ĐIỀN TỪ VÀO CHỖ TRỐNG */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="space-y-4">
              {questions.map((q) => {
                const userAns = (fillAnswers[q.id] || '').trim().toLowerCase();
                const isCorrect = q.acceptedAnswers?.some((ans) => ans.toLowerCase() === userAns) || q.answer?.toLowerCase() === userAns;
                const isAnswered = Boolean(fillAnswers[q.id]?.trim());

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition space-y-2 ${
                      fillChecked
                        ? isCorrect
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : 'bg-rose-50/70 border-rose-300'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed flex items-center flex-wrap gap-1.5">
                      <span className="font-black text-amber-600 mr-1">{q.num || 1}.</span>
                      <span>{q.textPrefix}</span>

                      {/* Ô INPUT ĐIỀN TỪ */}
                      <input
                        type="text"
                        value={fillAnswers[q.id] || ''}
                        onChange={(e) =>
                          setFillAnswers({
                            ...fillAnswers,
                            [q.id]: e.target.value
                          })
                        }
                        placeholder="..."
                        disabled={fillChecked}
                        className={`px-3 py-1 text-sm font-bold rounded-xl border outline-hidden transition text-center min-w-[140px] max-w-[220px] ${
                          fillChecked
                            ? isCorrect
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-500 font-black'
                              : 'bg-rose-100 text-rose-900 border-rose-500'
                            : 'bg-white border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-slate-900'
                        }`}
                      />

                      <span>{q.textSuffix}</span>

                      {fillChecked && (
                        <span className="ml-1 inline-flex items-center">
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-rose-600" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* HIỂN THỊ ĐÁP ÁN NẾU SOI ĐÁP ÁN HOẶC ĐÃ KIỂM TRA MÀ SAI */}
                    {(showAnswerKey || (fillChecked && !isCorrect)) && (
                      <div className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-xl inline-flex items-center space-x-1.5 border border-emerald-300">
                        <span>💡 Đáp án chuẩn:</span>
                        <span className="font-black underline">{q.answer}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CÁC NÚT KIỂM TRA & LÀM LẠI */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleResetTask2}
                className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Làm Lại</span>
              </button>

              <button
                type="button"
                onClick={handleCheckTask2}
                className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer flex items-center space-x-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Kiểm Tra Đáp Án</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TASK 3: MATCHING DEFINITIONS (NỐI TỪ VỚI ĐỊNH NGHĨA)
  // =========================================================================
  if (task.type === 'matching') {
    const pairs = task.pairs || [];

    const handleSelectWord = (word) => {
      if (matchingChecked) return;
      setSelectedWord(word);
    };

    const handleSelectDef = (pId) => {
      if (matchingChecked || !selectedWord) return;
      setMatchedPairs({
        ...matchedPairs,
        [selectedWord]: pId
      });
      setSelectedWord(null);
    };

    return (
      <div className="space-y-4 max-w-5xl mx-auto">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-xs">
              {task.taskNumber || 3}
            </span>
            <span>{task.taskTitle}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            👉 Nhấp chọn một từ vựng bên trái, sau đó nhấp vào định nghĩa tương ứng bên phải để nối cặp.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          {/* CỘT TỪ VỰNG */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Từ Vựng</h3>
            {pairs.map((p) => {
              const isSelected = selectedWord === p.word;
              const isMatched = Boolean(matchedPairs[p.word]);
              const isCorrect = matchedPairs[p.word] === p.id;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectWord(p.word)}
                  className={`w-full p-3.5 rounded-2xl font-bold text-sm text-left transition border cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md ring-2 ring-amber-300'
                      : isMatched
                      ? matchingChecked
                        ? isCorrect
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-black'
                          : 'bg-rose-100 text-rose-900 border-rose-400'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  <span>{p.word}</span>
                  {p.vi && <span className="text-[11px] text-slate-500 font-medium italic">({p.vi})</span>}
                </button>
              );
            })}
          </div>

          {/* CỘT ĐỊNH NGHĨA */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider">Định Nghĩa</h3>
            {pairs.map((p) => {
              const matchedWord = Object.keys(matchedPairs).find((w) => matchedPairs[w] === p.id);
              const isCorrect = matchedWord === p.word;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectDef(p.id)}
                  className={`w-full p-3.5 rounded-2xl text-xs sm:text-sm text-left transition border cursor-pointer ${
                    matchedWord
                      ? matchingChecked
                        ? isCorrect
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold'
                          : 'bg-rose-100 text-rose-900 border-rose-400'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                      : selectedWord
                      ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-slate-900'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <p className="leading-relaxed">{p.definition}</p>
                  {matchedWord && (
                    <div className="mt-1.5 text-[11px] font-black text-emerald-700 flex items-center space-x-1">
                      <span>🔗 Đã nối với:</span>
                      <span className="underline uppercase">{matchedWord}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* NÚT KIỂM TRA */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setMatchedPairs({});
              setMatchingChecked(false);
              setSelectedWord(null);
            }}
            className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          >
            Làm Lại
          </button>
          <button
            type="button"
            onClick={() => setMatchingChecked(true)}
            className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
          >
            Kiểm Tra Nối Cặp
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // TASK 4 & 5: SENTENCE COMPLETION & QUIZ
  // =========================================================================
  return (
    <div className="space-y-4 max-w-4xl mx-auto bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-lg font-black text-slate-900 flex items-center space-x-2">
          <span className="w-7 h-7 bg-amber-500 text-white rounded-lg flex items-center justify-center text-sm font-black shadow-xs">
            {task.taskNumber || 4}
          </span>
          <span>{task.taskTitle}</span>
        </h2>
      </div>

      <div className="space-y-4">
        {(task.questions || []).map((q, idx) => (
          <div key={q.id || idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <p className="text-sm font-bold text-slate-800 leading-relaxed">
              <span className="text-amber-600 mr-2 font-black">{idx + 1}.</span>
              {q.question || q.sentence}
            </p>

            {q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {q.options.map((opt, oIdx) => {
                  const isChosen = quizAnswers[q.id || idx] === opt;
                  const isCorrect = opt === q.answer;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setQuizAnswers({ ...quizAnswers, [q.id || idx]: opt })}
                      className={`p-2.5 rounded-xl text-xs font-bold text-left transition border cursor-pointer ${
                        isChosen
                          ? quizChecked
                            ? isCorrect
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-500 font-black'
                              : 'bg-rose-100 text-rose-900 border-rose-500'
                            : 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {(showAnswerKey || quizChecked) && q.explanation && (
              <p className="text-xs text-slate-500 italic pt-1">💡 {q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => {
            setQuizAnswers({});
            setQuizChecked(false);
          }}
          className="px-4 py-2 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
        >
          Làm Lại
        </button>
        <button
          type="button"
          onClick={() => setQuizChecked(true)}
          className="px-5 py-2 rounded-xl font-black text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition cursor-pointer"
        >
          Kiểm Tra Đáp Án
        </button>
      </div>
    </div>
  );
}
