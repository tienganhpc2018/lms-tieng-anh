import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, RotateCcw, Check, Sparkles, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function CourseCoverModal({
  isOpen,
  onClose,
  grade,
  currentImage,
  defaultImage,
  onSave,
}) {
  const [selectedUrl, setSelectedUrl] = useState('');
  const [customInputUrl, setCustomInputUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedUrl(currentImage || defaultImage || '');
      setCustomInputUrl('');
      setUploadError('');
    }
  }, [isOpen, currentImage, defaultImage]);

  if (!isOpen) return null;

  // XỬ LÝ CHỌN FILE ẢNH TỪ MÁY TÍNH CỦA THẦY
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn dung lượng 10MB
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh vượt quá 10MB. Thầy vui lòng chọn ảnh nhẹ hơn.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // 1. Thử upload trực tiếp lên Supabase Storage bucket 'lms-files'
      const fileExt = file.name.split('.').pop();
      const fileName = `course_covers/grade_${grade}_${Date.now()}.${fileExt}`;

      let uploadedUrl = null;

      try {
        const { error: storageErr } = await supabase.storage
          .from('lms-files')
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (!storageErr) {
          const { data: pubData } = supabase.storage
            .from('lms-files')
            .getPublicUrl(fileName);
          if (pubData?.publicUrl) {
            uploadedUrl = pubData.publicUrl;
          }
        }
      } catch (storageException) {
        console.warn('Storage upload fallback:', storageException);
      }

      // 2. Nếu Storage chưa cấu hình -> Fallback sang base64 data URL
      if (!uploadedUrl) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const base64 = evt.target?.result;
          if (base64) {
            setSelectedUrl(base64);
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      setSelectedUrl(uploadedUrl);
      setIsUploading(false);
    } catch (err) {
      console.error(err);
      setUploadError('Không thể tải ảnh lên. Vui lòng thử lại hoặc chọn tệp ảnh khác.');
      setIsUploading(false);
    }
  };

  // DÁN URL ẢNH THỦ CÔNG
  const handleApplyUrl = () => {
    if (customInputUrl.trim()) {
      setSelectedUrl(customInputUrl.trim());
      setCustomInputUrl('');
    }
  };

  // KHÔI PHỤC ẢNH MẪU BAN ĐẦU
  const handleResetToDefault = () => {
    setSelectedUrl(defaultImage);
    setUploadError('');
  };

  // LƯU THAY ĐỔI
  const handleConfirmSave = () => {
    if (selectedUrl) {
      onSave(selectedUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 font-sans select-none overflow-y-auto animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-scale-up">
        {/* HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 to-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">
                Đổi Ảnh Bìa Thực Tế • Khối {grade}
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Tải ảnh chụp lớp học trường THCS Đề Gi để đồng bộ Real-Time cho học sinh
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* KHUNG XEM TRƯỚC ẢNH BÌA */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              🖼️ Ảnh bìa sẽ hiển thị trên thẻ khóa học:
            </label>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-200/80 shadow-inner group">
              <img
                src={selectedUrl || defaultImage}
                alt={`Khối ${grade}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 backdrop-blur-xs text-white rounded-lg text-[10px] font-black uppercase tracking-wider border border-white/20">
                ENGLISH {grade}
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-xs">
                THCS ĐỀ GI
              </div>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[11px] font-bold px-3 py-1.5 bg-black/60 backdrop-blur-xs rounded-xl border border-white/20">
                <span>Ảnh lớp học thực tế</span>
                <span className="text-emerald-400 font-extrabold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sắc nét 100%</span>
                </span>
              </div>
            </div>
          </div>

          {/* TÙY CHỌN 1: TẢI TỪ MÁY TÍNH */}
          <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-3">
            <h4 className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cách 1: Tải ảnh chụp từ máy tính của Thầy</span>
            </h4>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 bg-white hover:bg-emerald-100 text-emerald-900 border-2 border-dashed border-emerald-300 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 transition shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>{isUploading ? 'Đang xử lý ảnh...' : '📁 Bấm để chọn tệp ảnh từ máy tính (JPG, PNG, WEBP)'}</span>
            </button>
          </div>

          {/* TÙY CHỌN 2: DÁN ĐƯỜNG DẪN URL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              🔗 Cách 2: Hoặc dán đường link ảnh trực tiếp
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={customInputUrl}
                onChange={(e) => setCustomInputUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 bg-white outline-none"
              />
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục ảnh mẫu mặc định</span>
          </button>

          <div className="w-full sm:w-auto flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isUploading}
              onClick={handleConfirmSave}
              className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Lưu & Đồng Bộ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
