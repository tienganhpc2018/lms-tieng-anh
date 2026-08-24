import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Play, Pause, Lock, CheckCircle2, RotateCcw, Check, ArrowRight, X, Award, HelpCircle, FileText, Type, CheckSquare, Sparkles, Eye } from 'lucide-react';

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

// HELPER PHÁT ÂM THANH CHUÔNG VUI TAI KHI TRẢ LỜI ĐÚNG / SAI (WEB AUDIO API CHUẨN 100% KHÔNG CẦN ASSETS NGOÀI)
const playSoundEffect = (type = 'correct') => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'correct') {
      // ÂM THANH "TING TING!" CHUÔNG VUI TAI KHI ĐÚNG (3 NỐT C5 - E5 - G5)
      const now = ctx.currentTime;
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0.4, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.35);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.25);
      gain3.gain.setValueAtTime(0.5, now + 0.25);
      gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.25);
      osc3.stop(now + 0.5);
    } else {
      // ÂM THANH "UH OH" KHI TRẢ LỜI CHƯA ĐÚNG
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(260, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(180, now + 0.18);
      gain2.gain.setValueAtTime(0.3, now + 0.18);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.18);
      osc2.stop(now + 0.45);
    }
  } catch (e) {}
};

// COMPONENT GAP-FILL / FILL IN THE BLANKS H5P CHUẨN KẾT QUẢ KHI BẤM CHECK V79
const FillBlanksSentenceH5P = React.memo(({ textWithBlanks, blankInputs, onInputChange, quizFeedback, isSolutionVisible }) => {
  const { parts, answers } = useMemo(() => parseFillBlanksText(textWithBlanks), [textWithBlanks]);
  const isChecked = quizFeedback !== null;

  return (
    <div className="space-y-4 text-left select-text" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
      <div className="text-base sm:text-lg text-slate-900 leading-relaxed font-medium select-text">
        {parts.map((item, pIdx) => {
          if (item.type === 'text') {
            return <span key={`text_${pIdx}`}>{item.content}</span>;
          } else {
            const userVal = (blankInputs[item.index] || '').trim();
            const correctAns = answers[item.index] || item.answer || '';
            const isCorrect = isChecked && userVal.toLowerCase() === correctAns.toLowerCase();

            if (!isChecked) {
              return (
                <input
                  key={`blank_input_${item.index}`}
                  type="text"
                  defaultValue={blankInputs[item.index] || ''}
                  onInput={(e) => {
                    onInputChange(item.index, e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onKeyUp={(e) => e.stopPropagation()}
                  style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                  className="mx-1 px-3 py-1.5 border-2 border-slate-300 focus:border-blue-600 rounded-md text-sm font-bold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none inline-block min-w-[100px] text-center shadow-xs align-baseline select-text cursor-text"
                />
              );
            }

            if (isCorrect) {
              return (
                <span key={`blank_input_${item.index}`} className="inline-flex items-center mx-1 px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold border-2 border-emerald-400 text-sm align-baseline shadow-xs">
                  <span>{userVal}</span>
                  <span className="ml-1 text-emerald-600 font-black text-xs">✓</span>
                </span>
              );
            }

            return (
              <span key={`blank_input_${item.index}`} className="inline-flex items-center mx-1 align-baseline space-x-1.5">
                <span className="inline-flex items-center px-3 py-1 rounded-md bg-rose-100 text-rose-900 font-bold border-2 border-rose-400 text-sm shadow-xs">
                  <span className="line-through">{userVal || '___'}</span>
                  <span className="ml-1 text-rose-600 font-black text-xs">✕</span>
                </span>
                {isSolutionVisible ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-md bg-emerald-100 text-emerald-900 font-bold border-2 border-emerald-400 text-sm animate-scale-up shadow-xs">
                    <span>{correctAns}</span>
                    <span className="ml-1 text-emerald-600 font-black text-xs">✓</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-slate-600 italic">
                    (Từ đúng: <strong className="text-emerald-700 font-extrabold">{correctAns}</strong>)
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
      timeSec: 31,
      type: 'fill_blanks',
      question: 'Fill in the correct ingredients',
      textWithBlanks: 'Strawberries and *blueberries* are mixed with *milk* and oatmeal *banana* to make this delicious smoothie.',
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
  ];

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [blankInputs, setBlankInputs] = useState({});
  const [trueFalseChoice, setTrueFalseChoice] = useState(null);
  const [selectedMarkWords, setSelectedMarkWords] = useState([]);

  const [quizPassed, setQuizPassed] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [isSolutionVisible, setIsSolutionVisible] = useState(false);
  const [showFinalSummary, setShowFinalSummary] = useState(false);

  // V83: DYNAMIC PASSED COUNT CHỈ ĐẾM CÁC CÂU HỌC SINH LÀM ĐÚNG CHUẨN XÁC
  const passedCount = useMemo(() => {
    return Object.values(quizPassed).filter(Boolean).length;
  }, [quizPassed]);

  // V84: ĐẾM SỐ CÂU HỌC SINH ĐÃ THỰC HIỆN ĐỂ ĐỒNG BỘ MỞ / KHÓA NÚT XEM BẢNG ĐIỂM
  const attemptedCount = useMemo(() => {
    return Object.keys(quizPassed).length;
  }, [quizPassed]);

  // HÀM TÍNH PHẦN TRĂM VÀ TÌM FEEDBACK SCORE RANGE THÍCH HỢP TỪ CẤU HÌNH GIÁO VIÊN V82
  const getScoreRangeFeedback = (percent) => {
    const customRanges = activity?.settings?.scoreRanges;
    if (Array.isArray(customRanges) && customRanges.length > 0) {
      const matched = customRanges.find((r) => percent >= r.from && percent <= r.to);
      if (matched && matched.feedback) return matched.feedback;
    }
    // MẶC ĐỊNH H5P KHI GIÁO VIÊN CHƯA THIẾT LẬP CUSTOM
    if (percent >= 90) return '🎉 Xuất sắc! Bạn đã hiểu 100% nội dung video bài học!';
    if (percent >= 70) return '👍 Tốt! Bạn đã nắm được đa số kiến thức quan trọng trong bài giảng.';
    if (percent >= 50) return '💪 Khá! Hãy xem lại các mốc câu hỏi chưa chính xác để đạt điểm tuyệt đối nhé.';
    return '📚 Bạn cần luyện tập thêm! Hãy xem lại video từ đầu để hiểu rõ bài học hơn nhé.';
  };

  // V79: CHỐNG LỖI STALE CLOSURE TRONG SETINTERVAL BẰNG REFS TRỰC TIẾP
  const activeQuizRef = useRef(activeQuiz);
  const quizPassedRef = useRef(quizPassed);

  useEffect(() => {
    activeQuizRef.current = activeQuiz;
  }, [activeQuiz]);

  useEffect(() => {
    quizPassedRef.current = quizPassed;
  }, [quizPassed]);

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

  // V79: CHỈ AUTO-FOCUS VÀO INPUT LẦN ĐẦU TIÊN MỞ POPUP MÀ KHÔNG SELECT() ĐỂ TRÁNH MẤT NỘI DUNG VĂN BẢN
  useEffect(() => {
    if (activeQuiz) {
      const timer = setTimeout(() => {
        const firstInput = containerRef.current?.querySelector('input[type="text"]');
        if (firstInput) {
          firstInput.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeQuiz]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, []);

  const checkWaypointTrigger = useCallback((curSec) => {
    // V79: NẾU ĐANG CÓ POPUP HIỂN THỊ THÌ TUYỆT ĐỐI KHÔNG RESET FEEDBACK HOẶC BÀI LÀM CỦA HỌC SINH
    if (activeQuizRef.current) return;
    const wp = waypoints.find((w) => w.timeSec === curSec && !quizPassedRef.current[w.id || w.timeSec]);
    if (wp) {
      pauseVideo();
      setActiveQuiz(wp);
      setQuizFeedback(null);
      setIsSolutionVisible(false);
      setBlankInputs({});
      setSelectedOpt('');
      setTrueFalseChoice(null);
      setSelectedMarkWords([]);
    }
  }, [waypoints]);

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
              controls: 0, // AN DUNG THANH TIMELINE NATIVE CUA YOUTUBE DE TRIET TEU THUA TIMELINE 2 HANG V76
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
  }, [youtubeId, checkWaypointTrigger]);

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
        playSoundEffect('correct');
        setQuizFeedback({ success: true, msg: '🎉 Chính xác tuyệt đối!', details: `Đáp án đúng: ${targetBool ? 'True (Đúng)' : 'False (Sai)'}` });
      } else {
        playSoundEffect('incorrect');
        setQuizFeedback({ success: false, msg: '❌ Chưa chính xác rồi!', details: `Đáp án đúng là: ${targetBool ? 'True (Đúng)' : 'False (Sai)'}` });
      }
    } else if (activeQuiz.type === 'multiple_choice' || (!activeQuiz.type && activeQuiz.options?.length > 0)) {
      if (!selectedOpt) {
        setQuizFeedback({ success: false, msg: '⚠️ Vui lòng chọn 1 đáp án trước khi bấm Check!', details: '' });
        return;
      }
      const isCorrect = selectedOpt === activeQuiz.answer;
      if (isCorrect) {
        playSoundEffect('correct');
        setQuizFeedback({ success: true, msg: '🎉 Chính xác! Bạn trả lời rất giỏi.', details: `Đáp án đúng: ${activeQuiz.answer}` });
      } else {
        playSoundEffect('incorrect');
        setQuizFeedback({ success: false, msg: '❌ Chưa chính xác. Vui lòng thử lại!', details: `Đáp án đúng chuẩn: ${activeQuiz.answer}` });
      }
    } else if (activeQuiz.type === 'fill_blanks') {
      const { answers } = parseFillBlanksText(activeQuiz.textWithBlanks);
      let isAllCorrect = true;
      let correctCount = 0;

      answers.forEach((ans, idx) => {
        const userTyped = (blankInputs[idx] || '').trim();
        if (userTyped.toLowerCase() === ans.toLowerCase()) {
          correctCount++;
        } else {
          isAllCorrect = false;
        }
      });

      if (isAllCorrect) {
        playSoundEffect('correct');
      } else {
        playSoundEffect('incorrect');
      }

      setQuizFeedback({
        success: isAllCorrect,
        correctCount,
        totalCount: answers.length || 1,
      });
    } else if (activeQuiz.type === 'mark_word') {
      const correctWords = activeQuiz.correctWords || [];
      const isMatch = selectedMarkWords.length === correctWords.length && selectedMarkWords.every((w) => correctWords.includes(w));
      if (isMatch) {
        playSoundEffect('correct');
        setQuizFeedback({ success: true, msg: '🎉 Xuất sắc! Bạn đã Highlight đúng tất cả các từ.', details: `Các từ đúng: ${correctWords.join(', ')}` });
      } else {
        playSoundEffect('incorrect');
        setQuizFeedback({ success: false, msg: '❌ Highlight chưa chính xác.', details: `Các từ đúng cần Highlight là: ${correctWords.join(', ')}` });
      }
    } else {
      playSoundEffect('correct');
      setQuizFeedback({ success: true, msg: '🎉 Hoàn thành xuất sắc!', details: '' });
    }
  };

  const handleCloseAndContinue = () => {
    if (activeQuiz) {
      const qKey = activeQuiz.id || activeQuiz.timeSec;
      const isPassed = quizFeedback?.success === true;
      setQuizPassed((prev) => ({ ...prev, [qKey]: isPassed }));
    }
    setActiveQuiz(null);
    setSelectedOpt('');
    setBlankInputs({});
    setTrueFalseChoice(null);
    setSelectedMarkWords([]);
    setQuizFeedback(null);
    setIsSolutionVisible(false);
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans select-text">
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

        <div className="flex items-center space-x-2 relative group">
          <button
            type="button"
            disabled={attemptedCount === 0}
            onClick={() => {
              if (attemptedCount > 0) {
                setShowFinalSummary(true);
              }
            }}
            title={attemptedCount === 0 ? 'Hãy xem video và làm câu hỏi để mở bảng điểm' : 'Xem Bảng Điểm & Đánh Giá Score Range'}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-2xl text-xs font-extrabold transition shadow-2xs ${
              attemptedCount === 0
                ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                : 'bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 cursor-pointer'
            }`}
          >
            {attemptedCount === 0 ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : <Award className="w-4 h-4 text-amber-600" />}
            <span>Tiến độ: {passedCount} / {waypoints.length} mốc {attemptedCount === 0 ? '(Khóa)' : '(Xem Bảng Điểm)'}</span>
          </button>

          {/* TOOLTIP THÔNG BÁO KHI NÚT BỊ KHÓA V84 */}
          {attemptedCount === 0 && (
            <div className="absolute right-0 top-full mt-1.5 hidden group-hover:flex items-center space-x-1 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xl z-50 whitespace-nowrap border border-slate-700 animate-fade-in pointer-events-none">
              <span>🔒 Hãy xem video và làm câu hỏi để mở bảng điểm</span>
            </div>
          )}
        </div>
      </div>

      {/* VÙNG PHÁT VIDEO CHÍNH KÈM OVERLAY POPUP */}
      <div ref={containerRef} className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
        {/* WRAPPER KHỚP DÓNG BẰNG VIDEO/IFRAME KHI ACTIVE QUIZ MỞ V76 */}
        <div
          className="w-full h-full"
          style={{
            pointerEvents: activeQuiz ? 'none' : 'auto',
            opacity: activeQuiz ? 0.15 : 1,
            filter: activeQuiz ? 'blur(6px)' : 'none',
            transition: 'all 0.3s ease',
          }}
        >
          {youtubeId ? (
            <iframe
              id="yt-interactive-player-iframe"
              src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&autoplay=0&controls=0&cc_load_policy=0&iv_load_policy=3&modestbranding=1&rel=0`}
              title="Interactive Video Player"
              style={{ pointerEvents: activeQuiz ? 'none' : 'auto' }}
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
              style={{ pointerEvents: activeQuiz ? 'none' : 'auto' }}
              className="w-full h-full object-contain"
            />
          )}
        </div>

        {/* OVERLAY POP-UP CÂU HỎI TƯƠNG TÁC (CHẤN CHUẨN Z-INDEX: 99999; POINTER-EVENTS: AUTO; POSITION: ABSOLUTE THEO CẢI TIẾN THẦY HẢI) */}
        {activeQuiz && (
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ zIndex: 99999, pointerEvents: 'auto', position: 'absolute' }}
            className="inset-0 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 text-slate-900 animate-scale-up"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{ zIndex: 99999, pointerEvents: 'auto', position: 'relative' }}
              className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-slate-200 max-w-xl w-full shadow-2xl space-y-4 text-left select-text"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseAndContinue();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                style={{ zIndex: 99999, pointerEvents: 'auto', position: 'absolute' }}
                title="Đóng câu hỏi và tiếp tục xem video"
                className="top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition cursor-pointer border border-slate-300"
              >
                <X className="w-5 h-5" />
              </button>

              {/* DẠNG GAP-FILL / FILL IN THE BLANKS CHUẨN H5P */}
              {activeQuiz.type === 'fill_blanks' && (
                <div className="space-y-4 select-text" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug border-b border-slate-100 pb-3">
                    {activeQuiz.question || 'Fill in the correct ingredients'}
                  </h3>

                  <FillBlanksSentenceH5P
                    textWithBlanks={activeQuiz.textWithBlanks}
                    blankInputs={blankInputs}
                    onInputChange={handleBlankInputChange}
                    quizFeedback={quizFeedback}
                    isSolutionVisible={isSolutionVisible}
                  />

                  {/* THỐNG KÊ SỐ LỖI ĐÚNG / SAI CÂU ĐIỀN TỪ */}
                  {quizFeedback && (
                    <p className="text-blue-600 font-extrabold text-base pt-1 select-text">
                      You got {quizFeedback.correctCount} of {quizFeedback.totalCount} blanks correct.
                    </p>
                  )}

                  {/* THANH THỐNG KÊ NGÔI SAO & BỘ NÚT ĐIỀU KHIỂN CHUẨN H5P */}
                  {quizFeedback ? (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                      <div className="flex items-center space-x-2 bg-slate-100 px-4 py-2 rounded-full border border-slate-200 shadow-2xs">
                        <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full transition-all"
                            style={{ width: `${(quizFeedback.correctCount / quizFeedback.totalCount) * 100}%` }}
                          />
                        </div>
                        <span className="text-amber-500 font-black text-lg">⭐</span>
                        <span className="text-slate-800 font-extrabold text-sm">
                          {quizFeedback.correctCount}/{quizFeedback.totalCount}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsSolutionVisible(!isSolutionVisible);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          title="Xem / Ẩn đáp án chuẩn"
                          className={`p-3 rounded-full transition cursor-pointer shadow-md ${
                            isSolutionVisible ? 'bg-blue-700 text-white ring-4 ring-blue-300' : 'bg-blue-600 hover:bg-blue-700 text-white'
                          }`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setBlankInputs({});
                            setQuizFeedback(null);
                            setIsSolutionVisible(false);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          title="Làm lại bài tập này"
                          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition cursor-pointer shadow-md"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseAndContinue();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          title="Đóng & tiếp tục xem video"
                          className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition cursor-pointer shadow-md animate-pulse"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckAnswer();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Check</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseAndContinue();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-full text-sm shadow-md transition flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                        <span>Continue</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* DẠNG 1: MULTIPLE CHOICE (CUNG CẤP ĐÁP ÁN ĐÚNG NỔI BẬT THEO ẢNH media_1787545462843.png V82) */}
              {(activeQuiz.type === 'multiple_choice' || (!activeQuiz.type && activeQuiz.options?.length > 0)) && (
                <div className="space-y-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <div className="space-y-2.5">
                    {activeQuiz.options?.map((opt, i) => {
                      const isSelected = selectedOpt === opt;
                      const isCorrectAns = opt === activeQuiz.answer;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (quizFeedback) return;
                            setSelectedOpt(opt);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          className={`w-full p-4 rounded-2xl text-left text-sm font-extrabold border-2 transition cursor-pointer flex items-center justify-between shadow-xs ${
                            quizFeedback
                              ? isCorrectAns
                                ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-4 ring-emerald-400/40 shadow-lg scale-[1.02]'
                                : isSelected
                                ? 'border-rose-500 bg-rose-100 text-rose-900 ring-4 ring-rose-400/40 shadow-lg'
                                : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                              : isSelected
                              ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-400/40 scale-[1.02] shadow-lg'
                              : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span>{opt}</span>
                            {quizFeedback && isCorrectAns && (
                              <span className="px-2 py-0.5 bg-emerald-200 text-emerald-950 rounded-md text-xs font-black">
                                ✓ Đáp án đúng
                              </span>
                            )}
                            {quizFeedback && isSelected && !isCorrectAns && (
                              <span className="px-2 py-0.5 bg-rose-200 text-rose-950 rounded-md text-xs font-black">
                                ✕ Lựa chọn của bạn - Sai
                              </span>
                            )}
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            quizFeedback
                              ? isCorrectAns
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : isSelected
                                ? 'border-rose-600 bg-rose-600 text-white'
                                : 'border-slate-300'
                              : isSelected
                              ? 'border-white bg-white text-blue-600'
                              : 'border-slate-300'
                          }`}>
                            {quizFeedback ? (
                              isCorrectAns ? <Check className="w-3.5 h-3.5 stroke-[4]" /> : isSelected ? <X className="w-3.5 h-3.5 stroke-[4]" /> : null
                            ) : (
                              isSelected && <Check className="w-3.5 h-3.5 stroke-[4]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {quizFeedback && (
                    <div className={`p-4 rounded-2xl text-xs font-bold space-y-1.5 border ${
                      quizFeedback.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}>
                      <p className="text-sm font-extrabold">{quizFeedback.msg}</p>
                      <p className="text-xs font-extrabold opacity-95">
                        👉 Đáp án đúng chuẩn: <strong className="text-emerald-800 underline font-black text-sm">{activeQuiz.answer}</strong>
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                    {!quizFeedback ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckAnswer();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Check</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseAndContinue();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Continue (Đóng & Xem Tiếp Video)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* DẠNG 3: TRUE / FALSE (HIỂN THỊ CHI TIẾT ĐÁP ÁN ĐÚNG/SAI CHUẨN XÁC ẢNH 1 media_1787544474823.png) */}
              {activeQuiz.type === 'true_false' && (() => {
                let targetBool = false;
                if (typeof activeQuiz.isTrue === 'boolean') {
                  targetBool = activeQuiz.isTrue;
                } else if (typeof activeQuiz.isTrue === 'string') {
                  targetBool = activeQuiz.isTrue.toLowerCase() === 'true';
                } else if (activeQuiz.answer) {
                  targetBool = String(activeQuiz.answer).toLowerCase() === 'true' || String(activeQuiz.answer).toLowerCase() === 'true (đúng)';
                } else if (typeof activeQuiz.correctIndex === 'number') {
                  targetBool = activeQuiz.correctIndex === 0;
                }

                return (
                  <div className="space-y-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                    <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                      {activeQuiz.question}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (quizFeedback) return;
                          setTrueFalseChoice(true);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className={`p-4 rounded-2xl border-2 font-extrabold text-sm transition cursor-pointer text-center flex items-center justify-center space-x-2 ${
                          quizFeedback
                            ? targetBool === true
                              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-4 ring-emerald-400/40 shadow-lg scale-[1.02]'
                              : trueFalseChoice === true
                              ? 'border-rose-500 bg-rose-100 text-rose-900 ring-4 ring-rose-400/40 shadow-lg'
                              : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                            : trueFalseChoice === true
                            ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-400/40 shadow-lg scale-[1.03]'
                            : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span>
                          {quizFeedback && targetBool === true ? '✓ True (Đáp án đúng)' : quizFeedback && trueFalseChoice === true ? '✕ True (Lựa chọn của bạn - Sai)' : '✓ True (Đúng)'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (quizFeedback) return;
                          setTrueFalseChoice(false);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className={`p-4 rounded-2xl border-2 font-extrabold text-sm transition cursor-pointer text-center flex items-center justify-center space-x-2 ${
                          quizFeedback
                            ? targetBool === false
                              ? 'border-emerald-500 bg-emerald-100 text-emerald-900 ring-4 ring-emerald-400/40 shadow-lg scale-[1.02]'
                              : trueFalseChoice === false
                              ? 'border-rose-500 bg-rose-100 text-rose-900 ring-4 ring-rose-400/40 shadow-lg'
                              : 'border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                            : trueFalseChoice === false
                            ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-400/40 shadow-lg scale-[1.03]'
                            : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span>
                          {quizFeedback && targetBool === false ? '✓ False (Đáp án đúng)' : quizFeedback && trueFalseChoice === false ? '✕ False (Lựa chọn của bạn - Sai)' : '✕ False (Sai)'}
                        </span>
                      </button>
                    </div>

                    {quizFeedback && (
                      <div className={`p-4 rounded-2xl text-xs font-bold space-y-1 border ${
                        quizFeedback.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}>
                        <p className="text-sm font-extrabold">{quizFeedback.msg}</p>
                        {quizFeedback.details && <p className="text-xs font-semibold opacity-90">{quizFeedback.details}</p>}
                      </div>
                    )}

                    <div className="flex items-center space-x-3 pt-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                      {!quizFeedback ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckAnswer();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Check</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloseAndContinue();
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                        >
                          <span>Continue (Đóng & Xem Tiếp Video)</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* DẠNG 4: HIGHLIGHT / MARK THE WORD */}
              {activeQuiz.type === 'mark_word' && (
                <div className="space-y-3" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMarkWordSelect(word);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
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

                  {quizFeedback && (
                    <div className={`p-4 rounded-2xl text-xs font-bold space-y-1 border ${
                      quizFeedback.success ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : 'bg-rose-50 text-rose-900 border-rose-300'
                    }`}>
                      <p className="text-sm font-extrabold">{quizFeedback.msg}</p>
                      {quizFeedback.details && <p className="text-[11px] font-semibold opacity-90">{quizFeedback.details}</p>}
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}>
                    {!quizFeedback ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckAnswer();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>Check</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseAndContinue();
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                        style={{ pointerEvents: 'auto', position: 'relative', zIndex: 99999 }}
                        className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer"
                      >
                        <span>Continue (Đóng & Xem Tiếp Video)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OVERLAY BẢNG ĐIỂM TỔNG KẾT H5P KÈM SCORE RANGE FEEDBACK V83 CHUẨN KHÔNG BAO GIỜ LỌT KHUNG */}
        {showFinalSummary && (() => {
          const total = waypoints.length || 1;
          const percent = Math.round((passedCount / total) * 100);
          const feedbackMsg = getScoreRangeFeedback(percent);

          return (
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{ zIndex: 99999, pointerEvents: 'auto', position: 'absolute' }}
              className="inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 text-slate-900 animate-scale-up overflow-hidden"
            >
              <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-200 max-w-md w-full max-h-[94%] flex flex-col shadow-2xl relative overflow-hidden select-text text-center space-y-3">
                {/* STICKY HEADER KHÔNG BAO GIỜ MẤT NÚT ĐÓNG */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 flex-shrink-0">
                  <span className="px-3 py-0.5 bg-amber-100 text-amber-900 font-extrabold text-[10px] rounded-full">
                    🏆 H5P INTERACTIVE VIDEO SUMMARY
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowFinalSummary(false)}
                    className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-extrabold rounded-lg border border-rose-300 flex items-center space-x-1 text-xs transition cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 text-rose-700" />
                    <span>Đóng (Close)</span>
                  </button>
                </div>

                {/* NỘI DUNG CUỘN ĐƯỢC BÊN TRONG KHUNG VIDEO */}
                <div className="flex-1 overflow-y-auto space-y-3 px-1 py-1">
                  <h3 className="text-base font-black text-slate-900 leading-snug">
                    Báo Cáo Mức Độ Hiểu Bài Học Phù Hợp Score Range
                  </h3>

                  {/* THÔNG SỐ % & ĐÁNH GIÁ ĐIỂM */}
                  <div className="flex flex-col items-center justify-center space-y-2 bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center shadow-md">
                      <span className="text-xl font-black">{percent}%</span>
                      <span className="text-[9px] font-bold opacity-90">{passedCount}/{total} đúng</span>
                    </div>

                    <div className="flex items-center space-x-0.5 text-amber-400 text-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.ceil((percent / 100) * 5) ? 'opacity-100' : 'opacity-30'}>★</span>
                      ))}
                    </div>

                    {/* NHẬN XẾT CỦA GIÁO VIÊN THEO SCORE RANGE */}
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-950 font-extrabold text-xs w-full text-center shadow-2xs">
                      <p className="text-[10px] text-amber-700 font-bold mb-0.5">💬 Đánh giá theo Thang điểm Giáo viên (Score Range):</p>
                      <p className="text-xs font-extrabold text-amber-950">{feedbackMsg}</p>
                    </div>
                  </div>

                  {/* DANH SÁCH CÁC MỐC CÂU HỎI */}
                  <div className="space-y-1.5 text-left">
                    <p className="text-[11px] font-bold text-slate-700">Chi tiết mốc câu hỏi:</p>
                    {waypoints.map((w, idx) => {
                      const isPassed = quizPassed[w.id || w.timeSec];
                      return (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-100 rounded-lg text-[11px] font-semibold">
                          <span className="truncate max-w-[220px]">Mốc {w.timeSec}s: {w.question}</span>
                          {isPassed === true ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-black rounded-md flex items-center space-x-1 text-[10px]">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Đúng</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 font-black rounded-md flex items-center space-x-1 text-[10px]">
                              <X className="w-3 h-3 text-rose-600" />
                              <span>Chưa đúng</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* BOTTOM FOOTER NÚT BẤM DỄ THẤY VÀ ĐÓNG 100% */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setQuizPassed({});
                      setShowFinalSummary(false);
                      setCurrentTime(0);
                      playVideo();
                    }}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl text-xs border border-slate-300 transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Làm lại từ đầu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFinalSummary(false)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>✕ Đóng & Xem Tiếp</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* THANH TIMELINE CHUẨN DUY NHẤT (SINGLE SOURCE OF TRUTH) DÍNH TRỰC TIẾP VÀO BOTTOM KHUNG VIDEO V76 */}
        <div
          style={{ pointerEvents: activeQuiz ? 'none' : 'auto', opacity: activeQuiz ? 0.3 : 1 }}
          className="absolute bottom-0 inset-x-0 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between text-white text-xs space-x-3 border-t border-slate-800/80 z-30"
        >
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
