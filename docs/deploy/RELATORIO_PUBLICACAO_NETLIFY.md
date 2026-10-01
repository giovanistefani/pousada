# Relatório — publicação no Netlify

Data: 2026-10-01. A demonstração está em https://pousada-villa-serena-demo.netlify.app. O sistema não está pronto para produção.

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

Nada de migration, schema ou segredo. O commit inicial da `main` é `3c37797`.

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

**PASS.** https://pousada-villa-serena-demo.netlify.app

Deploy `6abea238cdb667e2b8939e91`, feito pela CLI em 2026-10-01. O build automático do GitHub falhou na clonagem (`Host key verification failed`) e não é o que está no ar.

## 7. Branch publicada

**PASS** no GitHub. Commit `3c37797` na `main`: https://github.com/giovanistefani/pousada

O site no Netlify está ligado a esse repositório, mas o build via Git não concluiu. A URL de produção veio do upload da CLI.

## 8. Validação do fluxo público

**PASS** em https://pousada-villa-serena-demo.netlify.app

A página abre, mostra a faixa de demonstração e as fotos dos quartos. A busca de 01/10/2026 a 02/10/2026 deixa a Suíte Master e o Chalé Mirante indisponíveis. A solicitação do Chalé Jardim (Helena Demonstração, VS-6508) mostrou a mensagem de recebimento e desabilitou o botão daquele quarto.

## 9. Validação do painel administrativo

**PASS** em `/admin/dashboard`, sem login, com a faixa **AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS — OPERAÇÕES SIMULADAS**.

A solicitação VS-6508 foi confirmada. Os indicadores passaram a 2 solicitações e 3 confirmadas. O calendário mostra Helena. Webhook de pagamento e iCal respondem 401. Nenhuma requisição a `supabase.co` apareceu nesse fluxo.

Restauração no site publicado: **NOT TESTED** neste acesso. O botão está na tela; a operação já tinha sido coberta localmente.

## 10. Limitações identificadas

- O painel demonstrativo, quando publicado, será público. A faixa de aviso precisa permanecer. Não coloque dados reais.
- Cada visitante tem o próprio `localStorage`. Não há sincronização.
- Webhook de pagamento e iCal continuam no código e respondem 401 sem segredo. A demonstração não os chama.
- Um segundo site, sem `NEXT_PUBLIC_DEMO_ONLY` e com as chaves, seria o produto real. Este `netlify.toml` não serve para esse site sem remover a trava.

## 11. Pendências para produção

- O clone automático do GitHub no Netlify falhou. Um push novo pode não atualizar o site até essa conexão ser refeita, ou até um novo `npx netlify deploy --build --prod`.
- Isolamento em outro navegador no site publicado: **NOT TESTED**. O estado continua só no `localStorage` de cada navegador.
- Produto real, em outro site e sem `NEXT_PUBLIC_DEMO_ONLY`: Supabase, login, e-mail e as regras do banco. Este endereço não faz isso.

## Atualizar este site

Enquanto o clone do GitHub falhar, publique de novo com `npx netlify deploy --build --prod` na pasta do projeto, já ligada a `pousada-villa-serena-demo`. Não cadastre variáveis do Supabase. Não declare produção.
