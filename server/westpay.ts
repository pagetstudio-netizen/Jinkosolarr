import crypto from "crypto";

const WESTPAY_BASE = "https://westpay.cloud";

export const WESTPAY_COUNTRIES: Record<string, string> = {
  BJ: "Bénin",
  TG: "Togo",
  CI: "Côte d'Ivoire",
  BF: "Burkina Faso",
  SN: "Sénégal",
  ML: "Mali",
  CM: "Cameroun",
  CG: "Congo Brazzaville",
  GA: "Gabon",
};

const PHONE_PREFIXES: Record<string, string> = {
  BJ: "229",
  TG: "228",
  CI: "225",
  BF: "226",
  SN: "221",
  ML: "223",
  CM: "237",
  CG: "242",
  GA: "241",
};

let cachedToken: string | null = null;
let tokenExpiry = 0;

export async function getJwtToken(email: string, password: string): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${WESTPAY_BASE}/api/auth/merchant/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Impossible de se connecter à WestPay");
  }

  const { token } = await res.json();
  cachedToken = token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return token;
}

export function buildPaymentUrl(
  slug: string,
  amount: number,
  countryCode: string,
  redirectUrl: string
): string {
  const countryName = WESTPAY_COUNTRIES[countryCode] || "";
  const url = new URL(`${WESTPAY_BASE}/pay`);
  url.searchParams.set("merchant", slug);
  url.searchParams.set("amount", String(Math.round(amount)));
  if (countryName) url.searchParams.set("country", countryName);
  if (redirectUrl) url.searchParams.set("redirect", redirectUrl);
  return url.toString();
}

export function formatMsisdn(phone: string, countryCode: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const prefix = PHONE_PREFIXES[countryCode] || "";
  if (!prefix) return cleaned;
  if (cleaned.startsWith(prefix)) return cleaned;
  if (cleaned.startsWith("0")) return prefix + cleaned.slice(1);
  return prefix + cleaned;
}

export async function initiateTransfer(
  email: string,
  password: string,
  countryCode: string,
  msisdn: string,
  amount: number,
  firstName: string,
  lastName: string
): Promise<{ reference: string; status: string; fees: number }> {
  const token = await getJwtToken(email, password);
  const countryName = WESTPAY_COUNTRIES[countryCode] || countryCode;
  const formattedMsisdn = formatMsisdn(msisdn, countryCode);

  console.log("[westpay] transfer request:", { countryName, msisdn: formattedMsisdn, amount, firstName, lastName });

  const res = await fetch(`${WESTPAY_BASE}/api/merchant/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: countryName,
      msisdn: formattedMsisdn,
      amount: Math.round(amount),
      firstName,
      lastName,
    }),
  });

  const data = await res.json();
  console.log("[westpay] transfer response:", data);

  if (!res.ok) {
    throw new Error(data.message || "Erreur transfert WestPay");
  }
  return data;
}

export async function initiateCollection(
  email: string,
  password: string,
  countryApiKey: string,
  countryCode: string,
  msisdn: string,
  amount: number,
): Promise<{ reference: string; status: string }> {
  const token = await getJwtToken(email, password);
  const countryName = WESTPAY_COUNTRIES[countryCode] || countryCode;
  const formattedMsisdn = formatMsisdn(msisdn, countryCode);

  console.log("[westpay] collection request:", { countryName, msisdn: formattedMsisdn, amount });

  const res = await fetch(`${WESTPAY_BASE}/api/merchant/payment`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-API-KEY": countryApiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country: countryName,
      msisdn: formattedMsisdn,
      amount: Math.round(amount),
    }),
  });

  const data = await res.json();
  console.log("[westpay] collection response:", data);

  if (!res.ok) {
    throw new Error(data.message || "Erreur collection WestPay");
  }
  return data;
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  try {
    const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    // Use timing-safe comparison to prevent timing attacks (recommended by WestPay docs)
    const sigBuf = Buffer.from(signature.length === expected.length ? signature : "", "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length || sigBuf.length === 0) return false;
    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}
