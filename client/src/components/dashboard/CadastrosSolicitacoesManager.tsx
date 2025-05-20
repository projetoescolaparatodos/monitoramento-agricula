import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';

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
  tipo: 'agricultura' | 'pesca';
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
}

export const CadastrosSolicitacoesManager = () => {
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>([]);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todas');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSolicitacoes = async () => {
      setLoading(true);
      try {
        const colecoes = ['solicitacoes_agricultura', 'solicitacoes_pesca'];
        let todasSolicitacoes: Solicitacao[] = [];

        for (const colecao of colecoes) {
          console.log(`Buscando solicitações da coleção: ${colecao}`);
          const q = query(
            collection(db, colecao)
          );

          const querySnapshot = await getDocs(q);
          console.log(`Encontradas ${querySnapshot.size} solicitações em ${colecao}`);

          const solicitacoesSetor = querySnapshot.docs.map(doc => {
            const data = doc.data();
            console.log(`Documento ${doc.id}:`, data);
            return {
              id: doc.id,
              tipo: colecao === 'solicitacoes_agricultura' ? 'agricultura' : 'pesca',
              ...data
            } as Solicitacao;
          });

          todasSolicitacoes = [...todasSolicitacoes, ...solicitacoesSetor];
        }

        console.log('Total de solicitações encontradas:', todasSolicitacoes.length);
        setSolicitacoes(todasSolicitacoes);
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

    fetchSolicitacoes();
  }, [toast]);

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const solicitacoesFiltradas = activeTab === 'todas' 
    ? solicitacoes 
    : solicitacoes.filter(s => s.tipo === activeTab);

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
    addSection('Nome:', solicitacao.dadosPessoais.nomeCompleto);
    addSection('CPF:', solicitacao.dadosPessoais.cpf);
    addSection('RG:', `${solicitacao.dadosPessoais.identidade} - ${solicitacao.dadosPessoais.emissor}`);
    addSection('Data Nascimento:', solicitacao.dadosPessoais.dataNascimento);
    addSection('Naturalidade:', solicitacao.dadosPessoais.naturalidade);
    addSection('Nome da Mãe:', solicitacao.dadosPessoais.nomeMae);
    addSection('Escolaridade:', solicitacao.dadosPessoais.escolaridade);
    addSection('Contato:', solicitacao.dadosPessoais.telefone);

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

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gerenciar Cadastros e Solicitações</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : solicitacoesFiltradas.length === 0 ? (
            <div className="text-center py-4">Nenhuma solicitação encontrada</div>
          ) : (
            <div className="grid gap-4">
              {solicitacoesFiltradas.map((solicitacao) => (
                <Card key={solicitacao.id} className="p-4">
                  <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">
                          {solicitacao.dadosPessoais?.nomeCompleto || 'Nome não informado'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {solicitacao.dataCriacao ? formatarData(solicitacao.dataCriacao) : 'Data não informada'}
                        </p>
                        <Badge variant="outline" className="mt-2">
                          {solicitacao.tipo === 'agricultura' ? 'Agricultura' : 'Pesca'}
                        </Badge>
                      </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedSolicitacao(solicitacao)}
                      >
                        Visualizar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => generatePDF(solicitacao)}
                      >
                        Gerar PDF
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedSolicitacao} onOpenChange={() => setSelectedSolicitacao(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
          </DialogHeader>

          {selectedSolicitacao && (
            <div className="space-y-6">
              {/* 1. Identificação do Empreendedor */}
              <section>
                <h3 className="text-lg font-bold mb-2">1. Identificação do Empreendedor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Nome:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.nomeCompleto || 'Não informado'}</p>
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
                    <p className="font-semibold">Contato:</p>
                    <p>{selectedSolicitacao.dadosPessoais?.telefone || 'Não informado'}</p>
                  </div>
                </div>
              </section>

              {/* 2. Identificação da Atividade */}
              {selectedSolicitacao.dadosEmpreendimento && (
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

              {/* 3. Classificação */}
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
                    {selectedSolicitacao.recursos.fonteFinanciamento && (
                      <div>
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
    doc.text(content, 20, yPos);
    yPos += lineHeight;
  };

  // 1. Dados da Propriedade
  addSection('1. DADOS DA PROPRIEDADE', '');
  if (solicitacao.dadosPropriedade) {
    addSection('Nome:', solicitacao.dadosPropriedade.nome || 'Não informado');
    addSection('Tipo:', solicitacao.dadosPropriedade.tipoPessoa || 'Não informado');
    addSection('Endereço:', solicitacao.dadosPropriedade.endereco || 'Não informado');
    addSection('Tamanho (ha):', (solicitacao.dadosPropriedade.tamanhoHa || 0).toString());
    addSection('Documentação:', `
      Escriturada: ${solicitacao.dadosPropriedade.escriturada ? 'Sim' : 'Não'}
      DAP/CAF: ${solicitacao.dadosPropriedade.dapCaf ? 'Sim' : 'Não'}
      CAR: ${solicitacao.dadosPropriedade.car ? 'Sim' : 'Não'}
      Financiamento: ${solicitacao.dadosPropriedade.financiamentoRural ? 'Sim' : 'Não'}
    `);
  }

  // 2. Dados do Proprietário
  yPos += lineHeight;
  addSection('2. DADOS DO PROPRIETÁRIO', '');
  if (solicitacao.dadosPessoais) {
    addSection('Nome:', solicitacao.dadosPessoais.nomeCompleto || 'Não informado');
    addSection('CPF:', solicitacao.dadosPessoais.cpf || 'Não informado');
    addSection('RG:', `${solicitacao.dadosPessoais.identidade || 'Não informado'} - ${solicitacao.dadosPessoais.emissor || 'Não informado'}`);
    addSection('Data Nascimento:', solicitacao.dadosPessoais.dataNascimento || 'Não informado');
    addSection('Naturalidade:', solicitacao.dadosPessoais.naturalidade || 'Não informado');
    addSection('Nome da Mãe:', solicitacao.dadosPessoais.nomeMae || 'Não informado');
    addSection('Escolaridade:', solicitacao.dadosPessoais.escolaridade || 'Não informado');
    addSection('Contato:', solicitacao.dadosPessoais.telefone || 'Não informado');
  } else {
    addSection('Dados Pessoais:', 'Não disponíveis');
  }

  // 3. Dados Agropecuários
  if (solicitacao.dadosAgropecuarios) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    addSection('3. DADOS AGROPECUÁRIOS', '');

    // Cacau
    if (solicitacao.dadosAgropecuarios.cacau?.cultiva) {
      addSection('Cacau:', `
        Quantidade de pés: ${solicitacao.dadosAgropecuarios.cacau.quantidadePes || 0}
        Safreiro: ${solicitacao.dadosAgropecuarios.cacau.safreiro ? 'Sim' : 'Não'}
        Produção Anual: ${solicitacao.dadosAgropecuarios.cacau.producaoAnual || 0} kg
      `);
    }

    // Frutíferas
    if (solicitacao.dadosAgropecuarios.frutiferas?.cultiva) {
      addSection('Frutíferas:', `
        Tipos: ${solicitacao.dadosAgropecuarios.frutiferas.tipos?.join(', ') || 'Não informado'}
        Produção: ${solicitacao.dadosAgropecuarios.frutiferas.producaoKg || 0} kg
      `);
    }

    // Pecuária
    if (solicitacao.dadosAgropecuarios.pecuaria?.bovino?.possui) {
      addSection('Bovinos:', `
        Quantidade: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade || 0}
        Tipo: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.leite ? 'Leite' : 'Corte'}
        Sistema: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo || 'Não informado'}
      `);
    }
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);
  }

  doc.save(`solicitacao-agricultura-${solicitacao.id}.pdf`);
};