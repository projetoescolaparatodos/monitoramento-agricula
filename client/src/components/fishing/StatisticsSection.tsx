
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";

const StatisticsSection = () => {
  const { data: statistics, isLoading } = useQuery({
    queryKey: ["/api/statistics?pageType=fishing"],
  });

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Estatísticas da Pesca</h2>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statistics?.map((stat) => (
            <Card key={stat.id} className="p-6">
              <h3 className="font-semibold text-lg">{stat.label}</h3>
              <p className="text-3xl font-bold mt-2">{stat.value}</p>
              {stat.trend && (
                <p className={`text-sm mt-2 ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trendValue && `${stat.trendValue} `}{stat.trend}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default StatisticsSection;
