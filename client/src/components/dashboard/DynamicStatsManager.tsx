
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Eye, EyeOff, Plus } from 'lucide-react';

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
}

export const DynamicStatsManager: React.FC = () => {
  const [configs, setConfigs] = useState<DynamicStatsConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [newConfig, setNewConfig] = useState({
    titulo: '',
    colecaoFonte: 'charts',
    campo: '',
    tipoAgregacao: 'sum' as const,
    periodo: '30dias',
    unidade: '',
    ativo: true,
    ordem: 0
  });

  useEffect(() => {
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
    
    if (!newConfig.titulo || !newConfig.campo) {
      toast({
        title: "Erro",
        description: "Título e campo são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'estatisticas_dinamicas', editingId), {
          ...newConfig,
          updatedAt: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Estatística atualizada com sucesso"
        });
      } else {
        await addDoc(collection(db, 'estatisticas_dinamicas'), {
          ...newConfig,
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
      colecaoFonte: 'charts',
      campo: '',
      tipoAgregacao: 'sum',
      periodo: '30dias',
      unidade: '',
      ativo: true,
      ordem: 0
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
      ordem: config.ordem
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
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Estatística
        </Button>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Título</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.titulo}
                    onChange={(e) => setNewConfig({...newConfig, titulo: e.target.value})}
                    placeholder="Ex: Total de mudas distribuídas"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Fonte de Dados</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.colecaoFonte}
                    onChange={(e) => setNewConfig({...newConfig, colecaoFonte: e.target.value})}
                  >
                    <option value="charts">Gráficos</option>
                    <option value="statistics">Estatísticas</option>
                    <option value="media_items">Itens de Mídia</option>
                    <option value="contents">Conteúdos</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Campo Numérico</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.campo}
                    onChange={(e) => setNewConfig({...newConfig, campo: e.target.value})}
                    placeholder="Ex: quantidade, valor, total"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo de Agregação</label>
                  <select
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.tipoAgregacao}
                    onChange={(e) => setNewConfig({...newConfig, tipoAgregacao: e.target.value as any})}
                  >
                    <option value="sum">Soma</option>
                    <option value="avg">Média</option>
                    <option value="max">Máximo</option>
                    <option value="count">Contagem</option>
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
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="mesAtual">Mês atual</option>
                    <option value="safraAtual">Safra atual</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade (opcional)</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={newConfig.unidade}
                    onChange={(e) => setNewConfig({...newConfig, unidade: e.target.value})}
                    placeholder="Ex: mudas, hectares, famílias"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Agregação</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {configs.map((config) => (
                    <tr key={config.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{config.titulo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.colecaoFonte}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.campo}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{config.tipoAgregacao}</td>
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
