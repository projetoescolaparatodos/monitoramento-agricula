
import jsPDF from 'jspdf';
import { Solicitacao } from './types';

// Função para adicionar texto com quebra de linha
const adicionarTextoComQuebraLinha = (
  doc: jsPDF, 
  texto: string, 
  x: number, 
  y: number, 
  maxWidth: number
): number => {
  const linhas = doc.splitTextToSize(texto, maxWidth);
  doc.text(linhas, x, y);
  return y + (linhas.length * 7); // 7 é aproximadamente a altura da linha
};

// Função base para geração de PDF que pode ser estendida para cada tipo
export const gerarPdfBase = (
  solicitacao: Solicitacao, 
  titulo: string,
  renderSecoes: (doc: jsPDF, solicitacao: Solicitacao, yPos: number, lineHeight: number) => number
) => {
  const doc = new jsPDF();
  const lineHeight = 7;
  let yPos = 20;

  // Função auxiliar para adicionar seções
  const addSection = (title: string, content: string) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFont(undefined, 'bold');
    doc.text(title, 20, yPos);
    doc.setFont(undefined, 'normal');
    
    if (content) {
      if (content.length > 70) {
        yPos = adicionarTextoComQuebraLinha(doc, content, 20, yPos + lineHeight, 170);
      } else {
        doc.text(content, content.startsWith('- ') ? 20 : 20, yPos + lineHeight);
        yPos += lineHeight;
      }
    } else {
      yPos += lineHeight;
    }
  };

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text(titulo, 105, yPos, { align: 'center' });
  doc.setFontSize(12);
  yPos += 15;

  // Informações básicas
  addSection('Data de Criação:', new Date(solicitacao.criadoEm as any).toLocaleDateString('pt-BR'));
  addSection('Status:', solicitacao.status.charAt(0).toUpperCase() + solicitacao.status.slice(1).replace('_', ' '));
  addSection('Usuário ID:', solicitacao.usuarioId);

  // 1. Dados Pessoais
  yPos += lineHeight;
  addSection('1. DADOS PESSOAIS', '');
  
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
    yPos += lineHeight;
    addSection('2. DADOS DA PROPRIEDADE', '');
    
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
  yPos = renderSecoes(doc, solicitacao, yPos, lineHeight);

  // 3. Serviço Solicitado
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  yPos += lineHeight;
  addSection('3. SERVIÇO SOLICITADO', '');

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
    addSection('Descrição:', '');
    yPos = adicionarTextoComQuebraLinha(doc, solicitacao.descricao || solicitacao.detalhes || '', 30, yPos, 150);
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

  return doc;
};

// Funções específicas para cada tipo de solicitação
export const gerarPdfAgricultura = (solicitacao: Solicitacao) => {
  const renderSecoesAgricultura = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, lineHeight: number) => {
    // Implementar seções específicas de agricultura
    if (solicitacao.dadosAgropecuarios) {
      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('3. DADOS AGROPECUÁRIOS', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      // Agricultura
      if (solicitacao.dadosAgropecuarios.agricultura) {
        doc.text('Agricultura:', 20, yPos);
        yPos += lineHeight;
        
        // Culturas
        if (solicitacao.dadosAgropecuarios.agricultura.culturas) {
          solicitacao.dadosAgropecuarios.agricultura.culturas.forEach(cultura => {
            doc.text(`- ${cultura.nome}: ${cultura.area} ${cultura.unidade}`, 30, yPos);
            yPos += lineHeight;
          });
        }
      }
      
      // Pecuária
      if (solicitacao.dadosAgropecuarios.pecuaria) {
        doc.text('Pecuária:', 20, yPos);
        yPos += lineHeight;
        
        // Bovino
        if (solicitacao.dadosAgropecuarios.pecuaria.bovino) {
          doc.text('Bovino:', 30, yPos);
          yPos += lineHeight;
          
          if (solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade) {
            doc.text(`Quantidade: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.quantidade}`, 40, yPos);
            yPos += lineHeight;
          }
          
          if (solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade) {
            doc.text(`Finalidade: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.finalidade}`, 40, yPos);
            yPos += lineHeight;
          }
          
          if (solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo) {
            doc.text(`Sistema de Manejo: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.sistemaManejo}`, 40, yPos);
            yPos += lineHeight;
          }
          
          if (solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado) {
            doc.text(`Acesso ao Mercado: ${solicitacao.dadosAgropecuarios.pecuaria.bovino.acessoMercado}`, 40, yPos);
            yPos += lineHeight;
          }
        }
      }
    }
    
    // 4. Recursos Disponíveis
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    yPos += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('4. RECURSOS DISPONÍVEIS', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    // Maquinário
    if (solicitacao.maquinario) {
      doc.text('Maquinário disponível:', 20, yPos);
      yPos += lineHeight;

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
      doc.text('Mão de Obra:', 20, yPos);
      yPos += lineHeight;

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
      doc.text('Recursos:', 20, yPos);
      yPos += lineHeight;

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
    
    return yPos;
  };
  
  const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO - AGRICULTURA', renderSecoesAgricultura);
  pdf.save(`solicitacao-agricultura-${solicitacao.id}.pdf`);
};

export const gerarPdfPesca = (solicitacao: Solicitacao) => {
  const renderSecoesPesca = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, lineHeight: number) => {
    // 3. Classificação (para pesca)
    yPos += lineHeight;
    doc.setFont(undefined, 'bold');
    doc.text('3. CLASSIFICAÇÃO', 20, yPos);
    yPos += lineHeight;
    doc.setFont(undefined, 'normal');

    // 3.1 Obras
    if (solicitacao.obras && solicitacao.obras.length > 0) {
      doc.text('3.1 Obras:', 20, yPos);
      yPos += lineHeight;
      
      solicitacao.obras.forEach(obra => {
        doc.text(`- ${obra.tipo}: ${obra.area}${obra.unidade} - ${obra.situacao}`, 25, yPos);
        yPos += lineHeight;
      });
    }

    // 3.2 Espécies
    if (solicitacao.especiesConfinadas && solicitacao.especiesConfinadas.length > 0) {
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

      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('4. DETALHAMENTO', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      doc.text(`Distância da Sede: ${solicitacao.detalhamento.distanciaSede} km`, 20, yPos);
      yPos += lineHeight;
      
      doc.text(`Situação Legal: ${solicitacao.detalhamento.situacaoLegal}`, 20, yPos);
      yPos += lineHeight;
      
      doc.text(`Área Total: ${solicitacao.detalhamento.areaTotal} ha`, 20, yPos);
      yPos += lineHeight;

      // Recursos Hídricos
      if (solicitacao.detalhamento.recursosHidricos && solicitacao.detalhamento.recursosHidricos.length > 0) {
        yPos += lineHeight;
        doc.text('Recursos Hídricos:', 20, yPos);
        yPos += lineHeight;
        
        solicitacao.detalhamento.recursosHidricos.forEach(recurso => {
          doc.text(`- ${recurso.tipo}: ${recurso.nome}`, 25, yPos);
          yPos += lineHeight;
        });
      }

      // Usos da Água
      if (solicitacao.detalhamento.usosAgua && solicitacao.detalhamento.usosAgua.length > 0) {
        yPos += lineHeight;
        doc.text('Usos da Água:', 20, yPos);
        yPos += lineHeight;
        
        solicitacao.detalhamento.usosAgua.forEach(uso => {
          doc.text(`- ${uso}`, 25, yPos);
          yPos += lineHeight;
        });
      }
    }

    // 5. Recursos
    if (solicitacao.recursos) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('5. RECURSOS', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      if (solicitacao.recursos.numeroEmpregados) {
        doc.text(`Número de Empregados: ${solicitacao.recursos.numeroEmpregados}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.recursos.trabalhoFamiliar) {
        doc.text(`Trabalho Familiar: ${solicitacao.recursos.trabalhoFamiliar}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.recursos.recursosFinanceiros) {
        doc.text(`Recursos Financeiros: ${solicitacao.recursos.recursosFinanceiros}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.recursos.fonteFinanciamento) {
        doc.text(`Fonte do Financiamento: ${solicitacao.recursos.fonteFinanciamento}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.recursos.assistenciaTecnica) {
        doc.text(`Assistência Técnica: ${solicitacao.recursos.assistenciaTecnica}`, 20, yPos);
        yPos += lineHeight;
      }
    }
    
    return yPos;
  };
  
  const pdf = gerarPdfBase(solicitacao, 'SOLICITAÇÃO DE SERVIÇO - PESCA', renderSecoesPesca);
  pdf.save(`solicitacao-pesca-${solicitacao.id}.pdf`);
};

export const gerarPdfPaa = (solicitacao: Solicitacao) => {
  const renderSecoesPaa = (doc: jsPDF, solicitacao: Solicitacao, yPos: number, lineHeight: number) => {
    // 3. Produção
    if (solicitacao.producao) {
      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('3. PRODUÇÃO', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      if (solicitacao.producao.produtos && solicitacao.producao.produtos.length > 0) {
        doc.text('Produtos:', 20, yPos);
        yPos += lineHeight;
        
        solicitacao.producao.produtos.forEach(produto => {
          doc.text(`- ${produto.nome}: ${produto.quantidade} ${produto.unidade} - R$ ${produto.valorUnitario}/unidade`, 30, yPos);
          yPos += lineHeight;
        });
      }
      
      if (solicitacao.producao.certificacoes) {
        doc.text(`Certificações: ${solicitacao.producao.certificacoes}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.producao.periodicidade) {
        doc.text(`Periodicidade: ${solicitacao.producao.periodicidade}`, 20, yPos);
        yPos += lineHeight;
      }
    }
    
    // 4. Logística
    if (solicitacao.logistica) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      yPos += lineHeight;
      doc.setFont(undefined, 'bold');
      doc.text('4. LOGÍSTICA', 20, yPos);
      yPos += lineHeight;
      doc.setFont(undefined, 'normal');
      
      if (solicitacao.logistica.meioTransporte) {
        doc.text(`Meio de Transporte: ${solicitacao.logistica.meioTransporte}`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.logistica.distanciaEntrega) {
        doc.text(`Distância de Entrega: ${solicitacao.logistica.distanciaEntrega} km`, 20, yPos);
        yPos += lineHeight;
      }
      
      if (solicitacao.logistica.necessidadesEspeciais) {
        doc.text(`Necessidades Especiais: ${solicitacao.logistica.necessidadesEspeciais}`, 20, yPos);
        yPos += lineHeight;
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
