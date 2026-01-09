"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Shield,
  Stethoscope,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token as string;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await api.post(`/user/reset-password/${token}`, {
        password,
        passwordConfirm: confirm,
      });
      toast.success("Password reset successful. Please log in.");
      router.push("/login");
    } catch (err: any) {
      const message = err?.response?.data?.message || "Reset failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { text: "", color: "" };
    if (password.length < 6)
      return { text: "Too short", color: "text-rose-500" };
    if (password.length < 8) return { text: "Weak", color: "text-amber-500" };
    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    ) {
      return { text: "Strong", color: "text-emerald-500" };
    }
    return { text: "Medium", color: "text-amber-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold">Code Doctor</span>
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Create a new
            <br />
            password
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Choose a strong password to keep your account secure. We recommend
            using a mix of letters, numbers, and symbols.
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span>Include uppercase letters</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="h-5 w-5" />
              </div>
              <span>Include numbers or symbols</span>
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
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Shield className="h-5 w-5 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Set New Password
              </h1>
            </div>
            <p className="text-slate-500">
              Enter and confirm your new password below
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="password"
                  type={show ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {show ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {passwordStrength.text && (
                <p className={`text-xs font-medium ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.text}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirm"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  id="confirm"
                  type={show ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all disabled:opacity-50"
                />
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs font-medium text-rose-500">
                  Passwords do not match
                </p>
              )}
              {confirm && password === confirm && confirm.length > 0 && (
                <p className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={
                isLoading || password !== confirm || password.length < 6
              }
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
