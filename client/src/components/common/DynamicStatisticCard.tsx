import React, { useEffect, useState, useRef } from "react";
import { db, withRetry } from "@/utils/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";

interface DynamicStatisticCardProps {
  config: {
    id: string;
    titulo: string;
    colecaoFonte: string;
    campo: string;
    tipoAgregacao: "sum" | "avg" | "max" | "count";
    periodo: string;
    unidade: string;
    filtroAdicional?: any;
  };
  variant?: "default" | "transparent";
  enableAutoUpdate?: boolean;
}

export const DynamicStatisticCard: React.FC<DynamicStatisticCardProps> = ({
  config,
  variant = "default",
  enableAutoUpdate = true,
}) => {
  const [value, setValue] = useState<number>(0);
  const [displayValue, setDisplayValue] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [previousValue, setPreviousValue] = useState<number>(0);
  const [trend, setTrend] = useState<"up" | "down" | "stable">("stable");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [targetValue, setTargetValue] = useState<number>(0);
  const [updateQueue, setUpdateQueue] = useState<number[]>([]);
  const [forceUpdateActive, setForceUpdateActive] = useState(false);

  const unsubscribeRef = useRef<(() => void) | null>(null);
  const incrementInterval = useRef<NodeJS.Timeout>();
  const forceUpdateTimeout = useRef<NodeJS.Timeout>();
  const animationTimeout = useRef<NodeJS.Timeout>();

  const calculateAnimationSpeed = (difference: number): { stepsPerSecond: number; maxDuration: number } => {
    const absDifference = Math.abs(difference);

    // Para valores acima de 100, animação mais rápida
    if (absDifference >= 100) {
      return {
        stepsPerSecond: Math.min(20, Math.max(10, absDifference / 10)), // 10-20 steps/sec
        maxDuration: 60000 // 1 minuto máximo
      };
    } else if (absDifference >= 10) {
      return {
        stepsPerSecond: 5,
        maxDuration: 60000
      };
    } else {
      return {
        stepsPerSecond: 3,
        maxDuration: 60000
      };
    }
  };

  const startIncrementalUpdate = (newValue: number) => {
    // Limpar intervalos e timeouts anteriores
    if (incrementInterval.current) {
      clearInterval(incrementInterval.current);
    }
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }

    const difference = newValue - displayValue;
    if (difference === 0) {
      setForceUpdateActive(false);
      if (forceUpdateTimeout.current) {
        clearTimeout(forceUpdateTimeout.current);
      }
      return;
    }

    console.log(`🎯 Iniciando animação: ${displayValue} → ${newValue} (diferença: ${difference})`);

    setIsAnimating(true);
    setTargetValue(newValue);

    const { stepsPerSecond, maxDuration } = calculateAnimationSpeed(difference);
    const increment = difference > 0 ? Math.max(1, Math.ceil(Math.abs(difference) / (stepsPerSecond * (maxDuration / 1000)))) : 
                                       -Math.max(1, Math.ceil(Math.abs(difference) / (stepsPerSecond * (maxDuration / 1000))));
    const stepDuration = 1000 / stepsPerSecond;

    console.log(`📊 Parâmetros de animação: increment=${increment}, stepDuration=${stepDuration}ms, stepsPerSecond=${stepsPerSecond}`);

    let currentValue = displayValue;

    // Timeout de segurança para garantir que a animação não dure mais que 1 minuto
    animationTimeout.current = setTimeout(() => {
      console.log(`⏰ Timeout de animação atingido, finalizando em: ${newValue}`);
      if (incrementInterval.current) {
        clearInterval(incrementInterval.current);
      }
      setDisplayValue(newValue);
      setIsAnimating(false);
      setForceUpdateActive(false);
      if (forceUpdateTimeout.current) {
        clearTimeout(forceUpdateTimeout.current);
      }
      setForceUpdate(0);
    }, maxDuration);

    incrementInterval.current = setInterval(() => {
      setDisplayValue(prev => {
        const nextValue = prev + increment;

        // Verificar se chegamos ao valor alvo ou se ultrapassamos
        const shouldStop = increment > 0 ? nextValue >= newValue : nextValue <= newValue;

        if (shouldStop) {
          console.log(`✅ Animação concluída: ${newValue}`);

          if (incrementInterval.current) {
            clearInterval(incrementInterval.current);
          }
          if (animationTimeout.current) {
            clearTimeout(animationTimeout.current);
          }

          setIsAnimating(false);
          setForceUpdateActive(false);
          if (forceUpdateTimeout.current) {
            clearTimeout(forceUpdateTimeout.current);
          }
          setForceUpdate(0);

          return newValue;
        }

        currentValue = nextValue;
        return nextValue;
      });
    }, stepDuration);
  };

  useEffect(() => {
    if (updateQueue.length > 0 && !isAnimating) {
      const nextValue = updateQueue[0];
      setUpdateQueue(prev => prev.slice(1));
      startIncrementalUpdate(nextValue);
    }
  }, [updateQueue, isAnimating, displayValue]);

  useEffect(() => {
    if (!loading && value !== targetValue && value !== displayValue && !isAnimating) {
      setUpdateQueue(prev => {
        if (prev.includes(value)) return prev;
        return [...prev, value];
      });
    }
  }, [value, loading, targetValue, displayValue, isAnimating]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        if (!forceUpdateActive) {
          console.log(`🎯 Atualização forçada iniciada para: ${config.titulo}`);
          setForceUpdateActive(true);
          setForceUpdate((prev) => prev + 1);

          forceUpdateTimeout.current = setTimeout(() => {
            console.log(`⏰ Atualização forçada finalizada (timeout) para: ${config.titulo}`);
            setForceUpdateActive(false);
            setForceUpdate(0);
          }, 30000);
        }
      }

      if (event.ctrlKey && event.key.toLowerCase() === "l") {
        event.preventDefault();
        if (forceUpdateActive) {
          console.log(`🛑 Atualização forçada cancelada manualmente para: ${config.titulo}`);
          if (forceUpdateTimeout.current) {
            clearTimeout(forceUpdateTimeout.current);
          }
          setForceUpdateActive(false);
          setForceUpdate(0);

          if (incrementInterval.current) {
            clearInterval(incrementInterval.current);
          }
          if (animationTimeout.current) {
            clearTimeout(animationTimeout.current);
          }
          setIsAnimating(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [forceUpdateActive, config.titulo]);

  useEffect(() => {
    const calcularPeriodo = () => {
      const now = new Date();
      let startDate = new Date();

      switch (config.periodo) {
        case "hoje":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7dias":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30dias":
          startDate.setDate(now.getDate() - 30);
          break;
        case "mesAtual":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "safraAtual":
          const currentYear = now.getFullYear();
          const startMonth = now.getMonth() >= 6 ? 6 : 6 - 12;
          startDate = new Date(currentYear, startMonth, 1);
          break;
        default:
          startDate = new Date(0);
      }

      return { startDate, endDate: now };
    };

    const fetchData = () => {
      const { startDate, endDate } = calcularPeriodo();
      console.log(`🔄 Atualizando estatística dinâmica:`, config.titulo);

      const setupQuery = () => {
        let q = query(collection(db, config.colecaoFonte));

        if (config.colecaoFonte === "doacoes_evento") {
          if (config.periodo !== "todos") {
            q = query(
              q,
              where("timestamp", ">=", Timestamp.fromDate(startDate)),
              where("timestamp", "<=", Timestamp.fromDate(endDate)),
            );
          }
        } else if (config.periodo !== "todos") {
          q = query(
            q,
            where("createdAt", ">=", Timestamp.fromDate(startDate)),
            where("createdAt", "<=", Timestamp.fromDate(endDate)),
          );
        }

        if (config.filtroAdicional && Array.isArray(config.filtroAdicional)) {
          config.filtroAdicional.forEach((filter) => {
            if (filter.fieldPath && filter.opStr && filter.value !== undefined) {
              // Tratar valores booleanos corretamente
              let filterValue = filter.value;
              if (typeof filterValue === 'string') {
                if (filterValue === 'true') filterValue = true;
                if (filterValue === 'false') filterValue = false;
              }
              
              console.log(`🔍 Aplicando filtro: ${filter.fieldPath} ${filter.opStr} ${filterValue} (tipo: ${typeof filterValue})`);
              q = query(q, where(filter.fieldPath, filter.opStr, filterValue));
            }
          });
        }

        return q;
      };

      return withRetry(() => {
        return new Promise((resolve, reject) => {
          const q = setupQuery();
          const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              let calculatedValue = 0;

              if (config.tipoAgregacao === "count") {
                calculatedValue = snapshot.size;
              } else {
                const values = snapshot.docs.map((doc) => {
                  const data = doc.data();
                  return data[config.campo] || 0;
                });

                switch (config.tipoAgregacao) {
                  case "sum":
                    calculatedValue = values.reduce((a, b) => a + b, 0);
                    break;
                  case "avg":
                    calculatedValue =
                      values.length > 0
                        ? values.reduce((a, b) => a + b, 0) / values.length
                        : 0;
                    break;
                  case "max":
                    calculatedValue =
                      values.length > 0 ? Math.max(...values) : 0;
                    break;
                }
              }

              // Verificar se houve mudança real no valor
              if (calculatedValue !== value) {
                console.log(`🎯 Valor mudou para estatística "${config.titulo}": ${value} → ${calculatedValue}`);

                if (previousValue > 0) {
                  if (calculatedValue > previousValue) {
                    setTrend("up");
                  } else if (calculatedValue < previousValue) {
                    setTrend("down");
                  } else {
                    setTrend("stable");
                  }
                }

                setPreviousValue(value);
                setValue(calculatedValue);

                if (loading) {
                  setDisplayValue(calculatedValue);
                } else {
                  setHasNewData(true);

                  try {
                    const audio = new Audio(
                      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmEeADOFz/LNfTEGJG+/9+J+LA",
                    );
                    audio.volume = 0.1;
                    audio.play().catch(() => {});
                  } catch (error) {}

                  setTimeout(() => {
                    setHasNewData(false);
                  }, 3000);
                }
              }

              setLastUpdate(new Date());
              setLoading(false);
              setIsUpdating(false);
              resolve(unsubscribe);
            },
            (error) => {
              console.error("Erro ao buscar estatísticas dinâmicas:", error);
              reject(error);
            },
          );
        });
      }).catch((error) => {
        console.error("Falha após múltiplas tentativas:", error);
        setLoading(false);
        setIsUpdating(false);
        return () => {};
      });
    };

    let currentUnsubscribe: (() => void) | null = null;

    // Fetch inicial
    fetchData().then((unsubscribeFunc) => {
      currentUnsubscribe = unsubscribeFunc;
    });

    // Atualização automática a cada 30 segundos (apenas se enableAutoUpdate for true)
    let interval: NodeJS.Timeout | null = null;
    if (enableAutoUpdate) {
      interval = setInterval(async () => {
        if (!isUpdating && !forceUpdateActive) {
          setIsUpdating(true);

          if (currentUnsubscribe) {
            currentUnsubscribe();
          }

          try {
            const newUnsubscribe = await fetchData();
            currentUnsubscribe = newUnsubscribe;
          } catch (error) {
            console.error("Erro ao recriar subscription:", error);
            setIsUpdating(false);
          }
        }
      }, 30000);
    }

    // Atualização forçada
    if (forceUpdate > 0) {
      setIsUpdating(true);

      if (currentUnsubscribe) {
        currentUnsubscribe();
      }

      fetchData()
        .then((unsubscribeFunc) => {
          currentUnsubscribe = unsubscribeFunc;
        })
        .catch((error) => {
          console.error("Erro na atualização forçada:", error);
          setIsUpdating(false);
        });
    }

    return () => {
      if (currentUnsubscribe) {
        currentUnsubscribe();
      }
      if (incrementInterval.current) {
        clearInterval(incrementInterval.current);
      }
      if (animationTimeout.current) {
        clearTimeout(animationTimeout.current);
      }
      if (interval) {
        clearInterval(interval);
      }
      if (forceUpdateTimeout.current) {
        clearTimeout(forceUpdateTimeout.current);
      }
      setForceUpdateActive(false);
      setIsAnimating(false);
      setForceUpdate(0);
    };
  }, [config, isUpdating, forceUpdate, forceUpdateActive, value, loading, previousValue, enableAutoUpdate]);

  const formatValue = (val: number) => {
    if (config.tipoAgregacao === "avg") {
      return val.toFixed(1);
    }
    return Math.floor(val).toLocaleString("pt-BR");
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-700";
      case "down":
        return "text-rose-700";
      default:
        return "text-gray-600";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ChevronUp className="w-4 h-4" />;
      case "down":
        return <ChevronDown className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <Card
      className={`bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden transform hover:-translate-y-3 hover:scale-105 relative border border-gray-100 min-h-[180px] ${isAnimating ? "ring-2 ring-green-400 ring-opacity-50" : ""} ${hasNewData ? "ring-4 ring-blue-400 ring-opacity-70 animate-pulse" : ""}`}
    >
      <div className="absolute top-4 right-4">
        <div
          className={`w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${isAnimating ? "animate-pulse scale-110" : ""} ${hasNewData ? "bg-gradient-to-r from-blue-500 to-blue-600 animate-bounce" : ""}`}
        >
          {isUpdating ? (
            <span className="animate-spin text-sm">🔄</span>
          ) : isAnimating ? (
            <span className="animate-bounce text-sm">📈</span>
          ) : hasNewData ? (
            <span className="animate-pulse text-sm">🔥</span>
          ) : (
            <span className="text-sm">⚡</span>
          )}
        </div>
      </div>

      {hasNewData && (
        <div className="absolute top-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-bounce shadow-lg">
          ✨ Atualizado!
        </div>
      )}

      {forceUpdateActive && (
        <div className="absolute top-2 right-12 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
          🔄 Forçada (Ctrl+L para cancelar)
        </div>
      )}

      <div className="absolute bottom-3 right-3">
        <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full shadow-sm font-medium">
          {lastUpdate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
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
                className={`statistic-value transition-all duration-100 ${isAnimating ? "text-green-500 scale-110 animate-pulse" : "scale-100"}`}
                style={{
                  fontVariantNumeric: "tabular-nums",
                  minWidth: "200px",
                  display: "inline-block",
                  textAlign: "center",
                  transformOrigin: "center",
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
            {trend !== "stable" && (
              <div
                className={`flex items-center justify-center text-base font-bold ${getTrendColor()} bg-gray-50 rounded-full px-4 py-2 shadow-md border border-gray-100`}
              >
                <span className="text-lg mr-2">{getTrendIcon()}</span>
                <span className="text-sm">
                  {trend === "up" ? "📈 Crescendo" : "📉 Decrescendo"}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};