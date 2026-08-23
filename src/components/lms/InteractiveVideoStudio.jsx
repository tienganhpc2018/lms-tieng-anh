import React, { useState, useRef, useEffect } from 'react';
import { Video, HelpCircle, FileText, Plus, Trash2, CheckCircle2, Play, Pause, Save, Eye, Layers, Type, CheckSquare, Move, Sparkles, Sliders, CornerDownRight, Check } from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function InteractiveVideoStudio({ initialSettings = {}, onSave }) {
  const [step, setStep] = useState(1); // 1: Nguồn Video, 2: Timeline Editor & Interactive Canvas, 3: Summary Task
  const [title, setTitle] = useState(initialSettings.title || 'Interactive Video - Bài Giảng H5P');
  const [videoUrl, setVideoUrl] = useState(initialSettings.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const youtubeId = extractYoutubeId(videoUrl);
  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Danh sách các mốc tương tác (Interactions / Waypoints)
  const [interactions, setInteractions] = useState(initialSettings.interactions || [
    {
      id: 'int_1',
      timestamp: 11,
      type: 'multiple_choice',
      question: 'What kind of berry is this?',
      options: ['Strawberry', 'Blueberry', 'Raspberry'],
      correctIndex: 0,
      pos: { x: 20, y: 20, w: 60, h: 55 },
    },
    {
      id: 'int_2',
      timestamp: 31,
      type: 'fill_blanks',
      question: 'Fill in the correct ingredients:',
      textWithBlanks: 'Strawberries and *blueberries* are mixed with *milk* and oatmeal.',
      options: [],
      correctIndex: 0,
      pos: { x: 25, y: 25, w: 50, h: 50 },
    },
  ]);

  // Form soạn thảo mốc tương tác ở Step 2
  const [activeIntId, setActiveIntId] = useState(null);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [textWithBlanks, setTextWithBlanks] = useState('');

  // Setup YouTube Iframe API player ở Step 2
  useEffect(() => {
    if (step !== 2 || !youtubeId) return;

    let intervalId = null;

    const initYt = () => {
      if (window.YT && window.YT.Player) {
        if (ytPlayerRef.current) return;
        ytPlayerRef.current = new window.YT.Player('yt-studio-editor-iframe', {
          videoId: youtubeId,
          playerVars: { autoplay: 0, controls: 1, rel: 0 },
          events: {
            onReady: (e) => {
              setDuration(e.target.getDuration() || 0);
            },
            onStateChange: (e) => {
              if (e.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
              else if (e.data === window.YT.PlayerState.PAUSED) setIsPlaying(false);
            },
          },
        });
      }
    };

    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(tag, firstScript);
      window.onYouTubeIframeAPIReady = initYt;
    } else {
      initYt();
    }

    intervalId = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        setCurrentTime(Math.floor(ytPlayerRef.current.getCurrentTime()));
      }
    }, 300);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [step, youtubeId]);

  const togglePlay = () => {
    if (youtubeId && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleCaptureTimestamp = (typeId) => {
    setSelectedType(typeId);
    if (youtubeId && ytPlayerRef.current) {
      ytPlayerRef.current.pauseVideo();
      setIsPlaying(false);
    } else if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const addInteraction = () => {
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }
    const newInt = {
      id: 'int_' + Date.now(),
      timestamp: Number(currentTime || 10),
      type: selectedType,
      question: questionText.trim(),
      options: options.filter((o) => o.trim() !== ''),
      correctIndex: Number(correctIdx),
      textWithBlanks: textWithBlanks.trim(),
      pos: { x: 20, y: 20, w: 60, h: 55 },
    };

    setInteractions([...interactions, newInt].sort((a, b) => a.timestamp - b.timestamp));
    setQuestionText('');
    setOptions(['', '', '']);
    setTextWithBlanks('');
    alert(`✓ Đã thêm câu hỏi tương tác tại mốc ${newInt.timestamp}s thành công!`);
  };

  const removeInteraction = (id) => {
    setInteractions(interactions.filter((item) => item.id !== id));
  };

  const handleSaveStudio = () => {
    onSave({
      title,
      videoUrl,
      interactions,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl space-y-6 font-sans select-none max-w-6xl mx-auto">
      {/* HEADER BANNER & BARS CÔNG CỤ 3 STEP WIZARD BAR */}
      <div className="bg-navy-900 text-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider">
              H5P INTERACTIVE VIDEO EDITOR STUDIO V60
            </span>
            <h3 className="text-xl font-extrabold flex items-center space-x-2">
              <Video className="w-6 h-6 text-rose-400" />
              <span>Khung Thiết Kế Video Tương Tác (H5P Studio Editor)</span>
            </h3>
          </div>

          <button
            onClick={handleSaveStudio}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
          >
            <Save className="w-4 h-4" />
            <span>🚀 Lưu Bài Giảng Video Tương Tác</span>
          </button>
        </div>

        {/* 3 STEP WIZARD BAR CỰC NỔI BẬT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-800/90 p-2 rounded-2xl border border-slate-700 text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
              step === 1 ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>1. Nguồn Video (Upload/Embed)</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
              step === 2 ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>2. Thiết Lập Tương Tác ({interactions.length})</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer ${
              step === 3 ? 'bg-emerald-600 text-white shadow-md font-extrabold' : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <span>3. Tổng Kết Task (Summary)</span>
          </button>
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {/* BƯỚC 1: QUẢN LÝ NGUỒN VIDEO (UPLOAD MP4 / EMBED YOUTUBE KÈM TRÌNH PHÁT XEM TRƯỚC) */}
        {step === 1 && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Video className="w-5 h-5 text-rose-600" />
                <span>Bước 1: Quản lý Nguồn Video (YouTube / MP4 Supabase Storage)</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tiêu Đề Bài Giảng Video Tương Tác *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Interactive Video - Bat Trang Pottery Village"
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-extrabold text-slate-900 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Đường Dẫn Video YouTube HOẶC Link MP4 Supabase Storage *
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* TRÌNH PHÁT NGUỒN VIDEO XEM TRƯỚC ĐẢM BẢO LOAD THÀNH CÔNG TRƯỚC KHI CHUYỂN BƯỚC 2 */}
            <div className="border-2 border-slate-800 rounded-3xl p-4 bg-slate-950 shadow-2xl space-y-3 text-center">
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="text-amber-300 font-extrabold flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Trình Phát Xem Trước Nguồn Video:</span>
                </span>
                <span className="text-slate-400 text-[11px] font-mono">Xác minh video load mượt trước khi thiết lập mốc</span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0`}
                    title="Preview Video Source"
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <video src={videoUrl} controls className="w-full h-full object-contain" />
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3.5 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs shadow-xl transition flex items-center space-x-2 cursor-pointer"
              >
                <span>Chuyển Sang Bước 2: Thiết Lập Tương Tác (Timeline Editor) →</span>
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 2: THIẾT LẬP TƯƠNG TÁC (TIMELINE EDITOR & TOOLBAR CÂU HỎI H5P) */}
        {step === 2 && (
          <div className="space-y-6">
            {/* TOOLBAR PHÍA TRÊN TRÌNH PHÁT VIDEO CHỨA CÁC ICON ĐẠI DIỆN CÁC LOẠI CÂU HỎI H5P */}
            <div className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Toolbar Thêm Câu Hỏi Tương Tác H5P Phía Trên Video:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Đang ở giây: {currentTime}s</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'multiple_choice', name: 'Multiple choice', icon: CheckSquare, desc: 'Trắc nghiệm 1/nhiều đáp án' },
                  { id: 'fill_blanks', name: 'Fill in the blanks', icon: Type, desc: 'Điền từ vào chỗ trống' },
                  { id: 'free_text', name: 'Free text', icon: FileText, desc: 'Câu hỏi tự luận ngắn' },
                  { id: 'drag_drop', name: 'Drag and drop', icon: Move, desc: 'Kéo thả đáp án vào ô' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCaptureTimestamp(item.id)}
                      className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-start space-x-2.5 ${
                        isSel
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-extrabold ring-2 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold leading-snug">{item.name}</h5>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{item.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* VÙNG TRÌNH PHÁT TIMELINE EDITOR VỚI OVERLAY INTERACTIVE DRAG/RESIZE */}
            <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
              {youtubeId ? (
                <div id="yt-studio-editor-iframe" className="w-full h-full border-0" />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(Math.floor(videoRef.current.currentTime));
                  }}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  className="w-full h-full object-contain"
                />
              )}

              {/* OVERLAY NẠP THỬ HOẠT ĐỘNG TẠI TIMESTAMP HIỆN TẠI */}
              {interactions.filter((i) => i.timestamp === currentTime).map((intItem) => (
                <div
                  key={intItem.id}
                  className="absolute bg-white/95 backdrop-blur-md p-4 rounded-3xl border-2 border-amber-400 shadow-2xl z-30 max-w-sm w-full text-slate-900 animate-scale-up"
                  style={{ top: '20%', left: '20%' }}
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                    <span className="text-[10px] font-black text-amber-600 uppercase">
                      ⏸️ Pop-up H5P Mốc {intItem.timestamp}s
                    </span>
                    <button onClick={() => removeInteraction(intItem.id)} className="text-rose-600 hover:text-rose-700 text-xs font-bold">
                      ✕ Xóa
                    </button>
                  </div>
                  <h5 className="text-xs font-bold leading-snug">{intItem.question}</h5>
                </div>
              ))}

              {/* THANH ĐIỀU KHIỂN & TIMELINE SCRUBBER */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/90 p-4 flex items-center justify-between text-white text-xs space-x-4">
                <button onClick={togglePlay} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-700">
                  {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400 ml-0.5" />}
                </button>

                <div className="flex-1 relative bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  {interactions.map((w, idx) => {
                    const posPercent = duration ? (w.timestamp / duration) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        title={`Mốc ${w.timestamp}s: ${w.question}`}
                        style={{ left: `${posPercent}%` }}
                        className="absolute top-0 bottom-0 w-3 -ml-1.5 rounded-full bg-amber-400 ring-2 ring-amber-200 animate-pulse cursor-pointer"
                      />
                    );
                  })}
                </div>

                <span className="font-mono text-slate-300 text-[11px] font-bold bg-slate-900 px-3 py-1 rounded-xl border border-slate-800">
                  {currentTime}s / {Math.floor(duration)}s
                </span>
              </div>
            </div>

            {/* FORM SOẠN THẢO MỐC VÀ CÂU HỎI */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-3">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Soạn Câu Hỏi Pop-Up Cho Giây {currentTime}s ({selectedType})</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⏱️ Mốc Thời Gian Dừng (Tự Động Bắt Giây Đang Tua) *
                  </label>
                  <input
                    type="number"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-emerald-700 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ❓ Nội Dung Câu Hỏi Pop-Up *
                  </label>
                  <input
                    type="text"
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ví dụ: What kind of berry is this?"
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
                  />
                </div>

                {selectedType === 'multiple_choice' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Các Lựa Chọn Đáp Án (Tích chọn đáp án đúng)</label>
                    {options.map((opt, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correct_opt_studio"
                          checked={correctIdx === i}
                          onChange={() => setCorrectIdx(i)}
                          className="w-4 h-4 text-brand-600 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[i] = e.target.value;
                            setOptions(newOpts);
                          }}
                          placeholder={`Đáp án ${i + 1}`}
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs bg-white font-medium"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {selectedType === 'fill_blanks' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Đoạn Văn Điền Từ (Đặt từ cần điền trong dấu sao *từ*)
                    </label>
                    <textarea
                      rows={3}
                      value={textWithBlanks}
                      onChange={(e) => setTextWithBlanks(e.target.value)}
                      placeholder="Ví dụ: Strawberries and *blueberries* are mixed with *milk*."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white font-mono"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={addInteraction}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  + Thêm Mốc Tương Tác Này Tại {currentTime}s
                </button>
              </div>

              {/* CỘT PHẢI: DANH SÁCH MỐC ĐÃ THIẾT LẬP */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  📋 Danh Sách Mốc Tương Tác Đã Tạo ({interactions.length})
                </h4>

                {interactions.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 text-xs italic">
                    Chưa có mốc tương tác nào được tạo.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                    {interactions.map((item) => (
                      <div key={item.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex justify-between items-start space-x-3">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md inline-block">
                            ⏱️ Mốc: {item.timestamp}s ({item.type})
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 leading-snug">{item.question}</h5>
                          {item.options && item.options.length > 0 && (
                            <p className="text-[11px] text-emerald-700 font-bold">
                              ✓ Đáp án đúng: {item.options[item.correctIndex]}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInteraction(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BƯỚC 3: TỔNG KẾT TASK (SUMMARY TASK) */}
        {step === 3 && (
          <div className="space-y-6 max-w-xl text-center py-8 mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h4 className="font-extrabold text-xl text-slate-900">Hoàn Tất Soạn Thảo Interactive Video!</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Bài giảng của Thầy Hải đã sẵn sàng với {interactions.length} mốc tương tác Pop-up Quiz chuẩn H5P. Hãy bấm nút bên dưới để lưu ngay!
              </p>
            </div>
            <button
              onClick={handleSaveStudio}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition cursor-pointer border border-emerald-500"
            >
              🚀 Đăng Tải & Lưu Bài Giảng Video Tương Tác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
