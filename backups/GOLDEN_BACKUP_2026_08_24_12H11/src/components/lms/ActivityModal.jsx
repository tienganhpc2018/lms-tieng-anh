import React, { useState } from 'react';
import { X, FileText, HelpCircle, Video, Package, Upload, Link, BookOpen, Layers } from 'lucide-react';
import { uploadLMSFile } from '../../lib/supabase';
import RichTextEditor from './RichTextEditor';

const ACTIVITY_TYPES = [
  { id: 'quiz', name: 'Bài Kiểm Tra (Quiz)', icon: HelpCircle, desc: 'Trắc nghiệm nhiều lựa chọn, điền từ dropdown', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'h5p', name: 'Gói Tương Tác (H5P)', icon: Package, desc: 'Tải lên gói ZIP/H5P học liệu tương tác', color: 'bg-sky-50 text-sky-600' },
  { id: 'scorm', name: 'Gói Chuẩn E-Learning (SCORM)', icon: Layers, desc: 'Tải gói bài giảng SCORM 1.2/2004 (.zip)', color: 'bg-amber-50 text-amber-600' },
  { id: 'assignment', name: 'Bài Tập Về Nhà (Assignment)', icon: FileText, desc: 'Giao bài tập nộp file/văn bản có hạn nộp', color: 'bg-blue-50 text-blue-600' },
  { id: 'video', name: 'Video Tương Tác (Interactive Video)', icon: Video, desc: 'Phát Video dừng ở Timestamps hiện Pop-up Quiz', color: 'bg-rose-50 text-rose-600' },
  { id: 'page', name: 'Trang Bài Giảng (Page / File)', icon: BookOpen, desc: 'Soạn thảo văn bản Rich Text & đính kèm tài liệu', color: 'bg-teal-50 text-teal-600' },
  { id: 'url', name: 'Liên Kết (URL)', icon: Link, desc: 'Đường dẫn tham khảo tài liệu bên ngoài', color: 'bg-slate-100 text-slate-700' },
];

export default function ActivityModal({ isOpen, onClose, onAddActivity, sectionId }) {
  const [selectedType, setSelectedType] = useState('quiz');
  const [title, setTitle] = useState('');
  const [contentUrl, setContentUrl] = useState('');
  const [richTextContent, setRichTextContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  // Settings riêng cho Interactive Video hoặc Assignment
  const [videoUrl, setVideoUrl] = useState('');
  const [deadline, setDeadline] = useState('');

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadLMSFile(file, 'activities');
      setUploadedFileUrl(url);
      setContentUrl(url);
    } catch (err) {
      alert('Lỗi upload file: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tên hoạt động học tập!');
      return;
    }

    const settings = {
      richText: richTextContent,
      videoUrl: videoUrl,
      deadline: deadline,
    };

    onAddActivity({
      section_id: sectionId,
      title: title.trim(),
      type: selectedType,
      content_url: uploadedFileUrl || contentUrl,
      settings: settings,
    });

    // Reset form
    setTitle('');
    setContentUrl('');
    setRichTextContent('');
    setUploadedFileUrl('');
    setVideoUrl('');
    setDeadline('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8 border border-slate-200">
        {/* Header Modal */}
        <div className="bg-navy-900 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">Thêm Hoạt Động Hoặc Học Liệu Mới</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Chọn Loại Hoạt Động */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Chọn Loại Học Liệu / Hoạt Động
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ACTIVITY_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    type="button"
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-start space-x-3 p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{type.name}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{type.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tên tiêu đề bài học */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tên Hoạt Động / Bài Học *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Quiz Ôn Tập Chuẩn Kiến Thức Unit 1"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Form động tùy thuộc theo type */}
          {selectedType === 'page' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nội Dung Soạn Thảo Rich Text
              </label>
              <RichTextEditor
                value={richTextContent}
                onChange={setRichTextContent}
                placeholder="Soạn nội dung bài học chi tiết..."
              />
            </div>
          )}

          {selectedType === 'video' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                URL Video (YouTube hoặc Link MP4)
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-2"
              />
            </div>
          )}

          {selectedType === 'assignment' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Yêu Cầu Bài Tập (TinyMCE Rich Text)
                </label>
                <RichTextEditor
                  value={richTextContent}
                  onChange={setRichTextContent}
                  placeholder="Nhập đề bài & yêu cầu nộp bài..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Thời Hạn Nộp Bài (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          )}

          {(selectedType === 'scorm' || selectedType === 'h5p' || selectedType === 'page') && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tải Bổ Sung File Mẫu (.zip / .h5p / .pdf / .docx)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {uploading && <span className="text-xs text-brand-600 font-medium">Đang tải file...</span>}
              </div>
              {uploadedFileUrl && (
                <p className="text-xs text-emerald-600 mt-1 truncate">
                  ✓ Đã tải file: {uploadedFileUrl}
                </p>
              )}
            </div>
          )}

          {selectedType === 'url' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Đường Dẫn URL Liên Kết
              </label>
              <input
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://example.com/tai-lieu"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-bold shadow-sm transition disabled:opacity-50"
            >
              Tạo Hoạt Động
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
