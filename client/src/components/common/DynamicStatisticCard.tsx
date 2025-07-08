
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

  useEffect(() => {
    const calcularPeriodo = () => {
      const now = new Date();
      let startDate = new Date();
      
      switch(config.periodo) {
        case 'hoje':
          startDate.setHours(0, 0, 0, 0);
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

    const { startDate, endDate } = calcularPeriodo();
    
    // Construir query base
    let q = query(collection(db, config.colecaoFonte));

    // Adicionar filtros de data apenas se a coleção tiver createdAt
    if (config.colecaoFonte !== 'doacoes_evento') {
      q = query(q, 
        where('createdAt', '>=', Timestamp.fromDate(startDate)),
        where('createdAt', '<=', Timestamp.fromDate(endDate))
      );
    } else {
      // Para doações, usar timestamp
      q = query(q,
        where('timestamp', '>=', Timestamp.fromDate(startDate)),
        where('timestamp', '<=', Timestamp.fromDate(endDate))
      );
    }

    // Adicionar filtros adicionais se existirem
    if (config.filtroAdicional) {
      // Para doações de eventos específicos
      if (Array.isArray(config.filtroAdicional)) {
        config.filtroAdicional.forEach(filter => {
          if (filter.fieldPath && filter.opStr && filter.value) {
            q = query(q, where(filter.fieldPath, filter.opStr, filter.value));
          }
        });
      }
    }

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
      setValue(calculatedValue);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar estatísticas dinâmicas:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [config]);

  const formatValue = (val: number) => {
    if (config.tipoAgregacao === 'avg') {
      return val.toFixed(1);
    }
    return val.toLocaleString('pt-BR');
  };

  const getTrendColor = () => {
    switch(trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
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
    <Card className={`${variant === "transparent" ? "bg-white/90 backdrop-blur-sm" : "bg-white"} rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 relative`}>
      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        Dinâmico
      </div>
      <div className="border-t-4 border-green-500"></div>
      <CardContent className="p-6 text-center">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded mb-3 mx-auto w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-1/2"></div>
          </div>
        ) : (
          <>
            <div className="text-4xl font-bold text-gray-800 mb-3">
              {formatValue(value)}
            </div>
            <div className="text-sm uppercase font-semibold tracking-wider mb-3 text-gray-700">
              {config.titulo}
              {config.unidade && (
                <span className="text-xs text-gray-500 ml-1">({config.unidade})</span>
              )}
            </div>
            {trend !== 'stable' && (
              <div className={`flex items-center justify-center text-sm font-medium ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="ml-1">
                  {trend === 'up' ? 'Crescendo' : 'Decrescendo'}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
