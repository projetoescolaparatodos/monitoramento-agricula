import { useState } from "react";
import { useLocation, useParams } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ContentList from "@/components/dashboard/ContentList";
import ContentForm from "@/components/dashboard/ContentForm";
import ChartList from "@/components/dashboard/ChartList";
import ChartForm from "@/components/dashboard/ChartForm";
import MediaList from "@/components/dashboard/MediaList";
import MediaUploader from "@/components/dashboard/MediaUploader";
import StatisticList from "@/components/dashboard/StatisticList";
import StatisticForm from "@/components/dashboard/StatisticForm";

const Dashboard = () => {
  const params = useParams();
  const section = params?.page || "contents";
  const [, setLocation] = useLocation();

  const [showForm, setShowForm] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  const { data: contents, isLoading: isLoadingContents } = useQuery({
    queryKey: ['/api/contents'],
  });

  const handleAddItem = () => {
    setSelectedItemId(null);
    setShowForm(true);
  };

  const handleEditItem = (id: number) => {
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
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-16">
        <PageHeader 
          title="Área do Gestor" 
          description="Gerencie conteúdos, gráficos, mídias e estatísticas do InfoAgro"
        />

        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
          <DashboardSidebar activeSection={section} onSectionChange={handleSectionChange} />
          <div className="space-y-4">
            {section === "contents" && (
              <ContentList
                contents={contents}
                isLoading={isLoadingContents}
                onEdit={handleEditItem}
                onDelete={(id) => {
                  // Implement delete logic
                  console.log('Delete item:', id);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
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