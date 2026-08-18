import React, { useState } from 'react';
import { X, Volume2, Image as ImageIcon, UploadCloud, Check, Music, FolderOpen, Trash2 } from 'lucide-react';

export default function MediaLibraryModal({ isOpen, onClose, onSelectMedia }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('audio');

  const sampleAudios = [
    { title: 'Bat Trang Pottery Village Interview', duration: '02:15', url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg' },
    { title: 'Chuong Conical Hat Artisan Story', duration: '01:45', url: 'https://actions.google.com/sounds/v1/ambiences/thunder_storm.ogg' },
    { title: 'Unit 1 Listening Part 1 Track', duration: '03:10', url: 'https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg' },
  ];

  const sampleImages = [
    { title: 'Chuong Village Conical Hat Craft', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60' },
    { title: 'Bat Trang Pottery Workshop', url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 bg-slate-950 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-extrabold text-sm text-amber-400 uppercase tracking-wide">
                📁 KHO THƯ VIỆN AUDIO MP3 & HÌNH ẢNH DÙNG CHUNG
              </h3>
              <p className="text-[10px] text-slate-400">Chọn file nghe hoặc hình ảnh từ kho lưu trữ để gắn vào bài học</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-4">
          <button
            onClick={() => setActiveTab('audio')}
            className={`py-3 px-4 font-extrabold text-xs flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'audio' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>🎧 File Nghe Audio MP3 ({sampleAudios.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`py-3 px-4 font-extrabold text-xs flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'images' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>🖼️ Hình Ảnh Minh Họa ({sampleImages.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'audio' ? (
            <div className="space-y-3">
              {sampleAudios.map((a, idx) => (
                <div key={idx} className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                      <Music className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-white">{a.title}</h4>
                      <p className="text-[10px] text-slate-400">Thời lượng: {a.duration}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectMedia) onSelectMedia(a.url, a.title);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Chọn Gắn Bài</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {sampleImages.map((img, idx) => (
                <div key={idx} className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 space-y-2 p-2">
                  <img src={img.url} alt={img.title} className="w-full h-28 object-cover rounded-xl" />
                  <p className="text-[11px] font-extrabold text-slate-200 truncate">{img.title}</p>
                  <button
                    onClick={() => {
                      if (onSelectMedia) onSelectMedia(img.url, img.title);
                      onClose();
                    }}
                    className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center justify-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Chọn Ảnh Này</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
