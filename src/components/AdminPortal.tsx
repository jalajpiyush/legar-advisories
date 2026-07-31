import React, { useState, useEffect } from "react";
import { Shield, Activity, DollarSign, Users, AlertCircle, RefreshCw, Lock } from "lucide-react";
import { auth, db } from "../lib/auth";
import { doc, onSnapshot } from "firebase/firestore";

export function AdminPortal() {
  const [loading, setLoading] = useState(true);
  const [planStatus, setPlanStatus] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("User not authenticated.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch("/api/user/plan-status", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlanStatus(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || "Failed to fetch plan status");
      }
    } catch (err: any) {
      console.error("Admin portal fetch error:", err);
      setError(err.message || "Failed to load admin stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen to real-time analytics dashboard if available
    const unsub = onSnapshot(doc(db, "analytics", "dashboard"), (snap) => {
      if (snap.exists()) {
        setAnalytics(snap.data());
      }
    }, (err) => {
      console.warn("Analytics snap warning:", err?.message);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex items-center justify-center space-x-3 text-gray-500">
        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Loading Admin Portal metrics...</span>
      </div>
    );
  }

  const plan = planStatus?.plan || "free";
  const subStatus = planStatus?.subscriptionStatus || "active";
  const expiry = planStatus?.subscriptionExpiry
    ? new Date(planStatus.subscriptionExpiry).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })
    : "N/A";

  const chatUsedToday = planStatus?.usage?.chatUsedToday || 0;
  const chatUsedMonth = planStatus?.usage?.chatUsedMonth || 0;
  const docUsedToday = planStatus?.usage?.documentUsedToday || 0;
  const docUsedMonth = planStatus?.usage?.documentUsedMonth || 0;

  const chatLimit = planStatus?.limits?.chatLimit;
  const docLimit = planStatus?.limits?.docLimit;

  return (
    <div className="bg-white text-slate-900 rounded-2xl p-6 shadow-xl border border-slate-200 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Current Plan */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Current Plan</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xl font-black text-slate-900 uppercase tracking-wide">{plan}</span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              subStatus === 'active' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-rose-100 text-rose-700 border-rose-200'
            }`}>
              {subStatus}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5">Expiry: <span className="text-slate-900 font-medium">{expiry}</span></p>
        </div>

        {/* Subscription Status */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Subscription Status</p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${subStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-lg font-bold text-slate-900 capitalize">{subStatus}</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2 border-t border-slate-100 pt-1.5">SSOT Validation Active</p>
        </div>

        {/* Usage Stats (Chats & Docs) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Usage Counters</p>
          <div className="mt-2 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Chats:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] whitespace-nowrap">
                {plan === 'free' ? `${chatUsedToday} / 20 day` : plan === 'individual' ? `${chatUsedMonth} / 500 mo` : 'Unlimited'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500 font-medium">Docs:</span>
              <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px] whitespace-nowrap">
                {plan === 'free' ? `${docUsedToday} / 3 day` : plan === 'individual' ? `${docUsedMonth} / 100 mo` : 'Unlimited'}
              </span>
            </div>
          </div>
        </div>


      </div>



    </div>
  );
}
