
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Building, Fish, Wheat, Shield, ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const [, setLocation] = useLocation();

  return (
    <>
      {/* Video de fundo */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute min-w-full min-h-full object-cover z-0"
          style={{ opacity: 1 }}
        >
          <source src="/videos/BackgroundVideo.mp4" type="video/mp4" />
          Seu navegador não suporta vídeos HTML5.
        </video>
        {/* Overlay escuro para melhor legibilidade */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10" />
      </div>

      <div className="min-h-screen flex items-center justify-center relative z-20 px-4">
        {/* Botão de voltar */}
        <Button
          onClick={() => setLocation("/")}
          variant="outline"
          className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Início
        </Button>

        <div className="w-full max-w-lg">
          {/* Logo/Ícone Central */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600/90 backdrop-blur-sm rounded-full mb-4 shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              SEMAPA
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Sistema de Administração
            </p>
          </div>

          <Card className="bg-green-600/20 backdrop-blur-md shadow-2xl border border-green-300/40">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-green-50 mb-2 drop-shadow-lg">
                Área de Cadastro
              </CardTitle>
              <p className="text-green-100/90 text-base drop-shadow-md">
                Selecione sua área de atuação para acessar o sistema
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
              <Button 
                onClick={() => setLocation("/login/admin/agricultura")}
                className="w-full h-16 text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 flex items-center justify-center gap-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
                  <Wheat className="h-6 w-6" />
                </div>
                <span className="font-semibold">Área de Agricultura</span>
              </Button>
              
              <Button 
                onClick={() => setLocation("/login/admin/pesca")}
                className="w-full h-16 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 flex items-center justify-center gap-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
                  <Fish className="h-6 w-6" />
                </div>
                <span className="font-semibold">Área de Pesca</span>
              </Button>
              
              <Button 
                onClick={() => setLocation("/login/admin/paa")}
                className="w-full h-16 text-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 flex items-center justify-center gap-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full group-hover:bg-white/30 transition-all duration-300">
                  <Building className="h-6 w-6" />
                </div>
                <span className="font-semibold">Área do PAA</span>
              </Button>
            </CardContent>
          </Card>

          {/* Texto informativo */}
          <div className="text-center mt-8">
            <p className="text-white/80 text-sm drop-shadow-md">
              Acesso restrito aos servidores autorizados da SEMAPA
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
