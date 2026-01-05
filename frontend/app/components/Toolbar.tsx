'use client';

import { useMapStore, type ToolMode } from '../store/mapStore';
import { useState } from 'react';
import FileUpload from './FileUpload';

interface ToolButton {
  id: ToolMode;
  icon: string;
  label: string;
  description: string;
}

export default function Toolbar() {
  const features = useMapStore((s) => s.features);
  const selectedFeatureId = useMapStore((s) => s.selectedFeatureId);
  const removeFeature = useMapStore((s) => s.removeFeature);
  const activeTool = useMapStore((s) => s.activeTool);
  const setActiveTool = useMapStore((s) => s.setActiveTool);
  const setPopupPosition = useMapStore((s) => s.setPopupPosition);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tools: ToolButton[] = [
    {
      id: 'draw',
      icon: '✏️',
      label: 'Desenhar',
      description: 'Desenhar nova linha',
    },
    {
      id: 'snap',
      icon: '🧲',
      label: 'Snap',
      description: 'Ativar atração magnética',
    },
    {
      id: 'split',
      icon: '✂️',
      label: 'Cortar',
      description: 'Dividir linha existente',
    },
    {
      id: 'offset',
      icon: '↔️',
      label: 'Offset',
      description: 'Criar linhas paralelas',
    },
    {
      id: 'simplify',
      icon: '〰️',
      label: 'Suavizar',
      description: 'Suavizar geometria',
    },
  ];

  const handleRemove = () => {
    if (selectedFeatureId) {
      removeFeature(selectedFeatureId);
    }
  };

  const handleToolClick = (toolId: ToolMode) => {
    if (toolId === 'split' && !selectedFeatureId) {
      alert('Selecione uma linha primeiro');
      return;
    }

    if ((toolId === 'offset' || toolId === 'simplify') && !selectedFeatureId) {
      alert('Selecione uma linha primeiro');
      return;
    }

    // Se offset/simplify e linha já selecionada, mostra popup imediatamente no centro
    if ((toolId === 'offset' || toolId === 'simplify') && selectedFeatureId) {
      setActiveTool(toolId);
      setPopupPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

  return (
    <>
      <div className="fixed left-0 top-0 h-full w-16 bg-white border-r border-gray-200 shadow-lg flex flex-col items-center py-4 z-50">
        {/* Logo/Título */}
        <div className="mb-6 pb-4 border-b border-gray-200 w-full flex justify-center">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>

        {/* Botão Upload */}
        <div className="mb-2 w-full px-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="group relative w-12 h-12 rounded-lg transition-all bg-linear-to-br from-green-500 to-emerald-600 text-white hover:shadow-md hover:scale-105"
            title="Upload GeoJSON"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Upload
            </div>
          </button>
        </div>

        <div className="w-full border-b border-gray-200 mb-2" />

      {/* Ferramentas */}
      <div className="flex-1 flex flex-col gap-1 w-full px-2">
        {tools.map((tool) => {
          const isActive = activeTool === tool.id;
          const needsSelection = ['split', 'offset', 'simplify'].includes(tool.id as string);
          const isDisabled = needsSelection && !selectedFeatureId;

          return (
            <button
              key={tool.id}
              onClick={() => handleToolClick(tool.id)}
              disabled={isDisabled}
              className={`group relative w-12 h-12 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : isDisabled
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={tool.description}
            >
              {tool.id === 'draw' && (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              )}
              {tool.id === 'snap' && (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              )}
              {tool.id === 'split' && (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
              )}
              {tool.id === 'offset' && (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              )}
              {tool.id === 'simplify' && (
                <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343" />
                </svg>
              )}
              
              {/* Tooltip */}
              <div className="absolute left-16 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {tool.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Contador de linhas */}
      <div className="mt-auto pt-4 border-t border-gray-200 w-full px-2">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{features.length}</div>
          <div className="text-xs text-gray-500 mt-1">linhas</div>
        </div>
        
        {/* Botão Remover */}
        {selectedFeatureId && (
          <button
            onClick={handleRemove}
            className="mt-3 w-12 h-12 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            title="Remover linha selecionada"
          >
            <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>

    {/* Modal de Upload */}
    {showUploadModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60" onClick={() => setShowUploadModal(false)}>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowUploadModal(false)}
            className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <FileUpload onClose={() => setShowUploadModal(false)} />
        </div>
      </div>
    )}
  </>
  );
}
