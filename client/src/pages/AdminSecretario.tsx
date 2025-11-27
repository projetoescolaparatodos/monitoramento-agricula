import React, { useState } from 'react';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, BarChart3, Gift, FileText, Building, Car, AlertTriangle } from 'lucide-react';

// Placeholder components - serão implementados nas próximas etapas
import SolicitacoesCadastro from '@/components/secretario/SolicitacoesCadastro';
import GraficoAtendimentos from '@/components/secretario/GraficoAtendimentos';
import PainelDoacoes from '@/components/secretario/PainelDoacoes';
import RelatorioVisitasTecnicas from '@/components/secretario/RelatorioVisitasTecnicas';
import MetadadosViveiros from '@/components/secretario/MetadadosViveiros';
import GestaoFrota from '@/components/secretario/GestaoFrota';
import AlertasInteligentes from '@/components/secretario/AlertasInteligentes';
import GestaoViveiroMudas from '@/components/secretario/GestaoViveiroMudas';

const AdminSecretario = () => {
  const { userAuth, hasAccess, getLoginUrl, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("solicitacoes");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userAuth.isAuthenticated) {
    setLocation(getLoginUrl('gestor'));
    return null;
  }

  if (!hasAccess('gestor')) {
    setLocation(getLoginUrl('gestor'));
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/")}
            className="bg-green-600 text-white border-green-600 hover:bg-green-700"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Painel do Secretário</h1>
            <p className="text-gray-600">Central de supervisão e controle da SEMAPA</p>
          </div>
        </div>

        {/* Tabs principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-8 bg-white shadow-sm">
            <TabsTrigger
              value="solicitacoes"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Solicitações</span>
            </TabsTrigger>
            <TabsTrigger
              value="atendimentos"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Áreas Atendidas</span>
            </TabsTrigger>
            <TabsTrigger
              value="doacoes"
              className="flex items-center gap-2"
            >
              <Gift className="h-4 w-4" />
              <span className="hidden sm:inline">Doações</span>
            </TabsTrigger>
            <TabsTrigger
              value="visitas"
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Visitas Técnicas</span>
            </TabsTrigger>
            <TabsTrigger
              value="frota-atividades"
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Atividades com Frota</span>
            </TabsTrigger>
            <TabsTrigger
              value="frota"
              className="flex items-center gap-2"
            >
              <Car className="h-4 w-4" />
              <span className="hidden sm:inline">Gestão de Frota</span>
            </TabsTrigger>
            <TabsTrigger
              value="alertas"
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger
              value="viveiro-mudas"
              className="flex items-center gap-2"
            >
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Viveiro de Mudas</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das abas */}
          <TabsContent value="solicitacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Solicitações de Cadastro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SolicitacoesCadastro />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="atendimentos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Gráfico de Áreas Atendidas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GraficoAtendimentos />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="doacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Painel de Doações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PainelDoacoes />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório de Visitas Técnicas (Pesca)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RelatorioVisitasTecnicas />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frota-atividades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Consumo de Máquinas por Setor
                </CardTitle>
                <CardDescription>
                  Acompanhe o uso de veículos e máquinas em atividades da Agricultura, Pesca e PAA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetadadosViveiros />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="frota">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Gestão de Frota e Consumo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GestaoFrota />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alertas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Inteligentes da Frota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AlertasInteligentes />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="viveiro-mudas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Gestão do Viveiro de Mudas
                </CardTitle>
                <CardDescription>
                  Acompanhe o estoque de mudas prontas para doação e sincronização automática com eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GestaoViveiroMudas />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSecretario;