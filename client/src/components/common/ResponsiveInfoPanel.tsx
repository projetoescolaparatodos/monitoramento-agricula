
import React from 'react';
import { InfoPanelItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import InfoPanelImageDisplay from './InfoPanelImageDisplay';

interface ResponsiveInfoPanelProps {
  panels: InfoPanelItem[];
  className?: string;
}

const ResponsiveInfoPanel: React.FC<ResponsiveInfoPanelProps> = ({ panels, className = "" }) => {
  if (!panels || panels.length === 0) {
    return null;
  }

  const getIconComponent = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-6 w-6" /> : null;
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {panels.map((panel) => (
        <Card key={panel.id} className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-lg">
              {panel.icon && getIconComponent(panel.icon)}
              {panel.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <InfoPanelImageDisplay 
              content={panel.content}
              className="text-sm text-gray-600"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResponsiveInfoPanel;
