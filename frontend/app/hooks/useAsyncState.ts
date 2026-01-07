import { useState, useCallback } from 'react';

interface UseAsyncStateReturn<T, Args extends unknown[] = unknown[], E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
  execute: (...args: Args) => Promise<T | undefined>;
  reset: () => void;
}

/**
 * Hook para gerenciar estado assíncrono (loading, error, data)
 * Segue o padrão DRY para evitar repetição de useState em componentes
 */
export function useAsyncState<T, Args extends unknown[] = unknown[], E = Error>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncStateReturn<T, Args, E> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err as E);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, error, loading, execute, reset };
}
