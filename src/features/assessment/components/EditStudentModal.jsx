import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Check, User, Sparkles } from 'lucide-react';
import { playClick, playCorrect } from '../../../utils/soundEffects';

const VIETNAMESE_AVATAR_PRESETS = [
  { name: 'Nam sinh Áo trắng 1', url: '/images/avatars/student_male_1.jpg', gender: 'Nam' },
  { name: 'Nam sinh Áo trắng 2', url: '/images/avatars/student_male_2.jpg', gender: 'Nam' },
  { name: 'Nữ sinh Áo trắng 1', url: '/images/avatars/student_female_1.jpg', gender: 'Nữ' },
  { name: 'Nữ sinh Áo trắng 2', url: '/images/avatars/student_female_2.jpg', gender: 'Nữ' },
];

export default function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSaveStudent,
}) {
  if (!isOpen || !student) return null;

  const [fullName, setFullName] = useState(student.full_name || student.name || '');
  const [gender, setGender] = useState(student.gender || 'Nam');
  const [avatar, setAvatar] = useState(student.avatar || '/images/avatars/student_male_1.jpg');
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef(null);

  // Xử lý tải ảnh đại diện từ máy tính lên
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Vui lòng chọn ảnh dung lượng dưới 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      setAvatar(base64Data);
      setPreviewError(false);
      playCorrect();
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    playClick();
    setAvatar(preset.url);
    setGender(preset.gender);
    setPreviewError(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    playCorrect();
    onSaveStudent({
      ...student,
      full_name: fullName.trim(),
      name: fullName.trim(),
      gender,
      avatar,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
              ✏️
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Chỉnh Sửa Hồ Sơ Học Sinh</h3>
              <p className="text-xs text-teal-200 font-semibold">
                Sửa Giới tính & Thay ảnh đại diện từ máy tính
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Avatar xem trước & Nút tải ảnh từ máy tính */}
          <div className="flex flex-col items-center justify-center space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="relative group">
              <img
                src={avatar}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-teal-500 shadow-md"
                onError={(e) => {
                  if (!previewError) {
                    setPreviewError(true);
                    e.currentTarget.src =
                      gender === 'Nam'
                        ? '/images/avatars/student_male_1.jpg'
                        : '/images/avatars/student_female_1.jpg';
                  }
                }}
              />
              <span
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-black shadow-xs ${
                  gender === 'Nam' ? 'bg-blue-600 text-white' : 'bg-pink-600 text-white'
                }`}
              >
                {gender === 'Nam' ? '♂' : '♀'}
              </span>
            </div>

            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Nút bấm chọn ảnh từ máy tính */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white hover:bg-teal-50 text-teal-800 border-2 border-teal-600 rounded-xl text-xs font-black shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Camera className="w-4 h-4 text-teal-700" />
              <span>📷 Tải Ảnh Thật Từ Máy Tính Lên</span>
            </button>
            <p className="text-[10px] text-slate-400 italic">
              * Hỗ trợ file .jpg, .png từ máy tính hoặc điện thoại
            </p>
          </div>

          {/* Chọn giới tính: Nam / Nữ */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center justify-between">
              <span>Giới Tính Học Sinh:</span>
              <span className="text-[11px] font-extrabold text-teal-700">
                {gender === 'Nam' ? '👦 Học sinh Nam' : '👧 Học sinh Nữ'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setGender('Nam');
                  if (avatar.includes('female')) {
                    setAvatar('/images/avatars/student_male_1.jpg');
                  }
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                  gender === 'Nam'
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50'
                }`}
              >
                <span className="text-base">👦</span>
                <span>Học Sinh Nam</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setGender('Nữ');
                  if (avatar.includes('male')) {
                    setAvatar('/images/avatars/student_female_1.jpg');
                  }
                }}
                className={`py-2.5 px-4 rounded-xl border text-xs font-black transition cursor-pointer flex items-center justify-center gap-2 ${
                  gender === 'Nữ'
                    ? 'bg-pink-600 text-white border-pink-700 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-pink-50'
                }`}
              >
                <span className="text-base">👧</span>
                <span>Học Sinh Nữ</span>
              </button>
            </div>
          </div>

          {/* Sửa họ và tên */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase">
              Họ Và Tên Học Sinh:
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm font-bold text-slate-900"
              required
            />
          </div>

          {/* Chọn nhanh Avatar mẫu học sinh Việt Nam áo trắng khăn quàng đỏ */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase flex items-center justify-between">
              <span>Hoặc Chọn Avatar Áo Trắng Khăn Quàng:</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {VIETNAMESE_AVATAR_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className={`p-1.5 rounded-xl border transition flex flex-col items-center cursor-pointer ${
                    avatar === p.url
                      ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="w-12 h-12 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-[10px] font-bold text-slate-600 mt-1 line-clamp-1">
                    {p.gender === 'Nam' ? 'Nam' : 'Nữ'} {idx % 2 + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-black text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
