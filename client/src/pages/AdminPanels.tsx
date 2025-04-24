
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Layout, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import InfoPanelManager from "@/components/dashboard/InfoPanelManager";

const AdminPanels = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">Administração de Painéis Interativos</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Gerenciar Painéis por Página
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="agriculture">
              <TabsList className="mb-4">
                <TabsTrigger value="agriculture">Agricultura</TabsTrigger>
                <TabsTrigger value="fishing">Pesca</TabsTrigger>
                <TabsTrigger value="paa">PAA</TabsTrigger>
              </TabsList>
              
              <TabsContent value="agriculture">
                <InfoPanelManager pageType="agriculture" />
              </TabsContent>
              
              <TabsContent value="fishing">
                <InfoPanelManager pageType="fishing" />
              </TabsContent>
              
              <TabsContent value="paa">
                <InfoPanelManager pageType="paa" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanels;
