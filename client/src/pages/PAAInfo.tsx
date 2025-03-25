
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { db } from "../utils/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";
import { Loader2, Map } from "lucide-react";

const PAAInfo = () => {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [alimentosData, setAlimentosData] = useState([]);
  const [producaoData, setProducaoData] = useState([]);
  const [sectorInfo, setSectorInfo] = useState({
    description: "",
    goals: "",
    achievements: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chart data
        const querySnapshot = await getDocs(collection(db, "paa"));
        const data = querySnapshot.docs.map(doc => doc.data());
        
        // Process data for charts...
        
        // Fetch sector info
        const sectorDoc = await getDoc(doc(db, "setores", "paa"));
        if (sectorDoc.exists()) {
          setSectorInfo(sectorDoc.data());
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

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="prose max-w-none mb-8">
        <h1 className="text-3xl font-bold mb-6">Programa de Aquisição de Alimentos (PAA)</h1>
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Sobre o Programa</h2>
          <p className="mb-4">{sectorInfo.description}</p>
          
          <h2 className="text-xl font-semibold mb-4">Objetivos</h2>
          <p className="mb-4">{sectorInfo.goals}</p>
          
          <h2 className="text-xl font-semibold mb-4">Realizações</h2>
          <p className="mb-4">{sectorInfo.achievements}</p>
          
          <Button 
            className="flex items-center gap-2"
            onClick={() => setLocation("/paa/mapa")}
          >
            <Map className="w-4 h-4" />
            Ver no Mapa
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Alimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alimentosData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produção por Localidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={producaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="localidade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#82ca9d" name="Quantidade (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PAAInfo;
