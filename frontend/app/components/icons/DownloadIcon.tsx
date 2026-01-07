'use client';

import React from 'react';

interface DownloadIconProps {
  className?: string;
  size?: number;
}

/**
 * Ícone de download reutilizável
 */
export default function DownloadIcon({ className = 'w-5 h-5', size }: DownloadIconProps) {
  const style = size ? { width: size, height: size } : undefined;
  
  return (
    <svg
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}
