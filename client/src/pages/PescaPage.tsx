
import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Card } from "@/components/ui/card";
import { Fish } from "lucide-react";
import ReactPlayer from 'react-player';

export default function PescaPage() {
  const [data, setData] = useState({
    totalPescadores: 0,
    videos: [],
    estatisticas: {}
  });

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const pescaData = querySnapshot.docs.map(doc => doc.data());
      setData(pescaData[0] || {});
    };
    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Pesca em Vitória do Xingu</h1>
      
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Sobre o Setor</h2>
        <p className="text-gray-600">
          O setor pesqueiro de Vitória do Xingu representa uma importante 
          atividade econômica e cultural para nossa região. Com rica 
          biodiversidade aquática, nossos pescadores mantêm viva a tradição 
          da pesca artesanal sustentável.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Dados do Setor</h2>
          <div className="space-y-2">
            <p>Total de Pescadores: {data.totalPescadores}</p>
            {/* Add more statistics here */}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Análise e Gráficos</h2>
          <div className="h-64">
            {/* Add charts here */}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Feed de Mídias</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.videos?.map((video, index) => (
            <div key={index} className="aspect-video">
              <ReactPlayer
                url={video.url}
                width="100%"
                height="100%"
                controls
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
