
import React, { useEffect, useState } from 'react';
import { db } from '@/utils/firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DynamicStatisticCardProps {
  config: {
    id: string;
    titulo: string;
    colecaoFonte: string;
    campo: string;
    tipoAgregacao: 'sum' | 'avg' | 'max' | 'count';
    periodo: string;
    unidade: string;
    filtroAdicional?: any;
  };
  variant?: 'default' | 'transparent';
}

export const DynamicStatisticCard: React.FC<DynamicStatisticCardProps> = ({ 
  config, 
  variant = 'default' 
}) => {
  const [value, setValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const calcularPeriodo = () => {
      const now = new Date();
      let startDate = new Date();
      
      switch(config.periodo) {
        case 'hoje':
          startDate.setHours(0, 0, 0, 0);
          break;
        case '7dias':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30dias':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'mesAtual':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'safraAtual':
          // Safra de julho a junho do próximo ano
          const currentYear = now.getFullYear();
          const startMonth = now.getMonth() >= 6 ? 6 : 6 - 12; // Julho do ano atual ou anterior
          startDate = new Date(currentYear, startMonth, 1);
          break;
        default:
          startDate = new Date(0); // Todos os dados
      }
      
      return { startDate, endDate: now };
    };

    const fetchData = () => {
      const { startDate, endDate } = calcularPeriodo();
      
      // Construir query base
      let q = query(collection(db, config.colecaoFonte));

      // Adicionar filtros de data
      if (config.colecaoFonte === 'doacoes_evento') {
        // Para doações, usar timestamp
        q = query(q,
          where('timestamp', '>=', Timestamp.fromDate(startDate)),
          where('timestamp', '<=', Timestamp.fromDate(endDate))
        );
      } else if (config.periodo !== 'todos') {
        // Para outras coleções, usar createdAt
        q = query(q, 
          where('createdAt', '>=', Timestamp.fromDate(startDate)),
          where('createdAt', '<=', Timestamp.fromDate(endDate))
        );
      }

      // Adicionar filtros adicionais se existirem
      if (config.filtroAdicional && Array.isArray(config.filtroAdicional)) {
        config.filtroAdicional.forEach(filter => {
          if (filter.fieldPath && filter.opStr && filter.value) {
            q = query(q, where(filter.fieldPath, filter.opStr, filter.value));
          }
        });
      }

      return onSnapshot(q, (snapshot) => {
        let calculatedValue = 0;
        
        if (config.tipoAgregacao === 'count') {
          calculatedValue = snapshot.size;
        } else {
          const values = snapshot.docs.map(doc => {
            const data = doc.data();
            return data[config.campo] || 0;
          });
          
          switch(config.tipoAgregacao) {
            case 'sum':
              calculatedValue = values.reduce((a, b) => a + b, 0);
              break;
            case 'avg':
              calculatedValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
              break;
            case 'max':
              calculatedValue = values.length > 0 ? Math.max(...values) : 0;
              break;
          }
        }
        
        // Calcular tendência
        if (previousValue > 0) {
          if (calculatedValue > previousValue) {
            setTrend('up');
          } else if (calculatedValue < previousValue) {
            setTrend('down');
          } else {
            setTrend('stable');
          }
        }
        
        setPreviousValue(value);
        setValue(calculatedValue);
        setLastUpdate(new Date());
        setLoading(false);
        setIsUpdating(false);
      }, (error) => {
        console.error('Erro ao buscar estatísticas dinâmicas:', error);
        setLoading(false);
      });
    };

    // Buscar dados imediatamente
    const unsubscribe = fetchData();

    // Configurar atualização automática a cada 1 minuto (60000ms)
    const interval = setInterval(() => {
      console.log('🔄 Atualizando estatística dinâmica:', config.titulo);
      setIsUpdating(true);
      // Recriar a subscription para forçar atualização
      unsubscribe();
      const newUnsubscribe = fetchData();
      return newUnsubscribe;
    }, 60000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [config]);

  const formatValue = (val: number) => {
    if (config.tipoAgregacao === 'avg') {
      return val.toFixed(1);
    }
    return val.toLocaleString('pt-BR');
  };

  const getTrendColor = () => {
    switch(trend) {
      case 'up': return 'text-emerald-700';
      case 'down': return 'text-rose-700';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch(trend) {
      case 'up': return <ChevronUp className="w-4 h-4" />;
      case 'down': return <ChevronDown className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card className={`${variant === "transparent" ? "bg-white/95 backdrop-blur-md" : "bg-gradient-to-br from-white to-green-50"} rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 hover:scale-105 relative border-0 min-h-[200px]`}>
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
          {isUpdating ? (
            <span className="animate-spin">🔄</span>
          ) : (
            <span>⚡</span>
          )}
          Dinâmico
        </div>
        <div className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
          {lastUpdate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/10 pointer-events-none"></div>
      <div className="border-t-4 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      <CardContent className="p-8 text-center relative z-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-4 mx-auto w-3/4"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mb-3 mx-auto w-2/3"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg mx-auto w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-6xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text mb-4 leading-tight">
              {formatValue(value)}
            </div>
            <div className="text-base font-bold tracking-wide mb-4 text-gray-800 leading-relaxed">
              {config.titulo}
              {config.unidade && (
                <span className="block text-sm text-green-600 font-semibold mt-1">
                  ({config.unidade})
                </span>
              )}
            </div>
            {trend !== 'stable' && (
              <div className={`flex items-center justify-center text-base font-bold ${getTrendColor()} bg-white/70 rounded-full px-4 py-2 shadow-md`}>
                <span className="text-lg mr-2">{getTrendIcon()}</span>
                <span>
                  {trend === 'up' ? '📈 Crescendo' : '📉 Decrescendo'}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
