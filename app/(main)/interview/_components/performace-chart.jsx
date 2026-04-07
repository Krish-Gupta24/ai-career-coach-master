"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const chartData = useMemo(() => {
    if (!assessments?.length) return [];
    const chronological = [...assessments].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    );
    return chronological.map((assessment, index) => ({
      order: index + 1,
      label: format(new Date(assessment.createdAt), "d MMM"),
      fullDate: format(new Date(assessment.createdAt), "PPp"),
      score: Number(assessment.quizScore.toFixed(1)),
    }));
  }, [assessments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>
          Quiz scores over time (oldest → newest, left to right)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!chartData.length ? (
          <div className="flex h-[280px] items-center justify-center rounded-lg border border-dashed bg-muted/30 px-4">
            <p className="text-center text-sm text-muted-foreground">
              Complete a quiz to see your score trend here.
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 12, right: 12, left: -8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="order"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `#${v}`}
                />
                <YAxis
                  domain={[0, 100]}
                  width={44}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const row = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="text-sm font-semibold">
                          {row.score}% score
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.fullDate}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Quiz {row.order} of {chartData.length}
                        </p>
                      </div>
                    );
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{
                    r: 4,
                    fill: "hsl(var(--background))",
                    stroke: "hsl(var(--primary))",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
