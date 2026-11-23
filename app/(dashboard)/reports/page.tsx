"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const exportManagersCSV = async () => {
    try {
      setDownloading("managers");
      const res = await api.propertyManagers.getAll({ limit: 500 });
      if (res.success && res.managers) {
        const headers = ["ID", "Name", "Email", "Phone", "Properties Count", "Tenants Count", "Subscription", "Status", "Joined Date"];
        const rows = res.managers.map((m: any) => [
          m.id,
          `"${m.name || ""}"`,
          `"${m.email || ""}"`,
          `"${m.phone || ""}"`,
          m.propertiesCount || 0,
          m.tenantsCount || 0,
          `"${m.subscriptionPlan || ""}"`,
          m.status || "Active",
          new Date(m.createdAt).toLocaleDateString(),
        ]);
        downloadCSV("rencomm_property_managers.csv", [headers, ...rows]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const exportCustomersCSV = async () => {
    try {
      setDownloading("customers");
      const res = await api.customers.getAll({ limit: 500 });
      if (res.success && res.customers) {
        const headers = ["ID", "Name", "Email", "Phone", "Qatar ID", "Type", "Active Leases", "Status", "Joined Date"];
        const rows = res.customers.map((c: any) => [
          c.id,
          `"${c.name || ""}"`,
          `"${c.email || ""}"`,
          `"${c.phone || ""}"`,
          `"${c.qatarId || ""}"`,
          `"${c.type || ""}"`,
          c.leases || 0,
          c.status || "Active",
          new Date(c.createdAt).toLocaleDateString(),
        ]);
        downloadCSV("rencomm_customers_tenants.csv", [headers, ...rows]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const exportSubscriptionsCSV = async () => {
    try {
      setDownloading("subscriptions");
      const res = await api.subscriptions.getAll();
      if (res.success && res.activeSubscriptions) {
        const headers = ["Subscription ID", "User ID", "Plan Name", "Amount (QR)", "Status", "Activated Date"];
        const rows = res.activeSubscriptions.map((s: any) => [
          s.id,
          s.userId,
          `"${s.planName || ""}"`,
          s.amount || 0,
          s.status || "Active",
          new Date(s.createdAt).toLocaleDateString(),
        ]);
        downloadCSV("rencomm_subscriptions.csv", [headers, ...rows]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const downloadCSV = (filename: string, data: any[][]) => {
    const csvContent = "data:text/csv;charset=utf-8," + data.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reportsList = [
    {
      id: "managers",
      name: "Property Managers Master Registry",
      category: "Operations",
      description: "Complete list of property managers, property counts, tenant counts, and SaaS status.",
      action: exportManagersCSV,
    },
    {
      id: "customers",
      name: "Customers & Active Tenants Report",
      category: "Occupancy",
      description: "Unified export of all registered platform customers and building tenants with Qatar ID.",
      action: exportCustomersCSV,
    },
    {
      id: "subscriptions",
      name: "SaaS Subscriptions & Revenue Audit",
      category: "Financial",
      description: "Active subscription packages, manager assignments, and recurring payments.",
      action: exportSubscriptionsCSV,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Export live platform datasets for audits and compliance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Financial & Subscriptions</h3>
            <p className="text-blue-100 text-sm mb-4">Export active plans, fees, and manager subscription tiers.</p>
          </div>
          <button
            onClick={exportSubscriptionsCSV}
            disabled={downloading === "subscriptions"}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloading === "subscriptions" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Subscriptions CSV
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Property Managers Audit</h3>
            <p className="text-indigo-100 text-sm mb-4">Export full manager accounts, contacts, and portfolios.</p>
          </div>
          <button
            onClick={exportManagersCSV}
            disabled={downloading === "managers"}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloading === "managers" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Managers CSV
          </button>
        </div>
        
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Customers & Tenants Directory</h3>
            <p className="text-purple-100 text-sm mb-4">Download all verified users, Qatar IDs, and lease histories.</p>
          </div>
          <button
            onClick={exportCustomersCSV}
            disabled={downloading === "customers"}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {downloading === "customers" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export Customers CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Standard Export Templates</h2>
          <p className="text-xs text-gray-500 mt-0.5">Click download on any report to generate real-time data</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="px-6 py-4 font-semibold">Report Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {reportsList.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      {report.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {report.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-md">{report.description}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={report.action}
                      disabled={downloading === report.id}
                      className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg inline-flex items-center justify-center transition-colors cursor-pointer"
                      title="Download CSV"
                    >
                      {downloading === report.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
