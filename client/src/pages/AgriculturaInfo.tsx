
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

interface TratorData {
  fazenda: string;
  atividade: string;
  areaTrabalhada: string;
}

const AgriculturaInfo = () => {
  const [atividadesData, setAtividadesData] = useState<any[]>([]);
  const [areaData, setAreaData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const data = querySnapshot.docs.map(doc => doc.data() as TratorData);
      
      // Processa dados para gráfico de atividades
      const atividadesCount = data.reduce((acc: any, curr) => {
        acc[curr.atividade] = (acc[curr.atividade] || 0) + 1;
        return acc;
      }, {});
      
      const atividadesChartData = Object.entries(atividadesCount).map(([name, value]) => ({
        name,
        value
      }));
      
      // Processa dados para gráfico de área trabalhada
      const areaChartData = data.map(item => ({
        fazenda: item.fazenda,
        area: parseFloat(item.areaTrabalhada || '0')
      }));
      
      setAtividadesData(atividadesChartData);
      setAreaData(areaChartData);
    };
    
    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4 pt-20">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Atividades Agrícolas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={atividadesData}
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
            <CardTitle>Área Trabalhada por Fazenda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fazenda" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="area" fill="#82ca9d" name="Área (ha)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgriculturaInfo;
