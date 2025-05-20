
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { collection, query, orderBy, getDocs, doc, updateDoc, where, limit, startAfter, Timestamp } from 'firebase/firestore';
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart } from "lucide-react";
import jsPDF from 'jspdf';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Configuração dinâmica de coleções
const colecoesConfig = [
  { nome: 'solicitacoes_agricultura', tipo: 'agricultura', label: 'Agricultura' },
  { nome: 'solicitacoes_pesca', tipo: 'pesca', label: 'Pesca' },
  { nome: 'solicitacoes_agricultura_completo', tipo: 'agricultura', label: 'Agricultura (Completo)' },
  // Adicione novas coleções aqui conforme necessário
];

// Status de solicitações suportados
const statusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'em_analise', label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
  { value: 'aprovado', label: 'Aprovado', color: 'bg-green-100 text-green-800' },
  { value: 'concluido', label: 'Concluído', color: 'bg-green-100 text-green-800' },
  { value: 'cancelado', label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  { value: 'rejeitado', label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
];

interface DadosPessoais {
  nomeCompleto: string;
  cpf: string;
  identidade: string;
  emissor: string;
  sexo: string;
  dataNascimento: string;
  naturalidade: string;
  nomeMae: string;
  escolaridade: string;
  telefone: string;
  instituicaoAssociada?: string;
  endereco?: string;
  email?: string;
  celular?: string;
  travessao?: string;
}

interface DadosPropriedade {
  nome: string;
  tipoPessoa: 'fisica' | 'juridica';
  endereco: string;
  tamanhoHa: number;
  escriturada: boolean;
  dapCaf: boolean;
  car: boolean;
  financiamentoRural: boolean;
  coordenadas: {
    latitude: string;
    longitude: string;
  };
}

interface DadosAgropecuarios {
  cacau?: {
    cultiva: boolean;
    quantidadePes?: number;
    safreiro?: boolean;
    idade?: number;
    sementesCeplac?: boolean;
    producaoAnual?: number;
    clonado?: {
      possui: boolean;
      quantidadePes?: number;
      safreiro?: boolean;
      idade?: number;
      producaoAnual?: number;
      materialClonal?: string[];
    };
  };
  frutiferas?: {
    cultiva: boolean;
    tipos?: string[];
    destino?: string[];
    producaoKg?: number;
    precoMedioKg?: number;
  };
  lavouras?: {
    milho?: {
      produz: boolean;
      finalidade?: string[];
      destino?: string[];
      producaoKg?: number;
      areaPlantada?: number;
    };
    mandioca?: {
      produz: boolean;
      tipo?: string;
      finalidade?: string[];
      subprodutos?: string[];
      areaCultivada?: number;
      mecanizada?: boolean;
    };
  };
  pecuaria?: {
    bovino?: {
      possui: boolean;
      quantidade?: number;
      leite?: boolean;
      fase?: string;
      sistemaManejo?: string;
      acessoMercado?: string;
    };
  };
}

interface Obra {
  tipo: string;
  area: number;
  unidade: string;
  situacao: string;
}

interface EspecieConfinada {
  nome: string;
  quantidade: number;
}

interface DadosDetalhamento {
  distanciaSede: number;
  referenciaLocalizacao: string;
  situacaoLegal: string;
  outraSituacao?: string;
  areaTotal: number;
  recursosHidricos: {
    tipo: string;
    nome: string;
  }[];
  usosAgua: string[];
}

interface DadosRecursos {
  numeroEmpregados: number;
  trabalhoFamiliar: number;
  recursosFinanceiros: string;
  fonteFinanciamento?: string;
  assistenciaTecnica: string;
}

interface DadosEmpreendimento {
  atividade: string;
  endereco: string;
  estruturaAquicola: string[];
}

interface Solicitacao {
  id: string;
  tipo: 'agricultura' | 'pesca' | 'paa';
  status: string;
  dataCriacao: string;
  dadosPessoais: DadosPessoais;
  dadosPropriedade?: DadosPropriedade;
  dadosEmpreendimento?: DadosEmpreendimento;
  dadosAgropecuarios?: DadosAgropecuarios;
  obras?: Obra[];
  especiesConfinadas?: EspecieConfinada[];
  detalhamento?: DadosDetalhamento;
  recursos?: DadosRecursos;
  observacoes?: string;
  nome?: string;
  cpf?: string;
  identidade?: string;
  emissor?: string;
  enderecoPropriedade?: string;
  tamanhoPropriedade?: string;
  distanciaMunicipio?: string;
  situacaoLegal?: string;
  outraSituacaoLegal?: string;
  culturas?: any;
  maquinario?: any;
  maodeobra?: any;
  tipoServico?: string;
  periodoDesejado?: string;
  urgencia?: string;
  detalhes?: string;
  // Campos para controle de processo
  dataUltimaAtualizacao?: string;
  responsavel?: string;
  historicoAtualizacoes?: {
    data: string;
    status: string;
    responsavel: string;
    observacao?: string;
  }[];
}

interface MetricasGerais {
  total: number;
  porTipo: { [key: string]: number };
  porStatus: { [key: string]: number };
  porMes: { [key: string]: number };
}

export const CadastrosSolicitacoesManager = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showStatistics, setShowStatistics] = useState(false);
  const [metricas, setMetricas] = useState<MetricasGerais>({
    total: 0,
    porTipo: {},
    porStatus: {},
    porMes: {}
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [statusAtualizar, setStatusAtualizar] = useState<string>('');
  const [observacaoAtualizar, setObservacaoAtualizar] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 10;

  // Função para buscar solicitações com paginação
  const fetchSolicitacoes = async (novaConsulta = true) => {
    if (novaConsulta) setLoading(true);
    try {
      let todasSolicitacoes: Solicitacao[] = [];
      
      for (const colecao of colecoesConfig) {
        console.log(`Buscando solicitações da coleção: ${colecao.nome}`);
        let q;
        
        if (novaConsulta) {
          // Nova consulta - reinicia paginação
          q = query(
            collection(db, colecao.nome),
            orderBy('dataCriacao', 'desc'),
            limit(ITEMS_PER_PAGE)
          );
        } else if (lastVisible) {
          // Paginação - continua de onde parou
          q = query(
            collection(db, colecao.nome),
            orderBy('dataCriacao', 'desc'),
            startAfter(lastVisible),
            limit(ITEMS_PER_PAGE)
          );
        } else {
          continue; // Sem lastVisible para paginação, pula esta coleção
        }

        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          if (!novaConsulta) {
            setHasMore(false);
          }
          continue;
        }
        
        // Armazena o último documento para paginação
        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
        if (novaConsulta) {
          setLastVisible(lastDoc);
        } else {
          setLastVisible(lastDoc);
        }
        
        const solicitacoesSetor = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            tipo: colecao.tipo,
            ...data
          } as Solicitacao;
        });

        todasSolicitacoes = [...todasSolicitacoes, ...solicitacoesSetor];
      }
      
      if (novaConsulta) {
        // Se for uma nova consulta, substitui as solicitações existentes
        setSolicitacoes(todasSolicitacoes);
        calcularMetricas(todasSolicitacoes);
      } else {
        // Se for paginação, adiciona às solicitações existentes
        setSolicitacoes(prev => [...prev, ...todasSolicitacoes]);
        calcularMetricas([...solicitacoes, ...todasSolicitacoes]);
      }
      
      console.log('Total de solicitações encontradas:', todasSolicitacoes.length);
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função de pesquisa
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      // Se o termo de pesquisa estiver vazio, busca todas as solicitações
      fetchSolicitacoes();
      return;
    }
    
    setLoading(true);
    try {
      let resultados: Solicitacao[] = [];
      
      for (const colecao of colecoesConfig) {
        // Busca por CPF (correspondência exata)
        const cpfQuery = query(
          collection(db, colecao.nome),
          where('dadosPessoais.cpf', '==', searchTerm.trim())
        );
        
        // Busca por nome (usando caracteres curinga seria ideal, mas o Firestore não suporta
        // então teremos que buscar tudo e filtrar no client-side)
        const nameQuery = query(
          collection(db, colecao.nome),
          limit(100) // Limite para não buscar tudo
        );
        
        const [cpfSnapshot, nameSnapshot] = await Promise.all([
          getDocs(cpfQuery),
          getDocs(nameQuery)
        ]);
        
        // Resultados da busca por CPF
        const cpfResults = cpfSnapshot.docs.map(doc => ({
          id: doc.id,
          tipo: colecao.tipo,
          ...doc.data()
        } as Solicitacao));
        
        // Filtra resultados por nome
        const nameResults = nameSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            const nome = data.dadosPessoais?.nomeCompleto || data.nome || '';
            return nome.toLowerCase().includes(searchTerm.toLowerCase());
          })
          .map(doc => ({
            id: doc.id,
            tipo: colecao.tipo,
            ...doc.data()
          } as Solicitacao));
        
        // Combina resultados evitando duplicatas
        const allResults = [...cpfResults];
        nameResults.forEach(result => {
          if (!allResults.some(r => r.id === result.id)) {
            allResults.push(result);
          }
        });
        
        resultados = [...resultados, ...allResults];
      }
      
      setSolicitacoes(resultados);
      calcularMetricas(resultados);
      setHasMore(false); // Desativa paginação em resultados de busca
      
    } catch (error) {
      console.error("Erro na pesquisa:", error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar a pesquisa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Cálculo de métricas para o dashboard
  const calcularMetricas = (solicitacoes: Solicitacao[]) => {
    const metricas: MetricasGerais = {
      total: solicitacoes.length,
      porTipo: {},
      porStatus: {},
      porMes: {}
    };
    
    solicitacoes.forEach(s => {
      // Contagem por tipo
      metricas.porTipo[s.tipo] = (metricas.porTipo[s.tipo] || 0) + 1;
      
      // Contagem por status
      const status = s.status || 'pendente';
      metricas.porStatus[status] = (metricas.porStatus[status] || 0) + 1;
      
      // Contagem por mês
      if (s.dataCriacao) {
        const data = new Date(s.dataCriacao);
        const mesAno = `${data.getMonth() + 1}/${data.getFullYear()}`;
        metricas.porMes[mesAno] = (metricas.porMes[mesAno] || 0) + 1;
      }
    });
    
    setMetricas(metricas);
  };

  // Manipulação de seleção para ações em lote
  const toggleSelecionarItem = (id: string) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const toggleSelecionarTodos = () => {
    if (selectedItems.length === solicitacoesFiltradas.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(solicitacoesFiltradas.map(s => s.id));
    }
  };

  // Atualização de status
  const atualizarStatus = async (id: string, novoStatus: string, observacao: string = '') => {
    setIsUpdatingStatus(true);
    try {
      // Determinar a coleção correta
      const solicitacao = solicitacoes.find(s => s.id === id);
      if (!solicitacao) {
        throw new Error("Solicitação não encontrada");
      }
      
      // Encontrar a coleção correspondente
      const colecao = colecoesConfig.find(c => c.tipo === solicitacao.tipo)?.nome;
      if (!colecao) {
        throw new Error("Coleção não encontrada");
      }
      
      const now = new Date().toISOString();
      const historicoItem = {
        data: now,
        status: novoStatus,
        responsavel: "Admin", // Idealmente, isso seria o usuário atual
        observacao: observacao || undefined
      };
      
      // Atualizar o documento
      const docRef = doc(db, colecao, id);
      await updateDoc(docRef, {
        status: novoStatus,
        dataUltimaAtualizacao: now,
        historicoAtualizacoes: Timestamp.fromDate(new Date()) // Adicionar ao array existente
      });
      
      // Atualizar a lista local
      setSolicitacoes(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            status: novoStatus,
            dataUltimaAtualizacao: now,
            historicoAtualizacoes: s.historicoAtualizacoes ? 
              [...s.historicoAtualizacoes, historicoItem] : 
              [historicoItem]
          };
        }
        return s;
      }));
      
      toast({
        title: "Status atualizado",
        description: `Status alterado para ${novoStatus}`,
      });
      
      // Recalcular métricas
      calcularMetricas(solicitacoes);
      
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
      setStatusAtualizar('');
      setObservacaoAtualizar('');
    }
  };

  // Geração de PDFs em lote
  const gerarPDFsEmLote = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Nenhum item selecionado",
        description: "Selecione pelo menos uma solicitação para gerar relatórios.",
        variant: "destructive",
      });
      return;
    }
    
    selectedItems.forEach(id => {
      const solicitacao = solicitacoes.find(s => s.id === id);
      if (solicitacao) {
        generatePDF(solicitacao);
      }
    });
    
    toast({
      title: "PDFs gerados",
      description: `${selectedItems.length} relatórios foram gerados com sucesso.`,
    });
  };

  // Efeito para buscar solicitações na inicialização
  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  const formatarData = (data: string) => {
    if (!data) return 'Data não informada';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch (e) {
      return 'Data inválida';
    }
  };

  // Filtro de solicitações com base na aba ativa e termo de pesquisa
  const solicitacoesFiltradas = activeTab === 'todas' 
    ? solicitacoes 
    : solicitacoes.filter(s => s.tipo === activeTab);

  // Geração de PDF para uma solicitação individual
  const generatePDF = (solicitacao: Solicitacao) => {
    if (solicitacao.tipo === 'agricultura') {
      return generateAgriculturaReport(solicitacao);
    }
    const doc = new jsPDF();
    let yPos = 20;
    const lineHeight = 7;

    // Título
    doc.setFontSize(16);
    doc.text('Relatório de Solicitação - Pesca', 20, yPos);
    yPos += lineHeight * 2;

    // Função auxiliar para adicionar seções
    const addSection = (title: string, content: string) => {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      doc.text(content, 20, yPos);
      yPos += lineHeight;
    };

    // 1. Identificação do Empreendedor
    addSection('1. Identificação do Empreendedor', '');
    addSection('Nome:', solicitacao.dadosPessoais?.nomeCompleto || solicitacao.nome || 'Não informado');
    addSection('CPF:', solicitacao.dadosPessoais?.cpf || solicitacao.cpf || 'Não informado');

    const identidade = solicitacao.dadosPessoais?.identidade || '';
    const emissor = solicitacao.dadosPessoais?.emissor || '';
    addSection('RG:', identidade ? (emissor ? `${identidade} - ${emissor}` : identidade) : 'Não informado');
    addSection('Data Nascimento:', solicitacao.dadosPessoais?.dataNascimento || 'Não informado');
    addSection('Naturalidade:', solicitacao.dadosPessoais?.naturalidade || 'Não informado');
    addSection('Nome da Mãe:', solicitacao.dadosPessoais?.nomeMae || 'Não informado');
    addSection('Escolaridade:', solicitacao.dadosPessoais?.escolaridade || 'Não informado');
    addSection('Contato:', solicitacao.dadosPessoais?.telefone || 'Não informado');

    // 2. Identificação da Atividade
    yPos += lineHeight;
    addSection('2. Identificação da Atividade/Empreendimento', '');
    if (solicitacao.dadosEmpreendimento) {
        addSection('Atividade:', solicitacao.dadosEmpreendimento.atividade);
        addSection('Endereço:', solicitacao.dadosEmpreendimento.endereco);
        addSection('Estruturas Aquícolas:', solicitacao.dadosEmpreendimento.estruturaAquicola.join(', '));
    }

    // 3. Classificação
    yPos += lineHeight;
    addSection('3. Classificação', '');

    // 3.1 Obras
    if (solicitacao.obras) {
      doc.text('3.1 Obras:', 20, yPos);
      yPos += lineHeight;
      solicitacao.obras.forEach(obra => {
        doc.text(`- ${obra.tipo}: ${obra.area}${obra.unidade} - ${obra.situacao}`, 25, yPos);
        yPos += lineHeight;
      });
    }


    // 3.2 Espécies
    if (solicitacao.especiesConfinadas) {
        yPos += lineHeight;
        doc.text('3.2 Espécies Confinadas:', 20, yPos);
        yPos += lineHeight;
        solicitacao.especiesConfinadas.forEach(especie => {
          doc.text(`- ${especie.nome}: ${especie.quantidade} unidades`, 25, yPos);
          yPos += lineHeight;
        });
    }

    // 4. Detalhamento
    if (solicitacao.detalhamento) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      addSection('4. Detalhamento', '');
      addSection('Distância da Sede:', `${solicitacao.detalhamento.distanciaSede} km`);
      addSection('Situação Legal:', solicitacao.detalhamento.situacaoLegal);
      addSection('Área Total:', `${solicitacao.detalhamento.areaTotal} ha`);

      // Recursos Hídricos
      doc.text('Recursos Hídricos:', 20, yPos);
      yPos += lineHeight;
      solicitacao.detalhamento.recursosHidricos.forEach(recurso => {
        doc.text(`- ${recurso.tipo}: ${recurso.nome}`, 25, yPos);
        yPos += lineHeight;
      });

      // Usos da Água
      doc.text('Usos da Água:', 20, yPos);
      yPos += lineHeight;
      solicitacao.detalhamento.usosAgua.forEach(uso => {
        doc.text(`- ${uso}`, 25, yPos);
        yPos += lineHeight;
      });
    }

    // 5. Recursos
    if (solicitacao.recursos) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      addSection('5. Recursos', '');
      addSection('Número de Empregados:', solicitacao.recursos.numeroEmpregados.toString());
      addSection('Trabalho Familiar:', solicitacao.recursos.trabalhoFamiliar.toString());
      addSection('Recursos Financeiros:', solicitacao.recursos.recursosFinanceiros);
      if (solicitacao.recursos.fonteFinanciamento) {
        addSection('Fonte do Financiamento:', solicitacao.recursos.fonteFinanciamento);
      }
      addSection('Assistência Técnica:', solicitacao.recursos.assistenciaTecnica);
    }

    // 6. Observações
    if (solicitacao.observacoes) {
      yPos += lineHeight;
      addSection('6. Observações', solicitacao.observacoes);
    }

    // Rodapé
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`solicitacao-pesca-${solicitacao.id}.pdf`);
  };

  // Renderização do componente de dashboard de métricas
  const renderDashboard = () => {
    if (!showStatistics) return null;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B'];
    
    // Dados para gráfico de pizza de status
    const statusData = Object.entries(metricas.porStatus).map(([status, quantidade]) => ({
      name: statusOptions.find(s => s.value === status)?.label || status,
      value: quantidade
    }));
    
    // Dados para gráfico de barras por tipo
    const tipoData = Object.entries(metricas.porTipo).map(([tipo, quantidade]) => ({
      name: colecoesConfig.find(c => c.tipo === tipo)?.label || tipo,
      quantidade
    }));
    
    // Dados para gráfico de linhas por mês
    const mesData = Object.entries(metricas.porMes)
      .sort((a, b) => {
        const [mesA, anoA] = a[0].split('/').map(Number);
        const [mesB, anoB] = b[0].split('/').map(Number);
        if (anoA !== anoB) return anoA - anoB;
        return mesA - mesB;
      })
      .map(([mesAno, quantidade]) => ({
        name: mesAno,
        quantidade
      }));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4">Distribuição por Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-bold mb-4">Solicitações por Tipo</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsBarChart
              data={tipoData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#0088FE" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Card>
        
        <Card className="p-4 md:col-span-2">
          <h3 className="text-lg font-bold mb-4">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RechartsBarChart data={mesData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantidade" fill="#82ca9d" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    );
  };

  // Diálogo para atualização de status
  const renderDialogoAtualizarStatus = () => {
    return (
      <Dialog open={!!statusAtualizar} onOpenChange={() => setStatusAtualizar('')}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Atualizar Status da Solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Novo Status</label>
              <Select 
                value={statusAtualizar} 
                onValueChange={setStatusAtualizar}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Observação (opcional)</label>
              <Textarea
                value={observacaoAtualizar}
                onChange={(e) => setObservacaoAtualizar(e.target.value)}
                placeholder="Adicione uma observação sobre esta atualização..."
                disabled={isUpdatingStatus}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setStatusAtualizar('')}
              disabled={isUpdatingStatus}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedSolicitacao) {
                  atualizarStatus(selectedSolicitacao.id, statusAtualizar, observacaoAtualizar);
                }
              }}
              disabled={!statusAtualizar || isUpdatingStatus}
            >
              {isUpdatingStatus ? "Atualizando..." : "Confirmar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Cadastros e Solicitações</h2>
        <Button
          variant="outline"
          onClick={() => setShowStatistics(!showStatistics)}
          className="flex items-center gap-2"
        >
          <BarChart className="h-4 w-4" />
          {showStatistics ? "Ocultar Estatísticas" : "Mostrar Estatísticas"}
        </Button>
      </div>

      {/* Dashboard de métricas */}
      {renderDashboard()}

      {/* Barra de ferramentas: pesquisa e ações em lote */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex gap-2 flex-1">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={handleSearch} disabled={loading}>
            Buscar
          </Button>
          {searchTerm && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                fetchSolicitacoes();
              }}
            >
              Limpar
            </Button>
          )}
        </div>
        
        {selectedItems.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">
              {selectedItems.length} {selectedItems.length === 1 ? 'item selecionado' : 'itens selecionados'}
            </span>
            <Button 
              variant="outline" 
              onClick={gerarPDFsEmLote}
              className="whitespace-nowrap"
            >
              Gerar PDFs em Lote
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          {/* Adicione novas abas aqui conforme necessário */}
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-4">Nenhuma solicitação encontrada</div>
          ) : (
            <div className="space-y-4">
              {/* Cabeçalho da tabela com checkbox para selecionar todos */}
              <div className="flex items-center p-2 bg-gray-50 rounded-md">
                <div className="w-12 flex justify-center">
                  <Checkbox 
                    checked={selectedItems.length === solicitacoesFiltradas.length && solicitacoesFiltradas.length > 0}
                    onCheckedChange={toggleSelecionarTodos}
                  />
                </div>
                <div className="flex-1 font-medium">Solicitante</div>
                <div className="w-32 text-center">Status</div>
                <div className="w-32 text-center">Data</div>
                <div className="w-32 text-center">Tipo</div>
                <div className="w-48 text-center">Ações</div>
              </div>
              
              {/* Lista de solicitações */}
              <div className="grid gap-2">
                {solicitacoesFiltradas.map((solicitacao) => (
                  <Card key={solicitacao.id} className="p-3">
                    <div className="flex items-center">
                      <div className="w-12 flex justify-center">
                        <Checkbox 
                          checked={selectedItems.includes(solicitacao.id)}
                          onCheckedChange={() => toggleSelecionarItem(solicitacao.id)}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {solicitacao.dadosPessoais?.nomeCompleto || 'Nome não informado'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          CPF: {solicitacao.dadosPessoais?.cpf || 'Não informado'}
                        </p>
                      </div>
                      <div className="w-32 text-center">
                        <Badge variant="outline" className={`${
                          statusOptions.find(s => s.value === solicitacao.status)?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                          {statusOptions.find(s => s.value === solicitacao.status)?.label || solicitacao.status || 'Pendente'}
                        </Badge>
                      </div>
                      <div className="w-32 text-center text-sm">
                        {solicitacao.dataCriacao ? formatarData(solicitacao.dataCriacao) : 'Não informada'}
                      </div>
                      <div className="w-32 text-center">
                        <Badge variant="outline">
                          {solicitacao.tipo === 'agricultura' ? 'Agricultura' : 'Pesca'}
                        </Badge>
                      </div>
                      <div className="w-48 flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSolicitacao(solicitacao);
                            setStatusAtualizar('');
                          }}
                        >
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSolicitacao(solicitacao);
                            setStatusAtualizar(solicitacao.status || 'pendente');
                          }}
                        >
                          Status
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generatePDF(solicitacao)}
                        >
                          PDF
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {/* Botão para carregar mais */}
              {hasMore && !searchTerm && (
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => fetchSolicitacoes(false)}
                    disabled={loading}
                  >
                    {loading ? "Carregando..." : "Carregar Mais"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes da solicitação */}
      <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>Detalhes da Solicitação</span>
              <Badge variant="outline" className={`${
                selectedSolicitacao?.status ? 
                (statusOptions.find(s => s.value === selectedSolicitacao.status)?.color || 'bg-gray-100') : 
                'bg-yellow-100 text-yellow-800'
              }`}>
                {selectedSolicitacao?.status ? 
                  (statusOptions.find(s => s.value === selectedSolicitacao.status)?.label || selectedSolicitacao.status) : 
                  'Pendente'
                }
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {selectedSolicitacao && (
            <div className="space-y-6">
              {/* Barra de ações rápidas */}
              <div className="flex justify-end gap-2 border-b pb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStatusAtualizar(selectedSolicitacao.status || 'pendente')}
                >
                  Atualizar Status
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generatePDF(selectedSolicitacao)}
                >
                  Gerar PDF
                </Button>
              </div>

              {/* 1. Identificação do Empreendedor */}
              <section>
                <h3 className="text-lg font-bold mb-2">1. Identificação do Empreendedor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Nome:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.nomeCompleto || selectedSolicitacao.nome || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">CPF:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">RG:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.identidade || 'Não informado'} - {selectedSolicitacao.dadosPessoais?.emissor || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Sexo:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.sexo || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Endereço:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.endereco || 'Não informado'}</p>
                  </div>
                  { selectedSolicitacao.dadosPessoais?.travessao && (
                    <div>
                      <p className="font-semibold">Travessão:</p>
                      <p>{selectedSolicitacao.dadosPessoais.travessao}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Telefone:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.telefone || 'Não informado'}</p>
                  </div>
                  { selectedSolicitacao.dadosPessoais?.celular && (
                    <div>
                      <p className="font-semibold">Celular:</p>
                      <p>{selectedSolicitacao.dadosPessoais.celular}</p>
                    </div>
                  )}
                  { selectedSolicitacao.dadosPessoais?.email && (
                    <div>
                      <p className="font-semibold">E-mail:</p>
                      <p>{selectedSolicitacao.dadosPessoais.email}</p>
                    </div>
                  )}
                  { selectedSolicitacao.dadosPessoais?.dataNascimento && (
                    <div>
                      <p className="font-semibold">Data de Nascimento:</p>
                      <p>{selectedSolicitacao.dadosPessoais.dataNascimento}</p>
                    </div>
                  )}
                  { selectedSolicitacao.dadosPessoais?.naturalidade && (
                    <div>
                      <p className="font-semibold">Naturalidade:</p>
                      <p>{selectedSolicitacao.dadosPessoais.naturalidade}</p>
                    </div>
                  )}
                  { selectedSolicitacao.dadosPessoais?.nomeMae && (
                    <div>
                      <p className="font-semibold">Nome da Mãe:</p>
                      <p>{selectedSolicitacao.dadosPessoais.nomeMae}</p>
                    </div>
                  )}
                  { selectedSolicitacao.dadosPessoais?.escolaridade && (
                    <div>
                      <p className="font-semibold">Escolaridade:</p>
                      <p>{selectedSolicitacao.dadosPessoais.escolaridade}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* 2. Identificação da Atividade para pesca */}
              {selectedSolicitacao.tipo === 'pesca' && selectedSolicitacao.dadosEmpreendimento && (
                <section>
                  <h3 className="text-lg font-bold mb-2">2. Identificação da Atividade</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Atividade:</p>
                      <p>{selectedSolicitacao.dadosEmpreendimento.atividade || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Endereço:</p>
                      <p>{selectedSolicitacao.dadosEmpreendimento.endereco || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Estruturas Aquícolas:</p>
                      <p>{selectedSolicitacao.dadosEmpreendimento.estruturaAquicola?.join(', ') || 'Não informado'}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* 2. Dados da Propriedade para agricultura */}
              {selectedSolicitacao.tipo === 'agricultura' && (
                <section>
                  <h3 className="text-lg font-bold mb-2">2. Dados da Propriedade</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSolicitacao.dadosPropriedade && (
                      <>
                        <div>
                          <p className="font-semibold">Nome da Propriedade:</p>
                          <p>{selectedSolicitacao.dadosPropriedade.nome || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Tipo:</p>
                          <p>{selectedSolicitacao.dadosPropriedade.tipoPessoa || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Endereço:</p>
                          <p>{selectedSolicitacao.dadosPropriedade.endereco || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Tamanho:</p>
                          <p>{selectedSolicitacao.dadosPropriedade.tamanhoHa || '0'} ha</p>
                        </div>
                        <div>
                          <p className="font-semibold">Coordenadas:</p>
                          <p>
                            {selectedSolicitacao.dadosPropriedade.coordenadas ? 
                              `Lat: ${selectedSolicitacao.dadosPropriedade.coordenadas.latitude}, Long: ${selectedSolicitacao.dadosPropriedade.coordenadas.longitude}` : 
                              'Não informadas'}
                          </p>
                        </div>
                      </>
                    )}
                    {/* Propriedade no formato do formulário completo */}
                    {selectedSolicitacao.nomePropriedade && (
                      <>
                        <div>
                          <p className="font-semibold">Nome da Propriedade:</p>
                          <p>{selectedSolicitacao.nomePropriedade}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Endereço da Propriedade:</p>
                          <p>{selectedSolicitacao.enderecoPropriedade || 'Não informado'}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Tamanho:</p>
                          <p>{selectedSolicitacao.tamanhoPropriedade || '0'} ha</p>
                        </div>
                        <div>
                          <p className="font-semibold">Distância do Município:</p>
                          <p>{selectedSolicitacao.distanciaMunicipio || '0'} km</p>
                        </div>
                        <div>
                          <p className="font-semibold">Situação Legal:</p>
                          <p>{selectedSolicitacao.situacaoLegal || 'Não informada'}</p>
                        </div>
                        {selectedSolicitacao.outraSituacaoLegal && (
                          <div>
                            <p className="font-semibold">Outra Situação:</p>
                            <p>{selectedSolicitacao.outraSituacaoLegal}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </section>
              )}

              {/* 3. Produção Agrícola para formulário completo */}
              {selectedSolicitacao.tipo === 'agricultura' && selectedSolicitacao.culturas && (
                <section>
                  <h3 className="text-lg font-bold mb-2">3. Produção Agrícola</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedSolicitacao.culturas).map(([key, cultura]: [string, any]) => {
                      if (!cultura.selecionado) return null;

                      const nomeCultura = {
                        'hortalicas': 'Hortaliças',
                        'mandioca': 'Mandioca',
                        'milho': 'Milho',
                        'feijao': 'Feijão',
                        'banana': 'Banana',
                        'citricos': 'Cítricos',
                        'cafe': 'Café',
                        'cacau': 'Cacau'
                      }[key] || key;

                      return (
                        <div key={key} className="border p-4 rounded-md">
                          <p className="font-semibold">{nomeCultura}</p>
                          <p>Área plantada: {cultura.area || '0'} ha</p>
                          <p>Produção estimada: {cultura.producao || '0'} kg/ano</p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* 4. Recursos Disponíveis para formulário completo */}
              {selectedSolicitacao.tipo === 'agricultura' && (selectedSolicitacao.maquinario || selectedSolicitacao.maodeobra) && (
                <section>
                  <h3 className="text-lg font-bold mb-2">4. Recursos Disponíveis</h3>

                  {selectedSolicitacao.maquinario && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Maquinário disponível</h4>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {Object.entries(selectedSolicitacao.maquinario).map(([key, value]) => {
                          if (!value) return null;

                          const nomeMaquina = {
                            'trator': 'Trator',
                            'plantadeira': 'Plantadeira',
                            'colheitadeira': 'Colheitadeira',
                            'pulverizador': 'Pulverizador',
                            'irrigacao': 'Sistema de Irrigação'
                          }[key] || key;

                          return (
                            <span key={key} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                              {nomeMaquina}
                            </span>
                          );
                        })}
                        {Object.values(selectedSolicitacao.maquinario).every(v => !v) && 
                          <p className="text-gray-500">Nenhum maquinário informado</p>
                        }
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.maodeobra && (
                    <div>
                      <h4 className="font-semibold mb-2">Mão de obra</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(selectedSolicitacao.maodeobra).map(([key, info]: [string, any]) => {
                          if (!info.selecionado) return null;

                          const tipoMaoDeObra = {
                            'familiar': 'Familiar',
                            'contratada_permanente': 'Contratada Permanente',
                            'contratada_temporaria': 'Contratada Temporária'
                          }[key] || key;

                          return (
                            <div key={key} className="border p-3 rounded-md">
                              <p className="font-medium">{tipoMaoDeObra}</p>
                              <p>Quantidade: {info.quantidade || '0'} pessoas</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 5. Serviço Solicitado para formulário completo */}
              {selectedSolicitacao.tipo === 'agricultura' && selectedSolicitacao.tipoServico && (
                <section>
                  <h3 className="text-lg font-bold mb-2">5. Serviço Solicitado</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Tipo de Serviço:</p>
                      <p>{selectedSolicitacao.tipoServico}</p>
                    </div>
                    {selectedSolicitacao.periodoDesejado && (
                      <div>
                        <p className="font-semibold">Período Desejado:</p>
                        <p>{selectedSolicitacao.periodoDesejado}</p>
                      </div>
                    )}
                    {selectedSolicitacao.urgencia && (
                      <div>
                        <p className="font-semibold">Nível de Urgência:</p>
                        <p className={`${
                          selectedSolicitacao.urgencia === 'urgente' ? 'text-red-600 font-medium' : 
                          selectedSolicitacao.urgencia === 'alta' ? 'text-orange-600' : 
                          selectedSolicitacao.urgencia === 'baixa' ? 'text-green-600' : ''
                        }`}>
                          {selectedSolicitacao.urgencia.charAt(0).toUpperCase() + selectedSolicitacao.urgencia.slice(1)}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedSolicitacao.detalhes && (
                    <div className="mt-4">
                      <p className="font-semibold">Detalhes da Solicitação:</p>
                      <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                        {selectedSolicitacao.detalhes}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 3. Classificação */}
              {selectedSolicitacao.obras || selectedSolicitacao.especiesConfinadas ? (
                <section>
                  <h3 className="text-lg font-bold mb-2">3. Classificação</h3>

                  {/* 3.1 Obras */}
                  {selectedSolicitacao.obras && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">3.1 Obras</h4>
                      <div className="grid gap-2">
                        {selectedSolicitacao.obras.map((obra, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>
                              {obra.tipo}: {obra.area}{obra.unidade} - {obra.situacao}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 3.2 Espécies */}
                  {selectedSolicitacao.especiesConfinadas && (
                    <div>
                      <h4 className="font-semibold mb-2">3.2 Espécies Confinadas</h4>
                      <div className="grid gap-2">
                        {selectedSolicitacao.especiesConfinadas.map((especie, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>
                              {especie.nome}: {especie.quantidade} unidades
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              ) : null}

              {/* 4. Detalhamento */}
              {selectedSolicitacao.detalhamento && (
                <section>
                  <h3 className="text-lg font-bold mb-2">4. Detalhamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Distância da Sede:</p>
                      <p>{selectedSolicitacao.detalhamento.distanciaSede || 0} km</p>
                    </div>
                    <div>
                      <p className="font-semibold">Situação Legal:</p>
                      <p>{selectedSolicitacao.detalhamento.situacaoLegal || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Área Total:</p>
                      <p>{selectedSolicitacao.detalhamento.areaTotal || 0} ha</p>
                    </div>
                  </div>

                  {selectedSolicitacao.detalhamento.recursosHidricos && selectedSolicitacao.detalhamento.recursosHidricos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recursos Hídricos:</h4>
                      <div className="grid gap-2">
                        {selectedSolicitacao.detalhamento.recursosHidricos.map((recurso, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>{recurso?.tipo || 'Tipo não informado'}: {recurso?.nome || 'Nome não informado'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedSolicitacao.detalhamento.usosAgua && selectedSolicitacao.detalhamento.usosAgua.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Usos da Água:</h4>
                      <div className="grid gap-2">
                        {selectedSolicitacao.detalhamento.usosAgua.map((uso, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>{uso || 'Não informado'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* 5. Recursos */}
              {selectedSolicitacao.recursos && (
                <section>
                  <h3 className="text-lg font-bold mb-2">5. Recursos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Número de Empregados:</p>
                      <p>{selectedSolicitacao.recursos.numeroEmpregados || 0}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Trabalho Familiar:</p>
                      <p>{selectedSolicitacao.recursos.trabalhoFamiliar || 0} pessoas</p>
                    </div>
                    <div>
                      <p className="font-semibold">Recursos Financeiros:</p>
                      <p>{selectedSolicitacao.recursos.recursosFinanceiros || 'Não informado'}</p>
                    </div>
                    {selectedSolicitacao.recursos.fonteFinanciamento && (<div>
                        <p className="font-semibold">Fonte do Financiamento:</p>
                        <p>{selectedSolicitacao.recursos.fonteFinanciamento}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">Assistência Técnica:</p>
                      <p>{selectedSolicitacao.recursos.assistenciaTecnica || 'Não informado'}</p>
                    </div>
                  </div>
                </section>
              )}

              {/* 6. Observações */}
              {selectedSolicitacao.observacoes && (
                <section>
                  <h3 className="text-lg font-bold mb-2">6. Observações</h3>
                  <p>{selectedSolicitacao.observacoes}</p>
                </section>
              )}

              {/* 7. Histórico de atualizações (se existir) */}
              {selectedSolicitacao.historicoAtualizacoes && selectedSolicitacao.historicoAtualizacoes.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold mb-2">7. Histórico de Atualizações</h3>
                  <div className="space-y-2">
                    {selectedSolicitacao.historicoAtualizacoes.map((historico, index) => (
                      <div key={index} className="border p-3 rounded-md">
                        <div className="flex justify-between">
                          <p className="font-medium">{historico.status}</p>
                          <p className="text-sm text-gray-500">{formatarData(historico.data)}</p>
                        </div>
                        <p className="text-sm">Responsável: {historico.responsavel}</p>
                        {historico.observacao && (
                          <p className="text-sm mt-1">{historico.observacao}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSolicitacao(null)}
                >
                  Fechar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generatePDF(selectedSolicitacao)}
                >
                  Gerar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo para atualização de status */}
      {renderDialogoAtualizarStatus()}
    </div>
  );
};

export default CadastrosSolicitacoesManager;

const generateAgriculturaReport = (solicitacao: Solicitacao) => {
  const doc = new jsPDF();
  let yPos = 20;
  const lineHeight = 7;

  // Função auxiliar para adicionar seções
  const addSection = (title: string, content: string) => {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(title, 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    // Quebra de linha para conteúdos longos
    if (content && content.length > 80) {
      const words = content.split(' ');
      let line = '';
      for (let i = 0; i < words.length; i++) {
        if ((line + words[i] + ' ').length > 80) {
          doc.text(line, 20, yPos);
          yPos += lineHeight;
          line = words[i] + ' ';
        } else {
          line += words[i] + ' ';
        }
      }
      if (line.trim()) {
        doc.text(line, 20, yPos);
      }
    } else {
      doc.text(content || 'Não informado', 20, yPos);
    }
    yPos += lineHeight;
  };

  // Título do Relatório
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RELATÓRIO DE CADASTRO COMPLETO - AGRICULTURA', 20, yPos);
  yPos += lineHeight * 2;
  doc.setFontSize(12);

  // 1. Dados do Produtor
  addSection('1. DADOS DO PRODUTOR', '');
  if (solicitacao.dadosPessoais) {
    addSection('Nome Completo:', solicitacao.dadosPessoais.nomeCompleto || 'Não informado');
    addSection('CPF:', solicitacao.dadosPessoais.cpf || 'Não informado');
    addSection('RG:', `${solicitacao.dadosPessoais.identidade || 'Não informado'} - ${solicitacao.dadosPessoais.emissor || 'Não informado'}`);
    addSection('Sexo:', solicitacao.dadosPessoais.sexo || 'Não informado');

    // Incluir dados de contato
    addSection('Telefone:', solicitacao.dadosPessoais.telefone || 'Não informado');
    if (solicitacao.dadosPessoais.celular) {
      addSection('Celular:', solicitacao.dadosPessoais.celular);
    }
    if (solicitacao.dadosPessoais.email) {
      addSection('E-mail:', solicitacao.dadosPessoais.email);
    }

    // Dados adicionais
    addSection('Endereço:', solicitacao.dadosPessoais.endereco || 'Não informado');
    if (solicitacao.dadosPessoais.travessao) {
      addSection('Travessão:', solicitacao.dadosPessoais.travessao);
    }

    if (solicitacao.dadosPessoais.dataNascimento) {
      addSection('Data Nascimento:', solicitacao.dadosPessoais.dataNascimento);
    }
    if (solicitacao.dadosPessoais.naturalidade) {
      addSection('Naturalidade:', solicitacao.dadosPessoais.naturalidade);
    }
    if (solicitacao.dadosPessoais.nomeMae) {
      addSection('Nome da Mãe:', solicitacao.dadosPessoais.nomeMae);
    }
    if (solicitacao.dadosPessoais.escolaridade) {
      addSection('Escolaridade:', solicitacao.dadosPessoais.escolaridade);
    }
    if (solicitacao.dadosPessoais.instituicaoAssociada) {
      addSection('Instituição Associada:', solicitacao.dadosPessoais.instituicaoAssociada);
    }
  } else {
    addSection('Dados Pessoais:', 'Não disponíveis');
  }

  // 2. Dados da Propriedade
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight;
  addSection('2. DADOS DA PROPRIEDADE', '');
  if (solicitacao.dadosPropriedade) {
    addSection('Nome da Propriedade:', solicitacao.dadosPropriedade.nome || 'Não informado');
    addSection('Tipo de Pessoa:', solicitacao.dadosPropriedade.tipoPessoa || 'Não informado');
    addSection('Endereço da Propriedade:', solicitacao.dadosPropriedade.endereco || 'Não informado');
    addSection('Tamanho (ha):', (solicitacao.dadosPropriedade.tamanhoHa || 0).toString());

    // Documentação
    doc.setFont(undefined, 'bold');
    doc.text('Documentação:', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    doc.text(`Escriturada: ${solicitacao.dadosPropriedade.escriturada ? 'Sim' : 'Não'}`, 30, yPos);
    yPos += lineHeight;
    doc.text(`DAP/CAF: ${solicitacao.dadosPropriedade.dapCaf ? 'Sim' : 'Não'}`, 30, yPos);
    yPos += lineHeight;
    doc.text(`CAR: ${solicitacao.dadosPropriedade.car ? 'Sim' : 'Não'}`, 30, yPos);
    yPos += lineHeight;
    doc.text(`Financiamento Rural: ${solicitacao.dadosPropriedade.financiamentoRural ? 'Sim' : 'Não'}`, 30, yPos);
    yPos += lineHeight;

    // Coordenadas geográficas
    if (solicitacao.dadosPropriedade.coordenadas) {
      addSection('Coordenadas:', `Latitude: ${solicitacao.dadosPropriedade.coordenadas.latitude}, Longitude: ${solicitacao.dadosPropriedade.coordenadas.longitude}`);
    }

    // Dados complementares da propriedade
    if (solicitacao.detalhamento) {
      if (solicitacao.detalhamento.distanciaSede) {
        addSection('Distância da Sede (km):', solicitacao.detalhamento.distanciaSede.toString());
      }
      if (solicitacao.detalhamento.situacaoLegal) {
        addSection('Situação Legal:', solicitacao.detalhamento.situacaoLegal);
        if (solicitacao.detalhamento.outraSituacao) {
          addSection('Outra Situação:', solicitacao.detalhamento.outraSituacao);
        }
      }
    }
  } else {
    addSection('Dados da Propriedade:', 'Não disponíveis');
  }

  // 3. Produção Agrícola
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight;
  addSection('3. PRODUÇÃO AGRÍCOLA', '');

  // Verificar se existe o objeto culturas
  if (solicitacao.culturas) {
    const culturas = solicitacao.culturas;

    // Lista de culturas possíveis e seus nomes formatados
    const tiposCulturas = [
      { key: 'hortalicas', nome: 'Hortaliças' },
      { key: 'mandioca', nome: 'Mandioca' },
      { key: 'milho', nome: 'Milho' },
      { key: 'feijao', nome: 'Feijão' },
      { key: 'banana', nome: 'Banana' },
      { key: 'citricos', nome: 'Cítricos' },
      { key: 'cafe', nome: 'Café' },
      { key: 'cacau', nome: 'Cacau' }
    ];

    let temCultura = false;

    // Percorrer as culturas potenciais
    tiposCulturas.forEach(tipo => {
      if (culturas[tipo.key]?.selecionado) {
        temCultura = true;

        doc.setFont(undefined, 'bold');
        doc.text(`${tipo.nome}:`, 20, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        doc.text(`Área plantada: ${culturas[tipo.key].area || '0'} ha`, 30, yPos);
        yPos += lineHeight;
        doc.text(`Produção estimada: ${culturas[tipo.key].producao || '0'} kg/ano`, 30, yPos);
        yPos += lineHeight;
      }
    });

    if (!temCultura) {
      addSection('Culturas:', 'Nenhuma cultura selecionada');
    }
  } else if (solicitacao.dadosAgropecuarios) {
    // Retro-compatibilidade com o formato antigo

    // Cacau
    if (solicitacao.dadosAgropecuarios.cacau?.cultiva) {
      doc.setFont(undefined, 'bold');
      doc.text('Cacau:', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      doc.text(`Quantidade de pés: ${solicitacao.dadosAgropecuarios.cacau.quantidadePes || 0}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Safreiro: ${solicitacao.dadosAgropecuarios.cacau.safreiro ? 'Sim' : 'Não'}`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Produção Anual: ${solicitacao.dadosAgropecuarios.cacau.producaoAnual || 0} kg`, 30, yPos);
      yPos += lineHeight;

      // Dados de cacau clonado
      if (solicitacao.dadosAgropecuarios.cacau.clonado?.possui) {
        doc.text('Cacau Clonado:', 30, yPos);
        yPos += lineHeight;
        doc.text(`  Quantidade de pés: ${solicitacao.dadosAgropecuarios.cacau.clonado.quantidadePes || 0}`, 30, yPos);
        yPos += lineHeight;
        doc.text(`  Safreiro: ${solicitacao.dadosAgropecuarios.cacau.clonado.safreiro ? 'Sim' : 'Não'}`, 30, yPos);
        yPos += lineHeight;
        doc.text(`  Produção Anual: ${solicitacao.dadosAgropecuarios.cacau.clonado.producaoAnual || 0} kg`, 30, yPos);
        yPos += lineHeight;

        if (solicitacao.dadosAgropecuarios.cacau.clonado.materialClonal?.length) {
          doc.text(`  Material Clonal: ${solicitacao.dadosAgropecuarios.cacau.clonado.materialClonal.join(', ')}`, 30, yPos);
          yPos += lineHeight;
        }
      }
    }

    // Frutíferas
    if (solicitacao.dadosAgropecuarios.frutiferas?.cultiva) {
      doc.setFont(undefined, 'bold');
      doc.text('Frutíferas:', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      if (solicitacao.dadosAgropecuarios.frutiferas.tipos?.length) {
        doc.text(`Tipos: ${solicitacao.dadosAgropecuarios.frutiferas.tipos.join(', ')}`, 30, yPos);
        yPos += lineHeight;
      }

      if (solicitacao.dadosAgropecuarios.frutiferas.destino?.length) {
        doc.text(`Destino: ${solicitacao.dadosAgropecuarios.frutiferas.destino.join(', ')}`, 30, yPos);
        yPos += lineHeight;
      }

      doc.text(`Produção: ${solicitacao.dadosAgropecuarios.frutiferas.producaoKg || 0} kg`, 30, yPos);
      yPos += lineHeight;

      if (solicitacao.dadosAgropecuarios.frutiferas.precoMedioKg) {
        doc.text(`Preço médio por kg: R$ ${solicitacao.dadosAgropecuarios.frutiferas.precoMedioKg}`, 30, yPos);
        yPos += lineHeight;
      }
    }

    // Lavouras
    if (solicitacao.dadosAgropecuarios.lavouras) {
      // Milho
      if (solicitacao.dadosAgropecuarios.lavouras.milho?.produz) {
        doc.setFont(undefined, 'bold');
        doc.text('Milho:', 20, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        if (solicitacao.dadosAgropecuarios.lavouras.milho.finalidade?.length) {
          doc.text(`Finalidade: ${solicitacao.dadosAgropecuarios.lavouras.milho.finalidade.join(', ')}`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.milho.destino?.length) {
          doc.text(`Destino: ${solicitacao.dadosAgropecuarios.lavouras.milho.destino.join(', ')}`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.milho.producaoKg) {
          doc.text(`Produção: ${solicitacao.dadosAgropecuarios.lavouras.milho.producaoKg} kg`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.milho.areaPlantada) {
          doc.text(`Área plantada: ${solicitacao.dadosAgropecuarios.lavouras.milho.areaPlantada} ha`, 30, yPos);
          yPos += lineHeight;
        }
      }

      // Mandioca
      if (solicitacao.dadosAgropecuarios.lavouras.mandioca?.produz) {
        doc.setFont(undefined, 'bold');
        doc.text('Mandioca:', 20, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');

        if (solicitacao.dadosAgropecuarios.lavouras.mandioca.tipo) {
          doc.text(`Tipo: ${solicitacao.dadosAgropecuarios.lavouras.mandioca.tipo}`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.mandioca.finalidade?.length) {
          doc.text(`Finalidade: ${solicitacao.dadosAgropecuarios.lavouras.mandioca.finalidade.join(', ')}`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.mandioca.subprodutos?.length) {
          doc.text(`Subprodutos: ${solicitacao.dadosAgropecuarios.lavouras.mandioca.subprodutos.join(', ')}`, 30, yPos);
          yPos += lineHeight;
        }

        if (solicitacao.dadosAgropecuarios.lavouras.mandioca.areaCultivada) {
          doc.text(`Área cultivada: ${solicitacao.dadosAgropecuarios.lavouras.mandioca.areaCultivada} ha`, 30, yPos);
          yPos += lineHeight;
        }

        doc.text(`Mecanizada: ${solicitacao.dadosAgropecuarios.lavouras.mandioca.mecanizada ? 'Sim' : 'Não'}`, 30, yPos);
        yPos += lineHeight;
      }
    }

    // Pecuária
    if (solicitacao.dadosAgropecuarios.pecuaria?.bovino?.possui) {
      if (yPos > 230) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFont(undefined, 'bold');
      doc.text('Pecuária Bovina:', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');

      doc.text(`Quantidade: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade || 0} cabeças`, 30, yPos);
      yPos += lineHeight;
      doc.text(`Tipo: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.leite ? 'Leite' : 'Corte'}`, 30, yPos);
      yPos += lineHeight;

      if (solicitacao.dadosAgropecuarios.pecuaria.bovino.fase) {
        doc.text(`Fase: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.fase}`, 30, yPos);
        yPos += lineHeight;
      }

      if (solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo) {
        doc.text(`Sistema de Manejo: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo}`, 30, yPos);
        yPos += lineHeight;
      }

      if (solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado) {
        doc.text(`Acesso ao Mercado: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado}`, 30, yPos);
        yPos += lineHeight;
      }
    }
  }

  // 4. Recursos Disponíveis
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight;
  addSection('4. RECURSOS DISPONÍVEIS', '');

  // Maquinário
  if (solicitacao.maquinario) {
    doc.setFont(undefined, 'bold');
    doc.text('Maquinário disponível:', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    const maquinas = [];
    if (solicitacao.maquinario.trator) maquinas.push('Trator');
    if (solicitacao.maquinario.plantadeira) maquinas.push('Plantadeira');
    if (solicitacao.maquinario.colheitadeira) maquinas.push('Colheitadeira');
    if (solicitacao.maquinario.pulverizador) maquinas.push('Pulverizador');
    if (solicitacao.maquinario.irrigacao) maquinas.push('Sistema de Irrigação');

    if (maquinas.length > 0) {
      doc.text(maquinas.join(', '), 30, yPos);
    } else {
      doc.text('Nenhum maquinário disponível', 30, yPos);
    }
    yPos += lineHeight;
  }

  // Mão de obra
  if (solicitacao.maodeobra) {
    yPos += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Mão de Obra:', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    if (solicitacao.maodeobra.familiar?.selecionado) {
      doc.text(`Familiar: ${solicitacao.maodeobra.familiar.quantidade || '0'} pessoas`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.maodeobra.contratada_permanente?.selecionado) {
      doc.text(`Contratada Permanente: ${solicitacao.maodeobra.contratada_permanente.quantidade || '0'} pessoas`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.maodeobra.contratada_temporaria?.selecionado) {
      doc.text(`Contratada Temporária: ${solicitacao.maodeobra.contratada_temporaria.quantidade || '0'} pessoas`, 30, yPos);
      yPos += lineHeight;
    }
  } else if (solicitacao.recursos) {
    // Retro-compatibilidade
    yPos += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('Recursos:', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    if (solicitacao.recursos.numeroEmpregados) {
      doc.text(`Número de Empregados: ${solicitacao.recursos.numeroEmpregados}`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.recursos.trabalhoFamiliar) {
      doc.text(`Trabalho Familiar: ${solicitacao.recursos.trabalhoFamiliar} pessoas`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.recursos.recursosFinanceiros) {
      doc.text(`Recursos Financeiros: ${solicitacao.recursos.recursosFinanceiros}`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.recursos.fonteFinanciamento) {
      doc.text(`Fonte do Financiamento: ${solicitacao.recursos.fonteFinanciamento}`, 30, yPos);
      yPos += lineHeight;
    }

    if (solicitacao.recursos.assistenciaTecnica) {
      doc.text(`Assistência Técnica: ${solicitacao.recursos.assistenciaTecnica}`, 30, yPos);
      yPos += lineHeight;
    }
  }

  // 5. Serviço Solicitado
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight;
  addSection('5. SERVIÇO SOLICITADO', '');

  if (solicitacao.tipoServico) {
    addSection('Tipo de Serviço:', solicitacao.tipoServico);

    if (solicitacao.periodoDesejado) {
      addSection('Período Desejado:', solicitacao.periodoDesejado);
    }

    if (solicitacao.urgencia) {
      addSection('Nível de Urgência:', solicitacao.urgencia);
    }

    if (solicitacao.detalhes) {
      addSection('Detalhes da Solicitação:', '');

      // Tratamento para texto longo - quebra de linhas
      const linhas = solicitacao.detalhes.split('\n');
      for (let i = 0; i < linhas.length; i++) {
        const words = linhas[i].split(' ');
        let linha = '';

        for (let j = 0; j < words.length; j++) {
          if ((linha + words[j] + ' ').length > 80) {
            doc.text(linha, 30, yPos);
            yPos += lineHeight;
            linha = words[j] + ' ';
          } else {
            linha += words[j] + ' ';
          }
        }

        if (linha.trim()) {
          doc.text(linha, 30, yPos);
          yPos += lineHeight;
        }
      }
    }
  } else {
    addSection('Serviço Solicitado:', 'Não especificado');
  }

  // 6. Observações (se existir)
  if (solicitacao.observacoes) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    yPos += lineHeight;
    addSection('6. OBSERVAÇÕES', '');

    // Tratamento para texto longo - quebra de linhas
    const linhas = solicitacao.observacoes.split('\n');
    for (let i = 0; i < linhas.length; i++) {
      const words = linhas[i].split(' ');
      let linha = '';

      for (let j = 0; j < words.length; j++) {
        if ((linha + words[j] + ' ').length > 80) {
          doc.text(linha, 30, yPos);
          yPos += lineHeight;
          linha = words[j] + ' ';
        } else {
          linha += words[j] + ' ';
        }
      }

      if (linha.trim()) {
        doc.text(linha, 30, yPos);
        yPos += lineHeight;
      }
    }
  }

  // 7. Dados do sistema
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight * 2;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);

  addSection('Data de Cadastro:', solicitacao.dataCriacao ? new Date(solicitacao.dataCriacao).toLocaleString() : 'Não informado');
  addSection('ID do Cadastro:', solicitacao.id || 'Não informado');
  addSection('Status:', solicitacao.status || 'Não informado');

  // Restaurar a cor do texto
  doc.setTextColor(0, 0, 0);

  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 20, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`cadastro-agricultura-${solicitacao.id}.pdf`);
};
