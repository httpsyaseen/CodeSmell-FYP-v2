"use client";

import type React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Bug,
  Code2,
  Cog,
  Download,
  FileText,
  FileWarning,
  RefreshCw,
  Shield,
  Upload,
  Brain,
  Sparkles,
} from "lucide-react";
import CodeSmellPieChart from "@/components/dashbaord/custom-piechart";
import api from "@/lib/api";

export default function GitHubReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [project, setProject] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalyzingDialog, setShowAnalyzingDialog] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/project/get-project/${id}`);
        setProject(data.project);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setFile(selectedFile || null);
  };

  const handleUpload = () => {
    if (file) {
      setIsUploading(true);
      setShowAnalyzingDialog(true);
      const formData = new FormData();
      formData.append("project", file);

      api
        .patch(
          `http://localhost:3000/api/v1/project/update-project/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        )
        .then((response) => {
          setProject(response.data.project);
          console.log("File uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
        })
        .finally(() => {
          setIsUploading(false);
          setShowAnalyzingDialog(false);
          setFile(null);
        });
    }
  };

  const goToEditor = () => {
    router.push(`/code-editor/${id}`);
  };

  const goToSettings = () => {
    router.push(`/report/${id}/settings`);
  };

  const downloadJson = () => {
    const smells = project?.latestVersion?.report?.smells;
    const dataStr = JSON.stringify(smells, null, 2); // pretty print
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smells-report.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const smells = project?.latestVersion?.report?.smells;
    if (!smells || smells.length === 0) return;

    const keys = Object.keys(smells[0]); // assume all objects have the same keys
    const csvRows = [
      keys.join(","), // header row
      ...smells.map((row: any) =>
        keys
          .map((key) => `"${(row[key] ?? "").toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smells-report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-[#0969da] border-[#d0d7de]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6 bg-white">
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
                  Our AI is detecting code smells and analyzing your updated
                  project...
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
      {/* Repository-style header */}
      <div className=" border-[#d0d7de] pb-4 mb-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <h1 className="text-2xl font-semibold text-[#24292f]">
              {project?.title}
            </h1>
            <Badge
              variant="outline"
              className="ml-2 text-xs font-medium  text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] px-2 py-0.5 rounded-full"
            >
              version: {project?.latestVersion?.version}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-40">
                <DropdownMenuItem onClick={downloadJson}>JSON</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadCsv}>CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]"
                >
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Update Project
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-[#d0d7de] shadow-lg rounded-md p-0 w-full max-w-md">
                <DialogHeader className="px-4 py-3 border-b border-[#d0d7de] bg-[#f6f8fa]">
                  <DialogTitle className="text-base font-semibold text-[#24292f]">
                    Upload Project Update
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <div className="mb-4">
                    <Label
                      htmlFor="projectFile"
                      className="text-sm font-medium text-[#24292f] mb-1 block"
                    >
                      Project Zip File
                    </Label>
                    <Input
                      id="projectFile"
                      type="file"
                      accept=".zip"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="border-[#d0d7de] focus-visible:ring-[#0969da] focus-visible:border-[#0969da]"
                    />
                  </div>
                  {file && (
                    <p className="text-xs text-[#57606a] mb-4">
                      Selected: {file.name}
                    </p>
                  )}
                  <DialogTrigger asChild>
                    <Button
                      onClick={async () => {
                        await handleUpload();
                      }}
                      disabled={!file || isUploading}
                      className="w-full h-9 text-sm font-medium text-white bg-[#2da44e] hover:bg-[#2c974b]"
                    >
                      <Upload className="mr-1.5 h-3.5 w-3.5" />
                      {isUploading ? "Uploading..." : "Upload Project"}
                    </Button>
                  </DialogTrigger>
                </div>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]"
              onClick={goToEditor}
            >
              <Code2 className="mr-1.5 h-3.5 w-3.5" />
              View Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium text-[#24292f] border-[#d0d7de] bg-[#f6f8fa] hover:bg-[#f3f4f6]"
              onClick={goToSettings}
            >
              <Cog className="mr-1.5 h-3.5 w-3.5" />
              Project Settings
            </Button>
          </div>
        </div>

        {/* GitHub-style navigation tabs */}
        {/* <div className="flex overflow-x-auto -mb-px">
          <div className="border-b-2 border-[#fd8c73] px-4 py-2 text-sm font-medium text-[#24292f]">
            <div className="flex items-center">
              <BarChart2 className="mr-1.5 h-4 w-4" />
              Report
            </div>
          </div>
          <div className="px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#24292f]">
            <div className="flex items-center">
              <Bug className="mr-1.5 h-4 w-4" />
              Code Smells
            </div>
          </div>
          <div className="px-4 py-2 text-sm font-medium text-[#57606a] hover:text-[#24292f]">
            <div className="flex items-center">
              <GitBranch className="mr-1.5 h-4 w-4" />
              History
            </div>
          </div>
        </div> */}
      </div>

      {/* Stats cards in GitHub style */}
      <div className="mb-8">
        {/* <h2 className="text-lg font-semibold text-[#24292f] mb-4">
          Project Overview
        </h2> */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-[#d0d7de] rounded-md p-4 bg-[#f6f8fa]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#57606a]">
                Total Files
              </span>
              <FileText className="h-4 w-4 text-[#57606a]" />
            </div>
            <div className="text-2xl font-semibold text-[#24292f]">
              {project?.latestVersion?.report?.totalFiles || 0}
            </div>
          </div>

          <div className="border border-[#d0d7de] rounded-md p-4 bg-[#f6f8fa]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#57606a]">
                Total Code Smells
              </span>
              <Bug className="h-4 w-4 text-[#d29922]" />
            </div>
            <div className="text-2xl font-semibold text-[#24292f]">
              {project?.latestVersion?.report?.totalSmells || 0}
            </div>
          </div>

          <div className="border border-[#d0d7de] rounded-md p-4 bg-[#f6f8fa]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#57606a]">
                Affected Files
              </span>
              <FileWarning className="h-4 w-4 text-[#cf222e]" />
            </div>
            <div className="text-2xl font-semibold text-[#24292f]">
              {project?.latestVersion?.report?.AffectedFiles || 0}
            </div>
            <p className="text-xs text-[#57606a]">
              {Math.round(
                ((project?.latestVersion?.report?.AffectedFiles ?? 0) /
                  (project?.latestVersion?.report?.totalFiles ?? 1)) *
                  100
              )}
              % of total files
            </p>
          </div>

          <div className="border border-[#d0d7de] rounded-md p-4 bg-[#f6f8fa]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#57606a]">
                Code Quality
              </span>
              <Shield className="h-4 w-4 text-[#2da44e]" />
            </div>
            <div className="text-2xl font-semibold text-[#24292f]">
              {project?.qualityScore || 0}%
            </div>
            <div className="mt-2 bg-[#d0d7de] rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-[#2da44e]"
                style={{ width: `${project?.qualityScore || 0}%` }}
                role="progressbar"
                aria-valuenow={project?.qualityScore || 0}
                aria-valuemin={0}
                aria-valuemax={100}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart section with GitHub styling */}

      <div>
        <CodeSmellPieChart
          chartData={project?.latestVersion?.report?.chartData}
        />
      </div>
    </div>
  );
}
