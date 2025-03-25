import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from 'lucide-react';
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
  Cell
} from "recharts";
import Upload from "@/components/Upload";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function Gestor() {
  const { toast } = useToast();
  const [selectedSector, setSelectedSector] = useState("agricultura");
  const [sectorInfo, setSectorInfo] = useState({
    agricultura: { description: "", goals: "", achievements: "", mediaUrls: [], chartData: [] },
    pesca: { description: "", goals: "", achievements: "", mediaUrls: [], chartData: [] },
    paa: { description: "", goals: "", achievements: "", mediaUrls: [], chartData: [] }
  });
  const [chartData, setChartData] = useState([]);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("bar");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sectorRef = doc(db, "setores", selectedSector);
        const sectorSnap = await getDoc(sectorRef);
        if (sectorSnap.exists()) {
          setSectorInfo(prev => ({ ...prev, [selectedSector]: sectorSnap.data() }));
        }

        const chartRef = doc(db, "estatisticas", selectedSector);
        const chartSnap = await getDoc(chartRef);
        if (chartSnap.exists()) {
          setChartData(chartSnap.data().chartData || []);
          setChartTitle(chartSnap.data().chartTitle || "");
          setChartType(chartSnap.data().chartType || "bar");
        }
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao carregar dados", variant: "destructive" });
      }
    };
    fetchData();
  }, [selectedSector, toast]);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "estatisticas", selectedSector), { chartData, chartTitle, chartType });
      await updateDoc(doc(db, "setores", selectedSector), sectorInfo[selectedSector]);
      toast({ title: "Sucesso", description: "Dados salvos com sucesso!" });
    } catch {
      toast({ title: "Erro", description: "Falha ao salvar dados", variant: "destructive" });
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setSectorInfo(prev => ({
      ...prev,
      [selectedSector]: {
        ...prev[selectedSector],
        mediaUrls: [...(prev[selectedSector].mediaUrls || []), ...urls]
      }
    }));
  };

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Área do Gestor</h1>
      <Tabs defaultValue="agricultura" onValueChange={setSelectedSector}>
        <TabsList className="mb-4">
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
        </TabsList>
        <TabsContent value={selectedSector}>
          <Card>
            <CardHeader>
              <CardTitle>Editar Estatísticas - {selectedSector.toUpperCase()}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Título do Gráfico</Label>
                  <Input value={chartTitle} onChange={(e) => setChartTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>Tipo de Gráfico</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Gráfico de Barras</SelectItem>
                      <SelectItem value="pie">Gráfico de Pizza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição do Setor</Label>
                  <Textarea
                    value={sectorInfo[selectedSector].description}
                    onChange={(e) => setSectorInfo(prev => ({
                      ...prev,
                      [selectedSector]: { ...prev[selectedSector], description: e.target.value }
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Upload de Mídia</Label>
                  <Upload folder={`setores/${selectedSector}/media`} onUploadComplete={handleUploadComplete} />
                </div>
                <Button onClick={handleSave} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Gestor;