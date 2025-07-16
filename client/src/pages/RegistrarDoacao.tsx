
import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuthProtection } from '@/hooks/useAuthProtection';
import { Gift, User, Package, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { FirebaseOptimizer, useFirebaseStatus } from '@/utils/firebaseOptimizations';

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
  const { isOnline, isConnected } = useFirebaseStatus();

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
    beneficiarioPropriedade: '',
    tecnicoNome: ''
  });

  useEffect(() => {
    console.log('🎯 RegistrarDoacao - useEffect executado:', { authLoading, user: !!user });
    
    const fetchData = async () => {
      console.log('🎯 RegistrarDoacao - Iniciando busca de dados...');
      try {
        // Usar Promise.all para buscar dados em paralelo (mais rápido)
        const [eventosSnapshot, insumosSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'eventos'), where('ativo', '==', true))),
          getDocs(query(collection(db, 'insumos'), where('ativo', '==', true)))
        ]);

        // Processar eventos
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

        // Processar insumos
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
        
        let errorMessage = "Falha ao carregar eventos e insumos. Tente recarregar a página.";
        
        if (error.code === 'permission-denied') {
          errorMessage = "Sem permissão para acessar os dados. Verifique sua autenticação.";
        } else if (error.code === 'unavailable') {
          errorMessage = "Serviço temporariamente indisponível. Tente novamente em alguns momentos.";
        }
        
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive",
          duration: 5000
        });
      }
    };

    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventoId || !formData.insumoId || !formData.quantidade || !formData.beneficiarioNome || !formData.tecnicoNome || !user) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }
    
    setSubmitting(true);

    try {
      // Preparar dados da doação com timestamp único para evitar conflitos
      const doacaoData = {
        eventoId: formData.eventoId,
        insumoId: formData.insumoId,
        quantidade: Number(formData.quantidade),
        tecnico: {
          id: user.uid,
          nome: formData.tecnicoNome,
          email: user.email || 'Não informado'
        },
        beneficiario: {
          nome: formData.beneficiarioNome,
          ...(formData.beneficiarioCpf && { cpf: formData.beneficiarioCpf }),
          ...(formData.beneficiarioPropriedade && { propriedade: formData.beneficiarioPropriedade })
        },
        timestamp: Timestamp.now(),
        createdAt: Timestamp.now(),
        // Adicionar ID único para evitar duplicatas
        uniqueId: `${user.uid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Usar Promise com timeout para evitar travamento em caso de lentidão
      const registroPromise = addDoc(collection(db, 'doacoes_evento'), doacaoData);
      
      // Timeout de 15 segundos para evitar travamento
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Operação demorou mais que 15 segundos')), 15000)
      );

      await Promise.race([registroPromise, timeoutPromise]);

      setSuccess(true);
      
      // Limpar formulário mantendo dados relevantes
      setFormData({
        eventoId: formData.eventoId, // Manter evento selecionado
        insumoId: '',
        quantidade: '',
        beneficiarioNome: '',
        beneficiarioCpf: '',
        beneficiarioPropriedade: '',
        tecnicoNome: formData.tecnicoNome // Manter nome do técnico
      });

      toast({
        title: "Sucesso",
        description: "Doação registrada com sucesso!",
        duration: 3000
      });

      // Resetar mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      console.error('Erro ao registrar doação:', error);
      
      let errorMessage = "Falha ao registrar doação";
      
      if (error.message?.includes('Timeout')) {
        errorMessage = "Operação demorou muito para ser concluída. Tente novamente.";
      } else if (error.code === 'permission-denied') {
        errorMessage = "Sem permissão para registrar doação. Verifique sua autenticação.";
      } else if (error.code === 'unavailable') {
        errorMessage = "Serviço temporariamente indisponível. Tente novamente em alguns momentos.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
        duration: 5000
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6" />
                <span className="text-xl">Registrar Doação</span>
              </div>
              <div className="flex items-center gap-2">
                {isOnline && isConnected ? (
                  <div className="flex items-center gap-1 text-green-100">
                    <Wifi className="w-4 h-4" />
                    <span className="text-sm">Online</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-200">
                    <WifiOff className="w-4 h-4" />
                    <span className="text-sm">Offline</span>
                  </div>
                )}
              </div>
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
              {/* Dados do Técnico */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Técnico
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Técnico *
                  </label>
                  <input
                    type="text"
                    value={formData.tecnicoNome}
                    onChange={(e) => setFormData({...formData, tecnicoNome: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>
              </div>

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
                    onChange={(e) => {
                      const value = e.target.value;
                      // Validar que é um número positivo
                      if (value === '' || (Number(value) > 0 && Number(value) <= 999999)) {
                        setFormData({...formData, quantidade: value});
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: 100"
                    min="1"
                    max="999999"
                    step="1"
                    required
                  />
                  {formData.quantidade && Number(formData.quantidade) <= 0 && (
                    <p className="text-red-500 text-xs mt-1">A quantidade deve ser maior que zero</p>
                  )}
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
              {eventoSelecionado && insumoSelecionado && formData.quantidade && formData.tecnicoNome && (
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h4 className="font-medium text-gray-900 mb-2">Resumo da Doação:</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Técnico:</strong> {formData.tecnicoNome}</p>
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
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="animate-pulse">Registrando doação...</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 mr-2" />
                      Registrar Doação
                    </>
                  )}
                </Button>
              </div>
              
              {/* Indicador de progresso durante submit */}
              {submitting && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="text-sm">Processando registro... Por favor, aguarde.</span>
                  </div>
                  <div className="mt-2 bg-blue-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrarDoacao;
