
import { useQuery } from "@tanstack/react-query";
import { StatisticItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronUp, ChevronDown } from "lucide-react";

const StatisticsSection = ({ variant = "default" }: { variant?: "default" | "transparent" }) => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
  });

  // Filtrar estatísticas ativas e ordenar por ordem
  const activeStatistics = statistics?.filter(stat => stat.active !== false && stat.pageType === 'home')
    .sort((a, b) => (a.order || 0) - (b.order || 0));

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
        {isLoading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <div key={index} className={`${variant === "transparent" ? "bg-white/80" : "bg-white"} rounded-lg shadow-lg p-6 text-center border-t-4 border-primary animate-pulse`}>
              <div className="h-10 bg-gray-200 rounded mb-2 mx-auto w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-2/3"></div>
            </div>
          ))
        ) : (
          activeStatistics?.map((stat) => (
            <Card key={stat.id} className={`${variant === "transparent" ? "bg-white/90 backdrop-blur-sm" : "bg-white"} rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1`}>
              <div className="border-t-4 border-primary"></div>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary-dark mb-3">{stat.value}</div>
                <div className="text-sm uppercase font-semibold tracking-wider mb-3 text-gray-700">{stat.label}</div>
                {stat.trend && (
                  <div className="flex items-center justify-center text-sm font-medium">
                    <span className={`flex items-center ${stat.isPositive ? "text-green-600" : "text-red-600"}`}>
                      {stat.isPositive ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                      {stat.trendValue && <span className="mr-1">{stat.trendValue}</span>} {stat.trend}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

export default StatisticsSection;
