
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { Shield, Lock, ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const AdminLoginGestor = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar se o usuário tem permissão de admin/gestor
      // Primeiro tenta na coleção usuarios_admin
      let userDoc = await getDoc(doc(db, 'usuarios_admin', user.uid));
      let userData = null;

      if (userDoc.exists()) {
        userData = userDoc.data();
        // Verificar se é admin ou coordenação (gestor)
        if (userData.setor !== 'admin' && userData.setor !== 'coordenacao') {
          throw new Error('Você não tem permissão para acessar a área do Gestor. Acesso restrito apenas para administradores.');
        }
      } else {
        // Se não encontrou em usuarios_admin, verifica na coleção usuarios
        userDoc = await getDoc(doc(db, 'usuarios', user.uid));
        
        if (!userDoc.exists()) {
          // ✨ AUTO-REGISTRO: Criar documento automaticamente para novos secretários
          console.log('🆕 Novo usuário detectado. Criando registro de secretário...');
          
          await setDoc(doc(db, 'usuarios_admin', user.uid), {
            email: user.email,
            nome: user.displayName || user.email?.split('@')[0] || 'Secretário',
            setor: 'coordenacao', // Setor coordenação = gestor/secretário
            cargo: 'Secretário',
            permissions: ['read', 'write', 'manage_reports'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true,
            firstLogin: true
          });

          toast({
            title: "Bem-vindo(a)!",
            description: "Sua conta de secretário foi criada automaticamente.",
          });

          console.log('✅ Registro de secretário criado com sucesso');
          
          // Redirecionar para o painel
          setLocation('/admin/secretario');
          return;
        }

        userData = userDoc.data();
        
        // Verificar se tem permissão de admin na coleção usuarios
        if (userData.permissao !== 'admin') {
          throw new Error('Você não tem permissão para acessar a área do Gestor. Acesso restrito apenas para administradores.');
        }
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para área do Gestor...",
      });

      setLocation('/admin/secretario');
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas ou acesso negado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => setLocation("/login/admin")}
          variant="outline"
          className="absolute top-6 left-6 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="w-full max-w-lg">
          {/* Logo/Ícone Central */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600/90 backdrop-blur-sm rounded-full mb-4 shadow-2xl">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
              ÁREA DO GESTOR
            </h1>
            <p className="text-white/90 text-lg drop-shadow-md">
              Painel de Controle Administrativo
            </p>
          </div>

          <Card className="bg-purple-600/20 backdrop-blur-md shadow-2xl border border-purple-300/40">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-purple-50 mb-2 drop-shadow-lg flex items-center justify-center gap-3">
                <Lock className="h-6 w-6" />
                Login - Gestor
              </CardTitle>
              <p className="text-purple-100/90 text-base drop-shadow-md">
                Acesso restrito aos administradores e coordenadores
              </p>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-purple-100 font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@semapa.gov.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-purple-300/30 text-white placeholder-purple-200/60 focus:border-purple-400 focus:bg-white/20 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-purple-100 font-medium">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="bg-white/10 border-purple-300/30 text-white placeholder-purple-200/60 focus:border-purple-400 focus:bg-white/20 transition-all duration-300"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verificando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Acessar Painel
                    </span>
                  )}
                </Button>
              </form>

              {/* Texto informativo adicional */}
              <div className="text-center mt-6 p-4 bg-purple-500/20 rounded-lg border border-purple-400/30">
                <p className="text-purple-100/80 text-sm">
                  <Lock className="inline h-4 w-4 mr-2" />
                  Acesso exclusivo para administradores do sistema
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Texto informativo */}
          <div className="text-center mt-8">
            <p className="text-white/80 text-sm drop-shadow-md">
              Sistema de gestão completo da SEMAPA
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginGestor;
