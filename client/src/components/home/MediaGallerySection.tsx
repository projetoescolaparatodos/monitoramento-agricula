import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";

export const MediaGallerySection = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch media items here.  This is a placeholder; replace with your actual API call.
    const fetchMediaItems = async () => {
      try {
        const response = await fetch('/api/media-items');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMediaItems(data);
      } catch (error) {
        console.error("Error fetching media items:", error);
        // Handle error appropriately, e.g., display an error message
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaItems();
  }, []);

  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-secondary mb-2">
          Galeria de Mídia
        </h2>
        <p className="text-neutral max-w-3xl mx-auto">
          Fotos e vídeos dos projetos em andamento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-4 text-center py-12 bg-white rounded-lg shadow">
            <p className="text-neutral-dark">Carregando...</p>
          </div>
        ) : mediaItems.length > 0 ? (
          mediaItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {item.type === 'video' ? (
                <video src={item.url} controls className="w-full h-48 object-cover" />
              ) : (
                <img src={item.url} alt={item.description} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <p className="text-sm text-gray-600">{item.description}</p>
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