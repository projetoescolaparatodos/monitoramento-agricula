
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChartItem } from "../../types";
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
import { db } from '../../utils/firebase';
import { doc, deleteDoc } from "firebase/firestore";

interface ChartListProps {
  onEdit: (id: number) => void;
}

export const ChartList = ({ onEdit }: ChartListProps) => {
  const { data: charts, isLoading } = useQuery<ChartItem[]>({
    queryKey: ['/api/charts'],
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chartToDelete, setChartToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!chartToDelete) return;
    
    try {
      setIsDeleting(true);
      const docRef = doc(db, 'charts', chartToDelete);
      await deleteDoc(docRef);
      
      queryClient.invalidateQueries({ queryKey: ['charts'] });
      toast({
        title: "Gráfico excluído",
        description: "O gráfico foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir o gráfico.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setChartToDelete(id);
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

  const getChartTypeName = (chartType: string) => {
    switch (chartType) {
      case 'bar': return 'Barras';
      case 'horizontalBar': return 'Barras Horizontais';
      case 'line': return 'Linha';
      case 'pie': return 'Pizza';
      default: return chartType;
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
        ) : !charts || charts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-neutral-dark mb-4">Nenhum gráfico cadastrado.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {charts.map((chart) => (
                <TableRow key={chart.id}>
                  <TableCell className="font-medium">{chart.title}</TableCell>
                  <TableCell>{getPageTypeName(chart.pageType)}</TableCell>
                  <TableCell>{getChartTypeName(chart.chartType)}</TableCell>
                  <TableCell>{chart.order}</TableCell>
                  <TableCell>
                    <Badge variant={chart.active ? "default" : "outline"}>
                      {chart.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(chart.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(chart.id)}
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
              Tem certeza de que deseja excluir este gráfico? Esta ação não pode ser desfeita.
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

export default ChartList;
