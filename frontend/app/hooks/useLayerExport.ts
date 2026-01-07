import { useCallback } from 'react';
import { api } from '../services/api';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants/messages';
import { useNotification } from './useNotification';

interface UseLayerExportReturn {
  error: string | null;
  success: string | null;
  exportLayer: (backendId: number, formats: string[]) => Promise<void>;
}

/**
 * Hook para gerenciar exportação de layers
 */
export function useLayerExport(): UseLayerExportReturn {
  const { error, success, showError, showSuccess } = useNotification();

  const exportLayer = useCallback(async (backendId: number | undefined, formats: string[]) => {
    if (!backendId) {
      throw new Error(ERROR_MESSAGES.LAYER_EXPORT_ERROR);
    }

    try {
      await api.exportLayerBatch(backendId, formats);
      
      const message = formats.length > 1 
        ? SUCCESS_MESSAGES.EXPORT_SUCCESS_MULTIPLE(formats.length)
        : SUCCESS_MESSAGES.EXPORT_SUCCESS;
      
      showSuccess(message);
    } catch (err) {
      showError(err instanceof Error ? err.message : ERROR_MESSAGES.EXPORT_ERROR);
      throw err;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { error, success, exportLayer };
}
