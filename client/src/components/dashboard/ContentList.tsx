
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import { ContentItem } from '@/types';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ContentListProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ContentList = ({ onEdit, onDelete }: ContentListProps) => {
  const { data: contents, isLoading, refetch } = useQuery<ContentItem[]>({
    queryKey: ['contents'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(db, 'contents'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ContentItem));
    }
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const getPageTypeName = (pageType: string) => {
    const types = {
      home: 'Página Inicial',
      agriculture: 'Agricultura',
      fishing: 'Pesca',
      paa: 'PAA'
    };
    return types[pageType as keyof typeof types] || pageType;
  };

  const handleDeleteClick = (id: string) => {
    setContentToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contentToDelete) return;

    try {
      await deleteDoc(doc(db, 'contents', contentToDelete));
      await refetch();
      toast({
        title: "Conteúdo excluído",
        description: "O conteúdo foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
      onDelete(contentToDelete);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o conteúdo.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead>Página</TableHead>
            <TableHead>Ordem</TableHead>
            <TableHead>Data de Criação</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contents && contents.map((content) => (
            <TableRow key={content.id}>
              <TableCell>{content.title}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {getPageTypeName(content.pageType)}
                </Badge>
              </TableCell>
              <TableCell>{content.order || 0}</TableCell>
              <TableCell>
                {new Date(content.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(content.id)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteClick(content.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este conteúdo? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ContentList;
