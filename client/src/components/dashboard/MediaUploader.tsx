import { useState, useEffect } from "react";
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
  pageType: z.enum(["home", "agriculture", "fishing", "paa"]),
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  mediaType: z.string(),
  mediaUrl: z.string().url("URL inválida"),
  thumbnailUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  active: z.boolean().default(true),
  order: z.number().int().min(0),
  author: z.string().optional(),
  authorImageUrl: z.string().url("URL inválida").optional().or(z.literal('')),
  hashtags: z.string().optional(),
  aspectRatio: z.string().optional(),
  instagramUrl: z.string().url("URL inválida").optional().or(z.literal(''))
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
    queryKey: ['/api/media-items', mediaData?.id || mediaData],
    queryFn: async () => {
      const mediaId = mediaData?.id || mediaData;
      console.log('Buscando mídia com ID:', mediaId);
      const res = await fetch(`/api/media-items/${mediaId}`);
      if (!res.ok) throw new Error('Failed to fetch media');
      const data = await res.json();
      console.log('Dados carregados para edição:', data);
      return data;
    },
    enabled: isEdit && !!(mediaData?.id || mediaData),
  });

  const defaultValues: MediaFormData = {
    pageType: "home" as PageType,
    title: "",
    description: "",
    mediaType: "image",
    mediaUrl: "",
    thumbnailUrl: "",
    active: true,
    order: 0,
    author: "",
    authorImageUrl: "",
    hashtags: "",
    aspectRatio: "horizontal",
    instagramUrl: ""
  };

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });
  
  // Log para debug
  console.log("Dados de edição:", { isEdit, mediaData, fetchedMedia });

  // Resetar formulário quando os dados chegarem
  useEffect(() => {
    if (isEdit && fetchedMedia && !isLoading) {
      console.log('Resetando formulário com dados:', fetchedMedia);
      
      const formData = {
        pageType: fetchedMedia.pageType || "home" as PageType,
        title: fetchedMedia.title || "",
        description: fetchedMedia.description || "",
        mediaType: fetchedMedia.mediaType || "image", 
        mediaUrl: fetchedMedia.mediaUrl || "",
        thumbnailUrl: fetchedMedia.thumbnailUrl || "",
        active: fetchedMedia.active !== undefined ? fetchedMedia.active : true,
        order: fetchedMedia.order || 0,
        // Campos adicionais se existirem
        author: fetchedMedia.author || "",
        authorImageUrl: fetchedMedia.authorImageUrl || "",
        hashtags: fetchedMedia.hashtags || "",
        aspectRatio: fetchedMedia.aspectRatio || "horizontal",
        instagramUrl: fetchedMedia.instagramUrl || ""
      };
      
      console.log('Dados formatados para o formulário:', formData);
      form.reset(formData);
    } else if (!isEdit) {
      // Se não é edição, usar valores padrão
      form.reset(defaultValues);
    }
  }, [fetchedMedia, isEdit, isLoading, form]);

  const onSubmit = async (data: MediaFormData) => {
    try {
      console.log("Dados a serem enviados:", data);
      setIsSubmitting(true);
      if (isEdit && (mediaData?.id || mediaData)) {
        const mediaId = mediaData?.id || mediaData;
        await apiRequest("PUT", `/api/media-items/${mediaId}`, data);
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

      // Invalidar todas as queries relacionadas a media para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: ['/api/media-items'] });
      queryClient.invalidateQueries({ queryKey: ['media'] });
      queryClient.invalidateQueries({ queryKey: ['media', 'sim'] });
      
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
              <div className="space-y-4">
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
                
                {/* Upload de thumbnail personalizada */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Upload de Thumbnail Personalizada</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Faça upload de uma imagem para usar como thumbnail do vídeo (recomendado para vídeos do Google Drive)
                  </p>
                  <MediaFileUploader 
                    onFileUploaded={(url) => form.setValue('thumbnailUrl', url)}
                    acceptTypes="image/*"
                    folderPath="thumbnails"
                    pageType={form.watch("pageType") as 'home' | 'agriculture' | 'fishing' | 'paa' | 'sim'}
                    buttonText="Escolher Thumbnail"
                    maxFileSizeMB={5}
                  />
                  {form.watch('thumbnailUrl') && (
                    <div className="mt-3">
                      <p className="text-sm text-green-600 mb-2">✅ Thumbnail carregada:</p>
                      <img 
                        src={form.watch('thumbnailUrl')} 
                        alt="Thumbnail" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Componente de upload com passagem correta do pageType */}
            <div className="mt-4">
              <MediaFileUploader 
                onFileUploaded={(url) => form.setValue('mediaUrl', url)}
                acceptTypes={mediaType === "image" ? "image/*" : "video/*"}
                folderPath={`midias/${mediaType}`}
                pageType={form.watch("pageType") as 'home' | 'agriculture' | 'fishing' | 'paa' | 'sim'}
              />
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
                  <div className="mt-2 space-y-3">
                    <div className="bg-gray-100 rounded-md p-4 text-center">
                      <p className="text-sm text-gray-600">Vídeo: {mediaUrl}</p>
                    </div>
                    
                    {form.watch('thumbnailUrl') && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Thumbnail Personalizada:</h4>
                        <div className="relative inline-block">
                          <img 
                            src={form.watch('thumbnailUrl')} 
                            alt="Thumbnail Preview"
                            className="max-w-xs h-auto object-cover rounded border" 
                          />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded">
                            <div className="bg-white/90 rounded-full p-2">
                              <Play size={20} className="text-gray-800 ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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