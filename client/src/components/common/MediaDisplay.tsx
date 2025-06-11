
import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { isYoutubeUrl, getYoutubeEmbedUrl } from '@/utils/mediaUtils';
import { isGoogleDriveLink, getGoogleDriveFileId } from '@/utils/driveHelper';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronDown, ChevronUp, Calendar, MapPin, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediaDisplayProps {
  item: MediaItem;
  className?: string;
}

const MediaCard: React.FC<{
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
  author?: string;
  authorImage?: string;
  createdAt?: string;
  location?: string;
  aspectRatio?: string;
  displayMode?: string;
  customAspectRatio?: string;
}> = ({ title, description, mediaUrl, mediaType, author, authorImage, createdAt, location, aspectRatio }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Limitar a descrição para exibição inicial
  const previewLength = 100;
  const shouldTruncate = description.length > previewLength;
  const previewText = shouldTruncate ? description.slice(0, previewLength) + '...' : description;
  
  // Formatar data se disponível
  const formattedDate = createdAt 
    ? format(new Date(createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  // Detecta o tipo de mídia com base na URL
  const isYouTubeVideo = mediaUrl && isYoutubeUrl(mediaUrl);
  
  const renderMedia = () => {
    if (mediaType === 'video') {
      if (isYouTubeVideo) {
        // Extrair o ID do vídeo do YouTube
        const embedUrl = getYoutubeEmbedUrl(mediaUrl);
        
        return (
          <div className="aspect-video w-full overflow-hidden rounded-t-lg">
            <iframe
              src={`${embedUrl}?rel=0&showinfo=0&controls=1`}
              className="w-full h-full"
              title={title}
              allowFullScreen
              loading="lazy"
            />
          </div>
        );
      } else {
        return (
          <div className="w-full flex justify-center items-center bg-black rounded-t-lg overflow-hidden">
            <video
              src={mediaUrl}
              controls
              title={title}
              className="h-auto w-auto max-h-[80vh] max-w-full object-contain"
            />
          </div>
        );
      }
    } else {
      return (
        <div className="w-full overflow-hidden rounded-t-lg bg-black/5">
          <div className="w-full">
            {!imageError ? (
              <img
                src={mediaUrl}
                alt={title}
                className="w-full h-auto object-contain max-h-[60vh]"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-40 flex items-center justify-center bg-gray-200">
                <p className="text-gray-500">Não foi possível carregar a imagem</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Detectar se é mídia vertical
  const isVerticalMedia = (
    aspectRatio === '9:16' || 
    aspectRatio === 'vertical' || 
    aspectRatio === '4:5' ||
    title.toLowerCase().includes('vertical') || 
    title.toLowerCase().includes('instagram') || 
    title.toLowerCase().includes('reels') ||
    title.toLowerCase().includes('tiktok')
  );

  return (
    <Card className={`media-card overflow-hidden shadow-md border-0 bg-gradient-to-b from-white to-green-50/50 dark:from-zinc-900 dark:to-zinc-900/95 rounded-xl transition-all duration-300 hover:shadow-lg ${isVerticalMedia ? 'max-w-[400px] mx-auto' : ''}`}>
      {renderMedia()}
      <CardContent className="p-4">
        {/<\/?[a-z][\s\S]*>/i.test(title) ? (
          <h3 
            className="font-semibold text-lg mb-2 text-green-800 dark:text-green-300 media-title" 
            dangerouslySetInnerHTML={{ __html: title }}
          />
        ) : (
          <h3 className="font-semibold text-lg mb-2 text-green-800 dark:text-green-300">{title}</h3>
        )}
        
        <AnimatePresence initial={false}>
          <motion.div 
            className="text-sm text-gray-700 dark:text-gray-300"
            initial={expanded ? { height: 0, opacity: 0 } : {}}
            animate={{ height: "auto", opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {expanded ? (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert rich-content"
                dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }}
              />
            ) : (
              // Versão de prévia - remove tags HTML mas mantém textos para a preview
              <p dangerouslySetInnerHTML={{ 
                __html: shouldTruncate 
                  ? previewText.replace(/<[^>]*>/g, '') + '...' 
                  : previewText.replace(/\n/g, '<br/>') 
              }} />
            )}
          </motion.div>
        </AnimatePresence>
        
        {shouldTruncate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              className="mt-2 text-primary flex items-center text-sm font-medium hover:underline"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <span>Mostrar menos</span>
                  <ChevronUp size={16} className="ml-1" />
                </>
              ) : (
                <>
                  <span>Saiba mais</span>
                  <ChevronDown size={16} className="ml-1" />
                </>
              )}
            </button>
          </motion.div>
        )}
        
        {/* Metadados (autor, data, localização) */}
        <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          {author && (
            <div className="flex items-center">
              <User size={14} className="mr-1" />
              <span>{author}</span>
            </div>
          )}
          
          {formattedDate && (
            <div className="flex items-center">
              <Calendar size={14} className="mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-center">
              <MapPin size={14} className="mr-1" />
              <span>{location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MediaDisplay: React.FC<MediaDisplayProps> = ({ item, className = "" }) => {
  // Processar o conteúdo rico da descrição
  const renderDescription = (text?: string) => {
    if (!text) return null;

    // Verificar se o texto já é conteúdo HTML do ReactQuill
    const isHtmlContent = /<\/?[a-z][\s\S]*>/i.test(text);

    if (isHtmlContent) {
      // Destacar hashtags dentro do HTML também
      const withHashtags = text.replace(
        />#([a-zA-Z0-9]+)</g, 
        '><span class="hashtag">#$1</span><'
      );

      // Destacar hashtags no texto normal também
      const enhancedHtml = withHashtags.replace(
        /(^|[^>])#(\w+)/g, 
        '$1<span class="hashtag">#$2</span>'
      );

      return <div className="description rich-content quill-content mt-3" dangerouslySetInnerHTML={{ __html: enhancedHtml }} />;
    } else {
      // Tratamento para texto puro (legado)
      // Converter quebras de linha
      const withLineBreaks = text.replace(/\n/g, '<br/>');

      // Destacar hashtags
      const withHashtags = withLineBreaks.replace(
        /#(\w+)/g, 
        '<span class="hashtag">#$1</span>'
      );

      // Suporte a markdown básico
      const withMarkdown = withHashtags
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

      return <div className="description rich-content mt-3" dangerouslySetInnerHTML={{ __html: withMarkdown }} />;
    }
  };

  // Formatar data se disponível
  const formattedDate = item.createdAt 
    ? format(new Date(item.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
    : null;

  // Estado para controle de erros de carregamento de imagem
  const [imageError, setImageError] = useState(false);

  // Detecta o tipo de mídia com base na URL e no mediaType
  const isFirebaseVideo = item.mediaType === 'video' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isFirebaseImage = item.mediaType === 'image' && item.mediaUrl?.includes('firebasestorage.googleapis.com');
  const isYouTubeVideo = item.mediaUrl && isYoutubeUrl(item.mediaUrl);
  const isGoogleDriveMedia = item.mediaUrl && isGoogleDriveLink(item.mediaUrl);

  // Renderização de vídeos (YouTube ou Firebase Storage)
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full h-auto">
        <MediaCard
          title={item.title || ''}
          description={item.description || ''}
          mediaUrl={item.mediaUrl || ''}
          mediaType={item.mediaType || 'image'}
          author={item.author}
          authorImage={item.authorImage}
          createdAt={item.createdAt}
          location={item.location}
          aspectRatio={item.aspectRatio}
          displayMode={item.displayMode}
          customAspectRatio={item.customAspectRatio}
        />
      </div>
    );
  } else {
    // Em desktop: tratar vídeos do Firebase como verticais (Instagram)
    const shouldTreatAsVertical = isFirebaseVideo && item.mediaType === 'video';
    // Renderização de mídias do Google Drive
    if (isGoogleDriveMedia) {
      return (
        <Card className={`media-display overflow-hidden bg-green-50/90 dark:bg-green-800/80 rounded-2xl shadow-md ${className} flex flex-col`}>
          <div className="w-full relative">
            {item.mediaUrl?.includes('/preview') ? (
              // Vídeo do Google Drive
              <iframe
                className="w-full rounded-t-lg aspect-video"
                src={item.mediaUrl}
                title={item.title || "Vídeo do Google Drive"}
                allow="autoplay"
                loading="lazy"
              />
            ) : (
              // Imagem do Google Drive
              <div className="w-full">
                <img
                  className="rounded-t-lg object-cover w-full h-auto max-h-[60vh]"
                  src={item.mediaUrl}
                  alt={item.title || "Imagem do Google Drive"}
                  onError={(e) => {
                    // Fallback para thumbnail do Drive
                    const fileId = getGoogleDriveFileId(item.mediaUrl || '');
                    if (fileId) {
                      e.currentTarget.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
                    }
                  }}
                />
              </div>
            )}
          </div>
          <CardContent className="p-5 space-y-4">
            {item.title && (
              <div className="media-title">
                {/<\/?[a-z][\s\S]*>/i.test(item.title) ? (
                  <div className="font-heading text-xl text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: item.title }} />
                ) : (
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{item.title}</h3>
                )}
              </div>
            )}
            {renderDescription(item.description)}

            {/* Extrair e exibir hashtags separadamente */}
            {item.description && (
              (() => {
                const hashtagRegex = /#(\w+)/g;
                const matches = [...item.description.matchAll(hashtagRegex)];

                if (matches.length > 0) {
                  const hashtags = matches.map(match => match[1]);
                  return (
                    <div className="tags-container">
                      {hashtags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  );
                }
                return null;
              })()
            )}

            <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {item.author && (
                  <div className="flex items-center">
                    {item.authorImage ? (
                      <img 
                        src={item.authorImage} 
                        alt={item.author} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        {item.author.charAt(0)}
                      </div>
                    )}
                    <span className="author">{item.author}</span>
                  </div>
                )}
              </div>

              {formattedDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedDate}
                </span>
              )}
            </div>

            {item.location && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📍 {item.location}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Renderização de vídeos (YouTube ou Firebase Storage)
    if (isYouTubeVideo || isFirebaseVideo) {
      // Para YouTube, obtenha a URL de incorporação
      const embedUrl = isYouTubeVideo ? getYoutubeEmbedUrl(item.mediaUrl) : null;
      // Para vídeos do Firebase, use a URL diretamente

      return (
        <Card className={`media-display overflow-hidden bg-green-50/90 dark:bg-green-800/80 rounded-2xl shadow-md ${className} flex flex-col ${
          shouldTreatAsVertical ? "max-w-[400px] mx-auto h-fit" : ""
        }`}>
          <div className="w-full relative">
            {isYouTubeVideo && embedUrl ? (
              // YouTube videos mantêm comportamento original
              <div className={`relative overflow-hidden ${
                item.aspectRatio === "vertical" || item.aspectRatio === "9:16" 
                  ? "w-full max-w-[400px] mx-auto" 
                  : "w-full"
              }`}>
                <iframe
                  className={`w-full rounded-t-lg ${
                    item.aspectRatio === "vertical" || item.aspectRatio === "9:16" 
                      ? "aspect-[9/16]" 
                      : "aspect-video"
                  }`}
                  src={embedUrl}
                  title={item.title || "Vídeo do YouTube"}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  loading="lazy"
                  allowFullScreen
                />
              </div>
            ) : isFirebaseVideo ? (
              // Vídeos do Firebase: tratar como verticais (Instagram) em desktop
              <div className={`w-full flex justify-center ${
                shouldTreatAsVertical ? "h-full" : ""
              }`}>
                <video 
                  className={`rounded-t-lg object-cover ${
                    shouldTreatAsVertical
                      ? "aspect-[9/16] w-full h-[600px]" 
                      : "w-full h-auto max-h-[60vh]"
                  }`}
                  controls
                  src={item.mediaUrl}
                  poster={item.thumbnailUrl || ''}
                  title={item.title || "Vídeo"}
                >
                  Seu navegador não suporta a reprodução de vídeos.
                </video>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-t-lg">
                <p className="text-gray-500">Não foi possível carregar o vídeo</p>
              </div>
            )}
          </div>
          <CardContent className="p-5 space-y-4">
            {item.title && (
              <div className="media-title">
                {/<\/?[a-z][\s\S]*>/i.test(item.title) ? (
                  <div className="font-heading text-xl text-gray-900 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: item.title }} />
                ) : (
                  <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{item.title}</h3>
                )}
              </div>
            )}
            {renderDescription(item.description)}

            {/* Extrair e exibir hashtags separadamente */}
            {item.description && (
              (() => {
                const hashtagRegex = /#(\w+)/g;
                const matches = [...item.description.matchAll(hashtagRegex)];

                if (matches.length > 0) {
                  const hashtags = matches.map(match => match[1]);
                  return (
                    <div className="tags-container">
                      {hashtags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                      ))}
                    </div>
                  );
                }
                return null;
              })()
            )}

            <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                {item.author && (
                  <div className="flex items-center">
                    {item.authorImage ? (
                      <img 
                        src={item.authorImage} 
                        alt={item.author} 
                        className="w-6 h-6 rounded-full mr-2"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                        {item.author.charAt(0)}
                      </div>
                    )}
                    <span className="author">{item.author}</span>
                  </div>
                )}
              </div>

              {formattedDate && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formattedDate}
                </span>
              )}
            </div>

            {item.location && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                📍 {item.location}
              </div>
            )}
          </CardContent>
        </Card>
      );
    }

    // Renderização padrão para imagens e outros tipos de mídia
    return (
      <Card className={`media-display overflow-hidden bg-green-50/90 dark:bg-green-800/80 rounded-2xl shadow-md ${className} flex flex-col ${
        item.aspectRatio === "vertical" || item.aspectRatio === "9:16" ? "max-w-[400px] mx-auto" : ""
      }`}>
        <div className="relative">
          {!imageError ? (
            <div className={`w-full mx-auto ${
              item.aspectRatio === "vertical" || item.aspectRatio === "9:16" 
                ? "max-w-[400px]" 
                : ""
            }`}>
              <div className="w-full">
                <img 
                  src={item.mediaUrl || item.thumbnailUrl} 
                  alt={item.title || "Mídia"} 
                  className={`w-full h-auto object-contain rounded-t-lg ${
                    item.aspectRatio === "vertical" || item.aspectRatio === "9:16"
                      ? "aspect-[9/16] max-h-[70vh]"
                      : "max-h-[60vh]"
                  }`}
                  onError={() => setImageError(true)}
                />
              </div>
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-200 flex items-center justify-center rounded-t-lg">
              <p className="text-gray-500">Não foi possível carregar a imagem</p>
            </div>
          )}
          {(item.views !== undefined || item.likes !== undefined) && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1 flex space-x-2">
              {item.views !== undefined && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {item.views}
                </span>
              )}
              {item.likes !== undefined && (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {item.likes}
                </span>
              )}
            </div>
          )}
        </div>
        <CardContent className="p-5 space-y-3">
          {item.title && <h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">{item.title}</h3>}
          {renderDescription(item.description)}

          {/* Extrair e exibir hashtags separadamente */}
          {item.description && (
            (() => {
              const hashtagRegex = /#(\w+)/g;
              const matches = [...item.description.matchAll(hashtagRegex)];

              if (matches.length > 0) {
                const hashtags = matches.map(match => match[1]);
                return (
                  <div className="tags-container">
                    {hashtags.map((tag, index) => (
                      <span key={index} className="tag">#{tag}</span>
                    ))}
                  </div>
                );
              }
              return null;
            })()
          )}

          <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              {item.author && (
                <div className="flex items-center">
                  {item.authorImage ? (
                    <img 
                      src={item.authorImage} 
                      alt={item.author} 
                      className="w-6 h-6 rounded-full mr-2"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                      {item.author.charAt(0)}
                    </div>
                  )}
                  <span className="author">{item.author}</span>
                </div>
              )}
            </div>

            {formattedDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formattedDate}
              </span>
            )}
          </div>

          {item.location && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              📍 {item.location}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
};

export default MediaDisplay;
