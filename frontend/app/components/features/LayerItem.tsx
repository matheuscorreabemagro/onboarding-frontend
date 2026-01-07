'use client';

import type { Layer } from '../../types/layer';
import { useMapStore } from '../../store/mapStore';
import { useState, memo, useMemo } from 'react';
import ConfirmDialog from '../modals/ConfirmDialog';
import Alert from '../ui/Alert';
import ExportModal from '../modals/ExportModal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useLayerSave } from '../../hooks/useLayerSave';
import { useLayerExport } from '../../hooks/useLayerExport';
import { getGeometryTypes, getLayerBackendId, isLayerSaved } from '../../utils/layerHelpers';

interface LayerItemProps {
  layer: Layer;
}

function LayerItem({ layer }: LayerItemProps) {
  // Seletores do Zustand
  const setActiveLayer = useMapStore((s) => s.setActiveLayer);
  const toggleVisibility = useMapStore((s) => s.toggleLayerVisibility);
  const removeLayer = useMapStore((s) => s.removeLayer);
  const updateLayerName = useMapStore((s) => s.updateLayerName);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layer.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Hooks customizados para lógica de negócio
  const { saving, saveError, successMessage, saveLayer, clearMessages } = useLayerSave();
  const { exportLayer } = useLayerExport();
  
  // Utils memoizados
  const backendId = useMemo(() => getLayerBackendId(layer), [layer]);
  const isSaved = useMemo(() => isLayerSaved(layer), [layer]);
  
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

  const handleExport = async (formats: string[]) => {
    clearMessages();
    if (!backendId) {
      return;
    }
    await exportLayer(backendId, formats);
  };
  
  return (
    <div
      className={`
        p-2 rounded-lg border-2 cursor-pointer group
        ${layer.isActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
      onClick={() => !layer.isActive && setActiveLayer(layer.id)}
    >
      {/* Layout em linha única */}
      <div className="flex items-center gap-2">
        {/* Indicador de cor */}
        <div
          className="w-3 h-3 rounded-full border-2 shrink-0"
          style={{ 
            backgroundColor: layer.color,
            borderColor: layer.isActive ? '#3b82f6' : '#d1d5db'
          }}
        />
        
        {/* Nome da camada */}
        {isEditing ? (
          <Input
            type="text"
            value={editName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            autoFocus
            className="text-sm font-medium flex-1 min-w-0"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          />
        ) : (
          <span 
            className={`text-sm font-medium truncate flex-1 min-w-0 ${layer.isActive ? 'font-semibold text-blue-900' : 'text-gray-700'}`}
            title={layer.name}
          >
            {layer.name}
          </span>
        )}
        
        {/* Botões de controle */}
        <div className="flex items-center gap-1 shrink-0">
        {/* Editar nome */}
        {!isEditing && (
          <div onClick={(e) => e.stopPropagation()}>
            <Button
              onClick={() => {
                setEditName(layer.name);
                setIsEditing(true);
              }}
              variant="secondary"
              size="sm"
              className="p-1 opacity-0 group-hover:opacity-100"
              title="Editar nome"
            >
              <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </Button>
          </div>
        )}
      
      {/* Controles originais */}
          {/* Salvar no Backend */}
          <Button
            onClick={() => {
              saveLayer(layer);
            }}
            disabled={saving}
            variant={isSaved ? 'success' : 'primary'}
            size="sm"
            className="p-1.5"
            title={isSaved ? 'Atualizar camada salva' : 'Salvar camada'}
          >
            {saving ? (
              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ) : isSaved ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
          </Button>

          {/* Exportar (só se salvo) */}
          {isSaved && (
            <Button
              onClick={() => {
                setShowExportModal(true);
              }}
              variant="secondary"
              size="sm"
              className="p-1.5 text-purple-600 hover:bg-purple-50"
              title="Exportar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Button>
          )}
          
          {/* Visibilidade */}
          <Button
            onClick={() => {
              toggleVisibility(layer.id);
            }}
            variant="secondary"
            size="sm"
            className="p-1.5"
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
          </Button>
          
          {/* Deletar (só se não for ativa) */}
          {!layer.isActive && (
            <Button
              onClick={() => {
                setShowDeleteDialog(true);
              }}
              variant="danger"
              size="sm"
              className="p-1.5 opacity-0 group-hover:opacity-100"
              title="Excluir camada"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>
      
      {/* Info adicional */}
      <div className="mt-1 text-xs text-gray-500">
        {layer.features.length} geometria(s)
        {layer.features.length > 0 && ` • ${getGeometryTypes(layer.features)}`}
        {isSaved && (
          <span className="ml-2 text-green-600 font-medium">
            • Salvo (ID: {backendId})
          </span>
        )}
      </div>

      {/* Erro ao salvar */}
      {saveError && (
        <div className="mt-2">
          <Alert type="error" message={saveError} onClose={clearMessages} />
        </div>
      )}

      {/* Sucesso */}
      {successMessage && (
        <div className="mt-2">
          <Alert type="success" message={successMessage} onClose={clearMessages} />
        </div>
      )}

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

      {/* Modal de exportação */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        layerName={layer.name}
      />
    </div>
  );
}

// Memoizar o componente para evitar re-renders desnecessários
// Só re-renderiza quando as propriedades da layer mudarem
export default memo(LayerItem, (prevProps, nextProps) => {
  const prev = prevProps.layer;
  const next = nextProps.layer;
  
  // Compara apenas propriedades que afetam a UI
  return (
    prev.id === next.id &&
    prev.name === next.name &&
    prev.isActive === next.isActive &&
    prev.isVisible === next.isVisible &&
    prev.color === next.color &&
    prev.features.length === next.features.length &&
    prev.zIndex === next.zIndex
  );
});
