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
  Users,
  Loader2,
  Pin,
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
import { loadClasses } from '../../behavior/behaviorStorage';
import { compressImage, compressDataUrlMultiStage } from '../../../utils/imageCompressor';
import { formatDirectImageUrl, isGoogleDriveUrl } from '../utils/googleDriveHelper';
import { cleanStorageForEmergency } from '../filmReelStorage';
import SafeFilmImage from './SafeFilmImage';

const PRESET_COVERS = [
  { label: 'Học tập & Thảo luận', url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Hoạt động kịch nghệ', url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Kỷ niệm & Tình bạn', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80' },
  { label: 'Lớp học sôi động', url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&auto=format&fit=crop&q=80' },
];

export default function FilmReelEditorModal({
  isOpen,
  onClose,
  initialData = null,
  classId,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'
  const [coverSourceType, setCoverSourceType] = useState('drive'); // 'drive' | 'upload'
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Học tập');
  const [eventDate, setEventDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [coverImage, setCoverImage] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [targetClassId, setTargetClassId] = useState(classId || 'class_7a');
  const [availableClasses, setAvailableClasses] = useState([]);
  const [isPinned, setIsPinned] = useState(true);

  // State Trợ lý AI & Trạng thái
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nạp dữ liệu danh sách lớp và chỉnh sửa nếu có
  useEffect(() => {
    let cls = loadClasses() || [];
    if (cls.length === 0) {
      cls = [
        { id: 'class_7a', name: '7A', grade_level: '7' },
        { id: 'class_7b', name: '7B', grade_level: '7' },
        { id: 'class_8a', name: '8A', grade_level: '8' },
        { id: 'class_9a', name: '9A', grade_level: '9' },
      ];
    }
    setAvailableClasses(cls);

    if (initialData) {
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'Học tập');
      setEventDate(initialData.eventDate || new Date().toISOString().split('T')[0]);
      setCoverImage(initialData.coverImage || '');
      setBlocks(initialData.blocks ? JSON.parse(JSON.stringify(initialData.blocks)) : []);
      setIsPinned(initialData.isPinned !== undefined ? Boolean(initialData.isPinned) : true);
      if (initialData.classId) setTargetClassId(initialData.classId);
    } else {
      // Khởi tạo bài viết mới sạch sẽ (Mặc định bật Ghim ra FRAME #01 Trang Chủ)
      setTitle('');
      setCategory('Học tập');
      setEventDate(new Date().toISOString().split('T')[0]);
      setCoverImage('');
      setIsPinned(true);
      setBlocks([
        {
          id: `blk_${Date.now()}_1`,
          type: 'paragraph',
          text: '',
        },
      ]);
      if (classId && classId !== 'all_classes') {
        setTargetClassId(classId);
      } else if (cls.length > 0) {
        setTargetClassId(cls[0].id);
      }
    }
    setActiveTab('edit');
    setErrorMessage('');
    setIsSubmitting(false);
  }, [initialData, classId, isOpen]);

  if (!isOpen) return null;

  // Xử lý tải ảnh bìa qua file hoặc link (TỰ ĐỘNG NÉN CHUẨN WEB CHỐNG TRÀN BỘ NHỚ)
  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 900, 900, 0.65);
        setCoverImage(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fallbackCompressed = await compressDataUrlMultiStage(event.target.result, 1);
          setCoverImage(fallbackCompressed);
        };
        reader.readAsDataURL(file);
      }
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
    setBlocks((prev) => [
      ...prev,
      {
        id: `blk_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'image',
        url: '',
        caption: '',
      },
    ]);
  };

  // Cập nhật nội dung một khối (Hỗ trợ cả updateBlock và handleUpdateBlock)
  const updateBlock = (blockId, updates) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    );
  };
  const handleUpdateBlock = (id, field, value) => updateBlock(id, { [field]: value });

  // Xóa một khối
  const deleteBlock = (id) => {
    playClick();
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };
  const handleDeleteBlock = deleteBlock;

  // Di chuyển khối lên trên
  const moveBlockUp = (index) => {
    if (index === 0) return;
    playClick();
    setBlocks((prev) => {
      const newArr = [...prev];
      const temp = newArr[index - 1];
      newArr[index - 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };
  const handleMoveBlockUp = moveBlockUp;

  // Di chuyển khối xuống dưới
  const moveBlockDown = (index) => {
    if (index === blocks.length - 1) return;
    playClick();
    setBlocks((prev) => {
      const newArr = [...prev];
      const temp = newArr[index + 1];
      newArr[index + 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };
  const handleMoveBlockDown = moveBlockDown;

  // Tải ảnh cho một khối ảnh (Tự động nén dung lượng chuẩn web chống tràn bộ nhớ)
  const handleBlockImageUpload = async (id, fileOrEvent) => {
    const file = fileOrEvent?.target?.files?.[0] || fileOrEvent;
    if (file && file instanceof Blob) {
      try {
        const compressed = await compressImage(file, 800, 800, 0.65);
        updateBlock(id, { url: compressed });
      } catch (err) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const fallbackCompressed = await compressDataUrlMultiStage(event.target.result, 1);
          updateBlock(id, { url: fallbackCompressed });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Trợ lý AI tạo thông minh chú thích ảnh
  const handleAiSmartCaption = async (blockId) => {
    const targetBlock = blocks.find((b) => b.id === blockId);
    if (!targetBlock) return;

    try {
      const generated = await generateSmartCaption(
        targetBlock.caption || title || 'Hình ảnh kỷ niệm lớp học',
        category
      );
      handleUpdateBlock(blockId, 'caption', generated);
      playCorrect();
    } catch (e) {
      console.error('Lỗi sinh caption AI:', e);
    }
  };

  // Trợ lý AI tạo đoạn văn nhật ký
  const handleAiGenerateParagraph = async () => {
    if (!aiKeywords.trim() && !title.trim()) {
      alert('Vui lòng nhập vài từ khóa hoặc tiêu đề bài viết để AI có dữ liệu sáng tác!');
      return;
    }

    setIsGeneratingAi(true);
    try {
      const resultText = await generateJournalParagraph(
        title || 'Khoảnh khắc kỷ niệm lớp học',
        aiKeywords,
        category
      );

      if (resultText) {
        setBlocks((prev) => [
          ...prev,
          {
            id: `blk_ai_${Date.now()}`,
            type: 'paragraph',
            text: resultText,
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

  // Lưu & Xuất bản bài viết (BẢO VỆ CHỐNG TRÀN BỘ NHỚ VÀ TỰ ĐỘNG NÉN ĐA CẤP ĐỘ)
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Tự động tìm tên lớp được chọn để đặt tiêu đề thông minh nếu Thầy chưa nhập
      const selectedClassObj = availableClasses.find((c) => c.id === targetClassId);
      const classNameText = selectedClassObj?.name ? `Lớp ${selectedClassObj.name}` : 'Lớp Học';
      const safeTitle = title.trim() || `Khoảnh khắc ${category} - ${classNameText}`;

      // Tự động fallback ảnh bìa thông minh nếu Thầy chưa chọn ảnh
      let baseCover = coverImage;
      if (!baseCover) {
        const firstImgBlock = blocks.find((b) => b.type === 'image' && b.url);
        if (firstImgBlock) {
          baseCover = firstImgBlock.url;
        } else {
          baseCover = PRESET_COVERS[0].url;
        }
      }

      // Đảm bảo luôn có ít nhất 1 khối nội dung
      let rawBlocks = blocks.filter(
        (b) => (b.type === 'paragraph' && b.text?.trim()) || (b.type === 'image' && b.url)
      );
      if (rawBlocks.length === 0) {
        rawBlocks = [
          {
            id: `blk_${Date.now()}`,
            type: 'paragraph',
            text: `Ghi lại khoảnh khắc hoạt động ${category.toLowerCase()} đáng nhớ cùng tập thể ${classNameText}.`,
          },
        ];
      }

      // Vòng lặp nén thích ứng đa cấp độ (Cấp 1 -> Cấp 2 -> Cấp 3) để chống tràn bộ nhớ trình duyệt
      let saveSuccess = false;
      let lastError = null;

      for (let stage = 1; stage <= 3; stage++) {
        try {
          if (stage > 1) {
            setErrorMessage(`Bộ nhớ trình duyệt gần đầy, đang tự động nén sâu ảnh để hoàn tất xuất bản (Cấp ${stage})...`);
          }

          // Nén ảnh bìa theo cấp độ
          let processedCover = baseCover;
          if (processedCover && processedCover.startsWith('data:image')) {
            processedCover = await compressDataUrlMultiStage(processedCover, stage);
          }

          // Nén các ảnh trong khối nội dung theo cấp độ
          const processedBlocks = await Promise.all(
            rawBlocks.map(async (blk) => {
              if (blk.type === 'image' && blk.url?.startsWith('data:image')) {
                const compressedUrl = await compressDataUrlMultiStage(blk.url, stage);
                return { ...blk, url: compressedUrl };
              }
              return blk;
            })
          );

          const payload = {
            ...(initialData || {}),
            classId: targetClassId || classId || 'class_7a',
            title: safeTitle,
            category,
            eventDate: eventDate || new Date().toISOString().split('T')[0],
            coverImage: processedCover,
            blocks: processedBlocks,
            isPinned: Boolean(isPinned),
          };

          // Thử xuất bản bài viết
          onSave(payload);
          saveSuccess = true;
          break; // Lưu thành công thì dừng vòng lặp ngay
        } catch (attemptErr) {
          lastError = attemptErr;
          console.warn(`Lưu khoảnh khắc thất bại ở cấp nén ${stage}:`, attemptErr);
        }
      }

      if (saveSuccess) {
        setErrorMessage('');
        playCorrect();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
        onClose();
      } else {
        console.error('Không thể lưu khoảnh khắc sau 3 cấp độ nén:', lastError);
        setErrorMessage(
          'Không thể lưu do bộ nhớ trình duyệt (LocalStorage) đã bị đầy bởi các dữ liệu khác. Thầy hãy thử xóa bớt các bài cũ hoặc dọn dẹp bộ nhớ tạm nhé!'
        );
      }
    } catch (err) {
      console.error('Lỗi khi xuất bản khoảnh khắc:', err);
      setErrorMessage('Đã xảy ra lỗi khi lưu bài viết. Thầy vui lòng thử lại nhé!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto pt-16 sm:pt-8 pb-10">
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
              {/* THÔNG TIN CƠ BẢN (Tiêu đề, Lớp học, Danh mục, Ngày sự kiện) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {/* Tiêu đề sự kiện */}
                <div className="md:col-span-4 space-y-1">
                  <label className="text-xs font-black text-slate-700 uppercase flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-purple-600" />
                    Tiêu Đề Khoảnh Khắc / Sự Kiện:
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Giờ học dự án Speaking sôi nổi, Hoạt động trải nghiệm..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {/* Chọn Lớp Học / Khối Lớp */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    Lớp Học:
                  </label>
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border-2 border-purple-300 rounded-xl text-xs font-black text-purple-950 outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-2xs"
                  >
                    {availableClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏛️ Lớp {c.name} • Khối {c.grade_level}
                      </option>
                    ))}
                    <option value="all_classes">🌐 Toàn trường (Chung)</option>
                  </select>
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
                    className="w-full py-2 px-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>✨ AI Viết Đoạn Văn</span>
                  </button>
                </div>

                {/* Tùy chọn ghim bài viết lên FRAME #01 Trang Chủ */}
                <div className="md:col-span-4 pt-1">
                  <label className="flex items-center space-x-2.5 p-2.5 rounded-xl border border-amber-300/80 bg-amber-50/80 hover:bg-amber-100/90 transition cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer accent-amber-600"
                    />
                    <div className="flex items-center space-x-1.5 text-xs font-black text-amber-950">
                      <Pin className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-600 fill-amber-600' : 'text-slate-500'}`} />
                      <span>📌 Ghim bài viết này lên FRAME #01 (Tiêu điểm Trang Chủ)</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* KHU VỰC CHỌN ẢNH BÌA */}
              <div className="space-y-3 bg-purple-50/50 p-4 rounded-2xl border border-purple-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-black text-purple-950 uppercase flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    Ảnh Bìa Đại Diện (Tỷ lệ 16:9):
                  </label>

                  {/* Nút chuyển đổi chế độ */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-purple-200">
                    <button
                      type="button"
                      onClick={() => setCoverSourceType('drive')}
                      className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        coverSourceType === 'drive'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-blue-600'
                      }`}
                    >
                      <span>☁️ Dán Link Google Drive / Web</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverSourceType('upload')}
                      className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                        coverSourceType === 'upload'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-purple-600'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      <span>Tải Từ Máy Tính</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3.5 items-start">
                  {coverImage ? (
                    <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden border-2 border-purple-300 shadow-sm shrink-0 bg-slate-900">
                      <SafeFilmImage
                        src={coverImage}
                        alt="Ảnh bìa"
                        showWarningIfDriveError={true}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-700 cursor-pointer"
                        title="Xóa ảnh bìa"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full sm:w-52 aspect-video rounded-xl border-2 border-dashed border-purple-300 flex flex-col items-center justify-center text-purple-400 bg-white shrink-0">
                      <ImageIcon className="w-7 h-7" />
                      <span className="text-[11px] font-bold mt-1.5">Chưa có ảnh bìa</span>
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2.5">
                    {coverSourceType === 'drive' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Dán đường link Google Drive (chia sẻ bất kỳ ai) hoặc link ảnh web..."
                            value={coverImage.startsWith('data:') ? '' : coverImage}
                            onChange={(e) => {
                              const val = e.target.value;
                              const directUrl = formatDirectImageUrl(val);
                              setCoverImage(directUrl);
                            }}
                            className="w-full px-3.5 py-2.5 bg-white border-2 border-blue-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                          />
                        </div>

                        {coverImage && isGoogleDriveUrl(coverImage) && (
                          <div className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1.5">
                            <span>✅</span>
                            <span>Đã nhận diện link Google Drive - Ảnh tải trực tiếp không tốn 1 byte dung lượng máy!</span>
                          </div>
                        )}

                        {/* Hướng dẫn lấy link Google Drive */}
                        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 space-y-1">
                          <div className="font-extrabold flex items-center gap-1 text-blue-900">
                            <span>💡</span> Cách lấy link ảnh Google Drive nhanh nhất:
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            1. Mở ảnh trên <b>Google Drive</b> &gt; Bấm nút <b>Chia sẻ (Share)</b>.<br/>
                            2. Chuyển quyền truy cập chung thành <b>"Bất kỳ ai có đường liên kết" (Anyone with link)</b>.<br/>
                            3. Bấm <b>Sao chép đường liên kết (Copy link)</b> và dán vào ô trên là ảnh sẽ hiển thị ngay!
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-sm active:scale-95 transition-all">
                          <Upload className="w-4 h-4" />
                          <span>Chọn tệp ảnh từ máy tính (Tự động nén siêu nhẹ)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-[11px] text-slate-500 italic">
                          Hệ thống sẽ tự động nén kích thước chuẩn Web để bảo vệ bộ nhớ trình duyệt.
                        </p>
                      </div>
                    )}

                    {/* Gợi ý chọn nhanh ảnh bìa mẫu học đường đẹp */}
                    <div className="pt-2 border-t border-purple-200/60">
                      <span className="text-[11px] font-extrabold text-purple-900 block mb-1.5 flex items-center gap-1">
                        <span>⚡</span> Hoặc chọn nhanh ảnh bìa học đường có sẵn (1-Click):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {PRESET_COVERS.map((cov, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => setCoverImage(cov.url)}
                            className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border truncate text-left transition cursor-pointer shadow-2xs ${
                              coverImage === cov.url
                                ? 'bg-purple-600 text-white border-purple-700 ring-2 ring-purple-300'
                                : 'bg-white hover:bg-purple-100 text-purple-900 border-purple-200'
                            }`}
                            title={cov.label}
                          >
                            🖼️ {cov.label}
                          </button>
                        ))}
                      </div>
                    </div>
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
                                <SafeFilmImage
                                  src={block.url}
                                  alt="Ảnh hoạt động"
                                  showWarningIfDriveError={true}
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
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Dán link Google Drive (chia sẻ bất kỳ ai) hoặc link ảnh web..."
                                  value={block.url?.startsWith('data:') ? '' : (block.url || '')}
                                  onChange={(e) => {
                                    const formatted = formatDirectImageUrl(e.target.value);
                                    updateBlock(block.id, { url: formatted });
                                  }}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                                />
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs cursor-pointer transition">
                                  <Upload className="w-3.5 h-3.5" />
                                  <span>Tải ảnh từ máy tính</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleBlockImageUpload(block.id, e)}
                                    className="hidden"
                                  />
                                </label>

                                {block.url && isGoogleDriveUrl(block.url) && (
                                  <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                                    <span>☁️</span> Google Drive trực tiếp (0 byte bộ nhớ)
                                  </span>
                                )}
                              </div>
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
                <SafeFilmImage
                  src={coverImage}
                  alt={title}
                  showWarningIfDriveError={true}
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
                        <SafeFilmImage
                          src={block.url}
                          alt={block.caption || 'Ảnh khoảnh khắc'}
                          showWarningIfDriveError={true}
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
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          {errorMessage && (
            <div className="mb-3 p-3 bg-rose-50 border-2 border-rose-300 text-rose-700 text-xs font-bold rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base shrink-0">⚠️</span>
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  cleanStorageForEmergency();
                  setErrorMessage('Đã dọn dẹp sạch cache và bài mẫu! Thầy bấm "LƯU & XUẤT BẢN KHOẢNH KHẮC" lại nhé!');
                }}
                className="shrink-0 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-black shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>⚡ Dọn Dẹp Bộ Nhớ Ngay</span>
              </button>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{initialData ? 'ĐANG CẬP NHẬT...' : 'ĐANG XUẤT BẢN...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{initialData ? 'CẬP NHẬT KHOẢNH KHẮC' : 'LƯU & XUẤT BẢN KHOẢNH KHẮC'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* MODAL TRỢ LÝ AI VIẾT ĐOẠN VĂN */}
        {isAiModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
