"use client";

import { useEffect, useState } from "react";
import { LineChart, Users, Activity, TrendingUp, Building2, Loader2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { api } from "@/lib/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AnalyticsData {
  totalManagers: number;
  totalCustomers: number;
  totalProperties: number;
  revenue: {
    labels: string[];
    data: number[];
  };
  userGrowth: {
    labels: string[];
    customers: number[];
    managers: number[];
  };
  subscriptionsBreakdown: {
    labels: string[];
    data: number[];
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const res = await api.analytics.getOverview();
        if (res.success && res.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "#f3f4f6" } },
      x: { grid: { display: false } },
    },
  };

  const revenueData = {
    labels: analytics?.revenue.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
    datasets: [
      {
        fill: true,
        label: "Revenue (QR)",
        data: analytics?.revenue.data || [32000, 38000, 45000, 42000, 51000, 60000, 68000, 75000],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const } },
  };

  const userGrowthData = {
    labels: analytics?.userGrowth.labels || ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Customers & Tenants",
        data: analytics?.userGrowth.customers || [12, 15, 18, 22],
        backgroundColor: "rgba(99, 102, 241, 0.8)",
      },
      {
        label: "Property Managers",
        data: analytics?.userGrowth.managers || [8, 10, 11, 13],
        backgroundColor: "rgba(20, 184, 166, 0.8)",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "right" as const } },
    cutout: "70%",
  };

  const subscriptionData = {
    labels: analytics?.subscriptionsBreakdown.labels || ["Basic", "Pro", "Enterprise"],
    datasets: [
      {
        data: analytics?.subscriptionsBreakdown.data || [50, 30, 20],
        backgroundColor: [
          "rgba(148, 163, 184, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-160px)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Platform performance and growth metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Property Managers</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{analytics?.totalManagers ?? 0}</h3>
            </div>
            <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active administrators</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Customers & Tenants</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{analytics?.totalCustomers ?? 0}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Across all buildings</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Properties</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{analytics?.totalProperties ?? 0}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-gray-500 font-medium">
            <span>Residential & Commercial</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Platform Health</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2">99.9%</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-emerald-600 font-medium">
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Growth (QR)</h2>
          <div className="h-80">
            <Line options={lineOptions} data={revenueData} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription Tiers Breakdown</h2>
          <div className="h-64 relative">
            <Doughnut options={doughnutOptions} data={subscriptionData} />
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">User Acquisition Trends</h2>
          <div className="h-80">
            <Bar options={barOptions} data={userGrowthData} />
          </div>
        </div>
      </div>
    </div>
  );
}
