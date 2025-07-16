import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando processo de build para produção...');

try {
  // Limpar diretório de build anterior
  if (fs.existsSync('dist')) {
    console.log('🗑️  Limpando diretório dist anterior...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Compilar cliente
  console.log('⚡ Compilando cliente...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar se o build do cliente foi criado
  if (fs.existsSync('client/dist')) {
    const files = fs.readdirSync('client/dist');
    console.log('📂 Arquivos no build:', files.slice(0, 10).join(', ') + (files.length > 10 ? '...' : ''));
  }

  // Criar diretório dist se não existir
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Compilar servidor TypeScript para JavaScript
  console.log('⚡ Compilando servidor TypeScript...');
  execSync('npx tsc server/index.ts --outDir dist --target es2020 --module es2020 --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule --skipLibCheck --moduleResolution node --lib es2020,dom', { stdio: 'inherit' });

  // Compilar outros arquivos TypeScript do servidor se existirem
  const serverFiles = ['routes.ts', 'storage.ts', 'firebase-config.ts', 'dynamic-stats-config.ts'];
  for (const file of serverFiles) {
    const filePath = path.join('server', file);
    if (fs.existsSync(filePath)) {
      console.log(`⚡ Compilando ${file}...`);
      execSync(`npx tsc ${filePath} --outDir dist --target es2020 --module es2020 --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule --skipLibCheck --moduleResolution node --lib es2020,dom`, { stdio: 'inherit' });
    }
  }

  // Compilar arquivos shared se existirem
  const sharedFiles = ['schema.ts', 'schema2.ts'];
  for (const file of sharedFiles) {
    const filePath = path.join('shared', file);
    if (fs.existsSync(filePath)) {
      console.log(`⚡ Compilando shared/${file}...`);
      execSync(`npx tsc ${filePath} --outDir dist/shared --target es2020 --module es2020 --esModuleInterop --allowSyntheticDefaultImports --resolveJsonModule --skipLibCheck --moduleResolution node --lib es2020,dom`, { stdio: 'inherit' });
    }
  }

  // Verificar se o servidor JavaScript compilado existe
  const serverJsPath = path.join('dist', 'server', 'index.js');
  if (fs.existsSync(serverJsPath)) {
    console.log('✅ Servidor JavaScript compilado com sucesso em dist/server/index.js');
  } else {
    console.log('⚠️  Arquivo dist/server/index.js não encontrado após compilação');
  }

  console.log('✅ Processo de build concluído com sucesso');

} catch (error) {
  console.error('❌ Erro durante o processo de build:', error.message);
  process.exit(1);
}