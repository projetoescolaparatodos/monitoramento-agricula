
import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ChartFormData } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart4, LineChart, PieChart, Radar, CircleDashed, Activity, Circle } from 'lucide-react';
import ChartComponent from '@/components/common/ChartComponent';

const chartFormSchema = z.object({
  pageType: z.string({
    required_error: "Selecione o tipo de página"
  }),
  title: z.string().min(2, {
    message: "O título deve ter pelo menos 2 caracteres."
  }),
  description: z.string().optional(),
  chartType: z.string({
    required_error: "Selecione o tipo de gráfico"
  }),
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  chartData: z.object({
    labels: z.array(z.string()).min(1, {
      message: "Adicione pelo menos um rótulo"
    }),
    datasets: z.array(z.object({
      label: z.string().min(1, {
        message: "O rótulo da série deve ter pelo menos 1 caractere"
      }),
      data: z.array(z.number()).min(1, {
        message: "Adicione pelo menos um valor"
      }),
      backgroundColor: z.string().optional(),
      borderColor: z.string().optional(),
      borderWidth: z.number().optional()
    })).min(1, {
      message: "Adicione pelo menos uma série de dados"
    })
  })
});

interface ChartFormProps {
  chartData?: Partial<ChartFormData>;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const ChartForm: React.FC<ChartFormProps> = ({ 
  chartData,
  isEdit = false,
  onSuccess
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [previewData, setPreviewData] = useState<ChartFormData | null>(null);

  const defaultValues: ChartFormData = {
    pageType: chartData?.pageType || 'home',
    title: chartData?.title || '',
    description: chartData?.description || '',
    chartType: chartData?.chartType || 'bar',
    active: chartData?.active !== undefined ? chartData.active : true,
    order: chartData?.order || 0,
    chartData: chartData?.chartData || {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [
        {
          label: 'Valores',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: '#4CAF50',
          borderColor: '#388E3C',
          borderWidth: 1
        }
      ]
    }
  };

  const form = useForm<ChartFormData>({
    resolver: zodResolver(chartFormSchema),
    defaultValues
  });

  const { fields: labelFields, append: appendLabel, remove: removeLabel } = 
    useFieldArray({ control: form.control, name: "chartData.labels" });
    
  const { fields: datasetFields, append: appendDataset, remove: removeDataset } = 
    useFieldArray({ control: form.control, name: "chartData.datasets" });

  const mutation = useMutation({
    mutationFn: (data: ChartFormData) => {
      console.log("Enviando dados para API:", data);
      
      if (isEdit && chartData?.id) {
        return apiRequest('PUT', `/api/charts/${chartData.id}`, data);
      }
      return apiRequest('POST', '/api/charts', data);
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Gráfico atualizado" : "Gráfico criado",
        description: isEdit ? "O gráfico foi atualizado com sucesso." : "O gráfico foi criado com sucesso."
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/charts'] });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Erro ao salvar gráfico:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o gráfico. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const previewChart = () => {
    const values = form.getValues();
    setPreviewData(values);
  };

  const onSubmit = (data: ChartFormData) => {
    const preparedData = {
      ...data,
      chartData: {
        labels: data.chartData.labels,
        datasets: data.chartData.datasets.map(dataset => ({
          label: dataset.label || 'Dados',
          data: dataset.data,
          backgroundColor: dataset.backgroundColor || '#4CAF50',
          borderColor: dataset.borderColor || '#388E3C',
          borderWidth: dataset.borderWidth || 1
        }))
      }
    };
    
    mutation.mutate(preparedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título do Gráfico</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Produção Agrícola 2024" {...field} />
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
                      placeholder="Uma breve descrição dos dados apresentados"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Página</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
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
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ordem</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-4 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel>Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Determina se o gráfico será exibido no site
                    </div>
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
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="chartType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Gráfico</FormLabel>
                  <FormControl>
                    <Tabs 
                      defaultValue={field.value} 
                      onValueChange={field.onChange}
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-4 mb-2">
                        <TabsTrigger value="bar" className="flex flex-col items-center py-3">
                          <BarChart4 className="h-5 w-5 mb-1" />
                          <span className="text-xs">Barras</span>
                        </TabsTrigger>
                        <TabsTrigger value="line" className="flex flex-col items-center py-3">
                          <LineChart className="h-5 w-5 mb-1" />
                          <span className="text-xs">Linhas</span>
                        </TabsTrigger>
                        <TabsTrigger value="pie" className="flex flex-col items-center py-3">
                          <PieChart className="h-5 w-5 mb-1" />
                          <span className="text-xs">Pizza</span>
                        </TabsTrigger>
                        <TabsTrigger value="doughnut" className="flex flex-col items-center py-3">
                          <CircleDashed className="h-5 w-5 mb-1" />
                          <span className="text-xs">Rosca</span>
                        </TabsTrigger>
                      </TabsList>
                      <TabsList className="grid grid-cols-3 mb-2">
                        <TabsTrigger value="radar" className="flex flex-col items-center py-3">
                          <Radar className="h-5 w-5 mb-1" />
                          <span className="text-xs">Radar</span>
                        </TabsTrigger>
                        <TabsTrigger value="polarArea" className="flex flex-col items-center py-3">
                          <Circle className="h-5 w-5 mb-1" />
                          <span className="text-xs">Área Polar</span>
                        </TabsTrigger>
                        <TabsTrigger value="scatter" className="flex flex-col items-center py-3">
                          <Activity className="h-5 w-5 mb-1" />
                          <span className="text-xs">Dispersão</span>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Rótulos (Eixo X)</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendLabel("")}
                >
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                {labelFields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <FormField
                      control={form.control}
                      name={`chartData.labels.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1 m-0">
                          <FormControl>
                            <Input placeholder={`Rótulo ${index + 1}`} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLabel(index)}
                      disabled={labelFields.length <= 1}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormLabel>Séries de Dados</FormLabel>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => appendDataset({
                    label: `Série ${datasetFields.length + 1}`,
                    data: Array(labelFields.length).fill(0),
                    backgroundColor: '',
                    borderColor: '',
                    borderWidth: 1
                  })}
                >
                  Adicionar Série
                </Button>
              </div>
              
              <div className="space-y-4 max-h-80 overflow-y-auto p-2 border rounded-md">
                {datasetFields.map((dataset, datasetIndex) => (
                  <Card key={dataset.id} className="overflow-hidden">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <FormField
                          control={form.control}
                          name={`chartData.datasets.${datasetIndex}.label`}
                          render={({ field }) => (
                            <FormItem className="flex-1 m-0">
                              <FormControl>
                                <Input placeholder="Nome da série" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDataset(datasetIndex)}
                          disabled={datasetFields.length <= 1}
                          className="ml-2"
                        >
                          Remover
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`chartData.datasets.${datasetIndex}.backgroundColor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor de Fundo</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input 
                                    type="color" 
                                    {...field} 
                                    value={field.value || '#4CAF50'}
                                  />
                                </FormControl>
                                <div 
                                  className="h-9 w-9 rounded-md border" 
                                  style={{ backgroundColor: field.value || '#4CAF50' }}
                                />
                              </div>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`chartData.datasets.${datasetIndex}.borderColor`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cor da Borda</FormLabel>
                              <div className="flex items-center gap-2">
                                <FormControl>
                                  <Input 
                                    type="color" 
                                    {...field} 
                                    value={field.value || '#388E3C'}
                                  />
                                </FormControl>
                                <div 
                                  className="h-9 w-9 rounded-md border" 
                                  style={{ backgroundColor: field.value || '#388E3C' }}
                                />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Valores para cada rótulo</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {labelFields.map((label, labelIndex) => (
                            <FormField
                              key={label.id}
                              control={form.control}
                              name={`chartData.datasets.${datasetIndex}.data.${labelIndex}`}
                              render={({ field }) => (
                                <FormItem className="m-0">
                                  <div className="flex items-center">
                                    <span className="w-16 text-sm truncate pr-2">
                                      {form.watch(`chartData.labels.${labelIndex}`) || `Rótulo ${labelIndex + 1}`}:
                                    </span>
                                    <FormControl>
                                      <Input 
                                        type="number" 
                                        step="0.01"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                        value={field.value !== undefined ? field.value : 0}
                                      />
                                    </FormControl>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={previewChart}
          >
            Pré-visualizar Gráfico
          </Button>
          
          <Button 
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Salvando...' : isEdit ? 'Atualizar Gráfico' : 'Criar Gráfico'}
          </Button>
        </div>
        
        {previewData && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">Pré-visualização</h3>
              <div className="h-[350px] w-full">
                {React.createElement(ChartComponent, {
                  chartType: previewData.chartType,
                  chartData: previewData.chartData
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
};

export default ChartForm;
