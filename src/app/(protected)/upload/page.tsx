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
    <div className="container py-8 mx-auto bg-white">
      {/* Analyzing Dialog */}
      <Dialog open={showAnalyzingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white p-0 overflow-hidden">
          <div className="relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 animate-pulse"></div>

            {/* Content */}
            <div className="relative p-8 flex flex-col items-center justify-center space-y-6">
              {/* Animated Icons */}
              <div className="relative w-24 h-24">
                {/* Outer rotating ring */}
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"></div>

                {/* Middle pulsing ring */}
                <div className="absolute inset-2 border-4 border-purple-200 rounded-full animate-ping"></div>

                {/* Inner icon container */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <Brain className="h-12 w-12 text-blue-600 animate-pulse" />
                    <Sparkles className="h-6 w-6 text-purple-600 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                </div>
              </div>

              {/* Text content */}
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  Analyzing Your Project
                </h3>
                <p className="text-gray-600 max-w-sm">
                  Our AI is detecting code smells and analyzing your project
                  structure...
                </p>
              </div>

              {/* Progress indicators */}
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700">
                    Extracting project files
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <span className="text-gray-700">Scanning code patterns</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                  <span className="text-gray-700">Detecting code smells</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div
                    className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"
                    style={{ animationDelay: "0.6s" }}
                  ></div>
                  <span className="text-gray-700">Generating report</span>
                </div>
              </div>

              {/* Loading bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-[shimmer_2s_ease-in-out_infinite]"
                  style={{
                    width: "100%",
                    backgroundSize: "200% 100%",
                  }}
                ></div>
              </div>

              <p className="text-xs text-gray-500 italic">
                This may take a few moments...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center gap-2 mb-6 max-w-xl mx-auto">
        <Link href="/">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#24292f] hover:bg-[#f6f8fa]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold text-[#24292f]">
          Upload New Project
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        {/* Project Details Card */}
        <Card className="bg-white border border-[#d0d7de] rounded-md shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="project-name"
                className="text-[#24292f] font-medium"
              >
                Project Name <span className="text-[#cf222e]">*</span>
              </Label>
              <Input
                id="project-name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className={cn(
                  "bg-white border-[#d0d7de] text-[#24292f] placeholder:text-[#6e7781] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]",
                  errors.projectName && "border-[#cf222e]"
                )}
              />
              {errors.projectName && (
                <p className="text-[#cf222e] text-sm">{errors.projectName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="project-description"
                className="text-[#24292f] font-medium"
              >
                Description <span className="text-[#cf222e]">*</span>
              </Label>
              <Textarea
                id="project-description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className={cn(
                  "bg-white border-[#d0d7de] text-[#24292f] placeholder:text-[#6e7781] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da] min-h-[100px]",
                  errors.projectDescription && "border-[#cf222e]"
                )}
              />
              {errors.projectDescription && (
                <p className="text-[#cf222e] text-sm">
                  {errors.projectDescription}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* File Upload Card */}
        <Card className="bg-white border border-[#d0d7de] rounded-md shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-[#24292f] font-medium">
              Project File <span className="text-[#cf222e]">*</span>
            </Label>
            <div
              className={cn(
                "border-2 border-dashed rounded-md p-8 text-center cursor-pointer",
                "bg-[#f6f8fa] transition-colors",
                isDragging
                  ? "border-[#0969da] bg-[#ddf4ff]"
                  : "border-[#d0d7de]",
                errors.file && "border-[#cf222e]"
              )}
              {...{
                onDragOver: handleDragOver,
                onDragLeave: handleDragLeave,
                onDrop: handleDrop,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-10 w-10 text-[#6e7781]" />
                <h3 className="text-lg font-medium text-[#24292f]">
                  {selectedFile ? selectedFile.name : "Drag & Drop ZIP file"}
                </h3>
                <p className="text-[#6e7781] text-sm">
                  {selectedFile
                    ? `${(selectedFile.size / 1e6).toFixed(2)} MB`
                    : "or click to browse"}
                </p>
              </div>
            </div>
            {errors.file && (
              <p className="text-[#cf222e] text-sm">{errors.file}</p>
            )}
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card className="bg-white border border-[#d0d7de] rounded-md shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <Label className="text-[#24292f] font-medium">Team Members</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6e7781]" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-white border-[#d0d7de] text-[#24292f] placeholder:text-[#6e7781] focus:border-[#0969da] focus:ring-1 focus:ring-[#0969da]"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {searchQuery.length > 1 && (
              <Card className="mt-2 bg-white border border-[#d0d7de] rounded-md shadow-sm">
                <CardContent className="p-0">
                  {isSearching ? (
                    <div className="py-4 flex justify-center items-center">
                      <Loader2 className="animate-spin text-[#6e7781]" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ScrollArea className="max-h-48">
                      {searchResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-2 flex justify-between items-center cursor-pointer hover:bg-[#f6f8fa]"
                          onClick={() => addMember(user)}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-[#d0d7de]">
                              <AvatarImage
                                src={user.photo || "/placeholder.svg"}
                                alt={user.name}
                              />
                              <AvatarFallback className="bg-[#f6f8fa] text-[#24292f]">
                                {user.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[#24292f]">
                                {user.name}
                              </p>
                              <p className="text-[#6e7781] text-xs">
                                @
                                {user.username ||
                                  user.name.toLowerCase().replace(/\s+/g, "_")}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#0969da] hover:bg-[#ddf4ff] hover:text-[#0969da]"
                          >
                            Add
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  ) : shouldShowNoUsersFound() ? (
                    <div className="py-4 text-center text-[#6e7781]">
                      <p>No users found</p>
                      <p className="text-xs mt-1">Try different search terms</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}

            {selectedMembers.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium text-sm text-[#24292f]">
                  Selected Members ({selectedMembers.length})
                </h3>
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="p-2 flex justify-between items-center rounded-md border border-[#d0d7de] bg-[#f6f8fa]"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-[#d0d7de]">
                        <AvatarImage
                          src={member.photo || "/placeholder.svg"}
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-[#f6f8fa] text-[#24292f]">
                          {member.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-[#24292f]">
                          {member.name}
                        </p>
                        <p className="text-[#6e7781] text-xs">
                          @
                          {member.username ||
                            member.name.toLowerCase().replace(/\s+/g, "_")}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#cf222e] hover:bg-[#ffebe9] hover:text-[#cf222e]"
                      onClick={() => removeMember(member.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {errors.submission && (
          <div className="p-3 rounded-md bg-[#ffebe9] text-[#cf222e] text-sm border border-[#cf222e]">
            {errors.submission}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-[#2da44e] hover:bg-[#2c974b] text-white border-none focus:ring-2 focus:ring-[#2da44e] focus:ring-offset-2 focus:ring-offset-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating and Analyzing Project...
            </>
          ) : (
            "Create Project"
          )}
        </Button>
      </form>
    </div>
  );
}
