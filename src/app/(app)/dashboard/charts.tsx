"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
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
  "#1c1b1b",
  "#5d5e66",
  "#78767b",
  "#a8a6aa",
  "#47464a",
  "#c8c5ca",
  "#313030",
  "#e5e2e1",
];

interface ChartProps {
  categoryData: { name: string; amount: number; count: number }[];
  monthlyData: { month: string; amount: number }[];
}

export function DashboardCharts({ categoryData, monthlyData }: ChartProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border border-border lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Expense Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v: string) => {
                    const [, m] = v.split("-");
                    const months = [
                      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                    ];
                    return months[parseInt(m) - 1] || v;
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]}
                />
                <Bar dataKey="amount" fill="#1c1b1b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No spending data yet
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="amount"
                  nameKey="name"
                  label={(props: { name?: string; percent?: number }) =>
                    `${props.name || ""} (${((props.percent || 0) * 100).toFixed(0)}%)`
                  }
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
                />
              </PieChart>
            </ResponsiveContainer>
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
