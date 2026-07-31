import React, { useState, useEffect } from "react";
import { CreditCard, History, Zap, CheckCircle2, AlertCircle, Tag, Check, Shield } from "lucide-react";
import { auth, db } from "../lib/auth";
import { doc, collection, onSnapshot, getDoc } from "firebase/firestore";
import { createPayUOrder, redirectToPayU } from "../services/payuService";
import { AdminPortal } from "../components/AdminPortal";

const DEFAULT_PLANS = [
  {
    id: "plan_free",
    heading: "FREE",
    description: "Essential legal AI research & document analysis for personal use.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isFree: true,
    features: [
      "20 AI chats/day",
      "3 document uploads/day",
      "Basic legal research",
      "Document summaries",
      "Community support"
    ]
  },
  {
    id: "plan_individual",
    heading: "INDIVIDUAL",
    description: "Enhanced AI capacity for solo practitioners, legal analysts & advisors.",
    monthlyPrice: 499,
    yearlyPrice: 4790,
    features: [
      "500 AI chats/month",
      "100 document uploads/month",
      "Contract analysis",
      "Legal notice review",
      "Clause explanation",
      "Export PDF",
      "Priority support"
    ]
  },
  {
    id: "plan_lawyer",
    heading: "LAWYER",
    description: "Complete professional legal suite for advocates, firms & senior counsel.",
    monthlyPrice: 1999,
    yearlyPrice: 19190,
    badge: "Most Popular",
    features: [
      "Unlimited AI chats",
      "Unlimited document uploads",
      "OCR",
      "AI Contract Drafting",
      "Case Law Research",
      "Citation Support",
      "Client Workspace",
      "Team Collaboration",
      "API Access",
      "Priority Processing",
      "Premium Support"
    ]
  }
];

export function Billing({ embedded = false }: { embedded?: boolean }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Firestore Plans state
  const [plans, setPlans] = useState<any[]>([]);
  const [plansError, setPlansError] = useState("");

  // Payment banner status
  const [paymentNotice, setPaymentNotice] = useState<{ type: 'success' | 'failed'; message: string } | null>(null);

  useEffect(() => {
    // 1. Inspect URL parameters for payment redirects
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'success') {
      setPaymentNotice({
        type: 'success',
        message: 'Payment completed successfully! Your subscription has been activated.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'failed' || status === 'error') {
      setPaymentNotice({
        type: 'failed',
        message: 'Payment was not completed. Please try again or choose a different payment method.'
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Real-time Auth & User Subscription Listener in Firestore
    let unsubscribeUserSnap: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) {
        setProfile(null);
        setHistory([]);
        setLoading(false);
        if (unsubscribeUserSnap) unsubscribeUserSnap();
        return;
      }

      // Real-time listener for user profile & subscription stored in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribeUserSnap = onSnapshot(userDocRef, (snap) => {
        if (snap.exists()) {
          setProfile(snap.data());
        }
      }, (err) => {
        console.error("User profile subscription snapshot error:", err);
      });

      // Also fetch billing history from backend
      const fetchProfileAndHistory = async () => {
        try {
          const token = await user.getIdToken();
          const res = await fetch("/api/user/profile", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.profile) setProfile((prev: any) => ({ ...prev, ...data.profile }));
            if (data.history) setHistory(data.history);
          }
        } catch (err) {
          console.error("Error fetching user profile & history:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchProfileAndHistory();
    });

    // 3. Real-time listener for Plans in Firestore
    const unsubscribePlans = onSnapshot(collection(db, 'plans'), (plansSnap) => {
      const plansData = plansSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (plansData.length > 0) {
        setPlans(plansData);
      } else {
        setPlans(DEFAULT_PLANS);
      }
      setPlansError("");
    }, (err) => {
      console.warn("Firestore plans query warning (using defaults):", err?.message);
      setPlans(DEFAULT_PLANS);
      setPlansError("");
    });

    return () => {
      unsubscribeAuth();
      unsubscribePlans();
      if (unsubscribeUserSnap) unsubscribeUserSnap();
    };
  }, []);

  // Validate coupon directly from Firestore
  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setAppliedCoupon(null);
      return;
    }

    setValidatingCoupon(true);
    try {
      const docRef = doc(db, 'coupons', code);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setCouponError("Invalid coupon code.");
        setAppliedCoupon(null);
        return;
      }

      const data = docSnap.data();

      if (data.status === 'inactive' || data.active === false) {
        setCouponError("This coupon is inactive.");
        setAppliedCoupon(null);
        return;
      }

      if (data.expiryDate) {
        const expiry = data.expiryDate.toDate ? data.expiryDate.toDate() : new Date(data.expiryDate);
        if (expiry < new Date()) {
          setCouponError("This coupon has expired.");
          setAppliedCoupon(null);
          return;
        }
      }

      if (data.usageLimit && (data.usageCount || 0) >= data.usageLimit) {
        setCouponError("Coupon usage limit has been reached.");
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon({ id: docSnap.id, ...data });
      setCouponSuccess(
        data.discountType === 'fixed'
          ? `Coupon applied! ₹${data.discountValue} discount`
          : `Coupon applied! ${data.discountValue}% discount`
      );
    } catch (err: any) {
      console.error("Coupon lookup error:", err);
      setCouponError("Failed to validate coupon code.");
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  // Calculate price after applying coupon
  const getDiscountedPriceRaw = (basePrice: number, planId?: string) => {
    if (!appliedCoupon || basePrice <= 0) return basePrice;
    if (appliedCoupon.minimumOrderAmount && basePrice < appliedCoupon.minimumOrderAmount) return basePrice;
    if (appliedCoupon.applicablePlan && appliedCoupon.applicablePlan !== "all" && planId && !planId.includes(appliedCoupon.applicablePlan)) return basePrice;

    if (appliedCoupon.discountType === 'fixed') {
      return Math.max(0, basePrice - (appliedCoupon.discountValue || 0));
    }
    return Math.floor(basePrice * (1 - (appliedCoupon.discountValue || 0) / 100));
  };

  // Handle PayU order initiation via Railway backend
  const handleSubscribe = async (planId: string, planName: string, basePrice: number) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Please log in to proceed with payment.");
      return;
    }

    setProcessing(true);
    try {
      const finalPrice = getDiscountedPriceRaw(basePrice, planId);
      const selectedCycle = isYearly ? "Yearly" : "Monthly";

      // 1. Call Railway backend to create order & generate PayU params (hash calculated server-side)
      const payuParams = await createPayUOrder({
        amount: finalPrice,
        productinfo: `${planName} (${selectedCycle})`,
        firstname: profile?.displayName || currentUser.displayName || "Customer",
        email: currentUser.email || "",
        phone: profile?.phone || "9999999999",
        planId: planId,
        couponCode: appliedCoupon?.id || undefined
      });

      // 2. Redirect user to PayU payment gateway
      redirectToPayU(payuParams);
    } catch (err: any) {
      console.error("Payment initiation error:", err);
      alert("Failed to initiate payment: " + (err.message || "Server error"));
      setProcessing(false);
    }
  };

  const renderPrice = (price: any, planId?: string) => {
    if (price === undefined || price === null) return null;
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (isNaN(numPrice)) return String(price);

    const discounted = getDiscountedPriceRaw(numPrice, planId);
    if (discounted === numPrice) return `₹${numPrice.toLocaleString('en-IN')}`;

    return (
      <span className="inline-flex items-baseline gap-2 flex-wrap">
        <span>₹{discounted.toLocaleString('en-IN')}</span>
        <span className="text-sm text-gray-400 line-through font-normal">₹{numPrice.toLocaleString('en-IN')}</span>
      </span>
    );
  };

  const currentPlan = profile?.plan || "Free";
  const subscriptionStatus = profile?.subscription_status || profile?.status || "active";
  const activePlans = plans.length > 0 ? plans : DEFAULT_PLANS;
  const filteredPlans = activePlans.filter(p => isBusiness ? (p.heading === 'Enterprise' || p.isBusiness) : p.heading !== 'Enterprise');

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading billing & subscription details...</p>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-8" : "p-8 max-w-6xl mx-auto space-y-8 bg-white min-h-full"}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments & Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your plan, view invoices, and upgrade securely via PayU.</p>
      </div>

      {/* Payment Redirect Notification Banner */}
      {paymentNotice && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 ${
          paymentNotice.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {paymentNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-sm font-medium">{paymentNotice.message}</div>
          <button 
            onClick={() => setPaymentNotice(null)}
            className="text-xs font-semibold underline hover:no-underline ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Plan Overview from Firestore */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="bg-[#0f172a] text-white px-6 py-4 rounded-2xl font-bold text-sm inline-flex items-center gap-2">
            Your current plan: <span className="text-blue-400 font-bold">{currentPlan}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {subscriptionStatus === "cancelled" && (
              <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> Cancelled
              </span>
            )}
            {subscriptionStatus === "active" && (
              <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentPlan === "Free" || currentPlan === "None"
              ? "You are currently on the Free tier. Upgrade to Pro for unlimited AI queries and full features."
              : `Your ${currentPlan} subscription provides premium access to AI Legal Advisories.`}
          </p>
          {profile?.subscription_expiry && (
            <p className="text-xs text-gray-400 mt-2">
              Renewal Date: {new Date(profile.subscription_expiry).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Plan Selection Toggles & Coupons */}
      <div className="flex flex-col items-center space-y-6 pt-4">
        {/* Personal vs Business Toggle */}
        <div className="bg-gray-100 p-1 rounded-full flex items-center space-x-1 border border-gray-200">
          <button 
            onClick={() => setIsBusiness(false)} 
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
              !isBusiness ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-900 border border-transparent'
            }`}
          >
            Personal
          </button>
          <button 
            onClick={() => setIsBusiness(true)} 
            className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
              isBusiness ? 'bg-white shadow-sm text-gray-900 border border-gray-200/50' : 'text-gray-500 hover:text-gray-900 border border-transparent'
            }`}
          >
            Business / Firms
          </button>
        </div>

        {/* Monthly vs Yearly Billing Toggle */}
        {!isBusiness && (
          <div className="bg-gray-100 p-1 rounded-lg flex items-center space-x-1 border border-gray-200">
            <button 
              onClick={() => setIsYearly(false)} 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                !isYearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsYearly(true)} 
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1.5 ${
                isYearly ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly 
              <span className="text-[11px] text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-semibold">Save 20%</span>
            </button>
          </div>
        )}

        {/* Firestore Coupon Code Lookup */}
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Enter coupon code (e.g. SAVE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-mono"
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              disabled={validatingCoupon}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {validatingCoupon ? "Validating..." : "Apply"}
            </button>
          </div>

          {couponError && (
            <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {couponError}
            </p>
          )}

          {couponSuccess && (
            <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-green-600" /> {couponSuccess}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 gap-6 sm:gap-8 pt-4 items-stretch ${
        filteredPlans.length === 1 
          ? 'max-w-md mx-auto' 
          : filteredPlans.length === 2 
            ? 'md:grid-cols-2 max-w-4xl mx-auto' 
            : 'lg:grid-cols-3'
      }`}>
        {filteredPlans.map((plan) => {
          const isCurrentPlan = currentPlan === plan.heading || 
            currentPlan === plan.id ||
            (currentPlan === "Free" && plan.isFree) ||
            (currentPlan === "Start Free" && plan.isFree);

          const fullPlanId = isYearly ? `${plan.id}_yearly` : `${plan.id}_monthly`;
          const basePrice = isYearly ? (plan.yearlyPrice || plan.monthlyPrice * 10) : plan.monthlyPrice;

          return (
            <div 
              key={plan.id} 
              className={`w-full border-2 rounded-2xl p-6 sm:p-8 bg-white shadow-sm flex flex-col h-full relative transition-all ${
                plan.badge ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-6">
                  <span className="bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                    {plan.badge}
                  </span>
                </div>
              )}
              
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 h-[70px] leading-snug">
                {plan.badge && <Zap className="w-5 h-5 text-blue-500 fill-blue-500 shrink-0" />}
                <span>{plan.heading}</span>
              </h3>
              
              <p className="text-xs text-gray-500 mt-2 h-[120px] leading-relaxed overflow-hidden">{plan.description}</p>
              
              {plan.isContactSales || plan.heading === 'Enterprise' ? (
                <div className="mt-4 h-[90px] flex items-baseline">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Custom</span>
                </div>
              ) : plan.isFree ? (
                <div className="mt-4 h-[90px] flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">₹0</span>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap">/month</span>
                </div>
              ) : (
                <div className="mt-4 h-[90px] flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-3xl font-extrabold text-gray-900 tracking-tight">
                    {renderPrice(basePrice, fullPlanId)}
                  </span>
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap shrink-0">{isYearly ? '/month (billed yearly)' : '/month'}</span>
                </div>
              )}
              
              <ul className="mt-6 space-y-3 flex-1 border-t border-gray-100 pt-6">
                {plan.features?.map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start text-xs text-gray-600 gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /> 
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              {plan.isContactSales ? (
                <button 
                  onClick={() => window.location.href = "mailto:sales@lexmind.ai"}
                  className="mt-8 w-full py-2.5 rounded-xl text-sm font-semibold transition bg-gray-900 text-white hover:bg-gray-800"
                >
                  Contact Sales
                </button>
              ) : plan.isFree ? (
                <button 
                  disabled={true}
                  className="mt-8 w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-400 cursor-not-allowed"
                >
                  {isCurrentPlan ? "Current Plan" : "Included Free"}
                </button>
              ) : (
                <button 
                  onClick={() => handleSubscribe(fullPlanId, plan.heading, basePrice)}
                  disabled={processing || isCurrentPlan}
                  className={`mt-8 w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                      : "bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-md hover:shadow-lg"
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting to PayU...</span>
                    </>
                  ) : isCurrentPlan ? (
                    "Current Active Plan"
                  ) : (
                    `Upgrade to ${plan.heading}`
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Admin Portal Read Only Access Control View */}
      <div className="mt-8">
        <AdminPortal />
      </div>

      {/* Billing History Section */}
      <div className="mt-12 pt-8 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" /> Payment & Billing History
        </h3>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {history.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction Ref</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {item.invoice_id || item.txnid || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      ₹{item.amount?.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.status === 'paid' || item.status === 'SUCCESS'
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status || 'paid'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500 text-sm">
              No previous payment transactions found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
