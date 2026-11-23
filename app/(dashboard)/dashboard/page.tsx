"use client";

import { useEffect, useState } from "react";
import { Users, UserSquare, CreditCard, Activity, Loader2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { api } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardData {
  totalCustomers: number;
  totalPropertyManagers: number;
  totalProperties: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  chartLabels: string[];
  chartData: number[];
  recentActivity: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    type: string;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const res = await api.dashboard.getStats();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.message || "Failed to load dashboard data");
        }
      } catch (err: any) {
        setError(err.message || "Failed to connect to backend server");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  const chartConfig = {
    labels: data?.chartLabels || ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    datasets: [
      {
        label: "Subscriptions Growth",
        data: data?.chartData || [10, 15, 20, 28, 35, 42],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "rgb(59, 130, 246)",
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto" />
          <p className="text-sm font-medium text-slate-500">Loading dashboard metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time overview of the Rencomm platform</p>
        </div>
        <Link
          href="/reports"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Activity className="w-4 h-4" />
          Generate Reports
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Customers & Tenants</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {(data?.totalCustomers ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Active across properties</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Property Managers</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {(data?.totalPropertyManagers ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <UserSquare className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <span>Managing {data?.totalProperties ?? 0} properties</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                {(data?.activeSubscriptions ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>SaaS recurring plans</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">
                QR {(data?.monthlyRevenue ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>Platform collected</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Subscription & User Growth</h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
              Last 6 Months
            </span>
          </div>
          <div className="h-72">
            <Line options={chartOptions} data={chartConfig} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Platform Activity</h2>
          <div className="flex-1 overflow-y-auto space-y-4 max-h-[320px] pr-2">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex gap-3.5 pb-3 border-b border-gray-50 last:border-none">
                  <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${
                    activity.type === "manager" ? "bg-blue-600" : "bg-emerald-500"
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{activity.description}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(activity.date).toLocaleDateString()} at{" "}
                      {new Date(activity.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">No recent activity logged</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
