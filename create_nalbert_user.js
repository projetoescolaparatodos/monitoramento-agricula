
const admin = require('firebase-admin');

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://transparencia-agricola-default-rtdb.firebaseio.com"
});

async function createNalbertUser() {
  try {
    // Dados do usuário
    const userData = {
      email: 'nalbertlwks@gmail.com',
      password: 'bryann2025',
      displayName: 'Nalbert',
      emailVerified: true
    };

    // Criar usuário no Firebase Auth
    const userRecord = await admin.auth().createUser(userData);
    console.log('✅ Usuário Nalbert criado no Firebase Auth:', userRecord.uid);

    // Criar documento no Firestore
    await admin.firestore().collection('usuarios_admin').doc(userRecord.uid).set({
      email: userData.email,
      nome: userData.displayName,
      setor: 'admin', // Setor admin para acesso completo
      cargo: 'Administrador',
      permissions: ['read', 'write', 'delete', 'manage_users'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    });

    console.log('✅ Documento do usuário Nalbert criado no Firestore');
    console.log('📧 Email:', userData.email);
    console.log('🔑 Senha:', userData.password);
    console.log('🏢 Setor: admin (Administrador)');
    console.log('🎯 Acesso: Painel completo do Dashboard e área do gestor');

  } catch (error) {
    console.error('❌ Erro ao criar usuário Nalbert:', error);
  } finally {
    process.exit(0);
  }
}

createNalbertUser();
