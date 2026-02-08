import crypto from "crypto";

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
};

function getCredentials(countryCode: string): InpayCredentials | null {
  const creds = INPAY_COUNTRY_CREDENTIALS[countryCode];
  if (!creds || !creds.merchantId || !creds.apiKey || !creds.baseUrl) return null;
  return creds;
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
    "Moov Money": "3",
    "Tmoney": "7",
    "T-Money": "7",
    "Mixx by Yas": "7",
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

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: roundedAmount.toFixed(2),
    notify_url: params.notifyUrl,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    customer_name: params.customerName,
    customer_mobile: params.customerMobile,
    customer_email: params.customerEmail,
    country_prefix: countryPrefix,
  };

  data.sign = generateSign(data, creds.apiKey);

  const response = await fetch(`${creds.baseUrl}/inpays/payin/unifiedorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await response.json() as InpayPayinResponse;
  return result;
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

  const response = await fetch(`${creds.baseUrl}/inpays/payin/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json() as InpayQueryResponse;
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

  const data: Record<string, string> = {
    merchantid: creds.merchantId,
    out_trade_no: params.outTradeNo,
    total_fee: roundedAmount.toFixed(2),
    notify_url: params.notifyUrl,
    timestamp: Math.floor(Date.now() / 1000).toString(),
    bank_code: params.bankCode,
    account_number: params.accountNumber,
    customer_name: params.customerName,
    customer_mobile: params.customerMobile,
    customer_email: params.customerEmail,
    country_prefix: countryPrefix,
  };

  data.sign = generateSign(data, creds.apiKey);

  const response = await fetch(`${creds.baseUrl}/inpays/payout/unifiedorder`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json() as InpayPayoutResponse;
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

  const response = await fetch(`${creds.baseUrl}/inpays/payout/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json() as InpayQueryResponse;
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

  const response = await fetch(`${creds.baseUrl}/inpays/payout/balance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await response.json() as InpayBalanceResponse;
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
