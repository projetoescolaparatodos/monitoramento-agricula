import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { StatisticItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";
import { DynamicStatisticCard } from "@/components/common/DynamicStatisticCard";
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const StatisticsSection = ({ variant = "default" }: { variant?: "default" | "transparent" }) => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
    queryFn: async () => {
      const response = await fetch('/api/statistics');
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      return response.json();
    }
  });

  // Query para configurações de estatísticas dinâmicas
  const { data: dynamicStatsConfig, isLoading: isLoadingDynamic } = useQuery({
    queryKey: ['dynamic-statistics-config'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'estatisticas_dinamicas'),
          where('ativo', '==', true)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a: any, b: any) => (a.ordem || 0) - (b.ordem || 0));
      } catch (error) {
        console.error('Erro ao buscar configurações dinâmicas:', error);
        return [];
      }
    }
  });

  const filteredStatistics = statistics?.filter(stat => stat.active !== false && stat.pageType === 'home')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (isLoading || isLoadingDynamic) {
    return (
      <section id="estatisticas" className="mb-16">
        <div className="text-center mb-10">
          <h2 className={`text-3xl font-bold mb-3 ${variant === "transparent" ? "text-white" : "text-primary"}`}>
            Estatísticas Principais
          </h2>
          <p className={`text-xl md:text-2xl font-medium tracking-wide max-w-3xl mx-auto ${variant === "transparent" ? "text-white" : "text-gray-600"}`}>
            Dados Sobre a produção em Vitória do Xingu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className={`${variant === "transparent" ? "bg-white/80" : "bg-white"} rounded-lg shadow-lg p-6 text-center border-t-4 border-primary animate-pulse`}>
              <div className="h-10 bg-gray-200 rounded mb-2 mx-auto w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-2/3"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="estatisticas" className="mb-16">
      <div className="text-center mb-10">
        <h2 className={`text-3xl font-bold mb-3 ${variant === "transparent" ? "text-white" : "text-primary"}`}>
          Estatísticas Principais
        </h2>
        <p className={`text-xl md:text-2xl font-medium tracking-wide max-w-3xl mx-auto ${variant === "transparent" ? "text-white" : "text-gray-600"}`}>
          Dados Sobre a produção em Vitória do Xingu
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Estatísticas fixas */}
        {filteredStatistics?.map((stat) => (
          <Card key={stat.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1">
            <div className="border-t-4 border-[#00ff4c]"></div>
            <CardContent className="p-6 text-center">
              <div className="text-4xl font-bold text-primary-dark mb-3">{stat.value}</div>
              <div className="text-sm uppercase font-semibold tracking-wider mb-3 text-gray-700">{stat.label}</div>
              {stat.trend && (
                <div className="flex items-center justify-center text-sm font-medium">
                  <span className={`flex items-center ${stat.isPositive ? "text-green-600" : "text-red-600"}`}>
                    {stat.isPositive ? <ChevronUp className="w-5 h-5 mr-1" /> : <ChevronDown className="w-5 h-5 mr-1" />}
                    {stat.trendValue && <span className="mr-1">{stat.trendValue}</span>} {stat.trend}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Estatísticas dinâmicas */}
        {dynamicStatsConfig?.map((config: any) => (
          <DynamicStatisticCard key={config.id} config={config} variant={variant} />
        ))}
      </div>
    </section>
  );
};

export default StatisticsSection;