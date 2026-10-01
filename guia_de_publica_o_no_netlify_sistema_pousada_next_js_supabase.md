# Guia de Publicação no Netlify: Sistema Pousada (Next.js + Supabase)

O Netlify oferece suporte nativo e otimizado ao **Next.js (App Router)** através do seu runtime oficial, suportando plenamente **Server Actions**, **Route Handlers** (APIs/Webhooks), **Server-Side Rendering (SSR)** e otimização de imagens.

Abaixo está o passo a passo completo para preparar, configurar e publicar o sistema da pousada com integração ao Supabase.

---

## 1. Preparação do Projeto Next.js

### 1.1. Arquivo de Configuração do Netlify (`netlify.toml`)
Embora o Netlify detecte o Next.js automaticamente, criar um arquivo `netlify.toml` na raiz do projeto padroniza o build e evita falhas de versão:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

# O plugin oficial do Next.js é injetado automaticamente pelo Netlify,
# mas pode ser declarado explicitamente se necessário:
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### 1.2. Configuração do `next.config.mjs` (ou `.js`)
Certifique-se de que os domínios externos do Supabase Storage estejam liberados para o componente `<Image />` do Next.js (fotos dos quartos e chalés):

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Permite fotos armazenadas nos buckets do Supabase
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Se estiver usando imagens de demonstração
      }
    ],
  },
};

export default nextConfig;
```

---

## 2. Publicação via Painel Web do Netlify (Recomendado)

O método mais seguro e prático conecta seu repositório Git (GitHub, GitLab ou Bitbucket) para habilitar *Continuous Deployment* (a cada `git push`, um deploy de produção é disparado automaticamente).

### Passo 1: Conectar o Repositório
1. Acesse sua conta em [app.netlify.com](https://app.netlify.com).
2. Clique no botão **"Add new site"** > **"Import an existing project"**.
3. Escolha seu provedor Git (ex: **GitHub**) e selecione o repositório do sistema da pousada.

### Passo 2: Parâmetros de Build
O Netlify identificará o Next.js e preencherá as opções automaticamente:
* **Base directory:** *(deixe em branco caso a raiz seja o Next.js)*
* **Build command:** `npm run build`
* **Publish directory:** `.next`

---

## 3. Configuração das Variáveis de Ambiente no Netlify

Esta é a etapa mais crítica. O Next.js precisa das credenciais do Supabase para conectar o banco e a autenticação durante o SSR e Server Actions.

1. No painel de configuração do seu site no Netlify, vá em:
   **Site configuration** > **Environment variables** > **Add a variable** (ou **Import from .env**).
2. Cadastre as seguintes chaves:

| Variável | Onde Obter no Supabase | Finalidade |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | *Project Settings > API > Project URL* | URL pública da API do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *Project Settings > API > Project API Keys (anon/public)* | Chave pública do cliente no navegador |
| `SUPABASE_SERVICE_ROLE_KEY` | *Project Settings > API > Project API Keys (service_role)* | **Segredo de admin** (usado nos webhooks de pagamento) |
| `PAYMENT_WEBHOOK_SECRET` | Painel do gateway (Stripe/Mercado Pago/Asaas) | Validação de assinatura do webhook de reserva |

> **Atenção:** A chave `SUPABASE_SERVICE_ROLE_KEY` nunca deve ter o prefixo `NEXT_PUBLIC_`, pois concede acesso administrativo irrestrito contornando as políticas de RLS.

3. Clique em **"Deploy site"**.

---

## 4. Publicação Alternativa via Linha de Comando (Netlify CLI)

Caso queira publicar diretamente do seu terminal sem conectar um repositório Git:

```bash
# 1. Instalar a CLI globalmente
npm install -g netlify-cli

# 2. Fazer login na sua conta Netlify
netlify login

# 3. Vincular ou inicializar o site na pasta do projeto
netlify init

# 4. Enviar as variáveis de ambiente locais para o Netlify
netlify env:import .env.local

# 5. Executar o build e fazer deploy em produção
netlify deploy --build --prod
```

---

## 5. Ajustes Obrigatórios no Supabase após o Deploy

Assim que o Netlify gerar sua URL de produção (ex: `https://pousada-villa-serena.netlify.app`), é indispensável atualizar duas configurações no painel do Supabase:

### 5.1. URLs de Redirecionamento da Autenticação (Auth)
Para que o login dos funcionários da pousada e a recuperação de senha funcionem:
1. No painel do Supabase, acesse **Authentication** > **URL Configuration**.
2. No campo **Site URL**, altere para a URL de produção do Netlify:
   `https://pousada-villa-serena.netlify.app`
3. Em **Redirect URLs**, adicione a rota de callback do Supabase SSR:
   `https://pousada-villa-serena.netlify.app/auth/callback`
   *(Adicione também `http://localhost:3000/auth/callback` para continuar desenvolvendo localmente).*

### 5.2. Webhooks de Pagamento (Gateway)
Cadastre a URL do Route Handler no seu provedor de pagamentos (Asaas, Mercado Pago ou Stripe):
`https://pousada-villa-serena.netlify.app/api/webhooks/payment`

---

## 6. Configuração de Domínio Próprio e SSL

Para utilizar um domínio profissional (ex: `pousadavillaserena.com.br`):

1. No Netlify, acesse **Domain management** > **Add a domain**.
2. Digite seu domínio registrado (ex: no Registro.br ou GoDaddy).
3. No seu provedor de DNS, configure os apontamentos:
   * **Registro CNAME (para subdomínio www):**
     * Host: `www`
     * Aponta para: `pousada-villa-serena.netlify.app`
   * **Registro A (para domínio raiz/apex):**
     * Host: `@`
     * Aponta para o IP do balanceador Netlify: `75.2.60.5`
4. O certificado de segurança HTTPS (SSL Let's Encrypt) é emitido e renovado de forma 100% automática e gratuita pelo Netlify em até alguns minutos após a propagação do DNS.

---

## 7. Checklist Final de Verificação Pós-Deploy

- [ ] **Acesso público:** A página inicial carrega os chalés e fotos sem erro de imagem.
- [ ] **Fluxo de reserva:** Criar uma reserva teste e verificar se o registro surge na tabela `bookings` do Supabase.
- [ ] **Bloqueio de overbooking:** Tentar reservar o mesmo quarto no mesmo período em uma janela anônima e verificar se o erro de duplicidade é retornado adequadamente.
- [ ] **Painel administrativo:** Efetuar login com as credenciais de staff e testar o botão de liberação de governança/limpeza.