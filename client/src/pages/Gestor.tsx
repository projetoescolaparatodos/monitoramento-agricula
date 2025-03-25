import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Gestor() {
  const { toast } = useToast();
  const [sectorInfo, setSectorInfo] = useState({
    agricultura: { description: "", goals: "", achievements: "" },
    pesca: { description: "", goals: "", achievements: "" },
    paa: { description: "", goals: "", achievements: "" }
  });

  useEffect(() => {
    const fetchSectorInfo = async () => {
      const sectors = ["agricultura", "pesca", "paa"];
      const info = { ...sectorInfo };

      for (const sector of sectors) {
        const docRef = doc(db, "setores", sector);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          info[sector] = docSnap.data();
        }
      }

      setSectorInfo(info);
    };

    fetchSectorInfo();
  }, []);

  const handleSave = async (sector) => {
    try {
      await updateDoc(doc(db, "setores", sector), sectorInfo[sector]);
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

  return (
    <div className="container mx-auto p-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Área do Gestor</h1>

      <Tabs defaultValue="agricultura">
        <TabsList>
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
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Descrição</label>
                  <Textarea
                    value={sectorInfo[sector].description}
                    onChange={(e) => handleChange(sector, "description", e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Objetivos</label>
                  <Textarea
                    value={sectorInfo[sector].goals}
                    onChange={(e) => handleChange(sector, "goals", e.target.value)}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Realizações</label>
                  <Textarea
                    value={sectorInfo[sector].achievements}
                    onChange={(e) => handleChange(sector, "achievements", e.target.value)}
                    rows={4}
                  />
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