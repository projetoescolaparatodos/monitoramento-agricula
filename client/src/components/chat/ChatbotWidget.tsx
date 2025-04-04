// client/src/components/common/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, ArrowLeft, MapPin } from "lucide-react";
import { db } from "@/utils/firebase";
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

// Botões de sugestão iniciais
const initialSuggestions: SuggestionButton[] = [
  { text: "Fazer cadastro rural", action: "cadastro" },
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
  >("inicio");
  const [servicoAtual, setServicoAtual] = useState<string>("");
  const [usuarioCadastrado, setUsuarioCadastrado] = useState<boolean | null>(
    null,
  );
  const [indexQuestaoAgropecuaria, setIndexQuestaoAgropecuaria] =
    useState<number>(0);
  const [solicitacao, setSolicitacao] = useState<string>("");
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
  const [skipLocationQuestions, setSkipLocationQuestions] = useState<boolean>(false);

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
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setIsAskingLocation(false);
          addMessage("Não foi possível obter sua localização.", false);
        },
      );
    } else {
      console.error("Geolocation não suportado.");
      setIsAskingLocation(false);
      addMessage("Geolocation não suportado.", false);
    }
  };


  const getContextualSuggestions = (): SuggestionButton[] => {
    // Modo solicitação
    if (modo === "solicitacao") {
      return servicosSugestoes;
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
          localizacao: userLocation
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
          associacao: cadastroRespostas[20] || ""
        },
        dadosAgropecuarios: dadosAgropecuarios,
        solicitacao: solicitacao,
        dataRegistro: new Date().toISOString(),
        status: "pendente",
        origem: "chatbot"
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

    // Modo solicitação - recebe a solicitação final e finaliza o processo
    if (modo === "solicitacao") {
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
    // Modo início (menu principal)
    else {
      if (userMessage.toLowerCase().includes("cadastro")) {
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
      } else {
        // Resposta genérica para outras mensagens
        botResponse =
          "Como posso ajudar você? Você pode escolher uma das opções abaixo ou perguntar sobre agricultura, pesca ou o Programa de Aquisição de Alimentos (PAA).";
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

          {modo === "localizacao" && userLocation === null && !isAskingLocation && (
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