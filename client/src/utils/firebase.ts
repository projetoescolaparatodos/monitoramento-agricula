import { initializeApp } from 'firebase/app';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { doc, setDoc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
  measurementId: "G-335VMCKSLN",
};

console.log('🔧 Inicializando Firebase com config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);
console.log('✅ Firebase app inicializada:', app.name);

// Inicializar o Firestore
const db = getFirestore(app);
console.log('✅ Firestore inicializado para projeto:', db.app.options.projectId);

// Habilitar persistência offline com configuração otimizada
enableMultiTabIndexedDbPersistence(db, {
  forceOwnership: false
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline não pôde ser habilitada: múltiplas abas abertas');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não é suportada neste navegador');
  }
});

// Inicializar o Storage
const storage = getStorage(app);

// Função de retry para operações do Firebase com timeout otimizado
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Adicionar timeout para cada operação (aumentado para 15 segundos)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout na operação Firebase')), 15000);
      });
      
      return await Promise.race([operation(), timeoutPromise]);
    } catch (error: any) {
      lastError = error;
      console.warn(`🔄 Tentativa ${i + 1}/${maxRetries} falhou:`, error.message);
      
      // Se for erro de rede, aguardar mais tempo
      if (error.code === 'unavailable' || error.message.includes('timeout')) {
        delay = delay * 2; // Backoff exponencial
      }
      
      if (i < maxRetries - 1) {
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
};

export { db, storage };
export const auth = getAuth(app);


export const criarUsuarioComPermissao = async (uid: string, email: string, permissao: 'admin' | 'usuario') => {
  try {
    await setDoc(doc(db, "usuarios", uid), {
      email,
      permissao,
      dataCriacao: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return false;
  }
}

export const verificarPermissaoUsuario = async (uid: string): Promise<'admin' | 'usuario' | null> => {
  try {
    const userRef = doc(db, "usuarios", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.permissao === 'admin' || userData.permissao === 'usuario') {
        return userData.permissao;
      }
    }
    return null;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return null;
  }
};

export const isUserAdmin = async (uid: string): Promise<boolean> => {
  const permission = await verificarPermissaoUsuario(uid);
  return permission === 'admin';
};

// Função para inicializar o usuário admin após o primeiro login
export const inicializarUsuarioAdmin = async (user: any) => {
  try {
    // Usa o UID do usuário como ID do documento
    const userRef = doc(db, "usuarios", user.uid);
    await setDoc(userRef, {
      email: user.email,
      permissao: 'admin',
      dataCriacao: new Date().toISOString(),
      uid: user.uid // Adiciona o UID como campo também
    });
    console.log("Usuário admin inicializado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar usuário admin:", error);
    return false;
  }
};