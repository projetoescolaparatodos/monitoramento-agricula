
import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { db } from '@/utils/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, getDocs } from 'firebase/firestore';
import { DynamicStatisticCard } from '@/components/common/DynamicStatisticCard';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Users, Gift, TrendingUp } from 'lucide-react';

interface Evento {
  id: string;
  nome: string;
  dataInicio: any;
  dataFim: any;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
}

const EventoTelao: React.FC = () => {
  const [location] = useLocation();
  
  // Corrigir extração do parâmetro evento da URL
  const getEventoIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('evento');
  };
  
  const eventoId = getEventoIdFromUrl();
  
  const [evento, setEvento] = useState<Evento | null>(null);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    console.log('🎯 EventoTelao - URL atual:', window.location.href);
    console.log('🎯 EventoTelao - EventoId extraído:', eventoId);
    
    if (!eventoId) {
      console.warn('🎯 EventoTelao - Nenhum eventoId fornecido na URL');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        console.log('🎯 EventoTelao - Buscando evento com ID:', eventoId);
        
        // Primeiro, vamos buscar todos os eventos para ver o que existe
        const eventosSnapshot = await getDocs(collection(db, 'eventos'));
        const eventosDisponiveis = eventosSnapshot.docs.map(doc => ({
          id: doc.id,
          nome: doc.data().nome
        }));
        
        console.log('🎯 EventoTelao - Eventos disponíveis:', eventosDisponiveis);
        
        // Buscar dados do evento específico
        const eventoDoc = await getDoc(doc(db, 'eventos', eventoId));
        if (!eventoDoc.exists()) {
          console.error('🎯 EventoTelao - Evento não encontrado:', eventoId);
          console.log('🎯 EventoTelao - Eventos disponíveis para referência:', eventosDisponiveis);
          setLoading(false);
          return;
        }
        
        const eventoData = { id: eventoDoc.id, ...eventoDoc.data() } as Evento;
        console.log('🎯 EventoTelao - Evento encontrado:', eventoData);
        setEvento(eventoData);

        // Buscar insumos
        console.log('🎯 EventoTelao - Buscando insumos...');
        const insumosSnapshot = await getDocs(collection(db, 'insumos'));
        const insumosData = insumosSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data() 
        })) as Insumo[];
        
        console.log('🎯 EventoTelao - Insumos encontrados:', insumosData.length);
        setInsumos(insumosData);

        setLoading(false);
        console.log('🎯 EventoTelao - Carregamento concluído com sucesso');
      } catch (error) {
        console.error('🎯 EventoTelao - Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    // Adicionar timeout para evitar carregamento infinito
    const timeoutId = setTimeout(() => {
      console.warn('🎯 EventoTelao - Timeout de carregamento');
      setLoading(false);
    }, 10000); // 10 segundos

    fetchData().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => {
      clearTimeout(timeoutId);
    };
  }, [eventoId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (!eventoId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Parâmetro de Evento Ausente</h1>
          <p className="text-xl mb-4">A URL deve conter o parâmetro ?evento=ID_DO_EVENTO</p>
          <p className="text-lg opacity-75">Exemplo: /evento-telao?evento=abc123</p>
        </div>
      </div>
    );
  }

  if (!evento && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700 text-white p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">Evento não encontrado</h1>
          <p className="text-xl mb-6">ID solicitado: <span className="font-mono bg-white/20 px-2 py-1 rounded">{eventoId}</span></p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Como acessar o telão:</h2>
            <div className="text-left space-y-3">
              <p>1. Acesse o dashboard administrativo</p>
              <p>2. Vá para a seção "Eventos"</p>
              <p>3. Copie o ID do evento desejado</p>
              <p>4. Use: <span className="font-mono bg-white/20 px-2 py-1 rounded">/evento-telao?evento=ID_DO_EVENTO</span></p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">Exemplo para "Semana do Produtor 2025":</h3>
            <p className="font-mono text-lg bg-white/20 px-4 py-2 rounded">
              /evento-telao?evento=semana-produtor-2025
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Configurações de estatísticas padrão para eventos
  const statsConfigs = [
    {
      id: 'total-doacoes',
      titulo: 'Total de Doações',
      colecaoFonte: 'doacoes_evento',
      campo: '',
      tipoAgregacao: 'count' as const,
      periodo: 'total',
      unidade: 'doações',
      filtroAdicional: [
        { fieldPath: 'eventoId', opStr: '==', value: eventoId }
      ]
    },
    {
      id: 'beneficiarios-atendidos',
      titulo: 'Beneficiários Atendidos',
      colecaoFonte: 'doacoes_evento',
      campo: '',
      tipoAgregacao: 'count' as const,
      periodo: 'total',
      unidade: 'pessoas',
      filtroAdicional: [
        { fieldPath: 'eventoId', opStr: '==', value: eventoId }
      ]
    },
    {
      id: 'total-quantidade',
      titulo: 'Total de Itens Distribuídos',
      colecaoFonte: 'doacoes_evento',
      campo: 'quantidade',
      tipoAgregacao: 'sum' as const,
      periodo: 'total',
      unidade: 'itens',
      filtroAdicional: [
        { fieldPath: 'eventoId', opStr: '==', value: eventoId }
      ]
    }
  ];

  // Adicionar configurações específicas por insumo (máximo 3 para não sobrecarregar)
  const insumosAtivos = insumos.filter(i => i.nome);
  insumosAtivos.slice(0, 3).forEach(insumo => {
    statsConfigs.push({
      id: `insumo-${insumo.id}`,
      titulo: `${insumo.nome} Distribuídas`,
      colecaoFonte: 'doacoes_evento',
      campo: 'quantidade',
      tipoAgregacao: 'sum' as const,
      periodo: 'total',
      unidade: insumo.unidade || 'unidades',
      filtroAdicional: [
        { fieldPath: 'eventoId', opStr: '==', value: eventoId },
        { fieldPath: 'insumoId', opStr: '==', value: insumo.id }
      ]
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 p-8 text-white">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <Calendar className="w-16 h-16 text-white mr-6" />
          <h1 className="text-6xl font-bold">{evento.nome}</h1>
        </div>
        <div className="text-2xl opacity-90 mb-4">
          Estatísticas em Tempo Real
        </div>
        <div className="text-xl opacity-75">
          Atualizado em: {currentTime.toLocaleTimeString('pt-BR')} - {currentTime.toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
        {statsConfigs.map((config) => (
          <div key={config.id} className="transform hover:scale-105 transition-transform duration-300">
            <DynamicStatisticCard 
              config={config}
              variant="transparent"
            />
          </div>
        ))}
      </div>

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <Users className="w-10 h-10 text-white mr-4" />
              <h2 className="text-3xl font-bold">Impacto Social</h2>
            </div>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span>Período do Evento:</span>
                <span className="font-bold">
                  {evento.dataInicio?.toDate().toLocaleDateString('pt-BR')} - {evento.dataFim?.toDate().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Status:</span>
                <span className="font-bold text-green-300">Ativo</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-8">
            <div className="flex items-center mb-6">
              <TrendingUp className="w-10 h-10 text-white mr-4" />
              <h2 className="text-3xl font-bold">Sistema</h2>
            </div>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between items-center">
                <span>Atualização:</span>
                <span className="font-bold text-green-300">Tempo Real</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Última Sincronização:</span>
                <span className="font-bold">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rodapé */}
      <div className="text-center mt-12 p-6 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10">
        <div className="flex items-center justify-center mb-2">
          <Gift className="w-6 h-6 mr-2" />
          <span className="text-xl font-semibold">
            Secretaria Municipal de Agricultura de Vitória do Xingu
          </span>
        </div>
        <p className="text-sm opacity-75">
          Sistema de Monitoramento de Doações - Dados atualizados automaticamente
        </p>
      </div>
    </div>
  );
};

export default EventoTelao;
