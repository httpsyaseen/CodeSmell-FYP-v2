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
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
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
      <div className="flex items-center justify-center h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
          <p className="text-sm text-slate-500">Loading report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-8">
      {/* Analyzing Dialog */}
      <Dialog open={showAnalyzingDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-0 shadow-2xl bg-white p-0 overflow-hidden rounded-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
            <div className="relative p-8 flex flex-col items-center justify-center space-y-6">
              <div className="relative w-28 h-28">
                <div
                  className="absolute inset-0 border-4 border-blue-200 rounded-full animate-spin"
                  style={{ animationDuration: "3s" }}
                ></div>
                <div
                  className="absolute inset-3 border-4 border-indigo-200 rounded-full animate-ping"
                  style={{ animationDuration: "2s" }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                    <Brain className="h-10 w-10 text-white" />
                    <Sparkles className="h-5 w-5 text-yellow-300 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">
                  Analyzing Your Project
                </h3>
                <p className="text-slate-500 max-w-sm">
                  Our AI is detecting code smells and analyzing your updated
                  project...
                </p>
              </div>
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

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-5">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Link href="/projects">
                <button className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
              </Link>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-slate-800">
                    {project?.title}
                  </h1>
                  <Badge className="bg-blue-100 text-blue-700 border-0 px-2.5 py-0.5 text-xs font-medium rounded-full">
                    v{project?.latestVersion?.version}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">
                  Code smell analysis report
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-32 rounded-lg border-slate-200"
                >
                  <DropdownMenuItem onClick={downloadJson} className="text-sm">
                    JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={downloadCsv} className="text-sm">
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-sm font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Update
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border border-slate-200 shadow-xl rounded-2xl p-0 w-full max-w-md">
                  <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <DialogTitle className="text-lg font-semibold text-slate-800">
                      Upload Project Update
                    </DialogTitle>
                  </DialogHeader>
                  <div className="p-6">
                    <div className="mb-4">
                      <Label
                        htmlFor="projectFile"
                        className="text-sm font-medium text-slate-700 mb-2 block"
                      >
                        Project Zip File
                      </Label>
                      <Input
                        id="projectFile"
                        type="file"
                        accept=".zip"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        className="border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </div>
                    {file && (
                      <p className="text-sm text-slate-600 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        {file.name}
                      </p>
                    )}
                    <DialogTrigger asChild>
                      <Button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="w-full h-10 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg shadow-lg shadow-blue-500/25"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload Project"}
                      </Button>
                    </DialogTrigger>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
                onClick={goToEditor}
              >
                <Code2 className="mr-2 h-4 w-4" />
                Code
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 text-sm font-medium text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-lg"
                onClick={goToSettings}
              >
                <Cog className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border border-slate-200 rounded-xl py-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">
                  Total Files
                </span>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {project?.latestVersion?.report?.totalFiles || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl py-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">
                  Code Smells
                </span>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Bug className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {project?.latestVersion?.report?.totalSmells || 0}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl py-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">
                  Affected Files
                </span>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <FileWarning className="h-4 w-4 text-rose-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {project?.latestVersion?.report?.AffectedFiles || 0}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {Math.round(
                  ((project?.latestVersion?.report?.AffectedFiles ?? 0) /
                    (project?.latestVersion?.report?.totalFiles ?? 1)) *
                    100
                )}
                % of total
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 rounded-xl py-0 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-500">
                  Code Quality
                </span>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-slate-800">
                {project?.qualityScore || 0}%
              </div>
              <div className="mt-2 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    (project?.qualityScore || 0) >= 80
                      ? "bg-emerald-500"
                      : (project?.qualityScore || 0) >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${project?.qualityScore || 0}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart section */}
        <Card className="bg-white border border-slate-200 rounded-xl py-0 overflow-hidden">
          <CardContent className="p-6">
            <CodeSmellPieChart
              chartData={project?.latestVersion?.report?.chartData}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
