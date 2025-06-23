
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  label: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  value: z.string().min(1, "O valor é obrigatório"),
  trend: z.string().optional(),
  trendValue: z.string().optional(),
  isPositive: z.boolean(),
  order: z.number(),
  active: z.boolean(),
  pageType: z.string().min(1, "O tipo de página é obrigatório")
});

export type StatisticFormData = z.infer<typeof formSchema>;

interface StatisticFormProps {
  statisticData?: { id: number } & Partial<StatisticFormData>;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const StatisticForm = ({ statisticData, isEdit = false, onSuccess }: StatisticFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const defaultValues: StatisticFormData = {
    label: "",
    value: "",
    trend: "",
    trendValue: "",
    isPositive: true,
    order: 0,
    active: true,
    pageType: "home"
  };

  // Preparar dados para edição
  const editData = isEdit && statisticData ? {
    label: statisticData.label || "",
    value: statisticData.value || "",
    trend: statisticData.trend || "",
    trendValue: statisticData.trendValue || "",
    isPositive: statisticData.isPositive !== undefined ? statisticData.isPositive : true,
    order: statisticData.order || 0,
    active: statisticData.active !== undefined ? statisticData.active : true,
    pageType: statisticData.pageType || "home"
  } : defaultValues;

  const form = useForm<StatisticFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: editData,
  });

  // Resetar formulário quando os dados chegarem para edição
  useEffect(() => {
    if (isEdit && statisticData) {
      form.reset(editData);
    }
  }, [statisticData, isEdit, form]);

  const onSubmit = async (data: StatisticFormData) => {
    try {
      setIsSubmitting(true);
      const endpoint = isEdit && statisticData?.id 
        ? `/api/statistics/${statisticData.id}`
        : '/api/statistics';
      
      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Falha ao salvar estatística');

      toast({
        title: isEdit ? "Estatística atualizada" : "Estatística criada",
        description: "Operação realizada com sucesso!",
      });

      if (onSuccess) onSuccess();
      if (!isEdit) form.reset(defaultValues);
      
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a estatística.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="pageType">Tipo de Página</Label>
            <Select 
              value={form.watch("pageType")} 
              onValueChange={(value) => form.setValue("pageType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="home">Página Inicial</SelectItem>
                <SelectItem value="agriculture">Agricultura</SelectItem>
                <SelectItem value="fishing">Pesca</SelectItem>
                <SelectItem value="paa">PAA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="label">Título da Estatística</Label>
            <Input
              id="label"
              {...form.register("label")}
              className="mt-1"
              placeholder="Ex: Total de Agricultores"
            />
            {form.formState.errors.label && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.label.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="value">Valor</Label>
            <Input
              id="value"
              {...form.register("value")}
              className="mt-1"
              placeholder="Ex: 1500"
            />
            {form.formState.errors.value && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.value.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="trend">Tendência</Label>
            <Input
              id="trend"
              {...form.register("trend")}
              className="mt-1"
              placeholder="Ex: Aumento de"
            />
          </div>

          <div>
            <Label htmlFor="trendValue">Valor da Tendência</Label>
            <Input
              id="trendValue"
              {...form.register("trendValue")}
              className="mt-1"
              placeholder="Ex: 15%"
            />
          </div>

          <div>
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              {...form.register("order", { valueAsNumber: true })}
              className="mt-1"
              placeholder="Ex: 1"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPositive"
              checked={form.watch("isPositive")}
              onCheckedChange={(checked) => form.setValue("isPositive", checked)}
            />
            <Label htmlFor="isPositive">Tendência Positiva</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={form.watch("active")}
              onCheckedChange={(checked) => form.setValue("active", checked)}
            />
            <Label htmlFor="active">Ativo</Label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            isEdit ? "Atualizar Estatística" : "Criar Estatística"
          )}
        </Button>
      </form>
    </Card>
  );
};

export default StatisticForm;
