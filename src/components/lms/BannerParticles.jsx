import React, { useMemo } from 'react';

/**
 * Hiệu ứng hạt rơi lễ hội (Festive Particle Effects):
 * - Tết Nguyên Đán: Hoa mai vàng, cánh đào rơi 🌸 🌼
 * - Tết Trung Thu: Lồng đèn, trăng sao lấp lánh 🏮 ⭐ ✨
 * - Giáng sinh / Mùa đông: Bông tuyết li ti ❄ ❅
 * - Khai giảng / Thi cử: Pháo giấy & Ngôi sao may mắn 🎉 ⭐
 */
export default function BannerParticles({ type = 'none' }) {
  if (!type || type === 'none') return null;

  const particles = useMemo(() => {
    let symbols = ['🌸', '🌼', '✨'];
    if (type === 'trung_thu') {
      symbols = ['🏮', '⭐', '✨', '🥮', '🌟'];
    } else if (type === 'snow') {
      symbols = ['❄', '❅', '✻', '·'];
    } else if (type === 'confetti' || type === 'khai_giang' || type === 'on_thi_hk') {
      symbols = ['🎉', '⭐', '✨', '🎈'];
    } else if (type === 'mai_dao' || type === 'tet_xuan') {
      symbols = ['🌸', '🌼', '🌺', '✨'];
    }

    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      symbol: symbols[i % symbols.length],
      left: `${(i * 7.2 + Math.random() * 5).toFixed(1)}%`,
      size: `${(10 + (i % 3) * 4)}px`,
      duration: `${(5 + (i % 4) * 2).toFixed(1)}s`,
      delay: `${((i * 0.4) % 4).toFixed(1)}s`,
      opacity: 0.6 + (i % 4) * 0.1,
    }));
  }, [type]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-15 select-none">
      <style>{`
        @keyframes festiveFall {
          0% {
            transform: translateY(-20px) rotate(0deg) translateX(0);
            opacity: 0;
          }
          20% {
            opacity: 0.85;
          }
          80% {
            opacity: 0.85;
          }
          100% {
            transform: translateY(260px) rotate(360deg) translateX(25px);
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute font-sans"
          style={{
            left: p.left,
            top: '-20px',
            fontSize: p.size,
            opacity: p.opacity,
            animation: `festiveFall ${p.duration} linear infinite`,
            animationDelay: p.delay,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
