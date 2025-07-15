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
import MediaFileUploader from "./MediaFileUploader";
import { Play } from "lucide-react";

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
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const { toast } = useToast();

  // Buscar dados da mídia se estiver editando
  const { data: mediaToEdit, isLoading: isLoadingMedia } = useQuery({
    queryKey: [`/api/media-items/${mediaData?.id}`],
    enabled: isEdit && !!mediaData?.id,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/media-items/${mediaData?.id}`, undefined);
      return response;
    }
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
    defaultValues: {
      pageType: "agriculture",
      title: "",
      description: "",
      mediaType: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      active: true,
      order: 0,
      aspectRatio: "horizontal",
      instagramUrl: "",
    },
  });

  // Atualizar formulário quando dados da mídia forem carregados
  useEffect(() => {
    if (mediaToEdit && isEdit) {
      console.log('Carregando dados da mídia para edição:', mediaToEdit);

      // Resetar formulário com dados da mídia
      form.reset({
        pageType: mediaToEdit.pageType || "agriculture",
        title: mediaToEdit.title || "",
        description: mediaToEdit.description || "",
        mediaType: mediaToEdit.mediaType || "image",
        mediaUrl: mediaToEdit.mediaUrl || "",
        thumbnailUrl: mediaToEdit.thumbnailUrl || "",
        active: mediaToEdit.active !== false,
        order: mediaToEdit.order || 0,
        aspectRatio: mediaToEdit.aspectRatio || "horizontal",
        instagramUrl: mediaToEdit.instagramUrl || "",
        author: mediaToEdit.author || "",
        authorImageUrl: mediaToEdit.authorImageUrl || "",
        hashtags: mediaToEdit.hashtags || "",
      });

      // Definir URL de preview
      setPreviewUrl(mediaToEdit.mediaUrl || "");
    }
  }, [mediaToEdit, isEdit, form]);

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

  // Mostrar loading enquanto carrega dados da mídia
  if (isEdit && isLoadingMedia) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Carregando dados da mídia...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Autor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do autor" value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Autor (URL)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com/author.jpg" value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hashtags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Separe as hashtags com espaços. Exemplo: #agricultura #sustentabilidade" value={field.value || ""} />
                  </FormControl>
                  <div className="text-sm text-gray-600">
                    Separe as hashtags com espaços. Exemplo: #agricultura #sustentabilidade
                  </div>
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
            {form.watch("mediaType") === "video" && (
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

            <FormField
              control={form.control}
              name="aspectRatio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proporção do Conteúdo</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded-md"
                      value={field.value || "horizontal"}
                    >
                      <option value="horizontal">Horizontal (16:9)</option>
                      <option value="vertical">Vertical (9:16)</option>
                      <option value="square">Quadrado (1:1)</option>
                    </select>
                  </FormControl>
                  <div className="text-sm text-gray-600">
                    Escolha "Vertical" para vídeos no formato Instagram/TikTok
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="instagramUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link do Instagram (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://instagram.com/p/..." value={field.value || ""} />
                  </FormControl>
                  <div className="text-sm text-gray-600">
                    Cole o link do post do Instagram relacionado a esta mídia
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Componente de upload com passagem correta do pageType */}
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Ou faça upload de um arquivo:</label>
              <MediaFileUploader 
                onFileUploaded={(url) => form.setValue('mediaUrl', url)}
                acceptTypes={form.watch("mediaType") === "image" ? "image/*" : "video/*"}
                folderPath={`midias/${form.watch("mediaType")}`}
                pageType={form.watch("pageType") as 'home' | 'agriculture' | 'fishing' | 'paa' | 'sim'}
                buttonText={form.watch("mediaType") === "image" ? "Upload de Imagem" : "Upload de Vídeo"}
              />
            {form.watch("mediaUrl") && (
              <div className="border p-4 rounded-md">
                <h3 className="font-medium mb-2">Pré-visualização</h3>
                {form.watch("mediaType") === "image" ? (
                  <div className="mt-2 rounded-md overflow-hidden max-h-60 flex justify-center">
                    <img 
                      src={form.watch("mediaUrl")} 
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
                      <p className="text-sm text-gray-600">Vídeo: {form.watch("mediaUrl")}</p>
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