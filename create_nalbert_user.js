
const admin = require('firebase-admin');

// Verificar se as variáveis de ambiente estão definidas
const requiredEnvVars = [
  'FIREBASE_PRIVATE_KEY_ID',
  'FIREBASE_PRIVATE_KEY', 
  'FIREBASE_CLIENT_EMAIL',
  'FIREBASE_CLIENT_ID',
  'FIREBASE_CLIENT_X509_CERT_URL'
];

console.log('🔍 Verificando variáveis de ambiente...');
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Variável de ambiente ${envVar} não está definida`);
    process.exit(1);
  } else {
    console.log(`✅ ${envVar}: definida`);
  }
}

// Configurar Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "transparencia-agricola",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://transparencia-agricola-default-rtdb.firebaseio.com"
  });
  console.log('✅ Firebase Admin SDK inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase Admin SDK:', error);
  process.exit(1);
}

async function createNalbertUser() {
  try {
    const email = 'nalbertlwks@gmail.com';
    const password = 'bryann2025';

    console.log('🔍 Verificando se o usuário já existe...');
    
    // Verificar se o usuário já existe no Auth
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log('👤 Usuário já existe no Firebase Auth:', userRecord.uid);
    } catch (authError) {
      if (authError.code === 'auth/user-not-found') {
        console.log('📝 Criando usuário no Firebase Auth...');
        userRecord = await admin.auth().createUser({
          email: email,
          password: password,
          displayName: 'Nalbert',
          emailVerified: true
        });
        console.log('✅ Usuário criado no Firebase Auth:', userRecord.uid);
      } else {
        throw authError;
      }
    }

    // Verificar se o documento já existe no Firestore
    const userDocRef = admin.firestore().collection('usuarios_admin').doc(userRecord.uid);
    const userDoc = await userDocRef.get();

    if (userDoc.exists()) {
      console.log('📄 Documento já existe no Firestore. Atualizando...');
    } else {
      console.log('📝 Criando documento no Firestore...');
    }

    // Criar/atualizar documento no Firestore
    await userDocRef.set({
      email: email,
      nome: 'Nalbert',
      setor: 'admin', // Setor admin para acesso completo
      cargo: 'Administrador',
      permissions: ['read', 'write', 'delete', 'manage_users'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    }, { merge: true });

    console.log('✅ Documento do usuário Nalbert salvo no Firestore');
    console.log('');
    console.log('🎉 USUÁRIO CRIADO COM SUCESSO!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('🆔 UID:', userRecord.uid);
    console.log('🏢 Setor: admin (Administrador)');
    console.log('🎯 Acesso: Painel completo do Dashboard e área do gestor');
    console.log('');
    console.log('🔗 Links de acesso:');
    console.log('   • Login Gestor: /login/admin/gestor');
    console.log('   • Dashboard: /dashboard (após login)');

  } catch (error) {
    console.error('❌ Erro ao criar usuário Nalbert:', error);
    
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-exists':
          console.log('💡 O email já existe. Tentando apenas criar o documento no Firestore...');
          break;
        case 'auth/invalid-email':
          console.log('💡 Email inválido fornecido');
          break;
        case 'auth/weak-password':
          console.log('💡 Senha muito fraca');
          break;
        default:
          console.log('💡 Código do erro:', error.code);
      }
    }
  } finally {
    process.exit(0);
  }
}

createNalbertUser();
