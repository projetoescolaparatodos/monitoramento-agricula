
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Compilando servidor TypeScript para JavaScript...');

// Compilar TypeScript usando esbuild para maior compatibilidade
try {
  execSync('npx esbuild server/index.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:express --external:vite --format=cjs', {
    stdio: 'inherit'
  });
  
  console.log('✅ Servidor compilado com sucesso em dist/server.js');
  
  // Copiar outros arquivos necessários do servidor
  const serverFiles = ['routes.ts', 'vite.ts', 'storage.ts', 'firebase-config.ts'];
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  console.log('📁 Copiando arquivos auxiliares...');
  
} catch (error) {
  console.error('❌ Erro na compilação:', error.message);
  process.exit(1);
}
