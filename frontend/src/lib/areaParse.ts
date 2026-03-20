/** Área em hectares — aceita vírgula ou ponto decimal */
export function sanitizeAreaInput(raw: string): string {
  return raw.replace(/[^\d.,]/g, "");
}

export function parseAreaHectares(raw: string): number | null {
  const t = raw.replace(/\s/g, "").trim();
  if (!t) return null;
  if (!/^[\d.,]+$/.test(t)) return null;
  const normalized = t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : t.replace(/\./g, "");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 10000) / 10000;
}
