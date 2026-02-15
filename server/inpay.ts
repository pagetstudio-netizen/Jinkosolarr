import crypto from "crypto";
import { HttpsProxyAgent } from "https-proxy-agent";

const PROXY_URL = process.env.QUOTAGUARD_STATIC_URL || process.env.STATIC_PROXY_URL || "";

function getProxyAgent(): HttpsProxyAgent<string> | undefined {
  if (PROXY_URL) {
    return new HttpsProxyAgent(PROXY_URL);
  }
  return undefined;
}

interface InpayCredentials {
  merchantId: string;
  apiKey: string;
  baseUrl: string;
}

const INPAY_COUNTRY_CREDENTIALS: Record<string, InpayCredentials> = {
  TG: {
    merchantId: process.env.INPAY_MERCHANT_ID || "",
    apiKey: process.env.INPAY_API_KEY || "",
    baseUrl: process.env.INPAY_BASE_URL || "",
  },
  BF: {
    merchantId: process.env.INPAY_BF_MERCHANT_ID || "",
    apiKey: process.env.INPAY_BF_API_KEY || "",
    baseUrl: process.env.INPAY_BF_BASE_URL || "",
  },
  CI: {
    merchantId: process.env.INPAY_CI_MERCHANT_ID || "",
    apiKey: process.env.INPAY_CI_API_KEY || "",
    baseUrl: process.env.INPAY_CI_BASE_URL || "",
  },
};

function getCredentials(countryCode: string): InpayCredentials | null {
  const creds = INPAY_COUNTRY_CREDENTIALS[countryCode];
  if (!creds || !creds.merchantId || !creds.apiKey || !creds.baseUrl) return null;
  return {
    ...creds,
    baseUrl: creds.baseUrl.replace(/\/+$/, ""),
  };
}

export const INPAY_COUNTRY_PREFIX: Record<string, string> = {
  CM: "237",
  BF: "226",
  TG: "228",
  BJ: "229",
  CI: "225",
  CG: "242",
  CD: "243",
  SN: "221",
  ML: "223",
  GH: "233",
  KE: "254",
  TZ: "255",
  UG: "256",
};

export const INPAY_BANK_CODES: Record<string, Record<string, string>> = {
  CM: {
    "Orange Money": "1",
    "MTN": "2",
  },
  BF: {
    "Orange Money": "1",
    "Moov Money": "3",
    "Telecel": "12",
  },
  TG: {
    "Tmoney": "7",
  },
  BJ: {
    "Moov Money": "3",
    "MTN": "2",
    "Momo": "2",
    "Celtis": "3",
  },
  CI: {
    "Orange Money": "1",
    "MTN": "2",
    "Moov Money": "3",
    "Wave": "6",
  },
  CG: {
    "MTN": "2",
    "M-Pesa": "8",
    "Airtel": "9",
    "Orange Money": "1",
  },
  CD: {
    "M-Pesa": "8",
    "Airtel Money": "9",
    "Orange Money": "1",
  },
};

function generateSign(params: Record<string, string>, apiKey: string): string {
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== undefined && value !== null && key !== "sign") {
      filtered[key] = value;
    }
  }

  const sortedKeys = Object.keys(filtered).sort();
  const queryString = sortedKeys.map(k => `${k}=${filtered[k]}`).join("&");
  const stringSignTemp = `${queryString}&key=${apiKey}`;
  return crypto.createHash("md5").update(stringSignTemp).digest("hex").toLowerCase();
}

export function verifySign(data: Record<string, string>, countryCode?: string): boolean {
  const receivedSign = data.sign;
  if (!receivedSign) return false;

  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key !== "sign") {
      params[key] = String(value);
    }
  }

  if (countryCode) {
    const creds = getCredentials(countryCode);
    if (creds) {
      const calculatedSign = generateSign(params, creds.apiKey);
      return receivedSign.toLowerCase() === calculatedSign;
    }
  }

  for (const creds of Object.values(INPAY_COUNTRY_CREDENTIALS)) {
    if (!creds.apiKey) continue;
    const calculatedSign = generateSign(params, creds.apiKey);
    if (receivedSign.toLowerCase() === calculatedSign) return true;
  }

  return false;
}

export function isInpaySupported(country: string): boolean {
  return !!INPAY_COUNTRY_PREFIX[country] && !!getCredentials(country);
}

export function getBankCode(country: string, paymentMethod: string): string | null {
  const countryBanks = INPAY_BANK_CODES[country];
  if (!countryBanks) return null;
  return countryBanks[paymentMethod] || null;
}

interface InpayPayinResponse {
  code: number;
  message: string;
  errno?: number;
  data?: {
    url: string;
    order_number: string;
  };
}

interface InpayPayoutResponse {
  code: number;
  message: string;
  errno?: number;
  data?: {
    result: string;
    orderNumber: string;
  };
}

interface InpayQueryResponse {
  code: number;
  message: string;
  data?: {
    status: string;
    merchantid: string;
    out_trade_no: string;
    total_fee: string;
    poundage: string;
    account_fee: string;
    sign: string;
    fail_info?: string;
    order_number?: string;
  };
}

interface InpayBalanceResponse {
  code: number;
  message: string;
  data?: {
    balance: string;
  };
}

export async function initiatePayin(params: {
  outTradeNo: string;
  amount: number;
  notifyUrl: string;
  returnUrl: string;
  bankCode: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  countryCode: string;
}): Promise<InpayPayinResponse> {
  const countryPrefix = INPAY_COUNTRY_PREFIX[params.countryCode];
  if (!countryPrefix) {
    throw new Error(`Pays non supporte par InPay: ${params.countryCode}`);
  }

  const creds = getCredentials(params.countryCode);
  if (!creds) {
    throw new Error(`Pas de credentials InPay pour: ${params.countryCode}`);
  }

  const roundedAmount = Math.ceil(params.amount / 5) * 5;

  let mobile = params.customerMobile.replace(/\s+/g, "").replace(/^0+/, "");
  if (!mobile.startsWith(countryPrefix)) {
    mobile = countryPrefix + mobile;
  }

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: roundedAmount.toFixed(2),
    notify_url: params.notifyUrl,
    return_url: params.returnUrl,
    bank_code: params.bankCode,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    customer_name: params.customerName,
    customer_mobile: mobile,
    customer_email: params.customerEmail,
    country_prefix: countryPrefix,
  };

  data.sign = generateSign(data, creds.apiKey);

  const url = `${creds.baseUrl}/inpays/payin/unifiedorder`;
  console.log(`[inpay] Payin request to ${url} for country ${params.countryCode}, merchantId: ${creds.merchantId}, bank_code: ${params.bankCode}, mobile: ${mobile}`);

  const agent = getProxyAgent();
  const fetchOptions: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  if (agent) fetchOptions.agent = agent;

  console.log(`[inpay] Using proxy: ${PROXY_URL ? "YES" : "NO"}`);
  const response = await fetch(url, fetchOptions);

  const text = await response.text();
  try {
    return JSON.parse(text) as InpayPayinResponse;
  } catch {
    console.error(`[inpay] Payin response not JSON (${response.status}):`, text.substring(0, 500));
    throw new Error(`InPay a retourne une reponse invalide (${response.status}). Verifiez les credentials pour ${params.countryCode}.`);
  }
}

export async function queryPayin(outTradeNo: string, countryCode: string): Promise<InpayQueryResponse> {
  const creds = getCredentials(countryCode);
  if (!creds) {
    throw new Error(`Pas de credentials InPay pour: ${countryCode}`);
  }

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: outTradeNo,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  data.sign = generateSign(data, creds.apiKey);

  const agent = getProxyAgent();
  const fetchOptions: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  if (agent) fetchOptions.agent = agent;

  const response = await fetch(`${creds.baseUrl}/inpays/payin/query`, fetchOptions);

  const text = await response.text();
  try {
    return JSON.parse(text) as InpayQueryResponse;
  } catch {
    console.error(`[inpay] Query payin response not JSON (${response.status}):`, text.substring(0, 500));
    throw new Error(`InPay query invalide (${response.status})`);
  }
}

export async function initiatePayout(params: {
  outTradeNo: string;
  amount: number;
  notifyUrl: string;
  bankCode: string;
  accountNumber: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string;
  countryCode: string;
}): Promise<InpayPayoutResponse> {
  const countryPrefix = INPAY_COUNTRY_PREFIX[params.countryCode];
  if (!countryPrefix) {
    throw new Error(`Pays non supporte par InPay: ${params.countryCode}`);
  }

  const creds = getCredentials(params.countryCode);
  if (!creds) {
    throw new Error(`Pas de credentials InPay pour: ${params.countryCode}`);
  }

  const roundedAmount = Math.ceil(params.amount / 5) * 5;

  let mobile = params.customerMobile.replace(/\s+/g, "").replace(/^0+/, "");
  if (!mobile.startsWith(countryPrefix)) {
    mobile = countryPrefix + mobile;
  }

  let accountNum = params.accountNumber.replace(/\s+/g, "").replace(/^0+/, "");
  if (!accountNum.startsWith(countryPrefix)) {
    accountNum = countryPrefix + accountNum;
  }

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: roundedAmount.toFixed(2),
    notify_url: params.notifyUrl,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    bank_code: params.bankCode,
    account_number: accountNum,
    customer_name: params.customerName,
    customer_mobile: mobile,
    customer_email: params.customerEmail,
    country_prefix: countryPrefix,
  };

  data.sign = generateSign(data, creds.apiKey);

  const url = `${creds.baseUrl}/inpays/payout/unifiedorder`;
  console.log(`[inpay] Payout request to ${url} for country ${params.countryCode}, merchantId: ${creds.merchantId}, bank_code: ${params.bankCode}, account: ${accountNum}`);

  const agent = getProxyAgent();
  const fetchOptions: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  if (agent) fetchOptions.agent = agent;

  console.log(`[inpay] Using proxy: ${PROXY_URL ? "YES" : "NO"}`);
  const response = await fetch(url, fetchOptions);

  const text = await response.text();
  try {
    return JSON.parse(text) as InpayPayoutResponse;
  } catch {
    console.error(`[inpay] Payout response not JSON (${response.status}):`, text.substring(0, 500));
    throw new Error(`InPay payout invalide (${response.status}). Verifiez les credentials pour ${params.countryCode}.`);
  }
}

export async function queryPayout(outTradeNo: string, countryCode: string): Promise<InpayQueryResponse> {
  const creds = getCredentials(countryCode);
  if (!creds) {
    throw new Error(`Pas de credentials InPay pour: ${countryCode}`);
  }

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: outTradeNo,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  data.sign = generateSign(data, creds.apiKey);

  const agent = getProxyAgent();
  const fetchOptions: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  if (agent) fetchOptions.agent = agent;

  const response = await fetch(`${creds.baseUrl}/inpays/payout/query`, fetchOptions);

  const text = await response.text();
  try {
    return JSON.parse(text) as InpayQueryResponse;
  } catch {
    console.error(`[inpay] Query payout response not JSON (${response.status}):`, text.substring(0, 500));
    throw new Error(`InPay query payout invalide (${response.status})`);
  }
}

export async function getPayoutBalance(countryCode?: string): Promise<InpayBalanceResponse> {
  const creds = countryCode ? getCredentials(countryCode) : getCredentials("TG");
  if (!creds) {
    throw new Error(`Pas de credentials InPay pour: ${countryCode || "TG"}`);
  }

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  data.sign = generateSign(data, creds.apiKey);

  const agent = getProxyAgent();
  const fetchOptions: any = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  };
  if (agent) fetchOptions.agent = agent;

  const response = await fetch(`${creds.baseUrl}/inpays/payout/balance`, fetchOptions);

  const text = await response.text();
  try {
    return JSON.parse(text) as InpayBalanceResponse;
  } catch {
    console.error(`[inpay] Balance response not JSON (${response.status}):`, text.substring(0, 500));
    throw new Error(`InPay balance invalide (${response.status})`);
  }
}

export function getConfiguredCountries(): string[] {
  return Object.entries(INPAY_COUNTRY_CREDENTIALS)
    .filter(([_, creds]) => creds.merchantId && creds.apiKey && creds.baseUrl)
    .map(([code]) => code);
}

export function mapInpayPayinStatus(status: string): "pending" | "approved" | "rejected" {
  switch (status) {
    case "payin_success":
      return "approved";
    case "payin_fail":
      return "rejected";
    default:
      return "pending";
  }
}

export function mapInpayPayoutStatus(status: string): "pending" | "approved" | "rejected" {
  switch (status) {
    case "payout_success":
      return "approved";
    case "payout_fail":
      return "rejected";
    default:
      return "pending";
  }
}
