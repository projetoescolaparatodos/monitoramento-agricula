
import React from 'react';
import { MediaItem } from '@/types';
import { isYoutubeUrl, getYoutubeVideoId } from '@/utils/mediaUtils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MediaDisplayProps {
  item: MediaItem;
  className?: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ item, className = '' }) => {
  // Determinar o tipo de mídia - imagem, vídeo do YouTube ou outro
  const getMediaType = (item: MediaItem) => {
    if (item.mediaType === 'video' || (item.mediaUrl && isYoutubeUrl(item.mediaUrl))) {
      return 'video';
    }
    return item.mediaType || 'image';
  };

  const mediaType = getMediaType(item);
  
  // Formatação de data relativa (ex: "há 2 dias")
  const formattedDate = item.createdAt 
    ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ptBR })
    : '';

  // Processamento de hashtags para destacá-las
  const renderDescription = (text?: string) => {
    if (!text) return null;
    
    // Divide o texto em partes: texto normal e hashtags
    const parts = text.split(/(#[^\s#]+)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <span key={index} className="text-blue-500 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Renderização básica de markdown (negrito, itálico, links)
  const renderMarkdown = (text?: string) => {
    if (!text) return null;
    
    // Substituir ** para negrito
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Substituir * para itálico
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // Substituir [texto](url) para links
    formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>');
    // Substituir quebras de linha
    formatted = formatted.replace(/\n/g, '<br/>');
    
    return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div className={`media-display overflow-hidden ${className} transition-all duration-300 hover:scale-102 hover:shadow-lg`}>
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md">
        {/* Área da mídia */}
        <div className="relative overflow-hidden rounded-t-2xl">
          {mediaType === 'image' ? (
            <div className="relative group aspect-square sm:aspect-video h-full w-full">
              <img
                src={item.mediaUrl}
                alt={item.title || 'Imagem'}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : mediaType === 'video' ? (
            <div className="relative aspect-video w-full">
              <iframe 
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${getYoutubeVideoId(item.mediaUrl || '')}`}
                title={item.title || 'Vídeo do YouTube'}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="aspect-video flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <p className="text-gray-500 dark:text-gray-400">Mídia não suportada</p>
            </div>
          )}
        </div>

        {/* Container estilo Instagram */}
        <div className="p-5 space-y-3">
          {/* Cabeçalho com título e data */}
          <div className="flex justify-between items-start">
            <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white line-clamp-2">
              {item.title}
            </h3>
            {formattedDate && (
              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                {formattedDate}
              </span>
            )}
          </div>
          
          {/* Descrição com suporte a markdown */}
          {item.description && (
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
              {renderMarkdown(item.description)}
            </div>
          )}
          
          {/* Área de hashtags */}
          {item.tags && (
            <div className="pt-2 text-sm space-x-1">
              {renderDescription(item.tags)}
            </div>
          )}
          
          {/* Autor ou campo extra opcional */}
          {item.author && (
            <div className="pt-2 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0 mr-2">
                {item.authorImage ? (
                  <img src={item.authorImage} alt={item.author} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-500">
                    {item.author.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.author}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaDisplay;
