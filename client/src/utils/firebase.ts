import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
  measurementId: "G-335VMCKSLN",
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta as funcionalidades que vamos usar
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
import { setDoc, getDoc } from 'firebase/firestore';

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
    const userDoc = await getDoc(doc(db, "usuarios", uid));
    if (userDoc.exists()) {
      return userDoc.data().permissao;
    }
    return null;
  } catch (error) {
    console.error("Erro ao verificar permissão:", error);
    return null;
  }
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
};;
  }
};
