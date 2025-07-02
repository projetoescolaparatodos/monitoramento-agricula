
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building, Fish, Wheat } from "lucide-react";

const AdminLogin = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Área de Cadastro SEMAPA
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Selecione sua área de atuação para acessar o sistema
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={() => setLocation("/login/admin/agricultura")}
            className="w-full h-16 text-lg bg-green-600 hover:bg-green-700 flex items-center justify-center gap-3"
          >
            <Wheat className="h-6 w-6" />
            Entrar na área de Agricultura
          </Button>
          
          <Button 
            onClick={() => setLocation("/login/admin/pesca")}
            className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3"
          >
            <Fish className="h-6 w-6" />
            Entrar na área de Pesca
          </Button>
          
          <Button 
            onClick={() => setLocation("/login/admin/paa")}
            className="w-full h-16 text-lg bg-amber-600 hover:bg-amber-700 flex items-center justify-center gap-3"
          >
            <Building className="h-6 w-6" />
            Entrar na área do PAA
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
