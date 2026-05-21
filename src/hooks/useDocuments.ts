import { useCallback, useEffect, useState } from 'react';
import { fetchDocuments, RagDocument } from '../services/chatService';

export function useDocuments(refreshTrigger?: number) {
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const docs = await fetchDocuments(force);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial desde sessionStorage (o API si no hay cache)
  useEffect(() => {
    load(false);
  }, [load]);

  // Cuando refreshTrigger cambia (tras subir documentos), fuerza re-fetch a la API
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      load(true);
    }
  }, [refreshTrigger, load]);

  return { documents, loading, error, refresh: () => load(true) };
}
