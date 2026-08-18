import React, { useState } from 'react';
import { Video, HelpCircle, FileText, Plus, Trash2, CheckCircle2, Play, Pause } from 'lucide-react';

export default function InteractiveVideoBuilder({ initialSettings = {}, onSave }) {
  const [step, setStep] = useState(1); // 1: Upload/embed, 2: Add interactions, 3: Summary
  const [videoUrl, setVideoUrl] = useState(initialSettings.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [title, setTitle] = useState(initialSettings.title || 'Video Tương Tác - Bài Học');
  
  // List các mốc tương tác
  const [interactions, setInteractions] = useState(initialSettings.interactions || [
    { timestamp: 15, question: 'Nhà cổ Bát Tràng nổi tiếng về làng nghề gì?', options: ['Làm Gốm', 'Làm Chiếu', 'Đúc Đồng'], correctIndex: 0 }
  ]);

  // Form mốc tương tác mới
  const [timestamp, setTimestamp] = useState(30);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);

  const addInteraction = () => {
    if (!questionText.trim()) return;
    const newInt = {
      timestamp: Number(timestamp),
      question: questionText.trim(),
      options: options.filter(o => o.trim() !== ''),
      correctIndex: Number(correctIdx)
    };
    setInteractions([...interactions, newInt].sort((a, b) => a.timestamp - b.timestamp));
    setQuestionText('');
    setOptions(['', '', '']);
  };

  const removeInteraction = (idx) => {
    setInteractions(interactions.filter((_, i) => i !== idx));
  };

  const handleSaveAll = () => {
    onSave({
      title,
      videoUrl,
      interactions
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-6">
      {/* Header Title & Steps Wizard Bar (Chuẩn Ảnh 1) */}
      <div className="bg-slate-900 text-white p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-extrabold flex items-center space-x-2">
            <Video className="w-5 h-5 text-rose-500" />
            <span>Khung Thiết Kế Video Tương Tác (H5P Interactive Video)</span>
          </h3>
          <button
            onClick={handleSaveAll}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            Lưu Video Tương Tác
          </button>
        </div>

        {/* 3 Step Wizard Bar */}
        <div className="grid grid-cols-3 gap-2 bg-slate-800 p-1.5 rounded-xl text-xs font-bold">
          <button
            onClick={() => setStep(1)}
            className={`py-2.5 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
              step === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Step 1: Upload / Embed Video</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`py-2.5 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
              step === 2 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Step 2: Add Interactions ({interactions.length})</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`py-2.5 px-3 rounded-lg transition flex items-center justify-center space-x-2 ${
              step === 3 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span>Step 3: Summary Task</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: UPLOAD / EMBED VIDEO */}
        {step === 1 && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Tiêu Đề Video Tương Tác *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ví dụ: Interactive Video - Bat Trang Pottery Village"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Đường Dẫn Video (YouTube Link / MP4 Direct Link) *
              </label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-xs hover:bg-emerald-600 transition"
              >
                Tiếp Tục Chuyển Sang Step 2 →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ADD INTERACTIONS (CHÈN MỐC CÂU HỎI POP-UP) */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cột trái: Form chèn mốc tương tác */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800 flex items-center space-x-1.5">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Thêm Mốc Dừng & Câu Hỏi Trắc Nghiệm</span>
              </h4>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Mốc Thời Gian Dừng Video (Giây)
                </label>
                <input
                  type="number"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Câu Hỏi Pop-up Hiện Khi Dừng
                </label>
                <input
                  type="text"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Nhập câu hỏi tương tác..."
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-600">Các Lựa Chọn Đáp Án</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct_opt"
                      checked={correctIdx === i}
                      onChange={() => setCorrectIdx(i)}
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
                      className="flex-1 px-2.5 py-1 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addInteraction}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
              >
                + Thêm Mốc Tương Tác Này
              </button>
            </div>

            {/* Cột phải: Danh sách các mốc đã tạo */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-slate-800">
                Danh Sách Mốc Tương Tác Đã Tạo ({interactions.length})
              </h4>
              {interactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic p-4 border border-dashed rounded-xl">
                  Chưa có mốc tương tác nào.
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {interactions.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded">
                          Mốc: {item.timestamp} giây
                        </span>
                        <h5 className="text-xs font-bold text-slate-900">{item.question}</h5>
                        <p className="text-[11px] text-slate-500">
                          Đáp án đúng: {item.options[item.correctIndex]}
                        </p>
                      </div>
                      <button
                        onClick={() => removeInteraction(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SUMMARY TASK */}
        {step === 3 && (
          <div className="space-y-4 max-w-xl text-center py-6 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="font-extrabold text-lg text-slate-900">Hoàn Tất Thiết Kế Video Tương Tác</h4>
            <p className="text-xs text-slate-500">
              Video của bạn đã sẵn sàng với {interactions.length} mốc tương tác Pop-up Quiz. Hãy bấm "Lưu Video Tương Tác" bên trên để đăng tải!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
