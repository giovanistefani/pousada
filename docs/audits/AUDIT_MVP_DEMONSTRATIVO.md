# Auditoria técnica e funcional — MVP demonstrativo

Data da leitura: 2026-10-01.  
Escopo: inspeção do repositório em `/home/giovani/git/pousada`. Nenhum código de aplicação foi alterado nesta auditoria.

Classificação usada nas telas:

- IMPLEMENTADO E FUNCIONAL
- IMPLEMENTADO PARCIALMENTE
- IMPLEMENTADO SEM FUNCIONALIDADE REAL
- NÃO IMPLEMENTADO
- NÃO FOI POSSÍVEL VALIDAR

---

## 1. Resumo executivo

O repositório já é um app Next.js 16 (App Router) com visual de pousada, listagem de quartos, busca por datas e um painel administrativo. Sem variáveis do Supabase, a área pública abre com seis quartos e quatro reservas fictícias. O botão de reservar fica desabilitado nesse modo, e `/admin` redireciona para `/login`, que também não abre sem credenciais.

O que existe não cobre o roteiro comercial pedido: não há estado `requested` nem `rejected`, não há calendário de ocupação, não há adultos e crianças separados, não há galeria, não há estado compartilhado entre hóspede e gestor, e a mensagem de sucesso fala em reserva confirmada.

A base visual, o cálculo de diárias e a checagem de sobreposição `[check_in, check_out)` podem ser reaproveitados. A demonstração pedida ainda exige uma camada mock mutável e a liberação do painel sem autenticação.

Prontidão para receber o protótipo: **parcial**. A casca está pronta. O fluxo demonstrativo completo não está.

---

## 2. Inventário técnico

| Item | Evidência |
| --- | --- |
| Next.js | `next@16.3.8` em `package.json` e `npm ls` |
| React | `react@19.2.8`, `react-dom@19.2.8` |
| TypeScript | `typescript@5.9.3` (`npx tsc --version`) |
| Node | `v22.22.1` |
| Gerenciador | npm (`package-lock.json`, scripts `npm run`) |
| Estilo | Tailwind CSS 4 (`tailwindcss@4.3.3`, `src/app/globals.css`, `@tailwindcss/postcss`) |
| Ícones | `lucide-react@1.49.0` |
| Validação | `zod@4.6.5` em `src/lib/validators.ts` |
| Componentes de UI | Não há shadcn, Radix nem biblioteca de design system. Componentes próprios em `src/components` |
| Gráficos | Nenhuma dependência de charts |
| Formulários | HTML nativo. Sem React Hook Form |
| i18n | `lang="pt-BR"` em `src/app/layout.tsx`. Textos escritos nos componentes. Sem dicionário |
| Fontes | Fraunces e Source Sans 3 em `src/app/layout.tsx` |
| Netlify | `netlify.toml`: `npm run build`, publish `.next`, Node 22. Adaptador OpenNext automático, sem `@netlify/plugin-nextjs` |
| Testes | Nenhum `*.test.ts` / `*.spec.ts`. `package.json` não tem script `test` |

Dependências diretas instaladas: `@supabase/ssr@0.12.7`, `@supabase/supabase-js@2.117.2`, `lucide-react`, `next`, `react`, `react-dom`, `zod`, Tailwind 4, ESLint 9, TypeScript 5.9.

---

## 3. Estrutura do projeto

```
src/app/                  rotas App Router
src/components/           UI pública e administrativa
src/actions/              Server Actions (Supabase)
src/lib/                  tipos, datas, métricas, demo-data, clientes Supabase
src/proxy.ts              sessão Supabase e bloqueio de /admin
supabase/migrations/      um schema PostgreSQL
public/                   apenas SVGs padrão do create-next-app
```

Não existem `src/mocks/`, `docs/` (antes deste relatório), contextos React, stores, hooks de domínio nem repositórios.

Há ainda, fora do app:

- `pousada_villa_serena_sistema_de_reservas_e_gest_o.tsx` — protótipo de arquivo único, excluído do `tsconfig.json`. Não é importado pelo Next.
- `proposi_o_de_arquitetura_sistema_pousada_next_js_supabase.md` e `guia_de_publica_o_no_netlify_sistema_pousada_next_js_supabase.md` — proposta antiga (Vercel/pagamento). Não descrevem o código atual por completo.

### Páginas (`page.tsx`): 9

| Rota | Arquivo |
| --- | --- |
| `/` | `src/app/page.tsx` |
| `/consultar` | `src/app/consultar/page.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/quartos/[id]` | `src/app/quartos/[id]/page.tsx` |
| `/admin` | `src/app/admin/page.tsx` (redireciona para o dashboard) |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` |
| `/admin/governanca` | `src/app/admin/governanca/page.tsx` |
| `/admin/quartos` | `src/app/admin/quartos/page.tsx` |
| `/admin/reservas` | `src/app/admin/reservas/page.tsx` |

### Route handlers: 3

| Rota | Arquivo |
| --- | --- |
| `/api/ical/[roomId]` | `src/app/api/ical/[roomId]/route.ts` |
| `/api/webhooks/payment` | `src/app/api/webhooks/payment/route.ts` |
| `/auth/callback` | `src/app/auth/callback/route.ts` |

### Componentes em `src/components`: 12 arquivos

`site-header.tsx`, `site-footer.tsx`, `status-badges.tsx`, `login-form.tsx`, `portal/guest-portal.tsx`, `portal/lookup-form.tsx`, `admin/admin-nav.tsx`, `admin/dashboard-view.tsx`, `admin/kpi-grid.tsx`, `admin/bookings-table.tsx`, `admin/rooms-manager.tsx`, `admin/realtime-refresh.tsx`.

---

## 4. Auditoria da área pública

Marca atual: **Pousada Villa Serena**, não "Pousada Exemplo". Textos fixos em `src/components/site-header.tsx` e `guest-portal.tsx`.

| Item | Classificação | Evidência |
| --- | --- | --- |
| Página inicial | IMPLEMENTADO PARCIALMENTE | `src/app/page.tsx` renderiza `GuestPortal`. Hero, busca, cards e três diferenciais. Sem galeria e sem bloco de contato na home |
| Cabeçalho e navegação | IMPLEMENTADO E FUNCIONAL no código | `SiteHeader`: Portal do Hóspede, Painel Gestão, link Consultar Reserva na home |
| Rodapé | IMPLEMENTADO PARCIALMENTE | `SiteFooter`: marca e uma linha. Sem endereço, telefone ou mapa |
| Apresentação da pousada | IMPLEMENTADO PARCIALMENTE | Hero e seção "A Experiência Villa Serena" com três cards (café, trilhas, wifi) |
| Galeria | NÃO IMPLEMENTADO | Não há seção de galeria. `public/` só tem SVGs do template. Fotos são URLs do Unsplash dentro dos dados |
| Listagem de quartos | IMPLEMENTADO E FUNCIONAL no modo demo | Seis quartos em `DEMO_ROOMS` (`src/lib/demo-data.ts`). Cards em `GuestPortal` |
| Detalhe do quarto | IMPLEMENTADO PARCIALMENTE | `src/app/quartos/[id]/page.tsx`: foto, nome, descrição, capacidade, comodidades, diária. Link "Verificar datas e reservar" volta para `/`. Não há formulário na página |
| Busca | IMPLEMENTADO E FUNCIONAL no demo | Datas, hóspedes (1 a 5) e categoria. Submit chama `demoRoomsForSearch` quando o Supabase não está configurado |
| Seleção de datas | IMPLEMENTADO E FUNCIONAL | Inputs `type="date"`. Diárias via `nightsBetween` em `src/lib/dates.ts` |
| Quantidade de hóspedes | IMPLEMENTADO PARCIALMENTE | Um único campo. Não separa adultos e crianças (`guest-portal.tsx`, opções "1 Adulto" … "5 Hóspedes") |
| Disponibilidade | IMPLEMENTADO PARCIALMENTE | No demo, `demoRoomsForSearch` marca `bookable` e esconde quartos abaixo da capacidade. Quartos ocupados no período continuam na lista, com selo "Indisponível nestas datas" |
| Cálculo de preço | IMPLEMENTADO PARCIALMENTE | `base_price * nights` no card e no modal. Não há tabela de temporada, fim de semana ou acréscimo por hóspede |
| Formulário de solicitação | IMPLEMENTADO SEM FUNCIONALIDADE REAL no demo | Modal com nome, e-mail, telefone e observações. O botão "Reservar agora" exige `supabaseConfigured` (`disabled={!bookable \|\| !supabaseConfigured}`) |
| Tela de sucesso | IMPLEMENTADO PARCIALMENTE | Modal "Reserva confirmada", não a mensagem de solicitação recebida. Só aparece depois de `createBookingAction`, que exige Supabase |
| Responsividade | NÃO FOI POSSÍVEL VALIDAR em viewport | O código usa grades `sm`/`md`/`lg`. Nenhum browser foi aberto nesta auditoria |

Imagens ilustrativas: URLs `images.unsplash.com` nos quartos e no hero. Dependem de rede na hora de exibir. Não estão versionadas em `public/`.

---

## 5. Auditoria administrativa

A rota `/admin` existe. Sem Supabase, `src/app/admin/layout.tsx` redireciona para `/login`. A página de login, sem as variáveis, só mostra o aviso para configurar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. O painel **não abre** na demonstração local sem credenciais.

| Item | Classificação | Evidência |
| --- | --- | --- |
| Rota `/admin` | IMPLEMENTADO E FUNCIONAL como redirect | `src/app/admin/page.tsx` → `/admin/dashboard` |
| Layout | IMPLEMENTADO PARCIALMENTE | `AdminNav` + `RealtimeRefresh`. Exige sessão staff |
| Dashboard | IMPLEMENTADO PARCIALMENTE | `DashboardView` + `KpiGrid`: ocupação operacional, check-ins de reservas `confirmed`, check-outs de `checked_in`, receita somada, quadro de quartos, limpeza |
| Indicadores pedidos (solicitações pendentes, confirmadas, previstos) | IMPLEMENTADO PARCIALMENTE | Há ocupados, disponíveis, check-ins e check-outs de hoje. Não há contador de `requested`. "Receita confirmada" soma reservas não canceladas |
| Listagem | IMPLEMENTADO PARCIALMENTE | `BookingsTable` em `/admin/reservas`: código, hóspede, quarto, datas, noites, valor, status, ações |
| Detalhe da reserva | NÃO IMPLEMENTADO | Não há rota `/admin/reservas/[id]` nem modal de detalhe |
| Gestão de quartos | IMPLEMENTADO PARCIALMENTE | `RoomsManager` grava no Supabase (criar/editar). Sem demo |
| Disponibilidade comercial no admin | IMPLEMENTADO PARCIALMENTE | Status operacional editável no quadro. Não é um calendário de períodos |
| Tarifas | IMPLEMENTADO PARCIALMENTE | Só `base_price` no cadastro do quarto. Sem tela de tarifas por período |
| Calendário de ocupação | NÃO IMPLEMENTADO | Nenhuma grade quarto × dia |
| Confirmar solicitação | NÃO IMPLEMENTADO | Não existe status `requested` nem ação de confirmar |
| Recusar | NÃO IMPLEMENTADO | Não existe `rejected` |
| Cancelar | IMPLEMENTADO PARCIALMENTE | Botão na tabela chama `transitionBookingAction(..., "cancelled")`, que exige staff e Supabase |
| Check-in | IMPLEMENTADO PARCIALMENTE | Botão só se `status === "confirmed"`. Server Action + RPC |
| Checkout | IMPLEMENTADO PARCIALMENTE | Botão só se `status === "checked_in"` |
| Identidade "ambiente demonstrativo" | NÃO IMPLEMENTADO | Não há faixa de dados fictícios no admin |
| Restaurar dados | NÃO IMPLEMENTADO | Não há ação de reset |

`/admin/governanca` renderiza o mesmo `DashboardView` do dashboard (`src/app/admin/governanca/page.tsx`). Não é uma tela distinta.

O que dá para reaproveitar visualmente: `KpiGrid`, `BookingsTable`, `RoomStatusBadge`, `BookingStatusBadge`, `AdminNav`, o quadro de quartos e a lista de limpeza. A lógica está acoplada a Server Actions.

---

## 6. Auditoria da lógica de negócio

### Disponibilidade

- Consulta pública com Supabase: RPC `list_available_rooms` (`src/actions/bookings.ts` → função em `supabase/migrations/20261001160000_initial_schema.sql`).
- Consulta demo: `demoRoomsForSearch` em `src/lib/demo-data.ts`.
- Intervalo `[check_in, check_out)`: sim no demo, via `rangesOverlap` (`startA < endB && startB < endA`) em `src/lib/dates.ts`. No PostgreSQL, `daterange(..., '[)')` na constraint `no_overlapping_bookings`.
- Estados que bloqueiam hoje: `confirmed`, `checked_in`, `pending_payment`. Evidência: `BLOCKING` em `demo-data.ts` e o `WHERE` da constraint SQL.
- `requested` não existe. Uma solicitação pendente no sentido do MVP **não** está modelada. `pending_payment` bloqueia, mas a UI trata criação como `confirmed` (`insert ... 'confirmed'` na função `private.create_booking_atomic`).
- Quarto `maintenance` não é oferecido (`operational_status <> 'maintenance'` na listagem e recusa na criação).
- Checkout (`checked_out`) não entra no conjunto que bloqueia. A data de saída fica de fora do intervalo.
- Conflito na criação real: exceção `exclusion_violation` vira a mensagem "Este quarto já foi reservado para o período selecionado." Isso só roda com banco.

### Preços

- Tarifa cadastrada: `rooms.base_price` (numérico). Seed e `DEMO_ROOMS` têm um valor por quarto.
- Diárias: `check_out - check_in` no SQL (`nights` gerado) e `nightsBetween` no cliente.
- Total apresentado: diárias × diária base. Gravado em `bookings.total_price` na função atômica.
- Não há tarifas por período, fim de semana, feriado, temporada nem acréscimo por hóspede. Não inventar esses valores no protótipo.

### Reservas e transições

Estados no tipo e no banco (`src/lib/types.ts` e check SQL):

`pending_payment`, `confirmed`, `checked_in`, `checked_out`, `cancelled`.

Não há `requested` nem `rejected`.

Criação: `createBookingAction` → `create_booking_atomic`, status inicial `confirmed`. Não é uma solicitação.

Transições no RPC `private.transition_booking` (só staff):

- check-in apenas a partir de `confirmed`
- checkout apenas a partir de `checked_in`
- cancelar bloqueado se já está `checked_out` ou `cancelled`
- check-in põe o quarto em `occupied`; checkout põe em `cleaning`

A UI da tabela ainda oferece cancelar a partir de `checked_in` (`bookings-table.tsx`: esconde cancelar só em `cancelled` e `checked_out`). O banco aceita esse cancelamento e, se o status anterior era `checked_in`, manda o quarto para `cleaning`. Isso **não** segue a matriz pedida (`checked_in` só pode ir para `checked_out`).

Não há histórico de transições nem reenvio de e-mail.

O que serve para um mock: `rangesOverlap`, `nightsBetween`, `formatBRL`, a ideia de `bookable`, e os status operacionais `available | occupied | cleaning | maintenance`. A máquina de estados precisa ser outra.

---

## 7. Auditoria da camada de dados

| Camada | Situação |
| --- | --- |
| Mocks | `src/lib/demo-data.ts`: 6 quartos (`RM-101` … `RM-106`) e 4 reservas (`VS-8821`, `VS-9042`, `VS-7763`, `VS-6519`). Não está em `src/mocks/`. Não há `guests.ts`, `rates.ts` nem `dashboard.ts` |
| Mutação | Os dados demo são constantes/funções puras. Criar reserva no demo não grava nada. Não há Context, Zustand, localStorage nem "restaurar dados" |
| Tipos | `src/lib/types.ts` — quarto, reserva, perfil staff. Status incompatível com `requested` / `rejected` |
| Validação | `src/lib/validators.ts` (Zod) para busca, reserva, lookup, quarto e login. Usada nas Server Actions, não no modal demo |
| Serviços | Não há `getRooms()` / `createBooking()` desacoplados. O público chama Server Actions ou filtra `DEMO_ROOMS` dentro do componente |
| Supabase | `src/lib/supabase/*`, `src/actions/*`, `src/lib/queries.ts`, `src/proxy.ts` |
| Migration | `supabase/migrations/20261001160000_initial_schema.sql` — profiles, rooms, bookings, RLS, RPCs, bucket `room-images`, seed |

Separação atual: UI em componentes, mutação real em Server Actions, leitura admin em `queries.ts`, fallback visual em `demo-data.ts`. Dá para colocar um serviço mock ao lado, mas `GuestPortal` e o layout admin precisam passar a usá-lo. Não é um encaixe sem mudança de componente: o admin nem renderiza sem sessão, e o botão de reservar está desligado de propósito.

Os nomes e e-mails do demo parecem pessoas (por exemplo "Dra. Mariana Albuquerque"). São fictícios no código, porém não estão marcados como demonstrativos na interface, e os endereços imitam provedores reais. Para a apresentação, o pedido de oito reservas e o rótulo explícito de dados fictícios ainda não estão atendidos.

---

## 8. Auditoria das integrações

Nenhum `.env` com segredo foi lido. `.env.example` lista nomes de variáveis, sem valores reais.

| Integração | Arquivos | Variáveis | Impede uso local sem credencial? | Fallback | Substituível por mock? |
| --- | --- | --- | --- | --- | --- |
| Supabase Data API | `src/lib/supabase/server.ts`, `client.ts`, `src/actions/bookings.ts`, `src/actions/rooms.ts`, `src/lib/queries.ts` | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | A home abre sem elas. Reservar e o admin não | Lista demo na home e na consulta de voucher | Sim, para o protótipo |
| Supabase Auth | `src/actions/auth.ts`, `src/proxy.ts`, `src/app/admin/layout.tsx`, `src/app/auth/callback/route.ts` | as mesmas públicas | `/admin` redireciona para `/login` e o formulário não aparece | Nenhum acesso demo ao painel | Sim: pular o gate só no modo demonstrativo |
| Service role | `src/lib/supabase/admin.ts`, iCal e webhook | `SUPABASE_SERVICE_ROLE_KEY` | iCal e webhook falham sem ela. A home não depende | 401 se o token não confere | Fora do escopo do protótipo |
| PostgreSQL / RLS | `supabase/migrations/20261001160000_initial_schema.sql` | indireto, via Supabase | Não bloqueia a UI demo da home | Seed SQL não roda sozinho | Não usar no protótipo |
| E-mail | — | — | Não há cliente de e-mail | — | Não implementar envio |
| Pagamento | `src/app/api/webhooks/payment/route.ts` | `PAYMENT_WEBHOOK_SECRET` | Não afeta a navegação | Rota existe, mas está fora do fluxo do hóspede | Não usar no protótipo |
| iCal | `src/app/api/ical/[roomId]/route.ts` | `ICAL_FEED_SECRET` + service role | Não afeta a home | 401 sem token | Não usar no protótipo |
| Imagens | URLs Unsplash e, no schema, bucket `room-images` | nenhuma para Unsplash | A página carrega; a foto depende da rede | URL de fallback em `roomImage` | Pode trocar por arquivos em `public/` |
| WhatsApp | — | — | Não há integração | — | — |

`isSupabaseConfigured()` em `src/lib/supabase/env.ts` é o único interruptor de fallback, e ele só cobre listagem e consulta de voucher. Não cobre criação de solicitação nem o painel.

---

## 9. Auditoria visual

O que o código mostra, sem nova passagem no browser:

- Paleta stone/âmbar, tipografia serifada no título e sans no corpo. A home tem hierarquia clara: hero, busca sobreposta, cards, diferenciais.
- Header escuro e miolo claro. O admin usa o mesmo header e um miolo cinza. A coerência entre os dois lados existe.
- Estados vazios: busca sem quarto e tabelas sem linha têm texto.
- Erros de formulário existem no modal e na tabela, quando a Server Action responde.
- Mobile: classes responsivas estão no JSX. **NÃO FOI POSSÍVEL VALIDAR** a experiência real em viewport estreita nesta auditoria.
- Problemas para uma apresentação comercial:
  - Sem Supabase, não se completa uma reserva nem se entra no painel.
  - O sucesso diz "Reserva confirmada".
  - A marca é Villa Serena, hardcoded.
  - Não há galeria, calendário nem faixa de "dados fictícios".
  - Fotos externas podem falhar offline.
  - O admin repete a mesma tela em Governança e Visão Geral.
  - "Receita confirmada" sugere gestão financeira, que a demonstração não deve enfatizar.

---

## 10. Resultados dos testes

| Verificação | Comando | Resultado |
| --- | --- | --- |
| Lint | `npx eslint src --max-warnings 0` | PASS. Exit 0. Nenhum aviso |
| Typecheck | `npx tsc --noEmit --incremental false --pretty false` | PASS. Exit 0 |
| Testes unitários | — | NOT TESTED. Não existem arquivos de teste nem script `test` |
| Testes de integração | — | NOT TESTED. Não existem |
| Testes E2E | — | NOT TESTED. Não existem |
| Build de produção | — | NOT TESTED nesta auditoria. `next build` grava `.next`. Não foi executado para não alterar o disco |

`git status --short` depois do lint e do typecheck não mostrou arquivos modificados por esses comandos. O typecheck usou `--incremental false` para não gravar `tsconfig.tsbuildinfo`.

---

## 11. Matriz de reaproveitamento

| Funcionalidade | Estado atual | Arquivos existentes | Reaproveitamento | Trabalho necessário |
| --- | --- | --- | --- | --- |
| Identidade visual pública | Home, header, footer, cards | `guest-portal.tsx`, `site-header.tsx`, `site-footer.tsx`, `globals.css` | ADAPTAÇÃO | Trocar o nome para um rótulo temporário e centralizar textos |
| Busca por datas e hóspedes | Funciona no demo, um só campo de pessoas | `guest-portal.tsx`, `dates.ts` | ADAPTAÇÃO | Incluir crianças se a demo exigir; manter o cálculo de noites |
| Disponibilidade `[check_in, check_out)` | Função pura e constraint SQL | `dates.ts`, `demo-data.ts` | DIRETO na função de datas; ADAPTAÇÃO no conjunto de status | Incluir `requested` entre os status que bloqueiam |
| Preço diária × noites | Implementado | `guest-portal.tsx`, SQL `base_price * nights` | DIRETO | Não criar temporada. Guardar o total na solicitação mock |
| Seis quartos ilustrativos | Existem | `demo-data.ts` | ADAPTAÇÃO | Mover para `src/mocks`, marcar como fictícios, completar fotos locais se a rede não puder ser assumida |
| Oito reservas nos seis estados | Quatro reservas, cinco status antigos, sem `requested`/`rejected` | `demo-data.ts`, `types.ts` | REIMPLEMENTAÇÃO | Novo conjunto de fixtures |
| Solicitar e bloquear na hora | Modal existe; gravação demo desligada | `guest-portal.tsx`, `actions/bookings.ts` | REIMPLEMENTAÇÃO | Serviço em memória/localStorage e mensagem de solicitação recebida |
| Detalhe do quarto | Página estática | `quartos/[id]/page.tsx` | ADAPTAÇÃO | Mostrar total do período e o formulário, ou manter o modal da home |
| Painel e KPIs | Exigem login Supabase | `admin/layout.tsx`, `kpi-grid.tsx`, `dashboard-view.tsx` | ADAPTAÇÃO | Abrir `/admin` sem auth no modo demo e trocar os indicadores |
| Tabela e ações de estado | Check-in, checkout, cancelar via RPC | `bookings-table.tsx`, `actions/bookings.ts` | ADAPTAÇÃO | Confirmar, recusar e impedir transição inválida no cliente |
| Calendário quarto × dia | Não existe | — | NOVO | Nova view ligada ao mesmo estado das reservas |
| Galeria e contato na home | Três cards; telefone só no admin | `guest-portal.tsx`, `dashboard-view.tsx` | NOVO na home | Seção de galeria e contato demonstrativo |
| Textos centralizados / i18n | Strings inline, `pt-BR` no html | componentes | NOVO | Um mapa de textos pt-BR, sem traduzir en/es agora |
| Estado compartilhado e restaurar | Não existe | — | NOVO | Store + botão de reset |
| Auth, RLS, e-mail, pagamento, iCal | Implementados para o produto real | `proxy.ts`, migration, webhook, iCal | Fora da demo | Não chamar essas rotas no roteiro. Não apagar o código real só para a apresentação |

---

## 12. Lacunas

1. Não dá para concluir uma solicitação sem Supabase.
2. Não dá para mostrar o painel sem Supabase Auth e um perfil `staff`/`admin`.
3. Faltam os estados `requested` e `rejected` e a matriz de transição pedida.
4. Faltam oito reservas de exemplo cobrindo todos os estados.
5. Não há calendário.
6. Não há adultos e crianças separados.
7. Não há galeria.
8. Não há store compartilhada nem restauração dos dados.
9. A cópia de sucesso confirma a reserva em vez de acusar o recebimento.
10. A marca não é um nome facilmente substituível.
11. Não há dicionário de interface.
12. Não há testes automatizados do fluxo.
13. Tarifas além da diária base não existem. Isso é lacuna de produto, não algo a inventar.

---

## 13. Proposta de implementação mínima

Não implementada. Menor conjunto para uma demonstração local, sem serviços externos:

**Reaproveitar**

- `SiteHeader`, `SiteFooter`, paleta e tipografia.
- `GuestPortal` como base da home (hero, busca, cards, modal).
- `nightsBetween`, `rangesOverlap`, `formatBRL`, `formatDateBR`.
- `KpiGrid`, `BookingsTable`, badges e o quadro operacional como referência visual.
- Os seis quartos de `DEMO_ROOMS`, reescritos como fixtures claras.

**Adaptar**

- `src/app/admin/layout.tsx`: no modo demonstrativo, não redirecionar para login.
- `GuestPortal`: habilitar o envio local, status `requested`, texto de solicitação recebida, aviso de que é demonstração.
- Tipos de status e badges.
- Tabela admin: confirmar, recusar, cancelar, check-in, checkout, só nas transições válidas.
- Nome da pousada num único ponto ("Pousada Exemplo").

**Implementar**

- `src/mocks/` com quartos, pelo menos oito solicitações, hóspedes fictícios e a diária já cadastrada (sem temporada).
- Um serviço (`getAvailableRooms`, `createBooking`, transições, `calculateBookingPrice`) e um estado compartilhado (Context e, se útil, localStorage) com "Restaurar dados demonstrativos".
- Página ou seção de calendário em `/admin`.
- Faixa "Ambiente demonstrativo — dados fictícios".
- Textos de UI num módulo pt-BR.
- Galeria e contato demonstrativos na home, se forem obrigatórios na apresentação.

**Não ligar na demo**

- Supabase, Auth, service role, webhook de pagamento, iCal, e-mail.

**Rotas da demonstração**

- `/` hóspede
- `/quartos/[id]` detalhe
- `/consultar` voucher fictício, se ainda fizer sentido com código e e-mail
- `/admin` dashboard
- `/admin/reservas` gestão
- `/admin/calendario` ocupação (nova)

**Atenção**

- Não editar a migration já escrita para "fazer a demo". O protótipo não deve depender do banco.
- Não apresentar o webhook de pagamento nem o KPI de receita como parte do roteiro.
- Manutenção continua sendo status do quarto, não um intervalo de datas. O bloqueio comercial é a reserva.
- Fotos: preferir arquivos locais se a apresentação puder ficar sem internet.

---

## 14. Riscos e dependências

- Se o modo demo e o modo Supabase ficarem no mesmo componente sem um interruptor explícito, a apresentação pode tentar falar com o banco.
- Unsplash é dependência de rede.
- O protótipo de arquivo único na raiz pode ser confundido com o app. O app é `src/`.
- A documentação de arquitetura ainda descreve confirmação imediata e pagamento. Não usá-la como especificação da demo.
- Build de produção não foi repetido nesta auditoria.
- Não há testes que protejam a regra de não sobreposição no cliente.

---

## 15. Conclusão

O projeto **não está pronto** para a apresentação descrita, mas **está pronto para receber** esse protótipo em cima do Next.js, do Tailwind e dos componentes já desenhados.

Já implementado de forma utilizável sem credencial: navegação pública, hero, busca, seis quartos, preço estimado, selo de indisponibilidade e consulta de um voucher demo.

Implementado só com Supabase: criar reserva, login, dashboard, transições, cadastro de quartos, iCal e webhook.

Inexistente para o roteiro: solicitação `requested` com bloqueio local, recusa, calendário, galeria, estado compartilhado, restauração dos dados, separação adultos/crianças e painel aberto sem login.

---

## Confirmação desta auditoria

- Nenhum arquivo de aplicação, migration, dependência ou configuração foi alterado.
- O único arquivo escrito é este relatório.
- Lint: PASS. Typecheck: PASS.
- Testes unitários, integração, E2E e build: NOT TESTED (inexistentes ou não executados).
