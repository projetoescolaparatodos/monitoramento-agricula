import admin from 'firebase-admin';

// Configurar Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: "transparencia-agricola",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://transparencia-agricola-default-rtdb.firebaseio.com"
});

async function createWilliamAdmin() {
  try {
    const email = 'secwilliam@gmail.com';
    const password = 'semapa2025';

    console.log('🔍 Verificando se o usuário já existe...');
    
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
          displayName: 'William - Administrador',
          emailVerified: true
        });
        console.log('✅ Usuário criado no Firebase Auth:', userRecord.uid);
      } else {
        throw authError;
      }
    }

    // Criar/atualizar documento no Firestore
    console.log('📄 Criando/atualizando documento no Firestore...');
    await admin.firestore().collection('usuarios_admin').doc(userRecord.uid).set({
      email: email,
      nome: 'William - Administrador',
      setor: 'admin', // Setor admin = acesso total
      cargo: 'Administrador/Secretário',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_reports', 'full_access'],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      active: true
    }, { merge: true });

    console.log('\n✅ CONTA CRIADA COM SUCESSO!');
    console.log('═══════════════════════════════════════');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('👤 Nome: William - Administrador');
    console.log('🏢 Setor: admin (Acesso Total)');
    console.log('💼 Cargo: Administrador/Secretário');
    console.log('🎯 Permissões: Acesso completo a todas as áreas');
    console.log('═══════════════════════════════════════');
    console.log('\n✨ Pode fazer login em:');
    console.log('   • /login/admin/gestor (Área do Secretário)');
    console.log('   • Todas as outras áreas administrativas');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
    if (error.message) {
      console.error('Mensagem:', error.message);
    }
  } finally {
    process.exit(0);
  }
}

createWilliamAdmin();
