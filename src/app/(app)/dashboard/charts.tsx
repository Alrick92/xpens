"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#6B7C5E",
  "#8B7355",
  "#A8B89A",
  "#C4876B",
  "#D4B96A",
  "#9E9A90",
];

interface ChartProps {
  categoryData: { name: string; amount: number; count: number }[];
  monthlyData: { month: string; amount: number }[];
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function DashboardCharts({ categoryData, monthlyData }: ChartProps) {
  const [timeRange] = useState<"Day" | "Week" | "Month">("Week");
  const totalAmount = categoryData.reduce((sum, d) => sum + d.amount, 0);
  const totalFormatted = totalAmount >= 1000
    ? `$${(totalAmount / 1000).toFixed(1)}k`
    : `$${totalAmount.toFixed(0)}`;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="border border-border rounded-xl lg:col-span-2">
        <div className="px-4 py-3 flex justify-between items-center">
          <h3 className="text-sm font-semibold">
            Expense Trends <span className="text-muted-foreground font-normal text-xs">(Last 30 Days)</span>
          </h3>
          <div className="flex" role="tablist" aria-label="Time range">
            {(["Day", "Week", "Month"] as const).map((label) => (
              <button
                key={label}
                role="tab"
                aria-selected={timeRange === label}
                className={`px-3 py-1 text-[11px] font-medium transition-colors duration-150 first:rounded-l last:rounded-r focus-ring ${
                  timeRange === label
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="pb-4 px-4">
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6B7C5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6B7C5E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#D4CFC7" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#7C7868" }}
                  tickFormatter={(v: string) => {
                    const [, m] = v.split("-");
                    return MONTH_NAMES[parseInt(m) - 1] || v;
                  }}
                  axisLine={{ stroke: "#D4CFC7" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#7C7868" }}
                  axisLine={{ stroke: "#D4CFC7" }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #D4CFC7",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#5C6B4F"
                  strokeWidth={2}
                  fill="url(#areaFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-full h-[120px] flex items-end justify-center gap-2 mb-3 opacity-20">
                {[40, 65, 50, 80, 60, 45, 70].map((h, i) => (
                  <div key={i} className="w-8 bg-muted-foreground/30 rounded-t" style={{ height: `${h}%` }} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Expense trends will appear here after your first submission.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border rounded-xl">
        <div className="px-4 py-3">
          <h3 className="text-sm font-semibold">Category Breakdown</h3>
        </div>
        <CardContent className="pb-4 px-4">
          {categoryData.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="amount"
                      nameKey="name"
                    >
                      {categoryData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
                      contentStyle={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #D4CFC7",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-base font-semibold block">{totalFormatted}</span>
                    <span className="text-[10px] text-muted-foreground">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 w-full space-y-2">
                {categoryData.slice(0, 5).map((cat, index) => {
                  const percent = totalAmount > 0
                    ? Math.round((cat.amount / totalAmount) * 100)
                    : 0;
                  return (
                    <div key={cat.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs">{cat.name}</span>
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="relative w-[120px] h-[120px] mb-3 opacity-20">
                <div className="absolute inset-0 rounded-full border-[16px] border-muted-foreground/20" />
              </div>
              <p className="text-xs text-muted-foreground">
                Category data will appear after adding expenses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
