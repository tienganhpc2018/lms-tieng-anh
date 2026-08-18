import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Lock, CheckCircle2, Plus, Video as VideoIcon } from 'lucide-react';

export default function InteractiveVideo({ activity, isTeacher }) {
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Mốc thời gian dừng kèm câu hỏi: [ { timeSec: 15, question: '...', options: [...], answer: '...' } ]
  const [waypoints, setWaypoints] = useState(activity.settings?.waypoints || [
    {
      timeSec: 10,
      question: 'Khái niệm quan trọng nhất vừa được trình bày trong video là gì?',
      options: ['Phương pháp E-learning chuẩn H5P', 'Cách tính điểm trung bình', 'Hệ quản trị cơ sở dữ liệu SQL'],
      answer: 'Phương pháp E-learning chuẩn H5P',
    },
  ]);

  const [activeQuiz, setActiveQuiz] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [quizPassed, setQuizPassed] = useState({});

  // State Thêm Mốc Mới (Dành cho Giáo viên)
  const [newTimeSec, setNewTimeSec] = useState(20);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnsA, setNewAnsA] = useState('');
  const [newAnsB, setNewAnsB] = useState('');

  const videoUrl = activity.settings?.videoUrl || activity.content_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curSec = Math.floor(videoRef.current.currentTime);
    setCurrentTime(curSec);

    // Kiểm tra xem có trúng mốc dừng chưa làm không
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
      setActiveQuiz(null);
      setSelectedOpt('');
      if (videoRef.current) {
        videoRef.current.play();
        setIsPlaying(true);
      }
    } else {
      alert('Câu trả lời chưa đúng. Vui lòng thử lại!');
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
    <div className="space-y-6">
      {/* VÙNG PHÁT VIDEO VỚI OVERLAY POP-UP QUIZ */}
      <div className="relative bg-black rounded-2xl overflow-hidden shadow-lg aspect-video max-w-4xl mx-auto flex items-center justify-center border border-slate-800">
        <video
          ref={videoRef}
          src={videoUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          className="w-full h-full object-contain"
        />

        {/* POP-UP QUIZ DỪNG LẠI YÊU CẦU TRẢ LỜI */}
        {activeQuiz && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 flex items-center justify-center p-6 text-white animate-fade-in">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Video tạm dừng - Câu hỏi tương tác</span>
              </div>
              <h4 className="text-base font-bold leading-snug">{activeQuiz.question}</h4>
              <div className="space-y-2">
                {activeQuiz.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedOpt(opt)}
                    className={`w-full p-3 rounded-xl text-left text-xs font-medium border transition ${
                      selectedOpt === opt
                        ? 'border-brand-500 bg-brand-600/30 text-white font-semibold'
                        : 'border-slate-700 bg-slate-900/60 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              <button
                disabled={!selectedOpt}
                onClick={handleAnswerQuiz}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition"
              >
                Trả Lời Để Tiếp Tục Xem Video
              </button>
            </div>
          </div>
        )}

        {/* Thanh Điều Khiển Video */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center justify-between text-white text-xs">
          <button onClick={togglePlay} className="p-2 hover:bg-white/20 rounded-full transition">
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>

          {/* Timeline Bar */}
          <div className="flex-1 mx-4 relative bg-white/20 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-500 h-full transition-all"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
            {/* Các mốc câu hỏi trên timeline */}
            {waypoints.map((w, idx) => {
              const posPercent = duration ? (w.timeSec / duration) * 100 : 0;
              return (
                <div
                  key={idx}
                  title={`Mốc câu hỏi: ${w.timeSec}s`}
                  style={{ left: `${posPercent}%` }}
                  className={`absolute top-0 bottom-0 w-2.5 -ml-1 rounded-full cursor-pointer ${
                    quizPassed[w.timeSec] ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                  }`}
                />
              );
            })}
          </div>

          <span className="font-mono text-slate-300">
            {Math.floor(currentTime)}s / {Math.floor(duration)}s
          </span>
        </div>
      </div>
    </div>
  );
}
