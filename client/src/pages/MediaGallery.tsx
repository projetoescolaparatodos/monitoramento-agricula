
import { useQuery } from "@tanstack/react-query";
import { MediaItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import MediaDisplay from "@/components/common/MediaDisplay";
import { useState } from "react";

// Componente para filtros de mídia
const MediaFilters = ({ 
  selectedFilter, 
  setSelectedFilter 
}: { 
  selectedFilter: string, 
  setSelectedFilter: (filter: string) => void 
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-8 justify-center">
      <button 
        onClick={() => setSelectedFilter('all')}
        className={`px-4 py-2 rounded-full text-sm ${
          selectedFilter === 'all' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Todas
      </button>
      <button 
        onClick={() => setSelectedFilter('agriculture')}
        className={`px-4 py-2 rounded-full text-sm ${
          selectedFilter === 'agriculture' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Agricultura
      </button>
      <button 
        onClick={() => setSelectedFilter('fishing')}
        className={`px-4 py-2 rounded-full text-sm ${
          selectedFilter === 'fishing' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Pesca
      </button>
      <button 
        onClick={() => setSelectedFilter('paa')}
        className={`px-4 py-2 rounded-full text-sm ${
          selectedFilter === 'paa' 
            ? 'bg-green-600 text-white' 
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        PAA
      </button>
    </div>
  );
};

const MediaGallery = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ['/api/media-items'],
  });

  // Filtramos apenas itens ativos
  const filteredItems = mediaItems?.filter(item => 
    item.active !== false && 
    (selectedFilter === 'all' || item.pageType === selectedFilter)
  );

  return (
    <main className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-6">Galeria de Mídia</h1>
      <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
        Confira todas as fotos e vídeos relacionados às atividades da SEMAPA, incluindo conteúdos
        das áreas de Agricultura, Pesca e PAA.
      </p>
      
      <MediaFilters 
        selectedFilter={selectedFilter} 
        setSelectedFilter={setSelectedFilter} 
      />

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
          {Array(8).fill(0).map((_, index) => (
            <div key={index} className={`relative overflow-hidden rounded-lg shadow ${index % 3 === 0 ? 'col-span-2 row-span-2' : ''}`}>
              <Skeleton className="w-full h-full" />
            </div>
          ))}
        </div>
      ) : filteredItems?.length ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] gap-4 grid-flow-dense">
          {filteredItems.map((item) => {
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
                <MediaDisplay 
                  item={item} 
                  className="h-full hover:shadow-lg transition-transform" 
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600">Nenhuma mídia encontrada para os filtros selecionados.</p>
        </div>
      )}
    </main>
  );
};

export default MediaGallery;
