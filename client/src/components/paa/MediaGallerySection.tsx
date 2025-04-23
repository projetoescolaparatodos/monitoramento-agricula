
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { MediaItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import MediaDisplay from "@/components/common/MediaDisplay";
import { Skeleton } from "@/components/ui/skeleton";

const MediaGallerySection: React.FC = () => {
  const { data: mediaItems, isLoading } = useQuery<MediaItem[]>({
    queryKey: ["media", "paa"],
    queryFn: () =>
      getDocs(
        query(collection(db, "media"), where("pageType", "==", "paa")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as MediaItem)),
      ),
  });

  return (
    <section className="py-12">
      <div className="container">
        <h2 className="text-2xl font-bold mb-2">Galeria de Mídia</h2>
        <p className="text-gray-600 mb-8">Imagens e vídeos das atividades do Programa de Aquisição de Alimentos</p>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : mediaItems && mediaItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mediaItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <MediaDisplay item={item} />
                <CardContent className="p-4">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-neutral-dark">Nenhuma mídia disponível no momento.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MediaGallerySection;
