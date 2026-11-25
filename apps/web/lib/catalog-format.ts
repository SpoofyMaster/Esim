export const formatPrice = (amount: number, currency: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: 2 }).format(amount);
