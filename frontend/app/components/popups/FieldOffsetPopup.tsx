'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import IconButton from '../ui/IconButton';
import NumberInput from '../ui/NumberInput';
import Overlay from '../ui/Overlay';
import type { PopupPosition } from '../../types';
import { LIMITS, CROP_PRESETS } from '../../constants/config';

type OffsetDirection = 'left' | 'right' | 'both';

interface FieldOffsetPopupProps {
  position: PopupPosition;
  onApply: (config: { direction: OffsetDirection; distance: number; count: number }) => void;
  onClose: () => void;
}

export default function FieldOffsetPopup({ position, onApply, onClose }: FieldOffsetPopupProps) {
  const [direction, setDirection] = useState<OffsetDirection>('both');
  const [distance, setDistance] = useState<number>(LIMITS.DEFAULT_DISTANCE);
  const [count, setCount] = useState<number>(LIMITS.DEFAULT_LINE_COUNT);
  const [showDetails, setShowDetails] = useState(false);

  const handleApply = () => {
    onApply({ direction, distance, count });
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
        {!showDetails ? (
          // Etapa 1: Seleção de direção
          <div className="p-3">
            <p className="text-xs font-medium text-gray-700 mb-3">Direção das linhas paralelas</p>
            <div className="flex gap-2">
              <IconButton
                onClick={() => setDirection('left')}
                active={direction === 'left'}
                title="Esquerda"
                label="Esq"
                className="w-16 h-16"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              />
              
              <IconButton
                onClick={() => setDirection('both')}
                active={direction === 'both'}
                title="Ambos os lados"
                label="Ambos"
                className="w-16 h-16"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
              />
              
              <IconButton
                onClick={() => setDirection('right')}
                active={direction === 'right'}
                title="Direita"
                label="Dir"
                className="w-16 h-16"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              />
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
              <NumberInput
                label="Distância (m)"
                value={distance}
                onChange={setDistance}
                min={LIMITS.MIN_DISTANCE}
                step={0.1}
              />
              
              {/* Quantidade */}
              <NumberInput
                label="Quantidade de linhas"
                value={count}
                onChange={setCount}
                min={1}
                max={LIMITS.MAX_LINE_COUNT}
                step={1}
                showControls
              />
              
              {/* Presets */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Presets</p>
                <div className="grid grid-cols-3 gap-1">
                  {CROP_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => { setDistance(preset.distance); setCount(preset.count); }}
                      className="px-2 py-1 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded text-xs text-gray-700 hover:text-blue-700"
                    >
                      {preset.name}
                    </button>
                  ))}
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
              
              <Button
                onClick={handleApply}
                variant="primary"
                className="w-full"
              >
                Aplicar
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
