/**
 * Formato Brasil: data DD/MM/AAAA e hora HH:mm.
 * Armazenamento interno continua YYYY-MM-DD e HH:mm para compatibilidade.
 */

/** Converte YYYY-MM-DD → DD/MM/AAAA */
export function toBrDate(iso: string | undefined): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Converte DD/MM/AAAA → YYYY-MM-DD (para salvar) */
export function fromBrDate(br: string): string {
  const cleaned = br.replace(/\D/g, "");
  if (cleaned.length !== 8) return "";
  const d = cleaned.slice(0, 2);
  const m = cleaned.slice(2, 4);
  const y = cleaned.slice(4, 8);
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  const year = parseInt(y, 10);
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return "";
  return `${y}-${m}-${d}`;
}

/** Máscara de digitação: DD/MM/AAAA */
export function maskBrDate(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** Máscara de digitação: HH:mm */
export function maskBrTime(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** Converte HH:mm (ou HHmm) → HH:mm normalizado */
export function fromBrTime(br: string): string {
  const cleaned = br.replace(/\D/g, "");
  if (cleaned.length < 3) return br;
  if (cleaned.length === 3) return `${cleaned.slice(0, 2)}:${cleaned.slice(2)}`;
  const h = cleaned.slice(0, 2);
  const m = cleaned.slice(2, 4);
  const hh = Math.min(23, parseInt(h, 10) || 0);
  const mm = Math.min(59, parseInt(m, 10) || 0);
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
