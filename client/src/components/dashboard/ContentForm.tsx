
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ContentFormData } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const formSchema = z.object({
  pageType: z.string(),
  sectionType: z.string(),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  content: z.string().min(10, "Conteúdo deve ter pelo menos 10 caracteres"),
  active: z.boolean().default(true),
});

interface ContentFormProps {
  contentData?: ContentFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export const ContentForm = ({ contentData, isEdit = false, onSuccess }: ContentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: fetchedContent, isLoading } = useQuery({
    queryKey: ['/api/contents', contentData?.id],
    queryFn: async () => {
      if (isEdit && contentData?.id) {
        const res = await fetch(`/api/contents/${contentData.id}`);
        if (!res.ok) throw new Error('Failed to fetch content');
        return res.json();
      }
      return null;
    },
    enabled: isEdit && !!contentData?.id,
  });

  const defaultValues: ContentFormData = {
    pageType: "home",
    sectionType: "info",
    title: "",
    content: "",
    active: true,
  };

  const form = useForm<ContentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fetchedContent || contentData || defaultValues,
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
        form.reset(defaultValues);
        toast({
          title: "Conteúdo criado",
          description: "O conteúdo foi criado com sucesso.",
        });
      }
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
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Conteúdo...</CardTitle>
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
                name="sectionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seção</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="hero">Hero</option>
                        <option value="info">Informativo</option>
                        <option value="about">Sobre</option>
                        <option value="contact">Contato</option>
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
                    <Input {...field} placeholder="Título do conteúdo" />
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
                      placeholder="Escreva o conteúdo aqui..."
                      className="min-h-[200px]"
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
