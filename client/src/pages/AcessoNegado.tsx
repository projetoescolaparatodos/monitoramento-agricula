
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";

const AcessoNegado = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-700">
            Você não tem permissão para acessar esta área do sistema.
          </p>
          <p className="text-gray-600 text-sm">
            Por favor, entre com uma conta autorizada para este setor ou entre em contato com o administrador do sistema.
          </p>
          <div className="space-y-2 pt-4">
            <Button 
              onClick={() => setLocation("/login/admin")}
              className="w-full"
              variant="outline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Login
            </Button>
            <Button 
              onClick={() => setLocation("/")}
              className="w-full"
            >
              Ir para Página Inicial
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcessoNegado;
