
import React from 'react';

interface InfoPanelImageDisplayProps {
  content: string;
  className?: string;
}

const InfoPanelImageDisplay: React.FC<InfoPanelImageDisplayProps> = ({ content, className = "" }) => {
  // Extrair URLs de imagens do conteúdo HTML
  const extractImageUrls = (htmlContent: string): string[] => {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const urls: string[] = [];
    let match;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      urls.push(match[1]);
    }
    
    return urls;
  };

  // Remover tags img do conteúdo HTML
  const removeImages = (htmlContent: string): string => {
    return htmlContent.replace(/<img[^>]*>/g, '');
  };

  const imageUrls = extractImageUrls(content);
  const textContent = removeImages(content);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Conteúdo de texto */}
      <div 
        dangerouslySetInnerHTML={{ __html: textContent }}
        className="prose prose-sm max-w-none"
      />
      
      {/* Galeria de imagens - apenas em desktop */}
      {imageUrls.length > 0 && (
        <div className="hidden md:block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg shadow-md">
                <img
                  src={url}
                  alt={`Imagem ${index + 1}`}
                  className="w-full h-48 lg:h-64 object-cover hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoPanelImageDisplay;
