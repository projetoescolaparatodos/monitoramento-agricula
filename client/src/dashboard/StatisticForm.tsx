import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { StatisticFormData } from "@/types";
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
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

// Form validation schema
const formSchema = z.object({
  label: z.string().min(2, "Rótulo deve ter pelo menos 2 caracteres"),
  value: z.string().min(1, "Valor é obrigatório"),
  trend: z.string().optional(),
  trendValue: z.string().optional(),
  isPositive: z.boolean().default(true),
  order: z.number().int().min(0),
  active: z.boolean().default(true),
});

interface StatisticFormProps {
  statisticData?: { id: number } & Partial<StatisticFormData>;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const StatisticForm = ({ statisticData, isEdit = false, onSuccess }: StatisticFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch statistic data if in edit mode
  const { data: fetchedStatistic, isLoading } = useQuery({
    queryKey: ['/api/statistics', statisticData?.id],
    queryFn: async () => {
      if (isEdit && statisticData?.id) {
        const res = await fetch(`/api/statistics/${statisticData.id}`);
        if (!res.ok) throw new Error('Failed to fetch statistic');
        return res.json();
      }
      return null;
    },
    enabled: isEdit && !!statisticData?.id,
  });

  const defaultValues: StatisticFormData = {
    label: "",
    value: "",
    trend: "",
    trendValue: "",
    isPositive: true,
    order: 0,
    active: true,
  };

  const form = useForm<StatisticFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fetchedStatistic || statisticData || defaultValues,
  });

  // Update form when fetched data is available
  if (isEdit && fetchedStatistic && !form.formState.isDirty) {
    form.reset(fetchedStatistic);
  }

  const onSubmit = async (data: StatisticFormData) => {
    try {
      setIsSubmitting(true);

      if (isEdit && statisticData?.id) {
        await apiRequest("PUT", `/api/statistics/${statisticData.id}`, data);
        toast({
          title: "Estatística atualizada",
          description: "A estatística foi atualizada com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/statistics", data);
        form.reset(defaultValues);
        toast({
          title: "Estatística criada",
          description: "A estatística foi criada com sucesso.",
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a estatística.",
        variant: "destructive",
      });
      console.error("Error submitting statistic:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Estatística...</CardTitle>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Estatística" : "Nova Estatística"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rótulo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Hectares Cultivados" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: 42.8 milhões" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="trend"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tendência (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 3.2% em relação ao ano anterior" value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trendValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor da Tendência (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: 3.2" value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isPositive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Tendência Positiva</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      A tendência deve ser exibida como positiva
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
                        A estatística será exibida no site quando ativa
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

export default StatisticForm;
