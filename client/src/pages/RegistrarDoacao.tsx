
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { Gift, User, Package, ArrowLeft } from 'lucide-react';

interface Evento {
  id: string;
  nome: string;
  dataInicio: any;
  dataFim: any;
  ativo: boolean;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  ativo: boolean;
}

const RegistrarDoacao: React.FC = () => {
  const [location, navigate] = useLocation();
  const { user, loading: authLoading } = useAuthProtection();
  const { toast } = useToast();

  console.log('🎯 RegistrarDoacao - Estado atual:', {
    location,
    user: user ? 'Logado' : 'Não logado',
    authLoading,
    userEmail: user?.email
  });
  
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    eventoId: '',
    insumoId: '',
    quantidade: '',
    beneficiarioNome: '',
    beneficiarioCpf: '',
    beneficiarioPropriedade: ''
  });

  useEffect(() => {
    console.log('🎯 RegistrarDoacao - useEffect executado:', { authLoading, user: !!user });
    
    const fetchData = async () => {
      console.log('🎯 RegistrarDoacao - Iniciando busca de dados...');
      try {
        // Buscar eventos ativos
        const eventosQuery = query(collection(db, 'eventos'), where('ativo', '==', true));
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventosData = eventosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Evento[];

        // Filtrar eventos que estão no período atual
        const agora = new Date();
        const eventosAtivos = eventosData.filter(evento => {
          const inicio = evento.dataInicio?.toDate();
          const fim = evento.dataFim?.toDate();
          return inicio <= agora && agora <= fim;
        });

        console.log('🎯 RegistrarDoacao - Eventos encontrados:', {
          total: eventosData.length,
          ativos: eventosAtivos.length,
          eventos: eventosAtivos.map(e => e.nome)
        });
        
        setEventos(eventosAtivos);

        // Buscar insumos ativos
        const insumosQuery = query(collection(db, 'insumos'), where('ativo', '==', true));
        const insumosSnapshot = await getDocs(insumosQuery);
        const insumosData = insumosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Insumo[];
        
        console.log('🎯 RegistrarDoacao - Insumos encontrados:', {
          total: insumosData.length,
          insumos: insumosData.map(i => i.nome)
        });
        
        setInsumos(insumosData);
        setLoading(false);
        
        console.log('🎯 RegistrarDoacao - Dados carregados com sucesso!');
      } catch (error) {
        console.error('🎯 RegistrarDoacao - Erro ao buscar dados:', error);
        setLoading(false);
        toast({
          title: "Erro",
          description: "Falha ao carregar eventos e insumos. Tente recarregar a página.",
          variant: "destructive"
        });
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventoId || !formData.insumoId || !formData.quantidade || !formData.beneficiarioNome || !user) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'doacoes_evento'), {
        eventoId: formData.eventoId,
        insumoId: formData.insumoId,
        quantidade: Number(formData.quantidade),
        tecnico: {
          id: user.uid,
          nome: user.displayName || user.email || 'Técnico'
        },
        beneficiario: {
          nome: formData.beneficiarioNome,
          ...(formData.beneficiarioCpf && { cpf: formData.beneficiarioCpf }),
          ...(formData.beneficiarioPropriedade && { propriedade: formData.beneficiarioPropriedade })
        },
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now()
      });

      setSuccess(true);
      setFormData({
        eventoId: formData.eventoId, // Manter evento selecionado
        insumoId: '',
        quantidade: '',
        beneficiarioNome: '',
        beneficiarioCpf: '',
        beneficiarioPropriedade: ''
      });

      toast({
        title: "Sucesso",
        description: "Doação registrada com sucesso!"
      });

      // Resetar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      toast({
        title: "Erro",
        description: "Falha ao registrar doação",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  console.log('🎯 RegistrarDoacao - Verificando condições de render:', {
    authLoading,
    loading,
    user: !!user,
    eventos: eventos?.length || 0,
    insumos: insumos?.length || 0
  });

  if (authLoading) {
    console.log('🎯 RegistrarDoacao - Carregando autenticação...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🎯 RegistrarDoacao - Usuário não autenticado, mostrando opção de login');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado como técnico para registrar doações.</p>
          <div className="space-y-3">
            <Button onClick={() => navigate('/login')} className="w-full">
              Fazer Login
            </Button>
            <Button variant="outline" onClick={() => navigate('/')} className="w-full">
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    console.log('🎯 RegistrarDoacao - Carregando dados...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos e insumos...</p>
        </div>
      </div>
    );
  }

  if (eventos.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nenhum Evento Ativo</h2>
          <p className="text-gray-600">Não há eventos ativos no momento para registrar doações.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  const eventoSelecionado = eventos.find(e => e.id === formData.eventoId);
  const insumoSelecionado = insumos.find(i => i.id === formData.insumoId);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Gift className="w-6 h-6" />
              Registrar Doação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Doação registrada com sucesso!
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Seleção de Evento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evento *
                </label>
                <select
                  value={formData.eventoId}
                  onChange={(e) => setFormData({...formData, eventoId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione um evento</option>
                  {eventos.map((evento) => (
                    <option key={evento.id} value={evento.id}>
                      {evento.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Informações do Insumo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Package className="inline w-4 h-4 mr-1" />
                    Insumo Doado *
                  </label>
                  <select
                    value={formData.insumoId}
                    onChange={(e) => setFormData({...formData, insumoId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Selecione um insumo</option>
                    {insumos.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nome} ({insumo.unidade})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade *
                    {insumoSelecionado && (
                      <span className="text-sm text-gray-500 ml-1">
                        ({insumoSelecionado.unidade})
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 100"
                    min="1"
                    required
                  />
                </div>
              </div>
              
              {/* Dados do Beneficiário */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Beneficiário
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.beneficiarioNome}
                      onChange={(e) => setFormData({...formData, beneficiarioNome: e.target.value})}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Nome completo do beneficiário"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CPF (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.beneficiarioCpf}
                        onChange={(e) => setFormData({...formData, beneficiarioCpf: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="000.000.000-00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Propriedade (opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.beneficiarioPropriedade}
                        onChange={(e) => setFormData({...formData, beneficiarioPropriedade: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Nome da propriedade rural"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Resumo */}
              {eventoSelecionado && insumoSelecionado && formData.quantidade && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Resumo da Doação:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Evento:</strong> {eventoSelecionado.nome}</p>
                    <p><strong>Insumo:</strong> {insumoSelecionado.nome}</p>
                    <p><strong>Quantidade:</strong> {formData.quantidade} {insumoSelecionado.unidade}</p>
                    {formData.beneficiarioNome && (
                      <p><strong>Beneficiário:</strong> {formData.beneficiarioNome}</p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Registrar Doação
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrarDoacao;
