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

// Habilitar persistência offline
enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistência offline não pôde ser habilitada: múltiplas abas abertas');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não é suportada neste navegador');
  }
});

// Inicializar o Storage
const storage = getStorage(app);

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