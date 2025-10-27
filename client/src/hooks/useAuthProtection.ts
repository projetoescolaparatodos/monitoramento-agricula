import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface UserData {
  email: string;
  nome?: string;
  setor?: string;
  cargo?: string;
  permissions?: string[];
  permissao?: string;
  active?: boolean;
}

export const useAuthProtection = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('🔐 Iniciando verificação de autenticação...');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 Estado de autenticação mudou:', currentUser ? 'Logado' : 'Não logado');

      if (currentUser) {
        try {
          // Primeiro tenta na coleção usuarios_admin
          let userDoc = await getDoc(doc(db, 'usuarios_admin', currentUser.uid));
          let userData: UserData | null = null;

          if (userDoc.exists()) {
            userData = userDoc.data() as UserData;
            console.log('✅ Usuário encontrado em usuarios_admin:', userData);
          } else {
            // Se não encontrou em usuarios_admin, verifica na coleção usuarios
            userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));

            if (userDoc.exists()) {
              userData = userDoc.data() as UserData;
              console.log('✅ Usuário encontrado em usuarios:', userData);
            } else {
              console.log('❌ Usuário não encontrado em nenhuma base de dados');
            }
          }

          setUser(currentUser);
          setUserData(userData);
        } catch (error) {
          console.error('❌ Erro ao verificar permissões:', error);
          setUser(currentUser);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        console.log('🔐 Usuário não autenticado');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setLocation]);

  const hasAccess = (area: 'agricultura' | 'pesca' | 'paa' | 'admin' | 'gestor') => {
    if (!userData) return false;

    // Admin e coordenação têm acesso a tudo
    if (userData.setor === 'admin' || userData.setor === 'coordenacao' || userData.permissao === 'admin') {
      return true;
    }

    // Para a página admin geral, apenas coordenação tem acesso
    if (area === 'admin') {
      return userData.setor === 'coordenacao';
    }

    // Para a página do gestor/secretário, verificar se é admin ou coordenação
    if (area === 'gestor') {
      return userData.setor === 'admin' || userData.setor === 'coordenacao' || userData.permissao === 'admin';
    }

    // Verificar se o setor do usuário corresponde à área solicitada
    return userData.setor === area;
  };

  const getLoginUrl = (area: 'agricultura' | 'pesca' | 'paa' | 'admin' | 'gestor') => {
    if (area === 'admin') {
      return '/login/admin';
    }
    if (area === 'gestor') {
      return '/login/admin/gestor';
    }
    return `/login/admin/${area}`;
  };

  return { 
    user, 
    userData,
    isLoading: loading,
    userAuth: {
      isAuthenticated: !!user,
      user: userData
    },
    hasAccess,
    getLoginUrl
  };
};