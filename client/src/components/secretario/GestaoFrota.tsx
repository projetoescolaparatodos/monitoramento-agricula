
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Car,
  Fuel,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  BarChart3
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface Veiculo {
  id: string;
  modelo: string;
  tipo: string;
  consumoMedio: number;
  status: 'funcionando' | 'quebrado';
  manutencoes: Array<{
    descricao: string;
    custo: number;
    data: string;
  }>;
}

const GestaoFrota = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [viveiros, setViveiros] = useState<any[]>([]);
  const [visitasTecnicas, setVisitasTecnicas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const veiculosSnapshot = await getDocs(collection(db, 'veiculos'));
        const veiculosData = veiculosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Veiculo[];

        // Buscar viveiros para análise de uso
        const viveirosSnapshot = await getDocs(collection(db, 'viveiros_em_construcao'));
        const viveirosData = viveirosSnapshot.docs.map(doc => doc.data());

        // Buscar visitas técnicas para análise de uso
        const visitasSnapshot = await getDocs(collection(db, 'visitas_tecnicas'));
        const visitasData = visitasSnapshot.docs.map(doc => doc.data());

        setVeiculos(veiculosData);
        setViveiros(viveirosData);
        setVisitasTecnicas(visitasData);
      } catch (error) {
        console.error('Erro ao carregar dados da frota:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Estatísticas gerais
  const veiculosFuncionando = veiculos.filter(v => v.status === 'funcionando').length;
  const veiculosQuebrados = veiculos.filter(v => v.status === 'quebrado').length;
  const custoTotalManutencoes = veiculos.reduce((total, veiculo) => 
    total + (veiculo.manutencoes?.reduce((subTotal, manutencao) => subTotal + manutencao.custo, 0) || 0), 0
  );

  // Métricas avançadas
  const disponibilidadeFrota = veiculos.length > 0 ? (veiculosFuncionando / veiculos.length) * 100 : 0;
  const tempoMedioInatividade = veiculos.reduce((total, veiculo) => {
    const tempoTotal = veiculo.manutencoes?.reduce((sum, m) => sum + (m.tempoInatividade || 0), 0) || 0;
    return total + tempoTotal;
  }, 0) / Math.max(veiculos.length, 1);

  const veiculosAltoRisco = veiculos.filter(v => {
    const custoManutencoes = v.manutencoes?.reduce((sum, m) => sum + m.custo, 0) || 0;
    const manutencoesCriticas = v.manutencoes?.filter(m => m.prioridadeUrgencia === 'critica').length || 0;
    return custoManutencoes > 5000 || manutencoesCriticas > 2;
  });

  const top3VeiculosCustoManutencao = veiculos
    .map(v => ({
      ...v,
      custoTotal: v.manutencoes?.reduce((sum, m) => sum + m.custo, 0) || 0
    }))
    .sort((a, b) => b.custoTotal - a.custoTotal)
    .slice(0, 3);

  // Análise de uso por veículo
  const analisarUsoVeiculos = () => {
    const usoVeiculos = new Map();
    
    // Contar usos em viveiros
    viveiros.forEach(viveiro => {
      if (viveiro.veiculoId) {
        const count = usoVeiculos.get(viveiro.veiculoId) || 0;
        usoVeiculos.set(viveiro.veiculoId, count + 1);
      }
    });
    
    // Contar usos em visitas técnicas
    visitasTecnicas.forEach(visita => {
      if (visita.veiculoId) {
        const count = usoVeiculos.get(visita.veiculoId) || 0;
        usoVeiculos.set(visita.veiculoId, count + 1);
      }
    });

    return Array.from(usoVeiculos.entries()).map(([veiculoId, usos]) => {
      const veiculo = veiculos.find(v => v.id === veiculoId);
      return {
        veiculo: veiculo ? `${veiculo.modelo} (${veiculo.tipo})` : 'Veículo não encontrado',
        usos,
        veiculoId
      };
    }).sort((a, b) => b.usos - a.usos);
  };

  // Estimativa de combustível por setor
  const calcularCombustivelPorSetor = async () => {
    const combustivelPorSetor = {
      pesca: 0, // Viveiros
      agricultura: 0, // Tratores
      geral: 0 // Visitas técnicas
    };

    // Calcular para viveiros (pesca)
    for (const viveiro of viveiros) {
      if (viveiro.veiculoId && viveiro.tempoEstimadoHoras) {
        const veiculo = veiculos.find(v => v.id === viveiro.veiculoId);
        if (veiculo) {
          const tempoHoras = parseFloat(viveiro.tempoEstimadoHoras) || 0;
          let combustivel = 0;
          
          if (veiculo.tipo === 'trator') {
            combustivel = tempoHoras * 10; // 10L por hora
          } else {
            const kmEstimados = tempoHoras * 30;
            combustivel = kmEstimados / veiculo.consumoMedio;
          }
          
          combustivelPorSetor.pesca += combustivel;
        }
      }
    }

    // Calcular para visitas técnicas (geral)
    for (const visita of visitasTecnicas) {
      if (visita.veiculoId && visita.distanciaEstimadaKm) {
        const veiculo = veiculos.find(v => v.id === visita.veiculoId);
        if (veiculo) {
          const distancia = parseFloat(visita.distanciaEstimadaKm) || 0;
          const combustivel = (distancia * 2) / veiculo.consumoMedio; // Ida e volta
          combustivelPorSetor.geral += combustivel;
        }
      }
    }

    return [
      { setor: 'Pesca', litros: Math.round(combustivelPorSetor.pesca) },
      { setor: 'Geral', litros: Math.round(combustivelPorSetor.geral) },
      { setor: 'Agricultura', litros: Math.round(combustivelPorSetor.agricultura) }
    ];
  };

  const dadosUsoVeiculos = analisarUsoVeiculos();
  const [combustivelPorSetor, setCombustivelPorSetor] = useState([]);

  useEffect(() => {
    if (veiculos.length > 0) {
      calcularCombustivelPorSetor().then(setCombustivelPorSetor);
    }
  }, [veiculos, viveiros, visitasTecnicas]);

  const cores = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados da frota...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-green-600">{veiculosFuncionando}</p>
                <p className="text-xs text-gray-600">Funcionando</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-red-600">{veiculosQuebrados}</p>
                <p className="text-xs text-gray-600">Quebrados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-amber-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  R$ {custoTotalManutencoes.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">Gasto em Manutenções</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{disponibilidadeFrota.toFixed(1)}%</p>
                <p className="text-xs text-gray-600">Disponibilidade</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas avançadas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Veículos Alto Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            {veiculosAltoRisco.length === 0 ? (
              <p className="text-center text-green-600 py-4">✅ Nenhum veículo em risco</p>
            ) : (
              <div className="space-y-3">
                {veiculosAltoRisco.map((veiculo) => (
                  <div key={veiculo.id} className="bg-orange-50 border border-orange-200 rounded p-3">
                    <h4 className="font-semibold text-orange-800">{veiculo.modelo}</h4>
                    <p className="text-sm text-orange-700">
                      Custo: R$ {(veiculo.manutencoes?.reduce((sum, m) => sum + m.custo, 0) || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-orange-600">
                      {veiculo.manutencoes?.filter(m => m.prioridadeUrgencia === 'critica').length || 0} manutenções críticas
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-red-600" />
              Top 3 Custos de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {top3VeiculosCustoManutencao.map((veiculo, index) => (
                <div key={veiculo.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium text-gray-800">#{index + 1} {veiculo.modelo}</span>
                    <p className="text-sm text-gray-600">{veiculo.tipo}</p>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    R$ {veiculo.custoTotal.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-blue-600" />
              Tempo Médio Inatividade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {tempoMedioInatividade.toFixed(1)} dias
              </div>
              <p className="text-sm text-gray-600">Por manutenção em média</p>
              <div className="mt-4 text-xs text-gray-500">
                Total de {veiculos.reduce((sum, v) => sum + (v.manutencoes?.length || 0), 0)} manutenções registradas
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Veículos mais utilizados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Veículos Mais Utilizados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosUsoVeiculos.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosUsoVeiculos.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="veiculo" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usos" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum dado de uso disponível ainda
              </p>
            )}
          </CardContent>
        </Card>

        {/* Consumo por setor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Consumo de Combustível por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {combustivelPorSetor.length > 0 && combustivelPorSetor.some(s => s.litros > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={combustivelPorSetor.filter(s => s.litros > 0)}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="litros"
                    label={({setor, litros}) => `${setor}: ${litros}L`}
                  >
                    {combustivelPorSetor.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} litros`, 'Consumo']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-8">
                Nenhum dado de consumo disponível ainda
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de veículos com status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Status da Frota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {veiculos.map((veiculo) => (
              <Card key={veiculo.id} className="border">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{veiculo.modelo}</h4>
                    <Badge 
                      variant={veiculo.status === 'funcionando' ? 'default' : 'destructive'}
                      className={veiculo.status === 'funcionando' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {veiculo.status === 'funcionando' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {veiculo.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Tipo: {veiculo.tipo}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Consumo: {veiculo.consumoMedio} km/L
                  </p>
                  {veiculo.manutencoes && veiculo.manutencoes.length > 0 && (
                    <p className="text-sm text-amber-600">
                      {veiculo.manutencoes.length} manutenções • 
                      R$ {veiculo.manutencoes.reduce((sum, m) => sum + m.custo, 0).toLocaleString()}
                    </p>
                  )}
                  {dadosUsoVeiculos.find(uso => uso.veiculoId === veiculo.id) && (
                    <p className="text-sm text-blue-600">
                      {dadosUsoVeiculos.find(uso => uso.veiculoId === veiculo.id)?.usos} utilizações
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoFrota;
