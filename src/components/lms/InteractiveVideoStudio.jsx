import React, { useState, useRef, useEffect } from 'react';
import { Video, HelpCircle, FileText, Plus, Trash2, CheckCircle2, Play, Pause, Save, Eye, Layers, Type, CheckSquare, Move, Sparkles, Highlighter, Check, ToggleLeft, Pencil, X } from 'lucide-react';

const extractYoutubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// HELPER TÁCH CÂU HỎI ĐIỀN TỪ
const parseFillBlanksText = (textWithBlanks = '') => {
  if (!textWithBlanks) return { parts: [], answers: [] };
  const answers = [];
  const regex = /\*(.*?)\*/g;
  let match;
  while ((match = regex.exec(textWithBlanks)) !== null) {
    answers.push(match[1].trim());
  }
  return { answers };
};

const H5P_QUESTION_TYPES = [
  { id: 'multiple_choice', name: 'Multiple Choice', label: 'Trắc nghiệm nhiều lựa chọn', icon: CheckSquare },
  { id: 'fill_blanks', name: 'Fill in the Blanks', label: 'Điền từ vào ô trống (Gap-Fill)', icon: Type },
  { id: 'true_false', name: 'True / False', label: 'Đúng hoặc Sai', icon: ToggleLeft },
  { id: 'mark_word', name: 'Highlight Words', label: 'Highlight từ đúng trong danh sách', icon: Highlighter },
  { id: 'drag_drop', name: 'Drag the words', label: 'Kéo thả từ vào chỗ trống', icon: Move },
];

export default function InteractiveVideoStudio({ initialSettings = {}, onSave }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState(initialSettings.title || 'Interactive Video - Bài Giảng H5P');
  const [videoUrl, setVideoUrl] = useState(initialSettings.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  const youtubeId = extractYoutubeId(videoUrl);
  const videoRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(146);
  const [isPlaying, setIsPlaying] = useState(false);

  const [interactions, setInteractions] = useState(initialSettings.interactions || [
    {
      id: 'int_1',
      timestamp: 31,
      type: 'fill_blanks',
      question: 'Fill in the missing words',
      textWithBlanks: 'Strawberries and *blueberries* are mixed with *milk* and oatmeal *banana* to make this delicious smoothie.',
      options: [],
      correctIndex: 0,
    },
    {
      id: 'int_2',
      timestamp: 46,
      type: 'true_false',
      question: 'A tailor cuts hair.',
      isTrue: false,
      answer: 'False',
      options: [],
      correctIndex: 1,
    },
    {
      id: 'int_3',
      timestamp: 85,
      type: 'multiple_choice',
      question: 'Who protects people and keeps the community safe?',
      options: ['Police officer', 'Doctor', 'Vet'],
      correctIndex: 0,
      answer: 'Police officer',
    },
  ]);

  // FORM SOẠN THẢO VÀ ĐANG Ở CHẾ ĐỘ SỬA
  const [editingId, setEditingId] = useState(null);
  const [selectedType, setSelectedType] = useState('fill_blanks');
  const [questionText, setQuestionText] = useState('Fill in the missing words');
  const [options, setOptions] = useState(['', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [textWithBlanks, setTextWithBlanks] = useState('Strawberries and *blueberries* are mixed with *milk* and oatmeal *banana* to make this delicious smoothie.');
  const [isTrueChoice, setIsTrueChoice] = useState(true);
  const [wordListInput, setWordListInput] = useState('');
  const [correctWordsInput, setCorrectWordsInput] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [scoreRanges, setScoreRanges] = useState([
    { from: 0, to: 100, feedback: '25' }
  ]);

  const handleAddRange = () => {
    const count = scoreRanges.length + 1;
    const step = Math.floor(100 / count);
    const newRanges = [];
    for (let i = 0; i < count; i++) {
      const from = i === 0 ? 0 : newRanges[i - 1].to + 1;
      const to = i === count - 1 ? 100 : Math.min(100, (i + 1) * step);
      const prevFb = scoreRanges[i]?.feedback || (i === 0 ? '25' : '75');
      newRanges.push({ from, to, feedback: prevFb });
    }
    setScoreRanges(newRanges);
  };

  const handleDistributeEvenly = () => {
    const count = scoreRanges.length || 1;
    const step = Math.floor(100 / count);
    const newRanges = scoreRanges.map((r, i) => {
      const from = i === 0 ? 0 : Math.min(99, i * step + 1);
      const to = i === count - 1 ? 100 : Math.min(100, (i + 1) * step);
      return { ...r, from, to };
    });
    setScoreRanges(newRanges);
  };

  const handleRemoveRange = (index) => {
    if (scoreRanges.length <= 1) return;
    const filtered = scoreRanges.filter((_, i) => i !== index);
    setScoreRanges(filtered);
  };

  const togglePlay = () => {
    if (videoRef.current) {
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
    if (typeId === 'fill_blanks' && !questionText) {
      setQuestionText('Fill in the missing words');
    }
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleEditInteraction = (item) => {
    setEditingId(item.id);
    setCurrentTime(item.timestamp);
    setSelectedType(item.type || 'multiple_choice');
    setQuestionText(item.question || '');
    setOptions(item.options && item.options.length > 0 ? item.options : ['', '', '']);
    setCorrectIdx(typeof item.correctIndex === 'number' ? item.correctIndex : 0);
    setTextWithBlanks(item.textWithBlanks || '');
    setIsTrueChoice(typeof item.isTrue === 'boolean' ? item.isTrue : true);
    setWordListInput(item.wordListInput || (item.wordList ? item.wordList.join(', ') : ''));
    setCorrectWordsInput(item.correctWordsInput || (item.correctWords ? item.correctWords.join(', ') : ''));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setQuestionText('');
    setOptions(['', '', '']);
    setTextWithBlanks('');
    setWordListInput('');
    setCorrectWordsInput('');
  };

  const saveOrUpdateInteraction = () => {
    if (!questionText.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    let parsedWordList = [];
    let parsedCorrectWords = [];
    if (selectedType === 'mark_word') {
      parsedWordList = wordListInput.split(',').map((w) => w.trim()).filter(Boolean);
      parsedCorrectWords = correctWordsInput.split(',').map((w) => w.trim()).filter(Boolean);
    }

    const payload = {
      id: editingId || ('int_' + Date.now()),
      timestamp: Number(currentTime || 10),
      type: selectedType,
      question: questionText.trim(),
      options: options.filter((o) => o.trim() !== ''),
      correctIndex: Number(correctIdx),
      textWithBlanks: textWithBlanks.trim(),
      isTrue: isTrueChoice,
      wordList: parsedWordList,
      correctWords: parsedCorrectWords,
      wordListInput,
      correctWordsInput,
    };

    if (editingId) {
      setInteractions(
        interactions
          .map((item) => (item.id === editingId ? payload : item))
          .sort((a, b) => a.timestamp - b.timestamp)
      );
      alert(`✓ Đã cập nhật thành công mốc câu hỏi tại ${payload.timestamp}s!`);
      setEditingId(null);
    } else {
      setInteractions([...interactions, payload].sort((a, b) => a.timestamp - b.timestamp));
      alert(`✓ Đã thêm mốc câu hỏi ${selectedType} tại ${payload.timestamp}s thành công!`);
    }

    setQuestionText('');
    setOptions(['', '', '']);
    setTextWithBlanks('');
    setWordListInput('');
    setCorrectWordsInput('');
  };

  const removeInteraction = (id) => {
    if (editingId === id) handleCancelEdit();
    setInteractions(interactions.filter((item) => item.id !== id));
  };

  const handleSaveStudio = () => {
    onSave({
      title,
      videoUrl,
      interactions,
    });
  };

  const getTypeNameFormatted = (typeId) => {
    const found = H5P_QUESTION_TYPES.find((t) => t.id === typeId);
    return found ? `${found.name} (${found.label})` : typeId;
  };

  const getAnswerDisplay = (item) => {
    if (item.type === 'fill_blanks') {
      const { answers } = parseFillBlanksText(item.textWithBlanks);
      if (answers && answers.length > 0) return answers.join(', ');
    }
    if (item.type === 'true_false') {
      const targetBool = typeof item.isTrue === 'boolean'
        ? item.isTrue
        : String(item.isTrue || item.answer || '').toLowerCase() === 'true';
      return targetBool ? 'True (Đúng)' : 'False (Sai)';
    }
    if (item.type === 'mark_word') {
      const words = item.correctWords || (item.correctWordsInput ? item.correctWordsInput.split(',').map((s) => s.trim()).filter(Boolean) : []);
      if (words && words.length > 0) return words.join(', ');
    }
    if (item.type === 'multiple_choice' || item.type === 'drag_drop' || !item.type) {
      if (item.options && item.options.length > 0) {
        const idx = typeof item.correctIndex === 'number' ? item.correctIndex : 0;
        return item.options[idx] || item.options[0] || item.answer;
      }
      if (item.answer) return item.answer;
    }
    return item.answer || null;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xl space-y-6 font-sans select-none max-w-6xl mx-auto">
      {/* HEADER BANNER & STEP WIZARD */}
      <div className="bg-navy-900 text-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider">
              H5P STUDIO EDITOR V71
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

        {/* 3 STEP WIZARD BAR */}
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
        {/* BƯỚC 1: QUẢN LÝ NGUỒN VIDEO */}
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
                  placeholder="Ví dụ: Interactive Video - Community Helpers"
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

            <div className="border-2 border-slate-800 rounded-3xl p-4 bg-slate-950 shadow-2xl space-y-3 text-center">
              <div className="flex items-center justify-between px-2 text-xs">
                <span className="text-amber-300 font-extrabold flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>Trình Phát Xem Trước Nguồn Video:</span>
                </span>
                <span className="text-slate-400 text-[11px] font-mono">Load siêu tốc 0.01s</span>
              </div>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&cc_load_policy=0&iv_load_policy=3`}
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

        {/* BƯỚC 2: THIẾT LẬP TƯƠNG TÁC */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-slate-900 text-white p-4 rounded-3xl border border-slate-800 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Toolbar Thêm Câu Hỏi Tương Tác H5P Phía Trên Video:</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Đang ở giây: {currentTime}s</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {H5P_QUESTION_TYPES.map((item) => {
                  const Icon = item.icon;
                  const isSel = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleCaptureTimestamp(item.id)}
                      className={`p-3 rounded-2xl border transition text-left cursor-pointer flex items-start space-x-2 ${
                        isSel
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-extrabold ring-2 ring-amber-400/30'
                          : 'border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-[11px] font-bold leading-snug">{item.name}</h5>
                        <p className="text-[9px] text-slate-400 line-clamp-1">{item.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TRÌNH PHÁT VIDEO KÈM CÁC MỐC NÚT DỪNG DÍNH TRONG DẢI PHÁT (ẢNH 1) */}
            <div className="relative bg-slate-950 rounded-3xl overflow-hidden shadow-2xl aspect-video w-full border-2 border-slate-800 flex items-center justify-center">
              {youtubeId ? (
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&controls=0&rel=0&cc_load_policy=0&iv_load_policy=3`}
                  title="Interactive Video Editor Player"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onTimeUpdate={() => {
                    if (videoRef.current) setCurrentTime(Math.floor(videoRef.current.currentTime));
                  }}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 146)}
                  className="w-full h-full object-contain"
                />
              )}

              {/* THANH TIMELINE DÍNH TRỰC TIẾP VÀO BOTTOM KHUNG VIDEO */}
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

                  {interactions.map((w, idx) => {
                    const posPercent = duration ? (w.timestamp / duration) * 100 : 0;
                    return (
                      <div
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditInteraction(w);
                        }}
                        title={`Mốc ${w.timestamp}s: ${w.question}`}
                        style={{ left: `${posPercent}%` }}
                        className="absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white ring-2 ring-amber-500/50 shadow-md cursor-pointer hover:scale-125 transition z-40 flex items-center justify-center"
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

            {/* FORM SOẠN THẢO GAP-FILL CHUẨN 100% THEO H5P EDITOR ẢNH 2 (media_1787501870428.png) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                    {editingId ? <Pencil className="w-4 h-4 text-amber-500" /> : <Plus className="w-4 h-4 text-emerald-600" />}
                    <span>
                      {editingId ? `Đang Sửa Mốc ${currentTime}s` : `Soạn Câu Hỏi Cho Giây ${currentTime}s`} ({getTypeNameFormatted(selectedType)})
                    </span>
                  </h4>

                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Hủy Sửa</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⏱️ Mốc Thời Gian Dừng (Sửa số giây dừng tại đây) *
                  </label>
                  <input
                    type="number"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-extrabold text-emerald-700 bg-white"
                  />
                </div>

                {/* FORM CHUYÊN CHO GAP-FILL DẠNG FILL IN THE BLANKS (CHUẨN ẢNH media_1787540616764.png & media_1787540655862.png) */}
                {selectedType === 'fill_blanks' && (
                  <div className="space-y-4 border-2 border-blue-500/30 rounded-2xl p-4 bg-white shadow-xs">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Task description <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[11px] text-slate-400 mb-1">A guide telling the user how to answer this task.</p>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Fill in the missing words"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Text blocks <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={textWithBlanks}
                        onChange={(e) => setTextWithBlanks(e.target.value)}
                        placeholder="Oslo is the capital of *Norway*."
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs font-mono bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {selectedType !== 'fill_blanks' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ❓ Nội Dung Câu Hỏi Pop-Up *
                    </label>
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ví dụ: Who is a bus driver?"
                      className="w-full px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold bg-white"
                    />
                  </div>
                )}

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

                {selectedType === 'true_false' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">Đáp Án Đúng Cho Câu Hỏi Này</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="tf_correct"
                          checked={isTrueChoice === true}
                          onChange={() => setIsTrueChoice(true)}
                        />
                        <span>✓ True (Đúng)</span>
                      </label>

                      <label className="flex items-center space-x-2 text-xs font-bold cursor-pointer">
                        <input
                          type="radio"
                          name="tf_correct"
                          checked={isTrueChoice === false}
                          onChange={() => setIsTrueChoice(false)}
                        />
                        <span>✕ False (Sai)</span>
                      </label>
                    </div>
                  </div>
                )}

                {selectedType === 'mark_word' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Danh Sách Từ Cho Phép Chọn (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={wordListInput}
                        onChange={(e) => setWordListInput(e.target.value)}
                        placeholder="Strawberries, Cookies, Blueberries, Milk"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-700 mb-1">
                        Danh Sách Các Từ ĐÚNG Cần Highlight (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={correctWordsInput}
                        onChange={(e) => setCorrectWordsInput(e.target.value)}
                        placeholder="Strawberries, Blueberries, Milk"
                        className="w-full px-3 py-2 border border-emerald-300 rounded-xl text-xs bg-emerald-50 font-bold"
                      />
                    </div>
                  </div>
                )}

                {selectedType === 'drag_drop' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Task description (Nội dung câu hỏi) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Ví dụ: What are the colors of these berries when they are ripe?"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Text blocks (Các đoạn văn chứa từ cần kéo thả *từ_đúng*) <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={3}
                        value={textWithBlanks}
                        onChange={(e) => setTextWithBlanks(e.target.value)}
                        placeholder={'Blueberries are *blue*.\nStrawberries are *red*.\nCloudberries are *orange*.'}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Từ gây nhiễu bổ sung trong ngân hàng từ (Phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        value={options.join(', ')}
                        onChange={(e) => setOptions(e.target.value.split(',').map((s) => s.trim()))}
                        placeholder="green, yellow, purple"
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* KHUNG THIẾT KẾ SCORE RANGE H5P CHUẨN ẢNH 2 media_1787544664865.png */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-800">Define custom feedback for any score range</h4>
                    <p className="text-[11px] text-slate-500">
                      Click the &quot;Add range&quot; button to add as many ranges as you need. Example: 0-20% Bad score, 21-91% Average Score, 91-100% Great Score!
                    </p>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-700 pt-1">
                    <div className="col-span-4">Score Range <span className="text-rose-500">*</span></div>
                    <div className="col-span-8">Feedback for defined score range</div>
                  </div>

                  <div className="space-y-2">
                    {scoreRanges.map((range, idx) => (
                      <div key={idx} className="flex items-center space-x-2 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs">
                        <div className="w-28 flex items-center space-x-1.5 font-bold text-slate-700">
                          <span>{range.from}%</span>
                          <span>-</span>
                          <span>{range.to}%</span>
                        </div>
                        <input
                          type="text"
                          value={range.feedback}
                          onChange={(e) => {
                            const updated = [...scoreRanges];
                            updated[idx].feedback = e.target.value;
                            setScoreRanges(updated);
                          }}
                          placeholder="Feedback text"
                          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                        />
                        {scoreRanges.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRange(idx)}
                            title="Xóa khoảng điểm này"
                            className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAddRange}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-lg text-xs transition cursor-pointer shadow-xs"
                    >
                      <span>ADD RANGE</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDistributeEvenly}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-extrabold rounded-lg text-xs transition cursor-pointer flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5 text-slate-500" />
                      <span>Distribute Evenly</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={saveOrUpdateInteraction}
                  className={`w-full py-3.5 font-extrabold rounded-2xl text-xs shadow-md transition cursor-pointer text-white ${
                    editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {editingId ? `✓ Cập Nhật Mốc Này (Tại Giây ${currentTime}s)` : `+ Thêm Mốc Tương Tác Này Tại ${currentTime}s`}
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
                    {interactions.map((item) => {
                      const answerDisp = getAnswerDisplay(item);
                      return (
                        <div
                          key={item.id}
                          className={`p-4 border rounded-2xl shadow-xs transition flex justify-between items-start space-x-3 ${
                            editingId === item.id ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300' : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-black text-[10px] rounded-md inline-block">
                              ⏱️ Mốc: {item.timestamp}s ({getTypeNameFormatted(item.type)})
                            </span>
                            <h5 className="text-xs font-bold text-slate-900 leading-snug">{item.question}</h5>
                            {answerDisp && (
                              <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                                <span>✓ Đáp án đúng: {answerDisp}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handleEditInteraction(item)}
                              title="Sửa mốc này"
                              className="p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition cursor-pointer flex items-center space-x-1 text-xs font-bold"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              <span>Sửa</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => removeInteraction(item.id)}
                              title="Xóa mốc này"
                              className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* BƯỚC 3: TỔNG KẾT TASK */}
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
