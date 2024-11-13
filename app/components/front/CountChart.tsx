"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CountChart = ({ male, female }: { male: number; female: number }) => {
  const data = [
    {
      name: "Total",
      count: male + female,
      fill: "white",
    },
    {
      name: "Female",
      count: female,
      fill: "rgba(196, 190, 225, 0.8)",
    },
    {
      name: "male",
      count: male,
      fill: "#9a8bc2",
    },
  ];

  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      <Icon icon="mdi:gender-male-female" 
      width="50" 
      height="50"  
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
    </div>
  );
};
export default CountChart;