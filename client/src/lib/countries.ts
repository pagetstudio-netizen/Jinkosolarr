export const COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "CM", currency: "XAF", paymentMethods: ["Orange Money", "MTN"] },
  { code: "BF", name: "Burkina Faso", flag: "BF", currency: "XOF", paymentMethods: ["Orange Money", "Moov Money"] },
  { code: "TG", name: "Togo", flag: "TG", currency: "XOF", paymentMethods: ["Moov Money", "Mixx by Yas"] },
  { code: "BJ", name: "Benin", flag: "BJ", currency: "XOF", paymentMethods: ["Moov Money", "MTN"] },
  { code: "CI", name: "Cote d'Ivoire", flag: "CI", currency: "XOF", paymentMethods: ["Wave", "MTN", "Orange Money", "Moov Money"] },
  { code: "CG", name: "Congo Brazzaville", flag: "CG", currency: "XAF", paymentMethods: ["MTN"] },
];

export const ELIGIBLE_COUNTRIES = [
  { code: "CM", name: "Cameroun", flag: "CM", currency: "XAF", paymentMethods: ["Orange Money", "MTN"] },
  { code: "BF", name: "Burkina Faso", flag: "BF", currency: "XOF", paymentMethods: ["Orange Money", "Moov Money"] },
  { code: "TG", name: "Togo", flag: "TG", currency: "XOF", paymentMethods: ["Moov Money", "Mixx by Yas"] },
  { code: "BJ", name: "Benin", flag: "BJ", currency: "XOF", paymentMethods: ["Moov Money", "MTN"] },
  { code: "CI", name: "Cote d'Ivoire", flag: "CI", currency: "XOF", paymentMethods: ["Wave", "MTN", "Orange Money", "Moov Money"] },
  { code: "CG", name: "Congo Brazzaville", flag: "CG", currency: "XAF", paymentMethods: ["MTN"] },
] as const;

export function getCountryByCode(code: string) {
  return ELIGIBLE_COUNTRIES.find(c => c.code === code);
}

export function getPaymentMethodsForCountry(code: string): string[] {
  const country = getCountryByCode(code);
  return country ? [...country.paymentMethods] : [];
}

export function formatCurrency(amount: number, countryCode: string): string {
  const country = getCountryByCode(countryCode);
  const currency = country?.currency || "FCFA";
  return `${amount.toLocaleString()} ${currency}`;
}
