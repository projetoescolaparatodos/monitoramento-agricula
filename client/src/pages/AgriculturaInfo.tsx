
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Map } from "lucide-react";
import { db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const AgriculturaInfo = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [sectorInfo, setSectorInfo] = useState({
    description: "",
    goals: "",
    achievements: "",
    mediaUrls: [] as string[],
  });
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sector info
        const sectorDoc = await getDoc(doc(db, "setores", "agricultura"));
        if (sectorDoc.exists()) {
          const data = sectorDoc.data();
          setSectorInfo({
            description: data.description || "",
            goals: data.goals || "",
            achievements: data.achievements || "",
            mediaUrls: data.mediaUrls || [],
          });
        }

        // Fetch chart data
        const statsDoc = await getDoc(doc(db, "estatisticas", "agricultura"));
        if (statsDoc.exists()) {
          const data = statsDoc.data();
          setChartData(data.chartData || []);
          setChartTitle(data.chartTitle || "");
          setChartType(data.chartType || "bar");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderChart = () => {
    if (!chartData?.length) return null;

    if (chartType === "pie") {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name} (${(percent * 100).toFixed(0)}%)`
              }
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="prose max-w-none mb-8">
        <h1 className="text-3xl font-bold mb-6">Agricultura</h1>
        
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Sobre o Setor</h2>
          <p className="mb-4">{sectorInfo.description}</p>
          
          <h2 className="text-xl font-semibold mb-4">Objetivos</h2>
          <p className="mb-4">{sectorInfo.goals}</p>
          
          <h2 className="text-xl font-semibold mb-4">Realizações</h2>
          <p className="mb-4">{sectorInfo.achievements}</p>

          <Button 
            className="flex items-center gap-2"
            onClick={() => setLocation("/agricultura/mapa")}
          >
            <Map className="w-4 h-4" />
            Ver no Mapa
          </Button>
        </div>

        {chartData?.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">{chartTitle || "Estatísticas"}</h2>
            {renderChart()}
          </Card>
        )}

        {sectorInfo.mediaUrls?.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Galeria de Mídia</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sectorInfo.mediaUrls.map((url, index) => (
                url.includes('video') ? (
                  <video 
                    key={index}
                    src={url}
                    controls
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <img
                    key={index}
                    src={url}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgriculturaInfo;
