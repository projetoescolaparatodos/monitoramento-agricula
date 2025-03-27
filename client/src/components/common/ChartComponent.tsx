import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from "recharts";
import { ChartData } from "@/types";

interface ChartComponentProps {
  chartType: string;
  chartData: ChartData;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ chartType, chartData }) => {
  const colors = [
    "#8BC34A", // primary
    "#2E7D32", // secondary
    "#4DB6AC", // accent
    "#81C784",
    "#A5D6A7",
    "#C8E6C9"
  ];

  const formattedData = chartData.labels.map((label, index) => {
    const dataPoint: Record<string, any> = { name: label };
    chartData.datasets.forEach((dataset, datasetIndex) => {
      const dataKey = dataset.label || `data${datasetIndex}`;
      dataPoint[dataKey] = dataset.data[index];
    });
    return dataPoint;
  });

  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ marginTop: "10px" }} />
            {chartData.datasets.map((dataset, index) => (
              <Line
                key={index}
                type="monotone"
                dataKey={dataset.label || `data${index}`}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ marginTop: "10px" }} />
            {chartData.datasets.map((dataset, index) => (
              <Bar
                key={index}
                dataKey={dataset.label || `data${index}`}
                fill={colors[index % colors.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );

      case "horizontalBar":
        return (
          <BarChart layout="vertical" data={formattedData} margin={{ top: 5, right: 30, left: 80, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend wrapperStyle={{ marginTop: "10px" }} />
            {chartData.datasets.map((dataset, index) => (
              <Bar
                key={index}
                dataKey={dataset.label || `data${index}`}
                fill={colors[index % colors.length]}
                radius={[0, 4, 4, 0]}
              />
            ))}
          </BarChart>
        );
      case "pie":
        return (
          <PieChart>
            {chartData.datasets.map((dataset, datasetIndex) => (
              <Pie
                key={datasetIndex}
                data={chartData.labels.map((label, index) => ({
                  name: label,
                  value: dataset.data[index]
                }))}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill={colors[0]}
                dataKey="value"
              >
                {chartData.labels.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            ))}
            <Tooltip />
            <Legend wrapperStyle={{ marginTop: "10px" }} />
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral-dark">Tipo de gráfico não suportado</p>
          </div>
        );
    }
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default ChartComponent;