
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { useQuery } from "@tanstack/react-query";
import { parseISO, isValid, format } from "date-fns";
import { DownloadIcon } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const columns = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "tipo",
    header: "Setor",
    cell: ({ row }) => {
      const tipo = row.getValue("tipo") as string;
      const labels = {
        agricultura: "🌾 Agricultura",
        pesca: "🎣 Pesca",
        paa: "🛒 PAA"
      };
      return labels[tipo] || tipo;
    }
  },
  {
    accessorKey: "fazenda",
    header: "Local",
  },
  {
    accessorKey: "dataCadastro",
    header: "Data de Cadastro",
    cell: ({ row }) => {
      const date = row.getValue("dataCadastro") as string;
      if (!date) return "";
      try {
        return format(new Date(date), "dd/MM/yyyy");
      } catch (e) {
        return date;
      }
    },
  },
  {
    accessorKey: "areaTrabalhada",
    header: "Área (m²)",
    cell: ({ row }) => {
      const area = row.getValue("areaTrabalhada") as number;
      return area ? area.toLocaleString("pt-BR") : "N/A";
    },
  },
];

const Report = () => {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [localFilter, setLocalFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");

  const { data: tratores, isLoading } = useQuery({
    queryKey: ["tratores"],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }
  });

  const filteredData = tratores?.filter(trator => {
    try {
      const tratorDate = parseISO(trator.dataCadastro);
      const start = dateStart ? parseISO(dateStart) : null;
      const end = dateEnd ? parseISO(dateEnd) : null;

      if (!isValid(tratorDate)) return false;

      const matchesDate = (!start || !isValid(start) || tratorDate >= start) && 
                        (!end || !isValid(end) || tratorDate <= end);
      const matchesLocal = localFilter === "todos" || trator.fazenda === localFilter;
      const matchesTipo = tipoFilter === "todos" || trator.tipo === tipoFilter;

      return matchesDate && matchesLocal && matchesTipo;
    } catch (error) {
      return false;
    }
  });

  // Calcular área total trabalhada
  const areaTotal = filteredData?.reduce((total, trator) => total + (trator.areaTrabalhada || 0), 0) || 0;

  // Preparar dados para o gráfico
  const chartData = React.useMemo(() => {
    if (!filteredData) return [];
    
    // Agrupar por tipo para o gráfico
    const grupos = filteredData.reduce((acc, item) => {
      const tipo = item.tipo || 'Não especificado';
      if (!acc[tipo]) {
        acc[tipo] = { 
          nome: tipo, 
          quantidade: 0, 
          area: 0 
        };
      }
      acc[tipo].quantidade += 1;
      acc[tipo].area += (item.areaTrabalhada || 0);
      return acc;
    }, {});
    
    return Object.values(grupos);
  }, [filteredData]);

  // Preparar dados para o gráfico de área por local
  const chartDataPorLocal = React.useMemo(() => {
    if (!filteredData) return [];
    
    // Agrupar por local para o gráfico
    const grupos = filteredData.reduce((acc, item) => {
      const local = item.fazenda || 'Não especificado';
      if (!acc[local]) {
        acc[local] = { 
          nome: local, 
          area: 0 
        };
      }
      acc[local].area += (item.areaTrabalhada || 0);
      return acc;
    }, {});
    
    return Object.values(grupos);
  }, [filteredData]);

  // Função para gerar PDF do relatório
  const gerarPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(16);
    doc.text("Relatório de Atividades", 105, 15, { align: "center" });
    
    // Subtítulo com data
    doc.setFontSize(12);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy")}`, 105, 25, { align: "center" });
    
    // Filtros aplicados
    doc.setFontSize(10);
    let y = 35;
    doc.text("Filtros aplicados:", 14, y);
    y += 7;
    doc.text(`Período: ${dateStart ? format(parseISO(dateStart), "dd/MM/yyyy") : "Início"} a ${dateEnd ? format(parseISO(dateEnd), "dd/MM/yyyy") : "Atual"}`, 14, y);
    y += 7;
    doc.text(`Setor: ${tipoFilter === "todos" ? "Todos" : tipoFilter}`, 14, y);
    y += 7;
    doc.text(`Local: ${localFilter === "todos" ? "Todos" : localFilter}`, 14, y);
    
    // Resumo
    y += 10;
    doc.setFontSize(12);
    doc.text("Resumo", 14, y);
    y += 7;
    doc.setFontSize(10);
    doc.text(`Total de registros: ${filteredData?.length || 0}`, 14, y);
    y += 7;
    doc.text(`Área total trabalhada: ${areaTotal.toLocaleString('pt-BR')} m²`, 14, y);
    
    // Tabela de dados
    y += 15;
    
    // Converter dados para o formato da tabela
    const tableData = filteredData?.map(item => [
      item.nome || "",
      item.tipo || "",
      item.fazenda || "",
      item.dataCadastro ? format(new Date(item.dataCadastro), "dd/MM/yyyy") : "",
      item.areaTrabalhada ? item.areaTrabalhada.toLocaleString('pt-BR') : "N/A"
    ]);
    
    // @ts-ignore - jspdf-autotable não está tipado corretamente
    doc.autoTable({
      startY: y,
      head: [['Nome', 'Setor', 'Local', 'Data de Cadastro', 'Área (m²)']],
      body: tableData || [],
    });
    
    // Salvar o PDF
    doc.save('relatorio-atividades.pdf');
  };

  // Obter lista de locais únicos para o filtro
  const locaisUnicos = React.useMemo(() => {
    if (!tratores) return [];
    const locais = new Set(tratores.map(t => t.fazenda).filter(Boolean));
    return Array.from(locais);
  }, [tratores]);

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label htmlFor="date-start">Data Inicial</Label>
            <Input
              id="date-start"
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="date-end">Data Final</Label>
            <Input
              id="date-end"
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="tipo-filter">Setor</Label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger id="tipo-filter">
                <SelectValue placeholder="Todos os setores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os setores</SelectItem>
                <SelectItem value="agricultura">🌾 Agricultura</SelectItem>
                <SelectItem value="pesca">🎣 Pesca</SelectItem>
                <SelectItem value="paa">🛒 PAA</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="local-filter">Local</Label>
            <Select value={localFilter} onValueChange={setLocalFilter}>
              <SelectTrigger id="local-filter">
                <SelectValue placeholder="Todos os locais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os locais</SelectItem>
                {locaisUnicos.map(local => (
                  <SelectItem key={local} value={local}>{local}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={gerarPDF} className="gap-2">
            <DownloadIcon className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Resumo das Áreas</h2>
          <div className="text-right">
            <p className="text-sm text-gray-600">Área Total Trabalhada</p>
            <p className="text-2xl font-bold text-primary">
              {areaTotal.toLocaleString('pt-BR')} m²
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Distribuição por Setor</h3>
            <div className="h-80">
              <ChartContainer config={{}} className="h-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantidade" name="Quantidade" fill="#8884d8" />
                  <Bar dataKey="area" name="Área (m²)" fill="#82ca9d" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Distribuição por Local</h3>
            <div className="h-80">
              <ChartContainer config={{}} className="h-full">
                <BarChart data={chartDataPorLocal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="area" name="Área (m²)" fill="#82ca9d" />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <DataTable
          columns={columns}
          data={filteredData || []}
        />
      </Card>
    </div>
  );
};

export default Report;
