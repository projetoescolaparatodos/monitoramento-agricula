
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Tractor } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Home = () => {
  const [tractorCount, setTractorCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        const data = await response.json();
        setTractorCount(data.totalTractors || 0);
        setMaintenanceCount(data.needMaintenance || 0);
        setStatsLoading(false);
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as estatísticas.",
          variant: "destructive",
        });
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [toast]);

  return (
    <div className="container mx-auto py-24 px-4">
      <h1 className="text-3xl font-bold mb-8">
        Sistema de Monitoramento e Avaliação de Maquinário Agrícola
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tractor className="h-5 w-5" />
              Total de Tratores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {statsLoading ? "..." : tractorCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Necessitam Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">
              {statsLoading ? "..." : maintenanceCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTitle>Informação</AlertTitle>
        <AlertDescription>
          Bem-vindo ao Sistema de Monitoramento e Avaliação de Maquinário
          Agrícola (SEMAPA) da Prefeitura de Vitória do Xingu. Use o menu
          superior para navegar pelo sistema.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Home;
