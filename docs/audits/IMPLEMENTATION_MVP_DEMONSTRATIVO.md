# Implementação — MVP demonstrativo

Data: 2026-10-01. Este documento descreve a demonstração local. O sistema **não** está pronto para produção.

O modo demonstrativo liga quando `NEXT_PUBLIC_SUPABASE_URL` e a chave anon/publishable estão ausentes. Com essas variáveis, o login de equipe, as actions e o RLS permanecem como estavam.

## 1. Resumo

O hóspede busca datas, adultos e crianças, vê a diária vezes as noites e envia uma solicitação fictícia. O quarto fica bloqueado na hora, com a mensagem de recebimento exigida. O gestor abre `/admin` sem senha, vê a solicitação, confirma (ou recusa, cancela, faz check-in e checkout) e a busca pública, o dashboard e o calendário acompanham o mesmo estado em `localStorage`.

Classificação geral da demonstração local: **PASS**. Pronto para produção: **não**.

## 2. Arquivos criados

- `src/services/demo/types.ts`
- `src/services/demo/rules.ts`
- `src/services/demo/rules.test.ts`
- `src/services/demo/storage.ts`
- `src/mocks/rooms.ts`
- `src/mocks/guests.ts`
- `src/mocks/rates.ts`
- `src/mocks/seed.ts`
- `src/i18n/pt-BR.ts`
- `src/i18n/index.ts`
- `src/hooks/demo-store.tsx`
- `src/components/demo/demo-admin.tsx`
- `src/components/demo/demo-calendar.tsx`
- `src/components/demo/demo-room-page.tsx`
- `src/components/demo/demo-status.tsx`
- `src/app/admin/calendario/page.tsx`

## 3. Arquivos alterados

- `src/app/layout.tsx` — `DemoProvider` só sem Supabase
- `src/app/admin/layout.tsx` — moldura demonstrativa; o ramo com Supabase continua exigindo usuário e perfil
- `src/app/admin/dashboard/page.tsx`
- `src/app/admin/reservas/page.tsx`
- `src/app/admin/quartos/page.tsx`
- `src/app/admin/governanca/page.tsx`
- `src/app/login/page.tsx`
- `src/app/quartos/[id]/page.tsx`
- `src/components/portal/guest-portal.tsx`
- `src/components/portal/lookup-form.tsx`
- `src/components/site-header.tsx`
- `src/lib/demo-data.ts` — reexporta os quartos de `src/mocks/rooms.ts`
- `package.json` / `package-lock.json` — `tsx` como devDependency para rodar os testes TypeScript
- `README.md`

Migrations, schema, `src/lib/types.ts` (`BookingStatus`) e a integração Supabase não foram alterados.

## 4. Componentes reaproveitados

- `GuestPortal`, cabeçalho, rodapé e página do quarto
- `RoomStatusBadge`
- `src/lib/dates.ts` (`rangesOverlap`, `nightsBetween`, `todayISO`, `addDaysISO`, `formatDateBR`)
- `formatBRL` e `roomImage`
- Textos, fotos e diárias dos seis quartos já existentes
- Painel real (`DashboardView`, `BookingsTable`, `RoomsManager`, `AdminNav`) permanece no ramo com Supabase

## 5. Componentes novos

- `DemoAdminChrome`, dashboard, lista de solicitações, governança e tarifas
- `DemoCalendar`
- `DemoRoomPage`
- `DemoStatusBadge`

## 6. Rotas

| Rota | Demonstração | Com Supabase |
| --- | --- | --- |
| `/` | Busca e solicitação fictícia | Busca e reserva no banco |
| `/consultar` | Consulta o cenário local | Voucher no banco |
| `/quartos/[id]` | Detalhe do cenário local | Quarto do banco |
| `/login` | Aviso e link para o painel fictício | Formulário de equipe |
| `/admin/dashboard` | Indicadores do estado compartilhado | Login obrigatório |
| `/admin/reservas` | Solicitações e ações | Reservas reais |
| `/admin/calendario` | Calendário de ocupação | Redireciona ao dashboard |
| `/admin/governanca` | Status operacional dos quartos | Painel real |
| `/admin/quartos` | Diárias somente leitura | Cadastro real |

## 7. Dados mockados

Seis quartos RM-101 a RM-106, com as fotos e diárias já existentes (680, 520, 490, 340, 590, 610). Oito hóspedes `@example.com`. Oito solicitações iniciais cobrindo `requested`, `confirmed`, `checked_in`, `checked_out`, `rejected` e `cancelled`. A tarifa é só a diária base. O RM-105 começa em manutenção e não aceita solicitação.

## 8. Regras

- Bloqueiam o período: `requested`, `confirmed`, `checked_in`.
- Não bloqueiam: `checked_out`, `rejected`, `cancelled`.
- Intervalo `[check_in, check_out)`.
- Transições: `requested` → confirmada, recusada ou cancelada; `confirmed` → check-in ou cancelada; `checked_in` → checkout. As demais são recusadas.
- Check-in marca o quarto como ocupado. Checkout marca limpeza e libera o período a partir da saída.
- `createBooking` relê o estado atual, valida capacidade, manutenção e conflito.
- Preço = diária × noites, com teto de 60 diárias já usado no sistema.
- Persistência `pousada-demo-v1`. JSON inválido ou versão diferente volta ao cenário inicial. O primeiro render usa o cenário semente, igual no servidor e no cliente; o `localStorage` entra depois, via `useSyncExternalStore`.

## 9. Testes executados

`npm test` — 18 testes, 0 falhas. **PASS**

Cobertos: bloqueio imediato, sobreposição, datas adjacentes, pendência, recusa, cancelamento, checkout, capacidade, transições válidas e inválidas, indicadores, noites do calendário, parse de armazenamento, restauração, cenário inicial determinístico, texto de recebimento e erro de indisponibilidade.

Não há suíte Playwright. O fluxo de tela foi exercido no navegador em `http://localhost:3000` (ver item 16).

## 10. Lint

`npx eslint src --max-warnings 0` — exit 0. **PASS**

## 11. Typecheck

`npx tsc --noEmit --incremental false` — exit 0. **PASS**

## 12. Build

`npm run build` — compilou e listou as rotas, incluindo `/admin/calendario`. **PASS**

## 13. Pendências

- Textos em inglês e espanhol: a união `pt-BR | en | es` existe; só pt-BR está preenchido. **NOT TESTED** como tradução.
- Check-in e checkout clicados até o fim no navegador: os botões apareceram depois da confirmação; a mudança de estado foi coberta pelos testes de regra. **NOT TESTED** como clique completo no navegador.
- Suíte E2E automatizada. **NOT TESTED**

## 14. Limitações

- Nada é gravado no Supabase, nenhum e-mail sai e nenhum pagamento existe.
- O estado fica no navegador de quem apresenta. Outro computador não vê a mesma solicitação.
- Estados `requested` e `rejected` existem só nesta camada. O banco real continua com `pending_payment`, `confirmed`, `checked_in`, `checked_out` e `cancelled`.
- Um deploy sem as variáveis do Supabase abre este painel sem senha. O aviso permanente identifica o ambiente. Com as variáveis preenchidas, `/admin` volta a exigir autenticação.

## 15. Riscos

- Publicar o site sem configurar o Supabase faz o painel demonstrativo parecer um backoffice. A faixa "AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS — OPERAÇÕES SIMULADAS" precisa permanecer visível.
- `localStorage` antigo ou adulterado é descartado se a versão ou o formato não bater. Não há sincronização entre abas além de um novo carregamento.
- A demonstração não reproduz a constraint de exclusão do Postgres. A checagem é em memória, no momento da solicitação.

## 16. Como apresentar ao cliente

1. Não defina as variáveis do Supabase. Rode `npm install` e `npm run dev`.
2. Abra `http://localhost:3000`. Mostre a faixa de ambiente demonstrativo, a busca com adultos e crianças e um quarto indisponível (Suíte Master na data de hoje, por causa da hospedagem em andamento).
3. Solicite o Chalé Jardim para hoje e amanhã. A mensagem deve falar em solicitação recebida e bloqueio, e deixar claro que nada real foi reservado.
4. O botão Solicitar desse quarto fica desabilitado.
5. Abra `http://localhost:3000/admin/dashboard` pelo link Gestão. Sem senha. Aponte os indicadores e a nova linha.
6. Confirme, recuse ou cancele. Faça check-in e checkout numa reserva confirmada. Abra o calendário.
7. Volte ao portal: a disponibilidade acompanha a ação.
8. Use **Restaurar dados demonstrativos** para repetir a apresentação.
9. Diga o que falta no produto real: login da equipe, gravação no Supabase, e-mail e a constraint de datas no banco.

Verificação no navegador nesta entrega: solicitação da Helena no Chalé Jardim (código gerado na sessão), bloqueio imediato, mensagem de recebimento, painel com 3 solicitações, confirmação com histórico, calendário com o nome após nova carga da página, restauração removendo a solicitação e o chalé voltando a aceitar pedido. **PASS**
