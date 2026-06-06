import type { Currency } from "@prisma/client";

export const CURRENCY_INFO: Record<
  Currency,
  { symbol: string; name: string; decimals: number }
> = {
  USD: { symbol: "$", name: "US Dollar", decimals: 2 },
  EUR: { symbol: "\u20ac", name: "Euro", decimals: 2 },
  GBP: { symbol: "\u00a3", name: "British Pound", decimals: 2 },
  CAD: { symbol: "CA$", name: "Canadian Dollar", decimals: 2 },
  AUD: { symbol: "A$", name: "Australian Dollar", decimals: 2 },
  JPY: { symbol: "\u00a5", name: "Japanese Yen", decimals: 0 },
  CHF: { symbol: "CHF", name: "Swiss Franc", decimals: 2 },
  INR: { symbol: "\u20b9", name: "Indian Rupee", decimals: 2 },
  BRL: { symbol: "R$", name: "Brazilian Real", decimals: 2 },
  MXN: { symbol: "MX$", name: "Mexican Peso", decimals: 2 },
  ZAR: { symbol: "R", name: "South African Rand", decimals: 2 },
  NZD: { symbol: "NZ$", name: "New Zealand Dollar", decimals: 2 },
  SGD: { symbol: "S$", name: "Singapore Dollar", decimals: 2 },
  HKD: { symbol: "HK$", name: "Hong Kong Dollar", decimals: 2 },
  SEK: { symbol: "kr", name: "Swedish Krona", decimals: 2 },
  NOK: { symbol: "kr", name: "Norwegian Krone", decimals: 2 },
  DKK: { symbol: "kr", name: "Danish Krone", decimals: 2 },
  PLN: { symbol: "z\u0142", name: "Polish Zloty", decimals: 2 },
  CZK: { symbol: "K\u010d", name: "Czech Koruna", decimals: 2 },
  HUF: { symbol: "Ft", name: "Hungarian Forint", decimals: 0 },
};

export function formatCurrency(amount: number, currency: Currency): string {
  const info = CURRENCY_INFO[currency];
  const formatted = amount.toFixed(info.decimals);
  return `${info.symbol}${formatted}`;
}

export function parseCurrencyCode(code: string | null): Currency | null {
  if (!code) return null;
  const upper = code.toUpperCase();
  if (upper in CURRENCY_INFO) return upper as Currency;
  return null;
}
