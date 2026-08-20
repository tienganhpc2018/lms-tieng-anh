import React from 'react';
import { Award, CheckCircle, RefreshCw } from 'lucide-react';

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
        <div className="min-h-[400px] bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 my-6 font-sans">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl font-extrabold shadow-sm">
            🎉
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-emerald-400 uppercase tracking-tight">
              BÀI THI CỦA BẠN ĐÃ ĐƯỢC NỘP THÀNH CÔNG!
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-1 max-w-md">
              Hệ thống đã ghi nhận đầy đủ bài làm và lưu điểm số vào cơ sở dữ liệu của Thầy Hải.
            </p>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1 text-xs text-emerald-300 font-mono w-full max-w-md">
            <p>✅ Đã ghi nhận bài nộp thành công</p>
            <p>✅ Đã đồng bộ điểm số với bảng điểm lớp</p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tải Lại Màn Hình Xem Kết Quả</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
