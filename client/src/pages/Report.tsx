
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart2, Download, FilePieChart } from "lucide-react";
import { Loader2 } from "lucide-react";

const Report = () => {
  const [loading, setLoading] = useState(true);
  const [tratoresData, setTratoresData] = useState<any[]>([]);
  const [pescaData, setPescaData] = useState<any[]>([]);
  const [paaData, setPaaData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar dados de Agricultura (tratores)
        const tratoresSnapshot = await getDocs(collection(db, "tratores"));
        const tratores = tratoresSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTratoresData(tratores);

        // Buscar dados de Pesca
        const pescaSnapshot = await getDocs(collection(db, "pesca"));
        const pesca = pescaSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPescaData(pesca);

        // Buscar dados de PAA
        const paaSnapshot = await getDocs(collection(db, "paa"));
        const paa = paaSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaaData(paa);

      } catch (error) {
        console.error("Erro ao buscar dados para relatórios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calcularEstatisticasAgricultura = () => {
    const totalTratores = tratoresData.length;
    const tratoresConcluidos = tratoresData.filter(t => t.concluido).length;
    const tratoresEmServico = totalTratores - tratoresConcluidos;
    const totalAreaTrabalhada = tratoresData.reduce((sum, t) => sum + (t.areaTrabalhada || 0), 0);
    const totalTempoAtividade = tratoresData.reduce((sum, t) => sum + (t.tempoAtividade || 0), 0);

    return {
      totalTratores,
      tratoresConcluidos,
      tratoresEmServico,
      totalAreaTrabalhada,
      totalTempoAtividade
    };
  };

  const calcularEstatisticasPesca = () => {
    const totalPesqueiros = pescaData.length;
    const pesqueirosConcluidos = pescaData.filter(p => p.concluido).length;
    const pesqueirosEmAndamento = totalPesqueiros - pesqueirosConcluidos;
    const totalAreaMecanizacao = pescaData.reduce((sum, p) => sum + (p.areaMecanizacao || 0), 0);
    const totalHoraMaquina = pescaData.reduce((sum, p) => sum + (p.horaMaquina || 0), 0);

    return {
      totalPesqueiros,
      pesqueirosConcluidos,
      pesqueirosEmAndamento,
      totalAreaMecanizacao,
      totalHoraMaquina
    };
  };

  const calcularEstatisticasPAA = () => {
    const totalPAA = paaData.length;
    const paaConcluidos = paaData.filter(p => p.concluido).length;
    const paaEmAndamento = totalPAA - paaConcluidos;
    const totalAreaMecanizacao = paaData.reduce((sum, p) => sum + (p.areaMecanizacao || 0), 0);
    const totalHoraMaquina = paaData.reduce((sum, p) => sum + (p.horaMaquina || 0), 0);

    return {
      totalPAA,
      paaConcluidos,
      paaEmAndamento,
      totalAreaMecanizacao,
      totalHoraMaquina
    };
  };

  const exportarPDF = () => {
    alert("Funcionalidade de exportação para PDF será implementada futuramente.");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const estatisticasAgricultura = calcularEstatisticasAgricultura();
  const estatisticasPesca = calcularEstatisticasPesca();
  const estatisticasPAA = calcularEstatisticasPAA();

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <Button onClick={exportarPDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      <Tabs defaultValue="agricultura">
        <TabsList className="mb-8">
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
        </TabsList>

        {/* Relatório de Agricultura */}
        <TabsContent value="agricultura">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Total de Tratores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasAgricultura.totalTratores}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-green-500" />
                  Área Trabalhada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasAgricultura.totalAreaTrabalhada} m²</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-blue-500" />
                  Tempo Total de Atividade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasAgricultura.totalTempoAtividade} min</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Tratores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Fazenda</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Piloto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Área (m²)</TableHead>
                    <TableHead>Tempo (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tratoresData.map((trator) => (
                    <TableRow key={trator.id}>
                      <TableCell>{trator.nome}</TableCell>
                      <TableCell>{trator.fazenda}</TableCell>
                      <TableCell>{trator.atividade}</TableCell>
                      <TableCell>{trator.piloto}</TableCell>
                      <TableCell>{new Date(trator.dataCadastro).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={trator.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                          {trator.concluido ? 'Concluído' : 'Em Serviço'}
                        </span>
                      </TableCell>
                      <TableCell>{trator.areaTrabalhada || 0}</TableCell>
                      <TableCell>{trator.tempoAtividade || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Pesca */}
        <TabsContent value="pesca">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Total de Locais de Pesca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalPesqueiros}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-green-500" />
                  Área Total para Mecanização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalAreaMecanizacao} ha</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-blue-500" />
                  Total de Horas/Máquina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalHoraMaquina} h</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Locais de Pesca</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localidade</TableHead>
                    <TableHead>Imóvel Rural</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Área (ha)</TableHead>
                    <TableHead>Horas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pescaData.map((pesca) => (
                    <TableRow key={pesca.id}>
                      <TableCell>{pesca.localidade}</TableCell>
                      <TableCell>{pesca.nomeImovel}</TableCell>
                      <TableCell>{pesca.proprietario}</TableCell>
                      <TableCell>{pesca.operacao}</TableCell>
                      <TableCell>{pesca.operador}</TableCell>
                      <TableCell>{pesca.tecnicoResponsavel}</TableCell>
                      <TableCell>{new Date(pesca.dataCadastro).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={pesca.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                          {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                        </span>
                      </TableCell>
                      <TableCell>{pesca.areaMecanizacao || 0}</TableCell>
                      <TableCell>{pesca.horaMaquina || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de PAA */}
        <TabsContent value="paa">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Total de Locais PAA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalPAA}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-green-500" />
                  Área Total para Mecanização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalAreaMecanizacao} ha</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-blue-500" />
                  Total de Horas/Máquina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalHoraMaquina} h</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Locais PAA</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localidade</TableHead>
                    <TableHead>Imóvel Rural</TableHead>
                    <TableHead>Proprietário</TableHead>
                    <TableHead>Operação</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Área (ha)</TableHead>
                    <TableHead>Horas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paaData.map((paa) => (
                    <TableRow key={paa.id}>
                      <TableCell>{paa.localidade}</TableCell>
                      <TableCell>{paa.nomeImovel}</TableCell>
                      <TableCell>{paa.proprietario}</TableCell>
                      <TableCell>{paa.operacao}</TableCell>
                      <TableCell>{paa.operador}</TableCell>
                      <TableCell>{paa.tecnicoResponsavel}</TableCell>
                      <TableCell>{new Date(paa.dataCadastro).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={paa.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                          {paa.concluido ? 'Concluído' : 'Em Andamento'}
                        </span>
                      </TableCell>
                      <TableCell>{paa.areaMecanizacao || 0}</TableCell>
                      <TableCell>{paa.horaMaquina || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Report;
