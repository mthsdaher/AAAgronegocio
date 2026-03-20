/** Permite apenas caracteres válidos enquanto o utilizador digita preço em BRL */
const MONEY_CHARS = /^[\d.,R$\s]*$/i;

export function sanitizeMoneyInput(raw: string): string {
  const next = raw.replace(/[^\d.,R$\s]/gi, "");
  return next;
}

/**
 * Interpreta texto no estilo brasileiro (milhares com ponto, decimais com vírgula)
 * e devolve número para enviar à API (preço total em reais).
 */
export function parseBRLToNumber(raw: string): number | null {
  const t = raw.replace(/R\$\s?/gi, "").replace(/\s/g, "").trim();
  if (!t) return null;
  if (!/^[\d.,]+$/.test(t)) return null;
  const normalized = t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : t.replace(/\./g, "");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

/** Formata para exibição: R$ 1.234.567,89 */
export function formatNumberToBRL(n: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function isValidMoneyTyping(raw: string): boolean {
  return MONEY_CHARS.test(raw);
}
