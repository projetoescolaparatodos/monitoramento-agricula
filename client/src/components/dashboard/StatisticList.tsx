
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
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatisticItem {
  id: string;
  label: string;
  value: string;
  trend?: string;
  trendValue?: string;
  isPositive: boolean;
  order: number;
  active: boolean;
  pageType: string;
}

interface StatisticListProps {
  onEdit: (id: string) => void;
}

const StatisticList = ({ onEdit }: StatisticListProps) => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statisticToDelete, setStatisticToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!statisticToDelete) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/statistics/${statisticToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Falha ao excluir estatística');

      queryClient.invalidateQueries({ queryKey: ['/api/statistics'] });
      toast({
        title: "Estatística excluída",
        description: "A estatística foi excluída com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a estatística.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageTypeLabel = (type: string) => {
    const types = {
      home: "Página Inicial",
      agriculture: "Agricultura",
      fishing: "Pesca",
      paa: "PAA"
    };
    return types[type as keyof typeof types] || type;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {statistics?.map((statistic) => (
        <Card key={statistic.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{statistic.label}</h3>
                <Badge variant={statistic.active ? "default" : "secondary"}>
                  {statistic.active ? "Ativo" : "Inativo"}
                </Badge>
                <Badge variant="outline">{getPageTypeLabel(statistic.pageType)}</Badge>
              </div>
              <p className="text-2xl font-bold">{statistic.value}</p>
              {statistic.trend && (
                <p className={`text-sm ${statistic.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {statistic.trend} {statistic.trendValue}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onEdit(statistic.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="text-red-500 hover:text-red-700"
                onClick={() => {
                  setStatisticToDelete(statistic.id);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta estatística? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : (
                "Excluir"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StatisticList;
