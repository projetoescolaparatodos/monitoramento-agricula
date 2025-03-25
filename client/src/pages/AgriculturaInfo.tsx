
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface MediaItem {
  url: string;
  title: string;
  description: string;
}

interface ChartTemplate {
  title: string;
  description: string;
  data: ChartData[];
  type: "bar" | "pie";
}

interface ChartData {
  name: string;
  value: number;
}

const AgriculturaInfo = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [sectorInfo, setSectorInfo] = useState({
    description: "",
    goals: "",
    achievements: "",
    mediaItems: [] as MediaItem[],
    methodology: "",
    results: "",
    additionalCharts: [] as ChartTemplate[]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorDoc = await getDoc(doc(db, "setores", "agricultura"));
        if (sectorDoc.exists()) {
          const data = sectorDoc.data();
          setSectorInfo({
            description: data.description || "",
            goals: data.goals || "",
            achievements: data.achievements || "",
            mediaItems: data.mediaItems || [],
            methodology: data.methodology || "",
            results: data.results || "",
            additionalCharts: data.additionalCharts || []
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderChart = (chart: ChartTemplate) => {
    if (chart.type === "pie") {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chart.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {chart.data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chart.data}>
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

  if (loading) {
    return <div className="container mx-auto p-4 pt-20">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="prose max-w-none">
        <h1 className="text-3xl font-bold mb-6">Agricultura</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sobre o Setor</h2>
            <p className="mb-4">{sectorInfo.description}</p>
            
            <h2 className="text-xl font-semibold mb-4">Objetivos</h2>
            <p className="mb-4">{sectorInfo.goals}</p>
            
            <h2 className="text-xl font-semibold mb-4">Realizações</h2>
            <p className="mb-4">{sectorInfo.achievements}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Metodologia</h3>
                <p>{sectorInfo.methodology}</p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Resultados</h3>
                <p>{sectorInfo.results}</p>
              </div>
            </div>

            <Button 
              className="flex items-center gap-2 mt-6"
              onClick={() => setLocation("/agricultura/mapa")}
            >
              <Map className="w-4 h-4" />
              Ver no Mapa
            </Button>
          </CardContent>
        </Card>

        {sectorInfo.additionalCharts?.map((chart, index) => (
          <Card key={index} className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">{chart.title}</h2>
              <p className="mb-4">{chart.description}</p>
              {renderChart(chart)}
            </CardContent>
          </Card>
        ))}

        {sectorInfo.mediaItems?.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Galeria de Mídia</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sectorInfo.mediaItems.map((item, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="p-3 bg-gray-50">
                      <h4 className="font-medium">{item.title}</h4>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                    <div className="p-2">
                      {item.url.includes("/video/") || item.url.includes("/video/upload/") ? (
                        <video src={item.url} controls className="w-full h-48 object-contain" />
                      ) : (
                        <img 
                          src={item.url} 
                          alt={item.title || `Mídia ${index + 1}`}
                          className="w-full h-48 object-contain"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgriculturaInfo;
