import React from 'react';
import { FileText, PieChart, Image, BarChart2, MessageSquare, GridView } from 'lucide-react'; // Added GridView icon
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const sections = [
    { id: 'contents', label: 'Conteúdos', Icon: FileText },
    { id: 'charts', label: 'Gráficos', Icon: PieChart },
    { id: 'media', label: 'Mídias', Icon: Image },
    { id: 'statistics', label: 'Estatísticas', Icon: BarChart2 },
    { id: 'panels', label: 'Painéis Interativos', Icon: GridView }, // Added panels section
    { id: 'chatbot', label: 'Chatbot IA', Icon: MessageSquare }
  ];

  return (
    <div className="w-60 bg-white border-r border-gray-200">
      <nav className="flex flex-col p-4 space-y-2">
        {sections.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              "flex items-center space-x-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeSection === id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default DashboardSidebar;