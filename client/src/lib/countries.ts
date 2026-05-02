import { useQuery } from "@tanstack/react-query";
import type { PlatformCountry } from "@shared/schema";

export function useCountries() {
  return useQuery<PlatformCountry[]>({
    queryKey: ["/api/countries"],
    staleTime: 5 * 60 * 1000,
  });
}

export function formatCurrency(amount: number, countryCode: string, countries?: PlatformCountry[]): string {
  const country = countries?.find(c => c.code === countryCode);
  const currency = country?.currency || "FCFA";
  return `${amount.toLocaleString()} ${currency}`;
}

export function getCountryByCode(code: string, countries?: PlatformCountry[]) {
  return countries?.find(c => c.code === code);
}

export function getPaymentMethodsForCountry(code: string, countries?: PlatformCountry[]): string[] {
  const country = countries?.find(c => c.code === code);
  return country?.operators || [];
}

// Legacy static fallback used only as defaults before API loads
export const ELIGIBLE_COUNTRIES = [
  { code: "BJ", name: "Bénin",             currency: "XOF", phonePrefix: "229", paymentMethods: ["Moov Money", "MTN"] },
  { code: "CM", name: "Cameroun",           currency: "XAF", phonePrefix: "237", paymentMethods: ["Orange Money", "MTN"] },
  { code: "BF", name: "Burkina Faso",       currency: "XOF", phonePrefix: "226", paymentMethods: ["Orange Money", "Moov Money"] },
  { code: "CI", name: "Côte d'Ivoire",      currency: "XOF", phonePrefix: "225", paymentMethods: ["Wave", "MTN", "Orange Money", "Moov Money"] },
  { code: "TG", name: "Togo",               currency: "XOF", phonePrefix: "228", paymentMethods: ["Moov Money", "Mixx by Yas"] },
  { code: "CG", name: "Congo Brazzaville",  currency: "XAF", phonePrefix: "242", paymentMethods: ["MTN"] },
  { code: "CD", name: "RDC",                currency: "CDF", phonePrefix: "243", paymentMethods: ["Airtel Money"] },
] as const;
