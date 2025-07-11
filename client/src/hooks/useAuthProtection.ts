import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/utils/firebase';

export const useAuthProtection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('🔐 Iniciando verificação de autenticação...');

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔐 Estado de autenticação mudou:', currentUser ? 'Logado' : 'Não logado');
      setUser(currentUser);
      setLoading(false);

      // Não redirecionar automaticamente - deixar o componente decidir
      if (!currentUser) {
        console.log('🔐 Usuário não autenticado');
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  return { user, loading };
};