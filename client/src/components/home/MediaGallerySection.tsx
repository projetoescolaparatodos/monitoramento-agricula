import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { isYoutubeUrl, getYoutubeEmbedUrl } from "@/utils/mediaUtils";
import { isGoogleDriveLink, getGoogleDriveThumbnail, getGoogleDriveFileId } from "@/utils/driveHelper";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Instagram, Play } from "lucide-react";
import "../../../src/index.css";

// Componente para thumbnail do Google Drive com tratamento de erro
const GoogleDriveThumbnail: React.FC<{ mediaUrl: string; title: string }> = ({ mediaUrl, title }) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const fileId = isGoogleDriveLink(mediaUrl) ? getGoogleDriveFileId(mediaUrl) : '';
  
  if (!fileId) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Link inválido</p>
      </div>
    );
  }

  const thumbnailUrl = getGoogleDriveThumbnail(fileId, 800);
  const fallbackUrl = getGoogleDriveThumbnail(fileId, 512);
  
  return (
    <div className="w-full h-full relative bg-gray-100">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      {!imageError ? (
        <img 
          src={thumbnailUrl}
          alt={title} 
          className="w-full h-full object-cover"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            // Tentar URL de fallback menor
            const img = new Image();
            img.onload = () => setImageError(false);
            img.onerror = () => setImageError(true);
            img.src = fallbackUrl;
            
            if (img.complete && img.naturalWidth > 0) {
              (event.target as HTMLImageElement).src = fallbackUrl;
            } else {
              setImageError(true);
            }
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center text-blue-600">
          <Play size={32} className="mb-2" />
          <p className="text-sm font-medium">Mídia do Drive</p>
          <p className="text-xs opacity-75">Clique para visualizar</p>
        </div>
      )}
      
      {/* Indicador de que é mídia do Google Drive */}
      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
        <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8l6-6V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>
        </svg>
        Drive
      </div>
    </div>
  );
};

interface MediaGallerySectionProps {
  variant?: "default" | "transparent";
}

const MediaPreviewCard = ({ item }: { item: MediaItem }) => {
  // Verificar o tipo de mídia
  const isFirebaseVideo = item.mediaType === 'video' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isFirebaseImage = item.mediaType === 'image' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isYouTubeVideo = item.mediaUrl && isYoutubeUrl(item.mediaUrl);
  const isGoogleDriveMedia = item.mediaUrl && isGoogleDriveLink(item.mediaUrl);

  // Determinar a página destino com âncora para a seção de galeria
  const getDestinationPage = (pageType: string) => {
    switch (pageType) {
      case 'agriculture': return '/agriculture#media';
      case 'fishing': return '/fishing#media';
      case 'paa': return '/paa#media';
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

  // Se a mídia for da página Home, não há necessidade de link/redirecionamento
  const isHomePage = item.pageType === 'home';

  // Conteúdo do card para reutilização
  const cardContent = (
    <Card className="overflow-hidden bg-white/90 dark:bg-zinc-800/90 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-transform hover:scale-105 h-full flex flex-col">
      <div className="w-full h-60 relative overflow-hidden">
        {isYouTubeVideo ? (
          <iframe
            className="w-full h-full rounded-t-lg"
            src={getYoutubeEmbedUrl(item.mediaUrl)}
            title={item.title || "Vídeo do YouTube"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            loading="lazy"
            allowFullScreen
          />
        ) : isGoogleDriveMedia ? (
          <GoogleDriveThumbnail 
            mediaUrl={item.mediaUrl} 
            title={item.title || "Mídia do Google Drive"}
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
            loading="lazy"
          />
        )}

        {/* Ícone do Instagram */}
        {item.instagramUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(item.instagramUrl, '_blank');
            }}
            className="absolute top-3 right-3 z-10 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform duration-200"
            title="Ver no Instagram"
          >
            <Instagram size={16} />
          </button>
        )}

        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1">
          <span className="font-medium">{pageLabel}</span>
        </div>
      </div>

      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-medium text-green-800 dark:text-green-400 line-clamp-1 mb-1">
          {/<\/?[a-z][\s\S]*>/i.test(item.title || "") ? (
            <div dangerouslySetInnerHTML={{ __html: item.title || "Sem título" }} />
          ) : (
            item.title || "Sem título"
          )}
        </h3>

        {item.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
            {item.description.replace(/<[^>]*>/g, '')}
          </p>
        )}

        <div className="flex justify-between items-center mt-auto text-xs text-gray-500 dark:text-gray-400">
          {item.author && (
            <span>{item.author}</span>
          )}
          {formattedDate && (
            <span>{formattedDate}</span>
          )}
        </div>
      </div>
    </Card>
  );

  // Se for da página home, apenas renderiza o card sem link
  if (isHomePage) {
    return cardContent;
  }

  // Caso contrário, mantém o comportamento anterior com redirecionamento
  return (
    <Link href={getDestinationPage(item.pageType)} onClick={(e) => {
      // Previne o comportamento padrão
      e.preventDefault(); 

      // Navega para a página e rola até a seção de mídia
      window.location.href = `/${item.pageType}#media`;
    }}>
      {cardContent}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden rounded-xl shadow h-full flex flex-col">
              <Skeleton className="w-full h-60" />
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-1/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayItems?.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {(window.innerWidth <= 640 ? displayItems.slice(-4) : displayItems).map((item) => (
            <div key={item.id} className="h-full">
              <MediaPreviewCard item={item} />
            </div>
          ))}
        </div>
      ) : (
        <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow">
          <p className="text-neutral-dark">Nenhuma mídia disponível no momento.</p>
        </div>
      )}
    </section>
  );
};

export default MediaGallerySection;