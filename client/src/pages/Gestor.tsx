
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { ContentItem, ChartItem, MediaItem } from "@/types";

const Gestor = () => {
  const { data: contents, isLoading: isLoadingContents } = useQuery<ContentItem[]>({
    queryKey: ["contents", "gestor"],
    queryFn: () =>
      getDocs(
        query(collection(db, "contents"), where("pageType", "==", "gestor")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: charts, isLoading: isLoadingCharts } = useQuery<ChartItem[]>({
    queryKey: ["charts", "gestor"],
    queryFn: () =>
      getDocs(
        query(collection(db, "charts"), where("pageType", "==", "gestor")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  const { data: mediaItems, isLoading: isLoadingMedia } = useQuery<MediaItem[]>({
    queryKey: ["media", "gestor"],
    queryFn: () =>
      getDocs(
        query(collection(db, "media"), where("pageType", "==", "gestor")),
      ).then((snapshot) =>
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      ),
  });

  return (
    <div className="container mx-auto px-4 pt-28 pb-16">
      <h1 className="text-3xl font-bold mb-8">Área do Gestor</h1>
      {/* Conteúdo a ser implementado */}
    </div>
  );
};

export default Gestor;
