
import { useState, useEffect } from 'react';

interface CacheConfig {
  key: string;
  expirationTime: number; // em minutos
}

export function useMapCache<T>(fetchFunction: () => Promise<T>, config: CacheConfig) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cachedData = localStorage.getItem(config.key);
        const cachedTime = localStorage.getItem(`${config.key}_time`);

        if (cachedData && cachedTime) {
          const isExpired = Date.now() - Number(cachedTime) > config.expirationTime * 60 * 1000;
          
          if (!isExpired) {
            setData(JSON.parse(cachedData));
            setLoading(false);
            return;
          }
        }

        const newData = await fetchFunction();
        localStorage.setItem(config.key, JSON.stringify(newData));
        localStorage.setItem(`${config.key}_time`, Date.now().toString());
        setData(newData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [config.key, config.expirationTime]);

  return { data, loading };
}
