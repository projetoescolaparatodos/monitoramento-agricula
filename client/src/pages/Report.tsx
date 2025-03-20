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
  const [pescaData, setPescaData] = useState<any[]>([]); // Updated to reflect map data
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

        // Buscar dados de Pesca (incluindo integração com dados do mapa - hipotético)
        const pescaSnapshot = await getDocs(collection(db, "pesca"));
        const pesca = pescaSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Assuming map data integration.  Replace with your actual map data fetching logic.
          ...getMapDataForPesca(doc.id) 
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

  // Placeholder function to simulate fetching map data.  REPLACE THIS WITH YOUR ACTUAL MAP DATA INTEGRATION
  const getMapDataForPesca = async (pescaId: string) => {
    // This is a placeholder.  Replace with your actual logic to get map data based on pescaId
    // Example: Fetching location coordinates, species counts, etc., from your map service.
    // Simulate fetching some map data.
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
        localidade: `Localização da Pesca ${pescaId}`,
        latitude: Math.random() * 180 - 90,
        longitude: Math.random() * 360 - 180,
        // Add other map-related fields as needed
    };
  };


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
    const tiposTanques = [...new Set(pescaData.map(p => p.tipoTanque).filter(Boolean))];


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
      tiposTanques
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
      // Definir fonte padrão para todo o documento
      doc.setFont('helvetica', 'bold');

      // Adicionar texto do cabeçalho centralizado
      doc.setFontSize(12);
      doc.text("PREFEITURA MUNICIPAL DE VITÓRIA DO XINGU", 105, 15, { align: 'center' });
      doc.setFontSize(11);
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

    // Configurações de fonte para os títulos de seção
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');

    let yPos = 50; // Posição inicial no eixo Y (abaixo do cabeçalho)

    if (tipo === 'agricultura' || tipo === 'completo') {
      doc.text("RELATÓRIO DE AGRICULTURA", 105, yPos, { align: 'center' });
      yPos += 10; // Ajusta a posição Y para o próximo conteúdo

      // Estatísticas de Agricultura
      const estAgri = calcularEstatisticasAgricultura();

      // Título da subseção
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("DADOS ESTATÍSTICOS:", 14, yPos);
      yPos += 8;

      // Informações estatísticas
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Tratores: ${estAgri.totalTratores}`, 20, yPos);
      yPos += 6;
      doc.text(`Maquinários Concluídos: ${estAgri.tratoresConcluidos}`, 20, yPos);
      yPos += 6;
      doc.text(`Maquinários em Serviço: ${estAgri.tratoresEmServico}`, 20, yPos);
      yPos += 6;
      doc.text(`Tempo Total de Atividade: ${convertToHours(estAgri.totalTempoAtividade)} horas`, 20, yPos);
      yPos += 6;
      doc.text(`Área Total Trabalhada: ${(estAgri.totalAreaTrabalhada / 10000).toFixed(2)} ha`, 20, yPos); // Convertido para hectares
      yPos += 6;
      doc.text(`Total de Horas/Máquina: ${estAgri.totalHoraMaquina} horas`, 20, yPos);
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
        item.areaTrabalhada ? (item.areaTrabalhada / 10000).toFixed(2) : '0.00' // Convertido para hectares
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Nome', 'Fazenda', 'Atividade', 'Operador', 'Data', 'Status', 'Horas', 'Área (ha)']],
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

      doc.setFontSize(14);
      doc.text("RELATÓRIO DE PESCA EM TANQUES CRIADOUROS", 105, yPos, { align: 'center' });
      yPos += 10;

      // Estatísticas de Pesca
      const estPesca = calcularEstatisticasPesca();

      // Título da subseção
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("DADOS ESTATÍSTICOS:", 14, yPos);
      yPos += 8;

      // Informações estatísticas
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Pescado Produzido: ${estPesca.totalQuantidadePescado.toFixed(2)} kg`, 20, yPos);
      yPos += 6;
      doc.text(`Quantidade de Sistemas Cadastrados: ${estPesca.totalTanques}`, 20, yPos);
      yPos += 6;
      doc.text(`Área Total de Criação: ${(estPesca.totalAreaCriacao / 10000).toFixed(2)} ha`, 20, yPos); // Convertido para hectares
      yPos += 6;

      // Tratando informações que podem ficar muito extensas
      const tiposPeixesText = `Tipos de Peixes Cultivados: ${estPesca.tiposPeixes.join(', ') || 'Não informado'}`;
      if (tiposPeixesText.length > 100) {
        const wrapped = doc.splitTextToSize(tiposPeixesText, 170);
        doc.text(wrapped, 20, yPos);
        yPos += 6 * wrapped.length;
      } else {
        doc.text(tiposPeixesText, 20, yPos);
        yPos += 6;
      }

      // Tratando outras informações que podem ficar muito extensas
      const metodosAlimentacaoText = `Métodos de Alimentação: ${estPesca.metodosAlimentacao.join(', ') || 'Não informado'}`;
      if (metodosAlimentacaoText.length > 100) {
        const wrapped = doc.splitTextToSize(metodosAlimentacaoText, 170);
        doc.text(wrapped, 20, yPos);
        yPos += 6 * wrapped.length;
      } else {
        doc.text(metodosAlimentacaoText, 20, yPos);
        yPos += 6;
      }

      doc.text(`Quantidade de Ração Utilizada: ${estPesca.totalRacao.toFixed(2)} kg`, 20, yPos);
      yPos += 6;
      doc.text(`Quantidade de Produtores Cadastrados: ${estPesca.totalProdutores}`, 20, yPos);
      yPos += 10;

      // Tipos de Tanques
      const tiposTanquesText = `Tipos de Tanques: ${estPesca.tiposTanques.join(', ') || 'Não informado'}`;
      if (tiposTanquesText.length > 100) {
        const wrapped = doc.splitTextToSize(tiposTanquesText, 170);
        doc.text(wrapped, 20, yPos);
        yPos += 6 * wrapped.length;
      } else {
        doc.text(tiposTanquesText, 20, yPos);
        yPos += 6;
      }

      yPos += 10; // Espaço extra antes da tabela

      // Tabela de Pesca
      const pescaTableData = pescaData.map(item => [
        item.numeroRegistro || '',
        item.especiePeixe || '',
        item.tipoTanque || '',
        item.localidade || '',
        item.areaImovel || '',
        item.areaAlagada || '',
        item.sistemaCultivo || '',
        item.metodoAlimentacao || '',
        item.operador || '',
        item.tecnicoResponsavel || '',
        item.quantidadeRacao ? item.quantidadeRacao.toFixed(2) : '0.00',
        item.quantidadePescado ? item.quantidadePescado.toFixed(2) : '0.00',
        item.concluido ? 'Concluído' : 'Em Andamento'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Número Registro', 'Espécie', 'Tipo Tanque', 'Localidade', 'Área Imóvel (ha)', 'Área Alagada (ha)', 'Sistema Cultivo', 'Método Alimentação', 'Operador', 'Técnico', 'Ração (kg)', 'Quantidade (kg)', 'Status']],
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

      doc.setFontSize(14);
      doc.text("RELATÓRIO DE PAA - PROGRAMA DE AQUISIÇÃO DE ALIMENTOS", 105, yPos, { align: 'center' });
      yPos += 10;

      // Estatísticas de PAA
      const estPAA = calcularEstatisticasPAA();

      // Título da subseção
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text("DADOS ESTATÍSTICOS:", 14, yPos);
      yPos += 8;

      // Informações estatísticas
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total de Alimentos Adquiridos: ${estPAA.totalQuantidadeProduzida.toFixed(2)} kg`, 20, yPos);
      yPos += 6;
      doc.text(`Quantidade de Produtores Participantes: ${estPAA.totalProdutores}`, 20, yPos);
      yPos += 6;

      // Tratando informações que podem ficar muito extensas
      const tiposAlimentosText = `Tipos de Alimentos Fornecidos: ${estPAA.tiposAlimentos.join(', ') || 'Não informado'}`;
      if (tiposAlimentosText.length > 100) {
        const wrapped = doc.splitTextToSize(tiposAlimentosText, 170);
        doc.text(wrapped, 20, yPos);
        yPos += 6 * wrapped.length;
      } else {
        doc.text(tiposAlimentosText, 20, yPos);
        yPos += 6;
      }

      const metodosColheitaText = `Métodos de Colheita: ${estPAA.metodosColheita.join(', ') || 'Não informado'}`;
      if (metodosColheitaText.length > 100) {
        const wrapped = doc.splitTextToSize(metodosColheitaText, 170);
        doc.text(wrapped, 20, yPos);
        yPos += 6 * wrapped.length;
      } else {
        doc.text(metodosColheitaText, 20, yPos);
        yPos += 6;
      }

      doc.text(`Área Total Cultivada: ${estPAA.totalAreaCultivada.toFixed(2)} ha`, 20, yPos);
      yPos += 6;
      doc.text(`Valor Total Investido: R$ ${estPAA.valorTotalInvestido.toFixed(2)}`, 20, yPos);
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
        item.areaMecanizacao ? (item.areaMecanizacao / 10000).toFixed(2) : '0.00' // Convertido para hectares

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
                <p className="text-3xl font-bold">{(estatisticasAgricultura.totalAreaTrabalhada / 10000).toFixed(2)} ha</p> {/* Convertido para hectares */}
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
                    <TableHead>Área (ha)</TableHead> {/* Changed to hectares */}
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
                      <TableCell>{trator.areaTrabalhada ? (trator.areaTrabalhada / 10000).toFixed(2) : '0.00'}</TableCell> {/* Convertido para hectares */}
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
            <h2 className="text-2xl font-bold">Pesca em Tanques Criadouros</h2>
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
                  Sistemas Cadastrados
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
                <p className="text-3xl font-bold">{(estatisticasPesca.totalAreaCriacao / 10000).toFixed(2)} ha</p> {/* Convertido para hectares */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Added a third column for Tipos de Tanques */}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-green-500" />
                  Tipos de Tanques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {estatisticasPesca.tiposTanques.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {estatisticasPesca.tiposTanques.map((tipo, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50">{tipo}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500">Nenhum tipo de tanque registrado</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart2 className="h-5 w-5 text-orange-500" />
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
                    <TableHead>Número Registro</TableHead>
                    <TableHead>Espécie</TableHead>
                    <TableHead>Tipo Tanque</TableHead>
                    <TableHead>Localidade</TableHead>
                    <TableHead>Área Imóvel (ha)</TableHead>
                    <TableHead>Área Alagada (ha)</TableHead>
                    <TableHead>Sistema Cultivo</TableHead>
                    <TableHead>Método Alimentação</TableHead>
                    <TableHead>Operador</TableHead>
                    <TableHead>Técnico</TableHead>
                    <TableHead>Ração (kg)</TableHead>
                    <TableHead>Quantidade (kg)</TableHead>
                    <TableHead>Status</TableHead>                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pescaData.map((pesca) => (
                    <TableRow key={pesca.id}>
                      <TableCell>{pesca.numeroRegistro || "—"}</TableCell>
                      <TableCell>{pesca.especiePeixe || "—"}</TableCell>
                      <TableCell>{pesca.tipoTanque || "—"}</TableCell>
                      <TableCell>{pesca.localidade || "—"}</TableCell>
                      <TableCell>{pesca.areaImovel ? `${pesca.areaImovel} ha` : "—"}</TableCell>
                      <TableCell>{pesca.areaAlagada ? `${pesca.areaAlagada} ha` : "—"}</TableCell>
                      <TableCell>{pesca.sistemaCultivo || "—"}</TableCell>
                      <TableCell>{pesca.metodoAlimentacao || "—"}</TableCell>
                      <TableCell>{pesca.operador || "—"}</TableCell>
                      <TableCell>{pesca.tecnicoResponsavel || "—"}</TableCell>
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
            <h2 className="text-2xl font-bold">Programa de Aquisição de Alimentos (PAA)</h2>
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
                    <TableHead>Área Cultivada (ha)</TableHead> {/* Changed to hectares */}
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
                      <TableCell>{paa.areaMecanizacao ? (paa.areaMecanizacao / 10000).toFixed(2) : '0.00'}</TableCell> {/* Convertido para hectares */}
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