import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InfoPanelItem } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Eye, 
  Info, 
  Users, 
  BarChart2,
  Award,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface InfoPanelListProps {
  infoPanels: InfoPanelItem[];
  isLoading: boolean;
  onEdit: (panel: InfoPanelItem) => void;
  onPreview: (panel: InfoPanelItem) => void;
}

// Mapeamento de nomes de ícones para componentes
const iconMap: Record<string, React.ReactNode> = {
  'Info': <Info size={16} />,
  'Users': <Users size={16} />,
  'BarChart2': <BarChart2 size={16} />,
  'Award': <Award size={16} />,
  'FileText': <FileText size={16} />,
  'ShoppingCart': <ShoppingCart size={16} />,
  'Calendar': <Calendar size={16} />,
  'MapPin': <MapPin size={16} />
};

const InfoPanelList: React.FC<InfoPanelListProps> = ({ infoPanels, isLoading, onEdit, onPreview }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deletePanelId, setDeletePanelId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/info-panels/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/info-panels'] });
      toast({
        title: "Painel excluído",
        description: "O painel informativo foi excluído com sucesso.",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao excluir painel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o painel. Tente novamente.",
        variant: "destructive"
      });
    }
  });

  const confirmDelete = (id: number) => {
    setDeletePanelId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (deletePanelId !== null) {
      deleteMutation.mutate(deletePanelId);
    }
  };

  // Filtra os painéis com base na aba ativa
  const filteredPanels = activeTab === 'all' 
    ? infoPanels 
    : infoPanels.filter(panel => panel.pageType === activeTab);

  // Agrupa painéis por pageType para mostrar contadores
  const panelCounts = infoPanels.reduce((acc, panel) => {
    acc[panel.pageType] = (acc[panel.pageType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue="all" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">
            Todos
            <Badge variant="secondary" className="ml-2">{infoPanels.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="paa">
            PAA
            <Badge variant="secondary" className="ml-2">{panelCounts['paa'] || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agriculture">
            Agricultura
            <Badge variant="secondary" className="ml-2">{panelCounts['agriculture'] || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="fishing">
            Pesca
            <Badge variant="secondary" className="ml-2">{panelCounts['fishing'] || 0}</Badge>
          </TabsTrigger>
          <TabsTrigger value="home">
            Página Inicial
            <Badge variant="secondary" className="ml-2">{panelCounts['home'] || 0}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-500">Carregando painéis...</span>
            </div>
          ) : filteredPanels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPanels
                .sort((a, b) => a.order - b.order)
                .map((panel) => (
                  <Card key={panel.id} className={!panel.active ? "opacity-70" : undefined}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 rounded-md p-1.5 text-primary">
                            {iconMap[panel.icon] || <Info size={16} />}
                          </div>
                          <CardTitle className="text-lg">{panel.title}</CardTitle>
                        </div>
                        <Badge variant={panel.active ? "default" : "outline"}>
                          {panel.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        ID: <code className="bg-muted p-0.5 rounded text-xs">{panel.categoryId}</code>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="capitalize">
                            {panel.pageType === 'paa' ? 'PAA' : panel.pageType}
                          </Badge>
                          <span className="text-xs text-muted-foreground">Ordem: {panel.order}</span>
                        </div>
                        <div className="mt-2 truncate">
                          {panel.content.length > 100 
                            ? panel.content.substring(0, 100).replace(/<\/?[^>]+(>|$)/g, "") + "..." 
                            : panel.content.replace(/<\/?[^>]+(>|$)/g, "")}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <div className="flex justify-between w-full">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onPreview(panel)}
                        >
                          <Eye size={16} className="mr-1" /> Visualizar
                        </Button>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            size="sm" 
                            onClick={() => onEdit(panel)}
                          >
                            <Edit size={16} className="mr-1" /> Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => confirmDelete(panel.id)}
                          >
                            <Trash2 size={16} className="mr-1" /> Excluir
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <Info size={24} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhum painel encontrado</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Não há painéis informativos cadastrados para essa seção. Clique no botão abaixo para criar seu primeiro painel.
                </p>
                <Button onClick={() => onEdit({ id: 0 } as InfoPanelItem)}>
                  <Plus size={16} className="mr-2" />
                  Criar Novo Painel
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este painel? Esta ação não poderá ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Excluindo..." : "Excluir painel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InfoPanelList;