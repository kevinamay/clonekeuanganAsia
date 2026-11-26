export function formatRupiah(amount, compact = false) {
  const num = typeof amount !== 'number' || isNaN(amount) ? Number(amount) || 0 : amount;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (compact) {
    if (abs >= 1e9) {
      return `${sign}Rp ${(abs / 1e9).toFixed(2).replace('.', ',')} M`;
    }
    if (abs >= 1e6) {
      return `${sign}Rp ${(abs / 1e6).toFixed(1).replace('.', ',')} Jt`;
    }
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(abs);

  return `${sign}Rp ${formatted}`;
}

export function formatUSD(amount) {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
  return `${amount < 0 ? '-' : ''}$ ${formatted}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}
