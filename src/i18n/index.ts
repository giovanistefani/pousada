import { ptBR, type MessageTree } from "@/i18n/pt-BR";

/** Idiomas previstos. Nesta entrega só pt-BR tem textos. */
export type Locale = "pt-BR" | "en" | "es";

const catalogs = {
  "pt-BR": ptBR,
} as const;

export function messages(locale: Locale = "pt-BR"): MessageTree {
  if (locale === "en" || locale === "es") return catalogs["pt-BR"];
  return catalogs["pt-BR"];
}
