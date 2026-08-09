import React from 'react';
import { RefreshCw, BookOpen } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 glow-brand">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-100 mb-2">EduSmart AI - Tải Lại Trang</h2>
          <p className="text-xs text-slate-400 max-w-md mb-6">
            Ứng dụng cần làm mới bộ nhớ đệm để đồng bộ thông tin phiên làm việc mới nhất.
          </p>
          <button
            onClick={() => window.location.assign('/login')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Về Màn Hình Đăng Nhập
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
