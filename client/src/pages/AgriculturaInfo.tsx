
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { db } from "../utils/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Map } from "lucide-react";
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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AgriculturaInfo = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [sectorInfo, setSectorInfo] = useState({
    description: "",
    goals: "",
    achievements: "",
    mediaUrls: []
  });
  const [chartData, setChartData] = useState({
    activities: [],
    areas: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch sector info
        const sectorDoc = await getDoc(doc(db, "setores", "agricultura"));
        if (sectorDoc.exists()) {
          setSectorInfo(sectorDoc.data());
        }

        // Fetch chart data
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const data = querySnapshot.docs.map(doc => doc.data());
        
        // Process data for charts
        const activityCount = data.reduce((acc, item) => {
          acc[item.atividade] = (acc[item.atividade] || 0) + 1;
          return acc;
        }, {});

        const areaData = data.reduce((acc, item) => {
          acc[item.fazenda] = (acc[item.fazenda] || 0) + Number(item.areaTrabalhada || 0);
          return acc;
        }, {});

        setChartData({
          activities: Object.entries(activityCount).map(([name, value]) => ({ name, value })),
          areas: Object.entries(areaData).map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
        });

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

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Distribuição de Atividades</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.activities}
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.activities.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Área Trabalhada por Fazenda</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.areas}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" name="Área (ha)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {sectorInfo.mediaUrls && sectorInfo.mediaUrls.length > 0 && (
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
