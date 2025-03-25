
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface PescaData {
  totalTanques: number;
  producaoTotal: number;
  areaCriacao: number;
}

export default function PescaInfo() {
  const [data, setData] = useState<PescaData>({ totalTanques: 0, producaoTotal: 0, areaCriacao: 0 });
  const [midias, setMidias] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const total = querySnapshot.size;
      let producao = 0;
      let area = 0;
      let medias: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        producao += data.quantidadeProduzida || 0;
        area += data.areaCriacao || 0;
        if (data.midias) {
          medias = [...medias, ...data.midias];
        }
      });

      setData({
        totalTanques: total,
        producaoTotal: producao,
        areaCriacao: area / 10000 // Convertendo para hectares
      });
      setMidias(medias);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Setor de Pesca</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg">
          O setor de pesca em Vitória do Xingu é responsável pelo desenvolvimento 
          da piscicultura local, oferecendo suporte técnico aos produtores e 
          garantindo a qualidade da produção de pescado na região.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Tanques</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalTanques}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produção Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.producaoTotal.toFixed(2)} kg</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Área de Criação</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.areaCriacao.toFixed(2)} ha</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Feed de Mídia</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {midias.map((url, index) => (
          <div key={index} className="aspect-video rounded-lg overflow-hidden">
            {url.includes('/video/') ? (
              <ReactPlayer
                url={url}
                width="100%"
                height="100%"
                controls
              />
            ) : (
              <img
                src={url}
                alt={`Mídia ${index + 1}`}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
