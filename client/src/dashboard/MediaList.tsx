import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MediaListProps {
  onEdit: (id: number) => void;
}

const MediaList = ({ onEdit }: MediaListProps) => {
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
      await apiRequest("DELETE", `/api/media-items/${mediaToDelete}`, undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/media-items'] });
      toast({
        title: "Mídia excluída",
        description: "O item de mídia foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o item de mídia.",
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
      default: return pageType;
    }
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-56 w-full rounded-md" />
          ))}
        </div>
      ) : !mediaItems || mediaItems.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-neutral-dark mb-4">Nenhum item de mídia cadastrado.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaItems.map((media) => (
            <Card key={media.id} className="overflow-hidden">
              <div className="relative h-40">
                {media.mediaType === "image" ? (
                  <img
                    src={media.mediaUrl}
                    alt={media.title}
                    className="w-full h-full object-cover"
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
                  <div>
                    <h3 className="font-semibold text-secondary truncate">{media.title}</h3>
                    <p className="text-xs text-neutral">{getPageTypeName(media.pageType)}</p>
                  </div>
                  <span className="text-xs bg-muted px-2 py-1 rounded">Ordem: {media.order}</span>
                </div>
                {media.description && (
                  <p className="text-sm text-neutral-dark mt-2 line-clamp-2">{media.description}</p>
                )}
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(media.id)}
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
