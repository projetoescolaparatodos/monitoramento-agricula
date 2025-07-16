
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Iniciando processo de build para produção...');

try {
  // Limpar diretório de build anterior
  if (fs.existsSync('dist')) {
    console.log('🗑️  Limpando diretório dist anterior...');
    fs.rmSync('dist', { recursive: true, force: true });
  }

  // Criar diretório dist se não existir
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // Compilar cliente
  console.log('⚡ Compilando cliente...');
  execSync('npm run build', { stdio: 'inherit' });

  // Verificar se o build do cliente foi criado
  if (fs.existsSync('client/dist')) {
    const files = fs.readdirSync('client/dist');
    console.log('📂 Arquivos no build:', files.slice(0, 10).join(', ') + (files.length > 10 ? '...' : ''));
  }

  // Criar tsconfig temporário para compilação
  const tsconfigContent = {
    "compilerOptions": {
      "target": "es2020",
      "module": "es2020",
      "lib": ["es2020", "dom"],
      "outDir": "./dist",
      "rootDir": "./",
      "strict": false,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "skipLibCheck": true,
      "forceConsistentCasingInFileNames": true,
      "moduleResolution": "node",
      "resolveJsonModule": true,
      "declaration": false,
      "declarationMap": false,
      "sourceMap": false
    },
    "include": [
      "server/**/*",
      "shared/**/*"
    ],
    "exclude": [
      "node_modules",
      "client",
      "dist"
    ]
  };

  fs.writeFileSync('tsconfig.build.json', JSON.stringify(tsconfigContent, null, 2));

  // Compilar servidor TypeScript para JavaScript
  console.log('⚡ Compilando servidor TypeScript...');
  execSync('npx tsc --project tsconfig.build.json', { stdio: 'inherit' });

  // Remover tsconfig temporário
  fs.unlinkSync('tsconfig.build.json');

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
