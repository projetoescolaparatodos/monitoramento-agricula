
# 📋 Como Criar Contas de Secretários

## 🎯 Visão Geral

O sistema possui **auto-registro** para secretários. Quando alguém faz login pela primeira vez na área do gestor, o sistema cria automaticamente o registro no Firestore.

---

## 🚀 Método 1: Auto-Registro (Recomendado)

### Passo 1: Criar usuário no Firebase Auth

Execute o script:

```bash
node create_secretario_user.js
```

### Passo 2: Editar credenciais no script

Abra `create_secretario_user.js` e edite estas linhas:

```javascript
const email = 'secretario2@semapa.gov.br';  // ← Altere o email aqui
const password = 'Secretario2025!';         // ← Altere a senha aqui
const nome = 'Nome do Secretário';          // ← Altere o nome aqui
```

### Passo 3: Executar o script

```bash
node create_secretario_user.js
```

### Passo 4: Primeiro Login

1. Acesse: `/login/admin-gestor`
2. Faça login com as credenciais criadas
3. ✨ O sistema cria automaticamente o registro no Firestore
4. Você é redirecionado para `/admin/secretario`

---

## 🔧 Método 2: Criar Múltiplos Secretários

Para criar várias contas de uma vez, edite o script `create_secretario_user.js`:

```javascript
async function createMultipleSecretarios() {
  const secretarios = [
    { email: 'secretario1@semapa.gov.br', password: 'Senha1!', nome: 'João Silva' },
    { email: 'secretario2@semapa.gov.br', password: 'Senha2!', nome: 'Maria Santos' },
    { email: 'secretario3@semapa.gov.br', password: 'Senha3!', nome: 'Pedro Costa' },
  ];

  for (const secretario of secretarios) {
    try {
      const userRecord = await admin.auth().createUser({
        email: secretario.email,
        password: secretario.password,
        displayName: secretario.nome,
        emailVerified: true
      });
      console.log(`✅ ${secretario.nome} criado - UID: ${userRecord.uid}`);
    } catch (error) {
      console.error(`❌ Erro ao criar ${secretario.email}:`, error.message);
    }
  }
}
```

---

## 📊 Permissões dos Secretários

Quando o sistema cria automaticamente o registro, o secretário recebe:

- **Setor**: `coordenacao`
- **Cargo**: `Secretário`
- **Permissões**: `['read', 'write', 'manage_reports']`
- **Acesso**: Painel do Secretário (`/admin/secretario`)

---

## 🔐 Estrutura no Firestore

Coleção: `usuarios_admin/{uid}`

```json
{
  "email": "secretario@semapa.gov.br",
  "nome": "Nome do Secretário",
  "setor": "coordenacao",
  "cargo": "Secretário",
  "permissions": ["read", "write", "manage_reports"],
  "createdAt": "2025-01-23T10:00:00.000Z",
  "updatedAt": "2025-01-23T10:00:00.000Z",
  "active": true,
  "firstLogin": true
}
```

---

## ⚠️ Observações Importantes

1. **Email único**: Cada secretário precisa de um email único
2. **Senha forte**: Use senhas com letras, números e caracteres especiais
3. **Auto-registro**: O registro no Firestore é criado automaticamente no primeiro login
4. **Sem necessidade de script adicional**: Não precisa criar documento manualmente no Firestore

---

## 🆘 Solução de Problemas

### Erro: "Email already exists"
- O email já está cadastrado no Firebase Auth
- Escolha outro email ou delete o usuário existente

### Erro: "Weak password"
- A senha precisa ter pelo menos 6 caracteres
- Use letras maiúsculas, minúsculas, números e símbolos

### Erro: "User not authorized"
- Verifique se o login está sendo feito em `/login/admin-gestor`
- O auto-registro só funciona nesta página específica

---

## 📞 Suporte

Para mais ajuda, consulte a documentação do Firebase:
https://firebase.google.com/docs/auth
