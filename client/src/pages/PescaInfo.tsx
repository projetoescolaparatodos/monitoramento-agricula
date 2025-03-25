
import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  ResponsiveContainer
} from 'recharts';

interface PescaData {
  localidade: string;
  tipoPesca: string;
  quantidadeProduzida: number;
}

const PescaInfo = () => {
  const [pescaData, setPescaData] = useState<any[]>([]);
  const [producaoData, setProducaoData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const data = querySnapshot.docs.map(doc => doc.data() as PescaData);
      
      // Processa dados para gráfico de tipos de pesca
      const tiposCount = data.reduce((acc: any, curr) => {
        acc[curr.tipoPesca] = (acc[curr.tipoPesca] || 0) + 1;
        return acc;
      }, {});
      
      const pescaChartData = Object.entries(tiposCount).map(([name, value]) => ({
        name,
        value
      }));
      
      // Processa dados para gráfico de produção
      const producaoChartData = data.map(item => ({
        localidade: item.localidade,
        quantidade: item.quantidadeProduzida
      }));
      
      setPescaData(pescaChartData);
      setProducaoData(producaoChartData);
    };
    
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Pesca</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pescaData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                />
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produção por Localidade</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={producaoData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="localidade" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#82ca9d" name="Quantidade (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PescaInfo;
