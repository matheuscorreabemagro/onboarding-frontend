'use client';

import React from 'react';

interface OverlayProps {
  onClick?: () => void;
  zIndex?: number;
  blur?: boolean;
  className?: string;
}

/**
 * Componente de overlay reutilizável
 * Usado em modais, popups e dropdowns
 * Centraliza o comportamento de backdrop/overlay
 */
export default function Overlay({ 
  onClick, 
  zIndex = 40, 
  blur = false,
  className = '' 
}: OverlayProps) {
  return (
    <div
      className={`fixed inset-0 bg-black/50 ${blur ? 'backdrop-blur-sm' : ''} ${className}`}
      style={{ zIndex }}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
