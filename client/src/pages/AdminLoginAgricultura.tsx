
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Wheat, ArrowLeft, Lock } from "lucide-react";

const AdminLoginAgricultura = () => {
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

      // Verificar se o usuário tem permissão para agricultura
      const userDoc = await getDoc(doc(db, 'usuarios_admin', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não autorizado para o sistema administrativo');
      }

      const userData = userDoc.data();
      
      if (userData.setor !== 'agricultura' && userData.setor !== 'coordenacao') {
        throw new Error('Você não tem permissão para acessar a área de Agricultura');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para área de Agricultura...",
      });

      setLocation('/admin/agricultura');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setLocation("/login/admin")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Wheat className="h-8 w-8 text-green-600" />
              <Lock className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-800">
            Login - Agricultura
          </CardTitle>
          <p className="text-center text-gray-600">
            Acesso restrito aos técnicos da área de Agricultura
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="tecnico@agricultura.gov"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar na Agricultura"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLoginAgricultura;
