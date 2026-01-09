"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TooltipProps } from "recharts";
import { PieChartIcon } from "lucide-react";

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const category = data.payload?.category || data.name || "Unknown";
    const value = data.value || 0;

    return (
      <div className="bg-white/95 backdrop-blur-sm border border-slate-200 shadow-xl p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload?.color }}
          />
          <p className="font-semibold text-slate-800 text-sm">{category}</p>
        </div>
        <p className="text-slate-600 text-sm">
          Count: <span className="font-bold text-slate-800">{value}</span>
        </p>
      </div>
    );
  }
  return null;
};

interface chartDatatype {
  category: string;
  value: number;
  color: string;
}

const NoCodeSmell = {
  category: "No Code Smell",
  value: 1,
  color: "#94a3b8",
};

export default function CodeSmellPieChart({
  chartData = [NoCodeSmell],
}: {
  chartData: chartDatatype[];
}) {
  const [isMobile, setIsMobile] = useState(false);

  const codeSmellTypes = chartData.length > 0 ? chartData : [NoCodeSmell];
  const totalSmells = codeSmellTypes.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 overflow-hidden border-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/20">
            <PieChartIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              Code Smell Distribution
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown by category
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Chart */}
          <div className="h-[350px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={codeSmellTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={isMobile ? 100 : 120}
                  innerRadius={isMobile ? 60 : 75}
                  dataKey="value"
                  cornerRadius={8}
                  paddingAngle={2}
                  nameKey="category"
                  label={({ category, percent }) =>
                    isMobile
                      ? `${(percent * 100).toFixed(0)}%`
                      : `${category} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={!isMobile}
                >
                  {codeSmellTypes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="lg:w-64 flex flex-col justify-center">
            <div className="space-y-3">
              {codeSmellTypes.map((entry, index) => {
                const percentage =
                  totalSmells > 0
                    ? ((entry.value / totalSmells) * 100).toFixed(1)
                    : "0";
                return (
                  <div
                    key={`legend-${index}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-4 w-4 rounded-lg shadow-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {entry.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-800 dark:text-white">
                        {entry.value}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total Summary */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Issues
                </span>
                <span className="text-lg font-bold text-slate-800 dark:text-white">
                  {totalSmells.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
