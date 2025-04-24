import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { InfoPanelFormData, InfoPanelItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import InfoPanelList from './InfoPanelList';
import InfoPanelForm from './InfoPanelForm';
import InfoPanelPreview from './InfoPanelPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const InfoPanelManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState<InfoPanelItem | null>(null);
  const [previewPanel, setPreviewPanel] = useState<InfoPanelItem | null>(null);

  // Query para buscar painéis informativos
  const { data: infoPanels, isLoading } = useQuery<InfoPanelItem[]>({
    queryKey: ['/api/info-panels'],
  });

  // Mutation para criar painel
  const createMutation = useMutation({
    mutationFn: async (data: InfoPanelFormData) => {
      return apiRequest('POST', '/api/info-panels', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/info-panels'] });
      toast({
        title: "Painel criado",
        description: "O painel informativo foi criado com sucesso.",
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao criar painel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o painel. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  });

  // Mutation para atualizar painel
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: InfoPanelFormData }) => {
      return apiRequest('PUT', `/api/info-panels/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/info-panels'] });
      toast({
        title: "Painel atualizado",
        description: "O painel informativo foi atualizado com sucesso.",
      });
      setIsFormOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar painel:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o painel. Verifique os dados e tente novamente.",
        variant: "destructive"
      });
    }
  });

  const handleOpenForm = (panel?: InfoPanelItem) => {
    setSelectedPanel(panel || null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedPanel(null);
  };

  const handlePreview = (panel: InfoPanelItem) => {
    setPreviewPanel(panel);
  };

  const handleClosePreview = () => {
    setPreviewPanel(null);
  };

  const handleSubmit = (data: InfoPanelFormData) => {
    if (selectedPanel && selectedPanel.id) {
      updateMutation.mutate({ id: selectedPanel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Painéis Informativos</h2>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Painel
        </Button>
      </div>

      <InfoPanelList 
        infoPanels={infoPanels || []} 
        isLoading={isLoading}
        onEdit={handleOpenForm}
        onPreview={handlePreview}
      />

      {/* Modal de formulário */}
      <Dialog open={isFormOpen} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPanel?.id ? 'Editar' : 'Adicionar'} Painel Informativo</DialogTitle>
          </DialogHeader>
          <InfoPanelForm 
            initialData={selectedPanel || undefined}
            onSubmit={handleSubmit}
            isSubmitting={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Componente de visualização de prévia */}
      <InfoPanelPreview 
        panel={previewPanel} 
        isOpen={previewPanel !== null} 
        onClose={handleClosePreview} 
      />
    </div>
  );
};

export default InfoPanelManager;