'use client';

import React from 'react';

interface IconButtonProps {
  icon?: React.ReactNode;
  label?: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function IconButton({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  title,
  className = '',
  children,
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex flex-col items-center justify-center rounded-lg border-2 transition-all
        ${active
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-gray-200 hover:border-gray-300 text-gray-600'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children || (
        <>
          {icon}
          {label && <span className="text-xs mt-1">{label}</span>}
        </>
      )}
    </button>
  );
}
