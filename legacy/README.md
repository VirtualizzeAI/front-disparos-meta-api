# Disparos WhatsApp - Fabrica Neural

Sistema de disparos em massa para WhatsApp Business API com interface moderna e intuitiva.

## 🚀 Funcionalidades

### 1. Dashboard
- Visualização de todos os disparos realizados
- Estatísticas em tempo real (total de disparos, em andamento, concluídos, total de contatos)
- Tabela com histórico completo de campanhas
- Status de cada disparo (Em Andamento, Concluído, Interrompida)

### 2. Novo Disparo
- Interface dividida em duas colunas:
  - **Esquerda**: Formulário de configuração
    - Nome da campanha
    - Seleção de template do Facebook
    - Upload de mídia (imagem ou vídeo)
    - Upload de planilha de contatos (Excel ou CSV)
  - **Direita**: Prévia em tempo real de como a mensagem aparecerá no WhatsApp

### 3. Perfil
- Gerenciamento de informações da conta
- Alteração de nome e email
- Mudança de senha com validação

### 4. Número Conectado
- Configuração das credenciais do WhatsApp Business API
- Token do Facebook
- ID do número de telefone
- ID da conta WABA

## 🎨 Design

O sistema utiliza um design moderno com:
- **Glassmorphism**: Efeitos de vidro translúcido
- **Gradientes vibrantes**: Cores dinâmicas e atraentes
- **Animações suaves**: Transições e micro-interações
- **Dark mode**: Interface escura elegante
- **Responsivo**: Adaptável a diferentes tamanhos de tela

## 📁 Estrutura de Arquivos

```
Disparos WABA Meta/
├── login.html      # Tela de login
├── login.css       # Estilos da tela de login
├── login.js        # Lógica de autenticação
├── index.html      # Estrutura HTML principal (dashboard)
├── styles.css      # Sistema de design e estilos
├── app.js          # Lógica da aplicação
└── config.js       # Configuração de API
```

## ⚙️ Configuração

### 1. Autenticação

O sistema possui uma tela de login moderna que protege o acesso ao dashboard. Para acessar:

1. Abra `login.html` no navegador
2. Digite suas credenciais (email e senha)
3. Clique em "Entrar"

**Endpoint de autenticação:**
- `POST /api/auth-login` - Fazer login
  - Body: `{ "email": "...", "password": "...", "rememberMe": true/false }`
  - Retorna: `{ "token": "...", "user": {...} }`

Após o login bem-sucedido, você será redirecionado para o dashboard. Para sair, clique no botão "Sair" no menu lateral.

### 2. Configurar URL do Backend

A URL base da API já está configurada para o webhook da Fabrica Neural:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://auto.fabricaneural.ia.br/webhook',
    // ...
};
```

O sistema espera os seguintes endpoints no backend:

> [!IMPORTANT]
> Todos os dados (IDs, tokens, etc.) devem ser enviados no **body** das requisições, pois o sistema utiliza webhooks que não aceitam query parameters.

- `POST /api/blasts-create` - Criar novo disparo
  - Body: FormData com campos:
    - `campaignName`: string
    - `template`: string
    - `media`: file (opcional)
    - `contacts`: file (planilha)

- `GET /api/blasts` - Listar disparos
- `POST /api/blasts-get` - Detalhes de um disparo
  - Body: `{ "id": "blast_id" }`
- `POST /api/profile-update` - Atualizar perfil
  - Body: `{ "name": "...", "email": "..." }`
- `POST /api/profile-change-password` - Alterar senha
  - Body: `{ "currentPassword": "...", "newPassword": "..." }`
- `POST /api/waba-config` - Atualizar configurações WABA
  - Body: `{ "token": "...", "phoneNumberId": "...", "wabaId": "..." }`
- `GET /api/templates` - Listar templates disponíveis

## 🚀 Como Usar

### Executar Localmente

1. Abra o arquivo `index.html` diretamente no navegador, ou
2. Use um servidor local:

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server -p 8000
```

3. Acesse `http://localhost:8000` no navegador

### Criar um Novo Disparo

1. Clique em "Novo Disparo" no menu lateral ou no botão do Dashboard
2. Preencha o nome da campanha
3. Selecione um template do Facebook
4. (Opcional) Faça upload de uma imagem ou vídeo
5. Faça upload da planilha de contatos
6. Visualize a prévia no lado direito
7. Clique em "Iniciar Disparo"

### Configurar Credenciais WABA

1. Acesse "Número Conectado" no menu
2. Insira o Token do Facebook
3. Insira o ID do Número
4. Insira o ID da Conta WABA
5. Clique em "Salvar Configurações"

## 🔧 Personalização

### Cores e Temas

As cores podem ser personalizadas no arquivo `styles.css` através das variáveis CSS:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --bg-primary: #0f0f1e;
    --text-primary: #ffffff;
    /* ... */
}
```

### Templates de Mensagem

Os templates podem ser adicionados/modificados na função `updatePreview()` no arquivo `app.js`:

```javascript
const templateMessages = {
    'template1': 'Sua mensagem aqui...',
    'template2': 'Outra mensagem...',
    // Adicione mais templates
};
```

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a:
- Desktop (1200px+)
- Tablet (768px - 1200px)
- Mobile (< 768px)

## 🔒 Segurança

- Validação de formulários no frontend
- Suporte para autenticação via token (configurável em `config.js`)
- Armazenamento local de configurações (pode ser substituído por backend)

## 🐛 Solução de Problemas

### O disparo não está sendo enviado

1. Verifique se a URL do backend está correta em `config.js`
2. Abra o Console do navegador (F12) para ver erros
3. Verifique se todos os campos obrigatórios estão preenchidos

### A prévia não está aparecendo

1. Verifique se o arquivo de mídia é válido (imagem ou vídeo)
2. Verifique o tamanho do arquivo (máximo 16MB)
3. Limpe o cache do navegador

## 📄 Licença

Este projeto foi desenvolvido para Fabrica Neural.

## 🤝 Suporte

Para suporte e dúvidas, entre em contato com a equipe de desenvolvimento.
