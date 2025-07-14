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

export const useGestorAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    console.log('🔐 Iniciando verificação de autenticação do gestor...');

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 Estado de autenticação mudou:', currentUser ? 'Logado' : 'Não logado');

      if (currentUser) {
        try {
          // Primeiro tenta na coleção usuarios_admin
          let userDoc = await getDoc(doc(db, 'usuarios_admin', currentUser.uid));
          let userData: UserData | null = null;

          if (userDoc.exists()) {
            userData = userDoc.data() as UserData;

            // Verificar se é admin ou coordenação (gestor)
            if (userData.setor === 'admin' || userData.setor === 'coordenacao') {
              setUser(currentUser);
              setUserData(userData);
              console.log('✅ Usuário autenticado como gestor (usuarios_admin):', userData);
            } else {
              console.log('❌ Usuário não tem permissão de gestor');
              setLocation('/acesso-negado');
            }
          } else {
            // Se não encontrou em usuarios_admin, verifica na coleção usuarios
            userDoc = await getDoc(doc(db, 'usuarios', currentUser.uid));

            if (userDoc.exists()) {
              userData = userDoc.data() as UserData;

              // Verificar se tem permissão de admin na coleção usuarios
              if (userData.permissao === 'admin') {
                setUser(currentUser);
                setUserData(userData);
                console.log('✅ Usuário autenticado como gestor (usuarios):', userData);
              } else {
                console.log('❌ Usuário não tem permissão de admin');
                setLocation('/acesso-negado');
              }
            } else {
              console.log('❌ Usuário não encontrado em nenhuma base de dados');
              setLocation('/acesso-negado');
            }
          }
        } catch (error) {
          console.error('❌ Erro ao verificar permissões:', error);
          setLocation('/acesso-negado');
        }
      } else {
        setUser(null);
        setUserData(null);
        console.log('🔐 Usuário não autenticado, redirecionando...');
        setLocation('/login/admin/gestor');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setLocation]);

  return { 
    user, 
    userData,
    loading,
    isAuthenticated: !!user && !!userData,
    isGestor: (userData?.setor === 'admin' || userData?.setor === 'coordenacao') || userData?.permissao === 'admin'
  };
};