// client/src/components/common/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, ArrowLeft, MapPin } from "lucide-react";
import { db } from "@/utils/firebase";
import LocationMap from "./LocationMap";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SuggestionButton {
  text: string;
  action: string;
}

// Interface para dados de piscicultura
interface DadosPiscicultura {
  empreendedor: {
    nome: string;
    endereco: string;
    travessao: string;
    cpf: string;
    rg: string;
    orgaoEmissor: string;
    sexo: string;
    celular: string;
  };
  atividade: {
    descricao: string;
    endereco: string;
    coordenadas?: {
      latitude: number;
      longitude: number;
    };
    estruturaAquicola: string[];
  };
  obras: {
    canalIgarape?: {
      area: number;
      situacao: string;
    };
    viveiroEscavado?: {
      area: number;
      situacao: string;
    };
    barragem?: {
      area: number;
      situacao: string;
    };
    viveiroSuspenso?: {
      area: number;
      situacao: string;
    };
  };
  especies: {
    tambaqui?: number;
    tambatinga?: number;
    matrinxa?: number;
    curimata?: number;
    pirarucu?: number;
    tilapia?: number;
  };
  detalhamento: {
    distanciaSede: number;
    referencia: string;
    situacaoLegal: string;
    outraSituacao?: string;
    areaTotal: number;
    recursosHidricos: {
      tipo: string[];
      nomes: Record<string, string>;
    };
    usosAgua: string[];
  };
  recursos: {
    numEmpregados: number;
    numFamiliares: number;
    recursosFinanceiros: string;
    fonteFinanciamento?: string;
    assistenciaTecnica: string;
  };
  observacoes?: string;
}

// Estrutura completa para dados agropecuários
interface DadosAgropecuarios {
  cacau: {
    cultiva: boolean;
    quantidade?: number;
    safreiro?: boolean;
    idade?: string;
    sementeCeplac?: boolean;
    producaoAnual?: number;
    clonado?: boolean;
    detalhesClonado?: {
      quantidade?: number;
      safreiro?: boolean;
      idade?: string;
      producaoAnual?: number;
      materialClonal?: string[];
    };
  };
  frutiferas: {
    cultiva: boolean;
    tipos?: string[];
    destino?: string[];
    producaoKg?: number;
    precoMedio?: number;
  };
  lavourasAnuais: {
    cultiva: boolean;
    milho?: {
      produz: boolean;
      finalidade?: string[];
      destino?: string[];
      producaoKg?: number;
      areaPlantada?: number;
    };
  };
  mandioca: {
    produz: boolean;
    tipo?: string;
    finalidade?: string[];
    subprodutos?: string[];
    areaCultivada?: number;
    plantioMecanizado?: boolean;
  };
  arrozFeijao: {
    produz: boolean;
    culturas?: string[];
    producaoAnual?: number;
    areaPlantada?: number;
    destino?: string[];
  };
  hortalicas: {
    produz: boolean;
    cultivos?: string[];
    producaoAnual?: number;
    destino?: string[];
  };
  tuberosas: {
    produz: boolean;
    cultivos?: string[];
    producaoAnual?: number;
    destino?: string[];
  };
  bovinos: {
    cria: boolean;
    quantidade?: number;
    gadoLeite?: boolean;
    fasePredominante?: string;
    sistemaManejo?: string;
    acessoMercado?: string;
  };
  caprinosOvinos: {
    cria: boolean;
    quantidade?: number;
    finalidade?: string[];
    destino?: string[];
  };
  suinos: {
    cria: boolean;
    quantidade?: number;
    finalidade?: string[];
    destino?: string[];
  };
  aves: {
    cria: boolean;
    tipoCriacao?: string[];
    quantidade?: number;
    destino?: string[];
  };
}

// Fluxos de perguntas para cada seção agropecuária
const cacauQuestions = [
  "Quantos pés de cacau você cultiva?",
  "É safreiro? (Sim/Não)",
  "Qual a idade do plantio?",
  "Utiliza sementes CEPLAC? (Sim/Não)",
  "Qual a produção anual em KG?",
  "Possui plantio de cacau clonado? (Sim/Não)",
];

const cacauClonadoQuestions = [
  "Qual a quantidade de pés clonados?",
  "É safreiro? (Sim/Não)",
  "Qual a idade do plantio clonado?",
  "Qual a produção anual dos clonados em KG?",
  "Qual o Material Clonal da Lavoura? (CCN51, 8N34, CEPEC 2002, PS1319, PH16, CASCA FINA, PARAZINHO, OUTROS)",
];

const frutiferasQuestions = [
  "Quais frutas você cultiva? (Digite os nomes separados por vírgula: laranja, limão, tangerina, cupuaçu, maracujá, mamão, açaí, goiaba, graviola, acerola)",
  "Qual o destino da produção? (Consumo/Venda/Doação - pode escolher mais de um, separados por vírgula)",
  "Qual a produção total em KG por ano?",
  "Qual o preço médio por KG (R$)?",
];

const lavourasAnuaisQuestions = [
  "Produz milho? (Sim/Não)",
  "Qual a finalidade? (Milho Verde/Grão/Silagem - pode escolher mais de um, separados por vírgula)",
  "Qual o destino da produção? (Venda/Uso na Propriedade - pode escolher mais de um, separados por vírgula)",
  "Qual a produção em KG?",
  "Qual a área plantada em hectares (ha)?",
];

const mandiocaQuestions = [
  "Qual o tipo de mandioca? (Brava/Mansa)",
  "Qual a finalidade? (Consumo/Ração Animal - pode escolher mais de um, separados por vírgula)",
  "Produz subprodutos? (Goma/Tucupi/Farinha - pode escolher mais de um, separados por vírgula)",
  "Qual a área cultivada em hectares (ha)?",
  "A área de plantio é mecanizada? (Sim/Não)",
];

const arrozFeijaoQuestions = [
  "Qual cultura você produz? (Arroz/Feijão/Ambos)",
  "Qual a produção anual em KG?",
  "Qual a área plantada em hectares (ha)?",
  "Qual o destino da produção? (Consumo próprio/Comercialização - pode escolher mais de um, separados por vírgula)",
];

const hortalicasQuestions = [
  "Quais hortaliças você cultiva? (Digite separadas por vírgula: alface, tomate, cebola, cenoura, beterraba, etc.)",
  "Qual a produção anual em KG?",
  "Qual o destino da produção? (Consumo próprio/Comercialização - pode escolher mais de um, separados por vírgula)",
];

const tuberosasQuestions = [
  "Quais tuberosas você cultiva? (Digite separadas por vírgula: batata doce, mandioquinha, cará-roxo, etc.)",
  "Qual a produção anual em KG?",
  "Qual o destino da produção? (Consumo próprio/Comercialização - pode escolher mais de um, separados por vírgula)",
];

const bovinoQuestions = [
  "Quantos animais tem no rebanho?",
  "É gado de leite? (Sim/Não)",
  "Qual a fase predominante? (Cria/Recria/Engorda)",
  "Qual o sistema de manejo? (Pastejo Contínuo/Confinamento/Rotacionado)",
  "Como acessa o mercado? (Cooperado/Independente)",
];

const caprinosOvinosQuestions = [
  "Qual a quantidade de animais?",
  "Qual a finalidade? (Leite/Carne - pode escolher mais de um, separados por vírgula)",
  "Qual o destino da produção? (Consumo próprio/Venda - pode escolher mais de um, separados por vírgula)",
];

const suinosQuestions = [
  "Qual a quantidade de animais?",
  "Qual a finalidade? (Engorda/Reprodução - pode escolher mais de um, separados por vírgula)",
  "Qual o destino da produção? (Consumo próprio/Venda - pode escolher mais de um, separados por vírgula)",
];

const avesQuestions = [
  "Qual o tipo de criação? (Poedeira/Corte - pode escolher mais de um, separados por vírgula)",
  "Qual a quantidade de aves?",
  "Qual o destino da produção? (Consumo próprio/Venda - pode escolher mais de um, separados por vírgula)",
];

// Fluxo de perguntas principais que levam aos subfluxos
const principaisQuestoesAgropecuarias = [
  "Você cultiva cacau? (Sim/Não)",
  "Você cultiva frutíferas perenes (laranja, açaí, cupuaçu, etc.)? (Sim/Não)",
  "Você cultiva lavouras anuais (milho, etc.)? (Sim/Não)",
  "Você produz mandioca/macaxeira? (Sim/Não)",
  "Você produz arroz ou feijão? (Sim/Não)",
  "Você produz oleícolas (hortaliças)? (Sim/Não)",
  "Você produz tuberosas (batata doce, mandioquinha, cará-roxo)? (Sim/Não)",
  "Você cria bovinos? (Sim/Não)",
  "Você cria caprinos ou ovinos? (Sim/Não)",
  "Você cria suínos? (Sim/Não)",
  "Você cria aves? (Sim/Não)",
];

// Fluxo completo de cadastro principal (outras perguntas do formulário)
const cadastroFluxo = [
  // Dados da Propriedade
  "Qual o nome da propriedade?",
  "A propriedade é pessoa Física ou Jurídica?",
  "Qual o endereço da propriedade?",
  "Qual o tamanho da propriedade em hectares (ha)?",
  "A propriedade é escriturada? (Sim/Não)",
  "Possui DAP/CAF? (Sim/Não)",
  "Possui CAR? (Sim/Não)",
  "Possui Financiamento Rural? (Sim/Não)",
  "Qual a coordenada S da propriedade? (aproximada)",
  "Qual a coordenada W da propriedade? (aproximada)",

  // Dados do Proprietário
  "Qual seu nome completo?",
  "Qual seu CPF?",
  "Qual seu RG?",
  "Qual o órgão emissor e UF do RG?",
  "Qual seu sexo?",
  "Qual sua data de nascimento?",
  "Qual sua naturalidade?",
  "Qual o nome da sua mãe?",
  "Qual sua escolaridade?",
  "Qual seu telefone para contato?",
  "É associado a alguma instituição? Se sim, qual?",
];

// Arrays de perguntas para piscicultura
const pisciculturaEmpreendedorQuestions = [
  "Qual o seu nome completo?",
  "Qual o seu endereço?",
  "Qual o nome do travessão?",
  "Qual o seu CPF? (formato: 000.000.000-00)",
  "Qual o seu RG?",
  "Qual o Órgão Emissor/UF do RG?",
  "Qual o seu sexo?",
  "Qual o seu número de celular para contato? (formato: (00) 00000-0000)",
];

const pisciculturaAtividadeQuestions = [
  "Qual atividade é desenvolvida na propriedade?",
  "Qual o endereço do local da atividade?",
  // A pergunta de localização será tratada separadamente
];

const pisciculturaEstruturaQuestions = [
  "Quais estruturas aquícolas existem na propriedade? (selecione todas aplicáveis)",
];

const pisciculturaObrasQuestions = {
  canalIgarape: [
    "Qual a área em m² do Canal de Igarapé?",
    "Qual a situação da obra do Canal de Igarapé?",
  ],
  viveiroEscavado: [
    "Qual a área em ha do Viveiro Escavado?",
    "Qual a situação da obra do Viveiro Escavado?",
  ],
  barragem: [
    "Qual a área em m² da Barragem?",
    "Qual a situação da obra da Barragem?",
  ],
  viveiroSuspenso: [
    "Qual a área em m² do Viveiro Suspenso?",
    "Qual a situação da obra do Viveiro Suspenso?",
  ],
};

const pisciculturaEspeciesQuestions = [
  "Quais espécies são confinadas na propriedade? (selecione todas aplicáveis)",
];

const pisciculturaEspeciesQuantidadeQuestions = {
  tambaqui: "Qual a quantidade de Tambaqui?",
  tambatinga: "Qual a quantidade de Tambatinga?",
  matrinxa: "Qual a quantidade de Matrinxã?",
  curimata: "Qual a quantidade de Curimatã?",
  pirarucu: "Qual a quantidade de Pirarucu?",
  tilapia: "Qual a quantidade de Tilápia?",
};

const pisciculturaDetalhamentoQuestions = [
  "Qual a distância da sede municipal (em Km)?",
  "Qual a referência de localização?",
  "Qual a situação legal da propriedade?",
  "Qual a área total da propriedade (em ha)?",
  "Quais recursos hídricos existem na propriedade? (selecione todos aplicáveis)",
  "Quais são os usos múltiplos da água na propriedade? (selecione todos aplicáveis)",
];

const pisciculturaRecursosQuestions = [
  "Qual o número de empregados?",
  "Qual o número de pessoas da família que trabalham na propriedade?",
  "Quais os recursos financeiros utilizados?",
  "Há assistência técnica por profissional habilitado?",
];

// Botões de sugestão iniciais
const initialSuggestions: SuggestionButton[] = [
  { text: "Fazer cadastro rural", action: "cadastro" },
  { text: "Cadastro de Piscicultura", action: "piscicultura" },
  { text: "Informações de Agricultura", action: "agricultura" },
  { text: "Serviços de Pesca", action: "pesca" },
  { text: "Programa PAA", action: "paa" },
];

// Lista de opções de serviços para solicitação
const servicosSugestoes: SuggestionButton[] = [
  { text: "Assistência técnica", action: "Assistência técnica" },
  { text: "Mecanização agrícola", action: "Mecanização agrícola" },
  { text: "Análise de solo", action: "Análise de solo" },
  { text: "Distribuição de mudas", action: "Distribuição de mudas" },
  { text: "Capacitação", action: "Capacitação" },
  { text: "Outro serviço", action: "Outro serviço" },
];

interface UserLocation {
  latitude: number;
  longitude: number;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cadastroEtapa, setCadastroEtapa] = useState(-1);
  const [cadastroRespostas, setCadastroRespostas] = useState<string[]>([]);
  const [suggestions, setSuggestions] =
    useState<SuggestionButton[]>(initialSuggestions);
  const [subFluxo, setSubFluxo] = useState<string | null>(null);
  const [subFluxoEtapa, setSubFluxoEtapa] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<
    | "inicio"
    | "cadastro"
    | "servico"
    | "resumo"
    | "agropecuaria"
    | "solicitacao"
    | "localizacao"
    | "piscicultura"
  >("inicio");
  const [servicoAtual, setServicoAtual] = useState<string>("");
  const [usuarioCadastrado, setUsuarioCadastrado] = useState<boolean | null>(
    null,
  );
  const [indexQuestaoAgropecuaria, setIndexQuestaoAgropecuaria] =
    useState<number>(0);
  const [solicitacao, setSolicitacao] = useState<string>("");
  const [pisciculturaEtapa, setPisciculturaEtapa] = useState<number>(0);
  const [pisciculturaSecao, setPisciculturaSecao] = useState<
    | "empreendedor"
    | "atividade"
    | "estrutura"
    | "obras"
    | "especies"
    | "detalhamento"
    | "recursos"
    | "observacoes"
  >("empreendedor");
  const [obrasSelecionadas, setObrasSelecionadas] = useState<string[]>([]);
  const [especiesSelecionadas, setEspeciesSelecionadas] = useState<string[]>(
    [],
  );
  const [recursosHidricosSelecionados, setRecursosHidricosSelecionados] =
    useState<string[]>([]);
  const [dadosPiscicultura, setDadosPiscicultura] = useState<DadosPiscicultura>(
    {
      empreendedor: {
        nome: "",
        endereco: "",
        travessao: "",
        cpf: "",
        rg: "",
        orgaoEmissor: "",
        sexo: "",
        celular: "",
      },
      atividade: {
        descricao: "",
        endereco: "",
        estruturaAquicola: [],
      },
      obras: {},
      especies: {},
      detalhamento: {
        distanciaSede: 0,
        referencia: "",
        situacaoLegal: "",
        areaTotal: 0,
        recursosHidricos: {
          tipo: [],
          nomes: {},
        },
        usosAgua: [],
      },
      recursos: {
        numEmpregados: 0,
        numFamiliares: 0,
        recursosFinanceiros: "",
        assistenciaTecnica: "",
      },
    },
  );
  const [dadosAgropecuarios, setDadosAgropecuarios] =
    useState<DadosAgropecuarios>({
      cacau: { cultiva: false },
      frutiferas: { cultiva: false },
      lavourasAnuais: { cultiva: false },
      mandioca: { produz: false },
      arrozFeijao: { produz: false },
      hortalicas: { produz: false },
      tuberosas: { produz: false },
      bovinos: { cria: false },
      caprinosOvinos: { cria: false },
      suinos: { cria: false },
      aves: { cria: false },
    });
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAskingLocation, setIsAskingLocation] = useState<boolean>(false);
  const [skipLocationQuestions, setSkipLocationQuestions] =
    useState<boolean>(false);

  // Efeitos
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Olá! Sou o assistente da Secretaria de Agricultura. Como posso ajudar você hoje? Selecione uma opção ou digite sua mensagem.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setSuggestions(initialSuggestions);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Atualizar sugestões imediatamente após mudar de modo ou etapa
    setSuggestions(getContextualSuggestions());
  }, [modo, cadastroEtapa, subFluxo, subFluxoEtapa, usuarioCadastrado]);

  // Funções auxiliares
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getUserLocation = () => {
    setIsAskingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsAskingLocation(false);

          // Após obter a localização com sucesso, continuar o fluxo automaticamente
          // Isto será processado no useEffect que observa mudanças em userLocation
          console.log("Localização obtida com sucesso:", position.coords);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setIsAskingLocation(false);

          let errorMessage = "Não foi possível obter sua localização.";

          // Mensagens de erro mais específicas baseadas no código de erro
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Permissão para obter localização foi negada. Por favor, permita o acesso à sua localização e tente novamente.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                "As informações de localização não estão disponíveis no momento.";
              break;
            case error.TIMEOUT:
              errorMessage =
                "A solicitação para obter sua localização expirou.";
              break;
          }

          addMessage(errorMessage, false);

          // Perguntar se quer tentar novamente ou prosseguir sem localização
          addMessage(
            "Deseja tentar novamente ou prosseguir sem informações de localização?",
            false,
          );
          setSuggestions([
            { text: "Tentar novamente", action: "tentar novamente" },
            { text: "Prosseguir sem localização", action: "prosseguir" },
          ]);
        },
        // Opções para a API de geolocalização
        {
          enableHighAccuracy: true, // Alta precisão
          timeout: 10000, // 10 segundos de timeout
          maximumAge: 0, // Não usar cache
        },
      );
    } else {
      console.error("Geolocation não suportado.");
      setIsAskingLocation(false);
      addMessage(
        "Geolocation não é suportado pelo seu navegador. Vamos prosseguir sem informações de localização.",
        false,
      );

      // Continuar o fluxo sem localização
      if (pisciculturaSecao === "atividade") {
        setModo("piscicultura");
        setPisciculturaSecao("estrutura");
        setPisciculturaEtapa(0);
        addMessage(pisciculturaEstruturaQuestions[0], false);
        setSuggestions([
          { text: "Viveiro", action: "Viveiro" },
          { text: "Tanque-rede", action: "Tanque-rede" },
          { text: "Barragem", action: "Barragem" },
          { text: "Canal", action: "Canal" },
          { text: "Represa", action: "Represa" },
        ]);
      }
    }
  };

  const getContextualSuggestions = (): SuggestionButton[] => {
    // Modo solicitação
    if (modo === "solicitacao") {
      return servicosSugestoes;
    }
    // Modo piscicultura - sugestões específicas para cada seção
    else if (modo === "piscicultura") {
      if (pisciculturaSecao === "empreendedor") {
        if (pisciculturaEtapa === 6) {
          // Pergunta sobre sexo
          return [
            { text: "Masculino", action: "Masculino" },
            { text: "Feminino", action: "Feminino" },
            { text: "Prefiro não informar", action: "Prefiro não informar" },
          ];
        }
      } else if (pisciculturaSecao === "estrutura") {
        return [
          { text: "Viveiro", action: "Viveiro" },
          { text: "Tanque-rede", action: "Tanque-rede" },
          { text: "Barragem", action: "Barragem" },
          { text: "Canal", action: "Canal" },
          { text: "Represa", action: "Represa" },
        ];
      } else if (pisciculturaSecao === "obras") {
        if (pisciculturaEtapa === 0) {
          return [
            { text: "Canal de Igarapé", action: "Canal de Igarapé" },
            { text: "Viveiro Escavado", action: "Viveiro Escavado" },
            { text: "Barragem", action: "Barragem" },
            { text: "Viveiro Suspenso", action: "Viveiro Suspenso" },
            { text: "Nenhuma das anteriores", action: "Nenhuma" },
          ];
        } else if (pisciculturaEtapa % 2 === 0) {
          // Perguntas sobre situação da obra
          return [
            { text: "Construído", action: "Construído" },
            { text: "Em construção", action: "Em construção" },
            { text: "Planejado", action: "Planejado" },
          ];
        }
      } else if (pisciculturaSecao === "especies") {
        if (pisciculturaEtapa === 0) {
          return [
            { text: "Tambaqui", action: "Tambaqui" },
            { text: "Tambatinga", action: "Tambatinga" },
            { text: "Matrinxã", action: "Matrinxã" },
            { text: "Curimatã", action: "Curimatã" },
            { text: "Pirarucu", action: "Pirarucu" },
            { text: "Tilápia", action: "Tilápia" },
          ];
        }
      } else if (pisciculturaSecao === "detalhamento") {
        if (pisciculturaEtapa === 2) {
          // Situação legal
          return [
            { text: "Regularizada", action: "Regularizada" },
            { text: "Arrendada", action: "Arrendada" },
            { text: "Cedida", action: "Cedida" },
            { text: "Posse", action: "Posse" },
            { text: "Outra", action: "Outra" },
          ];
        } else if (pisciculturaEtapa === 4) {
          // Recursos hídricos
          return [
            { text: "Igarapé", action: "Igarapé" },
            { text: "Rio", action: "Rio" },
            { text: "Lago", action: "Lago" },
            { text: "Poço", action: "Poço" },
            { text: "Nascente", action: "Nascente" },
            { text: "Nenhum", action: "Nenhum" },
          ];
        } else if (
          pisciculturaEtapa === 5 &&
          recursosHidricosSelecionados.length === 0
        ) {
          // Usos da água
          return [
            { text: "Aquicultura", action: "Aquicultura" },
            { text: "Irrigação", action: "Irrigação" },
            { text: "Abastecimento Público", action: "Abastecimento Público" },
            { text: "Lazer", action: "Lazer" },
            { text: "Dessedentação Animal", action: "Dessedentação Animal" },
          ];
        }
      } else if (pisciculturaSecao === "recursos") {
        if (pisciculturaEtapa === 2) {
          // Recursos financeiros
          return [
            { text: "Próprios", action: "Próprios" },
            { text: "Financiamento", action: "Financiamento" },
            { text: "Misto", action: "Próprios e Financiamento" },
          ];
        } else if (
          pisciculturaEtapa === 3 &&
          dadosPiscicultura.recursos.recursosFinanceiros
            .toLowerCase()
            .includes("financiamento")
        ) {
          return [
            { text: "Banco da Amazônia", action: "Banco da Amazônia" },
            { text: "Banco do Brasil", action: "Banco do Brasil" },
            { text: "Caixa Econômica", action: "Caixa Econômica" },
            { text: "Outro", action: "Outro" },
          ];
        } else if (
          (pisciculturaEtapa === 3 &&
            !dadosPiscicultura.recursos.recursosFinanceiros
              .toLowerCase()
              .includes("financiamento")) ||
          pisciculturaEtapa === 4
        ) {
          return [
            { text: "Sim", action: "Sim" },
            { text: "Não", action: "Não" },
            { text: "Eventual", action: "Eventual" },
          ];
        }
      } else if (pisciculturaSecao === "observacoes") {
        return [{ text: "Não", action: "Não" }];
      } else if (pisciculturaSecao === "resumo") {
        return [
          { text: "Confirmar", action: "confirmar" },
          { text: "Cancelar", action: "cancelar" },
        ];
      }
      return [];
    }
    // Modo agropecuária - sugestões específicas para cada seção
    else if (modo === "agropecuaria") {
      if (subFluxo === "cacau") {
        // Verifica se está nas perguntas do cacau clonado
        if (
          dadosAgropecuarios.cacau.clonado &&
          subFluxoEtapa >= cacauQuestions.length
        ) {
          const etapaClonado = subFluxoEtapa - cacauQuestions.length;

          if (etapaClonado === 1 || etapaClonado === 3) {
            // Safreiro ou confirmação
            return [
              { text: "Sim", action: "sim" },
              { text: "Não", action: "não" },
            ];
          } else if (etapaClonado === 4) {
            // Material Clonal
            return [
              { text: "CCN51", action: "CCN51" },
              { text: "8N34", action: "8N34" },
              { text: "CEPEC 2002", action: "CEPEC 2002" },
              { text: "PS1319", action: "PS1319" },
              { text: "PH16", action: "PH16" },
              { text: "CASCA FINA", action: "CASCA FINA" },
              { text: "PARAZINHO", action: "PARAZINHO" },
              { text: "OUTROS", action: "OUTROS" },
            ];
          }
        } else if (
          subFluxoEtapa === 1 ||
          subFluxoEtapa === 3 ||
          subFluxoEtapa === 5
        ) {
          // Questões de sim/não no fluxo principal do cacau
          return [
            { text: "Sim", action: "sim" },
            { text: "Não", action: "não" },
          ];
        }
      } else if (subFluxo === "frutiferas") {
        if (subFluxoEtapa === 1) {
          return [
            { text: "Consumo", action: "Consumo" },
            { text: "Venda", action: "Venda" },
            { text: "Doação", action: "Doação" },
            { text: "Consumo e Venda", action: "Consumo, Venda" },
          ];
        }
      } else if (subFluxo === "mandioca") {
        if (subFluxoEtapa === 0) {
          return [
            { text: "Brava", action: "Brava" },
            { text: "Mansa", action: "Mansa" },
          ];
        } else if (subFluxoEtapa === 1) {
          return [
            { text: "Consumo", action: "Consumo" },
            { text: "Ração Animal", action: "Ração Animal" },
            { text: "Ambos", action: "Consumo, Ração Animal" },
          ];
        } else if (subFluxoEtapa === 2) {
          return [
            { text: "Goma", action: "Goma" },
            { text: "Tucupi", action: "Tucupi" },
            { text: "Farinha", action: "Farinha" },
            { text: "Goma e Farinha", action: "Goma, Farinha" },
            { text: "Nenhum", action: "Nenhum" },
          ];
        } else if (subFluxoEtapa === 4) {
          return [
            { text: "Sim", action: "sim" },
            { text: "Não", action: "não" },
          ];
        }
      } else if (subFluxo === "bovinos") {
        if (subFluxoEtapa === 1) {
          return [
            { text: "Sim", action: "sim" },
            { text: "Não", action: "não" },
          ];
        } else if (subFluxoEtapa === 2) {
          return [
            { text: "Cria", action: "Cria" },
            { text: "Recria", action: "Recria" },
            { text: "Engorda", action: "Engorda" },
          ];
        } else if (subFluxoEtapa === 3) {
          return [
            { text: "Pastejo Contínuo", action: "Pastejo Contínuo" },
            { text: "Confinamento", action: "Confinamento" },
            { text: "Rotacionado", action: "Rotacionado" },
          ];
} else if (subFluxoEtapa === 4) {
          return [
            { text: "Cooperado", action: "Cooperado" },
            { text: "Independente", action: "Independente" },
          ];
        }
      } else if (subFluxo === null) {
        // Questões principais de agropecuária (sim/não)
        return [
          { text: "Sim", action: "sim" },
          { text: "Não", action: "não" },
        ];
      }

      // Default para subfluxos sem opções específicas
      return [];
    }
    // Sugestões para o fluxo principal de cadastro
    else if (modo === "cadastro" && cadastroEtapa >= 0) {
      switch (cadastroEtapa) {
        case 1:
          return [
            { text: "Física", action: "Física" },
            { text: "Jurídica", action: "Jurídica" },
          ];
        case 4:
        case 5:
        case 6:
        case 7:
          return [
            { text: "Sim", action: "sim" },
            { text: "Não", action: "não" },
          ];
        case 14:
          return [
            { text: "Masculino", action: "masculino" },
            { text: "Feminino", action: "feminino" },
          ];
        case 18:
          return [
            { text: "Analfabeto", action: "analfabeto" },
            {
              text: "Fundamental Incompleto",
              action: "fundamental incompleto",
            },
            { text: "Fundamental Completo", action: "fundamental completo" },
            { text: "Médio Incompleto", action: "médio incompleto" },
            { text: "Médio Completo", action: "médio completo" },
            { text: "Superior", action: "superior" },
          ];
        default:
          return [];
      }
    } else if (modo === "inicio") {
      return initialSuggestions;
    } else if (modo === "resumo") {
      return [
        { text: "Confirmar cadastro", action: "confirmar" },
        { text: "Editar informações", action: "editar" },
        { text: "Cancelar", action: "cancelar" },
      ];
    } else if (modo === "servico") {
      if (usuarioCadastrado === null) {
        return [
          { text: "Sim", action: "sim" },
          { text: "Não", action: "não" },
        ];
      } else if (usuarioCadastrado === true) {
        if (cadastroRespostas.length < 3) {
          // Ainda coletando dados básicos do usuário cadastrado
          return [];
        } else {
          // Usuário já identificado
          return servicosSugestoes;
        }
      } else {
        // Usuário não cadastrado, começando cadastro
        return [];
      }
    }

    return [];
  };

  const validateField = (etapa: number, resposta: string): boolean => {
    // Campos que devem ser numéricos no cadastro principal
    const numericFields = [3, 8, 9];
    if (numericFields.includes(etapa)) {
      return !isNaN(Number(resposta));
    }
    return true;
  };

  const addMessage = (text: string, isUser: boolean) => {
    setMessages((prev) => [
      ...prev,
      {
        text,
        isUser,
        timestamp: new Date(),
      },
    ]);
  };

  // Processa resposta para módulo específico de agropecuária
  const processarRespostaAgropecuaria = (resposta: string): string => {
    let proximaPergunta = "";

    // Se não há subfluxo, estamos nas perguntas principais
    if (subFluxo === null) {
      // Processar a resposta atual
      const respostaLower = resposta.toLowerCase();
      const atual = indexQuestaoAgropecuaria;

      // Atualizar os dados com base na pergunta atual
      if (atual === 0) {
        // Cacau
        const novosDados = { ...dadosAgropecuarios };
        novosDados.cacau.cultiva = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        // Se resposta for sim, iniciar subfluxo específico
        if (respostaLower === "sim") {
          setSubFluxo("cacau");
          setSubFluxoEtapa(0);
          proximaPergunta = cacauQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 1) {
        // Frutíferas
        const novosDados = { ...dadosAgropecuarios };
        novosDados.frutiferas.cultiva = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("frutiferas");
          setSubFluxoEtapa(0);
          proximaPergunta = frutiferasQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 2) {
        // Lavouras anuais
        const novosDados = { ...dadosAgropecuarios };
        novosDados.lavourasAnuais.cultiva = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("lavourasAnuais");
          setSubFluxoEtapa(0);
          proximaPergunta = lavourasAnuaisQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 3) {
        // Mandioca
        const novosDados = { ...dadosAgropecuarios };
        novosDados.mandioca.produz = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("mandioca");
          setSubFluxoEtapa(0);
          proximaPergunta = mandiocaQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 4) {
        // Arroz/Feijão
        const novosDados = { ...dadosAgropecuarios };
        novosDados.arrozFeijao.produz = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("arrozFeijao");
          setSubFluxoEtapa(0);
          proximaPergunta = arrozFeijaoQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 5) {
        // Hortaliças
        const novosDados = { ...dadosAgropecuarios };
        novosDados.hortalicas.produz = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("hortalicas");
          setSubFluxoEtapa(0);
          proximaPergunta = hortalicasQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 6) {
        // Tuberosas
        const novosDados = { ...dadosAgropecuarios };
        novosDados.tuberosas.produz = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("tuberosas");
          setSubFluxoEtapa(0);
          proximaPergunta = tuberosasQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 7) {
        // Bovinos
        const novosDados = { ...dadosAgropecuarios };
        novosDados.bovinos.cria = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("bovinos");
          setSubFluxoEtapa(0);
          proximaPergunta = bovinoQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 8) {
        // Caprinos/Ovinos
        const novosDados = { ...dadosAgropecuarios };
        novosDados.caprinosOvinos.cria = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("caprinosOvinos");
          setSubFluxoEtapa(0);
          proximaPergunta = caprinosOvinosQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 9) {
        // Suínos
        const novosDados = { ...dadosAgropecuarios };
        novosDados.suinos.cria = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("suinos");
          setSubFluxoEtapa(0);
          proximaPergunta = suinosQuestions[0];
          return proximaPergunta;
        }
      } else if (atual === 10) {
        // Aves
        const novosDados = { ...dadosAgropecuarios };
        novosDados.aves.cria = respostaLower === "sim";
        setDadosAgropecuarios(novosDados);

        if (respostaLower === "sim") {
          setSubFluxo("aves");
          setSubFluxoEtapa(0);
          proximaPergunta = avesQuestions[0];
          return proximaPergunta;
        }
      }

      // Avançar para a próxima questão principal
      const proxima = indexQuestaoAgropecuaria + 1;
      setIndexQuestaoAgropecuaria(proxima);

      // Verificar se finalizamos todas as perguntas principais
      if (proxima >= principaisQuestoesAgropecuarias.length) {
        // Finalizar questionário agropecuário e ir para resumo
        setModo("resumo");
        return gerarResumoDosCadastro();
      } else {
        return principaisQuestoesAgropecuarias[proxima];
      }
    }
    // Se há subfluxo, processamos perguntas específicas do módulo
    else {
      // Atualizar dados de acordo com o subfluxo atual
      if (subFluxo === "cacau") {
        const novosDados = { ...dadosAgropecuarios };

        // Checando se estamos nas perguntas de cacau clonado
        if (
          novosDados.cacau.clonado &&
          subFluxoEtapa >= cacauQuestions.length
        ) {
          const etapaClonado = subFluxoEtapa - cacauQuestions.length;
          if (!novosDados.cacau.detalhesClonado) {
            novosDados.cacau.detalhesClonado = {};
          }

          // Processar respostas para cacau clonado
          switch (etapaClonado) {
            case 0: // Quantidade de pés clonados
              novosDados.cacau.detalhesClonado.quantidade = parseInt(resposta);
              break;
            case 1: // Safreiro
              novosDados.cacau.detalhesClonado.safreiro =
                resposta.toLowerCase() === "sim";
              break;
            case 2: // Idade
              novosDados.cacau.detalhesClonado.idade = resposta;
              break;
            case 3: // Produção anual
              novosDados.cacau.detalhesClonado.producaoAnual =
                parseInt(resposta);
              break;
            case 4: // Material clonal
              novosDados.cacau.detalhesClonado.materialClonal = resposta
                .split(",")
                .map((item) => item.trim());
              break;
          }

          // Avançar ou finalizar subfluxo de cacau clonado
          if (etapaClonado + 1 < cacauClonadoQuestions.length) {
            setSubFluxoEtapa(subFluxoEtapa + 1);
            proximaPergunta = cacauClonadoQuestions[etapaClonado + 1];
          } else {
            // Finalizar subfluxo de cacau e ir para próxima questão principal
            setSubFluxo(null);
            const proxima = indexQuestaoAgropecuaria + 1;
            setIndexQuestaoAgropecuaria(proxima);
            if (proxima < principaisQuestoesAgropecuarias.length) {
              proximaPergunta = principaisQuestoesAgropecuarias[proxima];
            } else {
              setModo("resumo");
              proximaPergunta = gerarResumoDosCadastro();
            }
          }
        }
        // Perguntas regulares de cacau
        else {
          switch (subFluxoEtapa) {
            case 0: // Quantidade de pés
              novosDados.cacau.quantidade = parseInt(resposta);
              break;
            case 1: // Safreiro
              novosDados.cacau.safreiro = resposta.toLowerCase() === "sim";
              break;
            case 2: // Idade
              novosDados.cacau.idade = resposta;
              break;
            case 3: // Sementes CEPLAC
              novosDados.cacau.sementeCeplac = resposta.toLowerCase() === "sim";
              break;
            case 4: // Produção Anual
              novosDados.cacau.producaoAnual = parseInt(resposta);
              break;
            case 5: // Possui plantio clonado
              novosDados.cacau.clonado = resposta.toLowerCase() === "sim";
              break;
          }

          // Avançar para próxima pergunta ou subfluxo de clonado
          if (subFluxoEtapa === 5 && resposta.toLowerCase() === "sim") {
            // Iniciar subfluxo de cacau clonado
            setSubFluxoEtapa(cacauQuestions.length); // Pular para primeira pergunta de clonado
            proximaPergunta = cacauClonadoQuestions[0];
          } else if (subFluxoEtapa + 1 < cacauQuestions.length) {
            setSubFluxoEtapa(subFluxoEtapa + 1);
            proximaPergunta = cacauQuestions[subFluxoEtapa + 1];
          } else {
            // Finalizar subfluxo de cacau e ir para próxima questão principal
            setSubFluxo(null);
            const proxima = indexQuestaoAgropecuaria + 1;
            setIndexQuestaoAgropecuaria(proxima);
            if (proxima < principaisQuestoesAgropecuarias.length) {
              proximaPergunta = principaisQuestoesAgropecuarias[proxima];
            } else {
              setModo("resumo");
              proximaPergunta = gerarResumoDosCadastro();
            }
          }
        }
        setDadosAgropecuarios(novosDados);
      }
      // Processamento de frutíferas
      else if (subFluxo === "frutiferas") {
        const novosDados = { ...dadosAgropecuarios };

        switch (subFluxoEtapa) {
          case 0: // Tipos de frutas
            novosDados.frutiferas.tipos = resposta
              .split(",")
              .map((item) => item.trim());
            break;
          case 1: // Destino da produção
            novosDados.frutiferas.destino = resposta
              .split(",")
              .map((item) => item.trim());
            break;
          case 2: // Produção em KG
            novosDados.frutiferas.producaoKg = parseInt(resposta);
            break;
          case 3: // Preço médio
            novosDados.frutiferas.precoMedio = parseFloat(resposta);
            break;
        }

        // Avançar ou finalizar subfluxo
        if (subFluxoEtapa + 1 < frutiferasQuestions.length) {
          setSubFluxoEtapa(subFluxoEtapa + 1);
          proximaPergunta = frutiferasQuestions[subFluxoEtapa + 1];
        } else {
          // Finalizar e ir para próxima questão principal
          setSubFluxo(null);
          const proxima = indexQuestaoAgropecuaria + 1;
          setIndexQuestaoAgropecuaria(proxima);
          if (proxima < principaisQuestoesAgropecuarias.length) {
            proximaPergunta = principaisQuestoesAgropecuarias[proxima];
          } else {
            setModo("resumo");
            proximaPergunta = gerarResumoDosCadastro();
          }
        }

        setDadosAgropecuarios(novosDados);
      }
      // Processamento de mandioca
      else if (subFluxo === "mandioca") {
        const novosDados = { ...dadosAgropecuarios };

        switch (subFluxoEtapa) {
          case 0: // Tipo de mandioca
            novosDados.mandioca.tipo = resposta;
            break;
          case 1: // Finalidade
            novosDados.mandioca.finalidade = resposta
              .split(",")
              .map((item) => item.trim());
            break;
          case 2: // Subprodutos
            novosDados.mandioca.subprodutos =
              resposta.toLowerCase() === "nenhum"
                ? []
                : resposta.split(",").map((item) => item.trim());
            break;
          case 3: // Área cultivada
            novosDados.mandioca.areaCultivada = parseFloat(resposta);
            break;
          case 4: // Plantio mecanizado
            novosDados.mandioca.plantioMecanizado =
              resposta.toLowerCase() === "sim";
            break;
        }

        // Avançar ou finalizar subfluxo
        if (subFluxoEtapa + 1 < mandiocaQuestions.length) {
          setSubFluxoEtapa(subFluxoEtapa + 1);
          proximaPergunta = mandiocaQuestions[subFluxoEtapa + 1];
        } else {
          // Finalizar e ir para próxima questão principal
          setSubFluxo(null);
          const proxima = indexQuestaoAgropecuaria + 1;
          setIndexQuestaoAgropecuaria(proxima);
          if (proxima < principaisQuestoesAgropecuarias.length) {
            proximaPergunta = principaisQuestoesAgropecuarias[proxima];
          } else {
            setModo("resumo");
            proximaPergunta = gerarResumoDosCadastro();
          }
        }

        setDadosAgropecuarios(novosDados);
      }
      // Processamento de bovinos
      else if (subFluxo === "bovinos") {
        const novosDados = { ...dadosAgropecuarios };

        switch (subFluxoEtapa) {
          case 0: // Número de animais
            novosDados.bovinos.quantidade = parseInt(resposta);
            break;
          case 1: // Gado de leite
            novosDados.bovinos.gadoLeite = resposta.toLowerCase() === "sim";
            break;
          case 2: // Fase predominante
            novosDados.bovinos.fasePredominante = resposta;
            break;
          case 3: // Sistema de manejo
            novosDados.bovinos.sistemaManejo = resposta;
            break;
          case 4: // Acesso ao mercado
            novosDados.bovinos.acessoMercado = resposta;
            break;
        }

        // Avançar ou finalizar subfluxo
        if (subFluxoEtapa + 1 < bovinoQuestions.length) {
          setSubFluxoEtapa(subFluxoEtapa + 1);
          proximaPergunta = bovinoQuestions[subFluxoEtapa + 1];
        } else {
          // Finalizar e ir para próxima questão principal
          setSubFluxo(null);
          const proxima = indexQuestaoAgropecuaria + 1;
          setIndexQuestaoAgropecuaria(proxima);
          if (proxima < principaisQuestoesAgropecuarias.length) {
            proximaPergunta = principaisQuestoesAgropecuarias[proxima];
          } else {
            setModo("resumo");
            proximaPergunta = gerarResumoDosCadastro();
          }
        }

        setDadosAgropecuarios(novosDados);
      }
      // Adicione aqui o processamento para os outros subfluxos...

      // Caso genérico se nenhum dos específicos foi processado
      if (!proximaPergunta) {
        // Finalizar subfluxo não implementado
        setSubFluxo(null);
        const proxima = indexQuestaoAgropecuaria + 1;
        setIndexQuestaoAgropecuaria(proxima);
        if (proxima < principaisQuestoesAgropecuarias.length) {
          proximaPergunta = principaisQuestoesAgropecuarias[proxima];
        } else {
          setModo("resumo");
          proximaPergunta = gerarResumoDosCadastro();
        }
      }
    }

    return proximaPergunta;
  };

  // Gerar resumo de todos os dados coletados
  const gerarResumoDosCadastro = (): string => {
    // Resumo da propriedade e proprietário
    let resumo = `RESUMO DO CADASTRO\n\n`;

    resumo += `PROPRIEDADE:\n`;
    if (cadastroRespostas.length > 0)
      resumo += `- Nome: ${cadastroRespostas[0]}\n`;
    if (cadastroRespostas.length > 1)
      resumo += `- Tipo: ${cadastroRespostas[1]}\n`;
    if (cadastroRespostas.length > 2)
      resumo += `- Endereço: ${cadastroRespostas[2]}\n`;
    if (cadastroRespostas.length > 3)
      resumo += `- Tamanho: ${cadastroRespostas[3]} ha\n`;
    if (cadastroRespostas.length > 4)
      resumo += `- Escriturada: ${cadastroRespostas[4]}\n`;
    if (cadastroRespostas.length > 5)
      resumo += `- DAP/CAF: ${cadastroRespostas[5]}\n`;
    if (cadastroRespostas.length > 6)
      resumo += `- CAR: ${cadastroRespostas[6]}\n`;
    if (cadastroRespostas.length > 7)
      resumo += `- Financiamento: ${cadastroRespostas[7]}\n`;

    resumo += `\nPROPRIETÁRIO:\n`;
    if (cadastroRespostas.length > 10)
      resumo += `- Nome: ${cadastroRespostas[10]}\n`;
    if (cadastroRespostas.length > 11)
      resumo += `- CPF: ${cadastroRespostas[11]}\n`;
    if (cadastroRespostas.length > 19)
      resumo += `- Telefone: ${cadastroRespostas[19]}\n`;

    // Resumo dos dados agropecuários
    resumo += "\nDADOS AGROPECUÁRIOS:\n";

    // Resumo de cacau
    if (dadosAgropecuarios.cacau.cultiva) {
      resumo += `- Cacau: Sim\n`;
      if (dadosAgropecuarios.cacau.quantidade)
        resumo += `  * Quantidade: ${dadosAgropecuarios.cacau.quantidade} pés\n`;
      if (dadosAgropecuarios.cacau.safreiro !== undefined)
        resumo += `  * Safreiro: ${dadosAgropecuarios.cacau.safreiro ? "Sim" : "Não"}\n`;
      if (dadosAgropecuarios.cacau.idade)
        resumo += `  * Idade: ${dadosAgropecuarios.cacau.idade}\n`;
      if (dadosAgropecuarios.cacau.producaoAnual)
        resumo += `  * Produção anual: ${dadosAgropecuarios.cacau.producaoAnual} kg\n`;

      if (dadosAgropecuarios.cacau.clonado) {
        resumo += `  * Possui cacau clonado: Sim\n`;
        if (dadosAgropecuarios.cacau.detalhesClonado) {
          const detalhes = dadosAgropecuarios.cacau.detalhesClonado;
          if (detalhes.quantidade)
            resumo += `    - Quantidade clonados: ${detalhes.quantidade} pés\n`;
          if (detalhes.safreiro !== undefined)
            resumo += `    - Safreiro: ${detalhes.safreiro ? "Sim" : "Não"}\n`;
          if (detalhes.idade) resumo += `    - Idade: ${detalhes.idade}\n`;
          if (detalhes.producaoAnual)
            resumo += `    - Produção anual: ${detalhes.producaoAnual} kg\n`;
          if (detalhes.materialClonal && detalhes.materialClonal.length > 0)
            resumo += `    - Material clonal: ${detalhes.materialClonal.join(", ")}\n`;
        }
      }
    } else {
      resumo += `- Cacau: Não\n`;
    }

    // Resumo de frutíferas
    if (dadosAgropecuarios.frutiferas.cultiva) {
      resumo += `- Frutíferas perenes: Sim\n`;
      if (
        dadosAgropecuarios.frutiferas.tipos &&
        dadosAgropecuarios.frutiferas.tipos.length > 0
      )
        resumo += `  * Tipos: ${dadosAgropecuarios.frutiferas.tipos.join(", ")}\n`;
      if (
        dadosAgropecuarios.frutiferas.destino &&
        dadosAgropecuarios.frutiferas.destino.length > 0
      )
        resumo += `  * Destino: ${dadosAgropecuarios.frutiferas.destino.join(", ")}\n`;
      if (dadosAgropecuarios.frutiferas.producaoKg)
        resumo += `  * Produção: ${dadosAgropecuarios.frutiferas.producaoKg} kg\n`;
      if (dadosAgropecuarios.frutiferas.precoMedio)
        resumo += `  * Preço médio: R$ ${dadosAgropecuarios.frutiferas.precoMedio.toFixed(2)}/kg\n`;
    } else {
      resumo += `- Frutíferas perenes: Não\n`;
    }

    // Resumo de mandioca
    if (dadosAgropecuarios.mandioca.produz) {
      resumo += `- Mandioca/Macaxeira: Sim\n`;
      if (dadosAgropecuarios.mandioca.tipo)
        resumo += `  * Tipo: ${dadosAgropecuarios.mandioca.tipo}\n`;
      if (
        dadosAgropecuarios.mandioca.finalidade &&
        dadosAgropecuarios.mandioca.finalidade.length > 0
      )
        resumo += `  * Finalidade: ${dadosAgropecuarios.mandioca.finalidade.join(", ")}\n`;
      if (
        dadosAgropecuarios.mandioca.subprodutos &&
        dadosAgropecuarios.mandioca.subprodutos.length > 0
      )
        resumo += `  * Subprodutos: ${dadosAgropecuarios.mandioca.subprodutos.join(", ")}\n`;
      if (dadosAgropecuarios.mandioca.areaCultivada)
        resumo += `  * Área cultivada: ${dadosAgropecuarios.mandioca.areaCultivada} ha\n`;
      if (dadosAgropecuarios.mandioca.plantioMecanizado !== undefined)
        resumo += `  * Plantio mecanizado: ${dadosAgropecuarios.mandioca.plantioMecanizado ? "Sim" : "Não"}\n`;
    } else {
      resumo += `- Mandioca/Macaxeira: Não\n`;
    }

    // Resumo de bovinos
    if (dadosAgropecuarios.bovinos.cria) {
      resumo += `- Bovinos: Sim\n`;
      if (dadosAgropecuarios.bovinos.quantidade)
        resumo += `  * Quantidade: ${dadosAgropecuarios.bovinos.quantidade} animais\n`;
      if (dadosAgropecuarios.bovinos.gadoLeite !== undefined)
        resumo += `  * Gado de leite: ${dadosAgropecuarios.bovinos.gadoLeite ? "Sim" : "Não"}\n`;
      if (dadosAgropecuarios.bovinos.fasePredominante)
        resumo += `  * Fase predominante: ${dadosAgropecuarios.bovinos.fasePredominante}\n`;
      if (dadosAgropecuarios.bovinos.sistemaManejo)
        resumo += `  * Sistema de manejo: ${dadosAgropecuarios.bovinos.sistemaManejo}\n`;
      if (dadosAgropecuarios.bovinos.acessoMercado)
        resumo += `  * Acesso ao mercado: ${dadosAgropecuarios.bovinos.acessoMercado}\n`;
    } else {
      resumo += `- Bovinos: Não\n`;
    }

    // Adicione aqui resumos para os outros módulos...

    resumo += "\nPor favor, confirme se as informações estão corretas.";

    return resumo;
  };

  // Função para gerar resumo dos dados de piscicultura
  const gerarResumoPiscicultura = (): string => {
    const dados = dadosPiscicultura;

    let resumo = `RESUMO DO CADASTRO DE PISCICULTURA\n\n`;

    resumo += `DADOS DO EMPREENDEDOR:\n`;
    resumo += `- Nome: ${dados.empreendedor.nome}\n`;
    resumo += `- CPF: ${dados.empreendedor.cpf}\n`;
    resumo += `-Telefone: ${dados.empreendedor.celular}\n`;

    resumo += `\nDADOS DA ATIVIDADE:\n`;
    resumo += `- Atividade: ${dados.atividade.descricao}\n`;
    resumo += `- Endereço: ${dados.atividade.endereco}\n`;

    if (dados.atividade.coordenadas) {
      resumo += `- Localização: Lat ${dados.atividade.coordenadas.latitude.toFixed(6)}, Long ${dados.atividade.coordenadas.longitude.toFixed(6)}\n`;
    }

    if (dados.atividade.estruturaAquicola.length > 0) {
      resumo += `- Estruturas aquícolas: ${dados.atividade.estruturaAquicola.join(", ")}\n`;
    }

    // Adicionar outras seções conforme necessário...

    resumo += `\nPor favor, confirme se as informações estão corretas.`;

    return resumo;
  };

  // Salvar dados de piscicultura no Firebase
  const salvarPisciculturaNoFirebase = async () => {
    try {
      // Salvar no Firebase
      await addDoc(collection(db, "cadastros_piscicultura"), {
        ...dadosPiscicultura,
        solicitacao: solicitacao,
        timestamp: serverTimestamp(),
        status: "pendente",
        origem: "chatbot",
      });
      console.log("Cadastro de piscicultura salvo com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao salvar cadastro de piscicultura:", error);
      return false;
    }
  };

  // Salvar todos os dados no Firebase
  const salvarCadastroNoFirebase = async () => {
    try {
      const cadastroCompleto = {
        propriedade: {
          nome: cadastroRespostas[0] || "",
          tipo: cadastroRespostas[1] || "",
          endereco: cadastroRespostas[2] || "",
          tamanho: parseFloat(cadastroRespostas[3]) || 0,
          escriturada: cadastroRespostas[4] || "",
          dapCaf: cadastroRespostas[5] || "",
          car: cadastroRespostas[6] || "",
          financiamento: cadastroRespostas[7] || "",
          coordenadas: {
            s: cadastroRespostas[8] || "",
            w: cadastroRespostas[9] || "",
          },
          localizacao: userLocation,
        },
        proprietario: {
          nome: cadastroRespostas[10] || "",
          cpf: cadastroRespostas[11] || "",
          rg: cadastroRespostas[12] || "",
          emissor: cadastroRespostas[13] || "",
          sexo: cadastroRespostas[14] || "",
          nascimento: cadastroRespostas[15] || "",
          naturalidade: cadastroRespostas[16] || "",
          mae: cadastroRespostas[17] || "",
          escolaridade: cadastroRespostas[18] || "",
          telefone: cadastroRespostas[19] || "",
          associacao: cadastroRespostas[20] || "",
        },
        dadosAgropecuarios: dadosAgropecuarios,
        solicitacao: solicitacao,
        dataRegistro: new Date().toISOString(),
        status: "pendente",
        origem: "chatbot",
      };

      // Salvar todos os dados em um único documento
      await addDoc(collection(db, "cadastros"), cadastroCompleto);
      console.log("Cadastro salvo com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
      return false;
    }
  };

  // Processar mensagem do usuário
  const processUserMessage = async (userMessage: string) => {
    setIsLoading(true);

    // Adiciona mensagem do usuário
    addMessage(userMessage, true);

    // Processa resposta
    let botResponse = "";

    // Verificar se está respondendo sobre localização
    if (isAskingLocation && (userMessage.toLowerCase().includes("tentar novamente") || 
                            userMessage.toLowerCase().includes("prosseguir"))) {

      if (userMessage.toLowerCase().includes("tentar novamente")) {
        // Tentar obter a localização novamente
        getUserLocation();
        return;
      } else if (userMessage.toLowerCase().includes("prosseguir")) {
        // Prosseguir sem localização
        setIsAskingLocation(false);

        if (modo === "piscicultura" && pisciculturaSecao === "atividade") {
          // Continuar o fluxo de piscicultura
          setPisciculturaSecao("estrutura");
          setPisciculturaEtapa(0);
          botResponse = pisciculturaEstruturaQuestions[0];
          setSuggestions([
            { text: "Viveiro", action: "Viveiro" },
            { text: "Tanque-rede", action: "Tanque-rede" },
            { text: "Barragem", action: "Barragem" },
            { text: "Canal", action: "Canal" },
            { text: "Represa", action: "Represa" },
          ]);
          addMessage(botResponse, false);
          setIsLoading(false);
          return;
        }
      }
    }

    // Modo solicitação - recebe a solicitação final e finaliza o processo
    if```javascript
    (modo === "solicitacao") {
      setSolicitacao(userMessage);
      await salvarCadastroNoFirebase();
      botResponse =
        "Sua solicitação de " +
        userMessage +
        " foi registrada com sucesso! Um técnico responsável pelo setor entrará em contato em breve para atender sua solicitação. Obrigado por utilizar nosso serviço!";
      // Reiniciar para o estado inicial
      setCadastroEtapa(-1);
      setCadastroRespostas([]);
      setModo("inicio");
      setSuggestions(initialSuggestions);
      setDadosAgropecuarios({
        cacau: { cultiva: false },
        frutiferas: { cultiva: false },
        lavourasAnuais: { cultiva: false },
        mandioca: { produz: false },
        arrozFeijao: { produz: false },
        hortalicas: { produz: false },
        tuberosas: { produz: false },
        bovinos: { cria: false },
        caprinosOvinos: { cria: false },
        suinos: { cria: false },
        aves: { cria: false },
      });
    }
    // Modo agropecuária - processamento específico
    else if (modo === "agropecuaria") {
      botResponse = processarRespostaAgropecuaria(userMessage);
    }
    // Modo resumo para confirmação final
    else if (modo === "resumo") {
      // Palavras que indicam confirmação
      const palavrasConfirmacao = [
        "confirmar",
        "confirmo",
        "sim",
        "ok",
        "certo",
        "correto",
        "está correto",
        "confirma",
      ];

      if (
        palavrasConfirmacao.some((palavra) =>
          userMessage.toLowerCase().includes(palavra),
        )
      ) {
        // Passar para o modo de solicitação
        setModo("solicitacao");
        botResponse =
          "Agora, por favor, descreva qual serviço ou assistência você está buscando da Secretaria de Agricultura:";
        setSuggestions(servicosSugestoes);
      } else if (userMessage.toLowerCase().includes("editar")) {
        botResponse = "Qual informação você gostaria de editar?";
        // Aqui implementaríamos a lógica de edição
        botResponse =
          "Recurso de edição em desenvolvimento. Por favor, reinicie o cadastro se precisar corrigir informações.";
      } else if (userMessage.toLowerCase().includes("cancelar")) {
        botResponse = "Cadastro cancelado. Como posso ajudar você hoje?";
        setCadastroEtapa(-1);
        setCadastroRespostas([]);
        setModo("inicio");
        setSuggestions(initialSuggestions);
      } else {
        // Se a resposta não for reconhecida, pedir novamente
        botResponse =
          "Por favor, confirme se os dados estão corretos digitando 'Confirmar', ou 'Cancelar' para recomeçar.";
      }
    }
    // Modo serviço para informações sobre serviços
    else if (modo === "servico") {
      // Se ainda não verificamos se o usuário já é cadastrado
      if (usuarioCadastrado === null) {
        // Verificar se usuário já tem cadastro
        setUsuarioCadastrado(userMessage.toLowerCase().includes("sim"));

        if (userMessage.toLowerCase().includes("sim")) {
          botResponse = "Por favor, informe seu nome completo:";
        } else {
          // Usuário não tem cadastro, iniciar processo completo
          setModo("cadastro");
          setCadastroEtapa(0);
          botResponse = cadastroFluxo[0];
        }
      }
      // Se o usuário é cadastrado, coletar informações básicas
      else if (usuarioCadastrado) {
        if (cadastroRespostas.length === 0) {
          // Coletar nome
          setCadastroRespostas([...cadastroRespostas, userMessage]);
          botResponse = "Agora, por favor, digite seu CPF:";
        } else if (cadastroRespostas.length === 1) {
          // Coletar CPF
          setCadastroRespostas([...cadastroRespostas, userMessage]);
          botResponse = "Qual o nome da sua propriedade?";
        } else if (cadastroRespostas.length === 2) {
          // Coletar nome da propriedade
          setCadastroRespostas([...cadastroRespostas, userMessage]);
          // Simular busca no banco (em uma versão real, verificaríamos o cadastro)
          botResponse =
            "Encontramos seu cadastro no sistema. Qual serviço você precisa hoje?";
          setSuggestions(servicosSugestoes);
        } else {
          // Já coletamos as informações básicas, considerar como uma solicitação
          setSolicitacao(userMessage);
          // Criar dados mínimos necessários para registro
          const dadosProprietario = {
            nome: cadastroRespostas[0] || "",
            cpf: cadastroRespostas[1] || "",
          };
          const dadosPropriedade = {
            nome: cadastroRespostas[2] || "",
          };

          // Salvar solicitação no Firebase
          try {
            await addDoc(collection(db, "solicitacoes_servicos"), {
              proprietario: dadosProprietario,
              propriedade: dadosPropriedade,
              solicitacao: userMessage,
              timestamp: serverTimestamp(),
              status: "pendente",
              origem: "chatbot",
            });
            botResponse =
              "Sua solicitação de " +
              userMessage +
              " foi registrada com sucesso! Um técnico responsável pelo setor entrará em contato em breve para atender sua solicitação. Obrigado por utilizar nosso serviço!";
          } catch (error) {
            console.error("Erro ao salvar solicitação:", error);
            botResponse =
              "Desculpe, houve um problema ao processar sua solicitação. Por favor, tente novamente mais tarde ou entre em contato diretamente com a Secretaria.";
          }

          // Reiniciar para o estado inicial
          setModo("inicio");
          setCadastroRespostas([]);
          setSuggestions(initialSuggestions);
        }
      }
    }
    // Modo cadastro principal
    else if (cadastroEtapa >= 0) {
      if (!validateField(cadastroEtapa, userMessage)) {
        botResponse = "Por favor, insira um valor válido.";
      } else {
        const novasRespostas = [...cadastroRespostas, userMessage];
        setCadastroRespostas(novasRespostas);

        // Próxima etapa ou finalizar cadastro principal
        if (cadastroEtapa + 1 >= cadastroFluxo.length) {
          // Passar para o módulo de dados agropecuários
          setModo("agropecuaria");
          setIndexQuestaoAgropecuaria(0);
          botResponse = principaisQuestoesAgropecuarias[0];
        } else {
          // Próxima pergunta normal do cadastro principal
          setCadastroEtapa((prev) => prev + 1);
          botResponse = cadastroFluxo[cadastroEtapa + 1];
        }
      }
    }
    // Modo cadastro inicial (verificando se já está cadastrado)
    else if (modo === "cadastro") {
      if (usuarioCadastrado === null) {
        setUsuarioCadastrado(userMessage.toLowerCase().includes("sim"));
        if (userMessage.toLowerCase().includes("sim")) {
          botResponse = "Por favor, informe seu nome completo:";
        } else {
          setCadastroEtapa(0);
          botResponse = cadastroFluxo[0];
        }
      } else if (usuarioCadastrado) {
        if (cadastroRespostas.length === 0) {
          setCadastroRespostas([...cadastroRespostas, userMessage]);
          botResponse = "Agora, por favor, digite seu CPF:";
        } else if (cadastroRespostas.length === 1) {
          const cpf = userMessage;
          setCadastroRespostas([...cadastroRespostas, cpf]);
          botResponse = "Qual o nome da sua propriedade?";
        } else if (cadastroRespostas.length === 2) {
          setCadastroRespostas([...cadastroRespostas, userMessage]);
          setModo("solicitacao");
          botResponse =
            "Encontramos seu cadastro. Qual serviço você precisa hoje?";
          setSuggestions(servicosSugestoes);
        }
      }
    }
    // Modo piscicultura - processamento do cadastro de piscicultura
    else if (modo === "piscicultura") {
      // Processar as respostas de acordo com a seção atual
      if (pisciculturaSecao === "empreendedor") {
        // Atualizar dados do empreendedor
        const novosDados = { ...dadosPiscicultura };

        switch (pisciculturaEtapa) {
          case 0: // Nome
            novosDados.empreendedor.nome = userMessage;
            break;
          case 1: // Endereço
            novosDados.empreendedor.endereco = userMessage;
            break;
          case 2: // Travessão
            novosDados.empreendedor.travessao = userMessage;
            break;
          case 3: // CPF
            // Validar formato do CPF
            const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
            if (!cpfRegex.test(userMessage)) {
              botResponse =
                "CPF em formato inválido. Por favor, use o formato 000.000.000-00";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }
            novosDados.empreendedor.cpf = userMessage;
            break;
          case 4: // RG
            novosDados.empreendedor.rg = userMessage;
            break;
          case 5: // Órgão Emissor
            novosDados.empreendedor.orgaoEmissor = userMessage;
            break;
          case 6: // Sexo
            novosDados.empreendedor.sexo = userMessage;
            break;
          case 7: // Celular
            // Validar formato do celular
            const celularRegex = /^\(\d{2}\)\s\d{5}-\d{4}$/;
            if (!celularRegex.test(userMessage)) {
              botResponse =
                "Número de celular em formato inválido. Por favor, use o formato (00) 00000-0000";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }
            novosDados.empreendedor.celular = userMessage;
            break;
        }

        setDadosPiscicultura(novosDados);

        // Avançar para a próxima etapa ou seção
        if (botResponse === "") {
          // Se não houve erro de validação
          if (
            pisciculturaEtapa <
            pisciculturaEmpreendedorQuestions.length - 1
          ) {
            // Próxima pergunta na mesma seção
            setPisciculturaEtapa(pisciculturaEtapa + 1);
            botResponse =
              pisciculturaEmpreendedorQuestions[pisciculturaEtapa + 1];

            // Definir sugestões para perguntas específicas
            if (pisciculturaEtapa + 1 === 6) {
              // Pergunta sobre sexo
              setSuggestions([
                { text: "Masculino", action: "Masculino" },
                { text: "Feminino", action: "Feminino" },
                {
                  text: "Prefiro não informar",
                  action: "Prefiro não informar",
                },
              ]);
            } else {
              setSuggestions([]);
            }
          } else {
            // Avançar para a próxima seção
            setPisciculturaEtapa(0);
            setPisciculturaSecao("atividade");
            botResponse = pisciculturaAtividadeQuestions[0];
            setSuggestions([]);
          }
        }
      } else if (pisciculturaSecao === "atividade") {
        // Atualizar dados da atividade
        const novosDados = { ...dadosPiscicultura };

        if (pisciculturaEtapa === 0) {
          novosDados.atividade.descricao = userMessage;
        } else if (pisciculturaEtapa === 1) {
          novosDados.atividade.endereco = userMessage;
        }

        setDadosPiscicultura(novosDados);

        // Avançar para a próxima etapa
        if (pisciculturaEtapa < pisciculturaAtividadeQuestions.length - 1) {
          setPisciculturaEtapa(pisciculturaEtapa + 1);
          botResponse = pisciculturaAtividadeQuestions[pisciculturaEtapa + 1];
        } else if (
          pisciculturaEtapa ===
          pisciculturaAtividadeQuestions.length - 1
        ) {
          // Após endereço, pular diretamente para estrutura (sem perguntar sobre localização)
          setPisciculturaSecao("estrutura");
          setPisciculturaEtapa(0);
          botResponse = pisciculturaEstruturaQuestions[0];
          setSuggestions([
            { text: "Viveiro", action: "Viveiro" },
            { text: "Tanque-rede", action: "Tanque-rede" },
            { text: "Barragem", action: "Barragem" },
            { text: "Canal", action: "Canal" },
            { text: "Represa", action: "Represa" },
          ]);
        }
      } else if (pisciculturaSecao === "estrutura") {
        if (pisciculturaEtapa === 0) {
          // Processar seleção de estruturas
          const estruturasSelecionadas = userMessage
            .split(",")
            .map((s) => s.trim());
          const novosDados = { ...dadosPiscicultura };
          novosDados.atividade.estruturaAquicola = estruturasSelecionadas;
          setDadosPiscicultura(novosDados);

          // Avançar para a seção de obras
          setPisciculturaSecao("obras");
          setPisciculturaEtapa(0);
          botResponse =
            "Quais tipos de obras existem na propriedade? (selecione todas aplicáveis)";
          setSuggestions([
            { text: "Canal de Igarapé", action: "Canal de Igarapé" },
            { text: "Viveiro Escavado", action: "Viveiro Escavado" },
            { text: "Barragem", action: "Barragem" },
            { text: "Viveiro Suspenso", action: "Viveiro Suspenso" },
            { text: "Nenhuma das anteriores", action: "Nenhuma" },
          ]);
        }
      } else if (pisciculturaSecao === "obras") {
        const novosDados = { ...dadosPiscicultura };

        if (pisciculturaEtapa === 0) {
          // Processar seleção de obras
          const obrasList = userMessage.split(",").map((s) => s.trim());
          setObrasSelecionadas(obrasList);

          // Se não selecionou nenhuma obra ou selecionou "Nenhuma"
          if (obrasList.includes("Nenhuma") || obrasList.length === 0) {
            // Pular para a próxima seção
            setPisciculturaSecao("especies");
            setPisciculturaEtapa(0);
            botResponse = pisciculturaEspeciesQuestions[0];
            setSuggestions([
              { text: "Tambaqui", action: "Tambaqui" },
              { text: "Tambatinga", action: "Tambatinga" },
              { text: "Matrinxã", action: "Matrinxã" },
              { text: "Curimatã", action: "Curimatã" },
              { text: "Pirarucu", action: "Pirarucu" },
              { text: "Tilápia", action: "Tilápia" },
            ]);
          } else {
            // Fazer perguntas sobre a primeira obra
            botResponse =
              "Agora vamos detalhar as obras selecionadas. " +
              pisciculturaObrasQuestions[
                obrasList[0]
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    "",
                  ) as keyof typeof pisciculturaObrasQuestions
              ][0];
            setPisciculturaEtapa(1);
          }
        } else {
          // Estamos processando os detalhes de uma obra específica
          const obraAtual =
            obrasSelecionadas[Math.floor((pisciculturaEtapa - 1) / 2)];
          const obraKey = obraAtual
            .toLowerCase()
            .replace(/\s+/g, "") as keyof typeof pisciculturaObrasQuestions;
          const isAreaQuestion = (pisciculturaEtapa - 1) % 2 === 0;

          if (isAreaQuestion) {
            // Pergunta sobre área
            const area = parseFloat(userMessage);
            if (isNaN(area)) {
              botResponse =
                "Por favor, informe um valor numérico válido para a área.";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }

            // Inicializar a obra se ainda não existir
            if (!novosDados.obras[obraKey]) {
              novosDados.obras[obraKey] = {} as any;
            }

            // Salvar a área
            (novosDados.obras[obraKey] as any).area = area;
            setDadosPiscicultura(novosDados);

            // Próxima pergunta (situação da obra)
            botResponse = pisciculturaObrasQuestions[obraKey][1];
            setPisciculturaEtapa(pisciculturaEtapa + 1);
            setSuggestions([
              { text: "Construído", action: "Construído" },
              { text: "Em construção", action: "Em construção" },
              { text: "Planejado", action: "Planejado" },
            ]);
          } else {
            // Pergunta sobre situação
            if (!novosDados.obras[obraKey]) {
              novosDados.obras[obraKey] = {} as any;
            }
            (novosDados.obras[obraKey] as any).situacao = userMessage;
            setDadosPiscicultura(novosDados);

            // Verificar se há mais obras para processar
            const nextObraIndex = Math.floor(pisciculturaEtapa / 2);
            if (nextObraIndex < obrasSelecionadas.length) {
              // Ainda há obras para processar
              const proximaObra = obrasSelecionadas[nextObraIndex];
              const proximaObraKey = proximaObra
                .toLowerCase()
                .replace(/\s+/g, "") as keyof typeof pisciculturaObrasQuestions;
              botResponse = pisciculturaObrasQuestions[proximaObraKey][0];
              setPisciculturaEtapa(pisciculturaEtapa + 1);
              setSuggestions([]);
            } else {
              // Concluímos todas as obras, vamos para a próxima seção
              setPisciculturaSecao("especies");
              setPisciculturaEtapa(0);
              botResponse = pisciculturaEspeciesQuestions[0];
              setSuggestions([
                { text: "Tambaqui", action: "Tambaqui" },
                { text: "Tambatinga", action: "Tambatinga" },
                { text: "Matrinxã", action: "Matrinxã" },
                { text: "Curimatã", action: "Curimatã" },
                { text: "Pirarucu", action: "Pirarucu" },
                { text: "Tilápia", action: "Tilápia" },
              ]);
            }
          }
        }
      } else if (pisciculturaSecao === "especies") {
        const novosDados = { ...dadosPiscicultura };

        if (pisciculturaEtapa === 0) {
          // Processar seleção de espécies
          const especiesList = userMessage.split(",").map((s) => s.trim());
          setEspeciesSelecionadas(especiesList);

          if (especiesList.length === 0) {
            // Pular para a próxima seção
            setPisciculturaSecao("detalhamento");
            setPisciculturaEtapa(0);
            botResponse = pisciculturaDetalhamentoQuestions[0];
            setSuggestions([]);
          } else {
            // Fazer perguntas sobre a primeira espécie
            botResponse =
              "Agora vamos detalhar as espécies selecionadas. " +
              pisciculturaEspeciesQuantidadeQuestions[
                especiesList[0].toLowerCase() as keyof typeof pisciculturaEspeciesQuantidadeQuestions
              ];
            setPisciculturaEtapa(1);
            setSuggestions([]);
          }
        } else {
          // Processando detalhes de uma espécie específica
          const especieIndex = pisciculturaEtapa - 1;
          if (especieIndex < especiesSelecionadas.length) {
            const especie = especiesSelecionadas[
              especieIndex
            ].toLowerCase() as keyof typeof novosDados.especies;

            // Validar quantidade
            const quantidade = parseInt(userMessage);
            if (isNaN(quantidade)) {
              botResponse =
                "Por favor, informe um valor numérico válido para a quantidade.";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }

            // Salvar quantidade
            novosDados.especies[especie] = quantidade;
            setDadosPiscicultura(novosDados);

            // Verificar se há mais espécies para processar
            if (especieIndex + 1 < especiesSelecionadas.length) {
              // Próxima espécie
              const proximaEspecie = especiesSelecionadas[especieIndex + 1];
              botResponse =
                pisciculturaEspeciesQuantidadeQuestions[
                  proximaEspecie.toLowerCase() as keyof typeof pisciculturaEspeciesQuantidadeQuestions
                ];
              setPisciculturaEtapa(pisciculturaEtapa + 1);
            } else {
              // Concluímos todas as espécies, vamos para a próxima seção
              setPisciculturaSecao("detalhamento");
              setPisciculturaEtapa(0);
              botResponse = pisciculturaDetalhamentoQuestions[0];
              setSuggestions([]);
            }
          }
        }
      } else if (pisciculturaSecao === "detalhamento") {
        const novosDados = { ...dadosPiscicultura };

        switch (pisciculturaEtapa) {
          case 0: // Distância da sede municipal
            const distancia = parseFloat(userMessage);
            if (isNaN(distancia)) {
              botResponse =
                "Por favor, informe um valor numérico válido para a distância em Km.";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }
            novosDados.detalhamento.distanciaSede = distancia;
            break;

          case 1: // Referência de localização
            novosDados.detalhamento.referencia = userMessage;
            break;

          case 2: // Situação legal da propriedade
            novosDados.detalhamento.situacaoLegal = userMessage;

            // Se selecionou "Outra", precisamos perguntar qual
            if (userMessage.toLowerCase() === "outra") {
              setPisciculturaEtapa(pisciculturaEtapa + 1);
              botResponse = "Qual a situação legal da propriedade?";
              setDadosPiscicultura(novosDados);
              setIsLoading(false);
              addMessage(botResponse, false);
              return;
            } else if (
              userMessage.toLowerCase() !== "regularizada" &&
              userMessage.toLowerCase() !== "arrendada" &&
              userMessage.toLowerCase() !== "cedida" &&
              userMessage.toLowerCase() !== "posse"
            ) {
              // Se não é uma das opções padrão, salvar como outra situação
              novosDados.detalhamento.outraSituacao = userMessage;
            }
            break;

          case 3: // Outra situação (caso tenha selecionado "Outra")
            if (
              novosDados.detalhamento.situacaoLegal.toLowerCase() === "outra"
            ) {
              novosDados.detalhamento.outraSituacao = userMessage;
              // Avançar para a próxima pergunta normal
              setPisciculturaEtapa(pisciculturaEtapa + 1);
            }
            // Se não entrou no if, essa pergunta é a área total
            else {
              const area = parseFloat(userMessage);
              if (isNaN(area)) {
                botResponse =
                  "Por favor, informe um valor numérico válido para a área em ha.";
                addMessage(botResponse, false);
                setIsLoading(false);
                return;
              }
              novosDados.detalhamento.areaTotal = area;
            }
            break;

          case 4: // Área total (se veio da pergunta de outra situação) ou Recursos Hídricos
            if (
              novosDados.detalhamento.outraSituacao &&
              pisciculturaEtapa === 4
            ) {
              // Neste caso, essa pergunta é sobre a área total
              const area = parseFloat(userMessage);
              if (isNaN(area)) {
                botResponse =
                  "Por favor, informe um valor numérico válido para a área em ha.";
                addMessage(botResponse, false);
                setIsLoading(false);
                return;
              }
              novosDados.detalhamento.areaTotal = area;
            } else {
              // Neste caso, essa pergunta é sobre recursos hídricos
              const recursos = userMessage.split(",").map((r) => r.trim());
              novosDados.detalhamento.recursosHidricos.tipo = recursos;
              setRecursosHidricosSelecionados(recursos);

              // Se selecionou algum recurso, perguntar os nomes
              if (recursos.length > 0 && recursos[0] !== "Nenhum") {
                setPisciculturaEtapa(pisciculturaEtapa + 1);
                botResponse = `Qual o nome do(s) ${recursos[0]}(s) na propriedade?`;
                setDadosPiscicultura(novosDados);
                setSuggestions([]);
                setIsLoading(false);
                addMessage(botResponse, false);
                return;
              }
            }
            break;

          case 5: // Nome dos recursos hídricos ou Usos múltiplos da água
            if (
              recursosHidricosSelecionados.length > 0 &&
              !novosDados.detalhamento.recursosHidricos.nomes[
                recursosHidricosSelecionados[0]
              ]
            ) {
              // Estamos processando o nome do primeiro recurso hídrico
              novosDados.detalhamento.recursosHidricos.nomes[
                recursosHidricosSelecionados[0]
              ] = userMessage;

              // Verificar se há mais recursos para perguntar
              if (recursosHidricosSelecionados.length > 1) {
                const proximoRecurso = recursosHidricosSelecionados[1];
                botResponse = `Qual o nome do(s) ${proximoRecurso}(s) na propriedade?`;

                // Remover o primeiro item da lista
                setRecursosHidricosSelecionados(
                  recursosHidricosSelecionados.slice(1),
                );

                setDadosPiscicultura(novosDados);
                setIsLoading(false);
                addMessage(botResponse, false);
                return;
              }
              // Caso contrário, seguir para a próxima pergunta (usos da água)
            } else {
              // Neste caso, estamos processando os usos múltiplos da água
              const usos = userMessage.split(",").map((u) => u.trim());
              novosDados.detalhamento.usosAgua = usos;
            }
            break;
        }

        setDadosPiscicultura(novosDados);

        // Avançar para a próxima pergunta ou seção
        if (pisciculturaEtapa < pisciculturaDetalhamentoQuestions.length - 1) {
          setPisciculturaEtapa(pisciculturaEtapa + 1);

          // Verificar se devemos pular a pergunta de "outra situação"
          if (
            pisciculturaEtapa + 1 === 3 &&
            novosDados.detalhamento.situacaoLegal &&
            novosDados.detalhamento.situacaoLegal.toLowerCase() !== "outra"
          ) {
            setPisciculturaEtapa(pisciculturaEtapa + 2);
            botResponse = "Qual a área total da propriedade (em ha)?";
          } else {
            botResponse =
              pisciculturaDetalhamentoQuestions[pisciculturaEtapa + 1];

            // Configurar sugestões para perguntas específicas
            if (pisciculturaEtapa + 1 === 2) {
              // Situação legal
              setSuggestions([
                { text: "Regularizada", action: "Regularizada" },
                { text: "Arrendada", action: "Arrendada" },
                { text: "Cedida", action: "Cedida" },
                { text: "Posse", action: "Posse" },
                { text: "Outra", action: "Outra" },
              ]);
            } else if (pisciculturaEtapa + 1 === 4) {
              // Recursos hídricos
              setSuggestions([
                { text: "Igarapé", action: "Igarapé" },
                { text: "Rio", action: "Rio" },
                { text: "Lago", action: "Lago" },
                { text: "Poço", action: "Poço" },
                { text: "Nascente", action: "Nascente" },
                { text: "Nenhum", action: "Nenhum" },
              ]);
            } else if (pisciculturaEtapa + 1 === 5) {
              // Usos da água
              setSuggestions([
                { text: "Aquicultura", action: "Aquicultura" },
                { text: "Irrigação", action: "Irrigação" },
                {
                  text: "Abastecimento Público",
                  action: "Abastecimento Público",
                },
                { text: "Lazer", action: "Lazer" },
                {
                  text: "Dessedentação Animal",
                  action: "Dessedentação Animal",
                },
              ]);
            } else {
              setSuggestions([]);
            }
          }
        } else {
          // Avançar para a próxima seção (recursos)
          setPisciculturaSecao("recursos");
          setPisciculturaEtapa(0);
          botResponse = pisciculturaRecursosQuestions[0];
          setSuggestions([]);
        }
      } else if (pisciculturaSecao === "recursos") {
        const novosDados = { ...dadosPiscicultura };

        switch (pisciculturaEtapa) {
          case 0: // Número de empregados
            const numEmpregados = parseInt(userMessage);
            if (isNaN(numEmpregados)) {
              botResponse =
                "Por favor, informe um valor numérico válido para o número de empregados.";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }
            novosDados.recursos.numEmpregados = numEmpregados;
            break;

          case 1: // Número de familiares
            const numFamiliares = parseInt(userMessage);
            if (isNaN(numFamiliares)) {
              botResponse =
                "Por favor, informe um valor numérico válido para o número de familiares.";
              addMessage(botResponse, false);
              setIsLoading(false);
              return;
            }
            novosDados.recursos.numFamiliares = numFamiliares;
            break;

          case 2: // Recursos financeiros
            novosDados.recursos.recursosFinanceiros = userMessage;

            // Se selecionou financiamento, perguntar a fonte
            if (userMessage.toLowerCase().includes("financiamento")) {
              setPisciculturaEtapa(pisciculturaEtapa + 1);
              botResponse = "Qual a fonte do financiamento?";
              setDadosPiscicultura(novosDados);
              setSuggestions([
                { text: "Banco da Amazônia", action: "Banco da Amazônia" },
                { text: "Banco do Brasil", action: "Banco do Brasil" },
                { text: "Caixa Econômica", action: "Caixa Econômica" },
                { text: "Outro", action: "Outro" },
              ]);
              setIsLoading(false);
              addMessage(botResponse, false);
              return;
            }
            break;

          case 3: // Fonte do financiamento ou Assistência técnica
            if (
              novosDados.recursos.recursosFinanceiros
                .toLowerCase()
                .includes("financiamento")
            ) {
              novosDados.recursos.fonteFinanciamento = userMessage;
              // Avançar para a pergunta normal
              setPisciculturaEtapa(pisciculturaEtapa + 1);
            } else {
              // Esta é a pergunta sobre assistência técnica
              novosDados.recursos.assistenciaTecnica = userMessage;
            }
            break;

          case 4: // Assistência técnica
            novosDados.recursos.assistenciaTecnica = userMessage;
            break;
        }

        setDadosPiscicultura(novosDados);

        // Avançar para a próxima pergunta ou seção
        if (pisciculturaEtapa < pisciculturaRecursosQuestions.length - 1) {
          setPisciculturaEtapa(pisciculturaEtapa + 1);

          // Verificar se devemos pular a pergunta de fonte de financiamento
          if (
            pisciculturaEtapa + 1 === 3 &&
            novosDados.recursos.recursosFinanceiros &&
            !novosDados.recursos.recursosFinanceiros
              .toLowerCase()
              .includes("financiamento")
          ) {
            setPisciculturaEtapa(pisciculturaEtapa + 2);
            botResponse = pisciculturaRecursosQuestions[3]; // Pergunta sobre assistência técnica
          } else {
            botResponse = pisciculturaRecursosQuestions[pisciculturaEtapa + 1];

            // Configurar sugestões para perguntas específicas
            if (pisciculturaEtapa + 1 === 2) {
              // Recursos financeiros
              setSuggestions([
                { text: "Próprios", action: "Próprios" },
                { text: "Financiamento", action: "Financiamento" },
                { text: "Misto", action: "Próprios e Financiamento" },
              ]);
            } else if (
              pisciculturaEtapa + 1 === 3 ||
              pisciculturaEtapa + 1 === 4
            ) {
              // Assistência técnica
              setSuggestions([
                { text: "Sim", action: "Sim" },
                { text: "Não", action: "Não" },
                { text: "Eventual", action: "Eventual" },
              ]);
            } else {
              setSuggestions([]);
            }
          }
        } else {
          // Avançar para a seção de observações
          setPisciculturaSecao("observacoes");
          setPisciculturaEtapa(0);
          botResponse =
            "Você tem alguma observação adicional sobre o empreendimento? (Opcional, digite 'Não' para pular)";
          setSuggestions([{ text: "Não", action: "Não" }]);
        }
      } else if (pisciculturaSecao === "observacoes") {
        // Processar observações
        if (
          userMessage.toLowerCase() !== "não" &&
          userMessage.toLowerCase() !== "nao"
        ) {
          const novosDados = { ...dadosPiscicultura };
          novosDados.observacoes = userMessage;
          setDadosPiscicultura(novosDados);
        }

        // Gerar resumo e ir para tela de confirmação
        setPisciculturaSecao("resumo");
        setPisciculturaEtapa(0);
        botResponse = gerarResumoPiscicultura();
setSuggestions([
          { text: "Confirmar", action: "confirmar" },
          { text: "Cancelar", action: "cancelar" },
        ]);
      } else if (pisciculturaSecao === "resumo") {
        // Processar confirmação de dados
        if (
          userMessage.toLowerCase().includes("confirmar") ||
          userMessage.toLowerCase().includes("sim") ||
          userMessage.toLowerCase().includes("correto")
        ) {
          // Finalizar cadastro e salvar no Firebase
          const success = await salvarPisciculturaNoFirebase();

          if (success) {
            // Avançar para solicitação de serviço
            setModo("solicitacao");
            botResponse =
              "Seu cadastro de piscicultura foi salvo com sucesso! Agora, diga qual serviço você deseja solicitar:";
            setSuggestions(servicosSugestoes);
          } else {
            botResponse =
              "Houve um erro ao salvar seu cadastro. Por favor, tente novamente mais tarde.";
            setModo("inicio");
            setSuggestions(initialSuggestions);
          }
        } else if (userMessage.toLowerCase().includes("editar")) {
          botResponse =
            "Funcionalidade de edição em desenvolvimento. Por favor, recomece o cadastro se precisar corrigir informações.";
        } else if (userMessage.toLowerCase().includes("cancelar")) {
          // Cancelar cadastro
          setModo("inicio");
          botResponse = "Cadastro cancelado. Como posso ajudar você?";
          setSuggestions(initialSuggestions);
        } else {
          botResponse =
            "Por favor, confirme se os dados estão corretos digitando 'confirmar', ou 'cancelar' para recomeçar.";
        }
      }
    }
    // Modo início (menu principal)
    else {
      if (
        userMessage.toLowerCase().includes("cadastro") &&
        !userMessage.toLowerCase().includes("piscicultura")
      ) {
        setModo("cadastro");
        setUsuarioCadastrado(null);
        botResponse = "Você já possui cadastro em nossa secretaria? (sim/não)";
        setSuggestions([
          { text: "Sim", action: "sim" },
          { text: "Não", action: "não" },
        ]);
      } else if (
        userMessage.toLowerCase().includes("agricultura") ||
        userMessage.toLowerCase().includes("pesca") ||
        userMessage.toLowerCase().includes("paa")
      ) {
        setModo("servico");
        setServicoAtual(userMessage);

        botResponse = "Você já possui cadastro em nossa secretaria? (sim/não)";
        setSuggestions([
          { text: "Sim", action: "sim" },
          { text: "Não", action: "não" },
        ]);
      } else if (
        userMessage.toLowerCase().includes("piscicultura") ||
        userMessage.toLowerCase().includes("peixes") ||
        userMessage.toLowerCase().includes("aquicultura")
      ) {
        setModo("piscicultura");
        setPisciculturaEtapa(0);
        setPisciculturaSecao("empreendedor");
        botResponse =
          "Vamos iniciar seu cadastro para o setor de Piscicultura. " +
          pisciculturaEmpreendedorQuestions[0];
        setSuggestions([]);
      } else {
        // Resposta genérica para outras mensagens
        botResponse =
          "Como posso ajudar você? Você pode escolher uma das opções abaixo ou perguntar sobre agricultura, pesca, piscicultura ou o Programa de Aquisição de Alimentos (PAA).";
      }
    }

    // Adiciona resposta do bot
    addMessage(botResponse, false);
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processUserMessage(input);
    setInput("");
  };

  const handleSuggestionClick = (suggestion: SuggestionButton) => {
    const text = suggestion.text;
    processUserMessage(text);
    setInput(""); // Limpar o campo de input após clicar no botão de sugestão
  };

  const voltarAoInicio = () => {
    setModo("inicio");
    setCadastroEtapa(-1);
    setCadastroRespostas([]);
    setSubFluxo(null);
    setSubFluxoEtapa(0);
    setIndexQuestaoAgropecuaria(0);
    setSuggestions(initialSuggestions);
    addMessage("Como posso ajudar você hoje?", false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg"
        >
          <MessageCircle size={24} />
        </Button>
      ) : (
        <Card
          className="w-80 sm:w-96 shadow-xl flex flex-col"
          style={{ maxHeight: "80vh" }}
        >
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              {(modo !== "inicio" || subFluxo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={voltarAoInicio}
                  className="h-8 w-8 p-0 text-white hover:bg-green-700"
                >
                  <ArrowLeft size={16} />
                </Button>
              )}
              <h3 className="font-medium">Assistente Virtual</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-700"
            >
              <X size={20} />
            </Button>
          </div>

          {modo === "piscicultura" && (
            <div className="px-3 py-1 bg-green-100 text-green-800 text-xs border-b border-green-200">
              {pisciculturaSecao === "empreendedor" &&
                `Empreendedor - Pergunta ${pisciculturaEtapa + 1} de ${pisciculturaEmpreendedorQuestions.length}`}
              {pisciculturaSecao === "atividade" &&
                `Atividade - Pergunta ${pisciculturaEtapa + 1} de ${pisciculturaAtividadeQuestions.length}`}
              {pisciculturaSecao === "estrutura" && `Estrutura Aquícola`}
              {pisciculturaSecao === "obras" && `Obras`}
              {pisciculturaSecao === "especies" && `Espécies`}
              {pisciculturaSecao === "detalhamento" &&
                `Detalhamento da Propriedade`}
              {pisciculturaSecao === "recursos" && `Recursos`}
              {pisciculturaSecao === "observacoes" && `Observações`}
            </div>
          )}

          <CardContent className="p-0 flex flex-col h-[500px] relative">
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-[85%] ${
                      msg.isUser
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split("\n").length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {modo === "localizacao" &&
              userLocation === null &&
              !isAskingLocation && (
                <div className="sticky bottom-[110px] flex justify-center">
                  <Button
                    onClick={getUserLocation}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <MapPin size={16} />
                    Obter localização atual
                  </Button>
                </div>
              )}

            {suggestions.length > 0 && (
              <div className="sticky bottom-[60px] p-2 border-t flex flex-wrap gap-2 bg-gray-50 z-10">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white hover:bg-green-50 border-green-200 text-green-800"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="p-3 border-t flex items-center"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="ml-2 bg-green-600 hover:bg-green-700"
                disabled={isLoading || !input.trim()}
              >
                <Send size={20} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;