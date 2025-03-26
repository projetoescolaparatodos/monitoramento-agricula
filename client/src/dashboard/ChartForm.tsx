import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ChartFormData, ChartData } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartComponent from "@/components/common/ChartComponent";

// Form validation schema
const formSchema = z.object({
  pageType: z.enum(["home", "agriculture", "fishing", "paa"]),
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  description: z.string().optional(),
  chartType: z.string().min(1, "Tipo de gráfico é obrigatório"),
  chartData: z.any(),
  active: z.boolean().default(true),
  order: z.number().int().min(0),
});

interface ChartFormProps {
  chartData?: ChartFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const ChartForm = ({ chartData, isEdit = false, onSuccess }: ChartFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [chartLabels, setChartLabels] = useState<string[]>(
    chartData?.chartData?.labels || ["Item 1", "Item 2", "Item 3"]
  );
  const [chartValues, setChartValues] = useState<number[]>(
    chartData?.chartData?.datasets?.[0]?.data || [10, 20, 30]
  );
  const { toast } = useToast();

  const defaultChartData: ChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Dados",
        data: chartValues,
      },
    ],
  };

  const form = useForm<ChartFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: chartData || {
      pageType: "home",
      title: "",
      description: "",
      chartType: "bar",
      chartData: defaultChartData,
      active: true,
      order: 0,
    },
  });

  const watchChartType = form.watch("chartType");

  const updateChartData = () => {
    const updatedChartData: ChartData = {
      labels: chartLabels,
      datasets: [
        {
          label: "Dados",
          data: chartValues,
        },
      ],
    };

    form.setValue("chartData", updatedChartData, { shouldValidate: true });
    return updatedChartData;
  };

  const handleLabelChange = (index: number, value: string) => {
    const newLabels = [...chartLabels];
    newLabels[index] = value;
    setChartLabels(newLabels);
    updateChartData();
  };

  const handleValueChange = (index: number, value: string) => {
    const newValues = [...chartValues];
    newValues[index] = parseFloat(value) || 0;
    setChartValues(newValues);
    updateChartData();
  };

  const addDataPoint = () => {
    setChartLabels([...chartLabels, `Item ${chartLabels.length + 1}`]);
    setChartValues([...chartValues, 0]);
    updateChartData();
  };

  const removeDataPoint = (index: number) => {
    if (chartLabels.length <= 2) {
      toast({
        title: "Erro",
        description: "O gráfico precisa ter pelo menos 2 pontos de dados.",
        variant: "destructive",
      });
      return;
    }
    
    const newLabels = chartLabels.filter((_, i) => i !== index);
    const newValues = chartValues.filter((_, i) => i !== index);
    
    setChartLabels(newLabels);
    setChartValues(newValues);
    updateChartData();
  };

  const onSubmit = async (data: ChartFormData) => {
    try {
      setIsSubmitting(true);
      const finalData = {
        ...data,
        chartData: updateChartData(),
      };

      if (isEdit && chartData?.id) {
        await apiRequest("PUT", `/api/charts/${chartData.id}`, finalData);
        toast({
          title: "Gráfico atualizado",
          description: "O gráfico foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/charts", finalData);
        form.reset();
        toast({
          title: "Gráfico criado",
          description: "O gráfico foi criado com sucesso.",
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o gráfico.",
        variant: "destructive",
      });
      console.error("Error submitting chart:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Gráfico" : "Novo Gráfico"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="mb-4">
            <TabsTrigger value="info">Informações Básicas</TabsTrigger>
            <TabsTrigger value="data">Dados do Gráfico</TabsTrigger>
            <TabsTrigger value="preview">Visualização</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="info" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="pageType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Página</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a página" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="home">Página Inicial</SelectItem>
                            <SelectItem value="agriculture">Agricultura</SelectItem>
                            <SelectItem value="fishing">Pesca</SelectItem>
                            <SelectItem value="paa">PAA</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="chartType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Gráfico</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bar">Barras</SelectItem>
                            <SelectItem value="horizontalBar">Barras Horizontais</SelectItem>
                            <SelectItem value="line">Linha</SelectItem>
                            <SelectItem value="pie">Pizza</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Insira o título do gráfico" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Insira uma descrição para o gráfico"
                          rows={3}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Ativo</FormLabel>
                          <p className="text-sm text-muted-foreground">
                            O gráfico será exibido no site quando ativo
                          </p>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="data" className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Dados do Gráfico</h3>
                    <Button type="button" onClick={addDataPoint} variant="outline" size="sm">
                      Adicionar Ponto
                    </Button>
                  </div>

                  {chartLabels.map((label, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b pb-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Rótulo</label>
                        <Input
                          value={label}
                          onChange={(e) => handleLabelChange(index, e.target.value)}
                          placeholder="Rótulo"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm font-medium mb-1 block">Valor</label>
                        <Input
                          type="number"
                          value={chartValues[index]}
                          onChange={(e) => handleValueChange(index, e.target.value)}
                          placeholder="Valor"
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeDataPoint(index)}
                        variant="destructive"
                        size="icon"
                        className="mt-5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preview">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4">{form.watch("title") || "Visualização do Gráfico"}</h3>
                  <div className="h-[300px]">
                    <ChartComponent 
                      chartType={watchChartType} 
                      chartData={updateChartData()} 
                    />
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChartForm;
