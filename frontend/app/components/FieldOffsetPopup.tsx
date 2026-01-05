'use client';

import React, { useState } from 'react';
import type { PopupPosition } from '../types';

type OffsetDirection = 'left' | 'right' | 'both';

interface FieldOffsetPopupProps {
  position: PopupPosition;
  onApply: (config: { direction: OffsetDirection; distance: number; count: number }) => void;
  onClose: () => void;
}

export default function FieldOffsetPopup({ position, onApply, onClose }: FieldOffsetPopupProps) {
  const [direction, setDirection] = useState<OffsetDirection>('both');
  const [distance, setDistance] = useState<number>(0.5);
  const [count, setCount] = useState<number>(10);
  const [showDetails, setShowDetails] = useState(false);

  const handleApply = () => {
    onApply({ direction, distance, count });
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
        {!showDetails ? (
          // Etapa 1: Seleção de direção
          <div className="p-3">
            <p className="text-xs font-medium text-gray-700 mb-3">Direção das linhas paralelas</p>
            <div className="flex gap-2">
              <button
                onClick={() => setDirection('left')}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${
                  direction === 'left'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
                title="Esquerda"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-xs mt-1">Esq</span>
              </button>
              
              <button
                onClick={() => setDirection('both')}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${
                  direction === 'both'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
                title="Ambos os lados"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span className="text-xs mt-1">Ambos</span>
              </button>
              
              <button
                onClick={() => setDirection('right')}
                className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border-2 transition-all ${
                  direction === 'right'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
                title="Direita"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-xs mt-1">Dir</span>
              </button>
            </div>
            
            <button
              onClick={() => setShowDetails(true)}
              className="w-full mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Continuar
            </button>
          </div>
        ) : (
          // Etapa 2: Configurações detalhadas
          <div className="p-3 w-64">
            <button
              onClick={() => setShowDetails(false)}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800 mb-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar
            </button>
            
            <div className="space-y-3">
              {/* Distância */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Distância (m)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={distance}
                  onChange={(e) => setDistance(parseFloat(e.target.value) || 0.5)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Quantidade */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Quantidade de linhas
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCount(Math.max(1, count - 1))}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-semibold text-gray-700"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setCount(Math.max(1, val));
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-center font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setCount(count + 1)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-semibold text-gray-700"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Presets */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => { setDistance(0.45); setCount(10); }}
                    className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700"
                  >
                    Soja
                  </button>
                  <button
                    onClick={() => { setDistance(0.5); setCount(10); }}
                    className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700"
                  >
                    Milho
                  </button>
                  <button
                    onClick={() => { setDistance(0.9); setCount(10); }}
                    className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700"
                  >
                    Cana
                  </button>
                </div>
              </div>
              
              {/* Resumo */}
              <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Direção:</span>
                  <span className="font-semibold">
                    {direction === 'left' ? 'Esquerda' : direction === 'right' ? 'Direita' : 'Ambos'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-semibold">{direction === 'both' ? count * 2 : count} linhas</span>
                </div>
                <div className="flex justify-between">
                  <span>Largura:</span>
                  <span className="font-semibold">{(distance * count * (direction === 'both' ? 2 : 1)).toFixed(1)}m</span>
                </div>
              </div>
              
              <button
                onClick={handleApply}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
