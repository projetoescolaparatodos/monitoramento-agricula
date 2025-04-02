import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const MediaGallerySection = () => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
  });

  // Limit to 4 items for homepage display
  const displayItems = mediaItems?.slice(0, 4);

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        {/* Removed duplicate title */}
        <p className="text-white text-xl md:text-2xl font-medium tracking-wide max-w-3xl mx-auto">
          Imagens e vídeos sobre atividades agrícolas em Vitória do Xingu
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="relative overflow-hidden rounded-lg shadow h-48">
              <Skeleton className="w-full h-full" />
            </div>
          ))
        ) : displayItems?.length ? (
          displayItems.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg shadow group h-48">
              <img 
                src={item.mediaUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h4 className="font-heading font-semibold">{item.title}</h4>
                  {item.description && (
                    <p className="text-xs opacity-80">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-neutral-dark">Nenhuma mídia disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaGallerySection;