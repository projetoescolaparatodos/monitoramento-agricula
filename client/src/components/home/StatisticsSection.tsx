import { useQuery } from "@tanstack/react-query";
import { StatisticItem } from "@/types";

const StatisticsSection = () => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics'],
  });

  return (
    <section id="estatisticas" className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-2">Estatísticas Principais</h2>
        <p className="text-neutral max-w-3xl mx-auto">Dados atualizados sobre a produção no Brasil</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 text-center border-t-4 border-primary animate-pulse">
              <div className="h-10 bg-gray-200 rounded mb-2 mx-auto w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 mx-auto w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded mx-auto w-2/3"></div>
            </div>
          ))
        ) : (
          statistics?.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg shadow p-6 text-center hover:shadow-md transition-shadow border-t-4 border-primary">
              <div className="text-4xl font-heading font-bold text-primary-dark mb-2">{stat.value}</div>
              <div className="text-sm text-neutral uppercase font-semibold tracking-wider mb-2">{stat.label}</div>
              {stat.trend && (
                <div className="text-sm">
                  <span className={stat.isPositive ? "text-success" : "text-error"}>
                    <i className={`fas fa-arrow-${stat.isPositive ? 'up' : 'down'} mr-1`}></i>
                    {stat.trend}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default StatisticsSection;