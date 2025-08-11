export function formatMoney(cents: number, currency = process.env.DEFAULT_CURRENCY || 'MAD', locale = process.env.DEFAULT_LOCALE || 'fr-MA') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100)
}
