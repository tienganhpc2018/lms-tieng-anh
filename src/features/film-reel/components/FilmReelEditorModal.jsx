import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Image as ImageIcon,
  Type,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sparkles,
  Eye,
  Check,
  Calendar,
  Tag,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Wand2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  FILM_REEL_CATEGORIES,
  CATEGORY_BADGES,
  ACTIVITY_SUGGESTIONS,
} from '../constants/filmReelPresets';
import {
  generateJournalParagraph,
  generateSmartCaption,
} from '../services/filmReelAiService';
import { playClick, playCorrect } from '../../../utils/soundEffects';

export default function FilmReelEditorModal({
  isOpen,
  onClose,
  initialData = null,
  classId,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Học tập');
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [coverImage, setCoverImage] = useState('');
  const [blocks, setBlocks] = useState([]);

  // State Trợ lý AI
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Nạp dữ liệu chỉnh sửa nếu có
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Học tập');
      setEventDate(initialData.eventDate || new Date().toISOString().split('T')[0]);
      setCoverImage(initialData.coverImage || '');
      setBlocks(initialData.blocks ? JSON.parse(JSON.stringify(initialData.blocks)) : []);
    } else {
      // Khởi tạo bài viết mới sạch sẽ
      setTitle('');
      setCategory('Học tập');
      setEventDate(new Date().toISOString().split('T')[0]);
      setCoverImage('');
      setBlocks([
        {
          id: `blk_${Date.now()}_1`,
          type: 'paragraph',
          text: '',
        },
      ]);
    }
    setActiveTab('edit');
    setErrorMessage('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Xử lý tải ảnh bìa qua file hoặc link
  const handleCoverUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm khối văn bản mới
  const handleAddParagraphBlock = () => {
    playClick();
    setBlocks((prev) => [
      ...prev,
      {
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'paragraph',
        text: '',
      },
    ]);
  };

  // Thêm khối hình ảnh mới
  const handleAddImageBlock = () => {
    playClick();
    const defaultCaption = generateSmartCaption(category, blocks.length + 1);
    setBlocks((prev) => [
      ...prev,
      {
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'image',
        url: '',
        caption: defaultCaption,
      },
    ]);
  };

  // Xử lý tải ảnh cho từng khối
  const handleBlockImageUpload = (blockId, e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBlock(blockId, { url: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Cập nhật thuộc tính khối
  const updateBlock = (blockId, updates) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    );
  };

  // Xóa khối
  const deleteBlock = (blockId) => {
    playClick();
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  // Di chuyển khối Lên
  const moveBlockUp = (index) => {
    if (index <= 0) return;
    playClick();
    const newBlocks = [...blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    setBlocks(newBlocks);
  };

  // Di chuyển khối Xuống
  const moveBlockDown = (index) => {
    if (index >= blocks.length - 1) return;
    playClick();
    const newBlocks = [...blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    setBlocks(newBlocks);
  };

  // Gọi Trợ lý AI sinh đoạn văn
  const handleAiGenerateParagraph = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await generateJournalParagraph({
        title,
        category,
        keywords: aiKeywords,
      });

      if (result.success && result.text) {
        setBlocks((prev) => [
          ...prev,
          {
            id: `blk_ai_${Date.now()}`,
            type: 'paragraph',
            text: result.text,
            aiGenerated: true,
          },
        ]);
        playCorrect();
        setIsAiModalOpen(false);
        setAiKeywords('');
      }
    } catch (e) {
      console.error('Lỗi sinh đoạn văn AI:', e);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Lưu & Xuất bản bài viết
  const handleSubmit = () => {
    setErrorMessage('');
    if (!title.trim()) {
      setErrorMessage('Vui lòng nhập tiêu đề cho sự kiện kỷ niệm!');
      return;
    }
    if (!coverImage) {
      setErrorMessage('Vui lòng chọn ảnh bìa cho bài viết cuộn phim!');
      return;
    }

    const payload = {
      ...(initialData || {}),
      classId,
      title: title.trim(),
      category,
      eventDate,
      coverImage,
      blocks: blocks.filter(
        (b) => (b.type === 'paragraph' && b.text.trim()) || (b.type === 'image' && b.url)
      ),
    };

    onSave(payload);
    playCorrect();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border-2 border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* 1. HEADER MODAL */}
        <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-purple-800/40">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
              🎞️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                {initialData ? 'CHỈNH SỬA KHOẢNH KHẮC PHIM' : 'TẠO KHOẢNH KHẮC MỚI ĐẦU TIÊN'}
              </h2>
              <p className="text-xs text-purple-200 font-medium">
                Soạn thảo dạng khối linh hoạt kết hợp Trợ lý AI viết bài
              </p>
            </div>
          </div>

          {/* 2 Tab: Chỉnh sửa & Xem trước */}
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'edit'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Soạn Thảo
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Xem Trước</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. BODY CHÍNH */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'edit' ? (
            <div className="space-y-6">
              {/* THÔNG TIN CƠ BẢN (Tiêu đề, Danh mục, Ngày sự kiện) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* Tiêu đề sự kiện */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-purple-600" />
                    Tiêu Đề Khoảnh Khắc / Sự Kiện:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Lễ Kỷ Niệm Tri Ân 20/11 hoặc Ngày Hội STEM..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Danh mục */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    Danh Mục:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  >
                    {FILM_REEL_CATEGORIES.filter((c) => c !== 'Tất cả').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày diễn ra */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    Ngày Diễn Ra:
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer"
                  />
                </div>

                {/* Trợ lý AI gợi ý nhanh */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setIsAiModalOpen(true)}
                    className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✨ AI Viết Đoạn Văn</span>
                  </button>
                </div>
              </div>

              {/* KHU VỰC CHỌN ẢNH BÌA */}
              <div className="space-y-2 bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                <label className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                  Ảnh Bìa Đại Diện (Tỷ lệ 16:9):
                </label>

                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  {coverImage ? (
                    <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden border-2 border-purple-300 shadow-sm shrink-0">
                      <img
                        src={coverImage}
                        alt="Ảnh bìa"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-1 right-1 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-700"
                        title="Xóa ảnh bìa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-48 aspect-video rounded-xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center text-purple-400 bg-white shrink-0">
                      <ImageIcon className="w-6 h-6" />
                      <span className="text-[10px] font-bold mt-1">Chưa có ảnh bìa</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="text"
                      placeholder="Dán link ảnh URL (https://...)"
                      value={coverImage.startsWith('data:') ? '' : coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition-all">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Hoặc tải ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* KHU VỰC SOẠN THẢO CÁC KHỐI BLOCKS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-2">
                    <span>Nội Dung Hoạt Động Theo Khối ({blocks.length} khối)</span>
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAddParagraphBlock}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1 border border-purple-200 transition-colors cursor-pointer"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>+ Thêm Đoạn Văn</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddImageBlock}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-200 transition-colors cursor-pointer"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>+ Thêm Hình Ảnh</span>
                    </button>
                  </div>
                </div>

                {/* DANH SÁCH CÁC KHỐI BLOCKS */}
                <div className="space-y-3">
                  {blocks.map((block, index) => (
                    <div
                      key={block.id}
                      className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative group hover:border-purple-300 transition-colors"
                    >
                      {/* Header khối: Kiểu khối & Các nút điều hướng */}
                      <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                          {block.type === 'paragraph' ? (
                            <>
                              <Type className="w-3.5 h-3.5 text-purple-600" />
                              <span>Đoạn Văn Bản #{index + 1}</span>
                              {block.aiGenerated && (
                                <span className="bg-purple-100 text-purple-800 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                                  AI
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Hình Ảnh Kỷ Niệm #{index + 1}</span>
                            </>
                          )}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => moveBlockUp(index)}
                            title="Di chuyển lên"
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === blocks.length - 1}
                            onClick={() => moveBlockDown(index)}
                            title="Di chuyển xuống"
                            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-purple-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteBlock(block.id)}
                            title="Xóa khối này"
                            className="w-7 h-7 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Nội dung khối Đoạn văn */}
                      {block.type === 'paragraph' && (
                        <textarea
                          rows={4}
                          placeholder="Nhập cảm nghĩ, diễn biến hoạt động hoặc câu chuyện kỷ niệm của lớp..."
                          value={block.text || ''}
                          onChange={(e) => updateBlock(block.id, { text: e.target.value })}
                          className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm leading-relaxed text-slate-800 outline-none focus:ring-2 focus:ring-purple-400 font-normal"
                        />
                      )}

                      {/* Nội dung khối Hình ảnh */}
                      {block.type === 'image' && (
                        <div className="space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3 items-center">
                            {block.url ? (
                              <div className="w-full sm:w-36 aspect-video rounded-xl overflow-hidden border border-slate-300 shrink-0 relative">
                                <img
                                  src={block.url}
                                  alt="Ảnh hoạt động"
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateBlock(block.id, { url: '' })}
                                  className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-full sm:w-36 aspect-video rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white text-slate-400 shrink-0">
                                <ImageIcon className="w-5 h-5" />
                              </div>
                            )}

                            <div className="flex-1 w-full space-y-2">
                              <input
                                type="text"
                                placeholder="Dán link ảnh (https://...)"
                                value={block.url?.startsWith('data:') ? '' : block.url}
                                onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-purple-400"
                              />

                              <label className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs cursor-pointer">
                                <Upload className="w-3 h-3" />
                                <span>Tải ảnh từ máy</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleBlockImageUpload(block.id, e)}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>

                          {/* Ô nhập chú thích ảnh */}
                          <div>
                            <input
                              type="text"
                              placeholder="Chú thích chân ảnh (VD: Cùng nhau vượt chướng ngại vật...)"
                              value={block.caption || ''}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs italic text-slate-700 outline-none focus:ring-2 focus:ring-purple-400"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* TAB XEM TRƯỚC (PREVIEW) */
            <div className="space-y-6">
              {/* Khung ảnh bìa Preview */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                <img
                  src={coverImage || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80'}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white space-y-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white w-fit">
                    {category}
                  </span>
                  <h2 className="text-2xl font-black">{title || 'Tiêu đề chưa nhập...'}</h2>
                  <p className="text-xs text-slate-300">📅 {eventDate}</p>
                </div>
              </div>

              {/* Các khối Preview */}
              <div className="space-y-6 px-4">
                {blocks.map((block, idx) => {
                  if (block.type === 'paragraph' && block.text) {
                    return (
                      <p
                        key={idx}
                        className="text-base text-slate-800 leading-relaxed font-normal whitespace-pre-line"
                      >
                        {block.text}
                      </p>
                    );
                  }
                  if (block.type === 'image' && block.url) {
                    return (
                      <figure key={idx} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={block.url}
                          alt={block.caption}
                          className="w-full max-h-[400px] object-cover"
                        />
                        {block.caption && (
                          <figcaption className="p-2 text-center text-xs italic text-slate-600 bg-slate-50">
                            {block.caption}
                          </figcaption>
                        )}
                      </figure>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
        </div>

        {/* 3. FOOTER HÀNH ĐỘNG */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>LƯU & XUẤT BẢN KHOẢNH KHẮC</span>
          </button>
        </div>

        {/* MODAL TRỢ LÝ AI VIẾT ĐOẠN VĂN */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-2 border-purple-400 space-y-4 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-700 font-black text-base">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>TRỢ LÝ AI VIẾT NHẬT KÝ</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Nhập vài từ khóa ngắn hoặc chọn chủ đề mẫu gợi ý bên dưới, AI sẽ tự động tạo một đoạn văn đong đầy cảm xúc cho lớp học!
              </p>

              {/* Từ khóa */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Từ khóa gợi ý:</label>
                <input
                  type="text"
                  placeholder="VD: thi kéo co, hò reo nhiệt tình, gắn kết bạn bè..."
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  className="w-full px-3 py-2 border border-purple-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Gợi ý chủ đề nhanh */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500">Chủ đề mẫu phổ biến:</label>
                <div className="flex flex-wrap gap-1.5">
                  {ACTIVITY_SUGGESTIONS.map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTitle(sug.title);
                        setCategory(sug.category);
                        setAiKeywords(sug.keywords);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition-colors"
                    >
                      {sug.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút bấm AI */}
              <button
                type="button"
                disabled={isGeneratingAi}
                onClick={handleAiGenerateParagraph}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Wand2 className={`w-4 h-4 ${isGeneratingAi ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAi ? 'Đang Sáng Tác Đoạn Văn...' : 'TẠO ĐOẠN VĂN NGAY'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
