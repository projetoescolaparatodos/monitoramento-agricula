
const admin = require('firebase-admin');

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

async function createSecretarioUser() {
  try {
    // ✏️ EDITE AQUI: Dados do novo secretário
    const email = 'secretario2@semapa.gov.br';  // ← Altere o email aqui
    const password = 'Secretario2025!';         // ← Altere a senha aqui
    const nome = 'Nome do Secretário';           // ← Altere o nome aqui

    console.log('🔐 Criando usuário secretário...');
    console.log('📧 Email:', email);
    console.log('👤 Nome:', nome);

    // Criar usuário no Firebase Auth
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: nome,
      emailVerified: true
    });

    console.log('✅ Usuário criado no Firebase Auth');
    console.log('🆔 UID:', userRecord.uid);
    console.log('');
    console.log('🎉 CONTA CRIADA COM SUCESSO!');
    console.log('');
    console.log('📝 CREDENCIAIS DE ACESSO:');
    console.log('   • Email:', email);
    console.log('   • Senha:', password);
    console.log('');
    console.log('🔗 COMO USAR:');
    console.log('   1. Acesse: /login/admin-gestor');
    console.log('   2. Faça login com as credenciais acima');
    console.log('   3. O sistema criará automaticamente o registro no Firestore');
    console.log('   4. Você será redirecionado para /admin/secretario');
    console.log('');
    console.log('⚠️  IMPORTANTE:');
    console.log('   - O registro completo será criado automaticamente no primeiro login');
    console.log('   - O usuário terá acesso ao Painel do Secretário');
    console.log('   - As permissões são: read, write, manage_reports');
    console.log('');

  } catch (error) {
    console.error('❌ Erro ao criar usuário secretário:', error);
    
    if (error.code === 'auth/email-already-exists') {
      console.log('');
      console.log('💡 Este email já existe no Firebase Auth.');
      console.log('   Para recriar, primeiro delete o usuário existente ou use outro email.');
    }
  } finally {
    process.exit(0);
  }
}

createSecretarioUser();
