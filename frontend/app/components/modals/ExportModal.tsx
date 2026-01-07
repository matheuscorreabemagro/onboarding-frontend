'use client';

import { useState } from 'react';
import Modal from './Modal';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';
import LoadingSpinner from '../ui/LoadingSpinner';
import { DownloadIcon } from '../icons';
import { EXPORT_FORMATS } from '../../constants/config';
import { ERROR_MESSAGES } from '../../constants/messages';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (formats: string[]) => Promise<void>;
  layerName: string;
}

export default function ExportModal({ isOpen, onClose, onExport, layerName }: ExportModalProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['geojson']);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formats: ReadonlyArray<{ id: string; label: string; icon: string; description: string }> = EXPORT_FORMATS;

  const toggleFormat = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(f => f !== formatId)
        : [...prev, formatId]
    );
  };

  const toggleAll = () => {
    if (selectedFormats.length === formats.length) {
      setSelectedFormats([]); // Permitir desmarcar todos
    } else {
      setSelectedFormats(formats.map(f => f.id));
    }
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) {
      setError(ERROR_MESSAGES.EXPORT_NO_FORMAT);
      return;
    }

    setExporting(true);
    setError(null);

    try {
      await onExport(selectedFormats);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.EXPORT_ERROR);
    } finally {
      setExporting(false);
    }
  };

  const handleClose = () => {
    if (!exporting) {
      setSelectedFormats(['geojson']);
      setError(null);
      onClose();
    }
  };

  // Remove extensão do nome da camada
  const cleanLayerName = layerName.replace(/\.[^/.]+$/, '');

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Exportar: ${cleanLayerName}`}>
      <div className="space-y-4">
        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">
                {formats.length} {formats.length === 1 ? 'formato disponível' : 'formatos disponíveis'}
                {selectedFormats.length > 0 && ` • ${selectedFormats.length} ${selectedFormats.length === 1 ? 'selecionado' : 'selecionados'}`}
              </span>
            <Button
              onClick={toggleAll}
              variant="outline"
              size="sm"
              className="text-xs border-blue-500 text-blue-600 hover:bg-blue-50 hover:border-blue-600 focus:ring-blue-500"
            >
              {selectedFormats.length === formats.length ? 'Desmarcar todos' : 'Selecionar todos'}
            </Button>
          </div>

          {formats.map(format => (
            <Checkbox
              key={format.id}
              checked={selectedFormats.includes(format.id)}
              onChange={() => toggleFormat(format.id)}
              label={format.label}
              icon={format.icon}
              description={format.description}
            />
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleClose}
            disabled={exporting}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleExport}
            disabled={exporting || selectedFormats.length === 0}
            variant="primary"
            className="flex-1 flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <DownloadIcon className="w-4 h-4" />
                <span>Exportar {selectedFormats.length > 1 ? `(${selectedFormats.length})` : ''}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
