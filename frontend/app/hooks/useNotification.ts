import { useState, useCallback, useRef, useEffect } from 'react';
import { TIMEOUTS } from '../constants/config';

interface UseNotificationReturn {
  error: string | null;
  success: string | null;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
  clearError: () => void;
  clearSuccess: () => void;
  clearAll: () => void;
}

/**
 * Hook para gerenciar notificações (erro e sucesso) com auto-hide
 * Centraliza a lógica de exibição de mensagens em toda a aplicação
 */
export function useNotification(): UseNotificationReturn {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);
  const successTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup dos timers quando o componente desmonta
  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showError = useCallback((message: string) => {
    // Limpa timer anterior se existir
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    
    setError(message);
    setSuccess(null);
    
    errorTimerRef.current = setTimeout(() => {
      setError(null);
      errorTimerRef.current = null;
    }, TIMEOUTS.ERROR_AUTO_HIDE);
  }, []);

  const showSuccess = useCallback((message: string) => {
    // Limpa timer anterior se existir
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    
    setSuccess(message);
    setError(null);
    
    successTimerRef.current = setTimeout(() => {
      setSuccess(null);
      successTimerRef.current = null;
    }, TIMEOUTS.SUCCESS_AUTO_HIDE);
  }, []);

  const clearError = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setError(null);
  }, []);
  
  const clearSuccess = useCallback(() => {
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setSuccess(null);
  }, []);
  
  const clearAll = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setError(null);
    setSuccess(null);
  }, []);

  return {
    error,
    success,
    showError,
    showSuccess,
    clearError,
    clearSuccess,
    clearAll,
  };
}
