import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
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
import Upload from "@/components/Upload";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

interface ChartData {
  name: string;
  value: number;
}

interface SectorInfo {
  description?: string;
  goals?: string;
  achievements?: string;
  mediaUrls?: string[];
  chartData?: ChartData[];
}

interface SectorData {
  agricultura: SectorInfo;
  pesca: SectorInfo;
  paa: SectorInfo;
}

function Gestor() {
  const { toast } = useToast();
  const [sectorInfo, setSectorInfo] = useState<SectorData>({
    agricultura: {},
    pesca: {},
    paa: {},
  });
  const [selectedSector, setSelectedSector] =
    useState<keyof SectorData>("agricultura");
  const [chartType, setChartType] = useState<"bar" | "pie">("bar");
  const [chartDataState, setChartDataState] = useState<ChartData[]>([]);
  const [chartTitle, setChartTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchSectorInfoAndChartData = async () => {
      try {
        const sectors: (keyof SectorData)[] = ["agricultura", "pesca", "paa"];
        const info = { ...sectorInfo };

        for (const sector of sectors) {
          const sectorRef = doc(db, "setores", sector);
          const sectorSnap = await getDoc(sectorRef);

          if (sectorSnap.exists()) {
            const data = sectorSnap.data();
            info[sector] = {
              description: data.description || undefined,
              goals: data.goals || undefined,
              achievements: data.achievements || undefined,
              mediaUrls: data.mediaUrls || undefined,
              chartData: data.chartData || undefined,
            };
          }
        }
        setSectorInfo(info);

        const docRef = doc(db, "estatisticas", selectedSector);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setChartDataState(data.chartData || []);
          setChartTitle(data.chartTitle || "");
          setChartType(data.chartType || "bar");
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

  const handleChartDataChange = (
    index: number,
    field: keyof ChartData,
    value: string | number,
  ) => {
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

  const removeChartDataPoint = (index: number) => {
    setChartDataState((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      const batch = writeBatch(db);
      const sectorRef = doc(db, "setores", selectedSector);
      const statsRef = doc(db, "estatisticas", selectedSector);

      // Cria objeto apenas com campos que têm valores
      const sectorUpdateData: Record<string, any> = {};
      const statsUpdateData: Record<string, any> = {};

      if (sectorInfo[selectedSector].description !== undefined) {
        sectorUpdateData.description = sectorInfo[selectedSector].description;
      }
      if (sectorInfo[selectedSector].goals !== undefined) {
        sectorUpdateData.goals = sectorInfo[selectedSector].goals;
      }
      if (sectorInfo[selectedSector].achievements !== undefined) {
        sectorUpdateData.achievements = sectorInfo[selectedSector].achievements;
      }
      if (sectorInfo[selectedSector].mediaUrls !== undefined) {
        sectorUpdateData.mediaUrls = sectorInfo[selectedSector].mediaUrls;
      }
      if (chartDataState.length > 0) {
        sectorUpdateData.chartData = chartDataState;
        statsUpdateData.chartData = chartDataState;
      }

      if (chartTitle) {
        statsUpdateData.chartTitle = chartTitle;
      }
      if (chartType) {
        statsUpdateData.chartType = chartType;
      }

      // Só atualiza se houver dados para atualizar
      if (Object.keys(sectorUpdateData).length > 0) {
        batch.update(sectorRef, sectorUpdateData);
      }

      if (Object.keys(statsUpdateData).length > 0) {
        batch.set(statsRef, statsUpdateData, { merge: true });
      }

      await batch.commit();

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar dados",
        variant: "destructive",
      });
    }
  };

  const handleChange = (
    sector: keyof SectorData,
    field: keyof SectorInfo,
    value: string | string[],
  ) => {
    setSectorInfo((prev) => ({
      ...prev,
      [sector]: {
        ...prev[sector],
        [field]: value,
      },
    }));
  };

  const renderChart = () => {
    if (!chartDataState.length) {
      return (
        <div className="text-center py-8">
          Adicione dados para visualizar o gráfico
        </div>
      );
    }

    if (chartType === "pie") {
      return (
        <PieChart width={400} height={400}>
          <Pie
            data={chartDataState}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
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
      <BarChart
        width={500}
        height={300}
        data={chartDataState}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
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
      <Tabs
        defaultValue="agricultura"
        onValueChange={(value) => setSelectedSector(value as keyof SectorData)}
      >
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
                  <Select
                    value={chartType}
                    onValueChange={(value) =>
                      setChartType(value as "bar" | "pie")
                    }
                  >
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
                      <div key={`label-${index}`} className="flex gap-2 mb-2">
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
                      <div key={`value-${index}`} className="flex gap-2 mb-2">
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
                    <ResponsiveContainer width="100%" height="100%">
                      {renderChart()}
                    </ResponsiveContainer>
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
                      value={sectorInfo[selectedSector].description || ""}
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
                      value={sectorInfo[selectedSector].goals || ""}
                      onChange={(e) =>
                        handleChange(selectedSector, "goals", e.target.value)
                      }
                      rows={4}
                    />
                    <Textarea
                      placeholder="Realizações"
                      value={sectorInfo[selectedSector].achievements || ""}
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
                      onUploadStart={() => setIsUploading(true)}
                      onUploadComplete={(urls) => {
                        setIsUploading(false);
                        if (urls.length > 0) {
                          handleChange(selectedSector, "mediaUrls", [
                            ...(sectorInfo[selectedSector].mediaUrls || []),
                            ...urls,
                          ]);
                          toast({
                            title: "Upload concluído",
                            description: `${urls.length} arquivo(s) enviado(s) com sucesso`,
                          });
                        }
                      }}
                      onError={(error) => {
                        setIsUploading(false);
                        toast({
                          title: "Erro no upload",
                          description:
                            error.message || "Falha ao enviar arquivos",
                          variant: "destructive",
                        });
                      }}
                    />
                    {isUploading && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Enviando arquivos...
                      </p>
                    )}
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
