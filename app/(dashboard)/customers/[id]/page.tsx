"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, User, Phone, Mail, FileText, Home, Users, Loader2, ExternalLink, CheckCircle2, Ban } from "lucide-react";
import { api, API_BASE } from "@/lib/api";

interface FamilyMember {
  name: string;
  relation: string;
}

interface LeaseItem {
  id: string;
  property: string;
  period: string;
  rent: string;
  status: string;
}

interface DocItem {
  name: string;
  url: string;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  qatarId: string;
  status: "Active" | "Inactive";
  type: string;
  familyMembers: FamilyMember[];
  documents: DocItem[];
  leases: LeaseItem[];
}

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchCustomer = async () => {
      try {
        setIsLoading(true);
        const res = await api.customers.getById(id);
        if (res.success && res.customer) {
          setCustomer(res.customer);
        } else {
          setError(res.message || "Customer not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load customer profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomer();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!customer) return;
    try {
      setIsToggling(true);
      const res = await api.customers.toggleStatus(customer.id);
      if (res.success) {
        setCustomer((prev) => (prev ? { ...prev, status: res.status } : null));
      }
    } catch (err) {
      console.error("Failed to toggle customer status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Link href="/customers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Link>
        <div className="p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || "Customer profile could not be retrieved."}
        </div>
      </div>
    );
  }

  const getDocUrl = (url: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/customers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-sm text-gray-500">
              {customer.type} • ID: {customer.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50 ${
            customer.status === "Active"
              ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
              : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20"
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : customer.status === "Active" ? (
            <Ban className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {customer.status === "Active" ? "Suspend Account" : "Activate Account"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{customer.name}</h2>
            <div className="flex justify-center mt-2">
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                  customer.status === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {customer.status}
              </span>
            </div>

            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className={`mt-4 w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                customer.status === "Active"
                  ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              }`}
            >
              {isToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : customer.status === "Active" ? (
                <Ban className="w-3.5 h-3.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5" />
              )}
              {customer.status === "Active" ? "Suspend Customer Account" : "Activate Customer Account"}
            </button>

            <div className="mt-6 space-y-4 text-left border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 text-gray-700 border-b border-gray-50 pb-3">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-medium break-all">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 border-b border-gray-50 pb-3">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm font-medium">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="text-sm">
                  <span className="text-gray-400 block text-xs">Qatar ID (QID)</span>
                  <span className="font-semibold text-gray-900">{customer.qatarId}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-semibold text-gray-900">Registered Family Members</h3>
            </div>
            {customer.familyMembers.length === 0 ? (
              <p className="text-xs text-gray-400">No family members registered</p>
            ) : (
              <div className="space-y-2.5">
                {customer.familyMembers.map((member, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900 text-sm">{member.name}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded font-medium">
                      {member.relation}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Active Leases */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Leases & Occupancy</h3>
            </div>
            {customer.leases.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400 border border-dashed rounded-lg">
                No active leases recorded for this account.
              </div>
            ) : (
              <div className="space-y-3.5">
                {customer.leases.map((lease) => (
                  <div key={lease.id} className="border border-blue-100 rounded-xl p-4 bg-blue-50/40">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Lease ID #{lease.id.slice(0, 8)}
                        </span>
                        <h4 className="font-bold text-gray-900 mt-1">{lease.property}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900 block">{lease.rent}</span>
                        <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 capitalize">
                          {lease.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Lease Period: {lease.period}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Uploaded Documents & Verification</h3>
            </div>
            {customer.documents.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400 border border-dashed rounded-lg">
                No documents uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {customer.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={getDocUrl(doc.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-blue-600 font-medium">Click to view document</p>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
