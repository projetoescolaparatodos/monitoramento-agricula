
import { useQuery } from '@tanstack/react-query';
import { MediaItem } from '@/types';

const MediaGallerySection = () => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items?pageType=agriculture'],
  });

  const displayItems = mediaItems?.slice(0, 4);

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold mb-8">Galeria de Mídia</h2>
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayItems?.map((item) => (
            <div key={item.id} className="aspect-square rounded-lg overflow-hidden">
              <img
                src={item.url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MediaGallerySection;
