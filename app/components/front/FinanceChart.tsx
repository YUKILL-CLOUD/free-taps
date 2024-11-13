"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AppointmentChartProps {
  data: {
    date: string;
    pending: number;
    scheduled: number;
    completed: number;
    missed: number;
  }[];
}

const AppointmentChart = ({ data }: AppointmentChartProps) => {
  return (
    <div className="bg-white rounded-xl w-full h-full p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Appointment Statistics</h1>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          width={500}
          height={300}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tick={{ fill: "#d1d5db" }}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis 
            axisLine={false} 
            tick={{ fill: "#d1d5db" }} 
            tickLine={false}  
            tickMargin={20}
          />
          <Tooltip />
          <Legend
            align="center"
            verticalAlign="top"
            wrapperStyle={{ paddingTop: "10px", paddingBottom: "30px" }}
          />
          <Line
            type="monotone"
            dataKey="pending"
            stroke="#FFA500"
            strokeWidth={2}
            name="Pending"
          />
          <Line
            type="monotone"
            dataKey="scheduled"
            stroke="#4F46E5"
            strokeWidth={2}
            name="Scheduled"
          />
          <Line
            type="monotone"
            dataKey="completed"
            stroke="#22C55E"
            strokeWidth={2}
            name="Completed"
          />
          <Line
            type="monotone"
            dataKey="missed"
            stroke="#EF4444"
            strokeWidth={2}
            name="Missed"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AppointmentChart;
