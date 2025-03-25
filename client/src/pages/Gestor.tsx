
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { storage, db } from "@/utils/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { X, UploadCloud } from "lucide-react";
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

interface ChartData {
  name: string;
  value: number;
}

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

interface SectorInfo {
  description?: string;
  goals?: string;
  achievements?: string;
  mediaItems?: MediaItem[];
  chartData?: ChartData[];
  additionalCharts?: ChartTemplate[];
  methodology?: string;
  results?: string;
}

interface SectorData {
  [key: string]: SectorInfo;
}

export default function Gestor() {
  const { toast } = useToast();
  const [selectedSector, setSelectedSector] = useState("agricultura");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sectorInfo, setSectorInfo] = useState<SectorData>({
    agricultura: {},
    pesca: {},
    paa: {},
  });
  const [chartDataState, setChartDataState] = useState<ChartData[]>([]);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaDescription, setNewMediaDescription] = useState("");
  const [methodology, setMethodology] = useState("");
  const [results, setResults] = useState("");
  const [activeChartIndex, setActiveChartIndex] = useState(0);

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo",
        variant: "destructive",
      });
      return;
    }

    if (!newMediaTitle) {
      toast({
        title: "Erro",
        description: "Informe um título para a mídia",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = ref(
          storage,
          `setores/${selectedSector}/media/${Date.now()}_${file.name}`,
        );
        const uploadTask = uploadBytesResumable(storageRef, file);

        const downloadURL = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            reject,
            async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
          );
        });

        setSectorInfo((prev) => ({
          ...prev,
          [selectedSector]: {
            ...prev[selectedSector],
            mediaItems: [
              ...(prev[selectedSector].mediaItems || []),
              {
                url: downloadURL,
                title: newMediaTitle,
                description: newMediaDescription
              }
            ],
          },
        }));
      }

      toast({
        title: "Sucesso",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });
      
      setNewMediaTitle("");
      setNewMediaDescription("");
      setFiles(null);
    } catch (error) {
      console.error("Erro no upload:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Falha ao enviar arquivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addNewChart = () => {
    setSectorInfo(prev => {
      const currentCharts = prev[selectedSector].additionalCharts || [];
      return {
        ...prev,
        [selectedSector]: {
          ...prev[selectedSector],
          additionalCharts: [
            ...currentCharts,
            {
              title: `Novo Gráfico ${currentCharts.length + 1}`,
              description: "",
              data: [{ name: "", value: 0 }],
              type: "bar"
            }
          ]
        }
      };
    });
  };

  const updateChartData = (chartIndex: number, dataIndex: number, field: keyof ChartData, value: string | number) => {
    setSectorInfo(prev => {
      const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
      updatedCharts[chartIndex].data[dataIndex] = {
        ...updatedCharts[chartIndex].data[dataIndex],
        [field]: field === "value" ? Number(value) : value
      };
      return {
        ...prev,
        [selectedSector]: {
          ...prev[selectedSector],
          additionalCharts: updatedCharts
        }
      };
    });
  };

  const addDataPointToChart = (chartIndex: number) => {
    setSectorInfo(prev => {
      const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
      updatedCharts[chartIndex].data.push({ name: "", value: 0 });
      return {
        ...prev,
        [selectedSector]: {
          ...prev[selectedSector],
          additionalCharts: updatedCharts
        }
      };
    });
  };

  const removeDataPointFromChart = (chartIndex: number, dataIndex: number) => {
    setSectorInfo(prev => {
      const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
      updatedCharts[chartIndex].data = updatedCharts[chartIndex].data.filter((_, i) => i !== dataIndex);
      return {
        ...prev,
        [selectedSector]: {
          ...prev[selectedSector],
          additionalCharts: updatedCharts
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      const batch = writeBatch(db);
      const sectorRef = doc(db, "setores", selectedSector);
      const statsRef = doc(db, "estatisticas", selectedSector);

      const sectorSnap = await getDoc(sectorRef);

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
        ...(sectorInfo[selectedSector].mediaItems !== undefined && {
          mediaItems: sectorInfo[selectedSector].mediaItems,
        }),
        ...(sectorInfo[selectedSector].additionalCharts !== undefined && {
          additionalCharts: sectorInfo[selectedSector].additionalCharts,
        }),
        ...(methodology && { methodology }),
        ...(results && { results }),
        ...(chartDataState.length > 0 && { chartData: chartDataState }),
      };

      batch.set(sectorRef, sectorUpdateData, { merge: true });
      await batch.commit();

      toast({
        title: "Sucesso",
        description: "Dados atualizados com sucesso",
      });
    } catch (error) {
      console.error("Error saving data:", error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados",
        variant: "destructive",
      });
    }
  };

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
              mediaItems: data.mediaItems || data.mediaUrls?.map((url: string) => ({ url, title: "", description: "" })) || undefined,
              additionalCharts: data.additionalCharts || undefined,
              methodology: data.methodology || undefined,
              results: data.results || undefined,
              chartData: data.chartData || undefined,
            };
            
            if (sector === selectedSector) {
              setMethodology(data.methodology || "");
              setResults(data.results || "");
            }
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gerenciamento de Setores</h2>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              {["agricultura", "pesca", "paa"].map((sector) => (
                <Button
                  key={sector}
                  variant={selectedSector === sector ? "default" : "outline"}
                  onClick={() => setSelectedSector(sector)}
                >
                  {sector.toUpperCase()}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Descrição</Label>
                <Textarea
                  value={sectorInfo[selectedSector].description || ""}
                  onChange={(e) =>
                    setSectorInfo((prev) => ({
                      ...prev,
                      [selectedSector]: {
                        ...prev[selectedSector],
                        description: e.target.value,
                      },
                    }))
                  }
                  placeholder="Descrição do setor"
                />
              </div>

              <div>
                <Label>Metas</Label>
                <Textarea
                  value={sectorInfo[selectedSector].goals || ""}
                  onChange={(e) =>
                    setSectorInfo((prev) => ({
                      ...prev,
                      [selectedSector]: {
                        ...prev[selectedSector],
                        goals: e.target.value,
                      },
                    }))
                  }
                  placeholder="Metas do setor"
                />
              </div>
            </div>

            <div>
              <Label>Realizações</Label>
              <Textarea
                value={sectorInfo[selectedSector].achievements || ""}
                onChange={(e) =>
                  setSectorInfo((prev) => ({
                    ...prev,
                    [selectedSector]: {
                      ...prev[selectedSector],
                      achievements: e.target.value,
                    },
                  }))
                }
                placeholder="Realizações do setor"
              />
            </div>

            <div className="space-y-6">
              <Button onClick={addNewChart} variant="outline" className="w-full">
                Adicionar Novo Gráfico
              </Button>

              {sectorInfo[selectedSector].additionalCharts?.map((chart, chartIndex) => (
                <div key={chartIndex} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Gráfico {chartIndex + 1}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSectorInfo(prev => {
                          const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
                          updatedCharts.splice(chartIndex, 1);
                          return {
                            ...prev,
                            [selectedSector]: {
                              ...prev[selectedSector],
                              additionalCharts: updatedCharts
                            }
                          };
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    value={chart.title}
                    onChange={(e) => {
                      setSectorInfo(prev => {
                        const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
                        updatedCharts[chartIndex].title = e.target.value;
                        return {
                          ...prev,
                          [selectedSector]: {
                            ...prev[selectedSector],
                            additionalCharts: updatedCharts
                          }
                        };
                      });
                    }}
                    placeholder="Título do Gráfico"
                    className="mb-2"
                  />

                  <Textarea
                    value={chart.description}
                    onChange={(e) => {
                      setSectorInfo(prev => {
                        const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
                        updatedCharts[chartIndex].description = e.target.value;
                        return {
                          ...prev,
                          [selectedSector]: {
                            ...prev[selectedSector],
                            additionalCharts: updatedCharts
                          }
                        };
                      });
                    }}
                    placeholder="Descrição do Gráfico"
                    className="mb-4"
                  />

                  <Select
                    value={chart.type}
                    onValueChange={(value) => {
                      setSectorInfo(prev => {
                        const updatedCharts = [...(prev[selectedSector].additionalCharts || [])];
                        updatedCharts[chartIndex].type = value as "bar" | "pie";
                        return {
                          ...prev,
                          [selectedSector]: {
                            ...prev[selectedSector],
                            additionalCharts: updatedCharts
                          }
                        };
                      });
                    }}
                  >
                    <SelectTrigger className="w-[180px] mb-4">
                      <SelectValue placeholder="Tipo de Gráfico" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Gráfico de Barras</SelectItem>
                      <SelectItem value="pie">Gráfico de Pizza</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label>Rótulos</Label>
                      {chart.data.map((data, dataIndex) => (
                        <div key={dataIndex} className="flex gap-2 mb-2">
                          <Input
                            value={data.name}
                            onChange={(e) => updateChartData(chartIndex, dataIndex, "name", e.target.value)}
                            placeholder={`Rótulo ${dataIndex + 1}`}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => removeDataPointFromChart(chartIndex, dataIndex)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label>Valores</Label>
                      {chart.data.map((data, dataIndex) => (
                        <div key={dataIndex} className="flex gap-2 mb-2">
                          <Input
                            type="number"
                            value={data.value}
                            onChange={(e) => updateChartData(chartIndex, dataIndex, "value", e.target.value)}
                            placeholder={`Valor ${dataIndex + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => addDataPointToChart(chartIndex)}
                    className="w-full mb-4"
                  >
                    Adicionar Ponto ao Gráfico
                  </Button>

                  <div className="bg-white rounded-lg p-4 border">
                    <h4 className="text-lg font-medium mb-2">Pré-visualização</h4>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        {chart.type === "pie" ? (
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
                        ) : (
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-4">Adicionar Nova Mídia</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label>Título da Mídia</Label>
                  <Input
                    value={newMediaTitle}
                    onChange={(e) => setNewMediaTitle(e.target.value)}
                    placeholder="Título descritivo"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Input
                    value={newMediaDescription}
                    onChange={(e) => setNewMediaDescription(e.target.value)}
                    placeholder="Descrição detalhada"
                  />
                </div>
              </div>

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
                    disabled={isUploading || !files || files.length === 0 || !newMediaTitle}
                  >
                    {isUploading ? "Enviando..." : "Enviar Mídia"}
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
            </div>

            {sectorInfo[selectedSector].mediaItems?.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Mídias Cadastradas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectorInfo[selectedSector].mediaItems?.map((item, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-3 bg-gray-50">
                        <h4 className="font-medium">{item.title || "Sem título"}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="p-2">
                        {item.url.includes("/video/") || item.url.includes("/video/upload/") ? (
                          <video src={item.url} controls className="w-full h-40 object-contain" />
                        ) : (
                          <img 
                            src={item.url} 
                            alt={item.title || `Mídia ${index}`}
                            className="w-full h-40 object-contain"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Metodologia</h3>
                <Textarea
                  value={methodology}
                  onChange={(e) => setMethodology(e.target.value)}
                  placeholder="Descreva a metodologia utilizada"
                  rows={5}
                />
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">Resultados</h3>
                <Textarea
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  placeholder="Descreva os principais resultados"
                  rows={5}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
