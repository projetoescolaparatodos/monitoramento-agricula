
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Card } from "@/components/ui/card";

const MediaGallerySection = () => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ["/api/media-items?pageType=paa"],
  });

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Galeria de Mídia</h2>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mediaItems?.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              {item.mediaType === "image" && (
                <img
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default MediaGallerySection;
