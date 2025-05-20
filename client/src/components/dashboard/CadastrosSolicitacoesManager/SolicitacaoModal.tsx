import React from 'react';
import { Button } from '../../ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '../../ui/dialog';
import { Badge } from '../../ui/badge';
import { Solicitacao } from './types';
import { generatePDF } from './generatePdf';

interface SolicitacaoModalProps {
  solicitacao: Solicitacao | null;
  onClose: () => void;
  onChangeStatus: (solicitacaoId: string, novoStatus: string, tipo: string) => void;
}

const SolicitacaoModal: React.FC<SolicitacaoModalProps> = ({ 
  solicitacao, 
  onClose,
  onChangeStatus
}) => {
  if (!solicitacao) return null;

  const formatarData = (timestamp: any) => {
    if (!timestamp) return 'Data não disponível';

    try {
      const data = typeof timestamp === 'string' 
        ? new Date(timestamp) 
        : timestamp.toDate ? timestamp.toDate() : new Date();

      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(data);
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'em_andamento':
        return <Badge className="bg-blue-100 text-blue-800">Em andamento</Badge>;
      case 'concluido':
        return <Badge className="bg-green-100 text-green-800">Concluído</Badge>;
      case 'cancelado':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  const getTipoFormatado = (tipo: string) => {
    switch (tipo) {
      case 'agricultura':
        return 'Agricultura';
      case 'pesca':
        return 'Pesca';
      case 'paa':
        return 'PAA';
      default:
        return tipo;
    }
  };

  return (
    <Dialog open={!!solicitacao} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
                Detalhes da Solicitação 
                {solicitacao.colecao?.includes('completo') && 
                  <span className="ml-2 text-xs font-normal bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Cadastro Completo
                  </span>
                }
              </span>
            {getStatusBadge(solicitacao.status)}
          </DialogTitle>
          <div className="text-sm text-gray-500 mt-1">
            ID: {solicitacao.id} • Criado em: {formatarData(solicitacao.criadoEm)}
            {solicitacao.atualizadoEm && ` • Atualizado em: ${formatarData(solicitacao.atualizadoEm)}`}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* 1. Dados Pessoais */}
          <section>
            <h3 className="text-lg font-bold mb-2">1. Dados Pessoais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Nome:</p>
                  <p>{solicitacao.dadosPessoais?.nome || solicitacao.nome || "Não informado"}</p>
                </div>
                <div>
                  <p className="font-semibold">CPF:</p>
                  <p>{solicitacao.dadosPessoais?.cpf || solicitacao.cpf || "Não informado"}</p>
                </div>
                {(solicitacao.dadosPessoais?.telefone || solicitacao.telefone) && (
                  <div>
                    <p className="font-semibold">Telefone:</p>
                    <p>{solicitacao.dadosPessoais?.telefone || solicitacao.telefone}</p>
                  </div>
                )}
                {(solicitacao.dadosPessoais?.email || solicitacao.email) && (
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{solicitacao.dadosPessoais?.email || solicitacao.email}</p>
                  </div>
                )}
                {(solicitacao.dadosPessoais?.endereco || solicitacao.endereco) && (
                  <div>
                    <p className="font-semibold">Endereço:</p>
                    <p>{solicitacao.dadosPessoais?.endereco || solicitacao.endereco}</p>
                  </div>
                )}
              {solicitacao.dadosPessoais?.rg && (
                <div>
                  <p className="font-semibold">RG:</p>
                  <p>{solicitacao.dadosPessoais.rg}</p>
                </div>
              )}
              
              {solicitacao.dadosPessoais?.travessao && (
                <div>
                  <p className="font-semibold">Travessão:</p>
                  <p>{solicitacao.dadosPessoais.travessao}</p>
                </div>
              )}
              {solicitacao.dadosPessoais?.dataNascimento && (
                <div>
                  <p className="font-semibold">Data Nascimento:</p>
                  <p>{solicitacao.dadosPessoais.dataNascimento}</p>
                </div>
              )}
              {solicitacao.dadosPessoais?.naturalidade && (
                <div>
                  <p className="font-semibold">Naturalidade:</p>
                  <p>{solicitacao.dadosPessoais.naturalidade}</p>
                </div>
              )}
              {solicitacao.dadosPessoais?.nomeMae && (
                <div>
                  <p className="font-semibold">Nome da Mãe:</p>
                  <p>{solicitacao.dadosPessoais.nomeMae}</p>
                </div>
              )}
              {solicitacao.dadosPessoais?.escolaridade && (
                <div>
                  <p className="font-semibold">Escolaridade:</p>
                  <p>{solicitacao.dadosPessoais.escolaridade}</p>
                </div>
              )}
              {solicitacao.dadosPessoais?.instituicaoAssociada && (
                <div>
                  <p className="font-semibold">Instituição Associada:</p>
                  <p>{solicitacao.dadosPessoais.instituicaoAssociada}</p>
                </div>
              )}
            </div>
          </section>

          {/* 2. Dados da Propriedade */}
          {solicitacao.dadosPropriedade && (
            <section>
              <h3 className="text-lg font-bold mb-2">2. Dados da Propriedade</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Nome da Propriedade:</p>
                  <p>{solicitacao.dadosPropriedade.nome || 'Não informado'}</p>
                </div>
                <div>
                  <p className="font-semibold">Tipo de Pessoa:</p>
                  <p>{solicitacao.dadosPropriedade.tipoPessoa || 'Não informado'}</p>
                </div>
                <div>
                  <p className="font-semibold">Endereço:</p>
                  <p>{solicitacao.dadosPropriedade.endereco || 'Não informado'}</p>
                </div>
                {solicitacao.dadosPropriedade.tamanho && (
                  <div>
                    <p className="font-semibold">Tamanho (ha):</p>
                    <p>{solicitacao.dadosPropriedade.tamanho}</p>
                  </div>
                )}
                {solicitacao.dadosPropriedade.coordenadas && (
                  <div>
                    <p className="font-semibold">Coordenadas:</p>
                    <p>
                      Latitude: {solicitacao.dadosPropriedade.coordenadas.latitude}, 
                      Longitude: {solicitacao.dadosPropriedade.coordenadas.longitude}
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Seções específicas por tipo */}
          {solicitacao.tipo === 'agricultura' && solicitacao.dadosAgropecuarios && (
            <section>
              <h3 className="text-lg font-bold mb-2">3. Dados Agropecuários</h3>

              {solicitacao.dadosAgropecuarios.agricultura && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Agricultura</h4>
                  {solicitacao.dadosAgropecuarios.agricultura.culturas && 
                   solicitacao.dadosAgropecuarios.agricultura.culturas.length > 0 && (
                    <div className="grid gap-2 mb-2">
                      <h5 className="font-medium">Culturas:</h5>
                      {solicitacao.dadosAgropecuarios.agricultura.culturas.map((cultura, index) => (
                        <div key={index} className="border p-2 rounded">
                          <p>{cultura.nome}: {cultura.area} {cultura.unidade}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {solicitacao.dadosAgropecuarios.pecuaria && 
               solicitacao.dadosAgropecuarios.pecuaria.bovino && (
                <div>
                  <h4 className="font-semibold mb-2">Pecuária - Bovino</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade && (
                      <div>
                        <p className="font-medium">Quantidade:</p>
                        <p>{solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade}</p>
                      </div>
                    )}
                    {solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade && (
                      <div>
                        <p className="font-medium">Finalidade:</p>
                        <p>{solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade}</p>
                      </div>
                    )}
                    {solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo && (
                      <div>
                        <p className="font-medium">Sistema de Manejo:</p>
                        <p>{solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo}</p>
                      </div>
                    )}
                    {solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado && (
                      <div>
                        <p className="font-medium">Acesso ao Mercado:</p>
                        <p>{solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* 4. Recursos Disponíveis para formulário completo */}
          {solicitacao.tipo === 'agricultura' && (solicitacao.maquinario || solicitacao.maodeobra) && (
            <section>
              <h3 className="text-lg font-bold mb-2">4. Recursos Disponíveis</h3>

              {solicitacao.maquinario && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Maquinário disponível</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {Object.entries(solicitacao.maquinario).map(([key, value]) => {
                      if (!value || key === 'outros') return null;

                      const nomeMaquina = {
                        'trator': 'Trator',
                        'plantadeira': 'Plantadeira',
                        'colheitadeira': 'Colheitadeira',
                        'pulverizador': 'Pulverizador',
                        'irrigacao': 'Sistema de Irrigação'
                      }[key] || key;

                      return (
                        <Badge key={key} variant="outline" className="px-3 py-1">
                          {nomeMaquina}
                        </Badge>
                      );
                    })}
                  </div>

                  {solicitacao.maquinario.outros && (
                    <div>
                      <p className="font-semibold">Outros maquinários:</p>
                      <p>{solicitacao.maquinario.outros}</p>
                    </div>
                  )}
                </div>
              )}

              {solicitacao.maodeobra && (
                <div>
                  <h4 className="font-semibold mb-2">Mão de Obra</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solicitacao.maodeobra.familiar?.selecionado && (
                      <div>
                        <p className="font-medium">Familiar:</p>
                        <p>{solicitacao.maodeobra.familiar.quantidade || 0} pessoas</p>
                      </div>
                    )}
                    {solicitacao.maodeobra.contratada_permanente?.selecionado && (
                      <div>
                        <p className="font-medium">Contratada Permanente:</p>
                        <p>{solicitacao.maodeobra.contratada_permanente.quantidade || 0} pessoas</p>
                      </div>
                    )}
                    {solicitacao.maodeobra.contratada_temporaria?.selecionado && (
                      <div>
                        <p className="font-medium">Contratada Temporária:</p>
                        <p>{solicitacao.maodeobra.contratada_temporaria.quantidade || 0} pessoas</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Suporte para modelo de dados antigo */}
              {solicitacao.recursos && (
                <div>
                  <h4 className="font-semibold mb-2">Recursos</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">Número de Empregados:</p>
                      <p>{solicitacao.recursos.numeroEmpregados || 0}</p>
                    </div>
                    <div>
                      <p className="font-medium">Trabalho Familiar:</p>
                      <p>{solicitacao.recursos.trabalhoFamiliar || 0} pessoas</p>
                    </div>
                    <div>
                      <p className="font-medium">Recursos Financeiros:</p>
                      <p>{solicitacao.recursos.recursosFinanceiros || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Fonte do Financiamento:</p>
                      <p>{solicitacao.recursos.fonteFinanciamento || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-medium">Assistência Técnica:</p>
                      <p>{solicitacao.recursos.assistenciaTecnica || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Mostrar campos específicos de Pesca */}
          {solicitacao.tipo === 'pesca' && (
            <>
              {/* 3. Classificação */}
              <section>
                <h3 className="text-lg font-bold mb-2">3. Classificação</h3>

                {/* 3.1 Obras */}
                {solicitacao.obras && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">3.1 Obras</h4>
                    <div className="grid gap-2">
                      {solicitacao.obras.map((obra, index) => (
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
                {solicitacao.especiesConfinadas && (
                  <div>
                    <h4 className="font-semibold mb-2">3.2 Espécies Confinadas</h4>
                    <div className="grid gap-2">
                      {solicitacao.especiesConfinadas.map((especie, index) => (
                        <div key={index} className="border p-2 rounded">
                          <p>{especie.nome}: {especie.quantidade} unidades</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {/* 4. Detalhamento */}
              {solicitacao.detalhamento && (
                <section>
                  <h3 className="text-lg font-bold mb-2">4. Detalhamento</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Distância da Sede:</p>
                      <p>{solicitacao.detalhamento.distanciaSede || 0} km</p>
                    </div>
                    <div>
                      <p className="font-semibold">Situação Legal:</p>
                      <p>{solicitacao.detalhamento.situacaoLegal || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Área Total:</p>
                      <p>{solicitacao.detalhamento.areaTotal || 0} ha</p>
                    </div>
                  </div>

                  {solicitacao.detalhamento.recursosHidricos && solicitacao.detalhamento.recursosHidricos.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Recursos Hídricos:</h4>
                      <div className="grid gap-2">
                        {solicitacao.detalhamento.recursosHidricos.map((recurso, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>{recurso?.tipo || 'Tipo não informado'}: {recurso?.nome || 'Nome não informado'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {solicitacao.detalhamento.usosAgua && solicitacao.detalhamento.usosAgua.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">Usos da Água:</h4>
                      <div className="grid gap-2">
                        {solicitacao.detalhamento.usosAgua.map((uso, index) => (
                          <div key={index} className="border p-2 rounded">
                            <p>{uso || 'Não informado'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* Mostrar campos específicos de PAA */}
          {solicitacao.tipo === 'paa' && solicitacao.producao && (
            <>
              <section>
                <h3 className="text-lg font-bold mb-2">3. Produção</h3>

                {solicitacao.producao.produtos && solicitacao.producao.produtos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2">Produtos</h4>
                    <div className="grid gap-2">
                      {solicitacao.producao.produtos.map((produto, index) => (
                        <div key={index} className="border p-2 rounded">
                          <p>
                            {produto.nome}: {produto.quantidade} {produto.unidade} - 
                            R$ {produto.valorUnitario}/unidade
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {solicitacao.producao.certificacoes && (
                  <div className="mb-2">
                    <p className="font-semibold">Certificações:</p>
                    <p>{solicitacao.producao.certificacoes}</p>
                  </div>
                )}

                {solicitacao.producao.periodicidade && (
                  <div>
                    <p className="font-semibold">Periodicidade:</p>
                    <p>{solicitacao.producao.periodicidade}</p>
                  </div>
                )}
              </section>

              {solicitacao.logistica && (
                <section>
                  <h3 className="text-lg font-bold mb-2">4. Logística</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solicitacao.logistica.meioTransporte && (
                      <div>
                        <p className="font-semibold">Meio de Transporte:</p>
                        <p>{solicitacao.logistica.meioTransporte}</p>
                      </div>
                    )}

                    {solicitacao.logistica.distanciaEntrega && (
                      <div>
                        <p className="font-semibold">Distância de Entrega:</p>
                        <p>{solicitacao.logistica.distanciaEntrega} km</p>
                      </div>
                    )}

                    {solicitacao.logistica.necessidadesEspeciais && (
                      <div className="col-span-2">
                        <p className="font-semibold">Necessidades Especiais:</p>
                        <p>{solicitacao.logistica.necessidadesEspeciais}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </>
          )}

          {/* 5. Serviço Solicitado */}
          <section>
            <h3 className="text-lg font-bold mb-2">5. Serviço Solicitado</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Tipo de Serviço:</p>
                <p>{solicitacao.tipoServico || 'Não informado'}</p>
              </div>

              {solicitacao.periodoDesejado && (
                <div>
                  <p className="font-semibold">Período Desejado:</p>
                  <p>{solicitacao.periodoDesejado}</p>
                </div>
              )}

              {solicitacao.urgencia && (
                <div>
                  <p className="font-semibold">Nível de Urgência:</p>
                  <p className="capitalize">
                    {solicitacao.urgencia.charAt(0).toUpperCase() + solicitacao.urgencia.slice(1)}
                  </p>
                </div>
              )}
            </div>

            {solicitacao.detalhes && (
              <div className="mt-4">
                <p className="font-semibold">Detalhes da Solicitação:</p>
                <div className="mt-2 p-3 bg-gray-50 rounded-md whitespace-pre-line">
                  {solicitacao.detalhes}
                </div>
              </div>
            )}
          </section>

          {/* 6. Observações */}
          {solicitacao.observacoes && (
            <section>
              <h3 className="text-lg font-bold mb-2">6. Observações</h3>
              <p className="whitespace-pre-line">{solicitacao.observacoes}</p>
            </section>
          )}
        </div>

        <DialogFooter className="flex flex-wrap justify-between gap-2 mt-6">
          <div className="flex gap-2">
            <Button 
              onClick={() => onChangeStatus(solicitacao.id, 'pendente', solicitacao.tipo)}
              variant={solicitacao.status === 'pendente' ? 'default' : 'outline'}
              disabled={solicitacao.status === 'pendente'}
            >
              Pendente
            </Button>
            <Button 
              onClick={() => onChangeStatus(solicitacao.id, 'em_andamento', solicitacao.tipo)}
              variant={solicitacao.status === 'em_andamento' ? 'default' : 'outline'}
              disabled={solicitacao.status === 'em_andamento'}
            >
              Em andamento
            </Button>
            <Button 
              onClick={() => onChangeStatus(solicitacao.id, 'concluido', solicitacao.tipo)}
              variant={solicitacao.status === 'concluido' ? 'default' : 'outline'}
              disabled={solicitacao.status === 'concluido'}
            >
              Concluído
            </Button>
            <Button 
              onClick={() => onChangeStatus(solicitacao.id, 'cancelado', solicitacao.tipo)}
              variant={solicitacao.status === 'cancelado' ? 'destructive' : 'outline'}
              className={solicitacao.status === 'cancelado' ? '' : 'text-red-500 hover:text-red-700'}
              disabled={solicitacao.status === 'cancelado'}
            >
              Cancelar
            </Button>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Fechar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => generatePDF(solicitacao)}
            >
              Gerar PDF
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SolicitacaoModal;