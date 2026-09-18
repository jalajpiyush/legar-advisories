import React, { useState, useEffect } from "react";
import { CreditCard, History, Zap, CheckCircle2, AlertCircle, Tag, Check, Shield, ArrowLeft } from "lucide-react";
import { auth, db } from "../lib/auth";
import { doc, collection, onSnapshot, getDoc } from "firebase/firestore";
import { createPayUOrder, redirectToPayU } from "../services/payuService";
import { AdminPortal } from "../components/AdminPortal";

const DEFAULT_PLANS = [
  {
    id: "plan_free",
    heading: "Start Free",
    description: "Explore AI-powered legal assistance with limited daily usage. Perfect for students and first-time users.",
    monthlyPrice: 0,
    yearlyPrice: 0,
    isFree: true,
    featuresTitle: "",
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
    heading: "For Individuals",
    description: "Everything you need for personal legal guidance and document analysis.",
    monthlyPrice: 499,
    yearlyPrice: 4790,
    featuresTitle: "",
    features: [
      "500 AI chats/month",
      "100 document uploads",
      "Contract analysis",
      "Legal notice review",
      "Clause explanation",
      "Export PDF",
      "Priority support"
    ]
  },
  {
    id: "plan_lawyer",
    heading: "For Lawyers & Professionals",
    description: "Built for advocates, consultants, startups, and professionals who need advanced legal AI.",
    monthlyPrice: 1999,
    yearlyPrice: 19190,
    featuresTitle: "",
    features: [
      "Unlimited AI chats",
      "Unlimited document analysis",
      "OCR for scanned PDFs",
      "AI contract drafting",
      "Case law research"
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
  const [paymentFlowState, setPaymentFlowState] = useState<'verifying' | 'welcome' | null>(null);

  useEffect(() => {
    // 1. Inspect URL parameters for payment redirects
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    if (status === 'success') {
      setPaymentFlowState('verifying');
      setTimeout(() => {
        setPaymentFlowState('welcome');
        setTimeout(() => {
          setPaymentFlowState(null);
        }, 3000);
      }, 2500);
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
            if (data.history) {
              setHistory(data.history);
            }
          }
        } catch (err) {
          console.error("Error fetching user history:", err);
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
        <span className="text-sm text-gray-400 dark:text-neutral-500 line-through font-normal">₹{numPrice.toLocaleString('en-IN')}</span>
      </span>
    );
  };

  const currentPlan = profile?.plan || "Free";
  const subscriptionStatus = profile?.subscription_status || profile?.status || "active";
  const activePlans = plans.length > 0 ? plans : DEFAULT_PLANS;
  const filteredPlans = activePlans
    .filter(p => isBusiness ? (p.heading === 'Enterprise' || p.isBusiness) : p.heading !== 'Enterprise')
    .sort((a, b) => {
      if (a.isFree || a.monthlyPrice === 0) return -1;
      if (b.isFree || b.monthlyPrice === 0) return 1;
      return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
    });

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-neutral-400 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading billing & subscription details...</p>
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-8" : "bg-[#FAFAFA] dark:bg-neutral-950 min-h-full flex flex-col font-sans"}>
      {!embedded && (
        <div className="flex items-center px-6 py-4 border-b border-[#E5E5E5] dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-950">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: 'options' }))} 
            className="flex items-center gap-2 text-[15px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            Upgrade
          </button>
        </div>
      )}
      
      <div className={embedded ? "" : "px-4 sm:px-6 py-4 sm:py-6 max-w-[1100px] mx-auto w-full flex-1"}>

      {/* Payment Redirect Notification Banner */}
      {paymentNotice && (
        <div className={`mb-8 p-4 rounded-xl border flex items-start gap-3 max-w-2xl mx-auto bg-white ${
          paymentNotice.type === 'success' ? 'border-green-200 text-green-800' : 'border-red-200 text-red-800'
        }`}>
          {paymentNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-[14px] font-medium">{paymentNotice.message}</div>
          <button 
            onClick={() => setPaymentNotice(null)}
            className="text-[13px] font-semibold underline hover:no-underline ml-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Current Plan Overview (Simplified) */}
      {!embedded && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-800 rounded-full px-5 py-2 shadow-sm">
            <span className="text-[14px] text-gray-600 dark:text-gray-400">Your current plan:</span>
            <span className="text-[14px] font-semibold text-black dark:text-white">{currentPlan}</span>
            {subscriptionStatus === "active" && (
              <span className="bg-[#E8F5E9] dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[12px] px-2 py-0.5 rounded-full font-medium">
                Active
              </span>
            )}
            {subscriptionStatus === "cancelled" && (
              <span className="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[12px] px-2 py-0.5 rounded-full font-medium">
                Cancelled
              </span>
            )}
          </div>
        </div>
      )}

      {/* Plan Selection Toggles & Coupons */}
      <div className="flex flex-col items-center pt-2 pb-8">
        <h2 className="text-[28px] sm:text-[36px] font-medium tracking-tight text-gray-900 dark:text-gray-100 mb-4 text-center font-serif">
          Plans that grow with you
        </h2>
        
        {/* Claude style top toggle */}
        <div className="bg-[#F3F4F6] dark:bg-neutral-800 p-1 rounded-[12px] flex items-center mb-6 border border-gray-200 dark:border-neutral-700/50">
          <button 
            onClick={() => setIsBusiness(false)} 
            className={`px-6 py-2.5 text-[15px] font-medium rounded-[8px] transition-all ${
              !isBusiness ? 'bg-white dark:bg-neutral-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            Individual
          </button>
          <button 
            onClick={() => setIsBusiness(true)} 
            className={`px-6 py-2.5 text-[15px] font-medium rounded-[8px] transition-all ${
              isBusiness ? 'bg-white dark:bg-neutral-900 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:text-white'
            }`}
          >
            Team and Enterprise
          </button>
        </div>

        {/* Firestore Coupon Code Lookup */}
        <div className="w-full max-w-md mb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 text-gray-400 dark:text-neutral-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Enter coupon code (e.g. SAVE20)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-4 py-3 border border-[#E5E5E5] dark:border-neutral-700 rounded-xl text-[14px] focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white uppercase font-mono bg-white dark:bg-neutral-900"
              />
            </div>
            <button 
              onClick={handleApplyCoupon}
              disabled={validatingCoupon}
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-[14px] font-medium hover:bg-[#1a1a1a] dark:hover:bg-gray-200 transition disabled:opacity-50"
            >
              {validatingCoupon ? "..." : "Apply"}
            </button>
          </div>

          {couponError && (
            <p className="text-[13px] text-red-600 font-medium mt-2 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {couponError}
            </p>
          )}

          {couponSuccess && (
            <p className="text-[13px] text-green-600 font-medium mt-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-600" /> {couponSuccess}
            </p>
          )}
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className={`grid grid-cols-1 gap-5 sm:gap-6 items-stretch ${
        filteredPlans.length === 1 
          ? 'max-w-md mx-auto' 
          : filteredPlans.length === 2 
            ? 'md:grid-cols-2 max-w-5xl mx-auto' 
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
              className={`w-full rounded-[24px] p-6 sm:p-7 bg-white dark:bg-neutral-900 flex flex-col h-full relative transition-all border shadow-sm dark:shadow-none ${
                plan.heading === 'For Individuals' ? 'border-gray-300 dark:border-neutral-600 shadow-md' : 'border-[#E5E5E5] dark:border-neutral-800'
              }`}
            >
              
              <div className="flex flex-col xl:flex-row items-start justify-between min-h-[44px] gap-2">
                <h3 className="text-[24px] sm:text-[28px] font-semibold text-black dark:text-white tracking-tight leading-[1.1]">
                  {plan.heading}
                </h3>
                {plan.heading === 'For Individuals' && (
                  <div className="bg-[#F3F4F6] dark:bg-neutral-800 p-0.5 rounded-full flex items-center shrink-0">
                    <button 
                      onClick={() => setIsYearly(false)} 
                      className={`px-3 py-1 text-[12px] font-medium rounded-full transition-colors ${!isYearly ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Monthly
                    </button>
                    <button 
                      onClick={() => setIsYearly(true)} 
                      className={`px-3 py-1 text-[12px] font-medium rounded-full transition-colors flex items-center gap-1 ${isYearly ? 'bg-white dark:bg-neutral-700 shadow-sm text-black dark:text-white' : 'text-gray-500 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white'}`}
                    >
                      Yearly <span className="text-blue-600 dark:text-blue-400">· Save 20%</span>
                    </button>
                  </div>
                )}
              </div>
              
              <p className="text-[14px] sm:text-[14.5px] text-[#666666] dark:text-neutral-400 mt-2 leading-snug">{plan.description}</p>
              
              <div className="mt-5 flex flex-col justify-center">
                {plan.isContactSales || plan.heading === 'Enterprise' ? (
                  <span className="text-[32px] sm:text-[36px] font-semibold text-black dark:text-white tracking-tight leading-none">Custom</span>
                ) : plan.isFree ? (
                  <span className="text-[32px] sm:text-[36px] font-semibold text-black dark:text-white tracking-tight leading-none">₹0</span>
                ) : (
                  <div className="flex items-baseline gap-2">
                    {plan.heading === 'For Lawyers & Professionals' && <span className="text-[14px] text-[#666666] dark:text-neutral-400 font-medium">From</span>}
                    <span className="text-[32px] sm:text-[36px] font-semibold text-black dark:text-white tracking-tight leading-none">
                      {renderPrice(basePrice, fullPlanId)}
                    </span>
                  </div>
                )}
                {!plan.isFree && !plan.isContactSales && (
                  <p className="text-[12.5px] text-[#666666] dark:text-neutral-400 mt-1.5">
                    {isYearly ? `INR / year · billed annually (includes GST)` : 'INR / month · billed monthly (includes GST)'}
                  </p>
                )}
              </div>
              
              {plan.isContactSales ? (
                <button 
                  onClick={() => window.location.href = "mailto:sales@lexmind.ai"}
                  className="mt-6 w-full py-[10px] rounded-[10px] text-[14px] font-medium transition-colors bg-black dark:bg-white text-white dark:text-black hover:bg-[#1a1a1a] dark:hover:bg-gray-200"
                >
                  Contact Sales
                </button>
              ) : plan.isFree ? (
                <button 
                  disabled={true}
                  className="mt-6 w-full py-[10px] rounded-[10px] text-[14px] font-medium transition-colors border border-[#E5E5E5] dark:border-neutral-700 bg-white dark:bg-neutral-800 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-neutral-700 cursor-not-allowed"
                >
                  {isCurrentPlan ? "Current Plan" : "Use for free"}
                </button>
              ) : (
                <div className="mt-6 w-full flex flex-col items-center">
                  <button 
                    onClick={() => handleSubscribe(fullPlanId, plan.heading, basePrice)}
                    disabled={processing || isCurrentPlan}
                    className={`w-full py-[10px] px-5 rounded-[10px] text-[14px] font-medium transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan 
                        ? "bg-gray-50 dark:bg-neutral-800 text-gray-400 dark:text-neutral-500 cursor-not-allowed border border-[#E5E5E5] dark:border-neutral-700" 
                        : "bg-black dark:bg-white text-white dark:text-black hover:bg-[#1a1a1a] dark:hover:bg-gray-200"
                    }`}
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Connecting...</span>
                      </>
                    ) : isCurrentPlan ? (
                      "Current Active Plan"
                    ) : (
                      `Get ${plan.heading} plan`
                    )}
                  </button>
                  {plan.heading === 'For Lawyers & Professionals' && (
                    <p className="text-[12.5px] text-[#666666] dark:text-neutral-400 mt-2">No commitment · Cancel anytime</p>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-[#E5E5E5] dark:border-neutral-800 flex-1">
                {plan.featuresTitle && (
                  <h4 className="text-[13.5px] font-medium text-black dark:text-white mb-3">
                    {plan.featuresTitle}
                  </h4>
                )}
                <ul className="space-y-2.5">
                  {plan.features?.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start text-[13.5px] sm:text-[14px] text-[#333333] dark:text-neutral-300 gap-2.5">
                      <Check className="w-[16px] h-[16px] text-[#666666] dark:text-neutral-400 shrink-0 stroke-[1.5] mt-0.5" /> 
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Portal Read Only Access Control View */}
      <div className="mt-8">
        <AdminPortal />
      </div>

      {/* Billing History Section */}
      <div className="mt-12 pt-8 border-t border-gray-100 dark:border-neutral-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500 dark:text-neutral-400" /> Payment & Billing History
        </h3>
        <div className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
          {history.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-neutral-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Transaction Ref</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200">
                {history.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:bg-neutral-900/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100 font-medium">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400 font-mono">
                      {item.invoice_id || item.txnid || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-neutral-100 font-semibold">
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
            <div className="p-8 text-center text-gray-500 dark:text-neutral-400 text-sm">
              No previous payment transactions found.
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
