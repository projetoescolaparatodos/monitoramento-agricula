
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

export interface UserAuth {
  uid: string;
  email: string;
  setor: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthProtection = (requiredSetor?: string) => {
  const [userAuth, setUserAuth] = useState<UserAuth>({
    uid: '',
    email: '',
    setor: '',
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(db, 'usuarios_admin', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserAuth({
              uid: user.uid,
              email: user.email || '',
              setor: userData.setor || '',
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // Usuário não existe na coleção admin
            setUserAuth({
              uid: '',
              email: '',
              setor: '',
              isAuthenticated: false,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error('Erro ao verificar dados do usuário:', error);
          setUserAuth({
            uid: '',
            email: '',
            setor: '',
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } else {
        setUserAuth({
          uid: '',
          email: '',
          setor: '',
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const hasAccess = (setor: string): boolean => {
    if (!userAuth.isAuthenticated) return false;
    
    // Coordenação tem acesso a todos os setores
    if (userAuth.setor === 'coordenacao') return true;
    
    // Verificar se o setor do usuário corresponde ao requerido
    return userAuth.setor === setor;
  };

  return {
    userAuth,
    hasAccess,
    isLoading: userAuth.isLoading,
  };
};
