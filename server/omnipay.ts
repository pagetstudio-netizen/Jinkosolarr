import crypto from "crypto";

const OMNIPAY_API_URL = "https://omnipay.webtechci.com/interface/api2";
const OMNIPAY_API_KEY = process.env.OMNIPAY_API_KEY || "omnipay_api_key_446a37f71c185d54f137371406942e569f4025aa";

const COUNTRY_PREFIXES: Record<string, string> = {
  CI: "225",
  TG: "228",
  BF: "226",
  SN: "221",
  BJ: "229",
  CM: "237",
  CG: "242",
};

function formatMsisdn(phone: string, country: string): string {
  const prefix = COUNTRY_PREFIXES[country] || "";
  const cleaned = phone.replace(/\D/g, "").replace(/^0+/, "");
  if (prefix && !cleaned.startsWith(prefix)) {
    return prefix + cleaned;
  }
  return cleaned;
}

function getOmnipayOperator(paymentMethod: string): string | undefined {
  const m = paymentMethod.toLowerCase();
  if (m.includes("wave")) return "wave";
  if (m.includes("mixx")) return "mixx";
  return undefined;
}

export async function initiatePayment(params: {
  phone: string;
  country: string;
  amount: number;
  reference: string;
  firstName: string;
  lastName: string;
  paymentMethod: string;
  returnUrl?: string;
}) {
  const msisdn = formatMsisdn(params.phone, params.country);
  const operator = getOmnipayOperator(params.paymentMethod);

  const body: Record<string, string> = {
    action: "paymentrequest",
    apikey: OMNIPAY_API_KEY,
    msisdn,
    amount: params.amount.toString(),
    reference: params.reference,
    first_name: params.firstName,
    last_name: params.lastName || params.firstName,
  };

  if (operator) {
    body.operator = operator;
    if (operator === "wave" && params.returnUrl) {
      body.return_url = params.returnUrl;
    }
  }

  console.log("[omnipay] initiatePayment →", { msisdn, amount: params.amount, reference: params.reference });

  const res = await fetch(OMNIPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("[omnipay] initiatePayment ←", data);
  return data;
}

export async function initiateTransfer(params: {
  phone: string;
  country: string;
  amount: number;
  reference: string;
  firstName: string;
  lastName: string;
  paymentMethod: string;
}) {
  const msisdn = formatMsisdn(params.phone, params.country);
  const operator = getOmnipayOperator(params.paymentMethod);

  const body: Record<string, string> = {
    action: "transfer",
    apikey: OMNIPAY_API_KEY,
    msisdn,
    amount: params.amount.toString(),
    reference: params.reference,
    first_name: params.firstName,
    last_name: params.lastName || params.firstName,
  };

  if (operator === "wave") {
    body.operator = "wave";
  }

  console.log("[omnipay] initiateTransfer →", { msisdn, amount: params.amount, reference: params.reference });

  const res = await fetch(OMNIPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  console.log("[omnipay] initiateTransfer ←", data);
  return data;
}

export async function getTransactionStatus(reference: string) {
  const body = {
    action: "getstatus",
    apikey: OMNIPAY_API_KEY,
    reference,
  };

  const res = await fetch(OMNIPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

export async function getOmnipayBalance() {
  const body = {
    action: "getbalance",
    apikey: OMNIPAY_API_KEY,
  };

  const res = await fetch(OMNIPAY_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

export function mapOmnipayStatus(status: number | string): "pending" | "processing" | "approved" | "rejected" {
  const s = parseInt(status.toString());
  switch (s) {
    case 1: return "processing";
    case 2: return "processing";
    case 3: return "approved";
    case 4: return "rejected";
    default: return "pending";
  }
}

export function verifyOmnipaySignature(data: any, callbackKey: string): boolean {
  if (!callbackKey) return true;
  try {
    const concat = `${data.id}|${data.type}|${data.reference}|${data.msisdn}|${data.amount}|${data.fees}|${data.status}|${data.message}`;
    const expected = crypto.createHmac("sha3-512", callbackKey).update(concat).digest("hex");
    return expected === data.signature;
  } catch {
    return true;
  }
}

export function isOmnipaySupported(country: string): boolean {
  return Object.keys(COUNTRY_PREFIXES).includes(country);
}
