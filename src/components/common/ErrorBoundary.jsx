import React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] bg-white text-slate-900 rounded-3xl p-8 border border-slate-200 shadow-xl flex flex-col items-center justify-center text-center space-y-4 my-8 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl font-extrabold shadow-2xs">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
              KHÔNG TẢI ĐƯỢC DỮ LIỆU KHÓA HỌC / BÀI HỌC
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-1 max-w-md">
              Rất tiếc, đã xảy ra sự cố nạp dữ liệu từ hệ thống. Thầy hoặc Học sinh vui lòng thử tải lại trang hoặc quay lại danh sách khóa học!
            </p>
          </div>

          {this.state.error?.message && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-rose-600 font-mono max-w-md w-full truncate">
              {String(this.state.error.message)}
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tải Lại Trang Này</span>
            </button>

            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center space-x-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Về Trang Chủ Khóa Học</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
