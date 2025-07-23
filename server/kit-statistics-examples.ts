
// Exemplos de configurações de estatísticas dinâmicas para sistema de kits
// Este arquivo serve como referência para configurar estatísticas no DynamicStatsManager

export const kitStatisticsExamples = [
  // Estatística para total de kits distribuídos
  {
    titulo: "Kits Aviários Distribuídos",
    colecaoFonte: "doacoes_evento",
    campo: "quantidade",
    tipoAgregacao: "sum",
    periodo: "mesAtual",
    unidade: "kits",
    filtroAdicional: [
      {
        fieldPath: "insumoId",
        opStr: "==",
        value: "kit-aviario" // ID do kit aviário
      },
      {
        fieldPath: "isKit",
        opStr: "==", 
        value: true
      }
    ]
  },

  // Estatística para pintainhos distribuídos (componente do kit)
  {
    titulo: "Pintainhos Distribuídos",
    colecaoFonte: "doacoes_evento", 
    campo: "quantidade",
    tipoAgregacao: "sum",
    periodo: "mesAtual",
    unidade: "unidades",
    filtroAdicional: [
      {
        fieldPath: "insumoId",
        opStr: "==",
        value: "pintainhos" // ID do insumo pintainhos
      }
    ]
  },

  // Estatística para ração distribuída (componente do kit)
  {
    titulo: "Ração Distribuída",
    colecaoFonte: "doacoes_evento",
    campo: "quantidade", 
    tipoAgregacao: "sum",
    periodo: "mesAtual",
    unidade: "kg",
    filtroAdicional: [
      {
        fieldPath: "insumoId",
        opStr: "==",
        value: "racao-aves" // ID do insumo ração
      }
    ]
  },

  // Estatística para pintainhos vindos especificamente de kits
  {
    titulo: "Pintainhos de Kits",
    colecaoFonte: "doacoes_evento",
    campo: "quantidade",
    tipoAgregacao: "sum", 
    periodo: "mesAtual",
    unidade: "unidades",
    filtroAdicional: [
      {
        fieldPath: "insumoId",
        opStr: "==",
        value: "pintainhos"
      },
      {
        fieldPath: "isFromKit",
        opStr: "==",
        value: true
      }
    ]
  },

  // Estatística para beneficiários únicos de kits
  {
    titulo: "Famílias Beneficiadas com Kits",
    colecaoFonte: "doacoes_evento",
    campo: "beneficiario.nome",
    tipoAgregacao: "count",
    periodo: "mesAtual", 
    unidade: "famílias",
    filtroAdicional: [
      {
        fieldPath: "isKit",
        opStr: "==",
        value: true
      }
    ]
  },

  // Estatística para quantidade média de kits por beneficiário
  {
    titulo: "Média de Kits por Família",
    colecaoFonte: "doacoes_evento",
    campo: "quantidade",
    tipoAgregacao: "avg",
    periodo: "mesAtual",
    unidade: "kits/família",
    filtroAdicional: [
      {
        fieldPath: "isKit", 
        opStr: "==",
        value: true
      }
    ]
  }
];

// Função utilitária para criar configurações de estatísticas para qualquer kit
export function createKitStatisticConfig(
  kitId: string,
  kitNome: string,
  periodo: string = "mesAtual"
) {
  return {
    titulo: `${kitNome} Distribuídos`,
    colecaoFonte: "doacoes_evento",
    campo: "quantidade", 
    tipoAgregacao: "sum",
    periodo,
    unidade: "kits",
    filtroAdicional: [
      {
        fieldPath: "insumoId",
        opStr: "==",
        value: kitId
      },
      {
        fieldPath: "isKit",
        opStr: "==",
        value: true
      }
    ]
  };
}

// Função utilitária para criar configurações de estatísticas para componentes de kit
export function createKitComponentStatisticConfig(
  componenteId: string,
  componenteNome: string,
  unidade: string,
  periodo: string = "mesAtual",
  apenasDeKits: boolean = false
) {
  const filtros = [
    {
      fieldPath: "insumoId",
      opStr: "==",
      value: componenteId
    }
  ];

  if (apenasDeKits) {
    filtros.push({
      fieldPath: "isFromKit",
      opStr: "==", 
      value: true
    });
  }

  return {
    titulo: apenasDeKits ? `${componenteNome} de Kits` : `${componenteNome} Total`,
    colecaoFonte: "doacoes_evento",
    campo: "quantidade",
    tipoAgregacao: "sum",
    periodo,
    unidade,
    filtroAdicional: filtros
  };
}
