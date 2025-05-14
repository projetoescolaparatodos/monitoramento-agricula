
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
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
import { StatisticItem } from "@/types";

const getPageTypeLabel = (pageType: string) => {
  switch (pageType) {
    case 'home': return 'Página Inicial';
    case 'agriculture': return 'Agricultura';
    case 'fishing': return 'Pesca';
    case 'paa': return 'PAA';
    default: return pageType;
  }
};

interface StatisticListProps {
  onEdit: (id: string) => void;
}

export const StatisticList = ({ onEdit }: StatisticListProps) => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0
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
      console.error("Erro ao excluir estatística:", error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro ao excluir a estatística.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setStatisticToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex justify-between items-center">
            <div className="space-y-2 w-full">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!statistics || statistics.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-gray-500">Nenhuma estatística encontrada.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {statistics.map((statistic) => (
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
                  {statistic.trendValue && `${statistic.trendValue} `}{statistic.trend}
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
