
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "../../types";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { db } from '../../utils/firebase';
import { doc, deleteDoc } from "firebase/firestore";
import { Clock } from "lucide-react";

interface MediaListProps {
  onEdit: (id: number) => void;
}

export const MediaList = ({ onEdit }: MediaListProps) => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!mediaToDelete) return;

    try {
      setIsDeleting(true);
      const docRef = doc(db, 'media', mediaToDelete);
      await deleteDoc(docRef);

      queryClient.invalidateQueries({ queryKey: ['media'] });
      toast({
        title: "Mídia excluída",
        description: "A mídia foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a mídia.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setMediaToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const getPageTypeName = (pageType: string) => {
    switch (pageType) {
      case 'home': return 'Página Inicial';
      case 'agriculture': return 'Agricultura';
      case 'fishing': return 'Pesca';
      case 'paa': return 'PAA';
      case 'sim': return 'SIM';
      default: return pageType;
    }
  };

  // Ordenar mídias por mais recentes (usando createdAt ou updatedAt)
  const sortedMediaItems = mediaItems?.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Função para renderizar HTML formatado de forma segura
  const renderFormattedText = (text: string, maxLength: number = 100) => {
    if (!text) return '';
    
    // Verificar se contém HTML
    const hasHtml = /<[^>]*>/.test(text);
    
    if (hasHtml) {
      // Se contém HTML, truncar considerando o texto limpo
      const cleanText = text.replace(/<[^>]*>/g, '');
      const shouldTruncate = cleanText.length > maxLength;
      const displayText = shouldTruncate 
        ? cleanText.substring(0, maxLength) + '...'
        : text;
      
      return (
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ 
            __html: shouldTruncate 
              ? displayText.replace(/\n/g, '<br/>') 
              : text.replace(/\n/g, '<br/>') 
          }} 
        />
      );
    } else {
      // Se não contém HTML, truncar normalmente
      const shouldTruncate = text.length > maxLength;
      const displayText = shouldTruncate 
        ? text.substring(0, maxLength) + '...'
        : text;
      
      return (
        <p className="text-sm text-neutral-dark line-clamp-3">
          {displayText.split('\n').map((line, index) => (
            <span key={index}>
              {line}
              {index < displayText.split('\n').length - 1 && <br />}
            </span>
          ))}
        </p>
      );
    }
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-72 w-full rounded-md" />
          ))}
        </div>
      ) : !sortedMediaItems || sortedMediaItems.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-neutral-dark mb-4">Nenhum item de mídia cadastrado.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedMediaItems.map((media) => (
            <Card key={media.id} className="overflow-hidden">
              <div className="relative h-40">
                {media.mediaType === "image" ? (
                  <img
                    src={media.mediaUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Imagem+não+encontrada';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-primary-dark" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={media.active ? "default" : "outline"}>
                    {media.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    {/* Título com suporte a HTML */}
                    {/<[^>]*>/.test(media.title) ? (
                      <h3 
                        className="font-semibold text-secondary truncate"
                        dangerouslySetInnerHTML={{ __html: media.title }}
                      />
                    ) : (
                      <h3 className="font-semibold text-secondary truncate">{media.title}</h3>
                    )}
                    <p className="text-xs text-neutral">{getPageTypeName(media.pageType)}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded ml-2">Ordem: {media.order}</span>
                </div>

                {/* Data de criação/atualização */}
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>
                    {formatDate(media.updatedAt || media.createdAt)}
                  </span>
                </div>

                {/* Descrição com suporte a HTML */}
                {media.description && (
                  <div className="mt-2">
                    {renderFormattedText(media.description, 120)}
                  </div>
                )}

                {/* Informações adicionais */}
                {(media.author || media.location) && (
                  <div className="mt-2 text-xs text-gray-500">
                    {media.author && <div>👤 {media.author}</div>}
                    {media.location && <div>📍 {media.location}</div>}
                  </div>
                )}

                {/* URL do Instagram se disponível */}
                {media.instagramUrl && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      📱 Instagram
                    </Badge>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(media)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => openDeleteDialog(media.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este item de mídia? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MediaList;
