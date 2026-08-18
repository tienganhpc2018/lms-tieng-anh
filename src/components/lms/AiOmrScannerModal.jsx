import React, { useState, useRef } from 'react';
import { X, Camera, Scan, CheckCircle, RefreshCw, Sparkles, Award } from 'lucide-react';

export default function AiOmrScannerModal({ isOpen, onClose, onScanComplete }) {
  if (!isOpen) return null;

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const videoRef = useRef(null);

  const handleStartScan = () => {
    setScanning(true);
    setScanResult(null);

    // Giả lập AI Computer Vision quét & chấm điểm phiếu tô trong 1.2 giây
    setTimeout(() => {
      const mockResult = {
        studentName: 'Nguyễn Văn An (SBD: 09102)',
        examCode: '101',
        totalQuestions: 40,
        correctCount: 36,
        score: 9.0,
        detectedAnswers: {
          1: 'A', 2: 'C', 3: 'B', 4: 'D', 5: 'A',
          6: 'B', 7: 'C', 8: 'A', 9: 'D', 10: 'C',
        },
      };

      setScanResult(mockResult);
      setScanning(false);
      if (onScanComplete) onScanComplete(mockResult);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 text-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-950 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-emerald-400 uppercase tracking-wide">
                📷 CAMERA AI QUÉT & CHẤM PHIẾU TÔ OMR (1 GIÂY)
              </h3>
              <p className="text-[10px] text-slate-400">Giơ phiếu tô bài làm của học sinh trước Camera để AI chấm tự động</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Khung quét Camera Giả Lập / Real-time */}
        <div className="p-6 space-y-4 flex flex-col items-center justify-center min-h-[300px]">
          {!scanResult ? (
            <div className="w-full bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-500/50 p-6 text-center space-y-3 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8 text-emerald-400" />
              </div>

              <div className="space-y-1">
                <p className="font-extrabold text-xs text-white">Giơ Phiếu Tô Trắc Nghiệm Học Sinh Trước Camera</p>
                <p className="text-[10px] text-slate-400">Đảm bảo đủ ánh sáng và 4 góc phiếu vuông vắn trong khung hình</p>
              </div>

              {scanning && (
                <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center space-y-2 animate-pulse">
                  <Scan className="w-10 h-10 text-emerald-400 animate-spin" />
                  <span className="text-xs font-extrabold text-emerald-300 uppercase">
                    ⚡ AI Computer Vision đang quét & nhận diện ô tô...
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* KẾT QUẢ QUÉT THÀNH CÔNG */
            <div className="w-full bg-emerald-950/60 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-800/80 pb-2">
                <span className="font-extrabold text-xs text-emerald-300 flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>✅ ĐÃ CHẤM PHIẾU THÀNH CÔNG!</span>
                </span>
                <span className="text-sm font-black text-amber-400">{scanResult.score} ĐIỂM</span>
              </div>

              <div className="space-y-1 text-xs text-slate-200">
                <p>• Học sinh: <strong>{scanResult.studentName}</strong></p>
                <p>• Mã đề thi nhận diện: <strong>Mã {scanResult.examCode}</strong></p>
                <p>• Số câu tô chính xác: <strong className="text-emerald-400">{scanResult.correctCount} / {scanResult.totalQuestions} câu</strong></p>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-3 w-full">
            {!scanResult ? (
              <button
                onClick={handleStartScan}
                disabled={scanning}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bấm Để AI Quét & Chấm Điểm Ngay</span>
              </button>
            ) : (
              <button
                onClick={() => setScanResult(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Quét Phiếu Tiếp Theo</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
