import React from 'react';

export const Badge = ({ children, variant = 'brand', className = '' }) => {
  const variants = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/30',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const Card = ({ children, className = '', hoverable = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-2xl p-6 relative overflow-hidden ${
        hoverable ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
