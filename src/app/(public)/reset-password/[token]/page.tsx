"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f8fa]">
      <div className="w-full max-w-md rounded-md border border-[#d0d7de] bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#24292f]">Reset Password</h1>
          <p className="text-sm text-[#57606a]">
            Enter and confirm your new password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[#24292f]"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-md border border-[#d0d7de] bg-[#f6f8fa] px-3 py-1.5 text-sm text-[#24292f] focus:border-[#0969da] focus:outline-none focus:ring-1 focus:ring-[#0969da]"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShow(!show)}
                tabIndex={-1}
              >
                {show ? (
                  <EyeOff className="h-4 w-4 text-[#57606a]" />
                ) : (
                  <Eye className="h-4 w-4 text-[#57606a]" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirm"
              className="text-sm font-medium text-[#24292f]"
            >
              Confirm Password
            </label>
            <input
              id="confirm"
              type={show ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
                <span>Resetting...</span>
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#24292f]">
          <Link
            href="/login"
            className="font-medium text-[#0969da] hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
