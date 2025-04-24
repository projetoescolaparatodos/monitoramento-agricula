
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { isYoutubeUrl, getYoutubeEmbedUrl } from "@/utils/mediaUtils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import "../../../src/index.css";

interface MediaGallerySectionProps {
  variant?: "default" | "transparent";
}

const MediaPreviewCard = ({ item }: { item: MediaItem }) => {
  // Verificar o tipo de mídia
  const isFirebaseVideo = item.mediaType === 'video' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isFirebaseImage = item.mediaType === 'image' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isYouTubeVideo = item.mediaUrl && isYoutubeUrl(item.mediaUrl);
  
  // Determinar a página destino
  const getDestinationPage = (pageType: string) => {
    switch (pageType) {
      case 'agriculture': return '/agriculture';
      case 'fishing': return '/fishing';
      case 'paa': return '/paa';
      default: return '/';
    }
  };
  
  // Formatar data se disponível
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), "d 'de' MMM", { locale: ptBR })
    : null;
  
  const pageLabel = {
    'agriculture': 'Agricultura',
    'fishing': 'Pesca',
    'paa': 'PAA',
    'home': 'Home'
  }[item.pageType] || 'Geral';
  
  return (
    <Link href={getDestinationPage(item.pageType)}>
      <Card className="overflow-hidden bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-transform hover:scale-105 h-full">
        <div className="w-full h-full relative">
          {isYouTubeVideo ? (
            <iframe
              className="w-full h-full rounded-t-lg"
              src={getYoutubeEmbedUrl(item.mediaUrl)}
              title={item.title || "Vídeo do YouTube"}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isFirebaseVideo ? (
            <video 
              className="w-full h-full object-cover"
              src={item.mediaUrl}
              poster={item.thumbnailUrl || ''}
              title={item.title || "Vídeo"}
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          ) : (
            <img 
              src={item.mediaUrl || item.thumbnailUrl} 
              alt={item.title || "Mídia"} 
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
            <span className="font-medium">{pageLabel}</span>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="font-medium text-sm text-white line-clamp-1">
              {/<\/?[a-z][\s\S]*>/i.test(item.title || "") ? (
                <div dangerouslySetInnerHTML={{ __html: item.title || "Sem título" }} />
              ) : (
                item.title || "Sem título"
              )}
            </h3>
            <div className="flex justify-between items-center mt-1">
              {item.author && (
                <span className="text-xs text-gray-200">
                  {item.author}
                </span>
              )}
              {formattedDate && (
                <span className="text-xs text-gray-300">
                  {formattedDate}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

const MediaGallerySection: React.FC<MediaGallerySectionProps> = ({ variant = "default" }) => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
  });

  // Filtramos apenas itens ativos e limitamos a 8 itens para a página inicial
  const displayItems = mediaItems?.filter(item => item.active !== false).slice(0, 8);

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <p className={`text-xl md:text-2xl font-medium tracking-wide max-w-3xl mx-auto ${variant === "transparent" ? "text-white" : "text-gray-700 dark:text-gray-200"}`}>
          Acompanhe o dia a dia das atividades agrícolas e pesqueiras, com fotos e vídeos das ações da SEMAPA e conteúdos informativos.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
          {Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden rounded-xl shadow">
              <Skeleton className="w-full h-full" />
              <CardContent className="p-3 absolute bottom-0 w-full bg-white/80 dark:bg-zinc-800/80">
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayItems?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
          {displayItems.map((item) => {
            // Determinar se é vídeo ou imagem vertical para ocupar espaço maior
            const isVideo = item.mediaType === 'video';
            const isVerticalOrVideo = isVideo || (item.orientation === 'vertical');
            
            return (
              <div 
                key={item.id} 
                className={`
                  ${isVerticalOrVideo ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                `}
              >
                <MediaPreviewCard item={item} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow">
          <p className="text-neutral-dark">Nenhuma mídia disponível no momento.</p>
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href="/media-gallery">
          <button className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full transition-colors">
            Ver todas as mídias
          </button>
        </Link>
      </div>
    </section>
  );
};

export default MediaGallerySection;
