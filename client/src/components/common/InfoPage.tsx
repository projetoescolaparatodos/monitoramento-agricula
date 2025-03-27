
import { Card, CardContent } from "@/components/ui/card";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Chart } from "@/components/common/Chart";

interface InfoPageProps {
  title: string;
  subtitle: string;
  contents: ContentItem[];
  charts: ChartItem[];
  mediaItems: MediaItem[];
  isLoadingContents: boolean;
  isLoadingCharts: boolean;
  isLoadingMedia: boolean;
}

const InfoPage = ({
  title,
  subtitle,
  contents,
  charts,
  mediaItems,
  isLoadingContents,
  isLoadingCharts,
  isLoadingMedia
}: InfoPageProps) => {
  if (isLoadingContents || isLoadingCharts || isLoadingMedia) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-gray-600">{subtitle}</p>
      </div>

      {contents && contents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {contents.map((content) => (
            <Card key={content.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
                <p className="text-gray-600">{content.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {charts && charts.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Estatísticas e Gráficos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charts.map((chart) => (
              <Card key={chart.id}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{chart.title}</h3>
                  <Chart data={chart.data} type={chart.type} options={chart.options} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {mediaItems && mediaItems.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Imagens e Mídia</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mediaItems.map((media) => (
              <Card key={media.id}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{media.title}</h3>
                  <img 
                    src={media.url} 
                    alt={media.title} 
                    className="w-full h-auto rounded-lg"
                  />
                  {media.description && (
                    <p className="text-gray-600 mt-4">{media.description}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPage;
