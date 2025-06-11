import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { db, storage } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  pageType: z.string().min(1, "Tipo de página é obrigatório"),
  mediaType: z.enum(["image", "video", "youtube"]),
  youtubeUrl: z.string().optional(),
  file: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const MediaUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      pageType: "",
      mediaType: "image",
      youtubeUrl: "",
    },
  });

  const watchedMediaType = form.watch("mediaType");

  const onSubmit = async (data: FormData) => {
    try {
      setIsUploading(true);

      let mediaUrl = "";
      let thumbnailUrl = "";

      if (data.mediaType === "youtube" && data.youtubeUrl) {
        mediaUrl = data.youtubeUrl;
        // Extract YouTube video ID for thumbnail
        const videoId = data.youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      } else if (data.file && data.file[0]) {
        const file = data.file[0];
        const fileRef = ref(storage, `media/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        mediaUrl = await getDownloadURL(fileRef);

        if (data.mediaType === "image") {
          thumbnailUrl = mediaUrl;
        }
      }

      await addDoc(collection(db, "mediaItems"), {
        title: data.title,
        description: data.description,
        pageType: data.pageType,
        mediaType: data.mediaType,
        mediaUrl,
        thumbnailUrl,
        createdAt: serverTimestamp(),
        active: true,
      });

      toast({
        title: "Sucesso",
        description: "Mídia enviada com sucesso!",
      });

      form.reset({
        title: "",
        description: "",
        pageType: "",
        mediaType: "image",
        youtubeUrl: "",
      });
    } catch (error) {
      console.error("Erro ao enviar mídia:", error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mídia. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Configuração do ReactQuill sem findDOMNode
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['link'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  };

  const quillFormats = [
    'header', 'bold', 'italic', 'underline', 'link', 'list', 'bullet'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Nova Mídia</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} />
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
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <div style={{ height: '200px' }}>
                      <ReactQuill
                        theme="snow"
                        value={field.value || ""}
                        onChange={field.onChange}
                        modules={quillModules}
                        formats={quillFormats}
                        style={{ height: '150px' }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pageType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Página</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de página" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || "image"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de mídia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="image">Imagem</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedMediaType === "youtube" && (
              <FormField
                control={form.control}
                name="youtubeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do YouTube</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={field.value || ""} 
                        placeholder="https://www.youtube.com/watch?v=..." 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {watchedMediaType !== "youtube" && (
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel>
                      {watchedMediaType === "image" ? "Arquivo de Imagem" : "Arquivo de Vídeo"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept={watchedMediaType === "image" ? "image/*" : "video/*"}
                        onChange={(e) => onChange(e.target.files)}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isUploading} className="w-full">
              {isUploading ? "Enviando..." : "Enviar Mídia"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default MediaUploader;