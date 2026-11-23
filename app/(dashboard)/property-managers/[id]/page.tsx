"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, UserCircle2, Mail, Phone, Calendar, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface PropertyItem {
  id: string;
  name: string;
  type: string;
  location: string;
  units: number;
  status: string;
}

interface ManagerDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  subscription: {
    planName: string;
    amount: number;
    status: string;
    startDate: string;
    endDate: string;
  };
  properties: PropertyItem[];
}

export default function PropertyManagerDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const [manager, setManager] = useState<ManagerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchManager = async () => {
      try {
        setIsLoading(true);
        const res = await api.propertyManagers.getById(id);
        if (res.success && res.manager) {
          setManager(res.manager);
        } else {
          setError(res.message || "Property manager not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load manager details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchManager();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!manager) return;
    try {
      setIsToggling(true);
      const res = await api.propertyManagers.toggleStatus(manager.id);
      if (res.success) {
        setManager((prev) => (prev ? { ...prev, status: res.status } : null));
      }
    } catch (err) {
      console.error(err);
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

  if (error || !manager) {
    return (
      <div className="space-y-4">
        <Link href="/property-managers" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Managers
        </Link>
        <div className="p-8 bg-red-50 text-red-700 rounded-xl border border-red-200">
          {error || "Property manager not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/property-managers" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{manager.name}</h1>
            <p className="text-sm text-gray-500">Property Manager Profile</p>
          </div>
        </div>

        <button
          onClick={handleToggleStatus}
          disabled={isToggling}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            manager.status === "Active"
              ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
              : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
          }`}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : manager.status === "Active" ? (
            <XCircle className="w-4 h-4" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          {manager.status === "Active" ? "Suspend Account" : "Activate Account"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCircle2 className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{manager.name}</h2>
            <span
              className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                manager.status === "Active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              {manager.status}
            </span>

            <div className="mt-6 space-y-3.5 text-left border-t border-gray-100 pt-5">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm break-all">{manager.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm">{manager.phone || "No phone provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-sm">
                  Joined {new Date(manager.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Subscription Details</h3>
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-blue-900">{manager.subscription.planName}</span>
                <span className="text-blue-700 font-bold text-sm">
                  {manager.subscription.amount > 0 ? `QR ${manager.subscription.amount}/mo` : "Free"}
                </span>
              </div>
              <p className="text-xs text-blue-600 mt-1">Status: {manager.subscription.status}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Managed Properties */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Managed Properties</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Total {manager.properties.length} properties created by this manager
                </p>
              </div>
            </div>

            {manager.properties.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">
                No properties registered by this manager yet.
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {manager.properties.map((property) => (
                  <div
                    key={property.id}
                    className="p-5 flex items-center justify-between hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{property.name}</h4>
                        <p className="text-xs text-gray-500 capitalize">{property.type} • {property.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 text-sm">{property.units} Units</p>
                      <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {property.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
