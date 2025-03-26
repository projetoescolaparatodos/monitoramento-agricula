import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const DashboardSidebar = ({ activeSection, onSectionChange }: DashboardSidebarProps) => {
  const sections = [
    { id: 'contents', label: 'Conteúdos', icon: 'file-text' },
    { id: 'charts', label: 'Gráficos', icon: 'pie-chart' },
    { id: 'media', label: 'Mídias', icon: 'image' },
    { id: 'statistics', label: 'Estatísticas', icon: 'bar-chart' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="font-heading font-semibold text-lg text-secondary mb-4 px-2">Painel de Controle</h3>
      <nav>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <Button
                variant={activeSection === section.id ? "default" : "ghost"}
                className={`w-full justify-start ${activeSection === section.id ? 'bg-primary text-white' : 'text-neutral-dark'}`}
                onClick={() => onSectionChange(section.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {section.icon === 'file-text' && (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  )}
                  {section.icon === 'pie-chart' && (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  )}
                  {section.icon === 'image' && (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  )}
                  {section.icon === 'bar-chart' && (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  )}
                </svg>
                {section.label}
              </Button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-6 border-t pt-4">
        <div className="rounded-md bg-muted p-4">
          <h4 className="font-medium mb-2 text-sm">Dica</h4>
          <p className="text-xs text-muted-foreground">
            Todas as alterações realizadas neste painel serão imediatamente aplicadas ao site.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
