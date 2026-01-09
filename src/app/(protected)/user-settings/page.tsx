"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  User,
  AtSign,
  Lock,
  Camera,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle,
  Shield,
  Mail,
  Pencil,
  X,
  Check,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import Image from "next/image";

export default function UserSettingsPage() {
  const { user, refreshUser, setUser } = useAuth();

  // Edit mode states
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingName, setEditingName] = useState(false);

  // Username change state
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  // Profile name change state
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);

  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Photo change state
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize edit values when user loads
  useEffect(() => {
    if (user) {
      setNewUsername(user.username || "");
      setNewName(user.name || "");
    }
  }, [user]);

  // Handle username change
  const handleUsernameChange = async () => {
    if (!newUsername.trim()) {
      toast.error("Please enter a username");
      return;
    }
    if (newUsername.toLowerCase().trim() === user?.username) {
      setEditingUsername(false);
      return;
    }
    setUsernameLoading(true);
    try {
      await api.patch("/user/change-username", {
        newUsername: newUsername.toLowerCase().trim(),
      });
      toast.success("Username updated successfully");
      setEditingUsername(false);
      refreshUser();
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update username";
      toast.error(message);
    } finally {
      setUsernameLoading(false);
    }
  };

  // Handle profile name change
  const handleNameChange = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (newName.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setNameLoading(true);
    try {
      await api.patch("/user/change-name", { newName: newName.trim() });
      toast.success("Profile name updated successfully");
      setEditingName(false);
      refreshUser();
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update name";
      toast.error(message);
    } finally {
      setNameLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.patch("/user/change-password", {
        currentPassword,
        newPassword,
        newPasswordConfirm,
      });
      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setShowPasswordSection(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async () => {
    if (!photoFile) {
      toast.error("Please select a photo first");
      return;
    }
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("photo", photoFile);
      const { data } = await api.patch("/user/change-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Profile photo updated successfully");
      setPhotoPreview(null);
      setPhotoFile(null);
      // Add timestamp to bust browser cache
      const photoUrl = data?.data?.photo;
      if (photoUrl) {
        const cacheBustedUrl = `${photoUrl}?t=${Date.now()}`;
        setUser((prev) => (prev ? { ...prev, photo: cacheBustedUrl } : prev));
      } else {
        refreshUser();
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to update photo";
      toast.error(message);
    } finally {
      setPhotoLoading(false);
    }
  };

  // Cancel photo selection
  const cancelPhotoSelection = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get user initials
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (newPassword.length === 0)
      return { text: "", color: "", width: "0%", score: 0 };
    if (newPassword.length < 6)
      return {
        text: "Too short",
        color: "bg-rose-500",
        width: "20%",
        score: 1,
      };
    if (newPassword.length < 8)
      return { text: "Weak", color: "bg-orange-500", width: "40%", score: 2 };

    let score = 2;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score >= 5)
      return {
        text: "Strong",
        color: "bg-emerald-500",
        width: "100%",
        score: 5,
      };
    if (score >= 4)
      return { text: "Good", color: "bg-blue-500", width: "80%", score: 4 };
    return { text: "Medium", color: "bg-amber-500", width: "60%", score: 3 };
  };

  const passwordStrength = getPasswordStrength();

  // Cancel editing
  const cancelUsernameEdit = () => {
    setNewUsername(user?.username || "");
    setEditingUsername(false);
  };

  const cancelNameEdit = () => {
    setNewName(user?.name || "");
    setEditingName(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Profile Photo */}
            <div className="relative group">
              <div className="relative">
                {photoPreview ? (
                  <Image
                    src={photoPreview}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                    unoptimized
                  />
                ) : user?.photo ? (
                  <Image
                    key={user.photo}
                    src={user.photo}
                    alt={user.name}
                    width={120}
                    height={120}
                    className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl object-cover border-4 border-white/30 shadow-2xl"
                    unoptimized
                  />
                ) : (
                  <div className="h-28 w-28 sm:h-32 sm:w-32 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
                    <span className="text-3xl sm:text-4xl font-bold text-white">
                      {getInitials()}
                    </span>
                  </div>
                )}

                {/* Photo overlay on hover */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              {/* Photo action buttons */}
              {photoFile && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={photoLoading}
                    className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-lg text-white transition-colors disabled:opacity-70"
                  >
                    {photoLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={cancelPhotoSelection}
                    className="p-2 bg-rose-500 hover:bg-rose-600 rounded-full shadow-lg text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left text-white">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {user?.name || "User"}
              </h1>
              <p className="text-white/80 flex items-center justify-center sm:justify-start gap-1.5 mb-2">
                <AtSign className="h-4 w-4" />
                {user?.username}
              </p>
              <p className="text-white/60 flex items-center justify-center sm:justify-start gap-1.5 text-sm">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <div className="space-y-4">
          {/* Profile Information Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">
                    Profile Information
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your personal details
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {/* Display Name */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Display Name
                    </label>
                    {editingName ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleNameChange();
                            if (e.key === "Escape") cancelNameEdit();
                          }}
                        />
                        <button
                          onClick={handleNameChange}
                          disabled={nameLoading}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors disabled:opacity-70"
                        >
                          {nameLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelNameEdit}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-medium">
                          {user?.name}
                        </span>
                        <button
                          onClick={() => setEditingName(true)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Username */}
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-slate-500 block mb-1">
                      Username
                    </label>
                    {editingUsername ? (
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) =>
                              setNewUsername(e.target.value.toLowerCase())
                            }
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-sm"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUsernameChange();
                              if (e.key === "Escape") cancelUsernameEdit();
                            }}
                          />
                        </div>
                        <button
                          onClick={handleUsernameChange}
                          disabled={usernameLoading}
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors disabled:opacity-70"
                        >
                          {usernameLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelUsernameEdit}
                          className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-medium flex items-center gap-1">
                          <AtSign className="h-4 w-4 text-slate-400" />
                          {user?.username}
                        </span>
                        <button
                          onClick={() => setEditingUsername(true)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div className="px-6 py-4">
                <label className="text-sm font-medium text-slate-500 block mb-1">
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-800 font-medium">
                    {user?.email}
                  </span>
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                    Cannot be changed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <Shield className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Security</h2>
                  <p className="text-xs text-slate-500">
                    Manage your password and security settings
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!showPasswordSection ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <KeyRound className="h-5 w-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">Password</p>
                      <p className="text-sm text-slate-500">
                        Keep your account secure
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordSection(true)}
                    className="px-4 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">
                        Password Requirements
                      </p>
                      <ul className="text-amber-700 mt-1 space-y-0.5">
                        <li>• At least 8 characters long</li>
                        <li>
                          • Include uppercase letters, numbers, or symbols for a
                          stronger password
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter your new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1.5 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Password strength
                          </span>
                          <span
                            className={`font-medium ${
                              passwordStrength.score >= 4
                                ? "text-emerald-600"
                                : passwordStrength.score >= 3
                                ? "text-amber-600"
                                : "text-rose-600"
                            }`}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordStrength.color} transition-all duration-300`}
                            style={{ width: passwordStrength.width }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="Confirm your new password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none transition-all"
                      />
                      {newPasswordConfirm && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {newPassword === newPasswordConfirm ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <X className="h-5 w-5 text-rose-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {newPasswordConfirm &&
                      newPassword !== newPasswordConfirm && (
                        <p className="text-xs text-rose-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Passwords do not
                          match
                        </p>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={
                        passwordLoading ||
                        !currentPassword ||
                        !newPassword ||
                        !newPasswordConfirm ||
                        newPassword !== newPasswordConfirm ||
                        newPassword.length < 8
                      }
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                      {passwordLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </span>
                      ) : (
                        "Update Password"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setCurrentPassword("");
                        setNewPassword("");
                        setNewPasswordConfirm("");
                      }}
                      className="px-4 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Photo Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
            <Camera className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">Profile Photo</p>
              <p className="text-blue-700 mt-0.5">
                Click on your profile picture above to change it. Supported
                formats: JPG, PNG, GIF. Maximum size: 5MB.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
