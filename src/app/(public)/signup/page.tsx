"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  Upload,
  Stethoscope,
  ArrowRight,
  User,
  Mail,
  Lock,
  AtSign,
  Shield,
} from "lucide-react";
import axios from "axios";
import api from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import toast from "react-hot-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<
    "checking" | "available" | "unavailable" | "idle"
  >("idle");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const router = useRouter();
  const usernameTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { signup } = useAuth();

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Check username availability after user stops typing
    if (name === "username" && value.trim().length > 2) {
      // Clear any existing timeout
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }

      setUsernameStatus("checking");

      // Set a new timeout
      usernameTimeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 2000); // 2 second delay
    } else if (name === "username" && value.trim().length <= 2) {
      setUsernameStatus("idle");
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    }
  };

  // Check if username is available
  const checkUsernameAvailability = async (username: string) => {
    try {
      const { data } = await api.get(`/user/check-username/${username}`);
      setUsernameStatus(data.available ? "available" : "unavailable");
    } catch (err) {
      console.error("Error checking username:", err);
      setUsernameStatus("idle");
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setValidationErrors((prev) => ({
          ...prev,
          photo: "File size should be less than 2MB",
        }));
        return;
      }

      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.photo;
        return newErrors;
      });

      setPhoto(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (formData.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (formData.name.trim().length < 2) {
      errors.name = "Name is required";
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = "Valid email is required";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }

    if (usernameStatus === "unavailable") {
      errors.username = "This username is already taken";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Create FormData object
      const submitData = new FormData();
      submitData.append("username", formData.username);
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("passwordConfirm", formData.passwordConfirm);

      if (photo) {
        submitData.append("photo", photo);
      }

      await signup(submitData);
      toast.success("Account created successfully");
      router.push("dashboard");
    } catch (err) {
      let errorMessage = "Invalid ";
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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameTimeoutRef.current) {
        clearTimeout(usernameTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
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
            Start your journey
            <br />
            <span className="text-purple-200">to cleaner code.</span>
          </h1>

          <p className="text-lg text-purple-100 mb-8 max-w-md">
            Join thousands of developers who trust Code Doctor to maintain
            healthy, maintainable codebases.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">10k+</div>
              <div className="text-sm text-purple-200">Active Users</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">50k+</div>
              <div className="text-sm text-purple-200">Projects Analyzed</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">1M+</div>
              <div className="text-sm text-purple-200">Smells Detected</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="text-3xl font-bold text-white mb-1">99%</div>
              <div className="text-sm text-purple-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 to-purple-50/30 px-6 py-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Code Doctor
            </span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Create your account
              </h1>
              <p className="text-slate-500">
                Get started with Code Doctor today
              </p>
            </div>

            {successMessage && (
              <div className="mb-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700 border border-rose-200 flex items-center gap-2">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-2">
                <label
                  htmlFor="username"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Username
                </label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="johndoe"
                    required
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-slate-50/50 pl-12 pr-12 py-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      validationErrors.username
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                  {usernameStatus === "checking" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  )}
                  {usernameStatus === "available" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                  {usernameStatus === "unavailable" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <XCircle className="h-5 w-5 text-rose-500" />
                    </div>
                  )}
                </div>
                {validationErrors.username && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {validationErrors.username}
                  </p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Username is available
                  </p>
                )}
              </div>

              {/* Name field */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-slate-50/50 pl-12 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      validationErrors.name
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
                {validationErrors.name && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {validationErrors.name}
                  </p>
                )}
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                    disabled={isLoading}
                    className={`w-full rounded-xl border bg-slate-50/50 pl-12 pr-4 py-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                      validationErrors.email
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    }`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {validationErrors.email}
                  </p>
                )}
              </div>

              {/* Password fields in a grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className={`w-full rounded-xl border bg-slate-50/50 pl-12 pr-12 py-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.password
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
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
                  {validationErrors.password && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      id="passwordConfirm"
                      name="passwordConfirm"
                      type={showPasswordConfirm ? "text" : "password"}
                      value={formData.passwordConfirm}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                      className={`w-full rounded-xl border bg-slate-50/50 pl-12 pr-12 py-3 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-4 transition-all ${
                        validationErrors.passwordConfirm
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      onClick={() =>
                        setShowPasswordConfirm(!showPasswordConfirm)
                      }
                      tabIndex={-1}
                    >
                      {showPasswordConfirm ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {validationErrors.passwordConfirm && (
                    <p className="text-xs text-rose-600 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" />
                      {validationErrors.passwordConfirm}
                    </p>
                  )}
                </div>
              </div>

              {/* Photo upload field */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Profile Photo{" "}
                  <span className="text-slate-400 font-normal">(Optional)</span>
                </label>

                <div className="flex items-center gap-4">
                  {/* Photo preview */}
                  <div className="relative">
                    {photoPreview ? (
                      <div className="relative">
                        <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-slate-200 shadow-sm">
                          <img
                            src={photoPreview}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPhoto(null);
                            setPhotoPreview(null);
                          }}
                          className="absolute -right-2 -top-2 p-1 bg-rose-500 rounded-full text-white shadow-lg hover:bg-rose-600 transition-colors"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload button */}
                  <div className="flex-1">
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer transition-colors"
                    >
                      <Upload className="h-4 w-4" />
                      {photo ? "Change Photo" : "Upload Photo"}
                    </label>
                    <input
                      id="photo-upload"
                      name="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
                {validationErrors.photo && (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {validationErrors.photo}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={
                  isLoading ||
                  usernameStatus === "checking" ||
                  usernameStatus === "unavailable"
                }
                className={`w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all ${
                  isLoading ||
                  usernameStatus === "checking" ||
                  usernameStatus === "unavailable"
                    ? "cursor-not-allowed opacity-70"
                    : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            By creating an account, you agree to our{" "}
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
