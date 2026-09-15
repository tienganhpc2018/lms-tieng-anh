import React from 'react';

// BỘ KẾT XUẤT ICON SVG HOẠT HÌNH PHẦN QUÀ RỰC RỠ CHUẨN ẢNH 2
export default function GiftIconRenderer({ iconKey, color = 'amber', className = 'w-20 h-20' }) {
  switch (iconKey) {
    case 'highlighter':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Thân bút nghiêng 45 độ */}
          <g transform="rotate(-45 50 50)">
            <rect x="36" y="24" width="28" height="52" rx="8" fill="#4ade80" />
            <rect x="38" y="28" width="24" height="24" rx="4" fill="#22c55e" />
            {/* Đầu ngòi bút vát nhọn */}
            <polygon points="36,76 64,76 56,92 44,92" fill="#15803d" />
            <polygon points="44,92 56,92 50,98" fill="#166534" />
            {/* Nắp đuôi */}
            <rect x="42" y="16" width="16" height="8" rx="3" fill="#166534" />
          </g>
        </svg>
      );

    case 'notebook':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Bìa sổ tay lò xo */}
          <rect x="24" y="16" width="56" height="68" rx="8" fill="#6366f1" />
          <rect x="28" y="20" width="48" height="60" rx="6" fill="#4f46e5" />
          <rect x="34" y="28" width="16" height="20" rx="3" fill="#818cf8" />
          {/* Các vòng lò xo bên hông */}
          {[24, 36, 48, 60, 72].map((y, i) => (
            <ellipse key={i} cx="24" cy={y} rx="4" ry="2.5" fill="#e0e7ff" />
          ))}
        </svg>
      );

    case 'ruler':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Thước kẻ phản quang nghiêng 45 độ */}
          <g transform="rotate(-45 50 50)">
            <rect x="22" y="38" width="56" height="24" rx="4" fill="#cbd5e1" opacity="0.9" />
            <rect x="24" y="40" width="52" height="20" rx="3" fill="#94a3b8" />
            {/* Vạch chia độ */}
            {[28, 34, 40, 46, 52, 58, 64, 70].map((x, i) => (
              <line key={i} x1={x} y1="40" x2={x} y2={i % 2 === 0 ? "49" : "45"} stroke="#334155" strokeWidth="1.8" />
            ))}
          </g>
        </svg>
      );

    case 'bear':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Gấu bông mini đáng yêu */}
          {/* Tai */}
          <circle cx="34" cy="34" r="10" fill="#d97706" />
          <circle cx="34" cy="34" r="5" fill="#fef3c7" />
          <circle cx="66" cy="34" r="10" fill="#d97706" />
          <circle cx="66" cy="34" r="5" fill="#fef3c7" />
          {/* Thân & Tay */}
          <ellipse cx="50" cy="65" rx="20" ry="22" fill="#d97706" />
          <circle cx="50" cy="67" r="12" fill="#fef3c7" />
          {/* Đầu */}
          <circle cx="50" cy="45" r="19" fill="#d97706" />
          <ellipse cx="50" cy="49" rx="8" ry="6" fill="#fef3c7" />
          {/* Mắt & Mũi */}
          <circle cx="44" cy="43" r="2.5" fill="#451a03" />
          <circle cx="56" cy="43" r="2.5" fill="#451a03" />
          <ellipse cx="50" cy="48" rx="3" ry="2" fill="#78350f" />
        </svg>
      );

    case 'ticket':
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Thẻ bài đặc quyền miễn bài tập */}
          <rect x="18" y="26" width="64" height="48" rx="8" fill="#a855f7" />
          <rect x="22" y="30" width="56" height="40" rx="6" fill="#9333ea" />
          {/* Ngôi sao đặc quyền ở giữa */}
          <polygon points="50,36 53,44 62,44 55,49 57,57 50,52 43,57 45,49 38,44 47,44" fill="#fde047" />
          {/* Vết khuyết vé xem phim bên cạnh */}
          <circle cx="18" cy="50" r="5" fill="#f8fafc" />
          <circle cx="82" cy="50" r="5" fill="#f8fafc" />
        </svg>
      );

    case 'pen':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* Bút gel bấm kim loại */}
          <g transform="rotate(-45 50 50)">
            <rect x="42" y="16" width="16" height="62" rx="4" fill="#3b82f6" />
            <rect x="44" y="22" width="12" height="40" rx="2" fill="#2563eb" />
            <polygon points="42,78 58,78 50,94" fill="#64748b" />
            <circle cx="50" cy="94" r="1.5" fill="#0f172a" />
            <rect x="46" y="10" width="8" height="6" rx="2" fill="#94a3b8" />
          </g>
        </svg>
      );
  }
}
