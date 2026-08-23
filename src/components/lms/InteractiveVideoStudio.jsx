import React, { useState, useRef } from 'react';
import { Video, HelpCircle, FileText, Plus, Trash2, CheckCircle2, Play, Pause, Save, Eye, Layers, Type, CheckSquare, Move } from 'lucide-react';

export default function InteractiveVideoStudio({ initialSettings = {}, onSave }) {
  const [step, setStep] = useState(1); // 1: Nguồn Video, 2: Thiết lập Tương tác (Timeline Editor), 3: Summary Task
  const [title, setTitle] = useState(initialSettings.title || 'Interactive Video - Bài Giảng H5P');
  const [videoUrl, setVideoUrl] = useState(initialSettings.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');

  // Danh sách mốc tương tác (Waypoints / Interactions)
  const [interactions, setInteractions] = useState(initialSettings.interactions || [
    {
      id: 'int_1',
      timestamp: 11,
      type: 'multiple_choice',
      question: 'What kind of berry is this?',
      options: ['Strawberry', 'Blueberry', 'Raspberry'],
      correctIndex: 0,
    },
    {
      id: 'int_2',
      timestamp: 31,
      type: 'fill_blanks',
      question: 'Fill in the correct ingredients:',
      textWithBlanks: 'Strawberries and *blueberries* are mixed with *milk* and oatmeal *banana*.',
      options: [],
      correctIndex: 0,
    },
  ]);

  // State Soạn Mốc Mới ở Step 2
  const [timestamp, setTimestamp] = useState(15);
  const [selectedType, setSelectedType] = useState('multiple_choice');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [textWithBlanks, setTextWithBlanks] = useState('');

  const addInteraction = () => {
    if (!questionText.trim()) {
      alert('Vui lòng nhập câu hỏi tương tác!');
      return;
    }
    const newInt = {
      id: 'int_' + Date.now(),
      timestamp: Number(timestamp),
      type: selectedType,
      question: questionText.trim(),
      options: options.filter((o) => o.trim() !== ''),
      correctIndex: Number(correctIdx),
      textWithBlanks: textWithBlanks.trim(),
    };

    setInteractions([...interactions, newInt].sort((a, b) => a.timestamp - b.timestamp));
    setQuestionText('');
    setOptions(['', '', '']);
    setTextWithBlanks('');
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
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl space-y-6 font-sans select-none max-w-5xl mx-auto">
      {/* HEADER BANNER & BARS CÔNG CỤ 3 STEP WIZARD BAR */}
      <div className="bg-navy-900 text-white p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <span className="px-3 py-1 bg-amber-400 text-slate-950 text-[10px] font-black uppercase rounded-full tracking-wider">
              H5P STUDIO EDITOR V59
            </span>
            <h3 className="text-lg font-extrabold flex items-center space-x-2">
              <Video className="w-5 h-5 text-rose-400" />
              <span>Khung Thiết Kế Video Tương Tác H5P (Interactive Video Editor)</span>
            </h3>
          </div>

          <button
            onClick={handleSaveStudio}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center space-x-1.5 cursor-pointer border border-emerald-400/40"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Bài Giảng Video Tương Tác</span>
          </button>
        </div>

        {/* 3 STEP WIZARD BAR CỰC NỔI BẬT */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-800/80 p-2 rounded-2xl border border-slate-700 text-xs font-bold">
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
        {/* STEP 1: QUẢN LÝ NGUỒN VIDEO (UPLOAD / EMBED YOUTUBE) */}
        {step === 1 && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Tiêu Đề Bài Giảng Video Tương Tác *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Interactive Video - Bat Trang Pottery Village"
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Đường Dẫn Video YouTube (HOẶC TẢI MP4 LÊN SUPABASE STORAGE) *
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* PREVIEW NẠP THỬ VIDEO TRONG BƯỚC 1 DÀNH CHO THẦY HẢI */}
            <div className="border border-slate-200 rounded-3xl p-4 bg-slate-900 shadow-inner space-y-2 text-center">
              <p className="text-xs text-amber-300 font-bold">👁️ Xem trước Nguồn Video Load Thành Công:</p>
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                <iframe
                  src={videoUrl.includes('youtube') || videoUrl.includes('youtu.be') ? `https://www.youtube.com/embed/${videoUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'}` : videoUrl}
                  title="Preview Video Source"
                  className="w-full h-full border-0"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs shadow-lg transition flex items-center space-x-2 cursor-pointer"
              >
                <span>Chuyển Sang Bước 2: Thiết Lập Tương Tác (Timeline Editor) →</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: THIẾT LẬP TƯƠNG TÁC (TIMELINE EDITOR & POPUP QUESTION BUILDER) */}
        {step === 2 && (
          <div className="space-y-6">
            {/* TOOLBAR CHỌN LOẠI CÂU HỎI H5P */}
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                🛠️ Toolbar Chọn Loại Hoạt Động Tương Tác H5P:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'multiple_choice', name: 'Multiple Choice (Trắc nghiệm)', icon: CheckSquare, desc: 'Một hoặc nhiều đáp án' },
                  { id: 'fill_blanks', name: 'Fill in the Blanks (Điền từ)', icon: Type, desc: 'Điền vào chỗ trống' },
                  { id: 'free_text', name: 'Free Text (Tự luận)', icon: FileText, desc: 'Nhập câu trả lời tự do' },
                  { id: 'drag_drop', name: 'Drag & Drop (Kéo thả)', icon: Move, desc: 'Kéo thả đáp án' },
                ].map((type) => {
                  const Icon = type.icon;
                  const isSel = selectedType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setSelectedType(type.id)}
                      className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-2.5 ${
                        isSel
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-2 ring-brand-500/20 font-extrabold'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-bold leading-snug">{type.name}</h5>
                        <p className="text-[10px] text-slate-500 line-clamp-1">{type.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CỘT TRÁI: FORM CHÈN MỐC THỜI GIAN & CÂU HỎI */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2 border-b border-slate-200 pb-2">
                  <Plus className="w-4 h-4 text-emerald-600" />
                  <span>Thêm Mốc Dừng & Soạn Câu Hỏi Pop-up</span>
                </h4>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⏱️ Mốc Thời Gian Dừng Video (Số Giây) *
                  </label>
                  <input
                    type="number"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
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
                          name="correct_opt"
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
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  + Thêm Mốc Tương Tác Này Về Video
                </button>
              </div>

              {/* CỘT PHẢI: DANH SÁCH CÁC MỐC ĐÃ TẠO */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900">
                  📋 Danh Sách Mốc Tương Tác Đã Thiết Lập ({interactions.length})
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

        {/* STEP 3: SUMMARY TASK */}
        {step === 3 && (
          <div className="space-y-6 max-w-xl text-center py-8 mx-auto">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <div className="space-y-2">
              <h4 className="font-extrabold text-xl text-slate-900">Hoàn Tất Soạn Thảo Video Tương Tác!</h4>
              <p className="text-xs text-slate-500">
                Bài giảng của Thầy Hải đã sẵn sàng với {interactions.length} mốc tương tác Pop-up Quiz chuẩn H5P. Hãy bấm nút bên dưới để lưu ngay!
              </p>
            </div>
            <button
              onClick={handleSaveStudio}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl transition cursor-pointer border border-emerald-500"
            >
              🚀 Đăng Tải & Lưu Bài Giảng Video Tương Tác
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
