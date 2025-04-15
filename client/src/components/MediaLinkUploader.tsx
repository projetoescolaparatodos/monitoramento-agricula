
import React, { useState, FormEvent } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useToast } from '../hooks/use-toast';

interface MediaLinkUploaderProps {
  onLinkSubmit: (url: string) => void;
  title?: string;
}

const MediaLinkUploader = ({ onLinkSubmit, title = "Adicionar mídia por link" }: MediaLinkUploaderProps) => {
  const [url, setUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); // Impede o comportamento padrão de submissão do formulário
    
    if (!url.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma URL válida",
        variant: "destructive"
      });
      return;
    }
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast({
        title: "Erro",
        description: "A URL deve começar com http:// ou https://",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se é um vídeo para informar ao usuário
    const isVideo = 
      url.endsWith(".mp4") || 
      url.endsWith(".webm") || 
      url.endsWith(".ogg") || 
      url.endsWith(".mov") || 
      url.includes("youtube.com") || 
      url.includes("youtu.be") || 
      url.includes("vimeo.com");
      
    if (isVideo) {
      console.log("Link de vídeo detectado:", url);
    }
    
    try {
      setIsSubmitting(true);
      
      // Salvar mídia no localStorage para recuperação em caso de perda
      try {
        const formData = JSON.parse(localStorage.getItem('currentFormData') || '{}');
        localStorage.setItem('lastUploadedMedia', JSON.stringify([...formData.midias || [], url]));
      } catch (error) {
        console.error('Erro ao salvar mídia no armazenamento local:', error);
      }
      
      // Enviar a URL para o componente pai
      onLinkSubmit(url);
      
      // Limpar o campo após envio bem-sucedido
      setUrl('');
      
      toast({
        title: "Sucesso",
        description: "Link de mídia adicionado com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar mídia por link:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a mídia",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <Input
            type="url"
            placeholder="https://exemplo.com/imagem.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Adicionando..." : "Adicionar Mídia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MediaLinkUploader;
