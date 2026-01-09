"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  Code,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  FolderPlus,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CodeSmellPieChart from "./custom-piechart";
import api from "@/lib/api";
import Link from "next/link";

interface DashboardData {
  totalSmells: number;
  totalProjects: number;
  codeQuality: string;
  chartData: {
    category: string;
    value: number;
    color: string;
  }[];
}

export function DashboardCards() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/project/dashboard-stats `);
        console.log(data.data);
        setData(data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setData({
          totalSmells: 465,
          totalProjects: 3,
          codeQuality: "33.16",
          chartData: [{ category: "design", value: 465, color: "#598F43" }],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getQualityLabel = (quality: string) => {
    const value = Number.parseFloat(quality);
    if (value >= 70) return "Excellent";
    if (value >= 40) return "Good";
    return "Needs Work";
  };

  const getQualityGradient = (quality: string) => {
    const value = Number.parseFloat(quality);
    if (value >= 70) return "from-emerald-500 to-green-600";
    if (value >= 40) return "from-amber-500 to-yellow-600";
    return "from-rose-500 to-red-600";
  };

  const getQualityBg = (quality: string) => {
    const value = Number.parseFloat(quality);
    if (value >= 70) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (value >= 40) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  const getSeverity = (value: number) => {
    if (value === 0)
      return {
        label: "None",
        color: "bg-slate-100 text-slate-600",
        icon: Minus,
      };
    if (value < 50)
      return {
        label: "Low",
        color: "bg-emerald-50 text-emerald-700",
        icon: TrendingDown,
      };
    if (value < 100)
      return {
        label: "Medium",
        color: "bg-amber-50 text-amber-700",
        icon: Minus,
      };
    return {
      label: "High",
      color: "bg-rose-50 text-rose-700",
      icon: TrendingUp,
    };
  };

  if (error && !data) {
    return (
      <Alert
        variant="destructive"
        className="mb-6 border-2 border-red-200 bg-red-50 text-red-700 rounded-xl shadow-sm"
      >
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="font-medium">{error}</AlertDescription>
      </Alert>
    );
  }

  const isNewUser = !loading && data?.totalProjects === 0;
  const severity = getSeverity(data?.totalSmells || 0);
  const SeverityIcon = severity.icon;

  // Empty state for new users
  if (isNewUser) {
    return (
      <div className="space-y-8">
        {/* Welcome Card for New Users */}
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />
          <CardContent className="p-8 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Welcome to Code Doctor!
                </h2>
                <p className="text-blue-100 text-lg max-w-xl">
                  Get started by uploading your first project. We&apos;ll
                  analyze your code and help you identify areas for improvement.
                </p>
              </div>
              <Link
                href="/upload"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
              >
                <FolderPlus className="h-5 w-5" />
                Upload Project
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Empty State Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Code Smells Card - Empty */}
          <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 to-slate-500/10 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Code Smells
                  </p>
                  <p className="text-4xl font-bold text-slate-300 dark:text-slate-600 tracking-tight">
                    —
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl shadow-lg">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                No projects analyzed yet
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                  Awaiting first project
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Total Projects Card - Empty */}
          <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 to-slate-500/10 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Total Projects
                  </p>
                  <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                    0
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
                Upload your first project to get started
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                  Add Project
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Code Quality Card - Empty */}
          <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/5 to-slate-500/10 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Code Quality
                  </p>
                  <p className="text-4xl font-bold text-slate-300 dark:text-slate-600 tracking-tight">
                    —<span className="text-2xl">%</span>
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-slate-300 to-slate-400 rounded-xl shadow-lg">
                  <Code className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Empty Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-200 rounded-full w-0" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-500">
                  No data available
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Empty Chart Section */}
        <Card className="border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Code Smell Distribution
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown by category
            </p>
          </div>
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-2xl mb-4">
              <AlertTriangle className="h-10 w-10 text-slate-400" />
            </div>
            <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              No Code Smells Found
            </h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
              Once you upload and analyze your first project, you&apos;ll see a
              breakdown of detected code smells here.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FolderPlus className="h-4 w-4" />
              Upload Your First Project
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Code Smells Card */}
        <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full -translate-y-16 translate-x-16" />
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Code Smells
                  </p>
                  <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                    {data?.totalSmells === 0 ? (
                      <span className="text-emerald-500">0</span>
                    ) : (
                      data?.totalSmells.toLocaleString()
                    )}
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-br ${
                    data?.totalSmells === 0
                      ? "from-emerald-500 to-green-600 shadow-emerald-500/30"
                      : "from-orange-500 to-red-500 shadow-orange-500/30"
                  } rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {data?.totalSmells === 0
                  ? "Your code is clean! No issues detected"
                  : "Issues detected across all projects"}
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  {data?.totalSmells === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                      <Sparkles className="h-3.5 w-3.5" />
                      Clean Code
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${severity.color}`}
                    >
                      <SeverityIcon className="h-3.5 w-3.5" />
                      {severity.label} Severity
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Total Projects Card */}
        <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -translate-y-16 translate-x-16" />
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-4 w-40 rounded-lg" />
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Total Projects
                  </p>
                  <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                    {data?.totalProjects}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                Active projects being monitored
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    All Active
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Code Quality Card */}
        <Card className="group relative overflow-hidden border-0 bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-xl hover:shadow-slate-200/60 dark:hover:shadow-slate-900/60 transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-16 translate-x-16" />
          {loading ? (
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-4 w-32 rounded-lg" />
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
              <Skeleton className="h-10 w-24 mb-2 rounded-lg" />
              <Skeleton className="h-3 w-full rounded-full mt-4" />
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-6 relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Code Quality
                  </p>
                  <p className="text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
                    {Number.parseFloat(data?.codeQuality || "0").toFixed(1)}
                    <span className="text-2xl text-slate-400">%</span>
                  </p>
                </div>
                <div
                  className={`p-3 bg-gradient-to-br ${getQualityGradient(
                    data?.codeQuality || "0"
                  )} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Code className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getQualityGradient(
                      data?.codeQuality || "0"
                    )} rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${data?.codeQuality}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${getQualityBg(
                      data?.codeQuality || "0"
                    )}`}
                  >
                    {getQualityLabel(data?.codeQuality || "0")}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Code Smell Distribution Chart */}
      <div>
        <CodeSmellPieChart chartData={data?.chartData ?? []} />
      </div>
    </div>
  );
}
