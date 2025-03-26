import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChartFormData, ChartData, PageType } from "../../types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  pageType: z.string(),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  chartType: z.string(),
  chartData: z.any(),
  active: z.boolean().default(true),
  order: z.number().int().min(0)
});

interface ChartFormProps {
  initialData?: ChartFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export const ChartForm = ({ initialData, isEdit = false, onSuccess }: ChartFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: fetchedChart, isLoading } = useQuery({
    queryKey: ['/api/charts', initialData?.id],
    queryFn: async () => {
      if (isEdit && initialData?.id) {
        const res = await fetch(`/api/charts/${initialData.id}`);
        if (!res.ok) throw new Error('Failed to fetch chart');
        return res.json();
      }
      return null;
    },
    enabled: isEdit && !!chartData?.id,
  });

  const defaultChartData: ChartData = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Dados',
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  const defaultValues: ChartFormData = {
    pageType: "home" as PageType,
    title: "",
    description: "",
    chartType: "bar",
    chartData: defaultChartData,
    active: true,
    order: 0
  };

  const form = useForm<ChartFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fetchedChart || chartData || defaultValues,
  });

  if (isEdit && fetchedChart && !form.formState.isDirty) {
    form.reset(fetchedChart);
  }

  const handleDatasetChange = (index: number, key: string, value: any) => {
    const currentData = form.getValues('chartData');
    const updatedDatasets = [...currentData.datasets];
    updatedDatasets[index][key] = value;

    const updatedChartData: ChartData = {
      ...currentData,
      datasets: updatedDatasets
    };

    form.setValue('chartData', updatedChartData, { shouldValidate: true });
  };

  const handleLabelsChange = (labels: string) => {
    const labelArray = labels.split(',').map(label => label.trim());
    const currentData = form.getValues('chartData');

    const updatedChartData: ChartData = {
      ...currentData,
      labels: labelArray
    };

    form.setValue('chartData', updatedChartData, { shouldValidate: true });
  };

  const handleDataChange = (index: number, data: string) => {
    const dataArray = data.split(',').map(value => Number(value.trim()));
    const currentData = form.getValues('chartData');
    const updatedDatasets = [...currentData.datasets];

    updatedDatasets[index].data = dataArray;

    const updatedChartData: ChartData = {
      ...currentData,
      datasets: updatedDatasets
    };

    form.setValue('chartData', updatedChartData, { shouldValidate: true });
  };

  const onSubmit = async (data: ChartFormData) => {
    try {
      setIsSubmitting(true);
      if (isEdit && chartData?.id) {
        await apiRequest("PUT", `/api/charts/${chartData.id}`, data);
        toast({
          title: "Gráfico atualizado",
          description: "O gráfico foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/charts", data);
        form.reset(defaultValues);
        toast({
          title: "Gráfico criado",
          description: "O gráfico foi criado com sucesso.",
        });
      }
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

  if (isEdit && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Gráfico...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 animate-pulse rounded" />
            <div className="h-10 bg-gray-100 animate-pulse rounded" />
            <div className="h-10 bg-gray-100 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = form.watch('chartData');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Gráfico" : "Novo Gráfico"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="pageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Página</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="home">Página Inicial</option>
                        <option value="agriculture">Agricultura</option>
                        <option value="fishing">Pesca</option>
                        <option value="paa">PAA</option>
                      </select>
                    </FormControl>
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
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="bar">Barras</option>
                        <option value="horizontalBar">Barras Horizontais</option>
                        <option value="line">Linha</option>
                        <option value="pie">Pizza</option>
                      </select>
                    </FormControl>
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
                    <Input {...field} placeholder="Título do gráfico" />
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
                      placeholder="Descrição do gráfico..."
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="border p-4 rounded-md">
              <h3 className="font-medium mb-4">Dados do Gráfico</h3>

              <div className="space-y-4">
                <div>
                  <FormLabel>Rótulos (separados por vírgula)</FormLabel>
                  <Input 
                    value={chartData?.labels.join(', ')} 
                    onChange={(e) => handleLabelsChange(e.target.value)}
                    placeholder="Ex: Jan, Fev, Mar, Abr, Mai, Jun" 
                  />
                </div>
                {chartData?.datasets.map((dataset, index) => (
                  <div key={index} className="border p-3 rounded">
                    <h4 className="font-medium mb-2">Conjunto de Dados {index + 1}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <FormLabel>Rótulo</FormLabel>
                        <Input 
                          value={dataset.label || ''} 
                          onChange={(e) => handleDatasetChange(index, 'label', e.target.value)}
                          placeholder="Nome da série de dados" 
                        />
                      </div>

                      <div>
                        <FormLabel>Cor</FormLabel>
                        <div className="flex space-x-2">
                          <Input 
                            type="color"
                            value={Array.isArray(dataset.backgroundColor) 
                              ? dataset.backgroundColor[0] 
                              : (dataset.backgroundColor || '#4F46E5')} 
                            onChange={(e) => handleDatasetChange(index, 'backgroundColor', e.target.value)}
                            className="w-20" 
                          />
                          <Input 
                            type="color"
                            value={Array.isArray(dataset.borderColor) 
                              ? dataset.borderColor[0] 
                              : (dataset.borderColor || '#4338CA')} 
                            onChange={(e) => handleDatasetChange(index, 'borderColor', e.target.value)}
                            className="w-20" 
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <FormLabel>Valores (separados por vírgula)</FormLabel>
                      <Input 
                        value={dataset.data.join(', ')} 
                        onChange={(e) => handleDataChange(index, e.target.value)}
                        placeholder="Ex: 12, 19, 3, 5, 2, 3" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChartForm;