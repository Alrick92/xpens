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
  "#5C6B4F",
  "#8B7355",
  "#A3B18A",
  "#C4B7A0",
  "#7C7868",
  "#3A4A2E",
  "#B09070",
  "#D4CFC7",
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
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border border-border rounded-xl lg:col-span-2">
        <div className="p-6 flex justify-between items-center">
          <h3 className="text-sm font-medium">
            Expense Trends <span className="text-muted-foreground font-normal">(Last 30 Days)</span>
          </h3>
          <div className="flex gap-1">
            {(["Day", "Week", "Month"] as const).map((label) => (
              <button
                key={label}
                className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                  timeRange === label
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <CardContent className="pb-6">
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
            <p className="text-center text-muted-foreground py-8">
              No spending data yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border rounded-xl">
        <div className="p-6">
          <h3 className="text-sm font-medium">Category Breakdown</h3>
        </div>
        <CardContent className="pb-6">
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
                    <span className="text-xl font-semibold block">{totalFormatted}</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 w-full space-y-3">
                {categoryData.map((cat, index) => {
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
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <span className="text-xs font-medium">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No category data yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
