'use client';

import type { Layer } from '../types/layer';
import { useMapStore } from '../store/mapStore';
import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import type { Feature } from '../types';

interface LayerItemProps {
  layer: Layer;
}

// Helper para mostrar os tipos de geometria presentes
const getGeometryTypes = (features: Feature[]): string => {
  const types = new Set(features.map(f => f.geometry.type));
  const typeNames: Record<string, string> = {
    'Point': 'Ponto',
    'LineString': 'Linha',
    'Polygon': 'Polígono',
    'MultiPoint': 'Multiponto',
    'MultiLineString': 'Multilinha',
    'MultiPolygon': 'Multipolígono',
  };
  
  return Array.from(types)
    .map(t => typeNames[t] || t)
    .join(', ');
};

export default function LayerItem({ layer }: LayerItemProps) {
  const setActiveLayer = useMapStore((s) => s.setActiveLayer);
  const toggleVisibility = useMapStore((s) => s.toggleLayerVisibility);
  const removeLayer = useMapStore((s) => s.removeLayer);
  const updateLayerName = useMapStore((s) => s.updateLayerName);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleSaveEdit = () => {
    if (editName.trim()) {
      updateLayerName(layer.id, editName.trim());
      setIsEditing(false);
    }
  };
  
  const handleCancelEdit = () => {
    setEditName(layer.name);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };
  
  return (
    <div
      className={`
        p-2 rounded-lg border-2 transition-all cursor-pointer group
        ${layer.isActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
      onClick={() => !layer.isActive && setActiveLayer(layer.id)}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Indicador de cor e nome */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-3 h-3 rounded-full border-2 border-gray-300 shrink-0"
            style={{ backgroundColor: layer.color }}
          />
          
          {isEditing ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSaveEdit}
              autoFocus
              className="text-sm px-1 py-0.5 border border-blue-500 rounded flex-1 min-w-0 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 font-medium"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className={`text-sm truncate ${layer.isActive ? 'font-semibold text-blue-900' : 'text-gray-700'}`}>
                {layer.name}
              </span>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditName(layer.name);
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Editar nome"
                title="Editar nome"
              >
                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </>
          )}
          
          {layer.isActive && (
            <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded font-medium shrink-0">
              Ativa
            </span>
          )}
        </div>
        
        {/* Controles */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Visibilidade */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleVisibility(layer.id);
            }}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            aria-label={layer.isVisible ? 'Ocultar camada' : 'Mostrar camada'}
            title={layer.isVisible ? 'Ocultar camada' : 'Mostrar camada'}
          >
            {layer.isVisible ? (
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
          
          {/* Deletar (só se não for ativa) */}
          {!layer.isActive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Excluir camada"
              title="Excluir camada"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Info adicional */}
      <div className="mt-1 text-xs text-gray-500">
        {layer.features.length} geometria(s)
        {layer.features.length > 0 && ` • ${getGeometryTypes(layer.features)}`}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => removeLayer(layer.id)}
        title="Excluir Camada"
        message={`Tem certeza que deseja excluir a camada "${layer.name}"?`}
        confirmText="Sim"
        cancelText="Não"
      />
    </div>
  );
}
