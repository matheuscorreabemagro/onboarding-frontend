'use client';

import React, { useState } from 'react';
import type { PopupPosition } from '../types';

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
      {/* Overlay invisível para fechar ao clicar fora */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Popup */}
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
            <button
              onClick={() => setLevel('low')}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all ${
                level === 'low'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              title="Baixo"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12 L12 8 L17 12 L12 16 Z" />
              </svg>
              <span className="text-xs mt-1 font-medium">Baixo</span>
            </button>
            
            <button
              onClick={() => setLevel('medium')}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all ${
                level === 'medium'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              title="Médio"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12 Q9 8, 12 12 T19 12" />
              </svg>
              <span className="text-xs mt-1 font-medium">Médio</span>
            </button>
            
            <button
              onClick={() => setLevel('high')}
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 transition-all ${
                level === 'high'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              }`}
              title="Alto"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12 Q6 6, 12 12 T21 12" />
              </svg>
              <span className="text-xs mt-1 font-medium">Alto</span>
            </button>
          </div>
          
          <div className="mt-3 text-xs text-gray-600 text-center">
            {level === 'low' && 'Suavização leve, mantém mais detalhes'}
            {level === 'medium' && 'Suavização moderada, balanceada'}
            {level === 'high' && 'Suavização forte, remove mais vértices'}
          </div>
          
          <button
            onClick={handleApply}
            className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
}
