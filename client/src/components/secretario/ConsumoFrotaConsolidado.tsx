import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Car,
  Fuel,
  Tractor,
  Fish,
  Wheat,
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

interface AtividadeComFrota {
  id: string;
  setor: 'agricultura' | 'pesca' | 'paa';
  atividade: string;
  veiculo: string;
  tempoOuDistancia: string;
  consumoEstimado: number;
  data: string;
  status: string;
}

const ConsumoFrotaConsolidado = () => {
  const [atividades, setAtividades] = useState<AtividadeComFrota[]>([]);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar veículos
        const veiculosSnapshot = await getDocs(collection(db, 'veiculos'));
        const veiculosData = veiculosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setVeiculos(veiculosData);

        const atividadesConsolidadas: AtividadeComFrota[] = [];

        // Buscar dados de agricultura (tratores)
        const tratoresSnapshot = await getDocs(collection(db, 'tratores'));
        tratoresSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const veiculo = veiculosData.find(v => v.id === data.tratoresSelecionados?.[0]);
          if (veiculo && data.tempoAtividade) {
            const tempoHoras = data.tempoAtividade / 60; // convertendo minutos para horas
            const consumo = tempoHoras * (veiculo.consumoMedio || 10);

            atividadesConsolidadas.push({
              id: doc.id,
              setor: 'agricultura',
              atividade: data.tipoServico || 'Atividade Agrícola',
              veiculo: veiculo.modelo,
              tempoOuDistancia: `${tempoHoras.toFixed(1)}h`,
              consumoEstimado: consumo,
              data: data.data || new Date().toISOString(),
              status: data.concluido ? 'Concluído' : 'Em Andamento'
            });
          }
        });

        // Buscar dados de pesca (viveiros)
        const viveirosSnapshot = await getDocs(collection(db, 'viveiros_em_construcao'));
        viveirosSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const veiculo = veiculosData.find(v => v.id === data.veiculoId);
          if (veiculo && data.tempoEstimadoHoras) {
            const tempoHoras = parseFloat(data.tempoEstimadoHoras);
            const consumo = tempoHoras * (veiculo.consumoMedio || 15);

            atividadesConsolidadas.push({
              id: doc.id,
              setor: 'pesca',
              atividade: 'Construção de Viveiro',
              veiculo: veiculo.modelo,
              tempoOuDistancia: `${tempoHoras}h`,
              consumoEstimado: consumo,
              data: data.dataCadastro || new Date().toISOString(),
              status: data.concluido ? 'Concluído' : 'Em Andamento'
            });
          }
        });

        // Buscar dados de PAA
        const paaSnapshot = await getDocs(collection(db, 'solicitacoes_paa'));
        paaSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const veiculo = veiculosData.find(v => v.id === data.veiculoId);
          if (veiculo && data.distanciaEstimadaKm && data.necessitaTransporte) {
            const distancia = parseFloat(data.distanciaEstimadaKm);
            const consumo = (distancia * 2) / (veiculo.consumoMedio || 10); // ida e volta

            atividadesConsolidadas.push({
              id: doc.id,
              setor: 'paa',
              atividade: 'Transporte PAA',
              veiculo: veiculo.modelo,
              tempoOuDistancia: `${distancia}km`,
              consumoEstimado: consumo,
              data: data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
              status: data.status || 'Pendente'
            });
          }
        });

        // Buscar dados de visitas técnicas
        const visitasSnapshot = await getDocs(collection(db, 'visitas_tecnicas'));
        visitasSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const veiculo = veiculosData.find(v => v.id === data.veiculoId);
          if (veiculo && data.distanciaEstimadaKm) {
            const distancia = parseFloat(data.distanciaEstimadaKm);
            const consumo = (distancia * 2) / (veiculo.consumoMedio || 10);

            atividadesConsolidadas.push({
              id: doc.id,
              setor: data.setor || 'pesca',
              atividade: 'Visita Técnica',
              veiculo: veiculo.modelo,
              tempoOuDistancia: `${distancia}km`,
              consumoEstimado: consumo,
              data: data.dataCadastro || new Date().toISOString(),
              status: data.concluida ? 'Concluído' : 'Pendente'
            });
          }
        });

        // Buscar em TODAS as coleções possíveis onde os dados podem estar
        const colecoesParaBuscar = [
          'solicitacoes_agricultura',
          'solicitacoes_agricultura_completo', 
          'atividades_agricultura',
          'servicos_agricultura',
          'tratores_atividades',
          'solicitacoes_servicos',
          'agricultura_solicitacoes'
        ];

        console.log('🔍 Iniciando busca em todas as coleções possíveis...');
        console.log('📋 Veículos disponíveis:', veiculosData.map(v => `${v.id}: ${v.modelo}`));

        for (const nomeColecao of colecoesParaBuscar) {
          try {
            console.log(`🔍 Buscando na coleção: ${nomeColecao}`);
            const snapshot = await getDocs(collection(db, nomeColecao));
            
            console.log(`📊 Coleção ${nomeColecao}: ${snapshot.size} documentos encontrados`);
            
            if (!snapshot.empty) {
              snapshot.docs.forEach((doc, index) => {
                const data = doc.data();
                console.log(`📄 Documento ${index + 1}/${snapshot.size} em ${nomeColecao}:`, {
                  id: doc.id,
                  data: data,
                  veiculoId: data.veiculoId,
                  tratoresSelecionados: data.tratoresSelecionados,
                  tempoAtividade: data.tempoAtividade,
                  tempoHoras: data.tempoHoras,
                  horas: data.horas,
                  tipoServico: data.tipoServico
                });

                // Tentar múltiplas formas de encontrar o veículo
                let veiculoId = data.veiculoId || 
                               data.tratoresSelecionados?.[0] || 
                               data.tratoresSelecionados ||
                               data.veiculo ||
                               data.tratores?.[0];

                if (Array.isArray(veiculoId)) {
                  veiculoId = veiculoId[0];
                }

                console.log(`🚜 Tentando encontrar veículo com ID: ${veiculoId}`);
                const veiculo = veiculosData.find(v => v.id === veiculoId);
                console.log(`🚜 Veículo encontrado:`, veiculo);

                if (veiculo) {
                  // Tentar múltiplas formas de encontrar o tempo
                  let tempoHoras = 0;
                  let tempoOriginal = null;

                  if (data.tempoAtividade) {
                    tempoOriginal = data.tempoAtividade;
                    tempoHoras = typeof data.tempoAtividade === 'string' ? 
                      parseFloat(data.tempoAtividade) : data.tempoAtividade;
                    if (tempoHoras > 24) {
                      tempoHoras = tempoHoras / 60; // Converter de minutos para horas
                    }
                  } else if (data.tempoHoras) {
                    tempoOriginal = data.tempoHoras;
                    tempoHoras = parseFloat(data.tempoHoras);
                  } else if (data.horas) {
                    tempoOriginal = data.horas;
                    tempoHoras = parseFloat(data.horas);
                  } else if (data.tempo) {
                    tempoOriginal = data.tempo;
                    tempoHoras = parseFloat(data.tempo);
                  }

                  console.log(`⏰ Tempo encontrado - Original: ${tempoOriginal}, Calculado: ${tempoHoras}h`);

                  if (tempoHoras > 0) {
                    const consumo = tempoHoras * (veiculo.consumoMedio || 10);
                    
                    console.log(`✅ Adicionando atividade: ${data.tipoServico || 'Serviço'} - ${tempoHoras}h - ${consumo}L`);

                    atividadesConsolidadas.push({
                      id: doc.id,
                      setor: 'agricultura',
                      atividade: data.tipoServico || data.atividade || data.servico || 'Solicitação de Serviço',
                      veiculo: veiculo.modelo,
                      tempoOuDistancia: `${tempoHoras.toFixed(1)}h`,
                      consumoEstimado: consumo,
                      data: data.dataServico || data.data || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
                      status: data.concluido ? 'Concluído' : (data.status || 'Pendente')
                    });
                  } else {
                    console.log(`⚠️ Tempo inválido ou zero para documento ${doc.id}`);
                  }
                } else {
                  console.log(`⚠️ Veículo não encontrado para ID: ${veiculoId}`);
                }
              });
            }
          } catch (error) {
            console.log(`ℹ️ Coleção ${nomeColecao} não encontrada ou erro:`, error.message);
          }
        }

        console.log('🎯 RESUMO FINAL:');
        console.log(`📊 Total de atividades encontradas: ${atividadesConsolidadas.length}`);
        console.log(`🌾 Agricultura: ${atividadesConsolidadas.filter(a => a.setor === 'agricultura').length}`);
        console.log(`🐟 Pesca: ${atividadesConsolidadas.filter(a => a.setor === 'pesca').length}`);
        console.log(`🥬 PAA: ${atividadesConsolidadas.filter(a => a.setor === 'paa').length}`);
        console.log('📋 Atividades detalhadas:', atividadesConsolidadas);

        setAtividades(atividadesConsolidadas);
      } catch (error) {
        console.error('Erro ao buscar dados de consumo:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular estatísticas por setor
  const estatisticasPorSetor = () => {
    const agricultura = atividades.filter(a => a.setor === 'agricultura');
    const pesca = atividades.filter(a => a.setor === 'pesca');
    const paa = atividades.filter(a => a.setor === 'paa');

    return [
      {
        setor: 'Agricultura',
        icon: Tractor,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        atividades: agricultura.length,
        consumoTotal: agricultura.reduce((sum, a) => sum + a.consumoEstimado, 0),
        veiculosUsados: new Set(agricultura.map(a => a.veiculo)).size
      },
      {
        setor: 'Pesca',
        icon: Fish,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        atividades: pesca.length,
        consumoTotal: pesca.reduce((sum, a) => sum + a.consumoEstimado, 0),
        veiculosUsados: new Set(pesca.map(a => a.veiculo)).size
      },
      {
        setor: 'PAA',
        icon: Wheat,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
        atividades: paa.length,
        consumoTotal: paa.reduce((sum, a) => sum + a.consumoEstimado, 0),
        veiculosUsados: new Set(paa.map(a => a.veiculo)).size
      }
    ];
  };

  const dadosGrafico = estatisticasPorSetor().map(stat => ({
    setor: stat.setor,
    consumo: Math.round(stat.consumoTotal),
    atividades: stat.atividades
  }));

  const cores = ['#22C55E', '#3B82F6', '#F59E0B'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando dados de consumo...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas por setor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {estatisticasPorSetor().map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.setor}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{stat.setor}</h3>
                      <p className="text-sm text-gray-600">{stat.atividades} atividades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {Math.round(stat.consumoTotal)}L
                    </p>
                    <p className="text-xs text-gray-500">
                      {stat.veiculosUsados} veículos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Consumo por Setor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGrafico}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="setor" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'consumo' ? `${value}L` : value,
                  name === 'consumo' ? 'Combustível' : 'Atividades'
                ]} />
                <Bar dataKey="consumo" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Distribuição de Consumo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosGrafico}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="consumo"
                  label={({setor, consumo}) => `${setor}: ${consumo}L`}
                >
                  {dadosGrafico.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} litros`, 'Consumo']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de atividades detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Atividades Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Setor</th>
                  <th className="p-3 border text-left">Atividade</th>
                  <th className="p-3 border text-left">Veículo</th>
                  <th className="p-3 border text-center">Tempo/Distância</th>
                  <th className="p-3 border text-center">Consumo Est.</th>
                  <th className="p-3 border text-center">Status</th>
                  <th className="p-3 border text-center">Data</th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((atividade) => (
                  <tr key={atividade.id} className="hover:bg-gray-50">
                    <td className="p-3 border">
                      <Badge variant="outline" className={
                        atividade.setor === 'agricultura' ? 'border-green-500 text-green-700' :
                        atividade.setor === 'pesca' ? 'border-blue-500 text-blue-700' :
                        'border-amber-500 text-amber-700'
                      }>
                        {atividade.setor.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-3 border">{atividade.atividade}</td>
                    <td className="p-3 border font-medium">{atividade.veiculo}</td>
                    <td className="p-3 border text-center">{atividade.tempoOuDistancia}</td>
                    <td className="p-3 border text-center font-semibold">
                      {Math.round(atividade.consumoEstimado)}L
                    </td>
                    <td className="p-3 border text-center">
                      <Badge 
                        variant={atividade.status.includes('Concluído') ? 'default' : 'secondary'}
                        className={atividade.status.includes('Concluído') ? 'bg-green-100 text-green-800' : ''}
                      >
                        {atividade.status}
                      </Badge>
                    </td>
                    <td className="p-3 border text-center text-sm">
                      {new Date(atividade.data).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {atividades.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                Nenhuma atividade com uso de frota registrada ainda.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConsumoFrotaConsolidado;