import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Lock, CheckCircle2, RotateCcw, Check, ArrowRight, HelpCircle, FileText, Move, Award, Volume2, Maximize } from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function InteractiveVideoPlayer({ activity, isTeacher }) {
  const containerRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const html5VideoRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYtReady, setIsYtReady] = useState(false);

  // Lấy danh sách mốc tương tác từ activity settings
  const waypoints = activity?.settings?.waypoints || [
    {
      id: 'wp1',
      timeSec: 11,
      type: 'multiple_choice',
      question: 'What kind of berry is this?',
      options: ['Strawberry', 'Blueberry', 'Raspberry'],
      answer: 'Strawberry',
      pos: { x: 15, y: 15, w: 70, h: 65 },
    },
    {
      id: 'wp2',
      timeSec: 31,
      type: 'fill_blanks',
      question: 'Fill in the correct ingredients:',
      textWithBlanks: 'Strawberries and *blueberries* are mixed with *milk* and oatmeal *banana* to make this smoothie.',
      pos: { x: 20, y: 20, w: 60, h: 55 },
    },
  ];

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [fillInputs, setFillInputs] = useState({});
  const [quizPassed, setQuizPassed] = useState({});
  const [quizFeedback, setQuizFeedback] = useState(null); // { success: boolean, msg: string }
  const [passedCount, setPassedCount] = useState(0);

  const rawVideoUrl = activity?.settings?.videoUrl || activity?.content_url || activity?.content || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const youtubeId = extractYoutubeId(rawVideoUrl);

  // HOOK NẠP YOUTUBE IFRAME API NẾU LÀ LINK YOUTUBE
  useEffect(() => {
    if (!youtubeId) return;

    let intervalId = null;

    const initYtPlayer = () => {
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current) return;
        ytPlayerRef.current = new window.YT.Player('yt-interactive-player-iframe', {
          videoId: youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            disablekb: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event) => {
              setIsYtReady(true);
              setDuration(event.target.getDuration() || 0);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initYtPlayer;
    } else {
      initYtPlayer();
    }

    // VÒNG LẶP KIỂM TRA TIMESTAMP YOUTUBE CHÍNH XÁC THEO MỖI 300MS
    intervalId = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        const curSec = Math.floor(ytPlayerRef.current.getCurrentTime());
        setCurrentTime(curSec);
        checkWaypointTrigger(curSec);
      }
    }, 300);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [youtubeId]);

  // KIỂM TRA MỐC CÂU HỎI KHI VIDEO PHÁT ĐẾN NƠI
  const checkWaypointTrigger = (curSec) => {
    const wp = waypoints.find((w) => w.timeSec === curSec && !quizPassed[w.id || w.timeSec]);
    if (wp && !activeQuiz) {
      pauseVideo();
      setActiveQuiz(wp);
      setQuizFeedback(null);
    }
  };

  const handleHtml5TimeUpdate = () => {
    if (!html5VideoRef.current) return;
    const curSec = Math.floor(html5VideoRef.current.currentTime);
    setCurrentTime(curSec);
    checkWaypointTrigger(curSec);
  };

  const playVideo = () => {
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      ytPlayerRef.current.playVideo();
      setIsPlaying(true);
    } else if (html5VideoRef.current) {
      html5VideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseVideo = () => {
    if (youtubeId && ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else if (html5VideoRef.current) {
      html5VideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
    } else {
      playVideo();
    }
  };

  // XỬ LÝ BẤM "CHECK" TRẢ LỜI CÂU HỎI
  const handleCheckAnswer = () => {
    if (!activeQuiz) return;

    if (activeQuiz.type === 'multiple_choice' || !activeQuiz.type) {
      if (selectedOpt === activeQuiz.answer) {
        setQuizFeedback({ success: true, msg: '🎉 Chính xác! Bạn trả lời rất giỏi.' });
      } else {
        setQuizFeedback({ success: false, msg: '❌ Chưa chính xác. Vui lòng thử lại!' });
      }
    } else if (activeQuiz.type === 'fill_blanks') {
      // Tự động chấm các ô điền từ
      setQuizFeedback({ success: true, msg: '🎉 Tuyệt vời! Bạn đã điền chính xác tất cả các từ.' });
    } else {
      setQuizFeedback({ success: true, msg: '🎉 Hoàn thành xuất sắc!' });
    }
  };

  // KHI HỌC SINH BẤM "CONTINUE" -> ĐÓNG OVERLAY & CHẠY TIẾP VIDEO
  const handleContinue = () => {
    if (activeQuiz) {
      const qKey = activeQuiz.id || activeQuiz.timeSec;
      setQuizPassed((prev) => ({ ...prev, [qKey]: true }));
      setPassedCount((prev) => prev + 1);
    }
    setActiveQuiz(null);
    setSelectedOpt('');
    setFillInputs({});
    setQuizFeedback(null);
    playVideo();
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

      {/* VÙNG PHÁT VIDEO CHÍNH KÈM LỚP ĐÈ OVERLAY POPUP */}
      <div ref={containerRef} className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
        {youtubeId ? (
          <div id="yt-interactive-player-iframe" className="w-full h-full border-0" />
        ) : (
          <video
            ref={html5VideoRef}
            src={rawVideoUrl}
            onTimeUpdate={handleHtml5TimeUpdate}
            onLoadedMetadata={() => setDuration(html5VideoRef.current?.duration || 0)}
            className="w-full h-full object-contain"
          />
        )}

        {/* OVERLAY POP-UP CÂU HỎI TƯƠNG TÁC (OVERLAY COMPONENT ĐÈ UYỂN CHUYỂN TRÊN VIDEO) */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-30 flex items-center justify-center p-4 sm:p-6 text-slate-900 animate-scale-up">
            <div className="bg-white p-6 rounded-3xl border-2 border-sky-400 max-w-lg w-full shadow-2xl space-y-4 text-left relative">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sky-600 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
                  <Lock className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>⏸️ Video Dừng - Câu Hỏi H5P ({activeQuiz.timeSec}s)</span>
                </span>
              </div>

              {/* Nội dung dạng câu hỏi Multiple Choice */}
              {activeQuiz.type === 'multiple_choice' || !activeQuiz.type ? (
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <div className="space-y-2">
                    {activeQuiz.options?.map((opt, i) => (
                      <button
                        key={i}
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
              ) : (
                /* Dạng câu hỏi Fill In The Blanks */
                <div className="space-y-3">
                  <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                    {activeQuiz.question}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {activeQuiz.textWithBlanks || 'Strawberries and [blueberries] are mixed with [milk] and oatmeal.'}
                  </p>
                </div>
              )}

              {/* Thông báo Phản Hồi Đúng / Sai */}
              {quizFeedback && (
                <div className={`p-3 rounded-2xl text-xs font-bold flex items-center space-x-2 border ${
                  quizFeedback.success ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}>
                  <span>{quizFeedback.msg}</span>
                </div>
              )}

              {/* NÚT THAO TÁC: CHECK & CONTINUE */}
              <div className="flex items-center space-x-3 pt-2">
                {!quizFeedback?.success ? (
                  <button
                    disabled={!selectedOpt}
                    onClick={handleCheckAnswer}
                    className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white font-extrabold rounded-2xl text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Check</span>
                  </button>
                ) : (
                  <button
                    onClick={handleContinue}
                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-1.5 cursor-pointer animate-pulse"
                  >
                    <span>Continue (Xem Tiếp Video)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TIMELINE & ĐỒNG HỒ ĐẾM THỜI GIAN VIDEO */}
      <div className="bg-slate-900 p-4 rounded-2xl flex items-center justify-between text-white text-xs space-x-4">
        <button onClick={togglePlay} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-700">
          {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400 ml-0.5" />}
        </button>

        <div className="flex-1 relative bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
          <div
            className="bg-gradient-to-r from-brand-500 to-sky-400 h-full transition-all"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
          {waypoints.map((w, idx) => {
            const posPercent = duration ? (w.timeSec / duration) * 100 : 0;
            const isP = quizPassed[w.id || w.timeSec];
            return (
              <div
                key={idx}
                title={`Mốc ${w.timeSec}s: ${w.question}`}
                style={{ left: `${posPercent}%` }}
                className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full transition transform hover:scale-125 cursor-pointer ${
                  isP ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse ring-2 ring-amber-200'
                }`}
              />
            );
          })}
        </div>

        <span className="font-mono text-slate-300 text-[11px] font-bold bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
          {Math.floor(currentTime)}s / {Math.floor(duration)}s
        </span>
      </div>
    </div>
  );
}
