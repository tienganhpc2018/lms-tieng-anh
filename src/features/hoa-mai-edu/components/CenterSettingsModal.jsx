import React, { useState } from 'react';
import { Settings, Save, Download, Upload, RotateCcw, Building, CreditCard, X, Check } from 'lucide-react';
import { exportHoaMaiBackup, importHoaMaiBackup, resetHoaMaiToDefault } from '../hoaMaiStorage';

export default function CenterSettingsModal({
  isOpen,
  onClose,
  centerConfig,
  onSaveConfig,
  onReloadState
}) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    centerName: centerConfig?.centerName || 'TRUNG TÂM BỒI DƯỠNG VĂN HÓA HOA MAI',
    slogan: centerConfig?.slogan || 'Hoa Mai Education - Chắp cánh tương lai, Vươn tầm tri thức',
    hotline: centerConfig?.hotline || '0988.123.456',
    address: centerConfig?.address || 'Số 86 Đường Lê Lợi, TP. Bắc Giang',
    defaultPricePerSession: centerConfig?.defaultPricePerSession || 31250,
    bankId: centerConfig?.bankInfo?.bankId || 'MB',
    bankName: centerConfig?.bankInfo?.bankName || 'MBBank (Ngân hàng TMCP Quân đội)',
    accountNo: centerConfig?.bankInfo?.accountNo || '0988123456',
    accountName: centerConfig?.bankInfo?.accountName || 'NGUYEN VAN HAI'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      centerName: formData.centerName,
      slogan: formData.slogan,
      hotline: formData.hotline,
      address: formData.address,
      defaultPricePerSession: parseInt(formData.defaultPricePerSession, 10) || 31250,
      bankInfo: {
        bankId: formData.bankId,
        bankName: formData.bankName,
        accountNo: formData.accountNo,
        accountName: formData.accountName.toUpperCase(),
        template: 'compact2'
      }
    };
    onSaveConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importHoaMaiBackup(event.target.result);
      if (res.success) {
        alert('Đã khôi phục dữ liệu Hoa Mai Education thành công!');
        onReloadState();
        onClose();
      } else {
        alert('Lỗi: ' + res.error);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('Thầy có chắc chắn muốn khôi phục toàn bộ dữ liệu Hoa Mai Edu về cấu hình mẫu gốc 21 học sinh lớp 6A?')) {
      resetHoaMaiToDefault();
      onReloadState();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative my-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-black"
        >
          ✕
        </button>

        <h3 className="text-base font-black text-slate-900 flex items-center space-x-2 border-b border-slate-100 pb-3">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>Cài Đặt Trung Tâm & Cấu Hình Ngân Hàng VietQR</span>
        </h3>

        {savedSuccess && (
          <div className="my-3 p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold text-center">
            ✓ Đã lưu cài đặt trung tâm thành công!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs mt-4">
          <div className="space-y-3">
            <div className="font-black text-slate-700 flex items-center space-x-1 uppercase text-[11px]">
              <Building className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thông Tin Trung Tâm / Lớp Dạy Thêm</span>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên trung tâm / Lớp học:</label>
              <input
                type="text"
                required
                value={formData.centerName}
                onChange={(e) => setFormData({ ...formData, centerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Hotline liên hệ:</label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Đơn giá mặc định / buổi:</label>
                <input
                  type="number"
                  value={formData.defaultPricePerSession}
                  onChange={(e) => setFormData({ ...formData, defaultPricePerSession: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold text-emerald-800"
                  step="500"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Địa chỉ phòng học:</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="font-black text-slate-700 flex items-center space-x-1 uppercase text-[11px]">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              <span>Tài Khoản Ngân Hàng Nhận Học Phí (VietQR NAPAS 24/7)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Mã ngân hàng (NAPAS Bin):</label>
                <select
                  value={formData.bankId}
                  onChange={(e) => {
                    const id = e.target.value;
                    const names = {
                      MB: 'MBBank (Quân đội)',
                      VCB: 'Vietcombank',
                      TCB: 'Techcombank',
                      CTG: 'VietinBank',
                      BIDV: 'BIDV',
                      VPB: 'VPBank',
                      ACB: 'ACB',
                      TPB: 'TPBank'
                    };
                    setFormData({ ...formData, bankId: id, bankName: names[id] || id });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="MB">MBBank (Quân đội)</option>
                  <option value="VCB">Vietcombank</option>
                  <option value="TCB">Techcombank</option>
                  <option value="CTG">VietinBank</option>
                  <option value="BIDV">BIDV</option>
                  <option value="VPB">VPBank</option>
                  <option value="ACB">ACB</option>
                  <option value="TPB">TPBank</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Số tài khoản:</label>
                <input
                  type="text"
                  required
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  placeholder="0988123456"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Tên chủ tài khoản (Viết hoa không dấu):</label>
              <input
                type="text"
                required
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="NGUYEN VAN HAI"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-mono font-bold"
              />
            </div>
          </div>

          {/* SAO LƯU & DỰ PHÒNG */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={exportHoaMaiBackup}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất JSON</span>
            </button>

            <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center space-x-1 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Nạp JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center space-x-1"
              title="Đặt lại dữ liệu mẫu gốc"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Dữ Liệu</span>
            </button>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
            >
              Đóng
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 shadow-xs flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Cấu Hình</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
