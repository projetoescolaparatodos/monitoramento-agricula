
import { useState, useEffect, useCallback } from 'react';

interface CacheConfig {
  key: string;
  expirationTime: number; // in minutes
}

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

function openDB(dbName: string = 'MapCacheDB'): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('mapCache')) {
        db.createObjectStore('mapCache', { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
}

export function useMapCache<T>(fetchFunction: () => Promise<T>, config: CacheConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const db = await openDB();
      const tx = db.transaction('mapCache', 'readonly');
      const store = tx.objectStore('mapCache');
      const cachedResult = await new Promise<CacheItem<T> | undefined>((resolve) => {
        const request = store.get(config.key);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(undefined);
      });

      const now = Date.now();
      const isExpired = !cachedResult || 
        (now - cachedResult.timestamp > config.expirationTime * 60 * 1000);

      if (!isExpired && cachedResult) {
        setData(cachedResult.data);
      } else {
        const newData = await fetchFunction();
        const tx = db.transaction('mapCache', 'readwrite');
        const store = tx.objectStore('mapCache');
        await new Promise<void>((resolve, reject) => {
          const request = store.put({
            key: config.key,
            data: newData,
            timestamp: now
          });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
        setData(newData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [config.key, config.expirationTime, fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error };
}
