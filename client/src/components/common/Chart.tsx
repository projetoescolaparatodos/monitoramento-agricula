
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartProps {
  chartData: any[];
  chartType: string;
  options?: any;
}

export const Chart: React.FC<ChartProps> = ({ chartData: data, chartType: type, options }) => {
  if (!data || !type || !Array.isArray(data) || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">Dados do gráfico não disponíveis</div>;
  }
  console.log("Rendering chart with:", { type, data });
  const colors = ['#8884d8', '#82ca9d', '#ffc658'];

  switch (type) {
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      );
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" />
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

export default Chart;
