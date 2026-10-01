export const ptBR = {
  brand: "Pousada Villa Serena",
  demoBanner:
    "AMBIENTE DEMONSTRATIVO — DADOS FICTÍCIOS — OPERAÇÕES SIMULADAS",
  demoNote:
    "Esta é uma demonstração. Nenhuma reserva real foi feita e nenhum contato foi enviado.",
  requestReceived:
    "Sua solicitação foi recebida! O período solicitado foi bloqueado no sistema demonstrativo. Nossa equipe entrará em contato para confirmar os detalhes da hospedagem.",
  requestTitle: "Solicitação recebida",
  unavailable:
    "Este quarto não está mais disponível para o período escolhido.",
  restore: "Restaurar dados demonstrativos",
  restoreConfirm:
    "Isso apaga as solicitações feitas nesta demonstração e volta ao cenário inicial. Continuar?",
  gallery: "A casa e os arredores",
  contactTitle: "Contato demonstrativo",
  contactPhone: "(48) 3000-0000",
  contactEmail: "reservas@example.com",
  statuses: {
    requested: "Solicitação recebida",
    confirmed: "Confirmada",
    checked_in: "Hospedado",
    checked_out: "Checkout feito",
    rejected: "Recusada",
    cancelled: "Cancelada",
  },
  actions: {
    confirm: "Confirmar solicitação",
    reject: "Recusar solicitação",
    cancel: "Cancelar reserva",
    check_in: "Realizar check-in",
    check_out: "Realizar checkout",
  },
} as const;

export type MessageTree = typeof ptBR;
