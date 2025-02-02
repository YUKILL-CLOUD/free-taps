"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AppointmentData {
  date: string;
  pending: number;
  scheduled: number;
  completed: number;
  missed: number;
}

interface AppointmentAreaChartProps {
  data: AppointmentData[];
}

export function AppointmentAreaChart({ data }: AppointmentAreaChartProps) {
  const [timeRange, setTimeRange] = React.useState("90d")

  // Debug data
  React.useEffect(() => {
    console.log("Original Data:", data);
  }, [data]);

  const filteredData = data.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  // Debug filtered data
  React.useEffect(() => {
    console.log("Filtered Data:", filteredData);
  }, [filteredData]);

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Appointment Statistics</CardTitle>
          <CardDescription>
            Showing appointment trends over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="fillPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillScheduled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toFixed(0)}
              />
              <Tooltip
                formatter={(value: number) => [value.toFixed(0), ""]}
                labelFormatter={(label) => {
                  const date = new Date(label)
                  return date.toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                }}
              />
              <Legend />
              <Area
                name="Pending"
                dataKey="pending"
                type="monotone"
                fill="url(#fillPending)"
                stroke="hsl(var(--chart-1))"
                stackId="a"
              />
              <Area
                name="Scheduled"
                dataKey="scheduled"
                type="monotone"
                fill="url(#fillScheduled)"
                stroke="hsl(var(--chart-2))"
                stackId="a"
              />
              <Area
                name="Completed"
                dataKey="completed"
                type="monotone"
                fill="url(#fillCompleted)"
                stroke="hsl(var(--chart-3))"
                stackId="a"
              />
              <Area
                name="Missed"
                dataKey="missed"
                type="monotone"
                fill="url(#fillMissed)"
                stroke="hsl(var(--chart-4))"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 