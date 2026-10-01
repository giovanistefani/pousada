# Pousada Villa Serena

**Esta versão publicada é uma demonstração. O sistema não está pronto para produção.**

Portal de reservas e painel da recepção. Next.js (App Router). Sem as variáveis do Supabase, o site inteiro usa dados fictícios no navegador. Com essas variáveis, e sem `NEXT_PUBLIC_DEMO_ONLY`, o login e as reservas passam a usar o banco.

O arquivo `pousada_villa_serena_sistema_de_reservas_e_gest_o.tsx` é o protótipo original, só de interface. O app fica em `src/`.

## O que o sistema faz

- O hóspede busca quartos por data, capacidade e categoria.
- A reserva é gravada por `create_booking_atomic`. O preço sai da diária do quarto, no banco.
- Uma constraint de exclusão (`daterange`) impede duas reservas ativas no mesmo quarto e período. O check-out de um hóspede pode coincidir com o check-in do próximo.
- A consulta pública do voucher exige código **e** e-mail. A tabela `bookings` não fica aberta para anônimos.
- A equipe entra com e-mail e senha. Só quem tem linha em `profiles` com papel `staff` ou `admin` acessa `/admin`.
- Check-in marca o quarto como ocupado. Check-out manda para limpeza. Cancelar tira a reserva da trava de datas.
- O painel escuta alterações de `rooms` e `bookings` via Realtime.

## Subir o banco

1. Crie um projeto no [Supabase](https://supabase.com/dashboard).
2. No SQL Editor, execute `supabase/migrations/20261001160000_initial_schema.sql`.
3. Em **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` no desenvolvimento, e a URL do Netlify em produção.
   - Redirect URLs: `http://localhost:3000/auth/callback` e `https://SEU-SITE.netlify.app/auth/callback`.
4. Em **Project Settings → API**, mantenha o schema exposto apenas como `public`. O schema `private` guarda as funções com `security definer` e não deve aparecer na Data API.
5. Crie o usuário da recepção em **Authentication → Users**.
6. No SQL Editor, vincule esse usuário (troque o UUID):

```sql
insert into public.profiles (id, full_name, role)
values ('UUID-DO-USUARIO', 'Recepção Villa Serena', 'admin');
```

O papel não fica em `user_metadata`. Quem se cadastrar sozinho não vira equipe.

## Ambiente local

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Variável | Uso |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anon ou publishable. Pode ir para o browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Só no servidor: webhook de pagamento e feed iCal |
| `PAYMENT_WEBHOOK_SECRET` | Cabeçalho `x-signature-token` do gateway |
| `ICAL_FEED_SECRET` | Token de `/api/ical/RM-101?token=...` |

## Demonstração sem Supabase

Sem `NEXT_PUBLIC_SUPABASE_URL` e a chave anon, o app não fala com o banco. Portal e `/admin` usam um cenário fictício neste navegador (`localStorage`, chave `pousada-demo-v1`).

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. O painel demonstrativo fica em `http://localhost:3000/admin/dashboard`, sem senha. O aviso de ambiente demonstrativo permanece na tela. **Restaurar dados demonstrativos** volta ao cenário inicial e apaga solicitações feitas na sessão.

O hóspede envia uma solicitação. O período fica bloqueado na hora, ainda sem confirmação. No painel dá para confirmar, recusar, cancelar, fazer check-in e checkout. O dashboard, o calendário e a busca pública acompanham essas mudanças. Não há e-mail, pagamento nem gravação no Supabase.

Com as variáveis preenchidas, `/admin` volta a exigir login de equipe e as reservas usam o banco. A rota `/admin/calendario` existe só na demonstração. O schema e as migrations não incluem os estados `requested` e `rejected`.

## Demonstração na internet

O site demonstrativo no Netlify **não** usa Supabase, login, e-mail nem pagamento. O painel `/admin/dashboard` é público de propósito e só contém dados fictícios. Cada navegador guarda as solicitações em `localStorage` (`pousada-demo-v1`). Outro computador não vê o que foi feito aqui. Limpar os dados do site apaga a sessão. **Restaurar dados demonstrativos** volta ao cenário inicial. Não há banco compartilhado no servidor.

A demonstração publicada está em https://pousada-villa-serena-demo.netlify.app. O painel é https://pousada-villa-serena-demo.netlify.app/admin/dashboard. O passo a passo está em `docs/deploy/NETLIFY_DEMONSTRACAO.md`.

Para subir localmente, sem variáveis:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000` e `http://localhost:3000/admin/dashboard`.

## Publicar o site real, quando existir

Isto **não** é o site demonstrativo. Use outro site no Netlify, sem `NEXT_PUBLIC_DEMO_ONLY`.

O Next.js 16 é detectado automaticamente. O `netlify.toml` fixa Node 22 e não prende a versão do adaptador, para o Netlify continuar atualizando o runtime OpenNext. Não copie o plugin `@netlify/plugin-nextjs` do guia antigo.

1. Importe o repositório em [app.netlify.com](https://app.netlify.com).
2. Build command: `npm run build`. Publish directory: `.next`.
3. Nesse site de produção, cadastre as variáveis da tabela acima. A service role não pode ter prefixo `NEXT_PUBLIC_`. Não importe `.env.local` no site demonstrativo.
4. Depois do primeiro deploy, atualize a Site URL e as Redirect URLs no Supabase para o domínio do Netlify.
5. No gateway de pagamento, aponte o webhook para `https://SEU-SITE.netlify.app/api/webhooks/payment`.
6. O calendário de um quarto, sem nome de hóspede, fica em `https://SEU-SITE.netlify.app/api/ical/RM-101?token=SEU_ICAL_FEED_SECRET`.

Fotos podem continuar como URL externa ou ir para o bucket público `room-images`.
