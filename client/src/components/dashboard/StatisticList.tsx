
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatisticItem } from "../../types";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
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

interface StatisticListProps {
  onEdit: (id: number) => void;
}

export const StatisticList = ({ onEdit }: StatisticListProps) => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statisticToDelete, setStatisticToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!statisticToDelete) return;
    
    try {
      setIsDeleting(true);
      const docRef = doc(db, 'statistics', statisticToDelete);
      await deleteDoc(docRef);
      
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast({
        title: "Estatística excluída",
        description: "A estatística foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a estatística.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setStatisticToDelete(id);
    setIsDeleteDialogOpen(true);
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
        ) : !statistics || statistics.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-dark mb-4">Nenhuma estatística cadastrada.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rótulo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((statistic) => (
                <TableRow key={statistic.id}>
                  <TableCell className="font-medium">{statistic.label}</TableCell>
                  <TableCell>{statistic.value}</TableCell>
                  <TableCell>
                    {statistic.trend ? (
                      <span className={statistic.isPositive ? "text-success" : "text-error"}>
                        {statistic.trend}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </TableCell>
                  <TableCell>{statistic.order}</TableCell>
                  <TableCell>
                    <Badge variant={statistic.active ? "default" : "outline"}>
                      {statistic.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(statistic.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(statistic.id)}
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
              Tem certeza de que deseja excluir esta estatística? Esta ação não pode ser desfeita.
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

export default StatisticList;
