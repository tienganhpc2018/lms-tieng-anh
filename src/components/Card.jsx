import React from 'react';

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
