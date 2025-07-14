
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Edit, Eye, EyeOff, Plus, Calendar, ExternalLink } from 'lucide-react';

interface Evento {
  id: string;
  nome: string;
  dataInicio: any;
  dataFim: any;
  ativo: boolean;
  criadoEm: any;
}

export const EventosManager: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  const [novoEvento, setNovoEvento] = useState({
    nome: '',
    dataInicio: '',
    dataFim: '',
    ativo: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'eventos'),
      (snapshot) => {
        const eventosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Evento[];
        
        setEventos(eventosData.sort((a, b) => 
          b.criadoEm?.toDate() - a.criadoEm?.toDate()
        ));
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao buscar eventos:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!novoEvento.nome || !novoEvento.dataInicio || !novoEvento.dataFim) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const dataInicio = Timestamp.fromDate(new Date(novoEvento.dataInicio));
      const dataFim = Timestamp.fromDate(new Date(novoEvento.dataFim));

      if (editingId) {
        await updateDoc(doc(db, 'eventos', editingId), {
          ...novoEvento,
          dataInicio,
          dataFim,
          updatedAt: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Evento atualizado com sucesso"
        });
      } else {
        await addDoc(collection(db, 'eventos'), {
          ...novoEvento,
          dataInicio,
          dataFim,
          criadoEm: Timestamp.now()
        });
        toast({
          title: "Sucesso",
          description: "Evento criado com sucesso"
        });
      }
      
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar evento",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNovoEvento({
      nome: '',
      dataInicio: '',
      dataFim: '',
      ativo: true
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (evento: Evento) => {
    setNovoEvento({
      nome: evento.nome,
      dataInicio: evento.dataInicio?.toDate().toISOString().split('T')[0] || '',
      dataFim: evento.dataFim?.toDate().toISOString().split('T')[0] || '',
      ativo: evento.ativo
    });
    setEditingId(evento.id);
    setShowForm(true);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'eventos', id), {
        ativo: !currentActive,
        updatedAt: Timestamp.now()
      });
      toast({
        title: "Sucesso",
        description: `Evento ${!currentActive ? 'ativado' : 'desativado'} com sucesso`
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

  const deleteEvento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'eventos', id));
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir evento",
        variant: "destructive"
      });
    }
  };

  const openTelao = (eventoId: string) => {
    const url = `/evento-telao?evento=${eventoId}`;
    window.open(url, '_blank');
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
        <h2 className="text-2xl font-bold text-gray-900">Gerenciar Eventos</h2>
        <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {editingId ? 'Editar Evento' : 'Novo Evento'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Evento</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={novoEvento.nome}
                    onChange={(e) => setNovoEvento({...novoEvento, nome: e.target.value})}
                    placeholder="Ex: Semana do Produtor 2024"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={novoEvento.dataInicio}
                    onChange={(e) => setNovoEvento({...novoEvento, dataInicio: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Fim</label>
                  <input
                    type="date"
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    value={novoEvento.dataFim}
                    onChange={(e) => setNovoEvento({...novoEvento, dataFim: e.target.value})}
                    required
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
          <CardTitle>Eventos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum evento cadastrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID do Evento</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventos.map((evento) => (
                    <tr key={evento.id}>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{evento.nome}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono bg-gray-50 rounded px-2 py-1">
                        {evento.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {evento.dataInicio?.toDate().toLocaleDateString('pt-BR')} a{' '}
                        {evento.dataFim?.toDate().toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          evento.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {evento.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openTelao(evento.id)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Abrir Telão"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActive(evento.id, evento.ativo)}
                            className="text-blue-600 hover:text-blue-800"
                            title={evento.ativo ? "Desativar" : "Ativar"}
                          >
                            {evento.ativo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEdit(evento)}
                            className="text-green-600 hover:text-green-800"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteEvento(evento.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
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
