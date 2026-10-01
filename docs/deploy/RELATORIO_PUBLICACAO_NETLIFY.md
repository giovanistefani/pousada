# Relatório — publicação no Netlify

Data: 2026-10-01. **Não houve deploy.** O sistema não está pronto para produção.

## 1. Diagnóstico inicial

O app é Next.js 16.3.8 (App Router), npm, lockfile presente, Node local v22.22.1. O `netlify.toml` já usava `npm run build`, publish `.next` e Node 22, sem fixar `@netlify/plugin-nextjs`. Isso coincide com o runtime OpenNext atual. O guia antigo pede Node 20 e o plugin; esses itens não foram copiados.

A demonstração liga quando não há URL e chave do Supabase. O painel `/admin` sem essas variáveis não pede login e mostra a faixa de dados fictícios. O estado fica em `localStorage`, chave `pousada-demo-v1`.

Git: branch `main`, nenhum commit. Remote `git@github.com:giovanistefani/pousada.git`. O GitHub https://github.com/giovanistefani/pousada existe, é público e não tem branch padrão com commits.

Netlify CLI: `Not logged in`. Não há site vinculado nesta máquina. Não existe `.env` nem `.env.local` no projeto.

## 2. Arquivos alterados

- `netlify.toml` — `NEXT_PUBLIC_DEMO_ONLY=true` no ambiente de build, e um comentário para não seguir o guia antigo
- `src/lib/supabase/env.ts` — com essa variável, as chaves do Supabase são ignoradas
- `src/lib/supabase/env.test.ts` — cobre ausência, presença e trava
- `package.json` — `npm test` inclui o teste da trava
- `README.md`
- `docs/deploy/NETLIFY_DEMONSTRACAO.md`
- `docs/deploy/RELATORIO_PUBLICACAO_NETLIFY.md`

Nada de migration, schema, segredo ou commit.

## 3. Configurações realizadas

Build no Netlify: `npm run build`, publish `.next`, Node 22, `NEXT_PUBLIC_DEMO_ONLY=true`.

Nenhuma variável do Supabase foi cadastrada. `.env.local` não foi importado. Não há credencial no código.

Sem `NEXT_PUBLIC_DEMO_ONLY`, o comportamento local continua o mesmo: sem as chaves, demonstração; com URL e chave, login real. O `npm run dev` desta máquina não lê o `netlify.toml`, então a trava não muda a demonstração local já validada.

## 4. Resultado dos testes

**PASS.** `npm test`: 21 testes, 0 falhas (regras da demonstração e a trava `NEXT_PUBLIC_DEMO_ONLY`).

**PASS.** `npx eslint src --max-warnings 0`.

**PASS.** `npx tsc --noEmit --incremental false`.

## 5. Resultado do build

**PASS.** `npm run build` compilou o Next.js 16.3.8 e listou as rotas públicas, administrativas, o webhook e o iCal. Esse build local não publica o site.

## 6. URL publicada

**BLOCKED.** A CLI não está autenticada (`npx netlify status` → `Not logged in`). Nenhuma URL foi criada. Não afirmo que o site está no ar.

## 7. Branch publicada

**BLOCKED.** A branch local é `main` e não tem commits. Nada foi enviado ao GitHub. Commit e push não foram feitos: a publicação pediu autorização explícita antes dessas ações.

## 8. Validação do fluxo público

**NOT TESTED** no ambiente remoto. Não existe URL. O fluxo local já tinha sido exercido na implementação do MVP.

## 9. Validação do painel administrativo

**NOT TESTED** no ambiente remoto, pelo mesmo motivo.

## 10. Limitações identificadas

- O painel demonstrativo, quando publicado, será público. A faixa de aviso precisa permanecer. Não coloque dados reais.
- Cada visitante tem o próprio `localStorage`. Não há sincronização.
- Webhook de pagamento e iCal continuam no código e respondem 401 sem segredo. A demonstração não os chama.
- Um segundo site, sem `NEXT_PUBLIC_DEMO_ONLY` e com as chaves, seria o produto real. Este `netlify.toml` não serve para esse site sem remover a trava.

## 11. Pendências para produção

- Autenticar a CLI (`npx netlify login`) ou importar o repositório em app.netlify.com depois de existir um commit em `main`.
- Autorizar commit e push se a publicação for pela integração Git.
- Confirmar a URL e repetir os testes do portal, do painel, da faixa, da restauração e do isolamento.
- Produto real, em outro momento e em outro site: Supabase, login, e-mail e as regras do banco. Este deploy não faz isso.

## Como destravar

1. `npx netlify login`
2. Autorizar o commit da branch `main` e o push para https://github.com/giovanistefani/pousada, ou autorizar só `npx netlify deploy --build --prod` num site novo, sem variáveis do Supabase.
3. Testar a URL e atualizar este relatório. Não declarar produção.
