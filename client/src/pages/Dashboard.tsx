import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from '@tanstack/react-query';
import Footer from "@/components/layout/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ContentList from "@/components/dashboard/ContentList";
import ContentForm from "@/components/dashboard/ContentForm";
import ChartList from "@/components/dashboard/ChartList";
import ChartForm from "@/components/dashboard/ChartForm";
import MediaList from "@/components/dashboard/MediaList";
import MediaUploader from "@/dashboard/MediaUploader";
import StatisticList from "@/components/dashboard/StatisticList";
import StatisticForm from "@/components/dashboard/StatisticForm";
import ChatbotSolicitacoes from "@/components/dashboard/ChatbotSolicitacoes";
import ChatbotAdmin from "@/components/dashboard/ChatbotAdmin";
import InfoPanelManager from "@/components/dashboard/InfoPanelManager";
import CadastrosSolicitacoesManager from '@/components/dashboard/CadastrosSolicitacoesManager';
import FirebaseTest from '@/components/debug/FirebaseTest';
import { DynamicStatsManager } from '@/components/dashboard/DynamicStatsManager';
import { EventosManager } from '@/components/dashboard/EventosManager';
import { InsumosManager } from '@/components/dashboard/InsumosManager';
import { DoacoesReport } from '@/components/dashboard/DoacoesReport';
import { useToast } from "@/hooks/use-toast";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { useGestorAuth } from "@/hooks/useGestorAuth";

const Dashboard = () => {
  // Todos os hooks devem estar no topo, antes de qualquer retorno condicional
  const { loading, isGestor } = useGestorAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const params = useParams();
  const section = params?.section || "contents";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isGestor) {
    return null; // O hook já redireciona para acesso negado
  }

  const handleAddItem = () => {
    setSelectedItemId(null);
    setShowForm(true);
  };

  const handleEditItem = (id: string) => {
    setSelectedItemId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };

  const handleSectionChange = (value: string) => {
    setShowForm(false);
    setSelectedItemId(null);
    setLocation(`/dashboard/${value}`);
  };

  return (
    <>
      <main className="container mx-auto px-4 pt-28 pb-16">
        <div className="flex gap-6">
          <DashboardSidebar activeSection={section} onSectionChange={handleSectionChange} />

          <div className="flex-1 space-y-6">
            <PageHeader 
              title="Área do Gestor" 
              description="Gerencie conteúdos, gráficos, mídias e estatísticas"
            />

            {section === "contents" && (
              <>
                {showForm ? (
                  <ContentForm 
                    isEdit={selectedItemId !== null}
                    contentData={selectedItemId ? { id: selectedItemId } as any : undefined}
                    onSuccess={handleCloseForm}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-heading font-semibold text-secondary">Conteúdos</h2>
                      <Button onClick={handleAddItem}>Adicionar Conteúdo</Button>
                    </div>
                    <ContentList onEdit={handleEditItem} />
                  </>
                )}
              </>
            )}

            {section === "charts" && (
              <>
                {showForm ? (
                  <ChartForm 
                    isEdit={selectedItemId !== null}
                    chartData={selectedItemId ? { id: selectedItemId } as any : undefined}
                    onSuccess={handleCloseForm}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-heading font-semibold text-secondary">Gráficos</h2>
                      <Button onClick={handleAddItem}>Adicionar Gráfico</Button>
                    </div>
                    <ChartList onEdit={handleEditItem} />
                  </>
                )}
              </>
            )}

            {section === "media" && (
              <>
                {showForm ? (
                  <MediaUploader 
                    isEdit={selectedItemId !== null}
                    mediaData={selectedItemId ? { id: selectedItemId } as any : undefined}
                    onSuccess={handleCloseForm}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-heading font-semibold text-secondary">Mídias</h2>
                      <Button onClick={handleAddItem}>Adicionar Mídia</Button>
                    </div>
                    <MediaList onEdit={handleEditItem} />
                  </>
                )}
              </>
            )}

            {section === "statistics" && (
              <>
                {showForm ? (
                  <StatisticForm 
                    isEdit={selectedItemId !== null}
                    statisticData={selectedItemId ? { id: selectedItemId } as any : undefined}
                    onSuccess={handleCloseForm}
                  />
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-heading font-semibold text-secondary">Estatísticas</h2>
                      <Button onClick={handleAddItem}>Adicionar Estatística</Button>
                    </div>
                    <StatisticList onEdit={handleEditItem} />
                  </>
                )}
              </>
            )}

            {section === "panels" && <InfoPanelManager />}
            {section === "chatbot" && <ChatbotAdmin />}
            {section === "solicitacoes" && <ChatbotSolicitacoes />}
            {section === "cadastros" && <CadastrosSolicitacoesManager />}
            {section === "dynamic-stats" && <DynamicStatsManager />}
            {section === "eventos" && <EventosManager />}
            {section === "insumos" && <InsumosManager />}
            {section === "doacoes" && <DoacoesReport />}

            {showForm && (
              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={handleCloseForm}>Cancelar</Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;