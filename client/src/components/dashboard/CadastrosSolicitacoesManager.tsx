
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import jsPDF from 'jspdf';

interface DadosPessoais {
  nomeCompleto: string;
  endereco: string;
  travessao: string;
  cpf: string;
  identidade: string;
  emissor: string;
  sexo: string;
  celular: string;
}

interface DadosEmpreendimento {
  atividade: string;
  endereco: string;
  coordenadas?: { lat: number; lng: number };
  estruturaAquicola: string[];
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

interface Solicitacao {
  id: string;
  tipo: 'pesca';
  status: string;
  dataCriacao: string;
  dadosPessoais: DadosPessoais;
  dadosEmpreendimento: DadosEmpreendimento;
  obras: Obra[];
  especiesConfinadas: EspecieConfinada[];
  detalhamento: DadosDetalhamento;
  recursos: DadosRecursos;
  observacoes?: string;
}

export const CadastrosSolicitacoesManager = () => {
  const [selectedSolicitacao, setSelectedSolicitacao] = useState<Solicitacao | null>(null);
  const { toast } = useToast();

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const generatePDF = (solicitacao: Solicitacao) => {
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
    addSection('Endereço:', solicitacao.dadosPessoais.endereco);
    addSection('Travessão:', solicitacao.dadosPessoais.travessao);
    addSection('Contato:', solicitacao.dadosPessoais.celular);

    // 2. Identificação da Atividade
    yPos += lineHeight;
    addSection('2. Identificação da Atividade/Empreendimento', '');
    addSection('Atividade:', solicitacao.dadosEmpreendimento.atividade);
    addSection('Endereço:', solicitacao.dadosEmpreendimento.endereco);
    addSection('Estruturas Aquícolas:', solicitacao.dadosEmpreendimento.estruturaAquicola.join(', '));

    // 3. Classificação
    yPos += lineHeight;
    addSection('3. Classificação', '');
    
    // 3.1 Obras
    doc.text('3.1 Obras:', 20, yPos);
    yPos += lineHeight;
    solicitacao.obras.forEach(obra => {
      doc.text(`- ${obra.tipo}: ${obra.area}${obra.unidade} - ${obra.situacao}`, 25, yPos);
      yPos += lineHeight;
    });

    // 3.2 Espécies
    yPos += lineHeight;
    doc.text('3.2 Espécies Confinadas:', 20, yPos);
    yPos += lineHeight;
    solicitacao.especiesConfinadas.forEach(especie => {
      doc.text(`- ${especie.nome}: ${especie.quantidade} unidades`, 25, yPos);
      yPos += lineHeight;
    });

    // 4. Detalhamento
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

    // 5. Recursos
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
      <h2 className="text-2xl font-bold">Gerenciar Solicitações</h2>
      
      {/* Lista de Solicitações */}
      <div className="grid gap-4">
        {solicitacoes?.map((solicitacao) => (
          <Card key={solicitacao.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold">{solicitacao.dadosPessoais.nomeCompleto}</h3>
                <p className="text-sm text-gray-500">
                  Data: {formatarData(solicitacao.dataCriacao)}
                </p>
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

      {/* Modal de Visualização */}
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
                    <p>{selectedSolicitacao.dadosPessoais.nomeCompleto}</p>
                  </div>
                  <div>
                    <p className="font-semibold">CPF:</p>
                    <p>{selectedSolicitacao.dadosPessoais.cpf}</p>
                  </div>
                  <div>
                    <p className="font-semibold">RG:</p>
                    <p>{selectedSolicitacao.dadosPessoais.identidade} - {selectedSolicitacao.dadosPessoais.emissor}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Sexo:</p>
                    <p>{selectedSolicitacao.dadosPessoais.sexo}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Endereço:</p>
                    <p>{selectedSolicitacao.dadosPessoais.endereco}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Travessão:</p>
                    <p>{selectedSolicitacao.dadosPessoais.travessao}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Contato:</p>
                    <p>{selectedSolicitacao.dadosPessoais.celular}</p>
                  </div>
                </div>
              </section>

              {/* 2. Identificação da Atividade */}
              <section>
                <h3 className="text-lg font-bold mb-2">2. Identificação da Atividade</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Atividade:</p>
                    <p>{selectedSolicitacao.dadosEmpreendimento.atividade}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Endereço:</p>
                    <p>{selectedSolicitacao.dadosEmpreendimento.endereco}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Estruturas Aquícolas:</p>
                    <p>{selectedSolicitacao.dadosEmpreendimento.estruturaAquicola.join(', ')}</p>
                  </div>
                </div>
              </section>

              {/* 3. Classificação */}
              <section>
                <h3 className="text-lg font-bold mb-2">3. Classificação</h3>
                
                {/* 3.1 Obras */}
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

                {/* 3.2 Espécies */}
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
              </section>

              {/* 4. Detalhamento */}
              <section>
                <h3 className="text-lg font-bold mb-2">4. Detalhamento</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Distância da Sede:</p>
                    <p>{selectedSolicitacao.detalhamento.distanciaSede} km</p>
                  </div>
                  <div>
                    <p className="font-semibold">Situação Legal:</p>
                    <p>{selectedSolicitacao.detalhamento.situacaoLegal}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Área Total:</p>
                    <p>{selectedSolicitacao.detalhamento.areaTotal} ha</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Recursos Hídricos:</h4>
                  <div className="grid gap-2">
                    {selectedSolicitacao.detalhamento.recursosHidricos.map((recurso, index) => (
                      <div key={index} className="border p-2 rounded">
                        <p>{recurso.tipo}: {recurso.nome}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Usos da Água:</h4>
                  <div className="grid gap-2">
                    {selectedSolicitacao.detalhamento.usosAgua.map((uso, index) => (
                      <div key={index} className="border p-2 rounded">
                        <p>{uso}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 5. Recursos */}
              <section>
                <h3 className="text-lg font-bold mb-2">5. Recursos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Número de Empregados:</p>
                    <p>{selectedSolicitacao.recursos.numeroEmpregados}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Trabalho Familiar:</p>
                    <p>{selectedSolicitacao.recursos.trabalhoFamiliar} pessoas</p>
                  </div>
                  <div>
                    <p className="font-semibold">Recursos Financeiros:</p>
                    <p>{selectedSolicitacao.recursos.recursosFinanceiros}</p>
                  </div>
                  {selectedSolicitacao.recursos.fonteFinanciamento && (
                    <div>
                      <p className="font-semibold">Fonte do Financiamento:</p>
                      <p>{selectedSolicitacao.recursos.fonteFinanciamento}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">Assistência Técnica:</p>
                    <p>{selectedSolicitacao.recursos.assistenciaTecnica}</p>
                  </div>
                </div>
              </section>

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
