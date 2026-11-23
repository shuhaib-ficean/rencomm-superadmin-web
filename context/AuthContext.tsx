"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_PATHS = ["/login", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    try {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setUser(null);
        setToken(null);
        return;
      }
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      localStorage.removeItem("token");
      setUser(null);
      setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (savedToken) {
        setToken(savedToken);
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem("token");
            setToken(null);
          }
        } catch {
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
      if (!token && !isPublic) {
        router.push("/login");
      }
      if (token && pathname === "/login") {
        router.push("/dashboard");
      }
    }
  }, [isLoading, token, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.accessToken) {
        localStorage.setItem("token", res.accessToken);
        setToken(res.accessToken);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error: any) {
      return {
        success: false,
        message: error.data?.message || error.message || "Invalid credentials",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
