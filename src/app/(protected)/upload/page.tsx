"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Search,
  Upload,
  X,
  ArrowLeft,
  Sparkles,
  FileSearch,
  Brain,
  FolderUp,
  FileArchive,
  Users,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function UploadProjectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Project data state
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Team members state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAnalyzingDialog, setShowAnalyzingDialog] = useState(false);
  const [errors, setErrors] = useState<{
    projectName?: string;
    projectDescription?: string;
    file?: string;
    submission?: string;
  }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
      setErrors((prev) => ({ ...prev, file: undefined }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (
      file &&
      (file.type === "application/zip" || file.name.endsWith(".zip"))
    ) {
      setSelectedFile(file);
      setErrors((prev) => ({ ...prev, file: undefined }));
    } else {
      setErrors((prev) => ({ ...prev, file: "Please upload a ZIP file" }));
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchTimeout(setTimeout(() => fetchUsers(value), 500));
  };

  const fetchUsers = async (query: string) => {
    try {
      const { data } = await api.get(`/user/userinfo/${query}`);
      setSearchResults(data.user ? [data.user] : []);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addMember = (user: any) => {
    if (!selectedMembers.some((member) => member.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
      setSearchResults((prev) =>
        prev.filter((result) => result.id !== user.id)
      );

      setSearchQuery("");
    }
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((member) => member.id !== userId));
  };

  // Check if the search query matches any selected member's username
  const isQueryInSelectedMembers = () => {
    if (!searchQuery || searchQuery.length < 2) return false;

    return selectedMembers.some((member) => {
      const username =
        member.username || member.name.toLowerCase().replace(/\s+/g, "_");
      return (
        username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};
    if (!projectName.trim()) newErrors.projectName = "Project name is required";
    if (!projectDescription.trim())
      newErrors.projectDescription = "Description is required";
    if (!selectedFile) newErrors.file = "ZIP file required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setShowAnalyzingDialog(true);

    try {
      const formData = new FormData();
      formData.append("name", projectName);
      formData.append("description", projectDescription);
      formData.append("project", selectedFile as Blob);
      formData.append(
        "members",
        JSON.stringify(selectedMembers.map((m) => m.id))
      );

      const { data } = await api.post("/project/create-project", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      router.push(`/report/${data.project._id}`);
    } catch (error: any) {
      console.error("Project creation failed:", error);
      setShowAnalyzingDialog(false);
      setErrors((prev) => ({
        ...prev,
        submission: error.response?.data?.message || "Project creation failed",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  // Check if we should show "No users found" message
  const shouldShowNoUsersFound = () => {
    return (
      searchQuery.length > 1 &&
      !isSearching &&
      searchResults.length === 0 &&
      !isQueryInSelectedMembers()
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8 px-4">
      {/* Analyzing Dialog */}
      <Dialog open={showAnalyzingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white p-0 overflow-hidden rounded-2xl">
          <div className="relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>

            {/* Content */}
            <div className="relative p-8 flex flex-col items-center justify-center space-y-6">
              {/* Animated Icons */}
              <div className="relative w-28 h-28">
                {/* Outer rotating ring */}
                <div
                  className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"
                  style={{ animationDuration: "3s" }}
                ></div>

                {/* Middle pulsing ring */}
                <div
                  className="absolute inset-3 border-4 border-indigo-200 rounded-full animate-ping"
                  style={{ animationDuration: "2s" }}
                ></div>

                {/* Inner icon container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                    <Brain className="h-10 w-10 text-white" />
                    <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Analyzing Your Project
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Our AI is detecting code smells and analyzing your project
                  structure...
                </p>
              </div>

              {/* Progress indicators */}
              <div className="w-full space-y-3 bg-white/50 rounded-xl p-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-1 bg-emerald-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-slate-700 font-medium">
                    Extracting project files
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="text-slate-700 font-medium">
                    Scanning code patterns
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <span className="text-slate-400">Detecting code smells</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                  </div>
                  <span className="text-slate-400">Generating report</span>
                </div>
              </div>

              {/* Loading bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                ></div>
              </div>

              <p className="text-xs text-slate-400">
                This may take a few moments...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="max-w-2xl mx-auto mt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Upload New Project
            </h1>
            <p className="text-slate-500 text-sm">
              Analyze your codebase for code smells
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Details Card */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden py-0">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <h2 className="font-semibold text-slate-700">
                  Project Details
                </h2>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="project-name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Project Name <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Project"
                  className={cn(
                    "rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all",
                    errors.projectName &&
                      "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                  )}
                />
                {errors.projectName && (
                  <p className="text-rose-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="project-description"
                  className="text-sm font-semibold text-slate-700"
                >
                  Description <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe what your project does..."
                  className={cn(
                    "rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[120px] resize-none",
                    errors.projectDescription &&
                      "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                  )}
                />
                {errors.projectDescription && (
                  <p className="text-rose-600 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.projectDescription}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden py-0">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <FolderUp className="h-4 w-4 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-slate-700">Project Files</h2>
              </div>
            </div>
            <CardContent className="p-6">
              <div
                className={cn(
                  "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200",
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : selectedFile
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50",
                  errors.file && "border-rose-300 bg-rose-50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex flex-col items-center gap-4">
                  {selectedFile ? (
                    <>
                      <div className="p-4 bg-emerald-100 rounded-2xl">
                        <FileArchive className="h-10 w-10 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {selectedFile.name}
                        </h3>
                        <p className="text-slate-500 text-sm">
                          {(selectedFile.size / 1e6).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1"
                      >
                        <X className="h-4 w-4" />
                        Remove file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="p-4 bg-slate-100 rounded-2xl group-hover:bg-blue-100 transition-colors">
                        <Upload className="h-10 w-10 text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          Drag & drop your ZIP file here
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">
                          or click to browse files
                        </p>
                      </div>
                      <span className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors">
                        Select File
                      </span>
                    </>
                  )}
                </div>
              </div>
              {errors.file && (
                <p className="text-rose-600 text-sm flex items-center gap-1 mt-3">
                  <AlertCircle className="h-4 w-4" />
                  {errors.file}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Team Members Card */}
          <Card className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-200/50 overflow-hidden py-0">
            <div className="px-6 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Users className="h-4 w-4 text-violet-600" />
                </div>
                <h2 className="font-semibold text-slate-700">Team Members</h2>
                <span className="text-xs text-slate-400">(Optional)</span>
              </div>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="Search by username..."
                  className="pl-12 rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>

              {searchQuery.length > 1 && (
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  {isSearching ? (
                    <div className="py-6 flex justify-center items-center">
                      <Loader2 className="animate-spin text-slate-400 h-6 w-6" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 flex justify-between items-center cursor-pointer hover:bg-white transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => addMember(user)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                              <AvatarImage
                                src={user.photo || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                {user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {user.name}
                              </p>
                              <p className="text-slate-500 text-sm">
                                @
                                {user.username ||
                                  user.name.toLowerCase().replace(/\s+/g, "_")}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                            Add
                          </span>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : shouldShowNoUsersFound() ? (
                    <div className="py-6 text-center">
                      <p className="text-slate-500 font-medium">
                        No users found
                      </p>
                      <p className="text-slate-400 text-sm mt-1">
                        Try different search terms
                      </p>
                    </div>
                  ) : null}
                </div>
              )}

              {selectedMembers.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-slate-700 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    Selected Members ({selectedMembers.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedMembers.map((member) => (
                      <div
                        key={member.id}
                        className="p-3 flex justify-between items-center rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-slate-200">
                            <AvatarImage
                              src={member.photo || "/placeholder.svg"}
                              alt={member.name}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                              {member.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-slate-800">
                              {member.name}
                            </p>
                            <p className="text-slate-500 text-sm">
                              @
                              {member.username ||
                                member.name.toLowerCase().replace(/\s+/g, "_")}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          onClick={() => removeMember(member.id)}
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {errors.submission && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-700 text-sm border border-rose-200 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {errors.submission}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-6 shadow-lg shadow-blue-500/25 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating and Analyzing Project...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Create Project
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
