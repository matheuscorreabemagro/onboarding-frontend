'use client';

import React from 'react';

interface CloseIconProps {
  className?: string;
  size?: number;
}

/**
 * Ícone de fechar (X) reutilizável
 * Substitui SVGs inline em modais e botões
 */
export default function CloseIcon({ className = 'w-5 h-5', size }: CloseIconProps) {
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
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}
