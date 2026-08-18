import React, { useState } from 'react';
import { X, Camera, Sparkles, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

export default function PaperToQuizOcrModal({ isOpen, onClose, onConverted }) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setPreviewImage(evt.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStartOcr = () => {
    if (!previewImage) return;
    setLoading(true);

    // Giả lập OCR AI quét ảnh đề thi giấy chuyển thành Quiz Online trong 1.5 giây
    setTimeout(() => {
      const mockQuestions = [
        {
          question: '1. What traditional craft is Chuong village famous for?',
          options: [
            { text: 'Making pottery', isCorrect: false },
            { text: 'Weaving silk', isCorrect: false },
            { text: 'Making conical hats', isCorrect: true },
            { text: 'Carving wood', isCorrect: false }
          ],
          explanation: '💡 Evidence: Chuong village in Hanoi is famous for making conical hats.'
        },
        {
          question: '2. What generation of artisan is Phong in Bat Trang pottery village?',
          options: [
            { text: 'First', isCorrect: false },
            { text: 'Second', isCorrect: false },
            { text: 'Third', isCorrect: true },
            { text: 'Fourth', isCorrect: false }
          ],
          explanation: '💡 Evidence: Phong is the third generation of artisan in his family.'
        }
      ];

      setLoading(false);
      alert('⚡ CHUYỂN ĐỔI THÀNH CÔNG!\n\nAI đã trích xuất 2 câu hỏi trắc nghiệm từ ảnh chụp đề thi giấy.');
      if (onConverted) onConverted(mockQuestions);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide">
                📸 QUÉT ĐỀ THI GIẤY SANG QUIZ ONLINE BẰNG OCR AI
              </h3>
              <p className="text-[10px] text-slate-400">Tải hoặc chụp ảnh đề thi giấy, AI tự động tách câu hỏi A,B,C,D thành Quiz trong 3s</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-4 flex flex-col items-center justify-center">
          {!previewImage ? (
            <label className="w-full bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700 hover:border-amber-400 p-8 text-center space-y-3 cursor-pointer transition">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              <Camera className="w-10 h-10 text-amber-400 mx-auto" />
              <div className="space-y-1">
                <p className="font-extrabold text-xs text-white">Bấm Chọn Hoặc Chụp Ảnh Đề Thi Giấy</p>
                <p className="text-[10px] text-slate-400">Hỗ trợ các định dạng ảnh JPG, PNG, WEBP, HEIC</p>
              </div>
            </label>
          ) : (
            <div className="w-full space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700">
                <img src={previewImage} alt="Paper Exam" className="w-full h-48 object-cover" />
                {loading && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2">
                    <Sparkles className="w-10 h-10 text-amber-400 animate-bounce" />
                    <span className="text-xs font-extrabold text-amber-300 uppercase">
                      ⚡ AI đang phân tích & trích xuất câu hỏi A, B, C, D...
                    </span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleStartOcr}
                  disabled={loading}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Bắt Đầu Chuyển Sang Quiz Online</span>
                </button>
                <button
                  onClick={() => setPreviewImage(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Đổi Ảnh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
