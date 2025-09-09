import React from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function BarChartTest() {
  const data = [
    { period: "1-10 Aug", value: 25, color: "#68b97e" },
    { period: "11-20 Aug", value: 45, color: "#3a7a6c" },
    { period: "21-30 Aug", value: 35, color: "#499a79" },
    { period: "31-40 Aug", value: 55, color: "#376a63" },
    { period: "41-50 Aug", value: 25, color: "#68b97e" },
  ];

  return (
    <div className="w-11/12 h-72 p-4 mx-auto rounded-4xl bg-[#f8f8f8] text-gray-100  ">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 30, right: 30, bottom: 5 }}
          barCategoryGap="10%"
        >
          <XAxis
            dataKey="period"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#666666" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: "#212121", fontWeight: "Bold" }}
            domain={[0, 60]}
          />
          <Bar dataKey="value" radius={[8, 8, 8, 8]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
