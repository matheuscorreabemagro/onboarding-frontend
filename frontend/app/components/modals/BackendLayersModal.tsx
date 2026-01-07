'use client';

import { useState } from 'react';
import { type LayerResponse } from '../../services/api';
import Alert from '../ui/Alert';
import ConfirmDialog from './ConfirmDialog';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import Overlay from '../ui/Overlay';
import LoadingSpinner from '../ui/LoadingSpinner';
import EmptyState from '../ui/EmptyState';
import { CloseIcon } from '../icons';
import { useBackendLayers } from '../../hooks/useBackendLayers';

interface BackendLayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadLayer: (layer: LayerResponse) => void;
}

export default function BackendLayersModal({ isOpen, onClose, onLoadLayer }: BackendLayersModalProps) {
  const {
    layers,
    loading,
    error,
    selectedLayers,
    toggleSelection,
    selectAll,
    clearSelection,
    deleteSelected,
  } = useBackendLayers(isOpen);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleLoadSelected = async () => {
    if (selectedLayers.size === 0) return;

    for (const layerId of Array.from(selectedLayers)) {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        onLoadLayer(layer);
      }
    }
    clearSelection();
    onClose();
  };

  const handleDeleteSelected = async () => {
    setShowDeleteDialog(false);
    await deleteSelected();
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay onClick={onClose} zIndex={9999} />
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 9999 }}>
      <div className="pointer-events-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Camadas Salvas</h2>
            <p className="text-sm text-gray-500 mt-1">
              {layers.length} {layers.length === 1 ? 'camada disponível' : 'camadas disponíveis'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <CloseIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <Alert type="error" message={error} onClose={() => {}} />
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : layers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex flex-col items-center justify-center w-full h-full">
                <EmptyState
                  title="Nenhuma camada salva"
                  description="Importe e salve camadas para vê-las aqui"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Seleção no topo */}
              <div className="flex items-center justify-between pb-2 border-b">
                <Button
                  onClick={selectAll}
                  variant="outline"
                  size="sm"
                  className="text-sm border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 focus:ring-blue-500"
                >
                  {selectedLayers.size === layers.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                </Button>
                <span className="text-sm text-gray-600">
                  {layers.length} {layers.length === 1 ? 'camada disponível' : 'camadas disponíveis'}
                  {selectedLayers.size > 0 && ` • ${selectedLayers.size} ${selectedLayers.size === 1 ? 'selecionada' : 'selecionadas'}`}
                </span>
              </div>

              {/* Lista de camadas */}
              <div className="space-y-2">
                {layers.map((layer) => (
                  <Checkbox
                    key={layer.id}
                    checked={selectedLayers.has(layer.id)}
                    onChange={() => toggleSelection(layer.id)}
                    label={
                      <>
                        <span>{layer.name}</span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded ml-2">
                          {layer.geometry_type}
                        </span>
                      </>
                    }
                  description={
                    <>
                      {layer.description && (
                        <p className="text-sm text-gray-600 mb-1">{layer.description}</p>
                      )}
                      <div className="flex items-center gap-3">
                        <span>ID: {layer.id}</span>
                        <span>•</span>
                        <span>Criado: {new Date(layer.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </>
                  }
                />
              ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={selectedLayers.size === 0}
              variant="danger"
            >
              Excluir Selecionadas
            </Button>
            <Button
              onClick={handleLoadSelected}
              disabled={selectedLayers.size === 0}
              variant="primary"
            >
              Carregar Selecionadas
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteSelected}
        title="Excluir Camadas"
        message={
          selectedLayers.size === 1
            ? 'Tem certeza que deseja excluir esta camada?'
            : `Tem certeza que deseja excluir ${selectedLayers.size} camadas?`
        }
        confirmText="Excluir"
        cancelText="Cancelar"
      />
      </div>
      </div>
    </>
  );
}
