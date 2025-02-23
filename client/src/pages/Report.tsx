import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Loader2, Filter } from "lucide-react";
import { format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

// Função auxiliar para formatar datas com segurança
const formatDate = (dateString: string) => {
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Data inválida";
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch (error) {
    return "Data inválida";
  }
};

const Report = () => {
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [fazendaFilter, setFazendaFilter] = useState("todas");

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
      const matchesFazenda = fazendaFilter === "todas" || trator.fazenda === fazendaFilter;

      return matchesDate && matchesFazenda;
    } catch (error) {
      return false;
    }
  });

  const columns = [
    { header: "Nome", accessorKey: "nome" },
    { header: "Fazenda", accessorKey: "fazenda" },
    { header: "Atividade", accessorKey: "atividade" },
    { 
      header: "Data", 
      accessorKey: "dataCadastro",
      cell: ({ row }) => formatDate(row.original.dataCadastro)
    },
    { 
      header: "Status", 
      accessorKey: "concluido",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-sm ${
          row.original.concluido 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {row.original.concluido ? "Concluído" : "Em Serviço"}
        </span>
      )
    }
  ];

  // Dados para o gráfico de atividades
  const chartData = filteredData?.reduce((acc, trator) => {
    const existing = acc.find(item => item.atividade === trator.atividade);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ atividade: trator.atividade, count: 1 });
    }
    return acc;
  }, []);

  // Dados para o gráfico de status
  const statusData = filteredData?.reduce((acc, trator) => {
    const status = trator.concluido ? "Concluído" : "Em Serviço";
    const existing = acc.find(item => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  const fazendas = tratores ? [...new Set(tratores.map(t => t.fazenda))] : [];

  const handleExportCSV = () => {
    if (!filteredData) return;

    const csvContent = [
      ["Nome", "Fazenda", "Atividade", "Data", "Status"].join(","),
      ...filteredData.map(trator => [
        trator.nome,
        trator.fazenda,
        trator.atividade,
        formatDate(trator.dataCadastro),
        trator.concluido ? "Concluído" : "Em Serviço"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_tratores_${format(new Date(), "dd-MM-yyyy")}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Relatório de Atividades</h1>
        <Button onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Data Início</label>
            <Input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Data Fim</label>
            <Input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Fazenda</label>
            <Select value={fazendaFilter} onValueChange={setFazendaFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma fazenda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {fazendas.map(fazenda => (
                  <SelectItem key={fazenda} value={fazenda}>
                    {fazenda}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Atividades por Tipo</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="atividade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(120, 40%, 35%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Status das Atividades</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

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