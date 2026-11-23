"use client";

import { useState, useEffect } from "react";
import { User, Settings, Save, Lock, Mail, Phone, Building, Loader2, DollarSign, Globe, MapPin, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Settings State
  const [systemSettings, setSystemSettings] = useState({
    companyName: "",
    currencyCode: "",
    currencySymbol: "",
    address: "",
    phone: "",
    email: "",
    timezone: "Asia/Qatar",
  });

  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch Profile & Settings in parallel
        const [profileRes, settingsRes] = await Promise.all([
          api.auth.getMe().catch(() => ({ success: false })),
          api.settings.get().catch(() => ({ success: false })),
        ]);
        
        if (profileRes.success && profileRes.user) {
          setProfile((prev) => ({
            ...prev,
            name: profileRes.user.name || "",
            email: profileRes.user.email || "",
            phone: profileRes.user.phone || "",
            department: profileRes.user.department || "",
          }));
        }

        if (settingsRes.success && settingsRes.settings) {
          setSystemSettings({
            companyName: settingsRes.settings.companyName || "",
            currencyCode: settingsRes.settings.currencyCode || settingsRes.settings.currency?.code || "QAR",
            currencySymbol: settingsRes.settings.currencySymbol || settingsRes.settings.currency?.symbol || "QR",
            address: settingsRes.settings.address || "",
            phone: settingsRes.settings.phone || "",
            email: settingsRes.settings.email || "",
            timezone: settingsRes.settings.timezone || "Asia/Qatar",
          });
        }
      } catch (error) {
        console.error("Failed to fetch settings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      setMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    try {
      setIsSaving(true);
      setMessage({ text: "", type: "" });
      
      const payload: any = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
      };

      if (profile.newPassword) {
        payload.currentPassword = profile.currentPassword;
        payload.newPassword = profile.newPassword;
      }

      const res = await api.auth.updateProfile(payload);
      
      if (res.success) {
        setMessage({ text: "Profile updated successfully.", type: "success" });
        setProfile((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
      } else {
        setMessage({ text: res.message || "Failed to update profile.", type: "error" });
      }
    } catch (error: any) {
      setMessage({ text: error.message || "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage({ text: "", type: "" });
      
      const payload = {
        companyName: systemSettings.companyName,
        currency: {
          code: systemSettings.currencyCode,
          symbol: systemSettings.currencySymbol,
        },
        address: systemSettings.address,
        phone: systemSettings.phone,
        email: systemSettings.email,
        timezone: systemSettings.timezone,
      };

      const res = await api.settings.update(payload);
      
      if (res.success) {
        setMessage({ text: "System settings updated successfully.", type: "success" });
      } else {
        setMessage({ text: res.message || "Failed to update settings.", type: "error" });
      }
    } catch (error: any) {
      setMessage({ text: error.message || "An error occurred. Please try again.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your account and platform preferences</p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {message.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
          <div className="text-sm font-medium">{message.text}</div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl max-w-md">
        <button
          onClick={() => {
            setActiveTab("profile");
            setMessage({ text: "", type: "" });
          }}
          className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
          }`}
        >
          <User className="h-4 w-4" />
          My Profile
        </button>
        <button
          onClick={() => {
            setActiveTab("settings");
            setMessage({ text: "", type: "" });
          }}
          className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
            activeTab === "settings"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
          }`}
        >
          <Settings className="h-4 w-4" />
          System Settings
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {activeTab === "profile" ? (
          <form onSubmit={handleProfileSubmit} className="divide-y divide-gray-100">
            <div className="p-6 md:p-8 space-y-8">
              {/* Personal Information */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-400" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Superadmin Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-gray-50 text-gray-500"
                        readOnly
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email is fixed to the master admin account.</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="+974 5555 1234"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <input
                      type="text"
                      value={profile.department}
                      onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="e.g. Platform Operations"
                    />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Password Change */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-gray-400" />
                  Change Password
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Current Password</label>
                    <input
                      type="password"
                      value={profile.currentPassword}
                      onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2 md:col-start-1">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <input
                      type="password"
                      value={profile.newPassword}
                      onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                      type="password"
                      value={profile.confirmPassword}
                      onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </section>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSettingsSubmit} className="divide-y divide-gray-100">
            <div className="p-6 md:p-8 space-y-8">
              {/* General Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5 text-gray-400" />
                  Platform Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <input
                      type="text"
                      required
                      value={systemSettings.companyName}
                      onChange={(e) => setSystemSettings({ ...systemSettings, companyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <div className="relative">
                      <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                        <MapPin className="h-4 w-4 text-gray-400" />
                      </div>
                      <textarea
                        value={systemSettings.address}
                        onChange={(e) => setSystemSettings({ ...systemSettings, address: e.target.value })}
                        rows={3}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={systemSettings.email}
                        onChange={(e) => setSystemSettings({ ...systemSettings, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={systemSettings.phone}
                        onChange={(e) => setSystemSettings({ ...systemSettings, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Localization Settings */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-gray-400" />
                  Localization & Currency
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Currency Code</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        value={systemSettings.currencyCode}
                        onChange={(e) => setSystemSettings({ ...systemSettings, currencyCode: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                        placeholder="QAR"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Currency Symbol</label>
                    <input
                      type="text"
                      required
                      value={systemSettings.currencySymbol}
                      onChange={(e) => setSystemSettings({ ...systemSettings, currencySymbol: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                      placeholder="QR"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Timezone</label>
                    <select
                      value={systemSettings.timezone}
                      onChange={(e) => setSystemSettings({ ...systemSettings, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="Asia/Qatar">Qatar (AST)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Riyadh">Riyadh (AST)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">London (GMT)</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>

            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Platform Settings
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
