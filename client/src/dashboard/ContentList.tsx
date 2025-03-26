import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ContentItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface ContentListProps {
  onEdit: (id: number) => void;
}

const ContentList = ({ onEdit }: ContentListProps) => {
  const { data: contents, isLoading } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents'],
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      setIsDeleting(true);
      await apiRequest("DELETE", `/api/contents/${contentToDelete}`, undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/contents'] });
      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setContentToDelete(id);
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
    <Card>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !contents || contents.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-dark mb-4">Nenhum conteúdo cadastrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Seção</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contents.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">{content.title}</TableCell>
                  <TableCell>{getPageTypeName(content.pageType)}</TableCell>
                  <TableCell>{content.sectionType}</TableCell>
                  <TableCell>
                    <Badge variant={content.active ? "default" : "outline"}>
                      {content.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(content.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(content.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja excluir este conteúdo? Esta ação não pode ser desfeita.
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
    </Card>
  );
};

export default ContentList;
