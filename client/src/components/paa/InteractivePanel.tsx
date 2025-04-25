
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { InfoPanelItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import parse from 'html-react-parser';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  Users, 
  BarChart2,
  Award,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft
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
  const [panelExpanded, setPanelExpanded] = useState(false); // Novo estado para controle mobile

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

  // Novo handler para mobile
  const handleMobileSelection = (categoryId: string) => {
    setActivePanel(categoryId);
    setPanelExpanded(false); // Fecha o menu após seleção
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
    <div className={cn("relative w-full", className)}>
      {/* Botão de Toggle (Mobile Only) */}
      {isMobile && (
        <button
          onClick={() => setPanelExpanded(!panelExpanded)}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary rounded-full shadow-lg text-white"
        >
          {panelExpanded ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Painel Lateral (Mobile Adaptado) */}
        <div className={cn(
          "md:w-64 space-y-2 bg-background md:bg-transparent",
          isMobile ? "fixed z-40 h-[calc(100vh-80px)] top-0 left-0 w-[80%] p-4" : "w-full",
          "transition-transform duration-300 ease-in-out",
          isMobile ? (panelExpanded ? "translate-x-0" : "-translate-x-full") : "",
          "md:relative md:translate-x-0 md:p-0"
        )}>
          <h3 className="md:block text-lg font-semibold mb-3">Informações</h3>
          {activePanels.map((panel) => (
            <motion.button
              key={panel.categoryId}
              onClick={() => isMobile ? handleMobileSelection(panel.categoryId) : handlePanelChange(panel.categoryId)}
              className={cn(
                "w-full text-left p-3 rounded-lg flex items-center gap-3 min-h-[48px]",
                "transition-colors duration-200",
                activePanel === panel.categoryId
                  ? "border border-primary bg-primary/10 text-primary shadow-sm font-semibold" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80 border border-transparent"
              )}
              whileHover={{ scale: isMobile ? 1 : 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <span className="shrink-0 text-primary">
                {iconMap[panel.icon] || <Info size={20} />}
              </span>
              <span className="flex-grow font-medium">{panel.title}</span>
            </motion.button>
          ))}
        </div>

        {/* Overlay Mobile (Quando menu aberto) */}
        {isMobile && panelExpanded && (
          <div 
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setPanelExpanded(false)}
          />
        )}

        {/* Conteúdo do painel */}
        <div className={cn(
          "flex-1 transition-opacity duration-300 md:col-span-2",
          isMobile && panelExpanded ? "opacity-30 pointer-events-none" : ""
        )}>
          <AnimatePresence mode="wait">
            {currentPanel ? (
              <motion.div
                key={currentPanel.categoryId}
                initial={{ opacity: 0, y: isMobile ? 10 : 0, x: isMobile ? 0 : 10 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, y: isMobile ? -10 : 0, x: isMobile ? 0 : -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Card className="shadow-md border-0" style={{ backgroundColor: '#f0fff4' }}>
                  <CardHeader className="pb-2 border-b">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-black">
                      {isMobile && (
                        <button 
                          onClick={() => setActivePanel(null)}
                          className="md:hidden mr-2 text-primary"
                        >
                          <ChevronLeft size={20} />
                        </button>
                      )}
                      {currentPanel.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 prose prose-sm sm:prose lg:prose-lg max-w-none text-justify text-black leading-relaxed interactive-panel-content">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {parse(currentPanel.content)}
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Info className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Selecione uma opção para visualizar informações</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default InteractivePanel;
