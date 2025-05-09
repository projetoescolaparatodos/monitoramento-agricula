import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MediaFormData, PageType } from "../../types";
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
  mediaType: z.string(),
  mediaUrl: z.string().url("URL inválida"),
  thumbnailUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  active: z.boolean().default(true),
  order: z.number().int().min(0)
});

interface MediaUploaderProps {
  mediaData?: MediaFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export const MediaUploader = ({ mediaData, isEdit = false, onSuccess }: MediaUploaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const { data: fetchedMedia, isLoading } = useQuery({
    queryKey: ['/api/media-items', mediaData?.id],
    queryFn: async () => {
      if (isEdit && mediaData?.id) {
        const res = await fetch(`/api/media-items/${mediaData.id}`);
        if (!res.ok) throw new Error('Failed to fetch media');
        return res.json();
      }
      return null;
    },
    enabled: isEdit && !!mediaData?.id,
  });

  const defaultValues: MediaFormData = {
    pageType: "home" as PageType,
    title: "",
    description: "",
    mediaType: "image",
    mediaUrl: "",
    thumbnailUrl: "",
    active: true,
    order: 0
  };

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: fetchedMedia || mediaData || defaultValues,
  });

  if (isEdit && fetchedMedia && !form.formState.isDirty) {
    form.reset(fetchedMedia);
  }

  const onSubmit = async (data: MediaFormData) => {
    try {
      setIsSubmitting(true);
      if (isEdit && mediaData?.id) {
        await apiRequest("PUT", `/api/media-items/${mediaData.id}`, data);
        toast({
          title: "Mídia atualizada",
          description: "O item de mídia foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/media-items", data);
        form.reset(defaultValues);
        toast({
          title: "Mídia criada",
          description: "O item de mídia foi criado com sucesso.",
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/media-items'] });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o item de mídia.",
        variant: "destructive",
      });
      console.error("Error submitting media:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEdit && isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Carregando Mídia...</CardTitle>
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

  const mediaUrl = form.watch('mediaUrl');
  const mediaType = form.watch('mediaType');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Editar Mídia" : "Nova Mídia"}</CardTitle>
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
                        <option value="sim">SIM</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mídia</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="image">Imagem</option>
                        <option value="video">Vídeo</option>
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
                    <Input {...field} placeholder="Título da mídia" />
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
                      placeholder="Descrição da mídia..."
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mediaUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Mídia</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/image.jpg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mediaType === "video" && (
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Miniatura (opcional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="https://example.com/thumbnail.jpg"
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {mediaUrl && (
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-2">Pré-visualização</h3>
                {mediaType === "image" ? (
                  <div className="mt-2 rounded-md overflow-hidden max-h-60 flex justify-center">
                    <img 
                      src={mediaUrl} 
                      alt="Preview"
                      className="max-w-full h-auto object-contain" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Imagem+não+encontrada';
                      }}
                    />
                  </div>
                ) : (
                  <div className="mt-2 bg-gray-100 rounded-md p-4 text-center">
                    <p>Vídeo: {mediaUrl}</p>
                  </div>
                )}
              </div>
            )}
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
                        A mídia será exibida no site quando ativa
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

export default MediaUploader;