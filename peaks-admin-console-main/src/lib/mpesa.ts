/**
 * M-Pesa Daraja STK Push helpers (server-only).
 * Uses sandbox by default; switch to live by setting MPESA_ENV=live and
 * providing live credentials.
 */

export type MpesaEnv = "sandbox" | "live";

export function getMpesaEnv(): MpesaEnv {
  return (process.env.MPESA_ENV === "live" ? "live" : "sandbox") as MpesaEnv;
}

export function mpesaBaseUrl(env: MpesaEnv) {
  return env === "live"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
}

export function timestamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

export async function getAccessToken(env: MpesaEnv): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY;
  const secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error("MPESA_CONSUMER_KEY/SECRET not configured");
  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(
    `${mpesaBaseUrl(env)}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } },
  );
  const json = (await res.json()) as { access_token?: string; errorMessage?: string };
  if (!res.ok || !json.access_token) {
    throw new Error(`M-Pesa auth failed: ${json.errorMessage ?? res.status}`);
  }
  return json.access_token;
}

export async function stkPush(input: {
  env: MpesaEnv;
  phone: string;
  amount: number;
  accountReference: string;
  description: string;
  callbackUrl: string;
}) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  if (!shortcode || !passkey) throw new Error("MPESA_SHORTCODE/PASSKEY not configured");

  const token = await getAccessToken(input.env);
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");

  const body = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: ts,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.max(1, Math.round(input.amount)),
    PartyA: input.phone,
    PartyB: shortcode,
    PhoneNumber: input.phone,
    CallBackURL: input.callbackUrl,
    AccountReference: input.accountReference.slice(0, 12),
    TransactionDesc: input.description.slice(0, 13),
  };

  const res = await fetch(`${mpesaBaseUrl(input.env)}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`STK push failed [${res.status}]: ${JSON.stringify(json)}`);
  }
  return json as {
    MerchantRequestID: string;
    CheckoutRequestID: string;
    ResponseCode: string;
    ResponseDescription: string;
    CustomerMessage: string;
  };
}
