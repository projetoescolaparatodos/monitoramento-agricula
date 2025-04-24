import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { MediaItem } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MediaCardPreview from "@/components/common/MediaCardPreview";

interface MediaGallerySectionProps {
  mediaItems?: MediaItem[];
  isLoading?: boolean;
}

const MediaGallerySection: React.FC<MediaGallerySectionProps> = ({ mediaItems, isLoading }) => {
  return (
    <section className="py-12 bg-neutral-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-2 text-center">Galeria de Mídia</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-2xl mx-auto">
          Uma prévia das mídias enviadas nas páginas de Agricultura, Pesca e PAA
        </p>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] gap-4 grid-flow-dense">
            {Array(6).fill(0).map((_, index) => (
              <div 
                key={index} 
                className={`overflow-hidden rounded-xl shadow-md ${
                  index % 3 === 0 ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'
                }`}
              >
                <Skeleton className="w-full h-full" />
              </div>
            ))}
          </div>
        ) : mediaItems && mediaItems.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[150px] gap-4 grid-flow-dense">
              {mediaItems.map((item, index) => {
                // Determinamos se é um item grande (vertical ou vídeo) 
                // para ocupar mais espaço no grid
                const isVerticalOrVideo = item.mediaType === 'video' || index % 3 === 0;

                return (
                  <div
                    key={item.id}
                    className={`
                      overflow-hidden rounded-xl shadow-md transition-transform hover:scale-[1.02]
                      ${isVerticalOrVideo ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}
                    `}
                  >
                    <MediaCardPreview item={item} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/media-gallery">
                <Button variant="outline" className="hover:bg-green-100 dark:hover:bg-green-900">
                  Ver Galeria Completa
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-800 rounded-lg shadow">
            <p className="text-gray-500 dark:text-gray-400">Nenhuma mídia disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaGallerySection;