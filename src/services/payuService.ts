import { auth } from "../lib/auth";

export interface CreateOrderParams {
  amount: number | string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  planId: string;
  couponCode?: string;
}

export interface PayUOrderResponse {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string;
  furl: string;
  hash: string;
  action: string;
}

/**
 * Calls the Railway backend to create a PayU order and retrieve signed form params.
 * The backend handles hash calculation and merchant credentials securely.
 */
export async function createPayUOrder(params: CreateOrderParams): Promise<PayUOrderResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User must be authenticated to initiate payment.");
  }

  const token = await currentUser.getIdToken();
  const metaEnv = (import.meta as any).env || {};
  const backendBaseUrl = metaEnv.VITE_RAILWAY_BACKEND_URL || metaEnv.VITE_BACKEND_URL || "";
  const endpoint = `${backendBaseUrl}/api/payment/create-order`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      amount: params.amount.toString(),
      productinfo: params.productinfo,
      firstname: params.firstname || currentUser.displayName || "Customer",
      email: params.email || currentUser.email || "",
      phone: params.phone || "9999999999",
      planId: params.planId,
      couponCode: params.couponCode || null,
      origin: window.location.origin,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Failed to create payment order from Railway backend.");
  }

  return data as PayUOrderResponse;
}

/**
 * Redirects the user to the PayU gateway page by dynamically generating
 * and submitting a hidden HTML form with backend-signed fields.
 */
export function redirectToPayU(payuData: PayUOrderResponse): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payuData.action;
  form.target = "_self"; // Redirects current frame/window safely

  const fields: (keyof PayUOrderResponse)[] = [
    "key",
    "txnid",
    "amount",
    "productinfo",
    "firstname",
    "email",
    "phone",
    "surl",
    "furl",
    "hash",
  ];

  fields.forEach((field) => {
    if (payuData[field]) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = field;
      input.value = payuData[field] as string;
      form.appendChild(input);
    }
  });

  document.body.appendChild(form);
  form.submit();
}
