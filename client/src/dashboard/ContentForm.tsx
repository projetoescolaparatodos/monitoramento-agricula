import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { ContentFormData } from "@/types";
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

// Form validation schema
const formSchema = z.object({
  pageType: z.enum(["home", "agriculture", "fishing", "paa"]),
  sectionType: z.string().min(2, "Tipo de seção é obrigatório"),
  title: z.string().min(5, "Título deve ter pelo menos 5 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  active: z.boolean().default(true),
});

interface ContentFormProps {
  contentData?: ContentFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const ContentForm = ({ contentData, isEdit = false, onSuccess }: ContentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: contentData || {
      pageType: "home",
      sectionType: "info",
      title: "",
      content: "",
      active: true,
    },
  });

  const onSubmit = async (data: ContentFormData) => {
    try {
      setIsSubmitting(true);

      if (isEdit && contentData?.id) {
        await apiRequest("PUT", `/api/contents/${contentData.id}`, data);
        toast({
          title: "Conteúdo atualizado",
          description: "O conteúdo foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/contents", data);
        form.reset();
        toast({
          title: "Conteúdo criado",
          description: "O conteúdo foi criado com sucesso.",
        });
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o conteúdo.",
        variant: "destructive",
      });
      console.error("Error submitting content:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Conteúdo" : "Novo Conteúdo"}</CardTitle>
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
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Seção</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: hero, info, statistics" />
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
                    <Input {...field} placeholder="Insira o título" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Insira o conteúdo"
                      rows={6}
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
                      O conteúdo será exibido no site quando ativo
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

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Criar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ContentForm;
