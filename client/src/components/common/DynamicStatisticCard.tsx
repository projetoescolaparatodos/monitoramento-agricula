import React, { useEffect, useState, useRef } from 'react';
import { db, withRetry } from '@/utils/firebase';
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
  const [hasNewData, setHasNewData] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Função para animar a contagem progressiva fluida
  const animateValue = (startValue: number, endValue: number) => {
    if (startValue === endValue || isAnimating) {
      return;
    }

    setIsAnimating(true);
    const startTime = performance.now();
    const range = endValue - startValue;

    // Duração adaptativa baseada na diferença de valores (mais lenta e suave)
    const baseDuration = Math.min(Math.abs(range) * 35, 15000); // Máx 15s
    const finalDuration = Math.max(baseDuration, 4000); // Mín 4s

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / finalDuration, 1);

      // Easing suave (easeOutCubic)
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOutCubic(progress);

      // Cálculo do valor atual
      const currentValue = startValue + (range * easedProgress);

      // Formatação baseada no tipo de agregação
      let displayValue: number;
      if (config.tipoAgregacao === 'avg') {
        // Para médias, 1 casa decimal durante animação
        displayValue = parseFloat(currentValue.toFixed(1));
      } else {
        // Para inteiros, mostrar todos os valores intermediários
        displayValue = Math.floor(currentValue);
      }

      setDisplayValue(displayValue);

      // Continua a animação
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Garante o valor final exato
        setDisplayValue(endValue);
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  };

  // Effect para animar quando o valor muda
  useEffect(() => {
    if (!loading && value !== displayValue && !isAnimating) {
      // Só anima se a diferença for significativa (evita micro-mudanças)
      const difference = Math.abs(value - displayValue);
      if (difference > 0.1) {
        animateValue(displayValue, value);
      } else {
        setDisplayValue(value);
      }
    }
  }, [value, loading, displayValue, isAnimating, config]);

  // Listener para teclas de atalho (Ctrl + A)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        console.log('🔄 Atualização forçada ativada para:', config.titulo);
        setForceUpdate(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.titulo]);

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

      const setupQuery = () => {
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

        return q;
      };

      return withRetry(() => {
        return new Promise((resolve, reject) => {
          const q = setupQuery();
          const unsubscribe = onSnapshot(q, (snapshot) => {
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

        // Se o valor mudou, ativa a animação
        if (hasValueChanged) {
          console.log(`🎯 Valor mudou para estatística "${config.titulo}": ${value} → ${calculatedValue}`);

          // Feedback sonoro sutil (opcional)
          try {
            const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmEeADOFz/LNfTEGJG+/9+J+LA');
            audio.volume = 0.1;
            audio.play().catch(() => {}); // Ignora erro se não conseguir tocar
          } catch (error) {
            // Ignora erro de áudio
          }
        }

        setLastUpdate(new Date());
            setLoading(false);
            setIsUpdating(false);
            resolve(unsubscribe);
          }, (error) => {
            console.error('Erro ao buscar estatísticas dinâmicas:', error);
            reject(error);
          });
        });
      }).catch((error) => {
        console.error('Falha após múltiplas tentativas:', error);
        setLoading(false);
        setIsUpdating(false);
        // Retornar um unsubscribe vazio em caso de erro
        return () => {};
      });
    };

    let currentUnsubscribe: (() => void) | null = null;

    // Buscar dados imediatamente
    fetchData().then((unsubscribeFunc) => {
      currentUnsubscribe = unsubscribeFunc;
    });

    // Configurar atualização automática a cada 30 segundos para ser mais responsivo
    const interval = setInterval(async () => {
      // Só atualiza se não estiver já atualizando
      if (!isUpdating) {
        console.log('🔄 Atualizando estatística dinâmica:', config.titulo);
        setIsUpdating(true);

        // Cancelar subscription anterior se existir
        if (currentUnsubscribe) {
          currentUnsubscribe();
        }

        // Criar nova subscription
        try {
          const newUnsubscribe = await fetchData();
          currentUnsubscribe = newUnsubscribe;
        } catch (error) {
          console.error('Erro ao recriar subscription:', error);
          setIsUpdating(false);
        }
      }
    }, 30000); // 30 segundos para ser mais responsivo

    // Atualização forçada quando forceUpdate muda
    if (forceUpdate > 0) {
      console.log('⚡ Executando atualização forçada para:', config.titulo);
      setIsUpdating(true);

      // Cancelar subscription anterior se existir
      if (currentUnsubscribe) {
        currentUnsubscribe();
      }

      // Criar nova subscription imediatamente
      fetchData().then((unsubscribeFunc) => {
        currentUnsubscribe = unsubscribeFunc;
      }).catch((error) => {
        console.error('Erro na atualização forçada:', error);
        setIsUpdating(false);
      });
    }

    return () => {
      if (currentUnsubscribe) {
        currentUnsubscribe();
      }
      clearInterval(interval);
    };
  }, [config, isUpdating, forceUpdate]); // Adicionar forceUpdate como dependência

  const formatValue = (val: number) => {
    if (config.tipoAgregacao === 'avg') {
      return val.toFixed(1);
    }

    // Formatação com separador de milhares
    return Math.floor(val).toLocaleString('pt-BR');
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
    <Card className={`bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-105 relative border border-gray-100 min-h-[180px] ${isAnimating ? 'ring-2 ring-green-400 ring-opacity-50' : ''} ${hasNewData ? 'ring-4 ring-blue-400 ring-opacity-70 animate-pulse' : ''}`}>
      <div className="absolute top-4 right-4">
        <div className={`w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isAnimating ? 'animate-pulse scale-110' : ''} ${hasNewData ? 'bg-gradient-to-r from-blue-500 to-blue-600 animate-bounce' : ''}`}>
          {isUpdating ? (
            <span className="animate-spin text-sm">🔄</span>
          ) : isAnimating ? (
            <span className="animate-bounce text-sm">📈</span>
          ) : hasNewData ? (
            <span className="animate-pulse text-sm">⚡</span>
          ) : (
            <span className="text-sm">⚡</span>
          )}
        </div>
      </div>

      <div className="absolute bottom-3 right-3">
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full shadow-sm font-medium">
          {lastUpdate.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
      <CardContent className="p-6 text-center relative z-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-4 mx-auto w-3/4"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mb-3 mx-auto w-2/3"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl mx-auto w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-5xl font-black text-transparent bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text mb-4 leading-tight tracking-tight relative">
              <span 
                className={`statistic-value transition-all duration-300 ${isAnimating ? 'text-green-500 animate-pulse scale-105' : ''}`} 
                style={{ 
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '200px',
                  display: 'inline-block',
                  textAlign: 'center'
                }}
              >
                {formatValue(displayValue)}
              </span>
              {isAnimating && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                </div>
              )}
            </div>
            <div className="text-lg font-bold tracking-wide mb-4 text-gray-800 leading-relaxed px-2">
              {config.titulo}
              {config.unidade && (
                <span className="block text-base text-green-600 font-bold mt-1 tracking-normal">
                  ({config.unidade})
                </span>
              )}
            </div>
            {trend !== 'stable' && (
              <div className={`flex items-center justify-center text-base font-bold ${getTrendColor()} bg-gray-50 rounded-full px-4 py-2 shadow-md border border-gray-100`}>
                <span className="text-lg mr-2">{getTrendIcon()}</span>
                <span className="text-sm">
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