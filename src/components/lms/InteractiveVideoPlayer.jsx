import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, Lock, CheckCircle2, RotateCcw, Check, ArrowRight, X, Award, HelpCircle, FileText, Type, CheckSquare, Sparkles } from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// HELPER XỬ LÝ PHÂN TÁCH ĐOẠN VĂN ĐIỀN TỪ (FILL IN THE BLANKS)
const parseFillBlanksText = (textWithBlanks = '') => {
  if (!textWithBlanks) return { parts: [{ type: 'text', content: 'No text provided' }], answers: [] };
  const parts = [];
  const answers = [];
  const regex = /\*(.*?)\*/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(textWithBlanks)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: textWithBlanks.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'blank', index: answers.length, answer: match[1].trim() });
    answers.push(match[1].trim());
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < textWithBlanks.length) {
    parts.push({ type: 'text', content: textWithBlanks.substring(lastIndex) });
  }

  return { parts, answers };
};

// COMPONENT ĐIỀN TỪ MEMO HÓA GÕ LIÊN TỤC VÀ HIỂN THỊ ĐÁP ÁN SAI CỦA HỌC SINH KÈM TỪ ĐÚNG CHUẨN ĐẸP (ẢNH media_1787500594356.png)
const FillBlanksSentence = React.memo(({ textWithBlanks, blankInputs, onInputChange, quizFeedback }) => {
  const { parts, answers } = useMemo(() => parseFillBlanksText(textWithBlanks), [textWithBlanks]);

  return (
    <div className="space-y-4">
      <div className="text-sm sm:text-base text-slate-900 leading-relaxed bg-slate-50 p-5 rounded-2xl border border-slate-200 font-medium shadow-xs">
        {parts.map((item, pIdx) => {
          if (item.type === 'text') {
            return <span key={`text_${pIdx}`}>{item.content}</span>;
          } else {
            const userVal = (blankInputs[item.index] || '').trim();
            const correctAns = answers[item.index] || item.answer || '';
            const isChecked = quizFeedback !== null;
            const isCorrect = isChecked && userVal.toLowerCase() === correctAns.toLowerCase();

            return (
              <span key={`blank_wrap_${item.index}`} className="inline-flex flex-col items-center mx-1 my-1.5 align-middle">
                <span className="relative inline-flex items-center">
                  <input
                    key={`blank_input_${item.index}`}
                    type="text"
                    disabled={isChecked && isCorrect}
                    value={blankInputs[item.index] || ''}
                    onChange={(e) => onInputChange(item.index, e.target.value)}
                    placeholder="gõ từ..."
                    className={`px-3 py-1.5 border-2 rounded-xl text-xs font-extrabold transition shadow-xs ${
                      !isChecked
                        ? 'border-brand-500 text-brand-900 bg-white focus:ring-2 focus:ring-brand-400 focus:outline-none min-w-[120px]'
                        : isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 pr-7 min-w-[120px]'
                        : 'border-rose-500 bg-rose-50 text-rose-900 pr-7 font-bold min-w-[120px]'
                    }`}
                  />
                  {isChecked && (
                    <span className={`absolute right-2 text-xs font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isCorrect ? '✓' : '✕'}
                    </span>
                  )}
                </span>

                {/* SHOW ĐÁP ÁN SAI CỦA HỌC SINH VÀ TỪ ĐÚNG CHUẨN CHÍNH XÁC THEO ẢNH media_1787500594356.png */}
                {isChecked && !isCorrect && (
                  <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md mt-1 border border-rose-200 shadow-2xs">
                    ✕ Bạn điền: "{userVal || 'bỏ trống'}" ➔ Từ đúng: <strong className="text-emerald-800 underline">{correctAns}</strong>
                  </span>
                )}
              </span>
            );
          }
        })}
      </div>
    </div>
  );
});

export default function InteractiveVideoPlayer({ activity, isTeacher }) {
  const containerRef = useRef(null);
  const html5VideoRef = useRef(null);
  const ytPlayerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(146);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mốc tương tác từ activity settings
  const waypoints = activity?.settings?.waypoints || [
    {
      id: 'wp1',
      timeSec: 33,
      type: 'fill_blanks',
      question: 'Fill in the correct word.',
      textWithBlanks: 'The *tailor* made a new *suit* for me.',
    },
    {
      id: 'wp2',
      timeSec: 46,
      type: 'true_false',
      question: 'A tailor cuts hair.',
      isTrue: false,
      answer: 'False',
    },
    {
      id: 'wp3',
      timeSec: 85,
      type: 'multiple_choice',
      question: 'Who protects people and keeps the community safe?',
      options: ['Police officer', 'Doctor', 'Vet'],
      answer: 'Police officer',
    },
    {
      id: 'wp4',
      timeSec: 153,
      type: 'fill_blanks',
      question: 'The _____ is a person who fixes and installs _____ systems.',
      textWithBlanks: 'The *electrician* is a person who fixes and installs *electrical* systems.',
    },
  ];

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [blankInputs, setBlankInputs] = useState({});
  const [trueFalseChoice, setTrueFalseChoice] = useState(null);
  const [selectedMarkWords, setSelectedMarkWords] = useState([]);

  const [quizPassed, setQuizPassed] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [passedCount, setPassedCount] = useState(0);

  const rawVideoUrl = activity?.settings?.videoUrl || activity?.content_url || activity?.content || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const youtubeId = extractYoutubeId(rawVideoUrl);

  const handleBlankInputChange = useCallback((blankIndex, value) => {
    setBlankInputs((prev) => ({ ...prev, [blankIndex]: value }));
  }, []);

  const sendYtCommand = (command) => {
    try {
      const iframe = document.getElementById('yt-interactive-player-iframe');
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: command,
            args: '',
          }),
          '*'
        );
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!youtubeId) return;

    let intervalId = null;
    let isSubscribed = true;

    const initYtPlayer = () => {
      if (!isSubscribed) return;
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current) return;
        try {
          const targetEl = document.getElementById('yt-interactive-player-iframe');
          if (!targetEl) return;
          ytPlayerRef.current = new window.YT.Player('yt-interactive-player-iframe', {
            videoId: youtubeId,
            playerVars: {
              autoplay: 0,
              controls: 1,
              enablejsapi: 1,
              cc_load_policy: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              rel: 0,
            },
            events: {
              onReady: (event) => {
                if (isSubscribed) {
                  setDuration(event.target.getDuration() || 146);
                }
              },
              onStateChange: (event) => {
                if (!isSubscribed) return;
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
            },
          });
        } catch (e) {}
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      const head = document.head || document.getElementsByTagName('head')[0];
      if (head) head.appendChild(tag);

      const prevReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevReady) prevReady();
        initYtPlayer();
      };
    } else {
      initYtPlayer();
    }

    intervalId = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const curSec = Math.floor(ytPlayerRef.current.getCurrentTime());
          setCurrentTime(curSec);
          checkWaypointTrigger(curSec);
        } catch (e) {}
      }
    }, 400);

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
    };
  }, [youtubeId]);

  const checkWaypointTrigger = (curSec) => {
    const wp = waypoints.find((w) => w.timeSec === curSec && !quizPassed[w.id || w.timeSec]);
    if (wp && !activeQuiz) {
      pauseVideo();
      setActiveQuiz(wp);
      setQuizFeedback(null);
      setBlankInputs({});
      setSelectedOpt('');
      setTrueFalseChoice(null);
      setSelectedMarkWords([]);
    }
  };

  const handleHtml5TimeUpdate = () => {
    if (!html5VideoRef.current) return;
    const curSec = Math.floor(html5VideoRef.current.currentTime);
    setCurrentTime(curSec);
    checkWaypointTrigger(curSec);
  };

  const playVideo = () => {
    setIsPlaying(true);
    if (youtubeId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {
          sendYtCommand('playVideo');
        }
      } else {
        sendYtCommand('playVideo');
      }
    } else if (html5VideoRef.current) {
      html5VideoRef.current.play();
    }
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    if (youtubeId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {
          sendYtCommand('pauseVideo');
        }
      } else {
        sendYtCommand('pauseVideo');
      }
    } else if (html5VideoRef.current) {
      html5VideoRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  const handleCheckAnswer = () => {
    if (!activeQuiz) return;

    if (activeQuiz.type === 'true_false') {
      if (trueFalseChoice === null) {
        setQuizFeedback({ success: false, msg: '⚠️ Vui lòng nhấp chọn True (Đúng) hoặc False (Sai) trước khi bấm Check!', details: '' });
        return;
      }

      let targetBool = false;
      if (typeof activeQuiz.isTrue === 'boolean') {
        targetBool = activeQuiz.isTrue;
      } else if (typeof activeQuiz.isTrue === 'string') {
        targetBool = activeQuiz.isTrue.toLowerCase() === 'true';
      } else if (activeQuiz.answer) {
        targetBool = String(activeQuiz.answer).toLowerCase() === 'true';
      } else if (typeof activeQuiz.correctIndex === 'number') {
        targetBool = activeQuiz.correctIndex === 0;
      }

      const isCorrect = trueFalseChoice === targetBool;
      if (isCorrect) {
        setQuizFeedback({ success: true, msg: '🎉 Chính xác tuyệt đối!', details: `Đáp án đúng: ${targetBool ? 'True (Đúng)' : 'False (Sai)'}` });
      } else {
        setQuizFeedback({ success: false, msg: '❌ Chưa chính xác rồi!', details: `Đáp án đúng là: ${targetBool ? 'True (Đúng)' : 'False (Sai)'}` });
      }
    } else if (activeQuiz.type === 'multiple_choice' || (!activeQuiz.type && activeQuiz.options?.length > 0)) {
      if (!selectedOpt) {
        setQuizFeedback({ success: false, msg: '⚠️ Vui lòng chọn 1 đáp án trước khi bấm Check!', details: '' });
        return;
      }
      const isCorrect = selectedOpt === activeQuiz.answer;
      if (isCorrect) {
        setQuizFeedback({ success: true, msg: '🎉 Chính xác! Bạn trả lời rất giỏi.', details: `Đáp án đúng: ${activeQuiz.answer}` });
      } else {
        setQuizFeedback({ success: false, msg: '❌ Chưa chính xác. Vui lòng thử lại!', details: `Đáp án đúng chuẩn: ${activeQuiz.answer}` });
      }
    } else if (activeQuiz.type === 'fill_blanks') {
      const { answers } = parseFillBlanksText(activeQuiz.textWithBlanks);
      let isAllCorrect = true;
      const wrongList = [];

      answers.forEach((ans, idx) => {
        const userTyped = (blankInputs[idx] || '').trim();
        if (userTyped.toLowerCase() !== ans.toLowerCase()) {
          isAllCorrect = false;
          wrongList.push(`Từ ${idx + 1}: Bạn nhập "${userTyped || 'bỏ trống'}" ➔ Đúng là "${ans}"`);
        }
      });

      if (isAllCorrect) {
        setQuizFeedback({ success: true, msg: '🎉 Tuyệt vời! Bạn đã điền chính xác tất cả các từ.', details: `Đáp án: ${answers.join(', ')}` });
      } else {
        setQuizFeedback({
          success: false,
          msg: '❌ Một số từ điền chưa đúng. Hãy kiểm tra lại bên dưới!',
          details: wrongList.join(' | '),
        });
      }
    } else if (activeQuiz.type === 'mark_word') {
      const correctWords = activeQuiz.correctWords || [];
      const isMatch = selectedMarkWords.length === correctWords.length && selectedMarkWords.every((w) => correctWords.includes(w));
      if (isMatch) {
        setQuizFeedback({ success: true, msg: '🎉 Xuất sắc! Bạn đã Highlight đúng tất cả các từ.', details: `Các từ đúng: ${correctWords.join(', ')}` });
      } else {
        setQuizFeedback({ success: false, msg: '❌ Highlight chưa chính xác.', details: `Các từ đúng cần Highlight là: ${correctWords.join(', ')}` });
      }
    } else {
      setQuizFeedback({ success: true, msg: '🎉 Hoàn thành xuất sắc!', details: '' });
    }
  };

  const handleCloseAndContinue = () => {
    if (activeQuiz) {
      const qKey = activeQuiz.id || activeQuiz.timeSec;
      setQuizPassed((prev) => ({ ...prev, [qKey]: true }));
      setPassedCount((prev) => prev + 1);
    }
    setActiveQuiz(null);
    setSelectedOpt('');
    setBlankInputs({});
    setTrueFalseChoice(null);
    setSelectedMarkWords([]);
    setQuizFeedback(null);
    playVideo();
  };

  const toggleMarkWordSelect = (word) => {
    if (quizFeedback?.success) return;
    if (selectedMarkWords.includes(word)) {
      setSelectedMarkWords(selectedMarkWords.filter((w) => w !== word));
    } else {
      setSelectedMarkWords([...selectedMarkWords, word]);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans select-none">
      {/* HEADER BANNER */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-full inline-block">
            🎥 INTERACTIVE VIDEO H5P (VIDEO TƯƠNG TÁC)
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">
            {(activity?.title || 'Interactive Video').replace('[WHITEBOARD]', '').replace('[AUDIO_RECORD]', '').replace('[INTERACTIVE_VIDEO]', '').trim()}
          </h2>
        </div>

        <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-2xl text-xs font-bold text-amber-900">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Tiến độ: {passedCount} / {waypoints.length} mốc câu hỏi</span>
        </div>
      </div>

      {/* VÙNG PHÁT VIDEO CHÍNH KÈM OVERLAY POPUP */}
      <div ref={containerRef} className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
        {youtubeId ? (
          <iframe
            id="yt-interactive-player-iframe"
            src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&controls=1&cc_load_policy=0&iv_load_policy=3&modestbranding=1&rel=0`}
            title="Interactive Video Player"
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={html5VideoRef}
            src={rawVideoUrl}
            onTimeUpdate={handleHtml5TimeUpdate}
            onLoadedMetadata={() => setDuration(html5VideoRef.current?.duration || 146)}
            className="w-full h-full object-contain"
          />
        )}

        {/* OVERLAY POP-UP CÂU HỎI TƯƠNG TÁC */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs z-40 flex items-center justify-center p-4 sm:p-6 text-slate-900 animate-scale-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-sky-400 max-w-xl w-full shadow-2xl space-y-4 text-left relative">
              <button
                type="button"
                onClick={handleCloseAndContinue}
                title="Đóng câu hỏi và tiếp tục xem video"
                className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer border border-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 pr-10">
                <span className="text-sky-600 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>⏸️ VIDEO DỪNG - CÂU HỎI H5P ({activeQuiz.timeSec}S)</span>
                </span>
              </div>

              {/* DẠNG 1: MULTIPLE CHOICE */}
              {(activeQuiz.type === 'multiple_choice' || (!activeQuiz.type && activeQuiz.options?.length > 0)) && (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <div className="space-y-2">
                    {activeQuiz.options?.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (quizFeedback?.success) return;
                          setSelectedOpt(opt);
                        }}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                          selectedOpt === opt
                            ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <span>{opt}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedOpt === opt ? 'border-brand-600 bg-brand-600' : 'border-slate-300'}`}>
                          {selectedOpt === opt && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* DẠNG 2: FILL IN THE BLANKS (CÓ MEMO HÓA VÀ HIỂN THỊ ĐÁP ÁN SAI CỦA HS KÈM TỪ ĐÚNG CHUẨN ẢNH media_1787500594356.png) */}
              {activeQuiz.type === 'fill_blanks' && (
                <div className="space-y-3">
                  {activeQuiz.question &&
                    activeQuiz.question !== 'Fill in the correct word.' &&
                    !activeQuiz.textWithBlanks?.includes(activeQuiz.question) && (
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {activeQuiz.question}
                      </h4>
                    )}
                  <FillBlanksSentence
                    textWithBlanks={activeQuiz.textWithBlanks}
                    blankInputs={blankInputs}
                    onInputChange={handleBlankInputChange}
                    quizFeedback={quizFeedback}
                  />
                </div>
              )}

              {/* DẠNG 3: TRUE / FALSE */}
              {activeQuiz.type === 'true_false' && (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setTrueFalseChoice(true)}
                      className={`p-4 rounded-2xl border-2 font-extrabold text-sm transition cursor-pointer text-center flex items-center justify-center space-x-2 ${
                        trueFalseChoice === true
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-4 ring-emerald-500/20 shadow-md scale-[1.02]'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>✓ True (Đúng)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTrueFalseChoice(false)}
                      className={`p-4 rounded-2xl border-2 font-extrabold text-sm transition cursor-pointer text-center flex items-center justify-center space-x-2 ${
                        trueFalseChoice === false
                          ? 'border-rose-600 bg-rose-50 text-rose-900 ring-4 ring-rose-500/20 shadow-md scale-[1.02]'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span>✕ False (Sai)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DẠNG 4: HIGHLIGHT / MARK THE WORD */}
              {activeQuiz.type === 'mark_word' && (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <div className="flex flex-wrap gap-2.5 pt-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {(activeQuiz.wordList || ['Strawberries', 'Cookies', 'Blueberries', 'Milk']).map((word, wIdx) => {
                      const isSelected = selectedMarkWords.includes(word);
                      return (
                        <button
                          key={wIdx}
                          type="button"
                          onClick={() => toggleMarkWordSelect(word)}
                          className={`px-4 py-2 rounded-xl border text-xs font-extrabold transition cursor-pointer ${
                            isSelected
                              ? 'bg-brand-600 text-white border-brand-700 shadow-md transform scale-105'
                              : 'bg-white text-slate-800 border-slate-300 hover:border-brand-500 hover:bg-brand-50'
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DẠNG 5: DRAG AND DROP */}
              {activeQuiz.type === 'drag_drop' && (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <p className="text-xs text-slate-500">Hãy chọn các đáp án phù hợp bên dưới:</p>
                  <div className="flex flex-wrap gap-2">
                    {activeQuiz.options?.map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedOpt(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${selectedOpt === opt ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* THÔNG BÁO PHẢN HỒI ĐÚNG / SAI VÀ ĐÁP ÁN CHUẨN */}
              {quizFeedback && (
                <div className={`p-4 rounded-2xl text-xs font-bold space-y-1 border ${
                  quizFeedback.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}>
                  <p className="text-sm font-extrabold">{quizFeedback.msg}</p>
                  {quizFeedback.details && <p className="text-[11px] font-semibold opacity-90">{quizFeedback.details}</p>}
                </div>
              )}

              {/* NÚT CHECK VÀ NÚT CONTINUE / ĐÓNG XEM TIẾP */}
              <div className="flex items-center space-x-3 pt-2">
                {!quizFeedback ? (
                  <button
                    type="button"
                    onClick={handleCheckAnswer}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCloseAndContinue}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer animate-pulse"
                  >
                    <span>Continue (Đóng & Xem Tiếp Video)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* THANH TIMELINE DÍNH TRỰC TIẾP VÀO BOTTOM KHUNG VIDEO CHUẨN H5P */}
        <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-white text-xs space-x-3 border-t border-slate-800/80 z-30">
          <button onClick={togglePlay} className="p-1.5 hover:bg-slate-800 rounded-lg transition cursor-pointer text-white">
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400 ml-0.5" />}
          </button>

          <div className="flex-1 relative h-6 flex items-center cursor-pointer">
            <div className="w-full bg-slate-800/90 h-2 rounded-full overflow-hidden border border-slate-700 relative">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {waypoints.map((w, idx) => {
              const posPercent = duration ? (w.timeSec / duration) * 100 : 0;
              const isP = quizPassed[w.id || w.timeSec];
              return (
                <div
                  key={idx}
                  title={`Mốc ${w.timeSec}s: ${w.question}`}
                  style={{ left: `${posPercent}%` }}
                  className={`absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full border-2 border-white ring-2 shadow-md cursor-pointer hover:scale-125 transition z-40 flex items-center justify-center ${
                    isP ? 'bg-emerald-400 ring-emerald-500/50' : 'bg-amber-400 ring-amber-500/50 animate-pulse'
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                </div>
              );
            })}
          </div>

          <span className="font-mono text-slate-300 text-[11px] font-bold bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
            {currentTime}s / {Math.floor(duration)}s
          </span>
        </div>
      </div>
    </div>
  );
}
