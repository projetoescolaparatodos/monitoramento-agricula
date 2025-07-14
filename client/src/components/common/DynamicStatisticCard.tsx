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
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Função para animar a contagem gradual
  const animateValue = (startValue: number, endValue: number, duration: number = 2000) => {
    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    setIsAnimating(true);
    const startTime = Date.now();
    const difference = endValue - startValue;

    const updateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Função de easing para tornar a animação mais suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);

      const currentValue = startValue + (difference * easeOutQuart);
      setDisplayValue(Math.round(currentValue * 100) / 100); // Arredonda para 2 casas decimais

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(updateValue);
  };

  // Effect para animar quando o valor muda
  useEffect(() => {
    if (!loading && value !== displayValue) {
      animateValue(displayValue, value);
    }
  }, [value, loading]);

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
        if (config.periodo !== 'todos') {
          q = query(q,
            where('timestamp', '>=', Timestamp.fromDate(startDate)),
            where('timestamp', '<=', Timestamp.fromDate(endDate))
          );
        }
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

        // Se é a primeira vez carregando, não anima
        if (loading) {
          setDisplayValue(calculatedValue);
        }

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
    // Durante a animação, mostra números inteiros para uma contagem mais suave
    if (isAnimating && Number.isInteger(val)) {
      return Math.floor(val).toLocaleString('pt-BR');
    }
    return Math.round(val).toLocaleString('pt-BR');
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
    <Card className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-105 relative border border-gray-100 min-h-[250px]">
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2">
        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center">
          {isUpdating ? (
            <span className="animate-spin text-lg">🔄</span>
          ) : isAnimating ? (
            <span className="animate-bounce text-lg">📈</span>
          ) : (
            <span className="text-lg">⚡</span>
          )}
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full shadow-sm font-medium">
          {lastUpdate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      <div className="border-t-5 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      <CardContent className="p-10 text-center relative z-10">
        {loading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-6 mx-auto w-3/4"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 mx-auto w-2/3"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mx-auto w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-7xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text mb-6 leading-tight tracking-tight">
              {formatValue(displayValue)}
              {isAnimating && (
                <span className="inline-block w-3 h-16 bg-gradient-to-r from-green-600 to-emerald-700 ml-3 animate-pulse rounded-sm"></span>
              )}
            </div>
            <div className="text-xl font-bold tracking-wide mb-6 text-gray-800 leading-relaxed px-2">
              {config.titulo}
              {config.unidade && (
                <span className="block text-lg text-green-600 font-bold mt-2 tracking-normal">
                  ({config.unidade})
                </span>
              )}
            </div>
            {trend !== 'stable' && (
              <div className={`flex items-center justify-center text-lg font-bold ${getTrendColor()} bg-gray-50 rounded-full px-6 py-3 shadow-md border border-gray-100`}>
                <span className="text-2xl mr-3">{getTrendIcon()}</span>
                <span className="text-base">
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