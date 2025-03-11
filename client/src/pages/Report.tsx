import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart2, Download, FilePieChart, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';

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

  // Converter minutos para horas
  const convertToHours = (minutes: number) => {
    return (minutes / 60).toFixed(2);
  };

  //Função para calcular estatísticas de agricultura, agora com total de horaMaquina
  const calcularEstatisticasAgricultura = () => {
    const totalTratores = tratoresData.length;
    const tratoresConcluidos = tratoresData.filter(t => t.concluido).length;
    const tratoresEmServico = totalTratores - tratoresConcluidos;
    const totalTempoAtividade = tratoresData.reduce((sum, t) => sum + (t.tempoAtividade || 0), 0);
    const tempoAtividadeHoras = Number(convertToHours(totalTempoAtividade));
    const totalAreaTrabalhada = tratoresData.reduce((sum, t) => sum + (t.areaTrabalhada || 0), 0);

    return {
      totalTratores,
      tratoresConcluidos,
      tratoresEmServico,
      totalTempoAtividade: tempoAtividadeHoras,
      totalAreaTrabalhada,
      totalHoraMaquina: totalTempoAtividade // adicionando totalHoraMaquina
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

  const calculateTotalMachineHours = (data: any[]) => {
    let totalHours = 0;
    data.forEach(item => {
      totalHours += (item.tempoAtividade || 0) / 60;
    });
    return totalHours.toFixed(2);
  };

  const exportarPDF = (tipo: 'agricultura' | 'pesca' | 'paa' | 'completo') => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');

    if (tipo === 'agricultura' || tipo === 'completo') {
      doc.text("Relatório de Agricultura", 14, 55); // Adjusted y-coordinate

      // Estatísticas de Agricultura
      const estAgri = calcularEstatisticasAgricultura();
      doc.setFontSize(12);
      doc.text(`Total de Tratores: ${estAgri.totalTratores}`, 14, 65); // Adjusted y-coordinate
      doc.text(`Maquinários Concluídos: ${estAgri.tratoresConcluidos}`, 14, 71); // Adjusted y-coordinate
      doc.text(`Maquinários em Serviço: ${estAgri.tratoresEmServico}`, 14, 77); // Adjusted y-coordinate
      doc.text(`Tempo Total de Atividade: ${convertToHours(estAgri.totalTempoAtividade)} horas`, 14, 83); // Adjusted y-coordinate
      doc.text(`Área Total Trabalhada: ${estAgri.totalAreaTrabalhada.toFixed(2)} m²`, 14, 89); // Adjusted y-coordinate
      doc.text(`Total de Horas/Máquina: ${estAgri.totalHoraMaquina} horas`, 14, 95); // Adjusted y-coordinate


      // Tabela de Agricultura
      const agriculturaTableData = tratoresData.map(item => [
        item.nome || '',
        item.fazenda || '',
        item.atividade || '',
        item.piloto || '',
        new Date(item.dataCadastro).toLocaleDateString(),
        item.concluido ? 'Concluído' : 'Em Serviço',
        convertToHours(item.tempoAtividade || 0),
        item.areaTrabalhada ? item.areaTrabalhada.toFixed(2) : '0.00'
      ]);

      autoTable(doc, {
        startY: 90, // Adjusted y-coordinate
        head: [['Nome', 'Fazenda', 'Atividade', 'Operador', 'Data', 'Status', 'Horas', 'Área (m²)']],
        body: agriculturaTableData,
      });
    }

    let yPos = tipo === 'agricultura' ? doc.lastAutoTable.finalY + 15 : 55; // Adjusted starting position

    if (tipo === 'pesca' || tipo === 'completo') {
      doc.setFontSize(16);
      doc.text("Relatório de Pesca", 14, yPos);

      // Estatísticas de Pesca
      const estPesca = calcularEstatisticasPesca();
      doc.setFontSize(12);
      doc.text(`Total de Locais de Pesca: ${estPesca.totalPesqueiros}`, 14, yPos + 10);
      doc.text(`Locais Concluídos: ${estPesca.pesqueirosConcluidos}`, 14, yPos + 16);
      doc.text(`Locais em Andamento: ${estPesca.pesqueirosEmAndamento}`, 14, yPos + 22);
      doc.text(`Área Total para Mecanização: ${estPesca.totalAreaMecanizacao.toFixed(2)} ha`, 14, yPos + 28);
      doc.text(`Total de Horas/Máquina: ${estPesca.totalHoraMaquina.toFixed(2)} h`, 14, yPos + 34);

      // Tabela de Pesca
      const pescaTableData = pescaData.map(item => [
        item.localidade || '',
        item.nomeImovel || '',
        item.proprietario || '',
        item.operacao || '',
        item.operador || '',
        new Date(item.dataCadastro).toLocaleDateString(),
        item.concluido ? 'Concluído' : 'Em Andamento',
        item.horaMaquina ? item.horaMaquina.toFixed(2) : '0.00',
        item.areaMecanizacao ? item.areaMecanizacao.toFixed(2) : '0.00'
      ]);

      autoTable(doc, {
        startY: yPos + 50, // Adjusted y-coordinate
        head: [['Localidade', 'Imóvel', 'Proprietário', 'Operação', 'Operador', 'Data', 'Status', 'Horas', 'Área (ha)']],
        body: pescaTableData,
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    if (tipo === 'paa' || tipo === 'completo') {
      doc.setFontSize(16);
      doc.text("Relatório de PAA", 14, yPos);

      // Estatísticas de PAA
      const estPAA = calcularEstatisticasPAA();
      doc.setFontSize(12);
      doc.text(`Total de Locais PAA: ${estPAA.totalPAA}`, 14, yPos + 10);
      doc.text(`Locais Concluídos: ${estPAA.paaConcluidos}`, 14, yPos + 16);
      doc.text(`Locais em Andamento: ${estPAA.paaEmAndamento}`, 14, yPos + 22);
      doc.text(`Área Total para Mecanização: ${estPAA.totalAreaMecanizacao.toFixed(2)} ha`, 14, yPos + 28);
      doc.text(`Total de Horas/Máquina: ${estPAA.totalHoraMaquina.toFixed(2)} h`, 14, yPos + 34);

      // Tabela de PAA
      const paaTableData = paaData.map(item => [
        item.localidade || '',
        item.nomeImovel || '',
        item.proprietario || '',
        item.operacao || '',
        item.operador || '',
        new Date(item.dataCadastro).toLocaleDateString(),
        item.concluido ? 'Concluído' : 'Em Andamento',
        item.horaMaquina ? item.horaMaquina.toFixed(2) : '0.00',
        item.areaMecanizacao ? item.areaMecanizacao.toFixed(2) : '0.00'
      ]);

      autoTable(doc, {
        startY: yPos + 50, // Adjusted y-coordinate
        head: [['Localidade', 'Imóvel', 'Proprietário', 'Operação', 'Operador', 'Data', 'Status', 'Horas', 'Área (ha)']],
        body: paaTableData,
      });
    }

    // Nome do arquivo
    let filename = 'relatorio';
    if (tipo === 'agricultura') filename += '_agricultura';
    else if (tipo === 'pesca') filename += '_pesca';
    else if (tipo === 'paa') filename += '_paa';
    else filename += '_completo';

    doc.save(`${filename}.pdf`);
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
        <Button onClick={() => exportarPDF('completo')} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório Completo
        </Button>
      </div>

      <Tabs defaultValue="agricultura">
        <TabsList className="mb-6">
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
        </TabsList>

        {/* Relatório de Agricultura */}
        <TabsContent value="agricultura">
          <div className="flex justify-end mb-4">
            <Button onClick={() => exportarPDF('agricultura')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Agricultura
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Total de Maquinários
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasAgricultura.totalTratores}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-blue-500" />
                  Hora/Máquina
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{calculateTotalMachineHours(tratoresData)} horas</p>
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
                <p className="text-3xl font-bold">{estatisticasAgricultura.totalAreaTrabalhada.toFixed(2)} m²</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Maquinários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Fazenda</TableHead>
                    <TableHead>Atividade</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hora/Máquina</TableHead>
                    <TableHead>Área (m²)</TableHead>
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
                      <TableCell>{convertToHours(trator.tempoAtividade || 0)}</TableCell>
                      <TableCell>{trator.areaTrabalhada ? trator.areaTrabalhada.toFixed(2) : '0.00'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Pesca */}
        <TabsContent value="pesca">
          <div className="flex justify-end mb-4">
            <Button onClick={() => exportarPDF('pesca')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Pesca
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
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
                <p className="text-3xl font-bold">{estatisticasPesca.totalAreaMecanizacao.toFixed(2)} ha</p>
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
                <p className="text-3xl font-bold">{estatisticasPesca.totalHoraMaquina.toFixed(2)} h</p>
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
          <div className="flex justify-end mb-4">
            <Button onClick={() => exportarPDF('paa')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PAA
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
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
                <p className="text-3xl font-bold">{estatisticasPAA.totalAreaMecanizacao.toFixed(2)} ha</p>
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
                <p className="text-3xl font-bold">{estatisticasPAA.totalHoraMaquina.toFixed(2)} h</p>
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