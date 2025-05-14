
import { useQuery } from '@tanstack/react-query';
import { StatisticItem } from '@/types';

const StatisticsSection = () => {
  const { data: statistics, isLoading } = useQuery<StatisticItem[]>({
    queryKey: ['/api/statistics?pageType=agriculture'],
  });

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Estatísticas da Agricultura</h2>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics?.map((stat) => (
            <div key={stat.id} className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-600">{stat.label}</h3>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              {stat.trend && (
                <p className={`text-sm mt-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendValue && `${stat.trendValue} `}{stat.trend}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StatisticsSection;
