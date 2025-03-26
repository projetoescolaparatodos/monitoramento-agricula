
import { ContentItem, ChartItem, MediaItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <h1 className="text-4xl font-bold mb-2">{title}</h1>
      <p className="text-lg text-gray-600 mb-8">{subtitle}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {isLoadingContents ? (
          <Skeleton className="h-48" />
        ) : (
          contents.map((content) => (
            <Card key={content.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">{content.title}</h3>
                <div dangerouslySetInnerHTML={{ __html: content.content }} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {!isLoadingCharts && charts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Dados e Estatísticas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {charts.map((chart) => (
              <Card key={chart.id}>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{chart.title}</h3>
                  {/* Chart component rendering logic here */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoadingMedia && mediaItems.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Galeria de Mídia</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mediaItems.map((item) => (
              <div key={item.id} className="aspect-square">
                {item.type === "video" ? (
                  <video src={item.url} controls className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <img src={item.url} alt={item.title} className="w-full h-full object-cover rounded-lg" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPage;
