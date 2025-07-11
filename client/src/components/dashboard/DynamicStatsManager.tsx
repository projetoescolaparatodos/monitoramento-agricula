
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, Timestamp, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Eye, EyeOff, Plus, Package, Gift } from 'lucide-react';

interface DynamicStatsConfig {
  id: string;
  titulo: string;
  colecaoFonte: string;
  campo: string;
  tipoAgregacao: 'sum' | 'avg' | 'max' | 'count';
  periodo: string;
  unidade: string;
  ativo: boolean;
  ordem: number;
  createdAt: any;
  // Novos campos para integração com doações
  insumoId?: string;
  eventoId?: string;
  filtroAdicional?: any[];
}

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  ativo: boolean;
}

interface Evento {
  id: string;
  nome: string;
  ativo: boolean;
  dataInicio: any;
  dataFim: any;
}

export const DynamicStatsManager: React.FC = () => {
  const [configs, setConfigs] = useState<DynamicStatsConfig[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newConfig, setNewConfig] = useState({
    titulo: '',
    colecaoFonte: 'doacoes_evento',
    campo: 'quantidade',
    tipoAgregacao: 'sum' as const,
    periodo: 'hoje',
    unidade: '',
    ativo: true,
    ordem: 0,
    insumoId: '',
    eventoId: '',
    filtroAdicional: []
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Buscar insumos ativos
        const insumosQuery = query(collection(db, 'insumos'), where('ativo', '==', true));
        const insumosSnapshot = await getDocs(insumosQuery);
        const insumosData = insumosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Insumo[];
        setInsumos(insumosData);

        // Buscar eventos ativos
        const eventosQuery = query(collection(db, 'eventos'), where('ativo', '==', true));
        const eventosSnapshot = await getDocs(eventosQuery);
        const eventosData = eventosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Evento[];
        setEventos(eventosData);
      } catch (error) {
        console.error('Erro ao buscar insumos e eventos:', error);
      }
    };

    fetchInitialData();

    const unsubscribe = onSnapshot(
      collection(db, 'estatisticas_dinamicas'),
      (snapshot) => {
        const configsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as DynamicStatsConfig[];
        
        setConfigs(configsData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar configurações:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newConfig.titulo) {
      toast({
        title: "Erro",
        description: "Título é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Construir filtros adicionais baseados na seleção
    const filtroAdicional = [];
    if (newConfig.eventoId) {
      filtroAdicional.push({ fieldPath: 'eventoId', opStr: '==', value: newConfig.eventoId });
    }
    if (newConfig.insumoId) {
      filtroAdicional.push({ fieldPath: 'insumoId', opStr: '==', value: newConfig.insumoId });
    }

    // Definir unidade automaticamente se insumo for selecionado
    let unidade = newConfig.unidade;
    if (newConfig.insumoId && !unidade) {
      const insumoSelecionado = insumos.find(i => i.id === newConfig.insumoId);
      if (insumoSelecionado) {
        unidade = insumoSelecionado.unidade;
      }
    }

    const configData = {
      ...newConfig,
      unidade,
      filtroAdicional
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'estatisticas_dinamicas', editingId), {
          ...configData,
          updatedAt: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Estatística atualizada com sucesso"
        });
      } else {
        await addDoc(collection(db, 'estatisticas_dinamicas'), {
          ...configData,
          createdAt: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Estatística criada com sucesso"
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar configuração",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewConfig({
      titulo: '',
      colecaoFonte: 'doacoes_evento',
      campo: 'quantidade',
      tipoAgregacao: 'sum',
      periodo: 'hoje',
      unidade: '',
      ativo: true,
      ordem: 0,
      insumoId: '',
      eventoId: '',
      filtroAdicional: []
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (config: DynamicStatsConfig) => {
    setNewConfig({
      titulo: config.titulo,
      colecaoFonte: config.colecaoFonte,
      campo: config.campo,
      tipoAgregacao: config.tipoAgregacao,
      periodo: config.periodo,
      unidade: config.unidade,
      ativo: config.ativo,
      ordem: config.ordem,
      insumoId: config.insumoId || '',
      eventoId: config.eventoId || '',
      filtroAdicional: config.filtroAdicional || []
    });
    setEditingId(config.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'estatisticas_dinamicas', id), {
        ativo: !currentActive,
        updatedAt: Timestamp.now()
      });
      toast({
        title: "Sucesso",
        description: `Estatística ${!currentActive ? 'ativada' : 'desativada'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status",
        variant: "destructive"
      });
    }
  };

  const deleteConfig = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta estatística?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'estatisticas_dinamicas', id));
      toast({
        title: "Sucesso",
        description: "Estatística excluída com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir estatística",
        variant: "destructive"
      });
    }
  };

  const criarTemplateDoacao = () => {
    setNewConfig({
      titulo: 'Total de Doações Hoje',
      colecaoFonte: 'doacoes_evento',
      campo: '',
      tipoAgregacao: 'count',
      periodo: 'hoje',
      unidade: 'doações',
      ativo: true,
      ordem: configs.length,
      insumoId: '',
      eventoId: '',
      filtroAdicional: []
    });
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Estatísticas Dinâmicas</h2>
        <div className="flex gap-2">
          <Button 
            onClick={() => criarTemplateDoacao()} 
            variant="outline" 
            className="border-green-600 text-green-600 hover:bg-green-50"
          >
            <Gift className="w-4 h-4 mr-2" />
            Template de Doação
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Estatística
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingId ? 'Editar Estatística' : 'Nova Estatística Dinâmica'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-4">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium mb-1">Título da Estatística</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.titulo}
                    onChange={(e) => setNewConfig({...newConfig, titulo: e.target.value})}
                    placeholder="Ex: Total de mudas distribuídas hoje"
                    required
                  />
                </div>

                {/* Evento */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Gift className="inline w-4 h-4 mr-1" />
                    Evento (opcional)
                  </label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.eventoId}
                    onChange={(e) => setNewConfig({...newConfig, eventoId: e.target.value})}
                  >
                    <option value="">Todos os eventos</option>
                    {eventos.map((evento) => (
                      <option key={evento.id} value={evento.id}>
                        {evento.nome}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Insumo */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Package className="inline w-4 h-4 mr-1" />
                    Insumo Específico (opcional)
                  </label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.insumoId}
                    onChange={(e) => {
                      const insumoSelecionado = insumos.find(i => i.id === e.target.value);
                      setNewConfig({
                        ...newConfig, 
                        insumoId: e.target.value,
                        unidade: insumoSelecionado ? insumoSelecionado.unidade : ''
                      });
                    }}
                  >
                    <option value="">Todos os insumos</option>
                    {insumos.map((insumo) => (
                      <option key={insumo.id} value={insumo.id}>
                        {insumo.nome} ({insumo.unidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Fonte de Dados</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.colecaoFonte}
                      onChange={(e) => setNewConfig({...newConfig, colecaoFonte: e.target.value})}
                    >
                      <option value="doacoes_evento">Doações de Eventos</option>
                      <option value="charts">Gráficos</option>
                      <option value="statistics">Estatísticas</option>
                      <option value="media_items">Itens de Mídia</option>
                      <option value="contents">Conteúdos</option>
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">Campo de Dados</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.campo}
                      onChange={(e) => setNewConfig({...newConfig, campo: e.target.value})}
                    >
                      {newConfig.colecaoFonte === 'doacoes_evento' ? (
                        <>
                          <option value="quantidade">Quantidade</option>
                          <option value="">Contagem de Doações</option>
                        </>
                      ) : (
                        <>
                          <option value="value">Valor</option>
                          <option value="quantidade">Quantidade</option>
                          <option value="">Contagem</option>
                        </>
                      )}
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Cálculo</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.tipoAgregacao}
                      onChange={(e) => setNewConfig({...newConfig, tipoAgregacao: e.target.value as any})}
                    >
                      <option value="sum">Soma Total</option>
                      <option value="count">Contagem</option>
                      <option value="avg">Média</option>
                      <option value="max">Máximo</option>
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">Período</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.periodo}
                      onChange={(e) => setNewConfig({...newConfig, periodo: e.target.value})}
                    >
                      <option value="hoje">Hoje</option>
                      <option value="7dias">Últimos 7 dias</option>
                      <option value="30dias">Últimos 30 dias</option>
                      <option value="mesAtual">Mês atual</option>
                      <option value="safraAtual">Safra atual</option>
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">Unidade</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.unidade}
                      onChange={(e) => setNewConfig({...newConfig, unidade: e.target.value})}
                      placeholder="Ex: mudas, kg, unidades"
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">Ordem de Exibição</label>
                    <input
                      type="number"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      value={newConfig.ordem}
                      onChange={(e) => setNewConfig({...newConfig, ordem: parseInt(e.target.value) || 0})}
                      min="0"
                    />
                  </div>
                </div>
              
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingId ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhuma estatística dinâmica configurada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insumo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cálculo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs.map((config) => {
                    const eventoNome = config.eventoId ? eventos.find(e => e.id === config.eventoId)?.nome || 'Evento não encontrado' : 'Todos';
                    const insumoNome = config.insumoId ? insumos.find(i => i.id === config.insumoId)?.nome || 'Insumo não encontrado' : 'Todos';
                    
                    return (
                      <tr key={config.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{config.titulo}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eventoNome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumoNome}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {config.tipoAgregacao} {config.campo || 'contagem'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.periodo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            config.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {config.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleActive(config.id, config.ativo)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {config.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleEdit(config)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteConfig(config.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
