'use client';

import { useMapStore } from '../store/mapStore';
import Button from './Button';

export default function Toolbar() {
  const isDrawing = useMapStore((s) => s.isDrawing);
  const drawingPoints = useMapStore((s) => s.drawingPoints);
  const startDrawing = useMapStore((s) => s.startDrawing);
  const cancelDrawing = useMapStore((s) => s.cancelDrawing);
  const finishDrawing = useMapStore((s) => s.finishDrawing);
  const features = useMapStore((s) => s.features);
  const selectedFeatureId = useMapStore((s) => s.selectedFeatureId);
  const removeFeature = useMapStore((s) => s.removeFeature);

  const handleDrawingToggle = () => {
    if (isDrawing) {
      cancelDrawing();
    } else {
      startDrawing();
    }
  };

  const handleFinish = () => {
    finishDrawing();
  };

  const handleRemove = () => {
    if (selectedFeatureId) {
      removeFeature(selectedFeatureId);
    }
  };

  return (
    <div className="fixed top-6 right-6 z-60 flex flex-col gap-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 min-w-50">
      {/* Título e Contador */}
      <div className="border-b border-gray-200 pb-3">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Controles
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Total de linhas:</span>
          <span className="text-lg font-bold text-blue-600">{features.length}</span>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="space-y-2">
        {/* Botão Desenhar/Cancelar */}
        <Button
          variant={isDrawing ? 'danger' : 'primary'}
          active={isDrawing}
          onClick={handleDrawingToggle}
          className="w-full"
        >
          <span className="flex items-center justify-center gap-2">
            {isDrawing ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar Desenho
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Desenhar Linha
              </>
            )}
          </span>
        </Button>

        {/* Botão Finalizar (só aparece quando há pontos suficientes) */}
        {isDrawing && drawingPoints.length >= 2 && (
          <Button variant="success" onClick={handleFinish} className="w-full">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Finalizar ({drawingPoints.length} pontos)
            </span>
          </Button>
        )}

        {/* Botão Remover (só aparece quando há seleção) */}
        {selectedFeatureId && !isDrawing && (
          <Button variant="danger" onClick={handleRemove} className="w-full">
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remover Linha
            </span>
          </Button>
        )}
      </div>

      {/* Dica visual do estado */}
      {isDrawing && (
        <div className="mt-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-xs text-purple-700 text-center">
            Clique no mapa para adicionar pontos
          </p>
        </div>
      )}
      {selectedFeatureId && !isDrawing && (
        <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 text-center">
            Linha selecionada • Pressione Delete para remover
          </p>
        </div>
      )}
    </div>
  );
}