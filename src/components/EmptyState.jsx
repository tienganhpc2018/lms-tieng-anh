import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = "Chưa có dữ liệu",
  description = "Hiện tại chưa có dữ liệu nào trong mục này.",
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-3xl border border-slate-800 my-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mb-4 glow-brand">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
