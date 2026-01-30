const SOLEASPAY_API_URL = "https://soleaspay.com";
const API_KEY = process.env.SOLEASPAY_API_KEY;

export const SOLEASPAY_SERVICE_MAP: Record<string, Record<string, number>> = {
  CM: {
    "MTN": 1,
    "Orange Money": 2,
  },
  BF: {
    "Moov Money": 33,
    "Orange Money": 34,
  },
  TG: {
    "Moov Money": 38,
    "T-Money": 37,
  },
  BJ: {
    "MTN": 35,
    "Moov Money": 36,
  },
  CI: {
    "Orange Money": 29,
    "MTN": 30,
    "Moov Money": 31,
    "Wave": 32,
  },
  CG: {
    "MTN": 56,
    "Airtel Money": 55,
  },
  CD: {
    "Vodacom": 52,
    "Airtel Money": 53,
    "Orange Money": 54,
  },
};

export const CURRENCY_MAP: Record<string, string> = {
  CM: "XAF",
  BF: "XOF",
  TG: "XOF",
  BJ: "XOF",
  CI: "XOF",
  CG: "XAF",
  CD: "CDF",
};

interface SoleaspayPaymentRequest {
  wallet: string;
  amount: number;
  currency: string;
  order_id: string;
  description: string;
  payer: string;
  payerEmail: string;
  successUrl: string;
  failureUrl: string;
}

interface SoleaspayPaymentResponse {
  success: boolean;
  code?: number;
  status?: string;
  created_at?: string;
  data?: {
    operation: string;
    reference: string;
    external_reference: string;
    transaction_reference: string | null;
    transaction_category: string;
    transaction_channel: string;
    amount: string;
    currency: string;
  };
  message?: string;
}

interface SoleaspayVerifyResponse {
  success: boolean;
  code?: number;
  status?: string;
  created_at?: string;
  data?: {
    operation: string;
    reference: string;
    external_reference: string;
    transaction_reference: string;
    amount: number;
    currency: string;
  };
  message?: string;
}

export function getServiceId(country: string, paymentMethod: string): number | null {
  const countryServices = SOLEASPAY_SERVICE_MAP[country];
  if (!countryServices) return null;
  return countryServices[paymentMethod] || null;
}

export function getCurrency(country: string): string {
  return CURRENCY_MAP[country] || "XAF";
}

export function isSoleaspaySupported(country: string, paymentMethod: string): boolean {
  return getServiceId(country, paymentMethod) !== null;
}

export async function initiatePayment(
  wallet: string,
  amount: number,
  country: string,
  paymentMethod: string,
  orderId: string,
  payerName: string,
  payerEmail: string = "customer@fanuc.com"
): Promise<SoleaspayPaymentResponse> {
  const serviceId = getServiceId(country, paymentMethod);
  if (!serviceId) {
    throw new Error(`Service non supporte pour ${country} - ${paymentMethod}`);
  }

  const currency = getCurrency(country);
  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : "https://fanuc.replit.app";

  const requestBody: SoleaspayPaymentRequest = {
    wallet: wallet.replace(/\s/g, ""),
    amount,
    currency,
    order_id: orderId,
    description: `Depot FANUC #${orderId}`,
    payer: payerName,
    payerEmail,
    successUrl: `${baseUrl}/deposit-success`,
    failureUrl: `${baseUrl}/deposit-failed`,
  };

  const response = await fetch(`${SOLEASPAY_API_URL}/api/agent/bills/v3`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY || "",
      "operation": "2",
      "service": serviceId.toString(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json() as SoleaspayPaymentResponse;
  return result;
}

export async function verifyPayment(orderId: string, payId: string): Promise<SoleaspayVerifyResponse> {
  const response = await fetch(
    `${SOLEASPAY_API_URL}/api/agent/verif-pay?orderId=${orderId}&payId=${payId}`,
    {
      method: "GET",
      headers: {
        "x-api-key": API_KEY || "",
        "Content-Type": "application/json",
      },
    }
  );

  const result = await response.json() as SoleaspayVerifyResponse;
  return result;
}

export function mapSoleaspayStatus(status: string | undefined): "pending" | "approved" | "rejected" {
  if (!status) return "pending";
  
  const upperStatus = status.toUpperCase();
  
  if (upperStatus === "SUCCESS" || upperStatus === "COMPLETED") {
    return "approved";
  }
  if (upperStatus === "FAILURE" || upperStatus === "FAILED" || upperStatus === "REFUND") {
    return "rejected";
  }
  return "pending";
}
