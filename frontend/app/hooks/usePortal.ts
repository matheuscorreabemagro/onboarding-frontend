import { useEffect, useMemo } from 'react';

/**
 * Hook para gerenciar portais do ReactDOM
 * Cria e gerencia elementos portal de forma consistente
 * Usado para renderizar modais/popups fora da hierarquia DOM
 */
export function usePortal(id: string = 'portal-root') {
  // Cria ou obtém o elemento portal de forma síncrona
  const portalElement = useMemo(() => {
    // Procura elemento existente
    let element = document.getElementById(id);
    
    // Se não existe, cria
    if (!element) {
      element = document.createElement('div');
      element.id = id;
      element.style.position = 'fixed';
      element.style.zIndex = '9999';
      document.body.appendChild(element);
    }

    return element;
  }, [id]);

  // Cleanup: remove portal quando componente desmonta
  useEffect(() => {
    return () => {
      const element = document.getElementById(id);
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [id]);

  return portalElement;
}
