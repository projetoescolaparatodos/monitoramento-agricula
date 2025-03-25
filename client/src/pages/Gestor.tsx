import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
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

function Gestor() {
  const { toast } = useToast();
  const [sectorInfo, setSectorInfo] = useState({
    agricultura: {
      description: "",
      goals: "",
      achievements: "",
      mediaUrls: [],
      chartData: [],
    },
    pesca: {
      description: "",
      goals: "",
      achievements: "",
      mediaUrls: [],
      chartData: [],
    },
    paa: {
      description: "",
      goals: "",
      achievements: "",
      mediaUrls: [],
      chartData: [],
    },
  });
  const [selectedSector, setSelectedSector] = useState("agricultura");
  const [chartType, setChartType] = useState("bar");
  const [chartDataState, setChartDataState] = useState([]);
  const [chartTitle, setChartTitle] = useState("");

  useEffect(() => {
    const fetchSectorInfoAndChartData = async () => {
      const sectors = ["agricultura", "pesca", "paa"];
      const info = { ...sectorInfo };

      for (const sector of sectors) {
        const sectorRef = doc(db, "setores", sector);
        const sectorSnap = await getDoc(sectorRef);
        if (sectorSnap.exists()) {
          info[sector] = {
            ...sectorSnap.data(),
            chartData: sectorSnap.data().chartData || [],
          };
        }
      }
      setSectorInfo(info);

      try {
        const docRef = doc(db, "estatisticas", selectedSector);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setChartDataState(data.chartData || []);
          setChartTitle(data.chartTitle || "");
          setChartType(data.chartType || "bar");
        } else {
          // Initialize document if it doesn't exist
          await setDoc(docRef, {
            chartData: [],
            chartTitle: "",
            chartType: "bar",
          });
          setChartDataState([]);
          setChartTitle("");
          setChartType("bar");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados",
          variant: "destructive",
        });
      }
    };

    fetchSectorInfoAndChartData();
  }, [selectedSector]);

  const handleChartDataChange = (index, field, value) => {
    setChartDataState((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: field === "value" ? Number(value) : value }
          : item,
      ),
    );
  };

  const addChartDataPoint = () => {
    setChartDataState((prev) => [...prev, { name: "", value: 0 }]);
  };

  const removeChartDataPoint = (index) => {
    setChartDataState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "estatisticas", selectedSector), {
        chartData: chartDataState,
        chartTitle,
        chartType,
      });
      await updateDoc(doc(db, "setores", selectedSector), {
        chartData: chartDataState,
      }); //Update chartData in setores collection
      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados",
        variant: "destructive",
      });
    }
  };

  const handleChange = (sector, field, value) => {
    setSectorInfo((prev) => ({
      ...prev,
      [sector]: {
        ...prev[sector],
        [field]: value,
      },
    }));
  };

  const renderChart = () => {
    if (chartType === "pie") {
      return (
        <PieChart>
          <Pie
            data={chartDataState}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name, percent }) =>
              `${name} (${(percent * 100).toFixed(0)}%)`
            }
          >
            {chartDataState.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      );
    }

    return (
      <BarChart data={chartDataState}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    );
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
              <CardTitle>
                Editar Estatísticas - {selectedSector.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Título do Gráfico</Label>
                  <Input
                    value={chartTitle}
                    onChange={(e) => setChartTitle(e.target.value)}
                    placeholder="Digite o título do gráfico"
                    className="mb-4"
                  />
                </div>

                <div>
                  <Label>Tipo de Gráfico</Label>
                  <Select value={chartType} onValueChange={setChartType}>
                    <SelectTrigger className="w-[180px] mb-4">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Gráfico de Barras</SelectItem>
                      <SelectItem value="pie">Gráfico de Pizza</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rótulos</Label>
                    {chartDataState.map((data, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          value={data.name}
                          onChange={(e) =>
                            handleChartDataChange(index, "name", e.target.value)
                          }
                          placeholder={`Rótulo ${index + 1}`}
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => removeChartDataPoint(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div>
                    <Label>Valores</Label>
                    {chartDataState.map((data, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          type="number"
                          value={data.value}
                          onChange={(e) =>
                            handleChartDataChange(
                              index,
                              "value",
                              e.target.value,
                            )
                          }
                          placeholder={`Valor ${index + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={addChartDataPoint}
                  className="w-full mb-4"
                >
                  Adicionar Novo Ponto
                </Button>

                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="text-lg font-medium mb-4">Pré-visualização</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>{renderChart()}</ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Informações do Setor
                    </h3>
                    <Textarea
                      className="mb-2"
                      placeholder="Descrição"
                      value={sectorInfo[selectedSector].description}
                      onChange={(e) =>
                        handleChange(
                          selectedSector,
                          "description",
                          e.target.value,
                        )
                      }
                      rows={4}
                    />
                    <Textarea
                      className="mb-2"
                      placeholder="Objetivos"
                      value={sectorInfo[selectedSector].goals}
                      onChange={(e) =>
                        handleChange(selectedSector, "goals", e.target.value)
                      }
                      rows={4}
                    />
                    <Textarea
                      placeholder="Realizações"
                      value={sectorInfo[selectedSector].achievements}
                      onChange={(e) =>
                        handleChange(
                          selectedSector,
                          "achievements",
                          e.target.value,
                        )
                      }
                      rows={4}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Upload de Mídia
                    </h3>
                    <Upload
                      folder={`setores/${selectedSector}/media`}
                      onUploadComplete={(urls) => {
                        handleChange(selectedSector, "mediaUrls", [
                          ...(sectorInfo[selectedSector].mediaUrls || []),
                          ...urls,
                        ]);
                      }}
                    />
                  </div>
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
