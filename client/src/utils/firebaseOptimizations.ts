// Utilitários para otimizar operações Firebase
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs, enableNetwork, disableNetwork } from 'firebase/firestore';

export class FirebaseOptimizer {
  private static retryCount = 3;

  private static retryDelay = 1000; // 1 segundo

  // Retry automático para operações que falharam
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.retryCount
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Firebase retry - Tentativa ${attempt + 1}/${maxRetries + 1}`);
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Tentativa ${attempt + 1} falhou:`, error);

        if (attempt < maxRetries) {
          // Delay exponencial: 1s, 2s, 4s
          const delay = this.retryDelay * Math.pow(2, attempt);
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    throw lastError!;
  }

  // Verificar conectividade
  static async checkConnectivity(): Promise<boolean> {
    try {
      await enableNetwork(db);
      return true;
    } catch (error) {
      console.error('Problema de conectividade:', error);
      return false;
    }
  }

  // Operação com timeout personalizado
  static async withTimeout<T>(
    operation: () => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Operação excedeu ${timeoutMs}ms`)), timeoutMs);
    });

    return Promise.race([operation(), timeoutPromise]);
  }

  // Batch operations para múltiplas operações
  static async batchOperation<T>(
    operations: Array<() => Promise<T>>,
    batchSize: number = 5
  ): Promise<T[]> {
    const results: T[] = [];

    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(op => op()));
      results.push(...batchResults);
    }

    return results;
  }
}

// Hook para verificar status de conectividade
export const useFirebaseStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conectividade Firebase periodicamente
    const checkConnection = async () => {
      const connected = await FirebaseOptimizer.checkConnectivity();
      setIsConnected(connected);
    };

    const interval = setInterval(checkConnection, 30000); // A cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isConnected };
};