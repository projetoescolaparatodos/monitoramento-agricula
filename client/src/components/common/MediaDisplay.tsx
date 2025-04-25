import React, { useState, useEffect } from 'react';
import { MediaItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { isYoutubeUrl, getYoutubeEmbedUrl } from '@/utils/mediaUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile'; // Assuming this hook exists

interface MediaDisplayProps {
  item: MediaItem;
  className?: string;
}

const MediaCard: React.FC<{
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: 'video' | 'image';
}> = ({ title, description, mediaUrl, mediaType }) => {
  const [expanded, setExpanded] = useState(false);
  const shortDescription = description.substring(0, 100) + "...";

  return (
    <Card>
      <div>
        {/* Media rendering logic (similar to original MediaDisplay) */}
        {mediaType === 'video' && (
          <video src={mediaUrl} controls />
        )}
        {mediaType === 'image' && (
          <img src={mediaUrl} alt={title} />
        )}
      </div>
      <CardContent>
        <h3>{title}</h3>
        {!expanded ? (
          <>
            <p>{shortDescription}</p>
            <button onClick={() => setExpanded(true)}>Saiba mais</button>
          </>
        ) : (
          <p>{description}</p>
        )}
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

  // Renderização de vídeos (YouTube ou Firebase Storage)
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MediaCard
        title={item.title || ''}
        description={item.description || ''}
        mediaUrl={item.mediaUrl || ''}
        mediaType={item.mediaType || 'image'} // Default to image if mediaType is missing
      />
    );
  } else {
    // Renderização de vídeos (YouTube ou Firebase Storage)
    if (isYouTubeVideo || isFirebaseVideo) {
      // Para YouTube, obtenha a URL de incorporação
      const embedUrl = isYouTubeVideo ? getYoutubeEmbedUrl(item.mediaUrl) : null;
      // Para vídeos do Firebase, use a URL diretamente

      return (
        <Card className={`media-display overflow-hidden bg-green-50/90 dark:bg-green-800/80 rounded-2xl shadow-md ${className} flex flex-col`}>
          <div className="w-full relative">
            {isYouTubeVideo && embedUrl ? (
              <iframe
                className="w-full aspect-video rounded-t-lg"
                src={embedUrl}
                title={item.title || "Vídeo do YouTube"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
                allowFullScreen
              />
            ) : isFirebaseVideo ? (
              <video 
                className="w-full h-auto rounded-t-lg object-contain"
                controls
                src={item.mediaUrl}
                poster={item.thumbnailUrl || ''}
                title={item.title || "Vídeo"}
              >
                Seu navegador não suporta a reprodução de vídeos.
              </video>
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
      <Card className={`media-display overflow-hidden bg-green-50/90 dark:bg-green-800/80 rounded-2xl shadow-md ${className} flex flex-col`}>
        <div className="relative">
          {!imageError ? (
            <div className="w-full mx-auto">
              <img 
                src={item.mediaUrl || item.thumbnailUrl} 
                alt={item.title || "Mídia"} 
                className="w-full h-auto object-contain rounded-t-lg"
                onError={() => setImageError(true)}
              />
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