"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Search, Loader2, UserCheck, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface CustomerItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  qatarId: string;
  leases: number;
  type: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await api.customers.getAll({ search: search || undefined });
      if (res.success && res.customers) {
        setCustomers(res.customers);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setTogglingId(id);
      const res = await api.customers.toggleStatus(id);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status: res.status }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle customer status:", err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers & Tenants</h1>
          <p className="text-sm text-gray-500 mt-1">Platform customer accounts and active property tenants</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search customers or QID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No customers or tenants found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Customer / Tenant</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Qatar ID</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Active Leases</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{customer.name}</div>
                      <div className="text-xs text-gray-400">
                        Joined {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-800">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                      {customer.qatarId}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          customer.type === "Active Tenant"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {customer.type === "Active Tenant" ? (
                          <UserCheck className="w-3 h-3" />
                        ) : (
                          <ShieldCheck className="w-3 h-3" />
                        )}
                        {customer.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                        {customer.leases}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleToggleStatus(customer.id, e)}
                        disabled={togglingId === customer.id}
                        title={`Click to ${customer.status === "Active" ? "suspend" : "activate"} account`}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                          customer.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {togglingId === customer.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : customer.status === "Active" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        {customer.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/customers/${customer.id}`}
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
    </div>
  );
}
