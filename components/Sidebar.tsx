"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CreditCard, 
  Users, 
  UserSquare, 
  Settings, 
  LogOut, 
  Bell, 
  FileText, 
  LineChart 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Subscriptions", href: "/subscriptions", icon: CreditCard },
  { name: "Property Managers", href: "/property-managers", icon: UserSquare },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.notifications.getUnreadCount();
        if (res.success && typeof res.unreadCount === "number") {
          setUnreadCount(res.unreadCount);
        }
      } catch {}
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 60000);
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-slate-300 h-screen border-r border-slate-800 shrink-0">
      <div className="flex items-center justify-center h-20 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white tracking-wider">
          SUPER<span className="text-blue-500">ADMIN</span>
        </h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400")} />
              <span className="font-medium flex-1">{item.name}</span>
              {item.name === "Notifications" && unreadCount > 0 && (
                <span className={cn(
                  "px-2 py-0.5 text-[11px] font-bold rounded-full",
                  isActive ? "bg-white text-blue-600" : "bg-blue-600 text-white"
                )}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-200 group text-left cursor-pointer"
        >
          <LogOut className="w-5 h-5 group-hover:text-red-400" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
