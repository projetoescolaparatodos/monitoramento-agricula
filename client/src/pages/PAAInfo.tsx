
import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface PAAData {
  totalProdutores: number;
  producaoTotal: number;
  tiposAlimentos: string[];
}

export default function PAAInfo() {
  const [data, setData] = useState<PAAData>({ totalProdutores: 0, producaoTotal: 0, tiposAlimentos: [] });
  const [midias, setMidias] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "paa"));
      const total = querySnapshot.size;
      let producao = 0;
      let alimentos = new Set<string>();
      let medias: string[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        producao += data.quantidadeProduzida || 0;
        if (data.tipoAlimento) {
          alimentos.add(data.tipoAlimento);
        }
        if (data.midias) {
          medias = [...medias, ...data.midias];
        }
      });

      setData({
        totalProdutores: total,
        producaoTotal: producao,
        tiposAlimentos: Array.from(alimentos)
      });
      setMidias(medias);
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-8">Programa de Aquisição de Alimentos (PAA)</h1>
      
      <div className="prose max-w-none mb-8">
        <p className="text-lg">
          O Programa de Aquisição de Alimentos (PAA) é uma iniciativa que fortalece 
          a agricultura familiar em Vitória do Xingu, garantindo a compra de produtos 
          dos agricultores locais e sua distribuição para entidades assistenciais, 
          contribuindo para a segurança alimentar da população.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total de Produtores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalProdutores}</p>
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
            <CardTitle>Tipos de Alimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.tiposAlimentos.length}</p>
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
