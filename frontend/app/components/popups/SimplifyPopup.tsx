'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import Overlay from '../ui/Overlay';
import type { PopupPosition } from '../../types';

type SimplifyLevel = 'low' | 'medium' | 'high';

interface SimplifyPopupProps {
  position: PopupPosition;
  onApply: (level: SimplifyLevel) => void;
  onClose: () => void;
}

export default function SimplifyPopup({ position, onApply, onClose }: SimplifyPopupProps) {
  const [level, setLevel] = useState<SimplifyLevel>('medium');

  const handleApply = () => {
    onApply(level);
    onClose();
  };

  return (
    <>
      <Overlay onClick={onClose} zIndex={40} />
      
      <div
        className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -100%) translateY(-10px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3">
          <p className="text-xs font-medium text-gray-700 mb-3">Nível de suavização</p>
          <div className="flex gap-2">
            <IconButton
              onClick={() => setLevel('low')}
              active={level === 'low'}
              title="Baixo"
              className="w-20 h-20"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12 L12 8 L17 12 L12 16 Z" />
              </svg>
              <span className="text-xs mt-1 font-medium">Baixo</span>
            </IconButton>
            
            <IconButton
              onClick={() => setLevel('medium')}
              active={level === 'medium'}
              title="Médio"
              className="w-20 h-20"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12 Q9 8, 12 12 T19 12" />
              </svg>
              <span className="text-xs mt-1 font-medium">Médio</span>
            </IconButton>
            
            <IconButton
              onClick={() => setLevel('high')}
              active={level === 'high'}
              title="Alto"
              className="w-20 h-20"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12 Q6 6, 12 12 T21 12" />
              </svg>
              <span className="text-xs mt-1 font-medium">Alto</span>
            </IconButton>
          </div>
          
          <div className="mt-3 text-xs text-gray-600 text-center">
            {level === 'low' && 'Suavização leve, mantém mais detalhes'}
            {level === 'medium' && 'Suavização moderada, balanceada'}
            {level === 'high' && 'Suavização forte, remove mais vértices'}
          </div>
          
          <Button
            onClick={handleApply}
            variant="primary"
            className="w-full mt-3"
          >
            Aplicar
          </Button>
        </div>
      </div>
    </>
  );
}
