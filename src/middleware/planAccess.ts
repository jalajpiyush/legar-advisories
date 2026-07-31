import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { safeGetDoc, safeSetDoc } from '../services/payuBackendService';

export type PlanType = 'free' | 'individual' | 'lawyer';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export function normalizePlanName(planInput: any): PlanType {
  if (!planInput) return 'free';
  const str = String(planInput).toLowerCase().trim();
  if (str.includes('lawyer') || str.includes('pro') || str.includes('enterprise')) return 'lawyer';
  if (str.includes('individual')) return 'individual';
  return 'free';
}

export function getPlanRank(plan: PlanType): number {
  switch (plan) {
    case 'lawyer': return 2;
    case 'individual': return 1;
    case 'free':
    default: return 0;
  }
}

export const FEATURE_MIN_PLANS: Record<string, PlanType> = {
  'basic_research': 'free',
  'document_summary': 'free',
  'contract_analysis': 'individual',
  'legal_notice_review': 'individual',
  'clause_explanation': 'individual',
  'export_pdf': 'individual',
  'priority_support': 'individual',
  'ocr': 'lawyer',
  'ai_contract_drafting': 'lawyer',
  'case_law_research': 'lawyer',
  'citation_support': 'lawyer',
  'client_workspace': 'lawyer',
  'team_collaboration': 'lawyer',
  'api_access': 'lawyer',
  'priority_processing': 'lawyer',
  'premium_support': 'lawyer',
};

/**
 * Fetches user plan & subscription status from Single Source of Truth:
 * users/{uid}.plan AND subscriptions/{uid}.status
 * Automatically downgrades expired subscriptions to 'free'.
 */
export async function getUserPlanAndStatus(userId: string): Promise<{
  plan: PlanType;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiry: number | null;
  userData: any;
}> {
  if (!userId) {
    return { plan: 'free', subscriptionStatus: 'expired', subscriptionExpiry: null, userData: {} };
  }

  // 1. Read user doc
  const userDocResult = await safeGetDoc('users', userId);
  const userData = userDocResult.exists ? userDocResult.data : {};

  // 2. Read sub doc
  const subDocResult = await safeGetDoc('subscriptions', userId);
  const subData = subDocResult.exists ? subDocResult.data : {};

  let rawPlan = userData.plan || subData.plan || 'free';
  let plan = normalizePlanName(rawPlan);
  let subscriptionStatus: SubscriptionStatus = (userData.subscriptionStatus || userData.subscription_status || subData.status || 'active') as SubscriptionStatus;
  
  const expiry = userData.subscriptionExpiry || userData.subscription_expiry || subData.expiryDate || subData.end_date || null;
  const now = Date.now();

  // AUTO DOWNGRADE: if subscription is expired, revert to free immediately
  if (plan !== 'free' && ((expiry && expiry < now) || subscriptionStatus === 'expired')) {
    plan = 'free';
    subscriptionStatus = 'expired';

    // Persist auto downgrade
    await safeSetDoc('users', userId, {
      plan: 'free',
      subscriptionStatus: 'expired',
      subscription_status: 'expired',
      updatedAt: now,
      updated_at: now,
    });

    await safeSetDoc('subscriptions', userId, {
      status: 'expired',
      updatedAt: now,
      updated_at: now,
    });
  }

  return {
    plan,
    subscriptionStatus,
    subscriptionExpiry: expiry,
    userData
  };
}

/**
 * Checks and increments AI chat / document upload limits atomically
 */
export async function checkAndIncrementPlanUsage(
  userId: string,
  plan: PlanType,
  type: 'chat' | 'doc'
): Promise<{ allowed: boolean; error?: string; remaining?: number }> {
  if (!userId) {
    return { allowed: true };
  }

  // LAWYER plan has unlimited usage
  if (plan === 'lawyer') {
    return { allowed: true, remaining: -1 };
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const monthStr = todayStr.substring(0, 7); // YYYY-MM

  const userDocResult = await safeGetDoc('users', userId);
  const userData = userDocResult.exists ? userDocResult.data : {};

  let chatUsedToday = Number(userData.chatUsedToday) || 0;
  let chatUsedMonth = Number(userData.chatUsedMonth) || 0;
  let documentUsedToday = Number(userData.documentUsedToday) || 0;
  let documentUsedMonth = Number(userData.documentUsedMonth) || 0;

  const lastChatDate = userData.lastChatDate || '';
  const lastChatMonth = userData.lastChatMonth || '';
  const lastDocDate = userData.lastDocDate || '';
  const lastDocMonth = userData.lastDocMonth || '';

  // Daily reset check
  if (lastChatDate !== todayStr) {
    chatUsedToday = 0;
  }
  if (lastDocDate !== todayStr) {
    documentUsedToday = 0;
  }

  // Monthly reset check
  if (lastChatMonth !== monthStr) {
    chatUsedMonth = 0;
  }
  if (lastDocMonth !== monthStr) {
    documentUsedMonth = 0;
  }

  // Enforce Limits
  if (plan === 'free') {
    if (type === 'chat') {
      const MAX_FREE_CHAT = 20;
      if (chatUsedToday >= MAX_FREE_CHAT) {
        return { allowed: false, error: "Daily limit reached" };
      }
      chatUsedToday += 1;
      chatUsedMonth += 1;
    } else {
      const MAX_FREE_DOC = 3;
      if (documentUsedToday >= MAX_FREE_DOC) {
        return { allowed: false, error: "Daily limit reached" };
      }
      documentUsedToday += 1;
      documentUsedMonth += 1;
    }
  } else if (plan === 'individual') {
    if (type === 'chat') {
      const MAX_INDIVIDUAL_CHAT = 500;
      if (chatUsedMonth >= MAX_INDIVIDUAL_CHAT) {
        return { allowed: false, error: "Monthly limit reached" };
      }
      chatUsedToday += 1;
      chatUsedMonth += 1;
    } else {
      const MAX_INDIVIDUAL_DOC = 100;
      if (documentUsedMonth >= MAX_INDIVIDUAL_DOC) {
        return { allowed: false, error: "Monthly limit reached" };
      }
      documentUsedToday += 1;
      documentUsedMonth += 1;
    }
  }

  // Update usage in Firestore / memory store
  await safeSetDoc('users', userId, {
    chatUsedToday,
    chatUsedMonth,
    documentUsedToday,
    documentUsedMonth,
    lastChatDate: todayStr,
    lastChatMonth: monthStr,
    lastDocDate: todayStr,
    lastDocMonth: monthStr,
    updatedAt: Date.now(),
  });

  return { allowed: true };
}

/**
 * Backend middleware enforcing plan level, feature permissions, and usage limits.
 * Return format on block: { success: false, error: "..." }
 */
export function requirePlan(
  requiredPlan: PlanType,
  options?: { featureName?: string; usageType?: 'chat' | 'doc' }
) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.uid;
      if (!userId) {
        return res.status(401).json({ success: false, error: "Unauthorized: Authentication required" });
      }

      // Single source of truth fetch (includes auto downgrade if expired)
      const { plan, subscriptionStatus } = await getUserPlanAndStatus(userId);

      const userRank = getPlanRank(plan);
      const requiredRank = getPlanRank(requiredPlan);

      // Plan tier validation
      if (userRank < requiredRank) {
        return res.status(403).json({
          success: false,
          error: `Plan upgrade required (${requiredPlan.toUpperCase()} plan needed)`,
          requiredPlan,
          currentPlan: plan
        });
      }

      // Feature specific access check
      if (options?.featureName) {
        const minPlanForFeature = FEATURE_MIN_PLANS[options.featureName] || requiredPlan;
        if (userRank < getPlanRank(minPlanForFeature)) {
          return res.status(403).json({
            success: false,
            error: `Feature '${options.featureName}' requires ${minPlanForFeature.toUpperCase()} plan.`,
            requiredPlan: minPlanForFeature,
            currentPlan: plan
          });
        }
      }

      // Usage limits check
      if (options?.usageType) {
        const usageCheck = await checkAndIncrementPlanUsage(userId, plan, options.usageType);
        if (!usageCheck.allowed) {
          return res.status(403).json({
            success: false,
            error: usageCheck.error || "Usage limit reached"
          });
        }
      }

      (req as any).userPlan = plan;
      (req as any).subscriptionStatus = subscriptionStatus;
      next();
    } catch (error: any) {
      console.error("requirePlan middleware error:", error);
      res.status(500).json({ success: false, error: "Internal plan validation error" });
    }
  };
}
