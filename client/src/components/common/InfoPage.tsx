
import { useQuery } from "@tanstack/react-query";
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

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
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{title}</h1>
        <p className="text-xl text-gray-600">{subtitle}</p>
      </div>

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

      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Estatísticas e Gráficos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {charts.map((chart) => (
            <Card key={chart.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{chart.title}</h3>
                {/* Add chart visualization component here */}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Galeria de Mídia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaItems.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                {item.type === 'image' ? (
                  <img src={item.url} alt={item.title} className="w-full h-48 object-cover rounded" />
                ) : (
                  <video src={item.url} controls className="w-full h-48 object-cover rounded" />
                )}
                <h4 className="mt-2 font-medium">{item.title}</h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPage;
