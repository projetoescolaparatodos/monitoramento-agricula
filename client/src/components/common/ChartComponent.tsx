import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ChartComponentProps {
  chartType: string;
  chartData: ChartData;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ chartType, chartData }) => {
  if (!chartData || !chartData.labels || !chartData.datasets) {
    return <div>Não há dados para exibir</div>;
  }

  const colors = [
    "#8BC34A",
    "#2E7D32",
    "#4DB6AC",
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
          <LineChart width={600} height={300} data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
          <BarChart width={600} height={300} data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
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
              />
            ))}
          </BarChart>
        );
      default:
        return <div>Tipo de gráfico não suportado</div>;
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      {renderChart()}
    </div>
  );
};

export default ChartComponent;