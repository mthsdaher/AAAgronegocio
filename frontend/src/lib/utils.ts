import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value?: number | null) {
  if (value === undefined || value === null) return "Sob Consulta";
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatArea(value?: number | null, unit?: string | null) {
  if (value === undefined || value === null) return "Não especificada";
  const unitStr = unit === 'hectares' ? 'ha' : unit === 'alqueires' ? 'alq' : 'acres';
  return `${new Intl.NumberFormat('pt-BR').format(value)} ${unitStr}`;
}
