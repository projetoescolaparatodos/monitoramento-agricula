
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAHOYOjHyvoRXkVhuQc_Ld3VrJtmqO1XM",
  authDomain: "transparencia-agricola.firebaseapp.com",
  projectId: "transparencia-agricola",
  storageBucket: "transparencia-agricola.firebasestorage.app",
  messagingSenderId: "667594200798",
  appId: "1:667594200798:web:77966c861af0943825944f",
  measurementId: "G-335VMCKSLN",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function criarUsuarioPesca() {
  try {
    const uid = "7CtwywdVeQZildpGltt4amcs2iH3";
    const email = "pescasemapa@gmail.com";
    const setor = "pesca";

    // Criar documento na coleção usuarios_admin
    await setDoc(doc(db, 'usuarios_admin', uid), {
      email: email,
      setor: setor,
      dataCriacao: new Date().toISOString(),
      ativo: true
    });

    console.log('✅ Usuário de pesca criado com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log(`🎣 Setor: ${setor}`);
    console.log(`🆔 UID: ${uid}`);
    console.log('🔗 O usuário agora pode acessar: /login/admin/pesca');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

// Executar a função
criarUsuarioPesca();
