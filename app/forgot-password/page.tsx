"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wider">SUPER<span className="text-blue-500">ADMIN</span></h1>
          <p className="text-slate-400 mt-2 text-sm">Reset your password</p>
        </div>
        
        <div className="p-8">
          {isSubmitted ? (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-2">
                <Mail className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium text-slate-900">Check your email</h3>
              <p className="text-slate-500 text-sm">
                We have sent a password reset link to <br/>
                <span className="font-semibold text-slate-700">{email}</span>
              </p>
              <div className="pt-4">
                <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-sm text-slate-600">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    placeholder="admin@rencomm.com"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Send Reset Link
              </button>
              
              <div className="text-center">
                <Link href="/login" className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
