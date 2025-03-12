import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart2, Download, FilePieChart, Loader2, Users, Leaf, Tractor, Fish, Shrub } from "lucide-react"; // Added Fish and Shrub icons
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
    const totalPesca = pescaData.length;
    const pescaConcluidos = pescaData.filter(p => p.concluido).length;
    const pescaEmAndamento = totalPesca - pescaConcluidos;
    const totalQuantidadePescado = pescaData.reduce((sum, p) => sum + (p.quantidadePescado || 0), 0);
    const totalCapacidadeEmbarcacao = pescaData.reduce((sum, p) => sum + (p.capacidadeEmbarcacao || 0), 0);
    const totalTanques = new Set(pescaData.map(p => p.idTanque).filter(Boolean)).size;
    const totalAreaCriacao = pescaData.reduce((sum, p) => sum + (p.areaTanque || 0), 0);
    const tiposPeixes = [...new Set(pescaData.map(p => p.tipoPescado).filter(Boolean))];
    const metodosAlimentacao = [...new Set(pescaData.map(p => p.metodoAlimentacao).filter(Boolean))];
    const totalRacao = pescaData.reduce((sum, p) => sum + (p.quantidadeRacao || 0), 0);
    const totalProdutores = new Set(pescaData.map(p => p.nomePescador).filter(Boolean)).size;
    const taxaCrescimento = pescaData.reduce((sum, p) => sum + (p.taxaCrescimento || 0), 0) / (pescaData.length || 1);

    return {
      totalPesca,
      pescaConcluidos,
      pescaEmAndamento,
      totalQuantidadePescado,
      totalCapacidadeEmbarcacao,
      totalTanques,
      totalAreaCriacao,
      tiposPeixes,
      metodosAlimentacao,
      totalRacao,
      totalProdutores,
      taxaCrescimento
    };
  };

  const calcularEstatisticasPAA = () => {
    const totalPAA = paaData.length;
    const totalProdutores = new Set(paaData.map(p => p.proprietario)).size;
    const totalQuantidadeProduzida = paaData.reduce((sum, p) => sum + (p.quantidadeProduzida || 0), 0);
    const tiposAlimentos = [...new Set(paaData.map(p => p.tipoAlimento).filter(Boolean))];
    const metodosColheita = [...new Set(paaData.map(p => p.metodoColheita).filter(Boolean))];
    const totalAreaCultivada = paaData.reduce((sum, p) => sum + (p.areaMecanizacao || 0), 0);
    const valorTotalInvestido = paaData.reduce((sum, p) => sum + (p.valorInvestido || 0), 0);

    return {
      totalPAA,
      totalProdutores,
      totalQuantidadeProduzida,
      tiposAlimentos,
      metodosColheita,
      totalAreaCultivada,
      valorTotalInvestido
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
    
    // Função para adicionar o cabeçalho em cada página
    const addHeader = () => {
      // Adicionar texto do cabeçalho
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("PREFEITURA MUNICIPAL DE VITÓRIA DO XINGU", 105, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.text("SECRETARIA MUNICIPAL DE AGRICULTURA, PESCA E ABASTECIMENTO", 105, 22, { align: 'center' });
      doc.text("VITÓRIA DO XINGU", 105, 29, { align: 'center' });
      doc.setFontSize(10);
      doc.text("CNPJ/MF: 34.887.935/0001-53", 105, 36, { align: 'center' });

      // Adicionar uma linha divisória
      doc.setDrawColor(0); // Cor da linha (preto)
      doc.setLineWidth(0.5); // Espessura da linha
      doc.line(14, 40, 200, 40); // x1, y1, x2, y2
    };

    // Adicionar o cabeçalho
    addHeader();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');

    let yPos = 50; // Posição inicial no eixo Y (abaixo do cabeçalho)

    if (tipo === 'agricultura' || tipo === 'completo') {
      doc.text("Relatório de Agricultura", 14, yPos);
      yPos += 10; // Ajusta a posição Y para o próximo conteúdo

      // Estatísticas de Agricultura
      const estAgri = calcularEstatisticasAgricultura();
      doc.setFontSize(12);
      doc.text(`Total de Tratores: ${estAgri.totalTratores}`, 14, yPos);
      yPos += 6;
      doc.text(`Maquinários Concluídos: ${estAgri.tratoresConcluidos}`, 14, yPos);
      yPos += 6;
      doc.text(`Maquinários em Serviço: ${estAgri.tratoresEmServico}`, 14, yPos);
      yPos += 6;
      doc.text(`Tempo Total de Atividade: ${convertToHours(estAgri.totalTempoAtividade)} horas`, 14, yPos);
      yPos += 6;
      doc.text(`Área Total Trabalhada: ${estAgri.totalAreaTrabalhada.toFixed(2)} m²`, 14, yPos);
      yPos += 6;
      doc.text(`Total de Horas/Máquina: ${estAgri.totalHoraMaquina} horas`, 14, yPos);
      yPos += 10; // Espaço extra antes da tabela

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
        startY: yPos,
        head: [['Nome', 'Fazenda', 'Atividade', 'Operador', 'Data', 'Status', 'Horas', 'Área (m²)']],
        body: agriculturaTableData,
      });

      yPos = doc.lastAutoTable.finalY + 15; // Atualiza a posição Y após a tabela
    }

    if (tipo === 'pesca' || tipo === 'completo') {
      // Adiciona nova página se o conteúdo for ficar muito junto do anterior
      if (tipo === 'completo' && yPos > 180) {
        doc.addPage();
        addHeader(); // Adiciona o cabeçalho na nova página
        yPos = 50; // Reposiciona após o cabeçalho
      }
      
      doc.setFontSize(16);
      doc.text("Relatório de Pesca em Tanques Criadouros 🐟", 14, yPos);
      yPos += 10;

      // Estatísticas de Pesca
      const estPesca = calcularEstatisticasPesca();
      doc.setFontSize(12);
      doc.text(`Total de Pescado Produzido: ${estPesca.totalQuantidadePescado.toFixed(2)} kg`, 14, yPos);
      yPos += 6;
      doc.text(`Quantidade de Tanques Cadastrados: ${estPesca.totalTanques}`, 14, yPos);
      yPos += 6;
      doc.text(`Área Total de Criação: ${estPesca.totalAreaCriacao.toFixed(2)} m²`, 14, yPos);
      yPos += 6;
      doc.text(`Tipos de Peixes Cultivados: ${estPesca.tiposPeixes.join(', ') || 'Não informado'}`, 14, yPos);
      yPos += 6;
      doc.text(`Taxa de Crescimento dos Peixes: ${estPesca.taxaCrescimento.toFixed(2)} kg/período`, 14, yPos);
      yPos += 6;
      doc.text(`Métodos de Alimentação: ${estPesca.metodosAlimentacao.join(', ') || 'Não informado'}`, 14, yPos);
      yPos += 6;
      doc.text(`Quantidade de Ração Utilizada: ${estPesca.totalRacao.toFixed(2)} kg`, 14, yPos);
      yPos += 6;
      doc.text(`Quantidade de Produtores Cadastrados: ${estPesca.totalProdutores}`, 14, yPos);
      yPos += 10;

      // Tabela de Pesca
      const pescaTableData = pescaData.map(item => [
        item.localidade || '',
        item.nomePescador || '',
        item.tipoPescado || '',
        item.idTanque || '',
        item.areaTanque ? `${item.areaTanque.toFixed(2)} m²` : '0.00',
        item.metodoAlimentacao || '',
        item.quantidadeRacao ? item.quantidadeRacao.toFixed(2) : '0.00',
        item.quantidadePescado ? item.quantidadePescado.toFixed(2) : '0.00',
        item.concluido ? 'Concluído' : 'Em Andamento'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Localidade', 'Produtor', 'Tipo de Peixe', 'ID Tanque', 'Área (m²)', 'Método Alimentação', 'Ração (kg)', 'Quantidade (kg)', 'Status']],
        body: pescaTableData,
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    if (tipo === 'paa' || tipo === 'completo') {
      // Adiciona nova página se o conteúdo for ficar muito junto do anterior
      if (tipo === 'completo' && yPos > 180) {
        doc.addPage();
        addHeader(); // Adiciona o cabeçalho na nova página
        yPos = 50; // Reposiciona após o cabeçalho
      }
      
      doc.setFontSize(16);
      doc.text("Relatório de PAA - Programa de Aquisição de Alimentos 🌾", 14, yPos);
      yPos += 10;

      // Estatísticas de PAA
      const estPAA = calcularEstatisticasPAA();
      doc.setFontSize(12);
      doc.text(`Total de Alimentos Adquiridos: ${estPAA.totalQuantidadeProduzida.toFixed(2)} kg`, 14, yPos);
      yPos += 6;
      doc.text(`Quantidade de Produtores Participantes: ${estPAA.totalProdutores}`, 14, yPos);
      yPos += 6;
      doc.text(`Tipos de Alimentos Fornecidos: ${estPAA.tiposAlimentos.join(', ') || 'Não informado'}`, 14, yPos);
      yPos += 6;
      doc.text(`Métodos de Colheita: ${estPAA.metodosColheita.join(', ') || 'Não informado'}`, 14, yPos);
      yPos += 6;
      doc.text(`Área Total Cultivada: ${estPAA.totalAreaCultivada.toFixed(2)} ha`, 14, yPos);
      yPos += 6;
      doc.text(`Valor Total Investido: R$ ${estPAA.valorTotalInvestido.toFixed(2)}`, 14, yPos);
      yPos += 10;

      // Tabela de PAA
      const paaTableData = paaData.map(item => [
        item.localidade || '-',
        item.proprietario || '-',
        item.tipoAlimento || '-',
        item.quantidadeProduzida ? item.quantidadeProduzida.toFixed(2) : '0.00',
        item.metodoColheita || '-',
        item.tecnicoResponsavel || '-',
        new Date(item.dataCadastro).toLocaleDateString(),
        item.concluido ? 'Concluído' : 'Em Andamento',
        item.areaMecanizacao ? item.areaMecanizacao.toFixed(2) : '0.00'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Localidade', 'Produtor', 'Tipo de Alimento', 'Quantidade (kg)', 'Método de Colheita', 'Técnico', 'Data', 'Status', 'Área (ha)']],
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Pesca em Tanques Criadouros 🐟</h2>
            <Button onClick={() => exportarPDF('pesca')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar Pesca
            </Button>
          </div>

          <p className="text-slate-600 mb-6">O monitoramento da produção aquícola garante eficiência e sustentabilidade na criação de peixes.</p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-blue-500" />
                  Total de Pescado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalQuantidadePescado.toFixed(2)} kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Tanques Cadastrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalTanques}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-green-500" />
                  Área de Criação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalAreaCriacao.toFixed(2)} m²</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Produtores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalProdutores}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-cyan-500" />
                  Tipos de Peixes Cultivados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estatisticasPesca.tiposPeixes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {estatisticasPesca.tiposPeixes.map((tipo, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">{tipo}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum tipo de peixe registrado</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shrub className="h-5 w-5 text-teal-500" />
                  Métodos de Alimentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estatisticasPesca.metodosAlimentacao.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {estatisticasPesca.metodosAlimentacao.map((metodo, index) => (
                      <Badge key={index} variant="outline" className="bg-teal-50">{metodo}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum método de alimentação registrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-orange-500" />
                  Taxa de Crescimento (kg/período)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.taxaCrescimento.toFixed(2)} kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-purple-500" />
                  Ração Utilizada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPesca.totalRacao.toFixed(2)} kg</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Tanques de Criação</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localidade</TableHead>
                    <TableHead>Produtor</TableHead>
                    <TableHead>Tipo de Peixe</TableHead>
                    <TableHead>ID Tanque</TableHead>
                    <TableHead>Área (m²)</TableHead>
                    <TableHead>Método Alimentação</TableHead>
                    <TableHead>Ração (kg)</TableHead>
                    <TableHead>Quantidade (kg)</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pescaData.map((pesca) => (
                    <TableRow key={pesca.id}>
                      <TableCell>{pesca.localidade || "—"}</TableCell>
                      <TableCell>{pesca.nomePescador || "—"}</TableCell>
                      <TableCell>{pesca.tipoPescado || "—"}</TableCell>
                      <TableCell>{pesca.idTanque || "—"}</TableCell>
                      <TableCell>{pesca.areaTanque ? `${pesca.areaTanque.toFixed(2)} m²` : "—"}</TableCell>
                      <TableCell>{pesca.metodoAlimentacao || "—"}</TableCell>
                      <TableCell>{pesca.quantidadeRacao ? `${pesca.quantidadeRacao.toFixed(2)} kg` : "—"}</TableCell>
                      <TableCell>{pesca.quantidadePescado ? `${pesca.quantidadePescado.toFixed(2)} kg` : "—"}</TableCell>
                      <TableCell>
                        <span className={pesca.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                          {pesca.concluido ? 'Concluído' : 'Em Andamento'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de PAA */}
        <TabsContent value="paa">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Programa de Aquisição de Alimentos (PAA) 🌾</h2>
            <Button onClick={() => exportarPDF('paa')} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar PAA
            </Button>
          </div>

          <p className="text-slate-600 mb-6">O relatório do PAA acompanha a produção agrícola adquirida pelo programa, promovendo transparência e eficiência.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-primary" />
                  Total de Alimentos Adquiridos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalQuantidadeProduzida.toFixed(2)} kg</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  Produtores Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalProdutores}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FilePieChart className="h-5 w-5 text-blue-500" />
                  Área Total Cultivada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{estatisticasPAA.totalAreaCultivada.toFixed(2)} ha</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-amber-500" />
                  Tipos de Alimentos Fornecidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estatisticasPAA.tiposAlimentos.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {estatisticasPAA.tiposAlimentos.map((tipo, index) => (
                      <Badge key={index} variant="outline" className="bg-amber-50">{tipo}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum tipo de alimento registrado</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tractor className="h-5 w-5 text-orange-500" />
                  Métodos de Colheita
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estatisticasPAA.metodosColheita.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {estatisticasPAA.metodosColheita.map((metodo, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50">{metodo}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum método de colheita registrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes dos Alimentos Adquiridos</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Localidade</TableHead>
                    <TableHead>Produtor</TableHead>
                    <TableHead>Tipo de Alimento</TableHead>
                    <TableHead>Quantidade (kg)</TableHead>
                    <TableHead>Método de Colheita</TableHead>
                    <TableHead>Técnico Responsável</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Área Cultivada (ha)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paaData.map((paa) => (
                    <TableRow key={paa.id}>
                      <TableCell>{paa.localidade || '-'}</TableCell>
                      <TableCell>{paa.proprietario || '-'}</TableCell>
                      <TableCell>{paa.tipoAlimento || '-'}</TableCell>
                      <TableCell>{paa.quantidadeProduzida || 0}</TableCell>
                      <TableCell>{paa.metodoColheita || '-'}</TableCell>
                      <TableCell>{paa.tecnicoResponsavel || '-'}</TableCell>
                      <TableCell>{new Date(paa.dataCadastro).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span className={paa.concluido ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                          {paa.concluido ? 'Concluído' : 'Em Andamento'}
                        </span>
                      </TableCell>
                      <TableCell>{paa.areaMecanizacao || 0}</TableCell>
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