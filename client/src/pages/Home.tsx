import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface EstatisticasGerais {
  totalAgricultores: number;
  culturasData: { name: string; value: number; }[];
  setoresData: { name: string; value: number; }[];
}

export default function Home() {
  const navigate = useNavigate();
  const [estatisticas, setEstatisticas] = useState<EstatisticasGerais>({
    totalAgricultores: 0,
    culturasData: [],
    setoresData: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        const agriculturaSnapshot = await getDocs(collection(db, 'agricultura'));
        const pescaSnapshot = await getDocs(collection(db, 'pesca'));
        const paaSnapshot = await getDocs(collection(db, 'paa'));

        const totalAgricultores = agriculturaSnapshot.size + pescaSnapshot.size + paaSnapshot.size;

        // Dados de exemplo para culturas (você pode adaptar conforme seus dados reais)
        const culturasData = [
          { name: 'Cacau', value: 40 },
          { name: 'Açaí', value: 30 },
          { name: 'Citros', value: 20 },
          { name: 'Outros', value: 10 }
        ];

        const setoresData = [
          { name: 'Agricultura', value: agriculturaSnapshot.size },
          { name: 'Pesca', value: pescaSnapshot.size },
          { name: 'PAA', value: paaSnapshot.size }
        ];

        setEstatisticas({
          totalAgricultores,
          culturasData,
          setoresData
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchEstatisticas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Secretaria de Agricultura, Pesca e Abastecimento</h1>
          <p className="text-gray-600 mb-4">
            Bem-vindo ao Portal da SEMAPA - Secretaria Municipal de Agricultura, Pesca e Abastecimento
            de Vitória do Xingu. Aqui você encontra informações sobre nossos programas e serviços
            voltados ao desenvolvimento agrícola e pesqueiro do município.
          </p>
          <div className="text-lg font-semibold">
            Total de Produtores Cadastrados: {estatisticas.totalAgricultores}
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Distribuição por Cultura</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estatisticas.culturasData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estatisticas.culturasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Distribuição por Setor</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={estatisticas.setoresData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {estatisticas.setoresData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Button 
            className="h-32 text-lg"
            onClick={() => navigate('/agricultura')}
          >
            Agricultura
          </Button>
          <Button
            className="h-32 text-lg"
            onClick={() => navigate('/pesca')}
          >
            Pesca
          </Button>
          <Button
            className="h-32 text-lg"
            onClick={() => navigate('/paa')}
          >
            PAA
          </Button>
        </div>
      </div>
    </div>
  );
}