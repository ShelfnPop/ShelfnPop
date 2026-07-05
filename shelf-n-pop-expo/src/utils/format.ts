export function money(value: number | null | undefined): string {
  const amount = Number(value ?? 0);
  const prefix = amount < 0 ? "-$" : "$";
  return `${prefix}${Math.abs(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function integer(value: number | null | undefined): string {
  return Number(value ?? 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  });
}

export function compactName(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value.trim() : "--";
}
