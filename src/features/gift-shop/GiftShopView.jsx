import React, { useState, useEffect } from 'react';
import {
  Gift,
  Coins,
  Sparkles,
  Plus,
  QrCode,
  Flame,
  RotateCw,
  Package,
  PiggyBank,
  History,
  Tv,
  Store,
  Layers,
  Search,
  Filter,
  Trash2,
  Edit,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  Users,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  playClick,
  playWinner,
  playUndoRestore,
  playCorrect,
} from '../../utils/soundEffects';
import {
  loadClasses,
  loadSelectedClassId,
  saveSelectedClassId,
  loadStudents,
} from '../behavior/behaviorStorage';
import {
  loadGifts,
  saveGifts,
  seedDefaultGifts,
  loadRedemptions,
  loadFlashSaleConfig,
  loadPiggyBank,
} from './giftShopStorage';

// Import Components & Modals
import GiftIconRenderer from './components/GiftIconRenderer';
import GiftShopLeaderboard from './components/GiftShopLeaderboard';
import RedemptionHistoryTable from './components/RedemptionHistoryTable';
import AddEditGiftModal from './modals/AddEditGiftModal';
import RedeemGiftModal from './modals/RedeemGiftModal';
import GiftVoucherModal from './modals/GiftVoucherModal';
import BatchVoucherModal from './modals/BatchVoucherModal';
import VoucherScannerModal from './modals/VoucherScannerModal';
import GiftLuckyWheelModal from './modals/GiftLuckyWheelModal';
import MysteryBoxModal from './modals/MysteryBoxModal';
import PiggyBankModal from './modals/PiggyBankModal';
import FlashSaleModal from './modals/FlashSaleModal';

export default function GiftShopView() {
  // 1. Quản lý lớp & học sinh
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [students, setStudents] = useState([]);

  // 2. Dữ liệu cửa hàng
  const [gifts, setGifts] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [flashSale, setFlashSale] = useState(null);

  // 3. Bộ lọc & tìm kiếm
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all' | 'in_stock' | 'out_of_stock'

  // 4. Chế độ Kiosk / Trình chiếu máy chiếu
  const [isKioskMode, setIsKioskMode] = useState(false);

  // 5. State các Modal
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState(null);

  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [selectedGiftForRedeem, setSelectedGiftForRedeem] = useState(null);

  const [singleVoucherModalData, setSingleVoucherModalData] = useState(null);
  const [batchVouchersData, setBatchVouchersData] = useState(null);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

  const [isLuckyWheelOpen, setIsLuckyWheelOpen] = useState(false);
  const [isMysteryBoxOpen, setIsMysteryBoxOpen] = useState(false);
  const [isPiggyBankOpen, setIsPiggyBankOpen] = useState(false);
  const [isFlashSaleOpen, setIsFlashSaleOpen] = useState(false);

  // Nạp dữ liệu ban đầu
  useEffect(() => {
    const loadedClasses = loadClasses();
    setClasses(loadedClasses);

    let currentClassId = loadSelectedClassId();
    if (!currentClassId && loadedClasses.length > 0) {
      currentClassId = loadedClasses[0].id;
      saveSelectedClassId(currentClassId);
    }
    setSelectedClassId(currentClassId);
  }, []);

  // Khi selectedClassId thay đổi: nạp học sinh, quà, lịch sử
  useEffect(() => {
    if (selectedClassId) {
      refreshData();
    } else {
      setStudents([]);
      setGifts([]);
      setRedemptions([]);
      setFlashSale(null);
    }
  }, [selectedClassId]);

  // Lắng nghe phím ESC để thoát Kiosk mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isKioskMode) {
        setIsKioskMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isKioskMode]);

  // Hàm tải lại toàn bộ dữ liệu của lớp
  const refreshData = () => {
    if (!selectedClassId) return;
    const stds = loadStudents(selectedClassId);
    setStudents(stds);

    const gfts = loadGifts(selectedClassId);
    setGifts(gfts);

    const redms = loadRedemptions(selectedClassId);
    setRedemptions(redms);

    const fs = loadFlashSaleConfig(selectedClassId);
    setFlashSale(fs);
  };

  // Đổi lớp
  const handleSelectClass = (cId) => {
    playClick();
    setSelectedClassId(cId);
    saveSelectedClassId(cId);
  };

  // Nạp 6 quà mẫu ban đầu
  const handleSeedDefaults = () => {
    if (!selectedClassId) return;
    const seeded = seedDefaultGifts(selectedClassId);
    setGifts(seeded);
    playWinner();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Thêm mới hoặc Sửa quà
  const handleSaveGift = (giftData) => {
    let updated;
    if (editingGift) {
      updated = gifts.map((g) => (g.id === giftData.id ? giftData : g));
    } else {
      updated = [giftData, ...gifts];
    }
    saveGifts(selectedClassId, updated);
    setGifts(updated);
    setEditingGift(null);
    setIsAddEditModalOpen(false);
    playCorrect();
  };

  // Xóa phần quà
  const handleDeleteGift = (giftId) => {
    if (window.confirm('Thầy/Cô có chắc chắn muốn xóa phần quà này khỏi danh sách?')) {
      const updated = gifts.filter((g) => g.id !== giftId);
      saveGifts(selectedClassId, updated);
      setGifts(updated);
      playUndoRestore();
    }
  };

  // Mở modal đổi quà
  const handleOpenRedeem = (gift) => {
    playClick();
    setSelectedGiftForRedeem(gift);
    setIsRedeemModalOpen(true);
  };

  // Tính giá sau khi áp dụng Flash Sale (nếu có)
  const getGiftPrice = (gift) => {
    if (!flashSale || !flashSale.endsAt) return gift.requiredCoins;
    if (flashSale.category !== 'all' && flashSale.category !== gift.category) {
      return gift.requiredCoins;
    }
    const discount = (gift.requiredCoins * flashSale.discountPercent) / 100;
    return Math.max(1, Math.round(gift.requiredCoins - discount));
  };

  // Lọc danh sách quà tặng
  const filteredGifts = gifts.filter((g) => {
    const matchesSearch = (g.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter;
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && (g.stock > 0)) ||
      (stockFilter === 'out_of_stock' && (g.stock <= 0));

    return matchesSearch && matchesCategory && matchesStock;
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  // Màu viền và nền quà
  const getGiftCardStyles = (color) => {
    switch (color) {
      case 'amber':
        return 'border-amber-300 bg-gradient-to-b from-amber-50/60 to-white shadow-amber-500/10 hover:border-amber-400';
      case 'sky':
        return 'border-sky-300 bg-gradient-to-b from-sky-50/60 to-white shadow-sky-500/10 hover:border-sky-400';
      case 'emerald':
        return 'border-emerald-300 bg-gradient-to-b from-emerald-50/60 to-white shadow-emerald-500/10 hover:border-emerald-400';
      case 'rose':
        return 'border-rose-300 bg-gradient-to-b from-rose-50/60 to-white shadow-rose-500/10 hover:border-rose-400';
      case 'purple':
        return 'border-purple-300 bg-gradient-to-b from-purple-50/60 to-white shadow-purple-500/10 hover:border-purple-400';
      case 'indigo':
      default:
        return 'border-indigo-300 bg-gradient-to-b from-indigo-50/60 to-white shadow-indigo-500/10 hover:border-indigo-400';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 transition-all ${isKioskMode ? 'p-6 bg-slate-900 text-white' : 'p-4 sm:p-6 lg:p-8'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* NGUYÊN TẮC BẮT BUỘC: NẾU CHƯA CÓ LỚP HỌC NÀO (CLEAN SLATE) */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border-4 border-dashed border-amber-300 shadow-xl text-center space-y-5 max-w-2xl mx-auto my-12">
            <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center text-4xl mx-auto shadow-inner">
              🏪
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-800">
                Chưa Có Lớp Học Nào Được Khởi Tạo!
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                Cửa hàng đổi quà hoạt động liên kết trực tiếp với dữ liệu học sinh và ví xu thi đua từ{' '}
                <strong>Sổ Nề Nếp 4.0</strong>. Hãy khởi tạo lớp học đầu tiên của Thầy/Cô để kích hoạt nhé!
              </p>
            </div>
            <a
              href="/behavior"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all"
            >
              <Users className="w-4 h-4" />
              + ĐẾN TRANG SỔ NỀ NẾP TẠO LỚP NGAY
            </a>
          </div>
        ) : (
          <>
            {/* 1. THANH TIÊU ĐỀ & CHỌN LỚP HỌC (Header Bar) */}
            <div className={`rounded-3xl p-5 sm:p-6 shadow-xl border-2 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
              isKioskMode
                ? 'bg-slate-800/90 border-slate-700 text-white'
                : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 border-amber-300 text-white'
            }`}>
              {/* Tiêu đề & Logo */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 shrink-0">
                  🎁
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
                      CỬA HÀNG ĐỔI QUÀ THI ĐUA 4.0
                    </h1>
                    {isKioskMode && (
                      <span className="text-xs bg-yellow-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Chế Độ Kiosk
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-100 font-medium mt-0.5">
                    Tích lũy xu ngoan - Khám phá kho quà & minigame lớp học sôi nổi
                  </p>
                </div>
              </div>

              {/* Bộ chọn lớp & Tiện ích */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Dropdown chọn lớp */}
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/30">
                  <Users className="w-4 h-4 text-amber-200" />
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => handleSelectClass(e.target.value)}
                    className="bg-transparent text-white font-black text-sm outline-none cursor-pointer pr-2"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id} className="text-slate-900 font-bold">
                        {cls.name} ({students.length} học sinh)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nút Chế độ Kiosk Máy chiếu */}
                <button
                  onClick={() => {
                    playClick();
                    setIsKioskMode(!isKioskMode);
                  }}
                  title={isKioskMode ? 'Thoát Kiosk (Esc)' : 'Bật chế độ máy chiếu Kiosk'}
                  className={`px-3.5 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                    isKioskMode
                      ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300'
                      : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                  }`}
                >
                  <Tv className="w-4 h-4" />
                  {isKioskMode ? 'Thoát Kiosk' : 'Máy Chiếu Kiosk'}
                </button>

                {/* Nút Quét mã voucher nhanh */}
                <button
                  onClick={() => {
                    playClick();
                    setIsScannerModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-amber-200" />
                  Tra Cứu Voucher
                </button>

                {/* Nút Thêm Quà Mới (chỉ hiện khi không ở Kiosk) */}
                {!isKioskMode && (
                  <button
                    onClick={() => {
                      playClick();
                      setEditingGift(null);
                      setIsAddEditModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-2xl bg-white text-orange-600 hover:bg-amber-50 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    + Thêm Quà Mới
                  </button>
                )}
              </div>
            </div>

            {/* 2. THANH TAB MINIGAME & ĐỔI QUÀ PHONG CÁCH HOẠT HÌNH THÂN THIỆN */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
              {/* 2 Tab chính */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    playClick();
                    setActiveTab('shop');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
                    activeTab === 'shop'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  CỬA HÀNG QUÀ ({gifts.length})
                </button>
                <button
                  onClick={() => {
                    playClick();
                    setActiveTab('history');
                  }}
                  className={`px-4 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all ${
                    activeTab === 'history'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  NHẬT KÝ ĐỔI QUÀ ({redemptions.length})
                </button>
              </div>

              {/* Các nút minigame rộn ràng */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Vòng quay may mắn */}
                <button
                  onClick={() => {
                    playClick();
                    setIsLuckyWheelOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  🎡 Vòng Quay 5 Xu
                </button>

                {/* Rương báu ma thuật */}
                <button
                  onClick={() => {
                    playClick();
                    setIsMysteryBoxOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <Package className="w-3.5 h-3.5" />
                  📦 Rương Gacha 15 Xu
                </button>

                {/* Heo đất tiết kiệm */}
                <button
                  onClick={() => {
                    playClick();
                    setIsPiggyBankOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                >
                  <PiggyBank className="w-3.5 h-3.5" />
                  🐷 Heo Đất (+5%/Tuần)
                </button>

                {/* Giờ Vàng Flash Sale */}
                <button
                  onClick={() => {
                    playClick();
                    setIsFlashSaleOpen(true);
                  }}
                  className={`px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all ${
                    flashSale
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-yellow-400" />
                  {flashSale ? `⚡ Giảm -${flashSale.discountPercent}%` : '⚡ Giờ Vàng'}
                </button>
              </div>
            </div>

            {/* 3. BANNER GIỜ VÀNG FLASH SALE (NẾU ĐANG DIỄN RA) */}
            {flashSale && (
              <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 rounded-3xl p-4 sm:p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-yellow-300 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/30 animate-bounce">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-yellow-300 flex items-center gap-2">
                      SỰ KIỆN GIỜ VÀNG FLASH SALE ĐANG DIỄN RA!
                    </h3>
                    <p className="text-xs text-rose-100 font-semibold">
                      Tất cả phần quà được giảm ngay <strong>-{flashSale.discountPercent}% giá xu</strong>! Nhanh tay đổi ngay!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFlashSaleOpen(true)}
                  className="px-4 py-2 bg-yellow-400 text-red-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md hover:bg-yellow-300 active:scale-95 transition-all shrink-0"
                >
                  Xem Đồng Hồ Đếm Ngược
                </button>
              </div>
            )}

            {/* NỘI DUNG CHÍNH THEO TAB */}
            {activeTab === 'history' ? (
              /* TAB NHẬT KÝ ĐỔI QUÀ */
              <RedemptionHistoryTable
                classId={selectedClassId}
                redemptions={redemptions}
                onRedemptionsChanged={(updated) => {
                  setRedemptions(updated);
                  refreshData();
                }}
                onOpenSingleVoucher={(vItem) => setSingleVoucherModalData(vItem)}
                onOpenBatchVouchers={(items) => setBatchVouchersData(items)}
                onOpenScanner={() => setIsScannerModalOpen(true)}
              />
            ) : (
              /* TAB CỬA HÀNG QUÀ TẶNG */
              <div className="space-y-6">
                {/* Thanh tìm kiếm & Bộ lọc danh mục */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Ô tìm kiếm */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm quà: Bút, thước kẻ, sổ tay, gấu bông..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  {/* Lọc danh mục */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'stationery', label: '✏️ Dụng cụ học tập' },
                      { id: 'souvenir', label: '🧸 Lưu niệm & Đồ chơi' },
                      { id: 'privilege', label: '🎫 Đặc quyền lớp học' },
                      { id: 'other', label: '🍭 Bánh kẹo & Khác' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          playClick();
                          setCategoryFilter(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          categoryFilter === cat.id
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NẾU LỚP CHƯA CÓ QUÀ: NÚT NẠP NHANH 6 QUÀ MẪU */}
                {gifts.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 border-2 border-dashed border-amber-300 text-center space-y-4 max-w-xl mx-auto my-8">
                    <div className="text-5xl">🎁</div>
                    <h3 className="text-xl font-black text-slate-800">
                      Cửa Hàng Chưa Có Quà Nào!
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                      Thầy/Cô có thể tự thêm phần quà tùy ý, hoặc bấm nút nạp nhanh 6 phần quà mẫu chuẩn theo chương trình thi đua học tập.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <button
                        onClick={handleSeedDefaults}
                        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md shadow-orange-500/30 hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        + NẠP NHANH 6 QUÀ MẪU BAN ĐẦU
                      </button>
                      <button
                        onClick={() => {
                          setEditingGift(null);
                          setIsAddEditModalOpen(true);
                        }}
                        className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
                      >
                        + Tự Thêm Quà Tùy Ý
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LƯỚI THẺ QUÀ TẶNG (GIFT CARDS GRID) - CHUẨN THEO ẢNH 2 THẦY GỬI */
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {filteredGifts.map((gift) => {
                      const finalPrice = getGiftPrice(gift);
                      const isSale = finalPrice < gift.requiredCoins;
                      const isOutOfStock = (gift.stock || 0) <= 0;

                      return (
                        <div
                          key={gift.id}
                          className={`rounded-3xl border-4 p-5 flex flex-col justify-between transition-all duration-200 relative group overflow-hidden ${getGiftCardStyles(
                            gift.color
                          )} ${isOutOfStock ? 'opacity-75 grayscale-[20%]' : 'hover:-translate-y-1 hover:shadow-xl'}`}
                        >
                          {/* Nhãn Sale / Hết hàng trên góc */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 text-slate-600">
                              {gift.category === 'stationery'
                                ? 'Dụng cụ'
                                : gift.category === 'souvenir'
                                ? 'Lưu niệm'
                                : gift.category === 'privilege'
                                ? 'Đặc quyền'
                                : 'Khác'}
                            </span>

                            {isOutOfStock ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                                Hết hàng
                              </span>
                            ) : isSale ? (
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse">
                                Sale -{flashSale.discountPercent}%
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-500">
                                Còn: <strong className="text-slate-800">{gift.stock}</strong>
                              </span>
                            )}
                          </div>

                          {/* Icon Quà tặng vẽ bằng SVG siêu nét */}
                          <div className="py-4 flex items-center justify-center">
                            <GiftIconRenderer iconKey={gift.iconKey} className="w-24 h-24 drop-shadow-md" />
                          </div>

                          {/* Tên Quà Tặng */}
                          <div className="space-y-1 text-center my-2">
                            <h3 className="font-black text-base text-slate-900 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors">
                              {gift.name}
                            </h3>
                            {gift.redemptionLimit && gift.redemptionLimit !== 'none' && (
                              <p className="text-[10px] text-slate-500">
                                {gift.redemptionLimit === 'day'
                                  ? 'Tối đa 1 lần/ngày'
                                  : 'Tối đa 1 lần/tuần'}
                              </p>
                            )}
                          </div>

                          {/* Giá Xu & Nút Đổi Quà */}
                          <div className="space-y-3 pt-3 border-t border-slate-200/60 mt-auto">
                            {/* Giá xu */}
                            <div className="flex items-center justify-center gap-1.5">
                              {isSale && (
                                <span className="text-xs text-slate-400 line-through font-bold">
                                  {gift.requiredCoins}
                                </span>
                              )}
                              <span className="text-xl font-black text-amber-600 flex items-center gap-1">
                                <Coins className="w-5 h-5 text-amber-500" />
                                {finalPrice} <span className="text-xs font-bold text-slate-500">xu</span>
                              </span>
                            </div>

                            {/* Nút bấm đổi quà */}
                            <button
                              disabled={isOutOfStock}
                              onClick={() => handleOpenRedeem(gift)}
                              className={`w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                                isOutOfStock
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white shadow-orange-500/25 hover:brightness-110'
                              }`}
                            >
                              <Gift className="w-4 h-4" />
                              {isOutOfStock ? 'TẠM HẾT HÀNG' : 'ĐỔI QUÀ NGAY'}
                            </button>

                            {/* Các nút chỉnh sửa của Giáo viên (ẩn ở Kiosk mode) */}
                            {!isKioskMode && (
                              <div className="flex items-center justify-center gap-3 pt-1 text-slate-400">
                                <button
                                  onClick={() => {
                                    setEditingGift(gift);
                                    setIsAddEditModalOpen(true);
                                  }}
                                  className="text-[11px] font-bold hover:text-indigo-600 flex items-center gap-1"
                                >
                                  <Edit className="w-3 h-3" /> Sửa
                                </button>
                                <span className="text-slate-300">•</span>
                                <button
                                  onClick={() => handleDeleteGift(gift.id)}
                                  className="text-[11px] font-bold hover:text-rose-600 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" /> Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* BẢNG VINH DANH LEADERBOARD TOP 5 TÍCH XU & ĐỔI QUÀ */}
                <div className="pt-6">
                  <GiftShopLeaderboard
                    students={students}
                    redemptions={redemptions}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CÁC MODAL HỆ THỐNG */}
      {/* 1. Modal Thêm / Sửa quà */}
      {isAddEditModalOpen && (
        <AddEditGiftModal
          isOpen={isAddEditModalOpen}
          onClose={() => {
            setIsAddEditModalOpen(false);
            setEditingGift(null);
          }}
          gift={editingGift}
          onSave={handleSaveGift}
        />
      )}

      {/* 2. Modal Quy đổi quà */}
      {isRedeemModalOpen && selectedGiftForRedeem && (
        <RedeemGiftModal
          isOpen={isRedeemModalOpen}
          onClose={() => {
            setIsRedeemModalOpen(false);
            setSelectedGiftForRedeem(null);
          }}
          gift={{
            ...selectedGiftForRedeem,
            requiredCoins: getGiftPrice(selectedGiftForRedeem),
          }}
          classId={selectedClassId}
          students={students}
          onRedeemSuccess={(newRedemption) => {
            // Cập nhật tồn kho quà: stock - 1
            const updatedGifts = gifts.map((g) =>
              g.id === selectedGiftForRedeem.id
                ? { ...g, stock: Math.max(0, (g.stock || 0) - 1) }
                : g
            );
            saveGifts(selectedClassId, updatedGifts);
            setGifts(updatedGifts);

            // Mở trực tiếp Voucher A6 cho học sinh in ngay
            setSingleVoucherModalData(newRedemption);
            refreshData();
          }}
        />
      )}

      {/* 3. Modal In Voucher lẻ A6 */}
      {singleVoucherModalData && (
        <GiftVoucherModal
          isOpen={Boolean(singleVoucherModalData)}
          onClose={() => setSingleVoucherModalData(null)}
          voucherData={singleVoucherModalData}
          classNameTitle={selectedClass?.name || 'Lớp Học'}
        />
      )}

      {/* 4. Modal In Hàng Loạt Phiếu Voucher (A4 4-in-1) */}
      {batchVouchersData && (
        <BatchVoucherModal
          isOpen={Boolean(batchVouchersData)}
          onClose={() => setBatchVouchersData(null)}
          voucherList={batchVouchersData}
          classNameTitle={selectedClass?.name || 'Lớp Học'}
        />
      )}

      {/* 5. Modal Quét / Tra cứu Voucher */}
      {isScannerModalOpen && (
        <VoucherScannerModal
          isOpen={isScannerModalOpen}
          onClose={() => setIsScannerModalOpen(false)}
          classId={selectedClassId}
          onVoucherClaimed={() => refreshData()}
        />
      )}

      {/* 6. Modal Vòng quay may mắn 5 Xu */}
      {isLuckyWheelOpen && (
        <GiftLuckyWheelModal
          isOpen={isLuckyWheelOpen}
          onClose={() => setIsLuckyWheelOpen(false)}
          classId={selectedClassId}
          students={students}
          onRewardWon={() => refreshData()}
        />
      )}

      {/* 7. Modal Rương bí ẩn Gacha 15 Xu */}
      {isMysteryBoxOpen && (
        <MysteryBoxModal
          isOpen={isMysteryBoxOpen}
          onClose={() => setIsMysteryBoxOpen(false)}
          classId={selectedClassId}
          students={students}
          onRewardWon={() => refreshData()}
        />
      )}

      {/* 8. Modal Heo đất tiết kiệm (+5%/tuần) */}
      {isPiggyBankOpen && (
        <PiggyBankModal
          isOpen={isPiggyBankOpen}
          onClose={() => setIsPiggyBankOpen(false)}
          classId={selectedClassId}
          students={students}
          onDataChanged={() => refreshData()}
        />
      )}

      {/* 9. Modal Giờ Vàng Flash Sale */}
      {isFlashSaleOpen && (
        <FlashSaleModal
          isOpen={isFlashSaleOpen}
          onClose={() => setIsFlashSaleOpen(false)}
          classId={selectedClassId}
          onConfigChanged={() => refreshData()}
        />
      )}
    </div>
  );
}
