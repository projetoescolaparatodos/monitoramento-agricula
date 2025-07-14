
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';
import { useLocation } from 'wouter';

export const useGestorAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isGestor, setIsGestor] = useState(false);
  const [user, setUser] = useState(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsGestor(false);
        setUser(null);
        setLoading(false);
        setLocation('/login/admin/gestor');
        return;
      }

      try {
        // Verificar se o usuário tem permissão de gestor
        const userDoc = await getDoc(doc(db, 'usuarios_admin', currentUser.uid));
        
        if (!userDoc.exists()) {
          setIsGestor(false);
          setUser(null);
          setLocation('/acesso-negado');
          return;
        }

        const userData = userDoc.data();
        
        // Verificar se é admin ou coordenação (gestor)
        if (userData.setor === 'admin' || userData.setor === 'coordenacao') {
          setIsGestor(true);
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            ...userData
          });
        } else {
          setIsGestor(false);
          setUser(null);
          setLocation('/acesso-negado');
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setIsGestor(false);
        setUser(null);
        setLocation('/acesso-negado');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setLocation]);

  return { loading, isGestor, user };
};
