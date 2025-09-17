
import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Trash2, ArrowLeft, Car, Wrench, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Manutencao {
  descricao: string;
  custo: number;
  data: string;
  tempoInatividade?: number; // em dias
  responsavelConserto?: string;
  pecasTrocadas?: string[];
  notaFiscalUrl?: string;
  fotoUrl?: string;
  prioridadeUrgencia?: 'baixa' | 'media' | 'alta' | 'critica';
  dataInicio?: string;
  dataTermino?: string;
}

interface Veiculo {
  id: string;
  modelo: string;
  tipo: string;
  consumoMedio: number;
  status: 'funcionando' | 'quebrado';
  manutencoes: Manutencao[];
  dataCadastro: string;
}

const AdminGaragem = () => {
  const { userAuth, hasAccess, getLoginUrl, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Estados para formulário
  const [modelo, setModelo] = useState("");
  const [tipo, setTipo] = useState("");
  const [consumoMedio, setConsumoMedio] = useState(0);
  const [status, setStatus] = useState<'funcionando' | 'quebrado'>('funcionando');

  // Estados para manutenção
  const [descricaoManutencao, setDescricaoManutencao] = useState("");
  const [custoManutencao, setCustoManutencao] = useState(0);
  const [veiculoManutencao, setVeiculoManutencao] = useState<string | null>(null);
  const [tempoInatividade, setTempoInatividade] = useState(0);
  const [responsavelConserto, setResponsavelConserto] = useState("");
  const [pecasTrocadas, setPecasTrocadas] = useState("");
  const [prioridadeManutencao, setPrioridadeManutencao] = useState<'baixa' | 'media' | 'alta' | 'critica'>('media');
  const [dataInicioManutencao, setDataInicioManutencao] = useState('');
  const [dataTerminoManutencao, setDataTerminoManutencao] = useState('');

  // Estados da aplicação
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculoEmEdicao, setVeiculoEmEdicao] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'funcionando' | 'quebrado'>('todos');
  const [showManutencaoDialog, setShowManutencaoDialog] = useState(false);

  useEffect(() => {
    const fetchVeiculos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "veiculos"));
        const veiculosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Veiculo[];
        setVeiculos(veiculosData);
      } catch (error) {
        console.error("Erro ao buscar veículos:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os veículos.",
          variant: "destructive",
        });
      }
    };

    if (userAuth.isAuthenticated && hasAccess('admin')) {
      fetchVeiculos();
    }
  }, [userAuth.isAuthenticated, hasAccess]);

  // Verificações de autenticação
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userAuth.isAuthenticated) {
    setLocation(getLoginUrl('admin'));
    return null;
  }

  if (!hasAccess('admin')) {
    setLocation("/acesso-negado");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelo || !tipo || consumoMedio <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const veiculoData: Omit<Veiculo, 'id'> = {
        modelo,
        tipo,
        consumoMedio,
        status,
        manutencoes: [],
        dataCadastro: new Date().toISOString(),
      };

      if (veiculoEmEdicao) {
        await updateDoc(doc(db, "veiculos", veiculoEmEdicao.id), veiculoData);
        toast({
          title: "Sucesso",
          description: "Veículo atualizado com sucesso!",
        });
      } else {
        await addDoc(collection(db, "veiculos"), veiculoData);
        toast({
          title: "Sucesso",
          description: "Veículo adicionado com sucesso!",
        });
      }

      // Limpar formulário
      setModelo("");
      setTipo("");
      setConsumoMedio(0);
      setStatus('funcionando');
      setVeiculoEmEdicao(null);

      // Atualizar lista
      const querySnapshot = await getDocs(collection(db, "veiculos"));
      const veiculosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Veiculo[];
      setVeiculos(veiculosData);

    } catch (error) {
      console.error("Erro ao salvar veículo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o veículo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarVeiculo = (veiculo: Veiculo) => {
    setVeiculoEmEdicao(veiculo);
    setModelo(veiculo.modelo);
    setTipo(veiculo.tipo);
    setConsumoMedio(veiculo.consumoMedio);
    setStatus(veiculo.status);
  };

  const handleExcluirVeiculo = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
      try {
        await deleteDoc(doc(db, "veiculos", id));
        toast({
          title: "Sucesso",
          description: "Veículo excluído com sucesso!",
        });
        
        const querySnapshot = await getDocs(collection(db, "veiculos"));
        const veiculosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Veiculo[];
        setVeiculos(veiculosData);
      } catch (error) {
        console.error("Erro ao excluir veículo:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o veículo.",
          variant: "destructive",
        });
      }
    }
  };

  const toggleStatusVeiculo = async (veiculo: Veiculo) => {
    const novoStatus = veiculo.status === 'funcionando' ? 'quebrado' : 'funcionando';
    
    try {
      await updateDoc(doc(db, "veiculos", veiculo.id), {
        status: novoStatus,
      });

      toast({
        title: "Sucesso",
        description: `Status do veículo alterado para ${novoStatus}!`,
      });

      // Atualizar lista
      const querySnapshot = await getDocs(collection(db, "veiculos"));
      const veiculosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Veiculo[];
      setVeiculos(veiculosData);

    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do veículo.",
        variant: "destructive",
      });
    }
  };

  const adicionarManutencao = async () => {
    if (!veiculoManutencao || !descricaoManutencao || custoManutencao <= 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos da manutenção",
        variant: "destructive",
      });
      return;
    }

    try {
      const veiculo = veiculos.find(v => v.id === veiculoManutencao);
      if (!veiculo) return;

      const novaManutencao: Manutencao = {
        descricao: descricaoManutencao,
        custo: custoManutencao,
        data: new Date().toISOString(),
        tempoInatividade: tempoInatividade,
        responsavelConserto: responsavelConserto,
        pecasTrocadas: pecasTrocadas ? pecasTrocadas.split(',').map(p => p.trim()) : [],
        prioridadeUrgencia: prioridadeManutencao,
        dataInicio: dataInicioManutencao,
        dataTermino: dataTerminoManutencao,
      };

      const manutencaoesAtualizadas = [...(veiculo.manutencoes || []), novaManutencao];

      await updateDoc(doc(db, "veiculos", veiculoManutencao), {
        manutencoes: manutencaoesAtualizadas,
        status: 'quebrado', // Quando há manutenção, assume que está quebrado
      });

      toast({
        title: "Sucesso",
        description: "Manutenção adicionada com sucesso!",
      });

      // Limpar campos
      setDescricaoManutencao("");
      setCustoManutencao(0);
      setVeiculoManutencao(null);
      setTempoInatividade(0);
      setResponsavelConserto("");
      setPecasTrocadas("");
      setPrioridadeManutencao('media');
      setDataInicioManutencao('');
      setDataTerminoManutencao('');
      setShowManutencaoDialog(false);

      // Atualizar lista
      const querySnapshot = await getDocs(collection(db, "veiculos"));
      const veiculosData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Veiculo[];
      setVeiculos(veiculosData);

    } catch (error) {
      console.error("Erro ao adicionar manutenção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a manutenção.",
        variant: "destructive",
      });
    }
  };

  const veiculosFiltrados = veiculos.filter(veiculo => {
    if (filtroStatus === 'todos') return true;
    return veiculo.status === filtroStatus;
  });

  const calcularCustoTotalManutencoes = (manutencoes: Manutencao[]) => {
    return manutencoes.reduce((total, manutencao) => total + manutencao.custo, 0);
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setLocation("/admin")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Car className="h-8 w-8" />
            Gestão de Frota - Garagem
          </h1>
        </div>

        {/* Estatísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{veiculos.filter(v => v.status === 'funcionando').length}</div>
              <p className="text-sm text-gray-600">Funcionando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{veiculos.filter(v => v.status === 'quebrado').length}</div>
              <p className="text-sm text-gray-600">Quebrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{veiculos.length}</div>
              <p className="text-sm text-gray-600">Total de Veículos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-600">
                R$ {veiculos.reduce((total, veiculo) => 
                  total + calcularCustoTotalManutencoes(veiculo.manutencoes || []), 0
                ).toLocaleString()}
              </div>
              <p className="text-sm text-gray-600">Gasto em Manutenções</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Formulário de cadastro/edição */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {veiculoEmEdicao ? "Editar Veículo" : "Cadastrar Novo Veículo"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo do Veículo</Label>
                <Input
                  id="modelo"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Ex: Hilux 4x4, Trator John Deere"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Veículo</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="caminhonete">Caminhonete</SelectItem>
                    <SelectItem value="carro">Carro</SelectItem>
                    <SelectItem value="trator">Trator</SelectItem>
                    <SelectItem value="caminhao">Caminhão</SelectItem>
                    <SelectItem value="motocicleta">Motocicleta</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consumoMedio">Consumo Médio</Label>
                <Input
                  id="consumoMedio"
                  type="number"
                  step="0.1"
                  value={consumoMedio}
                  onChange={(e) => setConsumoMedio(Number(e.target.value))}
                  placeholder="km/L ou L/hora"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: 'funcionando' | 'quebrado') => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funcionando">Funcionando</SelectItem>
                    <SelectItem value="quebrado">Quebrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {veiculoEmEdicao ? "Atualizar" : "Cadastrar"}
                  </span>
                )}
              </Button>
              
              {veiculoEmEdicao && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setVeiculoEmEdicao(null);
                    setModelo("");
                    setTipo("");
                    setConsumoMedio(0);
                    setStatus('funcionando');
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de veículos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Frota Cadastrada</CardTitle>
            <div className="flex gap-2">
              <Select value={filtroStatus} onValueChange={(value: 'todos' | 'funcionando' | 'quebrado') => setFiltroStatus(value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="funcionando">Funcionando</SelectItem>
                  <SelectItem value="quebrado">Quebrado</SelectItem>
                </SelectContent>
              </Select>

              <Dialog open={showManutencaoDialog} onOpenChange={setShowManutencaoDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Wrench className="h-4 w-4 mr-2" />
                    Add Manutenção
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Manutenção</DialogTitle>
                    <DialogDescription>
                      Registre uma nova manutenção para o veículo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Veículo</Label>
                        <Select value={veiculoManutencao || ""} onValueChange={setVeiculoManutencao}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o veículo" />
                          </SelectTrigger>
                          <SelectContent>
                            {veiculos.map(veiculo => (
                              <SelectItem key={veiculo.id} value={veiculo.id}>
                                {veiculo.modelo} - {veiculo.tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Prioridade</Label>
                        <Select value={prioridadeManutencao} onValueChange={setPrioridadeManutencao}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="baixa">🟢 Baixa - Preventiva</SelectItem>
                            <SelectItem value="media">🟡 Média - Necessária</SelectItem>
                            <SelectItem value="alta">🟠 Alta - Urgente</SelectItem>
                            <SelectItem value="critica">🔴 Crítica - Emergencial</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Descrição do Problema</Label>
                      <Textarea
                        value={descricaoManutencao}
                        onChange={(e) => setDescricaoManutencao(e.target.value)}
                        placeholder="Ex: Troca de embreagem, reparo no motor, revisão preventiva..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Custo (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={custoManutencao}
                          onChange={(e) => setCustoManutencao(Number(e.target.value))}
                          placeholder="0.00"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tempo Inatividade (dias)</Label>
                        <Input
                          type="number"
                          value={tempoInatividade}
                          onChange={(e) => setTempoInatividade(Number(e.target.value))}
                          placeholder="Ex: 3"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Responsável pelo Conserto</Label>
                        <Input
                          value={responsavelConserto}
                          onChange={(e) => setResponsavelConserto(e.target.value)}
                          placeholder="Ex: Oficina Silva"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input
                          type="date"
                          value={dataInicioManutencao}
                          onChange={(e) => setDataInicioManutencao(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Data de Término</Label>
                        <Input
                          type="date"
                          value={dataTerminoManutencao}
                          onChange={(e) => setDataTerminoManutencao(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Peças Trocadas</Label>
                      <Input
                        value={pecasTrocadas}
                        onChange={(e) => setPecasTrocadas(e.target.value)}
                        placeholder="Ex: Filtro de óleo, pastilhas de freio, correia..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowManutencaoDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={adicionarManutencao}>
                      Adicionar Manutenção
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border text-left">Modelo</th>
                  <th className="p-3 border text-left">Tipo</th>
                  <th className="p-3 border text-center">Consumo</th>
                  <th className="p-3 border text-center">Status</th>
                  <th className="p-3 border text-center">Manutenções</th>
                  <th className="p-3 border text-center">Custo Total</th>
                  <th className="p-3 border text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {veiculosFiltrados.map((veiculo) => (
                  <tr key={veiculo.id} className="hover:bg-gray-50">
                    <td className="p-3 border font-semibold">{veiculo.modelo}</td>
                    <td className="p-3 border">{veiculo.tipo}</td>
                    <td className="p-3 border text-center">{veiculo.consumoMedio} km/L</td>
                    <td className="p-3 border text-center">
                      <Badge 
                        variant={veiculo.status === 'funcionando' ? 'default' : 'destructive'}
                        className={veiculo.status === 'funcionando' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {veiculo.status === 'funcionando' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {veiculo.status}
                      </Badge>
                    </td>
                    <td className="p-3 border text-center">
                      {veiculo.manutencoes?.length || 0}
                    </td>
                    <td className="p-3 border text-center">
                      R$ {calcularCustoTotalManutencoes(veiculo.manutencoes || []).toLocaleString()}
                    </td>
                    <td className="p-3 border">
                      <div className="flex gap-1 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleStatusVeiculo(veiculo)}
                          className="px-2"
                        >
                          {veiculo.status === 'funcionando' ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditarVeiculo(veiculo)}
                          className="px-2"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleExcluirVeiculo(veiculo.id)}
                          className="px-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {veiculosFiltrados.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {filtroStatus === 'todos' 
                  ? "Nenhum veículo cadastrado ainda." 
                  : `Nenhum veículo ${filtroStatus} encontrado.`
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGaragem;
