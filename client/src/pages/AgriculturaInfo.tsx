
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface AgriculturaData {
  totalTratores: number;
  areaTotal: number;
  agricultoresCadastrados: number;
}

export default function AgriculturaInfo() {
  const [data, setData] = useState<AgriculturaData>({ totalTratores: 0, areaTotal: 0, agricultoresCadastrados: 0 });
  const [midias, setMidias] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "agricultura"));
      const total = querySnapshot.size;
      let area = 0;
      let medias: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        area += data.areaMecanizacao || 0;
        if (data.midias) {
          medias = [...medias, ...data.midias];
        }
      });

      setData({
        totalTratores: total,
        areaTotal: area / 10000, // Convertendo para hectares
        agricultoresCadastrados: total
      });
      setMidias(medias);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Setor de Agricultura</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg">
          O setor de agricultura em Vitória do Xingu é fundamental para o desenvolvimento econômico 
          da região, fornecendo suporte aos agricultores locais através de serviços de mecanização 
          agrícola e assistência técnica.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Tratores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalTratores}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Área Total Atendida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.areaTotal.toFixed(2)} ha</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agricultores Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.agricultoresCadastrados}</p>
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
