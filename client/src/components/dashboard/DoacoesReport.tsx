
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Gift, Users, Calendar, Package } from 'lucide-react';

interface Doacao {
  id: string;
  eventoId: string;
  insumoId: string;
  quantidade: number;
  tecnico: {
    id: string;
    nome: string;
  };
  beneficiario: {
    nome: string;
    cpf?: string;
    propriedade?: string;
  };
  timestamp: any;
}

interface Evento {
  id: string;
  nome: string;
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
}

export const DoacoesReport: React.FC = () => {
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState('');
  const [selectedInsumo, setSelectedInsumo] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar eventos
        const eventosSnapshot = await getDocs(collection(db, 'eventos'));
        setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Evento[]);

        // Buscar insumos
        const insumosSnapshot = await getDocs(collection(db, 'insumos'));
        setInsumos(insumosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Insumo[]);

        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Construir query para doações
    let q = query(collection(db, 'doacoes_evento'), orderBy('timestamp', 'desc'));

    if (selectedEvento) {
      q = query(q, where('eventoId', '==', selectedEvento));
    }

    if (selectedInsumo) {
      q = query(q, where('insumoId', '==', selectedInsumo));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const doacoesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Doacao[];
      
      setDoacoes(doacoesData);
    });

    return () => unsubscribe();
  }, [selectedEvento, selectedInsumo, loading]);

  const getEventoNome = (eventoId: string) => {
    const evento = eventos.find(e => e.id === eventoId);
    return evento?.nome || 'Evento não encontrado';
  };

  const getInsumoInfo = (insumoId: string) => {
    const insumo = insumos.find(i => i.id === insumoId);
    return insumo ? `${insumo.nome} (${insumo.unidade})` : 'Insumo não encontrado';
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Evento', 'Insumo', 'Quantidade', 'Beneficiário', 'CPF', 'Propriedade', 'Técnico'];
    
    const csvData = doacoes.map(doacao => [
      doacao.timestamp?.toDate().toLocaleDateString('pt-BR') || '',
      getEventoNome(doacao.eventoId),
      getInsumoInfo(doacao.insumoId),
      doacao.quantidade,
      doacao.beneficiario.nome,
      doacao.beneficiario.cpf || '',
      doacao.beneficiario.propriedade || '',
      doacao.tecnico.nome
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `doacoes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calcular estatísticas
  const totalDoacoes = doacoes.length;
  const totalBeneficiarios = new Set(doacoes.map(d => d.beneficiario.nome)).size;
  const totalQuantidade = doacoes.reduce((sum, d) => sum + d.quantidade, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total de Doações</p>
                <p className="text-2xl font-bold text-gray-900">{totalDoacoes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Beneficiários</p>
                <p className="text-2xl font-bold text-gray-900">{totalBeneficiarios}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Itens Distribuídos</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuantidade.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Exportação */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Exportação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-1">Evento</label>
              <select
                value={selectedEvento}
                onChange={(e) => setSelectedEvento(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os eventos</option>
                {eventos.map(evento => (
                  <option key={evento.id} value={evento.id}>{evento.nome}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-48">
              <label className="block text-sm font-medium mb-1">Insumo</label>
              <select
                value={selectedInsumo}
                onChange={(e) => setSelectedInsumo(e.target.value)}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Todos os insumos</option>
                {insumos.map(insumo => (
                  <option key={insumo.id} value={insumo.id}>
                    {insumo.nome} ({insumo.unidade})
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={exportToCSV} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Doações */}
      <Card>
        <CardHeader>
          <CardTitle>Registros de Doações</CardTitle>
        </CardHeader>
        <CardContent>
          {doacoes.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma doação encontrada com os filtros selecionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiário</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Técnico</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doacoes.map((doacao) => (
                    <tr key={doacao.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doacao.timestamp?.toDate().toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {getEventoNome(doacao.eventoId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getInsumoInfo(doacao.insumoId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {doacao.quantidade.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{doacao.beneficiario.nome}</div>
                          {doacao.beneficiario.cpf && (
                            <div className="text-gray-500">CPF: {doacao.beneficiario.cpf}</div>
                          )}
                          {doacao.beneficiario.propriedade && (
                            <div className="text-gray-500">{doacao.beneficiario.propriedade}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doacao.tecnico.nome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
