"use client";

import type React from "react";
import { useAuth } from "@/contexts/auth-context";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Stethoscope,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      router.push("dashboard");
      toast.success("Logged in Successfully.");
    } catch (err) {
      let errorMessage = "Invalid Username or Password. Please try again.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 -translate-x-48 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Stethoscope className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Code Doctor</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
            Diagnose your code,
            <br />
            <span className="text-blue-200">heal your codebase.</span>
          </h1>

          <p className="text-lg text-blue-100 mb-8 max-w-md">
            Advanced code smell detection and intelligent refactoring
            suggestions to keep your code healthy.
          </p>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1 bg-emerald-400/20 rounded-full">
                <ArrowRight className="h-4 w-4 text-emerald-300" />
              </div>
              <span>Detect code smells instantly</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1 bg-emerald-400/20 rounded-full">
                <ArrowRight className="h-4 w-4 text-emerald-300" />
              </div>
              <span>Get AI-powered refactoring suggestions</span>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <div className="p-1 bg-emerald-400/20 rounded-full">
                <ArrowRight className="h-4 w-4 text-emerald-300" />
              </div>
              <span>Track code quality over time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Code Doctor
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome back
              </h1>
              <p className="text-slate-500">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-12 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-12 pr-12 py-3 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-3.5 text-white font-semibold shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all ${
                  isLoading ? "cursor-not-allowed opacity-70" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-slate-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400">
            By signing in, you agree to our{" "}
            <Link
              href="#"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="#"
              className="text-slate-500 hover:text-slate-700 underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
