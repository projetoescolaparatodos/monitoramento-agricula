
import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Upload from "@/components/Upload";
import { Input } from "@/components/ui/input";

function Gestor() {
  const { toast } = useToast();
  const [sectorInfo, setSectorInfo] = useState({
    agricultura: { description: "", goals: "", achievements: "", chartData: {} },
    pesca: { description: "", goals: "", achievements: "", chartData: {} },
    paa: { description: "", goals: "", achievements: "", chartData: {} }
  });
  const [selectedSector, setSelectedSector] = useState("agricultura");
  const [chartData, setChartData] = useState({
    labels: [],
    values: []
  });

  useEffect(() => {
    const fetchSectorInfo = async () => {
      const sectors = ["agricultura", "pesca", "paa"];
      const info = { ...sectorInfo };

      for (const sector of sectors) {
        const docRef = doc(db, "setores", sector);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          info[sector] = { ...docSnap.data(), chartData: docSnap.data().chartData || {} };
        }
      }

      setSectorInfo(info);
      if (info[selectedSector].chartData) {
        setChartData({
          labels: Object.keys(info[selectedSector].chartData),
          values: Object.values(info[selectedSector].chartData)
        });
      }
    };

    fetchSectorInfo();
  }, [selectedSector]);

  const handleSave = async (sector) => {
    try {
      const updatedData = {
        ...sectorInfo[sector],
        chartData: chartData.labels.reduce((acc, label, index) => {
          acc[label] = chartData.values[index];
          return acc;
        }, {})
      };
      
      await updateDoc(doc(db, "setores", sector), updatedData);
      toast({
        title: "Sucesso",
        description: "Informações atualizadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar informações",
        variant: "destructive",
      });
    }
  };

  const handleChange = (sector, field, value) => {
    setSectorInfo(prev => ({
      ...prev,
      [sector]: {
        ...prev[sector],
        [field]: value
      }
    }));
  };

  const handleChartDataChange = (index, type, value) => {
    if (type === 'label') {
      setChartData(prev => ({
        ...prev,
        labels: prev.labels.map((label, i) => i === index ? value : label)
      }));
    } else {
      setChartData(prev => ({
        ...prev,
        values: prev.values.map((v, i) => i === index ? Number(value) : v)
      }));
    }
  };

  const addChartDataPoint = () => {
    setChartData(prev => ({
      labels: [...prev.labels, ''],
      values: [...prev.values, 0]
    }));
  };

  const removeChartDataPoint = (index) => {
    setChartData(prev => ({
      labels: prev.labels.filter((_, i) => i !== index),
      values: prev.values.filter((_, i) => i !== index)
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

        {Object.keys(sectorInfo).map((sector) => (
          <TabsContent key={sector} value={sector}>
            <Card>
              <CardHeader>
                <CardTitle>Editar Informações - {sector.toUpperCase()}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Informações do Setor</h3>
                    <Textarea
                      className="mb-2"
                      placeholder="Descrição"
                      value={sectorInfo[sector].description}
                      onChange={(e) => handleChange(sector, "description", e.target.value)}
                      rows={4}
                    />
                    <Textarea
                      className="mb-2"
                      placeholder="Objetivos"
                      value={sectorInfo[sector].goals}
                      onChange={(e) => handleChange(sector, "goals", e.target.value)}
                      rows={4}
                    />
                    <Textarea
                      placeholder="Realizações"
                      value={sectorInfo[sector].achievements}
                      onChange={(e) => handleChange(sector, "achievements", e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Dados do Gráfico</h3>
                    <div className="space-y-2">
                      {chartData.labels.map((label, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <Input
                            placeholder="Nome"
                            value={label}
                            onChange={(e) => handleChartDataChange(index, 'label', e.target.value)}
                          />
                          <Input
                            type="number"
                            placeholder="Valor"
                            value={chartData.values[index]}
                            onChange={(e) => handleChartDataChange(index, 'value', e.target.value)}
                          />
                          <Button variant="destructive" onClick={() => removeChartDataPoint(index)}>
                            Remover
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addChartDataPoint}>Adicionar Dado</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Upload de Mídia</h3>
                    <Upload folder={`setores/${sector}/media`} onUploadComplete={(urls) => {
                      handleChange(sector, "mediaUrls", [...(sectorInfo[sector].mediaUrls || []), ...urls]);
                    }} />
                  </div>
                </div>

                <Button onClick={() => handleSave(sector)}>Salvar Alterações</Button>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default Gestor;
