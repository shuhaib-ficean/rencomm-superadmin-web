"use client";

import { useEffect, useState } from "react";
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wrench, 
  Trash2, 
  Check, 
  CheckCheck, 
  Filter, 
  Loader2, 
  ShieldAlert 
} from "lucide-react";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function formatTimeAgo(dateString: string) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateString;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filterType, setFilterType] = useState<"all" | "unread">("all");
  const [scope, setScope] = useState<"my" | "system">("system"); // system = all platform events, my = superadmin only
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.notifications.getAll({
        all: scope === "system",
        unreadOnly: filterType === "unread",
        limit: 100,
      });

      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        setTotalCount(res.total ?? res.notifications.length);
        if (typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType, scope]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.notifications.markAsRead(id);
      if (res.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setIsProcessing(true);
      const res = await api.notifications.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.notifications.delete(id);
      if (res.success) {
        setNotifications((prev) => {
          const item = prev.find((n) => n.id === id);
          if (item && !item.isRead) {
            setUnreadCount((c) => Math.max(0, c - 1));
          }
          return prev.filter((n) => n.id !== id);
        });
        setTotalCount((c) => Math.max(0, c - 1));
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    try {
      setIsProcessing(true);
      const res = await api.notifications.clearAll();
      if (res.success) {
        setNotifications([]);
        setUnreadCount(0);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "alert":
      case "overpayment":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "success":
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case "repair":
      case "maintenance":
        return <Wrench className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "alert":
      case "overpayment":
        return "bg-red-50";
      case "success":
        return "bg-emerald-50";
      case "repair":
      case "maintenance":
        return "bg-amber-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-blue-600" />
            Notifications Center
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            System activity, overpayment detections, repair tickets, and platform alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isProcessing}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              <CheckCheck className="w-4 h-4 text-blue-600" />
              Mark all as read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              disabled={isProcessing}
              className="bg-white border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Scope & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setScope("system")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                scope === "system"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All System Events
            </button>
            <button
              onClick={() => setScope("my")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                scope === "my"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Direct Alerts
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilterType("unread")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filterType === "unread"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-sm font-medium">Fetching notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500 mt-1">
              {filterType === "unread"
                ? "You have no unread notifications."
                : "No notifications found for this view."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={(e) => !item.isRead && handleMarkAsRead(item.id, e)}
                className={`p-5 flex items-start gap-4 transition-colors hover:bg-slate-50/80 cursor-pointer group ${
                  !item.isRead ? "bg-blue-50/20" : ""
                }`}
              >
                {/* Type Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${getBgColor(
                    item.type
                  )}`}
                >
                  {getIcon(item.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm ${
                          !item.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-800"
                        }`}
                      >
                        {item.title}
                      </h3>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTimeAgo(item.createdAt)} • {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed pr-6">
                    {item.message}
                  </p>
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {!item.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
