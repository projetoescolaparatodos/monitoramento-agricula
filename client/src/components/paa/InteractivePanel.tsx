
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
  Check,
  Phone,
  Building2,
  ArrowRight,
  Leaf
} from 'lucide-react';

interface InteractivePanelProps {
  pageType: string;
  className?: string;
}

// Cores do tema institucional
const themeColors = {
  primary: '#2e7d32', // Verde institucional
  secondary: '#1b5e20',
  lightBg: '#f5f5f5',
  darkText: '#263238',
  lightText: '#ffffff'
};

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
        <div className="md:col-span-1 space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
        <div className="md:col-span-2">
          <Card className="shadow-lg">
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
      {/* Menu lateral - Estilo melhorado */}
      <div className="md:col-span-1 space-y-3">
        {isMobile && currentPanel && (
          <button 
            onClick={() => setActivePanel(null)}
            className="md:hidden flex items-center gap-2 mb-4 text-white bg-[#2e7d32] hover:bg-[#1b5e20] px-4 py-2 rounded-md transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para lista
          </button>
        )}

        {activePanels.map((panel) => (
          <motion.button
            key={panel.categoryId}
            onClick={() => handlePanelChange(panel.categoryId)}
            className={cn(
              "w-full justify-start text-left p-4 rounded-lg transition-all",
              "border-l-4 border-transparent hover:border-[#2e7d32]",
              activePanel === panel.categoryId
                ? "bg-white shadow-md border-l-4 border-[#2e7d32] text-[#2e7d32] font-semibold"
                : "bg-white hover:bg-gray-50 text-gray-700"
            )}
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-3 w-full">
              <span className={cn(
                "shrink-0 p-2 rounded-full",
                activePanel === panel.categoryId 
                  ? "bg-[#e8f5e9] text-[#2e7d32]"
                  : "bg-gray-100 text-gray-600"
              )}>
                {iconMap[panel.icon] || <Info size={20} />}
              </span>
              <span className="flex-grow font-medium text-left">{panel.title}</span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Conteúdo do painel - Estilo melhorado */}
      <div className="md:col-span-2">
        <AnimatePresence mode="wait">
          {currentPanel ? (
            <motion.div
              key={currentPanel.categoryId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Card className="shadow-lg border-0 rounded-lg overflow-hidden">
                <CardHeader 
                  className="pb-4 border-b-0"
                  style={{
                    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)'
                  }}
                >
                  <CardTitle className="text-xl font-bold flex items-center gap-3 text-white">
                    <span className="bg-white/20 p-2 rounded-full">
                      {iconMap[currentPanel.icon] || <Info size={20} />}
                    </span>
                    <span>{currentPanel.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 px-6 pb-8 bg-white">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="texto-institucional max-w-none text-gray-800"
                  >
                    {parse(currentPanel.content || '', {
                      replace: (domNode) => {
                        // Hierarquia tipográfica institucional melhorada
                        if (domNode.type === 'tag' && domNode.name === 'h1') {
                          return (
                            <h1 className="text-3xl font-bold text-[#2e7d32] mb-6 pb-3 border-b-2 border-[#c8e6c9]">
                              {domNode.children}
                            </h1>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'h2') {
                          return (
                            <h2 className="text-2xl font-semibold text-[#1b5e20] mb-5 pb-2 border-b border-[#c8e6c9] flex items-center gap-2 mt-8">
                              <Leaf size={20} className="text-[#2e7d32]" />
                              {domNode.children}
                            </h2>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'h3') {
                          return (
                            <h3 className="text-xl font-semibold text-[#388e3c] mb-4 mt-6 border-b border-dotted border-[#81c784] pb-1">
                              {domNode.children}
                            </h3>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'p') {
                          return (
                            <p className="mb-6 leading-relaxed text-gray-700 text-lg">
                              {domNode.children}
                            </p>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'ul') {
                          // Lista moderna com ícones customizados
                          return (
                            <ul className="space-y-3 list-none pl-0 mb-6">
                              {domNode.children?.map((child, index) => {
                                if (child.type === 'tag' && child.name === 'li') {
                                  return (
                                    <li key={index} className="flex items-start gap-3 text-gray-700 text-lg">
                                      <span className="bg-[#e8f5e9] p-1 rounded-full mt-1 shrink-0">
                                        <Check size={16} className="text-[#2e7d32]" />
                                      </span>
                                      <span>{child.children}</span>
                                    </li>
                                  );
                                }
                                return null;
                              })}
                            </ul>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'ol') {
                          return (
                            <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700 text-lg">
                              {domNode.children}
                            </ol>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'a') {
                          return (
                            <a 
                              className="group inline-flex items-center gap-1 text-[#1e88e5] font-medium hover:underline"
                              href={domNode.attribs?.href}
                            >
                              {domNode.children}
                              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                            </a>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'strong' || domNode.name === 'b') {
                          return <strong className="font-semibold text-[#2e7d32]">{domNode.children}</strong>;
                        }
                        if (domNode.type === 'tag' && domNode.name === 'pre') {
                          return (
                            <pre className="whitespace-pre-wrap bg-[#f5f5f5] p-4 rounded-lg my-6 border border-[#e0e0e0] text-sm font-mono">
                              {domNode.children?.[0]?.data}
                            </pre>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'blockquote') {
                          return (
                            <blockquote className="bg-[#f1f8e9] border-l-4 border-[#81c784] p-4 my-6 rounded-r-lg">
                              <p className="text-[#2e7d32] italic font-medium text-lg">
                                "{domNode.children}"
                              </p>
                            </blockquote>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'table') {
                          return (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full border border-[#c8e6c9] rounded-lg overflow-hidden">
                                {domNode.children}
                              </table>
                            </div>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'thead') {
                          return (
                            <thead className="bg-[#e8f5e9]">
                              {domNode.children}
                            </thead>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'th') {
                          return (
                            <th className="p-3 text-left font-semibold text-[#2e7d32]">
                              {domNode.children}
                            </th>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'tbody') {
                          return (
                            <tbody className="divide-y divide-[#e0e0e0]">
                              {domNode.children}
                            </tbody>
                          );
                        }
                        if (domNode.type === 'tag' && domNode.name === 'td') {
                          return (
                            <td className="p-3 text-gray-700">
                              {domNode.children}
                            </td>
                          );
                        }
                      }
                    })}
                    
                    {/* Componente adicional para contatos institucionais */}
                    <div className="mt-8 p-4 bg-[#f5f5f5] rounded-lg border border-[#e0e0e0]">
                      <h3 className="flex items-center gap-2 text-lg font-medium text-[#2e7d32] mb-3">
                        <Phone size={18} />
                        Contato Oficial
                      </h3>
                      <div className="space-y-2 text-gray-700">
                        <p>📧 secretaria.agricultura@estado.gov.br</p>
                        <p>📞 (XX) XXXX-XXXX</p>
                      </div>
                    </div>

                    {/* Rodapé institucional */}
                    <div className="mt-8 pt-4 border-t border-[#e0e0e0] text-sm text-gray-500 flex items-center gap-2">
                      <Building2 size={16} />
                      <span>Secretaria de Agricultura - Dados atualizados em {new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
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
              <Card className="shadow-md border-0">
                <CardContent className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="bg-[#e8f5e9] p-4 rounded-full mb-4">
                    <Info className="h-8 w-8 text-[#2e7d32]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Selecione uma categoria</h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Escolha uma das opções ao lado para visualizar informações detalhadas sobre os programas e serviços da Secretaria de Agricultura.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InteractivePanel;
