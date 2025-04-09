
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/utils/firebase";
import { collection, getDocs, orderBy, query, where, doc, updateDoc } from 'firebase/firestore';

interface Solicitacao {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  descricao: string;
  servico: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  timestamp: { seconds: number, nanoseconds: number };
  setor: string;
  origem: 'chatbot' | 'formulario_web';
}

const statusColors: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-800",
  em_andamento: "bg-blue-100 text-blue-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-red-100 text-red-800"
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
  cancelado: "Cancelado"
};

const ChatbotSolicitacoes: React.FC = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todas");

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      setLoading(true);
      try {
        // Obter solicitações dos três setores
        const colecoes = ['solicitacoes_agricultura', 'solicitacoes_pesca', 'solicitacoes_paa'];
        let todasSolicitacoes: Solicitacao[] = [];

        for (const colecao of colecoes) {
          const setor = colecao.split('_')[1];
          const q = query(
            collection(db, colecao),
            orderBy('timestamp', 'desc')
          );
          
          const querySnapshot = await getDocs(q);
          const solicitacoesSetor = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            setor
          })) as Solicitacao[];
          
          todasSolicitacoes = [...todasSolicitacoes, ...solicitacoesSetor];
        }

        // Ordenar por data mais recente
        todasSolicitacoes.sort((a, b) => {
          return b.timestamp.seconds - a.timestamp.seconds;
        });

        setSolicitacoes(todasSolicitacoes);
      } catch (error) {
        console.error("Erro ao buscar solicitações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSolicitacoes();
  }, []);

  const atualizarStatus = async (id: string, novoStatus: string, setor: string) => {
    try {
      const colecao = `solicitacoes_${setor}`;
      const docRef = doc(db, colecao, id);
      await updateDoc(docRef, {
        status: novoStatus
      });

      // Atualizar estado local
      setSolicitacoes(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, status: novoStatus as 'pendente' | 'em_andamento' | 'concluido' | 'cancelado' } 
            : item
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
    }
  };

  const solicitacoesFiltradas = activeTab === "todas" 
    ? solicitacoes 
    : solicitacoes.filter(s => s.setor === activeTab);

  const formatarData = (seconds: number) => {
    const data = new Date(seconds * 1000);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Serviços</CardTitle>
        <CardDescription>
          Gerencie todas as solicitações recebidas pelo chatbot e formulários
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todas" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
            <TabsTrigger value="pesca">Pesca</TabsTrigger>
            <TabsTrigger value="paa">PAA</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <p>Carregando solicitações...</p>
              </div>
            ) : solicitacoesFiltradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Origem</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoesFiltradas.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-nowrap">
                          {formatarData(item.timestamp.seconds)}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.nome}</div>
                          <div className="text-sm text-gray-500">{item.telefone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={item.servico}>
                            {item.servico}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              item.setor === 'agricultura'
                                ? 'bg-green-50 text-green-800 border-green-200'
                                : item.setor === 'pesca'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }
                          >
                            {item.setor.charAt(0).toUpperCase() + item.setor.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[item.status]}>
                            {statusLabels[item.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {item.origem === 'chatbot' ? 'Chatbot' : 'Formulário'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {item.status === 'pendente' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7" 
                                onClick={() => atualizarStatus(item.id, 'em_andamento', item.setor)}
                              >
                                Iniciar
                              </Button>
                            )}
                            {item.status === 'em_andamento' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs bg-green-50 text-green-800 h-7" 
                                onClick={() => atualizarStatus(item.id, 'concluido', item.setor)}
                              >
                                Concluir
                              </Button>
                            )}
                            {(item.status === 'pendente' || item.status === 'em_andamento') && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs bg-red-50 text-red-800 h-7" 
                                onClick={() => atualizarStatus(item.id, 'cancelado', item.setor)}
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatbotSolicitacoes;
