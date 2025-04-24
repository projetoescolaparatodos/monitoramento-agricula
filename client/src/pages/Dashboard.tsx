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
import InfoPanelManager from "@/components/dashboard/InfoPanelManager";

const Dashboard = () => {
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const params = useParams();
  const section = params?.section || "contents";

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