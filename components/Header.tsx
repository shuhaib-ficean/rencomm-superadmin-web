"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { 
  Bell, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Wrench, 
  Check, 
  ExternalLink,
  Loader2,
  Building,
  Users,
  User,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface SearchResults {
  managers: Array<{ id: string; name: string; email: string; phone?: string; type?: string }>;
  customers: Array<{ id: string; name: string; email?: string; phone?: string; qatarId?: string; type?: string }>;
  properties: Array<{ id: string; name: string; type?: string; location?: string; address?: string; createdById?: string }>;
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

export function Header() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Omnibox Global Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || "Admin User";
  const userRole = user?.role === "admin" ? "Super Admin" : (user?.role || "Administrator");
  const initial = userName.charAt(0).toUpperCase();

  // Debounced search effect
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(searchQuery.trim());
        if (res.success && res.results) {
          setSearchResults(res.results);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error("Global search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search popover or escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchNotificationStats = async () => {
    try {
      const res = await api.notifications.getUnreadCount();
      if (res.success && typeof res.unreadCount === "number") {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const fetchDropdownNotifications = async () => {
    try {
      setIsLoading(true);
      const res = await api.notifications.getAll({ limit: 6, all: true });
      if (res.success && res.notifications) {
        setNotifications(res.notifications);
        if (typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        }
      }
    } catch (err) {
      console.error("Failed to fetch dropdown notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationStats();
    // Poll unread count every 60 seconds
    const interval = setInterval(fetchNotificationStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDropdownNotifications();
    }
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.notifications.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "alert":
      case "overpayment":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "repair":
      case "maintenance":
        return <Wrench className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getIconBg = (type: string) => {
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
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-30 sticky top-0">
      {/* Omnibox Global Search */}
      <div className="relative w-96 md:w-[460px]" ref={searchContainerRef}>
        <div className="flex items-center bg-gray-100/90 hover:bg-gray-100 rounded-full px-4 py-2.5 transition-all border border-transparent focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100/70 shadow-sm">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
          ) : (
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
          )}
          <input 
            type="text" 
            placeholder="Search everywhere (managers, customers, properties)..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim().length >= 2) {
                setIsSearchOpen(true);
              }
            }}
            onFocus={() => {
              if (searchQuery.trim().length >= 2 && searchResults) {
                setIsSearchOpen(true);
              }
            }}
            className="bg-transparent border-none outline-none ml-2.5 w-full text-sm text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
                setIsSearchOpen(false);
              }}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Omnibox Results Floating Card */}
        {isSearchOpen && searchQuery.trim().length >= 2 && (
          <div className="absolute left-0 mt-2.5 w-full bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            {isSearching ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                <span className="text-xs font-medium text-gray-500">Searching records...</span>
              </div>
            ) : !searchResults || (searchResults.managers.length === 0 && searchResults.customers.length === 0 && searchResults.properties.length === 0) ? (
              <div className="py-10 px-6 text-center">
                <p className="text-sm font-semibold text-gray-800 mb-1">No matching results found</p>
                <p className="text-xs text-gray-400">
                  Try searching with a different name, email, phone number, or property address.
                </p>
              </div>
            ) : (
              <div className="max-h-[460px] overflow-y-auto divide-y divide-gray-100 p-2 space-y-2">
                {/* Property Managers */}
                {searchResults.managers.length > 0 && (
                  <div>
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-blue-600" />
                      Property Managers ({searchResults.managers.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.managers.map((m) => (
                        <Link
                          key={m.id}
                          href={`/property-managers/${m.id}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-blue-50/60 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 truncate">
                              {m.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {m.email} {m.phone ? `• ${m.phone}` : ""}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 shrink-0">
                            Manager
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers & Tenants */}
                {searchResults.customers.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <User className="w-3 h-3 text-purple-600" />
                      Customers & Tenants ({searchResults.customers.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.customers.map((c) => (
                        <Link
                          key={c.id}
                          href={`/customers/${c.id}`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-purple-50/60 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-purple-600 truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {c.email || c.phone || "No direct email"} {c.qatarId ? `• QID: ${c.qatarId}` : ""}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                            c.type === "Active Tenant"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}>
                            {c.type || "Customer"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Properties */}
                {searchResults.properties.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-amber-600" />
                      Properties ({searchResults.properties.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.properties.map((p) => (
                        <Link
                          key={p.id}
                          href={p.createdById ? `/property-managers/${p.createdById}` : `/property-managers`}
                          onClick={() => {
                            setIsSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className="flex items-center gap-3 p-2.5 hover:bg-amber-50/60 rounded-xl transition-all group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                            <Building className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-900 group-hover:text-amber-700 truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-gray-500 truncate">
                              {p.location || p.address || "Doha, Qatar"}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                            {p.type || "Property"}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
              isOpen ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-600"
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Popover Dropdown */}
          {isOpen && (
            <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden z-50 animate-in fade-in duration-150">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
                {isLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
                    <span className="text-xs">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No notifications at this time.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => !item.isRead && handleMarkAsRead(item.id, e)}
                      className={`p-4 flex gap-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
                        !item.isRead ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getIconBg(
                          item.type
                        )}`}
                      >
                        {getNotificationIcon(item.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4
                            className={`text-xs leading-snug ${
                              !item.isRead ? "font-bold text-gray-900" : "font-medium text-gray-700"
                            }`}
                          >
                            {item.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                            {formatTimeAgo(item.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                      {!item.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  View all notifications
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
