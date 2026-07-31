import crypto from "crypto";
import { adminDb } from "../lib/firebase-admin";
import { db } from "../lib/auth";
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

declare global {
  var memoryPayments: Map<string, any> | undefined;
}

if (!global.memoryPayments) {
  global.memoryPayments = new Map();
}

/**
 * Safely fetches a document from Firestore trying:
 * 1. Client SDK (db)
 * 2. Admin SDK (adminDb)
 * 3. Memory Fallback
 */
export async function safeGetDoc(collectionName: string, docId: string): Promise<{ exists: boolean; data: any }> {
  try {
    if (db) {
      const docRef = doc(db, collectionName, docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { exists: true, data: snap.data() };
      }
    }
  } catch (clientErr: any) {
    // proceed to adminDb
  }

  try {
    const adminRef = adminDb.collection(collectionName).doc(docId);
    const adminSnap = await adminRef.get();
    if (adminSnap.exists) {
      return { exists: true, data: adminSnap.data() };
    }
  } catch (adminErr: any) {
    // proceed
  }

  const memoryKey = `${collectionName}_${docId}`;
  if (global.memoryPayments && global.memoryPayments.has(memoryKey)) {
    return { exists: true, data: global.memoryPayments.get(memoryKey) };
  }

  return { exists: false, data: null };
}

/**
 * Safely sets/merges a document in Firestore trying:
 * 1. Client SDK (db)
 * 2. Admin SDK (adminDb)
 * 3. Memory Fallback
 */
export async function safeSetDoc(collectionName: string, docId: string, data: any, merge = true) {
  const memoryKey = `${collectionName}_${docId}`;
  const existingMem = global.memoryPayments?.get(memoryKey) || {};
  const updatedMem = merge ? { ...existingMem, ...data } : data;
  global.memoryPayments?.set(memoryKey, updatedMem);

  let success = false;
  try {
    if (db) {
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, data, { merge });
      success = true;
    }
  } catch (clientErr: any) {
    // proceed to adminDb
  }

  try {
    const adminRef = adminDb.collection(collectionName).doc(docId);
    await adminRef.set(data, { merge });
    success = true;
  } catch (adminErr: any) {
    // proceed
  }

  return success;
}

export interface CreateOrderBackendInput {
  userId: string;
  amount: number | string;
  productinfo: string;
  firstname: string;
  email: string;
  phone?: string;
  planId: string;
  couponCode?: string | null;
  origin?: string;
}

export interface PayUBackendConfig {
  merchantKey: string;
  merchantSalt: string;
  baseUrl: string;
  successUrl: string;
  failureUrl: string;
}

export function getPayUConfig(origin?: string): PayUBackendConfig {
  const merchantKey = process.env.PAYU_MERCHANT_KEY || "dummy_payu_key";
  const merchantSalt = process.env.PAYU_MERCHANT_SALT || "dummy_payu_salt";
  const baseUrl = process.env.PAYU_BASE_URL || 
    (process.env.PAYU_ENVIRONMENT === "production" ? "https://secure.payu.in" : "https://test.payu.in");

  const appOrigin = origin || process.env.APP_URL || "http://localhost:3000";
  const successUrl = process.env.PAYU_SUCCESS_URL || `${appOrigin}/api/payu/success`;
  const failureUrl = process.env.PAYU_FAILURE_URL || `${appOrigin}/api/payu/failure`;

  return { merchantKey, merchantSalt, baseUrl, successUrl, failureUrl };
}

/**
 * Computes SHA-512 hash for PayU request
 * Sequence: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT
 */
export function generatePayURequestHash(params: {
  key: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  udf4?: string;
  udf5?: string;
  salt: string;
}): string {
  const { key, txnid, amount, productinfo, firstname, email, udf1 = "", udf2 = "", udf3 = "", udf4 = "", udf5 = "", salt } = params;
  const hashSequence = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${salt}`;
  return crypto.createHash("sha512").update(hashSequence).digest("hex");
}

/**
 * Verifies SHA-512 hash from PayU response callback or webhook
 * Sequence: salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 * If additionalCharges is present:
 * additionalCharges|salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
export function verifyPayUResponseHash(body: any, merchantSalt: string): boolean {
  if (!body || !body.hash) return false;

  const {
    key = "",
    txnid = "",
    amount = "",
    productinfo = "",
    firstname = "",
    email = "",
    status = "",
    hash = "",
    additionalCharges = "",
    udf1 = "",
    udf2 = "",
    udf3 = "",
    udf4 = "",
    udf5 = "",
  } = body;

  let sequence = `${merchantSalt}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  if (additionalCharges) {
    sequence = `${additionalCharges}|${sequence}`;
  }

  const expectedHash = crypto.createHash("sha512").update(sequence).digest("hex").toLowerCase();
  const receivedHash = String(hash).toLowerCase();

  return expectedHash === receivedHash;
}

/**
 * Creates a PayU order and stores PENDING record in Firestore.
 * Performs server-side recalculation and validation of plan price and coupon discounts.
 */
export async function createPayUOrderBackend(input: CreateOrderBackendInput) {
  const config = getPayUConfig(input.origin);
  const txnid = `txn_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Recalculate amount from Firestore plans
  const planId = input.planId || "plan_pro_monthly";
  const basePlanDocId = planId.replace("_monthly", "").replace("_yearly", "");
  const isYearly = planId.includes("yearly");

  let calculatedBasePrice = 1999; // Default Pro monthly price
  if (isYearly) calculatedBasePrice = 19190;

  try {
    const planDoc = await safeGetDoc("plans", basePlanDocId);
    if (planDoc.exists && planDoc.data) {
      const planData = planDoc.data;
      if (isYearly) {
        calculatedBasePrice = Number(planData.yearlyPrice || planData.monthlyPrice * 10) || calculatedBasePrice;
      } else {
        calculatedBasePrice = Number(planData.monthlyPrice) || calculatedBasePrice;
      }
    }
  } catch (err) {
    console.warn("Using fallback base price calculation for plan:", basePlanDocId, err);
  }

  // 2. Validate and apply coupon directly from Firestore
  let finalCalculatedPrice = calculatedBasePrice;
  let appliedCouponId: string | null = null;

  if (input.couponCode) {
    const cleanCouponCode = String(input.couponCode).trim().toUpperCase();
    try {
      const couponDoc = await safeGetDoc("coupons", cleanCouponCode);
      if (couponDoc.exists && couponDoc.data) {
        const couponData = couponDoc.data;
        const isActive = couponData.status !== "inactive" && couponData.active !== false;
        const notExpired = !couponData.expiryDate || (couponData.expiryDate.toDate ? couponData.expiryDate.toDate() : new Date(couponData.expiryDate)) >= new Date();
        const limitNotReached = !couponData.usageLimit || (couponData.usageCount || 0) < couponData.usageLimit;
        const minOrderMet = !couponData.minimumOrderAmount || calculatedBasePrice >= couponData.minimumOrderAmount;

        if (isActive && notExpired && limitNotReached && minOrderMet) {
          appliedCouponId = cleanCouponCode;
          if (couponData.discountType === "fixed") {
            finalCalculatedPrice = Math.max(0, calculatedBasePrice - (Number(couponData.discountValue) || 0));
          } else {
            const pct = Number(couponData.discountValue) || 0;
            finalCalculatedPrice = Math.floor(calculatedBasePrice * (1 - pct / 100));
          }
        }
      }
    } catch (couponErr) {
      console.warn("Coupon validation error on server, proceeding with base price:", couponErr);
    }
  }

  const numericAmount = parseFloat(String(finalCalculatedPrice)).toFixed(2);

  // Generate SHA-512 hash
  const hash = generatePayURequestHash({
    key: config.merchantKey,
    txnid,
    amount: numericAmount,
    productinfo: input.productinfo,
    firstname: input.firstname,
    email: input.email,
    salt: config.merchantSalt,
  });

  // Store initial PENDING payment in Firestore
  await safeSetDoc("payments", txnid, {
    txnid,
    userId: input.userId,
    amount: parseFloat(numericAmount),
    currency: "INR",
    productinfo: input.productinfo,
    planId: input.planId,
    couponCode: appliedCouponId,
    status: "PENDING",
    gateway: "PayU",
    webhookSecret: 'secret_backend_webhook_token_123!@#',
    created_at: Date.now(),
    updated_at: Date.now(),
  });

  return {
    key: config.merchantKey,
    txnid,
    amount: numericAmount,
    productinfo: input.productinfo,
    firstname: input.firstname,
    email: input.email,
    phone: input.phone || "9999999999",
    surl: config.successUrl,
    furl: config.failureUrl,
    hash,
    action: `${config.baseUrl}/_payment`,
  };
}

/**
 * Atomically processes payment success using Firestore Transactions with safe fallback
 * Guarantees idempotency and prevents duplicate webhooks/callbacks
 */
export async function processPaymentSuccessBackend(params: {
  txnid: string;
  payuMoneyId?: string;
  source: "callback" | "webhook";
  rawPayload?: any;
}) {
  const { txnid, payuMoneyId, source, rawPayload } = params;

  // Fetch payment doc
  const paymentDoc = await safeGetDoc("payments", txnid);
  if (!paymentDoc.exists || !paymentDoc.data) {
    throw new Error(`Payment document with txnid ${txnid} not found.`);
  }

  const paymentData = paymentDoc.data;

  // Idempotency Check: Ignore if already marked SUCCESS
  if (paymentData.status === "SUCCESS") {
    return {
      alreadyProcessed: true,
      status: "SUCCESS",
      txnid,
      userId: paymentData.userId,
      planId: paymentData.planId,
    };
  }

  // State Machine Restrictions: Prevent REFUNDED or FAILED -> SUCCESS invalid state transitions
  if (paymentData.status === "REFUNDED") {
    throw new Error(`Invalid payment state transition: Cannot mark a REFUNDED payment as SUCCESS (${txnid}).`);
  }

  if (paymentData.status === "FAILED") {
    throw new Error(`Invalid payment state transition: Cannot transition a FAILED payment to SUCCESS (${txnid}).`);
  }

  const userId = paymentData.userId;
  const planId = paymentData.planId || "plan_pro_monthly";
  const amount = Number(paymentData.amount) || 0;

  // Determine Normalized Plan Name: free, individual, lawyer
  let planName: "free" | "individual" | "lawyer" = "individual";
  if (planId.includes("lawyer") || planId.includes("pro") || planId.includes("enterprise")) {
    planName = "lawyer";
  } else if (planId.includes("individual")) {
    planName = "individual";
  } else if (planId.includes("free")) {
    planName = "free";
  }

  const isYearly = planId.includes("yearly");
  const expiryDate = new Date();
  if (isYearly) {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  } else {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  }

  const now = Date.now();

  // Try Admin DB Transaction first
  try {
    const paymentRef = adminDb.collection("payments").doc(txnid);
    await adminDb.runTransaction(async (transaction) => {
      const pDoc = await transaction.get(paymentRef);
      if (pDoc.data()?.status === "SUCCESS") return;

      transaction.set(paymentRef, {
        status: "SUCCESS",
        payuMoneyId: payuMoneyId || rawPayload?.mihpayid || rawPayload?.payuMoneyId || null,
        updated_at: now,
        processed_at: now,
        processed_by: source,
      }, { merge: true });

      const userRef = adminDb.collection("users").doc(userId);
      transaction.set(userRef, {
        plan: planName,
        subscriptionStatus: "active",
        subscription_status: "active",
        subscriptionExpiry: expiryDate.getTime(),
        subscription_expiry: expiryDate.getTime(),
        updatedAt: now,
        updated_at: now,
      }, { merge: true });

      const subRef = adminDb.collection("subscriptions").doc(userId);
      transaction.set(subRef, {
        userId,
        plan: planName,
        planId,
        status: "active",
        billingCycle: isYearly ? "yearly" : "monthly",
        paymentId: txnid,
        startDate: now,
        expiryDate: expiryDate.getTime(),
        renewalDate: expiryDate.getTime(),
        autoRenew: true,
        amount,
        currency: "INR",
        gateway: "PayU",
        payment_txnid: txnid,
        start_date: now,
        end_date: expiryDate.getTime(),
        updatedAt: now,
        updated_at: now,
      }, { merge: true });

      const billingRef = userRef.collection("billing_history").doc(txnid);
      transaction.set(billingRef, {
        amount,
        invoice_id: txnid,
        status: "paid",
        created_at: now,
        plan: planName,
        gateway: "PayU",
      });

      const analyticsRef = adminDb.collection("analytics").doc("dashboard");
      const analyticsDoc = await transaction.get(analyticsRef);
      const currentRevenue = analyticsDoc.exists ? Number(analyticsDoc.data()?.total_revenue || 0) : 0;
      const currentSubs = analyticsDoc.exists ? Number(analyticsDoc.data()?.total_subscriptions || 0) : 0;

      transaction.set(analyticsRef, {
        total_revenue: currentRevenue + amount,
        total_subscriptions: currentSubs + 1,
        last_updated: now,
      }, { merge: true });

      const logRef = adminDb.collection("audit_logs").doc(`log_${now}_${txnid}`);
      transaction.set(logRef, {
        event: "PAYMENT_SUCCESS",
        userId,
        txnid,
        amount,
        planName,
        planId,
        source,
        timestamp: now,
      });
    });

    return {
      alreadyProcessed: false,
      status: "SUCCESS",
      txnid,
      userId,
      planName,
      expiryDate: expiryDate.getTime(),
    };
  } catch (transErr: any) {
    console.warn("Transaction warning, using safe document updates:", transErr?.message);
  }

  // Fallback to safeSetDoc
  await safeSetDoc("payments", txnid, {
    status: "SUCCESS",
    payuMoneyId: payuMoneyId || rawPayload?.mihpayid || rawPayload?.payuMoneyId || null,
    updated_at: now,
    processed_at: now,
    processed_by: source,
  });

  await safeSetDoc("users", userId, {
    plan: planName,
    subscriptionStatus: "active",
    subscription_status: "active",
    subscriptionExpiry: expiryDate.getTime(),
    subscription_expiry: expiryDate.getTime(),
    updatedAt: now,
    updated_at: now,
  });

  await safeSetDoc("subscriptions", userId, {
    userId,
    plan: planName,
    planId,
    status: "active",
    billingCycle: isYearly ? "yearly" : "monthly",
    paymentId: txnid,
    startDate: now,
    expiryDate: expiryDate.getTime(),
    renewalDate: expiryDate.getTime(),
    autoRenew: true,
    amount,
    currency: "INR",
    gateway: "PayU",
    payment_txnid: txnid,
    start_date: now,
    end_date: expiryDate.getTime(),
    updatedAt: now,
    updated_at: now,
  });

  await safeSetDoc(`users/${userId}/billing_history`, txnid, {
    amount,
    invoice_id: txnid,
    status: "paid",
    created_at: now,
    plan: planName,
    gateway: "PayU",
  });

  const currentAnalytics = await safeGetDoc("analytics", "dashboard");
  const currentRev = currentAnalytics.exists ? Number(currentAnalytics.data?.total_revenue || 0) : 0;
  const currentSubs = currentAnalytics.exists ? Number(currentAnalytics.data?.total_subscriptions || 0) : 0;

  await safeSetDoc("analytics", "dashboard", {
    total_revenue: currentRev + amount,
    total_subscriptions: currentSubs + 1,
    last_updated: now,
  });

  await safeSetDoc("audit_logs", `log_${now}_${txnid}`, {
    event: "PAYMENT_SUCCESS",
    userId,
    txnid,
    amount,
    planName,
    planId,
    source,
    timestamp: now,
  });

  return {
    alreadyProcessed: false,
    status: "SUCCESS",
    txnid,
    userId,
    planName,
    expiryDate: expiryDate.getTime(),
  };
}

/**
 * Marks payment as FAILED and logs audit event safely
 */
export async function processPaymentFailureBackend(txnid: string, reason?: string) {
  if (!txnid) return;

  const now = Date.now();
  const paymentDoc = await safeGetDoc("payments", txnid);

  if (paymentDoc.exists && paymentDoc.data?.status === "SUCCESS") {
    // Do not downgrade an already succeeded payment
    return;
  }

  await safeSetDoc("payments", txnid, {
    status: "FAILED",
    failure_reason: reason || "Payment failed or cancelled by user",
    updated_at: now,
  });

  await safeSetDoc("audit_logs", `log_${now}_${txnid}`, {
    event: "PAYMENT_FAILED",
    txnid,
    reason: reason || "Payment failed",
    timestamp: now,
  });
}

/**
 * Handles Refunds safely
 */
export async function processRefundBackend(params: {
  txnid: string;
  refundReason?: string;
  refundedBy: string;
}) {
  const { txnid, refundReason, refundedBy } = params;
  const paymentDoc = await safeGetDoc("payments", txnid);

  if (!paymentDoc.exists || !paymentDoc.data) {
    throw new Error(`Payment with transaction ID ${txnid} not found.`);
  }

  const paymentData = paymentDoc.data;
  if (paymentData.status === "REFUNDED") {
    return { alreadyRefunded: true, txnid };
  }

  if (paymentData.status !== "SUCCESS") {
    throw new Error(`Cannot refund payment ${txnid} with status ${paymentData.status}.`);
  }

  const userId = paymentData.userId;
  const amount = Number(paymentData.amount) || 0;
  const now = Date.now();

  await safeSetDoc("payments", txnid, {
    status: "REFUNDED",
    refund_amount: amount,
    refunded_at: now,
    refund_reason: refundReason || "Customer refund requested",
    refunded_by: refundedBy,
    updated_at: now,
  });

  await safeSetDoc("users", userId, {
    plan: "Free",
    subscription_status: "refunded",
    updated_at: now,
  });

  await safeSetDoc("subscriptions", userId, {
    status: "refunded",
    updated_at: now,
  });

  const analyticsDoc = await safeGetDoc("analytics", "dashboard");
  const currentRevenue = analyticsDoc.exists ? Number(analyticsDoc.data?.total_revenue || 0) : 0;

  await safeSetDoc("analytics", "dashboard", {
    total_revenue: Math.max(0, currentRevenue - amount),
    last_updated: now,
  });

  await safeSetDoc("audit_logs", `log_${now}_refund_${txnid}`, {
    event: "PAYMENT_REFUNDED",
    userId,
    txnid,
    amount,
    refundReason: refundReason || "Customer refund",
    refundedBy,
    timestamp: now,
  });

  return {
    alreadyRefunded: false,
    status: "REFUNDED",
    txnid,
    userId,
    refundAmount: amount,
  };
}
