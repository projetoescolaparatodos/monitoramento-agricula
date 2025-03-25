import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { db, storage } from "../utils/firebase";
import { doc, getDoc, updateDoc, setDoc, writeBatch } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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
import { X, UploadCloud } from "lucide-react";
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<FileList | null>(null);

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

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(
          storage,
          `setores/${selectedSector}/media/${Date.now()}_${file.name}`,
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(
                  uploadTask.snapshot.ref,
                );
                uploadedUrls.push(downloadURL);
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          );
        });
      }

      // Atualiza os URLs de mídia no estado
      setSectorInfo((prev) => ({
        ...prev,
        [selectedSector]: {
          ...prev[selectedSector],
          mediaUrls: [
            ...(prev[selectedSector].mediaUrls || []),
            ...uploadedUrls,
          ],
        },
      }));

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao enviar arquivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setFiles(null);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    try {
      const batch = writeBatch(db);
      const sectorRef = doc(db, "setores", selectedSector);
      const statsRef = doc(db, "estatisticas", selectedSector);

      // Verifica se o documento existe
      const sectorSnap = await getDoc(sectorRef);

      // Cria objeto apenas com campos que têm valores
      const sectorUpdateData: Record<string, any> = {
        ...(sectorInfo[selectedSector].description !== undefined && {
          description: sectorInfo[selectedSector].description,
        }),
        ...(sectorInfo[selectedSector].goals !== undefined && {
          goals: sectorInfo[selectedSector].goals,
        }),
        ...(sectorInfo[selectedSector].achievements !== undefined && {
          achievements: sectorInfo[selectedSector].achievements,
        }),
        ...(sectorInfo[selectedSector].mediaUrls !== undefined && {
          mediaUrls: sectorInfo[selectedSector].mediaUrls,
        }),
        ...(chartDataState.length > 0 && { chartData: chartDataState }),
      };

      const statsUpdateData = {
        ...(chartDataState.length > 0 && { chartData: chartDataState }),
        ...(chartTitle && { chartTitle }),
        ...(chartType && { chartType }),
      };

      // Se o documento não existe, cria com os dados
      if (!sectorSnap.exists()) {
        batch.set(sectorRef, sectorUpdateData);
      }
      // Se existe, atualiza
      else {
        if (Object.keys(sectorUpdateData).length > 0) {
          batch.update(sectorRef, sectorUpdateData);
        }
      }

      // Para as estatísticas, usamos merge: true que cria se não existir
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
                    <div className="border-2 border-dashed rounded-lg p-4">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <UploadCloud className="h-8 w-8 text-gray-500" />
                        <input
                          type="file"
                          id="file-upload"
                          multiple
                          onChange={(e) => setFiles(e.target.files)}
                          className="hidden"
                        />
                        <label
                          htmlFor="file-upload"
                          className="text-sm font-medium text-primary hover:underline cursor-pointer"
                        >
                          Selecione os arquivos
                        </label>
                        {files && (
                          <div className="text-sm text-muted-foreground">
                            {files.length} arquivo(s) selecionado(s)
                          </div>
                        )}
                        <Button
                          onClick={handleUpload}
                          disabled={isUploading || !files || files.length === 0}
                        >
                          {isUploading ? "Enviando..." : "Enviar Arquivos"}
                        </Button>
                        {isUploading && (
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                    {sectorInfo[selectedSector].mediaUrls?.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Mídias existentes:
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {sectorInfo[selectedSector].mediaUrls?.map(
                            (url, index) => (
                              <div key={index} className="relative">
                                {url.includes("/video/") ||
                                url.includes("/video/upload/") ? (
                                  <video
                                    src={url}
                                    controls
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                ) : (
                                  <img
                                    src={url}
                                    alt={`Mídia ${index}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                  />
                                )}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
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
