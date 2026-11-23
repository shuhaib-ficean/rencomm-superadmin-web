"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Eye, 
  Search, 
  Filter, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Users, 
  UserPlus, 
  X, 
  Mail, 
  Phone, 
  Lock, 
  Briefcase, 
  CreditCard,
  AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";

interface PropertyManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertiesCount: number;
  tenantsCount: number;
  status: "Active" | "Inactive";
  subscriptionPlan: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface PlanOption {
  id: string;
  name: string;
  price: number;
}

export default function PropertyManagersPage() {
  const [managers, setManagers] = useState<PropertyManager[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add Manager Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [availablePlans, setAvailablePlans] = useState<PlanOption[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    department: "Operations",
    planName: "Basic Plan",
    planAmount: 199,
  });

  const fetchManagers = async () => {
    try {
      setIsLoading(true);
      const res = await api.propertyManagers.getAll({
        search: search || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      if (res.success && res.managers) {
        setManagers(res.managers);
      }
    } catch (err) {
      console.error("Failed to fetch property managers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.subscriptions.getAll();
      if (res.success && res.plans && res.plans.length > 0) {
        setAvailablePlans(res.plans);
        setFormData((prev) => ({
          ...prev,
          planName: res.plans[0].name,
          planAmount: res.plans[0].price,
        }));
      } else {
        // Fallback plans
        setAvailablePlans([
          { id: "1", name: "Basic Plan", price: 199 },
          { id: "2", name: "Pro Plan", price: 499 },
          { id: "3", name: "Enterprise Plan", price: 999 },
        ]);
      }
    } catch (err) {
      // Default fallback
      setAvailablePlans([
        { id: "1", name: "Basic Plan", price: 199 },
        { id: "2", name: "Pro Plan", price: 499 },
        { id: "3", name: "Enterprise Plan", price: 999 },
      ]);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchManagers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTogglingId(id);
      const res = await api.propertyManagers.toggleStatus(id);
      if (res.success) {
        setManagers((prev) =>
          prev.map((m) =>
            m.id === id
              ? { ...m, status: res.status }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle manager status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handlePlanChange = (planName: string) => {
    const found = availablePlans.find((p) => p.name === planName);
    setFormData((prev) => ({
      ...prev,
      planName,
      planAmount: found ? found.price : 199,
    }));
  };

  const handleCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("Please fill in all required fields (Name, Email, Password).");
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.propertyManagers.create(formData);
      if (res.success && res.manager) {
        setManagers((prev) => [res.manager, ...prev]);
        setFormSuccess("Property Manager registered successfully!");
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          department: "Operations",
          planName: availablePlans[0]?.name || "Basic Plan",
          planAmount: availablePlans[0]?.price || 199,
        });
        setTimeout(() => {
          setIsAddModalOpen(false);
          setFormSuccess(null);
        }, 1200);
      } else {
        setFormError(res.message || "Failed to register property manager");
      }
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred while registering");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Managers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all registered property admin accounts</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full sm:w-64 bg-white"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Add Property Manager Primary Action Button */}
          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setFormError(null);
              setFormSuccess(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Add Property Manager
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : managers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 text-sm">No property managers found matching your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Manager</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Properties</th>
                  <th className="px-6 py-4 font-semibold">Tenants</th>
                  <th className="px-6 py-4 font-semibold">Subscription</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {managers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{manager.name}</div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(manager.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{manager.email}</div>
                      <div className="text-xs text-gray-400">{manager.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{manager.propertiesCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{manager.tenantsCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {manager.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleToggleStatus(manager.id, e)}
                        disabled={togglingId === manager.id}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          manager.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {togglingId === manager.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : manager.status === "Active" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        {manager.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/property-managers/${manager.id}`}
                        className="inline-flex p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Property Manager Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Register Property Manager</h2>
                  <p className="text-xs text-gray-500">Create an admin account with direct access and subscription</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateManager} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserPlus className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Al-Mansoor"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="manager@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      placeholder="+974 5512 3456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Department
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900 cursor-pointer"
                    >
                      <option value="Operations">Operations</option>
                      <option value="Property Management">Property Management</option>
                      <option value="Leasing & Sales">Leasing & Sales</option>
                      <option value="Maintenance & Facilities">Maintenance & Facilities</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Assign Subscription Tier
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.planName}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white text-gray-900 cursor-pointer"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.name}>
                        {plan.name} (QR {plan.price}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Register Manager
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
