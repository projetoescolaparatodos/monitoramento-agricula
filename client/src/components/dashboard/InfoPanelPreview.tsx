import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InfoPanelItem } from '@/types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import parse from 'html-react-parser';
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

interface InfoPanelPreviewProps {
  panel: InfoPanelItem | null;
  isOpen: boolean;
  onClose: () => void;
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

const InfoPanelPreview: React.FC<InfoPanelPreviewProps> = ({ panel, isOpen, onClose }) => {
  if (!panel) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Visualização do Painel</DialogTitle>
          <DialogDescription>
            Prévia de como o painel será exibido para os usuários. HTML é renderizado como no componente original.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 mt-4 flex-grow overflow-hidden">
          {/* Menu lateral (simulado) */}
          <div className="w-full md:w-1/3 space-y-2">
            <div className="w-full justify-start text-left p-3 bg-primary/10 rounded-md relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-primary"></div>
              <div className="flex items-center gap-3 w-full">
                <span className="shrink-0 text-primary">
                  {iconMap[panel.icon] || <Info size={20} />}
                </span>
                <span className="flex-grow font-medium">{panel.title}</span>
              </div>
            </div>
            
            {/* Outros itens simulados (desativados) */}
            {['Categoria 1', 'Categoria 2', 'Categoria 3'].map((cat, index) => (
              <div 
                key={index}
                className="w-full justify-start text-left p-3 bg-muted/40 rounded-md text-muted-foreground"
              >
                <div className="flex items-center gap-3 w-full opacity-60">
                  <span className="shrink-0">
                    <FileText size={20} />
                  </span>
                  <span className="flex-grow">{cat}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Conteúdo do painel */}
          <div className="flex-1 overflow-auto">
            <Card className="h-full overflow-y-auto">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  {panel.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {parse(panel.content)}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InfoPanelPreview;