import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MediaFormData } from "@/types";
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
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  mediaType: z.enum(["image", "video"]),
  mediaUrl: z.string().url("URL inválida"),
  thumbnailUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  active: z.boolean().default(true),
  order: z.number().int().min(0),
});

interface MediaUploaderProps {
  mediaData?: MediaFormData;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const MediaUploader = ({ mediaData, isEdit = false, onSuccess }: MediaUploaderProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(mediaData?.mediaUrl || "");
  const { toast } = useToast();

  const form = useForm<MediaFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: mediaData || {
      pageType: "agriculture",
      title: "",
      description: "",
      mediaType: "image",
      mediaUrl: "",
      thumbnailUrl: "",
      active: true,
      order: 0,
    },
  });

  const watchMediaUrl = form.watch("mediaUrl");
  const watchMediaType = form.watch("mediaType");

  // Update preview URL when media URL changes
  if (watchMediaUrl !== previewUrl) {
    setPreviewUrl(watchMediaUrl);
  }

  //Improved YouTube URL validation
  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=)|youtu\.be\/)([^#&\?]*)/;
    return youtubeRegex.test(url);
  };

  const onSubmit = async (data: MediaFormData) => {
    try {
      setIsSubmitting(true);

      // Validate YouTube URL if media type is video
      if (data.mediaType === "video" && !isValidYoutubeUrl(data.mediaUrl)) {
        toast({
          title: "Erro",
          description: "Por favor, insira uma URL válida do YouTube.",
          variant: "destructive",
        });
        return;
      }

      if (isEdit && mediaData?.id) {
        await apiRequest("PUT", `/api/media-items/${mediaData.id}`, data);
        toast({
          title: "Mídia atualizada",
          description: "O item de mídia foi atualizado com sucesso.",
        });
      } else {
        await apiRequest("POST", "/api/media-items", data);
        form.reset();
        setPreviewUrl("");
        toast({
          title: "Mídia adicionada",
          description: "O item de mídia foi adicionado com sucesso.",
        });
      }

      // Invalidate queries to refresh data
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

  return (
    <Card className="w-full">
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
                name="mediaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Mídia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="image">Imagem</SelectItem>
                        <SelectItem value="video">Vídeo</SelectItem>
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
                    <Input {...field} placeholder="Insira o título da mídia" />
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
                    <Input {...field} placeholder="Nome do autor (opcional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="authorImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Autor (URL)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="URL da imagem do autor (opcional)" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hashtags</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: #agricultura #sustentabilidade" />
                  </FormControl>
                  <FormDescription>
                    Separe as hashtags com espaços. Exemplo: #agricultura #sustentabilidade
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
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
                      placeholder="Insira uma descrição para a mídia"
                      rows={3}
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
                    <Input {...field} placeholder={form.watch("mediaType") === "video" ? "https://www.youtube.com/watch?v=ID_DO_VIDEO" : "Insira a URL da mídia"} />
                  </FormControl>
                  <FormMessage />
                  {form.watch("mediaType") === "video" && !isValidYoutubeUrl(field.value) && (
                    <p className="text-red-500 text-sm">Por favor, insira uma URL válida do YouTube</p>
                  )}
                </FormItem>
              )}
            />

            {watchMediaType === "video" && (
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Miniatura (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Insira a URL da miniatura" value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {previewUrl && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Pré-visualização</h3>
                {watchMediaType === "image" ? (
                  <div className="overflow-hidden rounded-md h-48 w-full">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="object-cover w-full h-full"
                      onError={() => {
                        toast({
                          title: "Erro",
                          description: "Não foi possível carregar a imagem. Verifique a URL.",
                          variant: "destructive",
                        });
                      }}
                    />
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-md aspect-video w-full">
                    <p className="text-sm text-muted-foreground mb-2">Pré-visualização de vídeo não disponível. URL fornecida:</p>
                    <code className="text-xs block p-2 bg-muted rounded">{previewUrl}</code>
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
              {isSubmitting ? "Salvando..." : isEdit ? "Atualizar" : "Adicionar"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;