import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InfoPanelItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import parse from 'html-react-parser';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  Info, 
  Users, 
  BarChart2,
  Award,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin
} from 'lucide-react';

interface InteractivePanelProps {
  pageType: string;
  className?: string;
}

// Mapeamento de nomes de ícones para componentes
const iconMap: Record<string, React.ReactNode> = {
  'Info': <Info size={20} />,
  'Users': <Users size={20} />,
  'BarChart2': <BarChart2 size={20} />,
  'Award': <Award size={20} />,
  'FileText': <FileText size={20} />,
  'ShoppingCart': <ShoppingCart size={20} />,
  'Calendar': <Calendar size={20} />,
  'MapPin': <MapPin size={20} />
};

const InteractivePanel: React.FC<InteractivePanelProps> = ({ pageType, className }) => {
  const isMobile = useIsMobile();
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [firstLoad, setFirstLoad] = useState(true);

  // Buscar painéis informativos para a página atual
  const { data: infoPanels, isLoading } = useQuery<InfoPanelItem[]>({
    queryKey: ['/api/info-panels', pageType],
    queryFn: async () => {
      const response = await fetch(`/api/info-panels?pageType=${pageType}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar painéis informativos');
      }
      return response.json();
    }
  });

  // Ao carregar os painéis, ativa o primeiro por padrão
  useEffect(() => {
    if (infoPanels && infoPanels.length > 0 && firstLoad) {
      setActivePanel(infoPanels[0].categoryId);
      setFirstLoad(false);
    }
  }, [infoPanels, firstLoad]);

  // Filtrar apenas painéis ativos e ordenar por ordem
  const activePanels = infoPanels
    ? infoPanels
        .filter(panel => panel.active)
        .sort((a, b) => a.order - b.order)
    : [];

  // Encontrar o painel ativo para exibição do conteúdo
  const currentPanel = activePanels.find(panel => panel.categoryId === activePanel);

  const handlePanelChange = (categoryId: string) => {
    setActivePanel(categoryId);
  };

  // Gerar um skeleton para carregamento
  if (isLoading) {
    return (
      <div className={cn("w-full grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
        <div className="md:col-span-1 space-y-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Se não houver painéis, não renderiza nada
  if (!activePanels || activePanels.length === 0) {
    return null;
  }

  return (
    <div className={cn("w-full grid grid-cols-1 md:grid-cols-3 gap-6", className)}>
      {/* Menu lateral */}
      <div className="md:col-span-1 space-y-2">
        {activePanels.map((panel) => (
          <button
            key={panel.categoryId}
            onClick={() => handlePanelChange(panel.categoryId)}
            className={cn(
              "w-full justify-start text-left p-3 rounded-md relative overflow-hidden transition-all duration-200",
              activePanel === panel.categoryId
                ? "bg-primary/10 text-primary font-medium" 
                : "bg-muted/40 text-muted-foreground hover:bg-muted/60"
            )}
          >
            {activePanel === panel.categoryId && (
              <div className="absolute inset-y-0 left-0 w-1 bg-primary" />
            )}
            <div className="flex items-center gap-3 w-full">
              <span className="shrink-0">
                {iconMap[panel.icon] || <Info size={20} />}
              </span>
              <span className="flex-grow">{panel.title}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Conteúdo do painel */}
      <div className="md:col-span-2">
        {currentPanel ? (
          <Card className="animate-in fade-in-50 duration-300">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                {currentPanel.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 prose max-w-none">
              {parse(currentPanel.content)}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <Info className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Selecione uma opção para visualizar informações</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InteractivePanel;