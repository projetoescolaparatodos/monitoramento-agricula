
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Eye, EyeOff, Plus, Package } from 'lucide-react';

interface Insumo {
  id: string;
  nome: string;
  unidade: string;
  ativo: boolean;
  criadoEm: any;
  isKit?: boolean;
  kitComposicao?: KitItem[];
}

interface KitItem {
  insumoId: string;
  quantidade: number;
  insumoNome?: string;
}

export const InsumosManager: React.FC = () => {
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [novoInsumo, setNovoInsumo] = useState({
    nome: '',
    unidade: '',
    ativo: true,
    isKit: false,
    kitComposicao: [] as KitItem[]
  });

  const [showKitForm, setShowKitForm] = useState(false);
  const [insumosDisponiveis, setInsumosDisponiveis] = useState<Insumo[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'insumos'),
      (snapshot) => {
        const insumosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Insumo[];
        
        setInsumos(insumosData.sort((a, b) => a.nome.localeCompare(b.nome)));
        
        // Filtrar insumos que não são kits para usar na composição de kits
        const insumosNaoKits = insumosData.filter(insumo => !insumo.isKit && insumo.ativo);
        setInsumosDisponiveis(insumosNaoKits);
        
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar insumos:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoInsumo.nome || !novoInsumo.unidade) {
      toast({
        title: "Erro",
        description: "Nome e unidade são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    if (novoInsumo.isKit && novoInsumo.kitComposicao.length === 0) {
      toast({
        title: "Erro",
        description: "Um kit deve ter pelo menos um item",
        variant: "destructive"
      });
      return;
    }

    if (novoInsumo.isKit) {
      const kitValido = novoInsumo.kitComposicao.every(item => 
        item.insumoId && item.quantidade > 0
      );
      
      if (!kitValido) {
        toast({
          title: "Erro",
          description: "Todos os itens do kit devem ter insumo e quantidade válidos",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'insumos', editingId), {
          ...novoInsumo,
          updatedAt: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Insumo atualizado com sucesso"
        });
      } else {
        await addDoc(collection(db, 'insumos'), {
          ...novoInsumo,
          criadoEm: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Insumo criado com sucesso"
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar insumo:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar insumo",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNovoInsumo({
      nome: '',
      unidade: '',
      ativo: true,
      isKit: false,
      kitComposicao: []
    });
    setShowForm(false);
    setShowKitForm(false);
    setEditingId(null);
  };

  const handleEdit = (insumo: Insumo) => {
    setNovoInsumo({
      nome: insumo.nome,
      unidade: insumo.unidade,
      ativo: insumo.ativo,
      isKit: insumo.isKit || false,
      kitComposicao: insumo.kitComposicao || []
    });
    setEditingId(insumo.id);
    setShowForm(true);
    setShowKitForm(insumo.isKit || false);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'insumos', id), {
        ativo: !currentActive,
        updatedAt: Timestamp.now()
      });
      toast({
        title: "Sucesso",
        description: `Insumo ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
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

  const deleteInsumo = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este insumo?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'insumos', id));
      toast({
        title: "Sucesso",
        description: "Insumo excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir insumo",
        variant: "destructive"
      });
    }
  };

  const adicionarItemKit = () => {
    setNovoInsumo(prev => ({
      ...prev,
      kitComposicao: [...prev.kitComposicao, { insumoId: '', quantidade: 0 }]
    }));
  };

  const removerItemKit = (index: number) => {
    setNovoInsumo(prev => ({
      ...prev,
      kitComposicao: prev.kitComposicao.filter((_, i) => i !== index)
    }));
  };

  const atualizarItemKit = (index: number, field: 'insumoId' | 'quantidade', value: string | number) => {
    setNovoInsumo(prev => ({
      ...prev,
      kitComposicao: prev.kitComposicao.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
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
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Insumos</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Insumo
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingId ? 'Editar Insumo' : 'Novo Insumo'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Insumo</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={novoInsumo.nome}
                    onChange={(e) => setNovoInsumo({...novoInsumo, nome: e.target.value})}
                    placeholder="Ex: Pintos de frango, Calcário, Mudas de café"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Unidade de Medida</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={novoInsumo.unidade}
                    onChange={(e) => setNovoInsumo({...novoInsumo, unidade: e.target.value})}
                    placeholder="Ex: unidades, sacas, mudas, kg"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isKit"
                  checked={novoInsumo.isKit}
                  onChange={(e) => {
                    const isKit = e.target.checked;
                    setNovoInsumo({...novoInsumo, isKit, kitComposicao: isKit ? novoInsumo.kitComposicao : []});
                    setShowKitForm(isKit);
                  }}
                  className="rounded focus:ring-2 focus:ring-green-500"
                />
                <label htmlFor="isKit" className="text-sm font-medium">
                  Este é um kit (composto por múltiplos insumos)
                </label>
              </div>

              {showKitForm && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium">Composição do Kit</h4>
                    <Button type="button" onClick={adicionarItemKit} size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Item
                    </Button>
                  </div>
                  
                  {novoInsumo.kitComposicao.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border rounded-lg bg-gray-50">
                      <div>
                        <label className="block text-sm font-medium mb-1">Insumo</label>
                        <select
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={item.insumoId}
                          onChange={(e) => atualizarItemKit(index, 'insumoId', e.target.value)}
                          required
                        >
                          <option value="">Selecione um insumo</option>
                          {insumosDisponiveis.map((insumo) => (
                            <option key={insumo.id} value={insumo.id}>
                              {insumo.nome} ({insumo.unidade})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Quantidade</label>
                        <input
                          type="number"
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          value={item.quantidade}
                          onChange={(e) => atualizarItemKit(index, 'quantidade', Number(e.target.value))}
                          placeholder="Ex: 30"
                          min="1"
                          required
                        />
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => removerItemKit(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {novoInsumo.kitComposicao.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Clique em "Adicionar Item" para começar a compor o kit
                    </div>
                  )}
                </div>
              )}
              
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
          <CardTitle>Insumos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {insumos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum insumo cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {insumos.map((insumo) => (
                    <tr key={insumo.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="font-medium">{insumo.nome}</span>
                          {insumo.isKit && (
                            <Gift className="w-4 h-4 ml-2 text-blue-600" title="Kit" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          insumo.isKit ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {insumo.isKit ? 'Kit' : 'Individual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{insumo.unidade}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          insumo.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {insumo.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleActive(insumo.id, insumo.ativo)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {insumo.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(insumo)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInsumo(insumo.id)}
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
