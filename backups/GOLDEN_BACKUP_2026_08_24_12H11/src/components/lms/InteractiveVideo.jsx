import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Lock, CheckCircle2, Plus, Video as VideoIcon, RotateCcw, HelpCircle, Check, Award } from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function InteractiveVideo({ activity, isTeacher }) {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const waypoints = activity?.settings?.waypoints || [
    {
      timeSec: 10,
      question: 'Khái niệm quan trọng nhất vừa được trình bày trong video là gì?',
      options: ['Phương pháp E-learning chuẩn H5P', 'Cách tính điểm trung bình', 'Hệ quản trị cơ sở dữ liệu SQL'],
      answer: 'Phương pháp E-learning chuẩn H5P',
    },
    {
      timeSec: 25,
      question: 'Thầy Hải khuyên em chú ý điều gì khi làm bài luyện nói?',
      options: ['Phát âm rõ vành rõ chữ và tự tin', 'Đọc thật nhanh cho kịp giờ', 'Không cần chú ý trọng âm'],
      answer: 'Phát âm rõ vành rõ chữ và tự tin',
    },
  ];

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [quizPassed, setQuizPassed] = useState({});
  const [passedCount, setPassedCount] = useState(0);

  const rawVideoUrl = activity?.settings?.videoUrl || activity?.content_url || activity?.content || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const youtubeId = extractYoutubeId(rawVideoUrl);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curSec = Math.floor(videoRef.current.currentTime);
    setCurrentTime(curSec);

    const wp = waypoints.find((w) => w.timeSec === curSec && !quizPassed[w.timeSec]);
    if (wp && !activeQuiz) {
      videoRef.current.pause();
      setIsPlaying(false);
      setActiveQuiz(wp);
    }
  };

  const handleAnswerQuiz = () => {
    if (!activeQuiz) return;
    if (selectedOpt === activeQuiz.answer) {
      setQuizPassed((prev) => ({ ...prev, [activeQuiz.timeSec]: true }));
      setPassedCount((prev) => prev + 1);
      setActiveQuiz(null);
      setSelectedOpt('');
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      alert('❌ Câu trả lời chưa chính xác. Em hãy thử chọn lại nhé!');
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-5xl mx-auto space-y-6 font-sans select-none">
      {/* HEADER BANNER */}
      <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="px-3 py-1 bg-rose-100 text-rose-800 font-extrabold text-[11px] rounded-full inline-block">
            🎥 INTERACTIVE VIDEO H5P (VIDEO TƯƠNG TÁC)
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">
            {(activity?.title || 'Bài Giảng Video Tương Tác').replace('[WHITEBOARD]', '').replace('[AUDIO_RECORD]', '').trim()}
          </h2>
        </div>

        <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl text-xs font-bold text-amber-900">
          <Award className="w-4 h-4 text-amber-600" />
          <span>Tiến độ: {passedCount} / {waypoints.length} mốc câu hỏi</span>
        </div>
      </div>

      {/* HIỂN THỊ KHUNG VIDEO (YOUTUBE EMBED HOẶC HTML5 VIDEO) */}
      {youtubeId ? (
        <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
            title={activity?.title || 'Interactive Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
          <video
            ref={videoRef}
            src={rawVideoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
            className="w-full h-full object-contain"
          />

          {/* POP-UP CÂU HỎI TƯƠNG TÁC KHI ĐẾN MỐC DỪNG */}
          {activeQuiz && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex items-center justify-center p-6 text-white animate-scale-up">
              <div className="bg-slate-900 p-6 rounded-3xl border-2 border-amber-400 max-w-md w-full shadow-2xl space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-amber-400 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-amber-400 animate-pulse" />
                    <span>⏸️ Video Tạm Dừng - Câu Hỏi Tương Tác</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded-md">
                    Mốc {activeQuiz.timeSec}s
                  </span>
                </div>

                <h4 className="text-sm font-extrabold leading-relaxed text-white">
                  {activeQuiz.question}
                </h4>

                <div className="space-y-2">
                  {activeQuiz.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOpt(opt)}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-bold border transition flex items-center justify-between cursor-pointer ${
                        selectedOpt === opt
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-md'
                          : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOpt === opt && <Check className="w-4 h-4 text-amber-400" />}
                    </button>
                  ))}
                </div>

                <button
                  disabled={!selectedOpt}
                  onClick={handleAnswerQuiz}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-extrabold rounded-2xl text-xs shadow-lg transition cursor-pointer"
                >
                  🚀 Trả Lời Để Tiếp Tục Xem Video
                </button>
              </div>
            </div>
          )}

          {/* THANH ĐIỀU KHIỂN NÂNG CAO */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 flex items-center justify-between text-white text-xs">
            <button onClick={togglePlay} className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full transition cursor-pointer border border-slate-700">
              {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400 ml-0.5" />}
            </button>

            {/* TIMELINE CÁC MỐC CÂU HỎI */}
            <div className="flex-1 mx-4 relative bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              {waypoints.map((w, idx) => {
                const posPercent = duration ? (w.timeSec / duration) * 100 : 0;
                return (
                  <div
                    key={idx}
                    title={`Mốc câu hỏi ${w.timeSec}s: ${w.question}`}
                    style={{ left: `${posPercent}%` }}
                    className={`absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full cursor-pointer transition transform hover:scale-125 ${
                      quizPassed[w.timeSec] ? 'bg-emerald-400 ring-2 ring-emerald-200' : 'bg-amber-400 animate-pulse ring-2 ring-amber-200'
                    }`}
                  />
                );
              })}
            </div>

            <span className="font-mono text-slate-300 text-[11px] font-bold bg-slate-900/90 px-2.5 py-1 rounded-xl border border-slate-800">
              {Math.floor(currentTime)}s / {Math.floor(duration)}s
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
