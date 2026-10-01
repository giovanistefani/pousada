# Netlify — demonstração

Este site é uma demonstração navegável. **Não está pronto para produção.** Não há Supabase, login real, e-mail, pagamento nem banco compartilhado.

O guia `guia_de_publica_o_no_netlify_sistema_pousada_next_js_supabase.md` descreve o produto com banco. Não copie dele o Node 20, o plugin `@netlify/plugin-nextjs` nem o comando `netlify env:import .env.local`.

## Como distinguir demonstração e produção

| | Demonstração | Produção (ainda não publicada) |
| --- | --- | --- |
| Site | Este, com a faixa de aviso | Outro site no Netlify |
| `NEXT_PUBLIC_DEMO_ONLY` | `true` no `netlify.toml` | ausente |
| Variáveis do Supabase | não cadastrar | URL, chave anon, service role e segredos |
| `/admin` | aberto, dados fictícios | exige login e perfil `staff` ou `admin` |
| Dados | `localStorage` do navegador | Postgres |

Se as duas chaves do Supabase existirem no build e `NEXT_PUBLIC_DEMO_ONLY` não for `true`, o hóspede passa a gravar no banco. A trava no `netlify.toml` impede isso neste site.

## Configuração de build

Arquivo: `netlify.toml`.

- Comando: `npm run build`
- Diretório publicado: `.next`
- Node: 22 (a mesma linha usada no desenvolvimento, v22.22.1)
- Pacotes: npm, com `package-lock.json`
- Diretório do app: a raiz do repositório
- `NEXT_PUBLIC_DEMO_ONLY=true`
- Adaptador: o runtime OpenNext do Netlify, aplicado sozinho. Não adicionar `@netlify/plugin-nextjs`.

Não há variável obrigatória além dessa trava. Não cadastrar:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYMENT_WEBHOOK_SECRET`
- `ICAL_FEED_SECRET`

Não importar `.env.local`.

O App Router, as rotas de servidor e as Server Actions continuam no projeto. No modo demonstrativo o pedido do hóspede não chama essas actions: ele grava no navegador. As rotas `/api/webhooks/payment` e `/api/ical/[roomId]` respondem 401 sem o segredo e não são usadas na demonstração.

As fotos dos quartos são `<img>` apontando para o Unsplash. Não dependem do otimizador de imagens.

## Armazenamento

- Chave: `pousada-demo-v1`
- Vale só para aquele navegador
- Outro dispositivo não vê as solicitações
- Limpar o armazenamento do site apaga a demonstração
- **Restaurar dados demonstrativos** volta ao cenário fictício inicial
- Não existe persistência no servidor e não há sincronização entre visitantes

## Publicar

Repositório: https://github.com/giovanistefani/pousada

Em 2026-10-01 esse repositório ainda não tinha commits, e a CLI do Netlify nesta máquina respondia `Not logged in`. Sem login não há URL. Sem commit autorizado, a integração Git também não constrói o site.

Quando houver autorização para commit e push na branch `main`:

1. Entre em https://app.netlify.com e importe `giovanistefani/pousada`.
2. Confirme o build: `npm run build`, publish `.next`, Node 22.
3. Não adicione variáveis do Supabase. A trava `NEXT_PUBLIC_DEMO_ONLY` já está no `netlify.toml`.
4. Publique a branch `main`.
5. Anote a URL `https://SEU-SITE.netlify.app` neste arquivo e no README.

Pela CLI, depois de `npx netlify login`, no diretório do projeto:

```bash
npx netlify sites:create --name pousada-villa-serena-demo
npx netlify link
npx netlify deploy --build --prod
```

Escolha um nome livre se `pousada-villa-serena-demo` já existir. Não use `netlify env:import`.

## Atualizar

Pela integração Git: commit na `main` e push. O Netlify reconstrói.

Pela CLI: `npx netlify deploy --build --prod` no mesmo site. Isso não cria commit.

## Testes depois da URL existir

Portal:

- Abrir a página inicial e ver as fotos.
- Buscar datas.
- Solicitar o Chalé Jardim.
- Ler a mensagem de solicitação recebida.
- Ver o período bloqueado na hora.

Painel, sem login, em `/admin/dashboard`:

- Faixa **AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS — OPERAÇÕES SIMULADAS**
- Achar a solicitação, confirmar, olhar dashboard e calendário.
- Restaurar os dados.

Isolamento:

- Abrir em outro navegador e ver o cenário inicial, sem a solicitação do primeiro.
- Na rede, não deve haver chamada obrigatória ao Supabase.
- Nada envia e-mail nem pagamento.

## Limitações

O painel demonstrativo é público. Não coloque dados reais nele. O sistema não está pronto para produção.
