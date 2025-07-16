
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando processo de build para produção...');

try {
  // Verificar se o diretório dist existe
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
    console.log('📁 Diretório dist criado');
  }

  // Build do cliente React/Vite
  console.log('📦 Executando build do cliente...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Verificar se o build do cliente foi criado
  const clientBuildPath = path.join('dist', 'public');
  if (!fs.existsSync(clientBuildPath)) {
    console.log('⚠️  Diretório dist/public não encontrado, tentando mover de dist...');
    
    // Se o Vite criou arquivos diretamente em dist/, mover para dist/public
    const distFiles = fs.readdirSync('dist').filter(file => 
      file !== 'server.js' && file !== 'public'
    );
    
    if (distFiles.length > 0) {
      if (!fs.existsSync(clientBuildPath)) {
        fs.mkdirSync(clientBuildPath, { recursive: true });
      }
      
      distFiles.forEach(file => {
        const srcPath = path.join('dist', file);
        const destPath = path.join(clientBuildPath, file);
        
        if (fs.statSync(srcPath).isDirectory()) {
          execSync(`cp -r "${srcPath}" "${destPath}"`, { stdio: 'inherit' });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      });
      
      console.log('✅ Arquivos movidos para dist/public');
    }
  }

  // Verificar se index.html existe
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ Build do cliente concluído com sucesso');
    console.log(`📄 index.html encontrado em: ${indexPath}`);
  } else {
    console.log('⚠️  index.html não encontrado, mas continuando...');
  }

  // Listar conteúdo do diretório de build
  if (fs.existsSync(clientBuildPath)) {
    const files = fs.readdirSync(clientBuildPath);
    console.log('📂 Arquivos no build:', files.slice(0, 10).join(', ') + (files.length > 10 ? '...' : ''));
  }

  console.log('✅ Processo de build concluído com sucesso');

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
