
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

async function criarUsuarioPAA() {
  try {
    const uid = "7r1pUPOFOwUYp5lCuR5t8AJ1ohw1";
    const email = "paasemapa@gmail.com";
    const setor = "paa";

    // Criar documento na coleção usuarios_admin
    await setDoc(doc(db, 'usuarios_admin', uid), {
      email: email,
      setor: setor,
      dataCriacao: new Date().toISOString(),
      ativo: true
    });

    console.log('✅ Usuário do PAA criado com sucesso!');
    console.log(`📧 Email: ${email}`);
    console.log(`🏪 Setor: ${setor}`);
    console.log(`🆔 UID: ${uid}`);
    console.log('🔗 O usuário agora pode acessar: /login/admin/paa');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
  }
}

// Executar a função
criarUsuarioPAA()
  .then(() => {
    console.log('🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erro na execução:', error);
    process.exit(1);
  });
