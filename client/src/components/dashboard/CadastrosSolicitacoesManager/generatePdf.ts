
import jsPDF from 'jspdf';
import { Solicitacao } from './types';

// Função melhorada para adicionar texto com quebra de linha e controle de altura
const adicionarTextoComQuebraLinha = (
  doc: jsPDF, 
  texto: string, 
  x: number, 
  y: number, 
  maxWidth: number
): number => {
  if (!texto) {
    doc.text('---', x, y);
    return y + 7;
  }
  
  const linhas = doc.splitTextToSize(texto, maxWidth);
  doc.text(linhas, x, y);
  return y + (linhas.length * 7) + 3; // 7 altura da linha + 3 espaçamento extra
};

// Função base para geração de PDF melhorada
export const gerarPdfBase = (
  solicitacao: Solicitacao, 
  titulo: string,
  renderSecoes: (doc: jsPDF, solicitacao: Solicitacao, yPos: number, addSection: Function) => number
) => {
  const doc = new jsPDF();
  const lineHeight = 7;
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  // Função auxiliar melhorada para adicionar seções
  const addSection = (title: string, content: string, isTitle = false) => {
    // Verificar se precisa de nova página
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = 20;
    }

    if (isTitle) {
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      yPos = adicionarTextoComQuebraLinha(doc, title, margin, yPos, maxLineWidth);
      yPos += 5; // Espaçamento extra após títulos
      return;
    }

    // Título da seção
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    yPos = adicionarTextoComQuebraLinha(doc, title, margin, yPos, maxLineWidth);
    
    // Conteúdo da seção
    doc.setFont(undefined, 'normal');
    if (content && content.trim()) {
      yPos = adicionarTextoComQuebraLinha(doc, content, margin + 5, yPos, maxLineWidth - 5);
    } else {
      yPos = adicionarTextoComQuebraLinha(doc, 'Não informado', margin + 5, yPos, maxLineWidth - 5);
    }
    yPos += 3; // Espaçamento entre seções
  };

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  yPos = adicionarTextoComQuebraLinha(doc, titulo, margin, yPos, maxLineWidth);
  yPos += 10;

  // Informações básicas
  addSection('Data de Criação:', new Date(solicitacao.criadoEm as any).toLocaleDateString('pt-BR'));
  addSection('Status:', solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1).replace('_', ' '));
  addSection('Usuário ID:', solicitacao.usuarioId);

  // 1. Dados Pessoais
  yPos += 5;
  addSection('1. DADOS PESSOAIS', '', true);
  
  addSection('Nome:', solicitacao.nome || 'Não informado');
  addSection('CPF:', solicitacao.cpf || 'Não informado');
  
  if (solicitacao.identidade) {
    addSection('Identidade:', solicitacao.identidade);
  }
  
  if (solicitacao.telefone) {
    addSection('Telefone:', solicitacao.telefone);
  }
  
  if (solicitacao.email) {
    addSection('Email:', solicitacao.email);
  }
  
  if (solicitacao.endereco) {
    addSection('Endereço:', solicitacao.endereco);
  }
  
  if (solicitacao.travessao) {
    addSection('Travessão:', solicitacao.travessao);
  }

  // 2. Dados da Propriedade
  if (solicitacao.nomePropriedade || solicitacao.enderecoPropriedade || solicitacao.tamanho) {
    yPos += 5;
    addSection('2. DADOS DA PROPRIEDADE', '', true);
    
    if (solicitacao.nomePropriedade) {
      addSection('Nome da Propriedade:', solicitacao.nomePropriedade);
    }
    
    if (solicitacao.enderecoPropriedade) {
      addSection('Endereço da Propriedade:', solicitacao.enderecoPropriedade);
    }
    
    if (solicitacao.tamanho) {
      addSection('Tamanho:', `${solicitacao.tamanho} hectares`);
    }
    
    if (solicitacao.situacaoLegal) {
      addSection('Situação Legal:', solicitacao.situacaoLegal);
    }
    
    if (solicitacao.distanciaMunicipio) {
      addSection('Distância do Município:', `${solicitacao.distanciaMunicipio} km`);
    }
    
    if (solicitacao.userLocation) {
      addSection('Coordenadas GPS:', 
        `Latitude: ${solicitacao.userLocation.latitude.toFixed(6)}, Longitude: ${solicitacao.userLocation.longitude.toFixed(6)}`
      );
    }
  }

  // Renderizar seções específicas para cada tipo
  yPos = renderSecoes(doc, solicitacao, yPos, addSection);

  // 3. Serviço Solicitado
  if (yPos > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    yPos = 20;
  }

  yPos += 5;
  addSection('3. SERVIÇO SOLICITADO', '', true);

  if (solicitacao.servico || solicitacao.tipoServico) {
    addSection('Tipo de Serviço:', solicitacao.servico || solicitacao.tipoServico || 'Não informado');
  }

  if (solicitacao.urgencia) {
    addSection('Nível de Urgência:', solicitacao.urgencia.charAt(0).toUpperCase() + solicitacao.urgencia.slice(1));
  }

  if (solicitacao.periodoDesejado) {
    addSection('Período Desejado:', solicitacao.periodoDesejado);
  }

  if (solicitacao.descricao || solicitacao.detalhes) {
    addSection('Descrição:', solicitacao.descricao || solicitacao.detalhes || '');
  }

  // 4. Observações
  if (solicitacao.observacoes) {
    yPos += 5;
    addSection('4. OBSERVAÇÕES', '', true);
    addSection('Observações:', solicitacao.observacoes);
  }

  // Rodapé
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 40, doc.internal.pageSize.getHeight() - 10);
  }

  return doc;
};

// Funções específicas para cada tipo de solicitação
export const gerarPdfAgricultura = (solicitacao: Solicitacao) => {
  const renderSecoesAgricultura = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, addSection: Function) => {
    // 4. Dados Agropecuários
    if (solicitacao.dadosAgropecuarios) {
      yPos += 5;
      addSection('4. DADOS AGROPECUÁRIOS', '', true);
      
      // Agricultura
      if (solicitacao.dadosAgropecuarios.agricultura) {
        addSection('Agricultura:', '');
        
        // Culturas
        if (solicitacao.dadosAgropecuarios.agricultura.culturas) {
          let culturasText = '';
          solicitacao.dadosAgropecuarios.agricultura.culturas.forEach(cultura => {
            culturasText += `• ${cultura.nome}: ${cultura.area} ${cultura.unidade}\n`;
          });
          addSection('Culturas:', culturasText);
        }
      }
      
      // Pecuária
      if (solicitacao.dadosAgropecuarios.pecuaria?.bovino) {
        addSection('Pecuária - Bovino:', '');
        
        if (solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade) {
          addSection('Quantidade:', solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade);
        }
        
        if (solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade) {
          addSection('Finalidade:', solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade);
        }
        
        if (solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo) {
          addSection('Sistema de Manejo:', solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo);
        }
        
        if (solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado) {
          addSection('Acesso ao Mercado:', solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado);
        }
      }
    }
    
    // 5. Recursos Disponíveis
    if (yPos > doc.internal.pageSize.getHeight() - 60) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 5;
    addSection('5. RECURSOS DISPONÍVEIS', '', true);

    // Maquinário
    if (solicitacao.maquinario) {
      const maquinas = [];
      if (solicitacao.maquinario.trator) maquinas.push('Trator');
      if (solicitacao.maquinario.plantadeira) maquinas.push('Plantadeira');
      if (solicitacao.maquinario.colheitadeira) maquinas.push('Colheitadeira');
      if (solicitacao.maquinario.pulverizador) maquinas.push('Pulverizador');
      if (solicitacao.maquinario.irrigacao) maquinas.push('Sistema de Irrigação');

      if (maquinas.length > 0) {
        addSection('Maquinário disponível:', maquinas.join(', '));
      } else {
        addSection('Maquinário disponível:', 'Nenhum maquinário disponível');
      }
    }

    // Mão de obra
    if (solicitacao.maodeobra) {
      let maoObraText = '';

      if (solicitacao.maodeobra.familiar?.selecionado) {
        maoObraText += `• Familiar: ${solicitacao.maodeobra.familiar.quantidade || '0'} pessoas\n`;
      }

      if (solicitacao.maodeobra.contratada_permanente?.selecionado) {
        maoObraText += `• Contratada Permanente: ${solicitacao.maodeobra.contratada_permanente.quantidade || '0'} pessoas\n`;
      }

      if (solicitacao.maodeobra.contratada_temporaria?.selecionado) {
        maoObraText += `• Contratada Temporária: ${solicitacao.maodeobra.contratada_temporaria.quantidade || '0'} pessoas\n`;
      }

      if (maoObraText) {
        addSection('Mão de Obra:', maoObraText);
      }
    } else if (solicitacao.recursos) {
      // Retro-compatibilidade
      let recursosText = '';

      if (solicitacao.recursos.numeroEmpregados) {
        recursosText += `• Número de Empregados: ${solicitacao.recursos.numeroEmpregados}\n`;
      }

      if (solicitacao.recursos.trabalhoFamiliar) {
        recursosText += `• Trabalho Familiar: ${solicitacao.recursos.trabalhoFamiliar} pessoas\n`;
      }

      if (solicitacao.recursos.recursosFinanceiros) {
        recursosText += `• Recursos Financeiros: ${solicitacao.recursos.recursosFinanceiros}\n`;
      }

      if (solicitacao.recursos.fonteFinanciamento) {
        recursosText += `• Fonte do Financiamento: ${solicitacao.recursos.fonteFinanciamento}\n`;
      }

      if (solicitacao.recursos.assistenciaTecnica) {
        recursosText += `• Assistência Técnica: ${solicitacao.recursos.assistenciaTecnica}\n`;
      }

      if (recursosText) {
        addSection('Recursos:', recursosText);
      }
    }
    
    return yPos;
  };
  
  const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO - AGRICULTURA', renderSecoesAgricultura);
  pdf.save(`solicitacao-agricultura-${solicitacao.id}.pdf`);
};

export const gerarPdfPesca = (solicitacao: Solicitacao) => {
  const renderSecoesPesca = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, addSection: Function) => {
    // 4. Classificação (para pesca)
    yPos += 5;
    addSection('4. CLASSIFICAÇÃO', '', true);

    // 4.1 Obras
    if (solicitacao.obras && solicitacao.obras.length > 0) {
      let obrasText = '';
      solicitacao.obras.forEach(obra => {
        obrasText += `• ${obra.tipo}: ${obra.area}${obra.unidade} - ${obra.situacao}\n`;
      });
      addSection('Obras:', obrasText);
    }

    // 4.2 Espécies
    if (solicitacao.especiesConfinadas && solicitacao.especiesConfinadas.length > 0) {
      let especiesText = '';
      solicitacao.especiesConfinadas.forEach(especie => {
        especiesText += `• ${especie.nome}: ${especie.quantidade} unidades\n`;
      });
      addSection('Espécies Confinadas:', especiesText);
    }

    // 5. Detalhamento
    if (solicitacao.detalhamento) {
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      addSection('5. DETALHAMENTO', '', true);
      
      addSection('Distância da Sede:', `${solicitacao.detalhamento.distanciaSede} km`);
      addSection('Situação Legal:', solicitacao.detalhamento.situacaoLegal);
      addSection('Área Total:', `${solicitacao.detalhamento.areaTotal} ha`);

      // Recursos Hídricos
      if (solicitacao.detalhamento.recursosHidricos && solicitacao.detalhamento.recursosHidricos.length > 0) {
        let recursosText = '';
        solicitacao.detalhamento.recursosHidricos.forEach(recurso => {
          recursosText += `• ${recurso.tipo}: ${recurso.nome}\n`;
        });
        addSection('Recursos Hídricos:', recursosText);
      }

      // Usos da Água
      if (solicitacao.detalhamento.usosAgua && solicitacao.detalhamento.usosAgua.length > 0) {
        let usosText = '';
        solicitacao.detalhamento.usosAgua.forEach(uso => {
          usosText += `• ${uso}\n`;
        });
        addSection('Usos da Água:', usosText);
      }
    }

    // 6. Recursos
    if (solicitacao.recursos) {
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      addSection('6. RECURSOS', '', true);
      
      let recursosText = '';
      
      if (solicitacao.recursos.numeroEmpregados) {
        recursosText += `• Número de Empregados: ${solicitacao.recursos.numeroEmpregados}\n`;
      }
      
      if (solicitacao.recursos.trabalhoFamiliar) {
        recursosText += `• Trabalho Familiar: ${solicitacao.recursos.trabalhoFamiliar}\n`;
      }
      
      if (solicitacao.recursos.recursosFinanceiros) {
        recursosText += `• Recursos Financeiros: ${solicitacao.recursos.recursosFinanceiros}\n`;
      }
      
      if (solicitacao.recursos.fonteFinanciamento) {
        recursosText += `• Fonte do Financiamento: ${solicitacao.recursos.fonteFinanciamento}\n`;
      }
      
      if (solicitacao.recursos.assistenciaTecnica) {
        recursosText += `• Assistência Técnica: ${solicitacao.recursos.assistenciaTecnica}\n`;
      }
      
      if (recursosText) {
        addSection('Recursos:', recursosText);
      }
    }
    
    return yPos;
  };
  
  const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO - PESCA', renderSecoesPesca);
  pdf.save(`solicitacao-pesca-${solicitacao.id}.pdf`);
};

export const gerarPdfPaa = (solicitacao: Solicitacao) => {
  const renderSecoesPaa = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, addSection: Function) => {
    // 4. Produção
    if (solicitacao.producao) {
      yPos += 5;
      addSection('4. PRODUÇÃO', '', true);
      
      if (solicitacao.producao.produtos && solicitacao.producao.produtos.length > 0) {
        let produtosText = '';
        solicitacao.producao.produtos.forEach(produto => {
          produtosText += `• ${produto.nome}: ${produto.quantidade} ${produto.unidade} - R$ ${produto.valorUnitario}/unidade\n`;
        });
        addSection('Produtos:', produtosText);
      }
      
      if (solicitacao.producao.certificacoes) {
        addSection('Certificações:', solicitacao.producao.certificacoes);
      }
      
      if (solicitacao.producao.periodicidade) {
        addSection('Periodicidade:', solicitacao.producao.periodicidade);
      }
    }
    
    // 5. Logística
    if (solicitacao.logistica) {
      if (yPos > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        yPos = 20;
      }

      yPos += 5;
      addSection('5. LOGÍSTICA', '', true);
      
      if (solicitacao.logistica.meioTransporte) {
        addSection('Meio de Transporte:', solicitacao.logistica.meioTransporte);
      }
      
      if (solicitacao.logistica.distanciaEntrega) {
        addSection('Distância de Entrega:', `${solicitacao.logistica.distanciaEntrega} km`);
      }
      
      if (solicitacao.logistica.necessidadesEspeciais) {
        addSection('Necessidades Especiais:', solicitacao.logistica.necessidadesEspeciais);
      }
    }
    
    return yPos;
  };
  
  const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO - PAA', renderSecoesPaa);
  pdf.save(`solicitacao-paa-${solicitacao.id}.pdf`);
};

// Função para identificar tipo e chamar a função correta
export const generatePDF = (solicitacao: Solicitacao) => {
  // Determinar tipo baseado na origem
  if (solicitacao.tipoOrigem.includes('agricultura')) {
    return gerarPdfAgricultura(solicitacao);
  } else if (solicitacao.tipoOrigem.includes('pesca')) {
    return gerarPdfPesca(solicitacao);
  } else if (solicitacao.tipoOrigem.includes('paa')) {
    return gerarPdfPaa(solicitacao);
  } else {
    // Fallback: gerar PDF básico
    const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO', () => 100);
    pdf.save(`solicitacao-${solicitacao.id}.pdf`);
  }
};
