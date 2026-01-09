"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Loader2,
  Mail,
  ArrowLeft,
  Stethoscope,
  CheckCircle,
  KeyRound,
} from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/user/forgot-password", { email });
      setSent(true);
      toast.success("If an account exists, a reset email was sent.");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to send email";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold">Code Doctor</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Forgot your
            <br />
            password?
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            No worries! Enter your email and we&apos;ll send you a secure link
            to reset your password.
          </p>

          <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <KeyRound className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold">Secure Reset Process</p>
                <p className="text-sm text-white/70">
                  Your link expires in 10 minutes for security
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">
              Reset Password
            </h1>
            <p className="text-slate-500 mt-1">
              Enter your email to receive a reset link
            </p>
          </div>

          {sent ? (
            <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-emerald-800">
                  Check your email
                </h3>
              </div>
              <p className="text-sm text-emerald-700">
                We sent a password reset link to <strong>{email}</strong>. Click
                the link in the email to reset your password.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Didn&apos;t receive it? Try again
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
