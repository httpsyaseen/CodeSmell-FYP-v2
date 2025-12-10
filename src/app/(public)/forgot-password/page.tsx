"use client";

import { useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa]">
      <div className="w-full max-w-md rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#24292f]">Forgot Password</h1>
          <p className="text-sm text-[#57606a]">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#24292f]"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              disabled={isLoading}
              className="w-full rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-sm text-[#24292f] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full rounded-md bg-[#2da44e] px-4 py-2 text-white transition-colors hover:bg-[#2c974b] focus:outline-none focus:ring-2 focus:ring-[#2da44e] focus:ring-offset-2 ${
              isLoading ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        {sent && (
          <div className="mt-4 rounded-md border border-[#2da44e] bg-[#dafbe1] p-3 text-sm text-[#1a7f37]">
            <p className="font-medium">Check your email</p>
            <p>We sent a password reset link to your email address.</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-[#24292f]">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-[#0969da] hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
