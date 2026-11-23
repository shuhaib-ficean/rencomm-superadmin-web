"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  Building2, 
  Users, 
  Save, 
  X,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface PlanItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  billingPeriod: string;
  properties: number;
  staff: number;
  features: string[];
  status: "Active" | "Inactive";
  isPopular: boolean;
  createdAt: string;
}

interface ActiveSubItem {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  managerName?: string;
  managerEmail?: string;
  managerPhone?: string;
}

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<ActiveSubItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [togglingPlanId, setTogglingPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  // Edit Plan Modal State
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const res = await api.subscriptions.getAll();
      if (res.success) {
        if (res.plans) setPlans(res.plans);
        if (res.activeSubscriptions) setActiveSubscriptions(res.activeSubscriptions);
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      setTogglingPlanId(id);
      const res = await api.subscriptions.togglePlanStatus(id);
      if (res.success && res.plan) {
        setPlans((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: res.plan.status } : p))
        );
      }
    } catch (err) {
      console.error("Failed to toggle plan status:", err);
    } finally {
      setTogglingPlanId(null);
    }
  };

  const handleDeletePlan = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the plan "${name}"?`)) return;

    try {
      setDeletingPlanId(id);
      const res = await api.subscriptions.deletePlan(id);
      if (res.success) {
        setPlans((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete plan:", err);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setEditError(null);

    try {
      setIsSavingEdit(true);
      const res = await api.subscriptions.updatePlan(editingPlan.id, {
        name: editingPlan.name,
        price: parseFloat(String(editingPlan.price)),
        properties: parseInt(String(editingPlan.properties)) || 0,
        staff: parseInt(String(editingPlan.staff)) || 0,
        features: editingPlan.features.filter(Boolean),
        isPopular: editingPlan.isPopular,
      });

      if (res.success && res.plan) {
        setPlans((prev) =>
          prev.map((p) => (p.id === editingPlan.id ? res.plan : p))
        );
        setEditingPlan(null);
      } else {
        setEditError(res.message || "Failed to update plan");
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update plan");
    } finally {
      setIsSavingEdit(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Subscriptions & Plans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure SaaS pricing tiers, manage features, and monitor manager subscriptions
          </p>
        </div>

        <Link
          href="/subscriptions/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Plan
        </Link>
      </div>

      {/* SaaS Pricing Tiers Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            SaaS Subscription Tiers ({plans.length})
          </h2>
        </div>

        {plans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-400">
            No subscription plans created yet. Click "Create New Plan" to add one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md relative ${
                  plan.isPopular ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Popular Tier
                  </span>
                )}

                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                    <button
                      onClick={() => handleToggleStatus(plan.id)}
                      disabled={togglingPlanId === plan.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                        plan.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {togglingPlanId === plan.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : plan.status === "Active" ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-500" />
                      )}
                      {plan.status}
                    </button>
                  </div>

                  <div className="mt-3 mb-6">
                    <span className="text-3xl font-extrabold text-gray-900">
                      QR {plan.price.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 ml-1.5 font-medium">/ month</span>
                  </div>

                  {/* Quotas */}
                  <div className="grid grid-cols-2 gap-2 mb-6 p-3 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="font-semibold">
                        {plan.properties > 0 ? `${plan.properties} Properties` : "Unlimited"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Users className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span className="font-semibold">
                        {plan.staff > 0 ? `${plan.staff} Staff Accounts` : "Unlimited"}
                      </span>
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Features</p>
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">All standard platform modules included.</p>
                    )}
                  </div>
                </div>

                {/* Plan Card Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setEditingPlan(plan)}
                    className="flex-1 py-2 px-3 border border-gray-200 hover:bg-gray-50 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-500" />
                    Edit Plan
                  </button>

                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                    disabled={deletingPlanId === plan.id}
                    className="p-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Plan"
                  >
                    {deletingPlanId === plan.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real Active Manager Subscriptions from DB */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          Active Property Manager Subscriptions ({activeSubscriptions.length})
        </h2>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {activeSubscriptions.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-400">
              No active manager subscriptions recorded in the system yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Property Manager</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Plan Name</th>
                    <th className="px-6 py-4 font-semibold">Monthly Amount</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Activation Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {activeSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{sub.managerName || "Admin User"}</div>
                        <div className="font-mono text-[11px] text-gray-400">ID: #{sub.id.slice(0, 8)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-800 text-xs">{sub.managerEmail}</div>
                        <div className="text-gray-400 text-xs">{sub.managerPhone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          {sub.planName}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-emerald-600 font-bold">
                        QR {sub.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-gray-900 text-base">Edit Subscription Plan</h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Monthly Price (QR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Properties</label>
                  <input
                    type="number"
                    min="0"
                    value={editingPlan.properties}
                    onChange={(e) => setEditingPlan({ ...editingPlan, properties: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0 for Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Staff Accounts</label>
                <input
                  type="number"
                  min="0"
                  value={editingPlan.staff}
                  onChange={(e) => setEditingPlan({ ...editingPlan, staff: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0 for Unlimited"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="editIsPopular"
                  checked={editingPlan.isPopular}
                  onChange={(e) => setEditingPlan({ ...editingPlan, isPopular: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                />
                <label htmlFor="editIsPopular" className="text-xs font-medium text-gray-700 cursor-pointer">
                  Highlight as Popular Tier
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 flex items-center gap-1.5 disabled:opacity-70 cursor-pointer shadow-sm"
                >
                  {isSavingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
