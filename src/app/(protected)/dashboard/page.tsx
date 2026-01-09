"use client";

import { DashboardCards } from "@/components/dashbaord/dashboard-cards";
import { Activity } from "lucide-react";
import React from "react";

export default function page() {
  return (
    <main className="p-6 w-full min-w-full bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-2xl text-slate-800 dark:text-white">
              Dashboard
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Monitor your code health and quality metrics
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="w-full">
        <DashboardCards />
      </div>
    </main>
  );
}
