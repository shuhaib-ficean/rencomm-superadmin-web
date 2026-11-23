"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";

export default function CreateSubscriptionPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("QR");
  const [billingPeriod, setBillingPeriod] = useState("Monthly");
  const [properties, setProperties] = useState("");
  const [staff, setStaff] = useState("");
  const [isPopular, setIsPopular] = useState(false);
  const [features, setFeatures] = useState<string[]>([
    "Property & Unit Management",
    "Tenant & Lease Management",
    "Automated Rent Receipts",
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter a plan name.");
      return;
    }

    if (price === "" || isNaN(Number(price))) {
      setError("Please enter a valid monthly price.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.subscriptions.createPlan({
        name: name.trim(),
        price: parseFloat(price),
        currency,
        billingPeriod,
        properties: properties ? parseInt(properties) : 0, // 0 = unlimited
        staff: staff ? parseInt(staff) : 0, // 0 = unlimited
        features: features.map((f) => f.trim()).filter(Boolean),
        isPopular,
      });

      if (res.success) {
        router.push("/subscriptions");
      } else {
        setError(res.message || "Failed to create subscription plan.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while creating the plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/subscriptions"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Subscription Plan</h1>
          <p className="text-sm text-gray-500">Add a new SaaS pricing tier for property managers</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-sm text-red-700 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Starter Plan, Scale Plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price (QR) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                  QR
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="299"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Properties
              </label>
              <input
                type="number"
                min="0"
                value={properties}
                onChange={(e) => setProperties(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="0 for Unlimited"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty or 0 for unlimited properties</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Staff Accounts
              </label>
              <input
                type="number"
                min="0"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                placeholder="0 for Unlimited"
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty or 0 for unlimited staff accounts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <input
              type="checkbox"
              id="isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isPopular" className="text-sm font-medium text-gray-800 cursor-pointer">
              Highlight as "Most Popular" or Recommended Tier
            </label>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">Included Features</label>
              <button
                type="button"
                onClick={addFeature}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Feature
              </button>
            </div>

            <div className="space-y-2.5">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none"
                    placeholder="e.g. 24/7 Priority Support, Automated Invoices"
                  />
                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove feature"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            href="/subscriptions"
            className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-xl transition-colors text-sm"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm disabled:opacity-70 cursor-pointer shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving Plan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Publish Plan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
