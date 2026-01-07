'use client';

import React from 'react';

interface UploadIconProps {
  className?: string;
  size?: number;
}

/**
 * Ícone de upload reutilizável
 */
export default function UploadIcon({ className = 'w-5 h-5', size }: UploadIconProps) {
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
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}
