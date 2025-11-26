"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TooltipProps } from "recharts";

const CustomTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const category = data.payload?.category || data.name || "Unknown";
    const value = data.value || 0;
    // const percent = data?.percent as any || 0;

    return (
      <div className="bg-white border-2 border-[#d0d7de] shadow-xl p-4 rounded-lg backdrop-blur-sm">
        <p className="font-semibold text-[#24292f] text-sm mb-2">{category}</p>
        <p className="text-[#57606a] text-xs">
          Count: <span className="font-medium text-[#24292f]">{value}</span>
        </p>
        <p className="text-[#57606a] text-xs">
          {/* Percentage:{" "} */}
          <span className="font-medium text-[#0969da]">
            {/* {(percent * 100).toFixed(1)}% */}
          </span>
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
  color: "#d1d5db",
};

export default function CodeSmellPieChart({
  chartData = [NoCodeSmell], // Default dummy value
}: {
  chartData: chartDatatype[];
}) {
  const [isMobile, setIsMobile] = useState(false);

  const codeSmellTypes = chartData.length > 0 ? chartData : [NoCodeSmell];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Define mobile breakpoint
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div className="border border-[#d0d7de] rounded-md overflow-hidden">
      <div className="border-b border-[#d0d7de] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#24292f]">
          Code Smell Distribution
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="h-[400px]  md:flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={codeSmellTypes}
                cx="50%"
                cy="50%"
                outerRadius={isMobile ? 100 : 130}
                innerRadius={isMobile ? 60 : 70}
                dataKey="value"
                cornerRadius={15}
                nameKey="category"
                label={({ category, value, percent }) =>
                  isMobile
                    ? `${(percent * 100).toFixed(0)}%`
                    : `${category} (${value})    ${(percent * 100).toFixed(0)}%`
                }
                labelLine={!isMobile} // Remove label line in mobile
              >
                {codeSmellTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-2 lg:w-48">
          {codeSmellTypes.map((entry, index) => (
            <div
              key={`legend-${index}`}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span>{entry.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
