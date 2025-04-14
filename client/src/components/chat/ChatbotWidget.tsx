// client/src/components/chat/ChatbotWidget.tsx
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, X, ArrowLeft, MapPin, Info } from "lucide-react";
import { db } from "@/utils/firebase";
import LocationMap from "../common/LocationMap";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAIResponse } from '@/lib/openrouter';
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

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Estrutura de fluxo de conversação do chatbot
const fluxoConversa = {
  saudacao: {
    pergunta: "Olá! Sou o assistente da SEMAPA. Sobre qual setor deseja informações?",
    opcoes: ["Agricultura", "Pesca", "PAA", "Secretaria"],
    redirecionamento: {
      "Agricultura": "fluxoAgricultura",
      "Pesca": "fluxoPesca",
      "PAA": "fluxoPAA",
      "Secretaria": "fluxoSecretaria"
    }
  },
  fluxoAgricultura: {
    informativo: [
      "📌 O setor agrícola oferece:",
      "- Assistência técnica rural",
      "- Programas de mecanização",
      "- Acesso a insumos agrícolas",
      "- Análise de solo",
      "- Distribuição de mudas",
      "Temos dois tipos de formulários disponíveis:",
      "- [Pré-Cadastro]: formulário rápido e simples",
      "- [Cadastro Completo]: formulário detalhado com todas as informações",
      "O que deseja fazer?"
    ],
    acoes: {
      "Pré-Cadastro": "abrirFormulario('agricultura')",
      "Cadastro Completo": "abrirFormulario('agricultura-completo')",
      "Mais Informações": "detalhesAgricultura"
    }
  },
  fluxoPesca: {
    informativo: [
      "📌 O setor de pesca oferece:",
      "- Suporte à piscicultura",
      "- Orientação para licenciamento",
      "- Assistência técnica especializada",
      "- Programas de incentivo à produção",
      "Temos dois tipos de formulários disponíveis:",
      "- [Pré-Cadastro]: formulário rápido e simples",
      "- [Cadastro Completo]: formulário detalhado com todas as informações",
      "O que deseja fazer?"
    ],
    acoes: {
      "Pré-Cadastro": "abrirFormulario('pesca')",
      "Cadastro Completo": "abrirFormulario('pesca-completo')",
      "Mais Informações": "detalhesPesca"
    }
  },
  fluxoPAA: {
    informativo: [
      "📌 O Programa de Aquisição de Alimentos (PAA) oferece:",
      "- Compra institucional de produtos da agricultura familiar",
      "- Apoio à comercialização",
      "- Acesso a mercados",
      "- Preços justos e garantidos",
      "Deseja [Mais Informações] ou [Participar do PAA]?"
    ],
    acoes: {
      "Participar do PAA": "abrirFormulario('paa')",
      "Mais Informações": "detalhesPAA"
    }
  },
  fluxoSecretaria: {
    informativo: [
      "📌 A Secretaria Municipal de Agricultura, Pesca e Abastecimento (SEMAPA):",
      "- Localizada na Av. Principal, nº 500",
      "- Atendimento: Segunda a Sexta, 8h às 14h",
      "- Telefone: (99) 3333-4444",
      "- Email: semapa@prefeitura.gov.br",
      "Como podemos ajudar você hoje?"
    ],
    acoes: {
      "Contato com Secretário": "contatoSecretario",
      "Políticas Públicas": "politicasPublicas",
      "Eventos e Calendário": "eventosCalendario"
    }
  },
  detalhesAgricultura: {
    informativo: [
      "📋 Detalhes dos serviços agrícolas:",
      "1. Assistência Técnica: Visitas periódicas de técnicos às propriedades",
      "2. Mecanização: Preparo de solo, plantio e colheita com maquinário",
      "3. Insumos: Sementes, adubo e calcário para pequenos produtores",
      "4. Análise de Solo: Coleta e análise laboratorial",
      "5. Distribuição de Mudas: Espécies frutíferas e florestais nativas",
      "",
      "📝 Sobre nossos formulários:",
      "- Pré-Cadastro: Formulário rápido com dados básicos (nome, contato, propriedade)",
      "- Cadastro Completo: Formulário detalhado com todas as informações (documentação, dados da propriedade, necessidades específicas)",
      "",
      "Qual opção você prefere?"
    ],
    acoes: {
      "Pré-Cadastro": "abrirFormulario('agricultura')",
      "Cadastro Completo": "abrirFormulario('agricultura-completo')",
      "Voltar": "fluxoAgricultura"
    }
  },
  detalhesPesca: {
    informativo: [
      "📋 Detalhes dos serviços de pesca:",
      "1. Piscicultura: Orientação sobre criação, manejo e comercialização",
      "2. Licenciamento: Apoio para documentação ambiental e autorizações",
      "3. Assistência Especializada: Técnicos capacitados em aquicultura",
      "4. Incentivos: Acesso a programas de crédito e subsídios",
      "",
      "📝 Sobre nossos formulários:",
      "- Pré-Cadastro: Formulário rápido com dados básicos do pescador e atividade",
      "- Cadastro Completo: Formulário detalhado com todas as informações (estruturas, espécies, situação legal, etc.)",
      "",
      "Qual opção você prefere?"
    ],
    acoes: {
      "Pré-Cadastro": "abrirFormulario('pesca')",
      "Cadastro Completo": "abrirFormulario('pesca-completo')",
      "Voltar": "fluxoPesca"
    }
  },
  detalhesPAA: {
    informativo: [
      "📋 Detalhes do Programa de Aquisição de Alimentos:",
      "1. Como Participar: Ser agricultor familiar com DAP/CAF ativa",
      "2. Produtos Aceitos: Hortifruti, grãos, laticínios, etc.",
      "3. Preços: Baseados na tabela da CONAB atualizada",
      "4. Entregas: Cronograma semanal em pontos específicos",
      "5. Pagamentos: Em até 30 dias após entrega",
      "Deseja [Participar do PAA] ou tem mais alguma dúvida?"
    ],
    acoes: {
      "Participar do PAA": "abrirFormulario('paa')",
      "Voltar": "fluxoPAA"
    }
  },
  contatoSecretario: {
    informativo: [
      "📞 Contato com o Secretário:",
      "- Agendamento de audiências às quintas-feiras",
      "- Telefone do gabinete: (99) 3333-4445",
      "- Email: secretario.semapa@prefeitura.gov.br",
      "Deseja [Agendar Audiência] ou [Voltar]?"
    ],
    acoes: {
      "Agendar Audiência": "abrirFormulario('agenda')",
      "Voltar": "fluxoSecretaria"
    }
  },
  politicasPublicas: {
    informativo: [
      "📑 Políticas Públicas da SEMAPA:",
      "- Plano Municipal de Agricultura Familiar",
      "- Programa de Segurança Alimentar",
      "- Incentivos à Produção Sustentável",
      "- Apoio à Comercialização",
      "Para mais informações, visite nosso portal ou [Voltar]"
    ],
    acoes: {
      "Visitar Portal": "visitarPortal",
      "Voltar": "fluxoSecretaria"
    }
  },
  eventosCalendario: {
    informativo: [
      "🗓️ Próximos eventos:",
      "- 15/05: Feira do Produtor Rural - Praça Central",
      "- 22/05: Capacitação em Manejo Agrícola - Centro de Formação",
      "- 05/06: Dia do Meio Ambiente - Atividades em todas as escolas",
      "- 20/06: Workshop de Piscicultura - Centro de Convenções",
      "Deseja receber lembretes destes eventos ou [Voltar]?"
    ],
    acoes: {
      "Receber Lembretes": "cadastrarLembretes",
      "Voltar": "fluxoSecretaria"
    }
  }
};

// Botões de sugestão iniciais
const initialSuggestions: SuggestionButton[] = [
  { text: "Agricultura", action: "fluxoAgricultura" },
  { text: "Pesca", action: "fluxoPesca" },
  { text: "PAA", action: "fluxoPAA" },
  { text: "Secretaria", action: "fluxoSecretaria" },
];

// Lista de opções de serviços para formulários
const servicosSugestoes: SuggestionButton[] = [
  { text: "Assistência técnica", action: "Assistência técnica" },
  { text: "Mecanização agrícola", action: "Mecanização agrícola" },
  { text: "Análise de solo", action: "Análise de solo" },
  { text: "Distribuição de mudas", action: "Distribuição de mudas" },
  { text: "Capacitação", action: "Capacitação" },
  { text: "Outro serviço", action: "Outro serviço" },
];

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionButton[]>(initialSuggestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [activeFluxo, setActiveFluxo] = useState<string>("saudacao");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isAskingLocation, setIsAskingLocation] = useState<boolean>(false);
  const [setorAtivo, setSetorAtivo] = useState<string>("agricultura");
  const [responseCache, setResponseCache] = useState<Record<string, string>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [trainingData, setTrainingData] = useState("");

  // Efeitos
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const saudacao = fluxoConversa.saudacao.pergunta;
      setMessages([
        {
          text: saudacao,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      setSuggestions(Object.keys(fluxoConversa.saudacao.redirecionamento).map(opcao => ({text: opcao, action: opcao})));
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('admin') === 'true');
  }, []);

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
          addMessage(
            "Deseja tentar novamente ou prosseguir sem informações de localização?",
            false,
          );
          setSuggestions([
            { text: "Tentar novamente", action: "tentar novamente" },
            { text: "Prosseguir sem localização", action: "prosseguir" },
          ]);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      console.error("Geolocation não suportado.");
      setIsAskingLocation(false);
      addMessage(
        "Geolocation não é suportado pelo seu navegador. Vamos prosseguir sem informações de localização.",
        false,
      );
    }
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

  // Função para abrir formulário em nova aba
  const abrirFormulario = (formType: string) => {
    // Extrair setor do tipo de formulário
    const setor = formType.split('-')[0]; // 'agricultura-completo' -> 'agricultura'
    const isCompleto = formType.includes('-completo');

    // Salvar contexto da conversa para uso posterior
    localStorage.setItem('chatContext', JSON.stringify({
      ultimasMensagens: messages.slice(-5),
      setor: setor,
      formType: formType,
      isCompleto: isCompleto,
      userLocation: userLocation
    }));

    // Determinar a URL correta para o formulário
    let formUrl = `/forms/${setor}`;
    if (isCompleto) {
      formUrl = `/forms/${setor}-completo`;
    }

    // Abrir formulário em nova aba
    window.open(formUrl, '_blank');

    // Mensagem apropriada com base no tipo de formulário
    if (isCompleto) {
      addMessage(`Estou abrindo o formulário de cadastro completo do setor de ${setor} em uma nova aba.`, false);
    } else {
      addMessage(`Estou abrindo o formulário de pré-cadastro do setor de ${setor} em uma nova aba.`, false);
    }
    addMessage("Você pode continuar nossa conversa aqui após preencher o formulário.", false);

    return false; // Impede processamento adicional
  };

  // Construir o contexto para a IA
  const buildAIContext = () => {
    return `
      Setor Ativo: ${setorAtivo}
      Últimas Mensagens: ${JSON.stringify(messages.slice(-3))}
      Formulários Disponíveis:
      - Agricultura Pré-Cadastro: /forms/agricultura
      - Agricultura Cadastro Completo: /forms/agricultura-completo
      - Pesca Pré-Cadastro: /forms/pesca
      - Pesca Cadastro Completo: /forms/pesca-completo
      - PAA: /forms/paa
      Dados do Município: Vitória do Xingu/PA
    `;
  };

  // Estado para armazenar as respostas treinadas
  const [trainedResponses, setTrainedResponses] = useState<Array<{question: string, answer: string}>>([]);
  
  // Carregar respostas treinadas do Firebase
  useEffect(() => {
    const fetchTrainedResponses = async () => {
      try {
        const trainingsRef = collection(db, 'ai_training');
        const q = query(trainingsRef, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const allExamples: Array<{question: string, answer: string}> = [];
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.examples && Array.isArray(data.examples)) {
            allExamples.push(...data.examples);
          }
        });
        
        console.log('Respostas treinadas carregadas:', allExamples.length);
        setTrainedResponses(allExamples);
      } catch (error) {
        console.error('Erro ao carregar respostas treinadas:', error);
      }
    };
    
    fetchTrainedResponses();
  }, []);

  // Tentar responder com o fluxo programático
  const tryProgrammaticFlow = (userMessage: string) => {
    // Verificar se está respondendo sobre localização
    if (isAskingLocation && 
        (userMessage.toLowerCase().includes("tentar novamente") || 
         userMessage.toLowerCase().includes("prosseguir"))) {
      if (userMessage.toLowerCase().includes("tentar novamente")) {
        getUserLocation();
        return { shouldRespond: true, response: "" };
      } else if (userMessage.toLowerCase().includes("prosseguir")) {
        setIsAskingLocation(false);
        // Continuar o fluxo sem localização
        return { shouldRespond: true, response: "Continuando sem localização." };
      }
    }

    // Verificar se há resposta treinada para a mensagem
    const normalizedUserMessage = userMessage.toLowerCase().trim();
    const trainedResponse = trainedResponses.find(item => {
      // Verifica se a pergunta treinada é semelhante à mensagem do usuário
      const normalizedQuestion = item.question.toLowerCase().trim();
      return normalizedUserMessage.includes(normalizedQuestion) || 
             normalizedQuestion.includes(normalizedUserMessage) ||
             normalizedUserMessage === normalizedQuestion;
    });

    if (trainedResponse) {
      console.log('Resposta encontrada no treinamento:', trainedResponse);
      return { shouldRespond: true, response: trainedResponse.answer };
    }

    // Processar ações do fluxo de conversa
    if (userMessage.toLowerCase().includes("solicitar serviço") || 
        userMessage.toLowerCase().includes("participar do paa")) {
      const setor = activeFluxo.replace("fluxo", "").toLowerCase();
      abrirFormulario(setor);
      return { shouldRespond: true, response: "" };
    }

    // Processar navegação entre fluxos
    let novoFluxo = activeFluxo;
    let resposta = "";

    // Verificar se a mensagem corresponde a alguma ação no fluxo atual
    if (fluxoConversa[activeFluxo as keyof typeof fluxoConversa]) {
      const fluxoAtual = fluxoConversa[activeFluxo as keyof typeof fluxoConversa] as any;

      // Verificar redirecionamentos no fluxo de saudação
      if (activeFluxo === "saudacao" && fluxoAtual.redirecionamento) {
        for (const [chave, destino] of Object.entries(fluxoAtual.redirecionamento)) {
          if (userMessage.toLowerCase().includes(chave.toLowerCase())) {
            novoFluxo = destino as string;
            break;
          }
        }
      } 
      // Verificar ações nos demais fluxos
      else if (fluxoAtual.acoes) {
        for (const [chave, acao] of Object.entries(fluxoAtual.acoes)) {
          if (userMessage.toLowerCase().includes(chave.toLowerCase())) {
            if (typeof acao === 'string' && acao.startsWith("abrirFormulario")) {
              const setor = acao.match(/'([^']+)'/)?.[1] || "agricultura";
              abrirFormulario(setor);
              return { shouldRespond: true, response: "" };
            } else {
              novoFluxo = acao as string;
              break;
            }
          }
        }
      }
    }

    // Se encontrou um novo fluxo, atualiza e obtém a resposta
    if (novoFluxo !== activeFluxo) {
      setActiveFluxo(novoFluxo);

      if (fluxoConversa[novoFluxo as keyof typeof fluxoConversa]) {
        const novoFluxoObj = fluxoConversa[novoFluxo as keyof typeof fluxoConversa] as any;
        if (novoFluxoObj.informativo) {
          resposta = novoFluxoObj.informativo.join("\n");
        }

        // Atualizar sugestões baseadas nas ações do novo fluxo
        if (novoFluxoObj.acoes) {
          const novasSugestoes = Object.keys(novoFluxoObj.acoes).map(chave => ({
            text: chave,
            action: chave
          }));
          setSuggestions(novasSugestoes);
        } else {
          setSuggestions([]);
        }

        return { shouldRespond: true, response: resposta };
      }
    }

    // Não encontrou resposta no fluxo programático
    return { shouldRespond: false, response: "" };
  };

  // Avaliar resposta
  const rateResponse = async (messageIndex: number, isGood: boolean) => {
    try {
      const message = messages[messageIndex];
      await addDoc(collection(db, 'ai_feedback'), {
        question: messages[messageIndex - 1]?.text || '',
        answer: message.text,
        isGood,
        timestamp: serverTimestamp()
      });

      addMessage(isGood ? "Obrigado pelo feedback positivo!" : "Obrigado pelo feedback. Tentaremos melhorar.", false);
    } catch (error) {
      console.error("Erro ao salvar feedback:", error);
    }
  };

  // Treinar IA
  const trainAI = async () => {
    try {
      const examples = trainingData.split('\n\n').map(example => {
        const [q, r] = example.split('\n');
        return {
          question: q.replace('Q: ', ''),
          answer: r.replace('R: ', '')
        };
      });

      await addDoc(collection(db, 'ai_training'), {
        examples,
        timestamp: serverTimestamp(),
        trainedBy: 'admin'
      });

      addMessage('Dados de treinamento enviados com sucesso!', false);
      setTrainingData("");
    } catch (error) {
      console.error("Erro no treinamento:", error);
      addMessage('Erro ao enviar dados de treinamento', false);
    }
  };

  // Processar mensagem do usuário
  const processUserMessage = async (userMessage: string) => {
    setIsLoading(true);

    // Adiciona mensagem do usuário
    addMessage(userMessage, true);

    // Verificar cache de respostas
    const cachedResponse = responseCache[userMessage.toLowerCase()];
    if (cachedResponse) {
      console.log("Resposta encontrada no cache:", userMessage);
      addMessage(cachedResponse, false);
      setIsLoading(false);
      return;
    }

    // 1. Primeiro tente o fluxo programático (inclui agora respostas treinadas)
    const flowResponse = tryProgrammaticFlow(userMessage);
    if (flowResponse.shouldRespond) {
      if (flowResponse.response) {
        console.log("Resposta encontrada no fluxo programático ou treinamento");
        addMessage(flowResponse.response, false);
        
        // Adicionar à cache
        setResponseCache(prev => ({
          ...prev,
          [userMessage.toLowerCase()]: flowResponse.response
        }));
      }
      setIsLoading(false);
      return;
    }

    // 2. Se não encontrou no fluxo ou treinamento, use a IA OpenRouter
    console.log("Tentando obter resposta da IA OpenRouter...");
    try {
      const context = buildAIContext();
      
      // Adiciona os exemplos treinados ao contexto
      const trainedExamples = trainedResponses.slice(0, 5).map(ex => 
        `Q: ${ex.question}\nR: ${ex.answer}`
      ).join('\n\n');
      
      const enrichedContext = `
        ${context}
        
        Exemplos de treinamento:
        ${trainedExamples}
      `;
      
      const aiResponse = await getAIResponse(userMessage, enrichedContext);
      console.log("Resposta da IA recebida:", aiResponse.substring(0, 100) + "...");

      // Processar resposta da IA para ações especiais
      if (aiResponse.includes('[[FORMULARIO_AGRICULTURA]]')) {
        abrirFormulario('agricultura');
      } else if (aiResponse.includes('[[FORMULARIO_AGRICULTURA_COMPLETO]]')) {
        abrirFormulario('agricultura-completo');
      } else if (aiResponse.includes('[[FORMULARIO_PESCA]]')) {
        abrirFormulario('pesca');
      } else if (aiResponse.includes('[[FORMULARIO_PESCA_COMPLETO]]')) {
        abrirFormulario('pesca-completo');
      } else if (aiResponse.includes('[[FORMULARIO_PAA]]')) {
        abrirFormulario('paa');
      } else {
        addMessage(aiResponse, false);

        // Adicionar à cache
        setResponseCache(prev => ({
          ...prev,
          [userMessage.toLowerCase()]: aiResponse
        }));
      }
    } catch (error) {
      console.error("Erro na IA:", error);
      
      // Se houver erro na IA, tentar usar uma resposta genérica baseada em palavras-chave
      const lowercaseMsg = userMessage.toLowerCase();
      let genericResponse = "Desculpe, estou com dificuldades para processar sua solicitação. Você pode tentar perguntar sobre nossos serviços de agricultura, pesca ou PAA?";
      
      if (lowercaseMsg.includes("agricultura") || lowercaseMsg.includes("plantação") || lowercaseMsg.includes("plantar") || lowercaseMsg.includes("trator")) {
        genericResponse = "Para informações sobre serviços de agricultura, você pode preencher nosso formulário de pré-cadastro ou formulário completo. Deseja acessar algum deles?";
        setSuggestions([
          { text: "Formulário de Agricultura", action: "Pré-Cadastro" },
          { text: "Formulário Completo", action: "Cadastro Completo" }
        ]);
      } else if (lowercaseMsg.includes("pesca") || lowercaseMsg.includes("peixe") || lowercaseMsg.includes("pescar")) {
        genericResponse = "Para informações sobre serviços de pesca, você pode preencher nosso formulário de pré-cadastro ou formulário completo. Deseja acessar algum deles?";
        setSuggestions([
          { text: "Formulário de Pesca", action: "Pré-Cadastro" },
          { text: "Formulário Completo", action: "Cadastro Completo" }
        ]);
      } else if (lowercaseMsg.includes("paa") || lowercaseMsg.includes("aquisição") || lowercaseMsg.includes("alimentos")) {
        genericResponse = "O Programa de Aquisição de Alimentos (PAA) oferece compra institucional de produtos da agricultura familiar. Deseja participar?";
        setSuggestions([
          { text: "Participar do PAA", action: "Participar do PAA" }
        ]);
      }
      
      addMessage(genericResponse, false);
    }

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
    setInput("");
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);

    // Ajustar o setor ativo baseado na tab
    if (tab !== "chat") {
      setSetorAtivo(tab);
      // Preparar o contexto para possível abertura de formulário
      const setorMap: Record<string, string> = {
        "agricultura": "agricultura",
        "pesca": "pesca",
        "paa": "paa"
      };

      if (setorMap[tab]) {
        const informacoesSetor = fluxoConversa[`fluxo${tab.charAt(0).toUpperCase() + tab.slice(1)}` as keyof typeof fluxoConversa] as any;
        if (informacoesSetor && informacoesSetor.informativo) {
          // Não adicionar às mensagens, apenas mostrar na tab
        }
      }
    }
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
          style={{ height: "600px", maxHeight: "80vh" }}
        >
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">Assistente SEMAPA</h3>
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

          <Tabs defaultValue="chat" onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-4 p-0 bg-green-50">
              <TabsTrigger value="chat" className="text-xs">💬 Chat</TabsTrigger>
              <TabsTrigger value="agricultura" className="text-xs">🌱 Agricultura</TabsTrigger>
              <TabsTrigger value="pesca" className="text-xs">🎣 Pesca</TabsTrigger>
              <TabsTrigger value="paa" className="text-xs">🛒 PAA</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="p-0 m-0">
              <CardContent className="p-0 flex flex-col h-[500px] relative">
                <div className="flex-1 overflow-y-auto p-4 pb-20 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`mb-4 flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`p-3 rounded-lg max-w-[85%] break-words overflow-hidden overflow-wrap-anywhere whitespace-pre-wrap group relative ${
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
                        {!msg.isUser && (
                          <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 bg-white/80 rounded p-1">
                            <Button variant="ghost" size="xs" onClick={() => rateResponse(idx, true)}>👍</Button>
                            <Button variant="ghost" size="xs" onClick={() => rateResponse(idx, false)}>👎</Button>
                          </div>
                        )}
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

                {userLocation && (
                  <div className="p-2 border-t">
                    <LocationMap 
                      latitude={userLocation.latitude} 
                      longitude={userLocation.longitude}
                      height={150}
                    />
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className="absolute bottom-[70px] left-0 right-0 p-2 border-t flex flex-wrap gap-2 bg-gray-50 z-10 mx-auto w-full rounded-b-lg shadow-md">
                    <div className="w-full flex flex-wrap gap-2">
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
                  </div>
                )}

                <form
                  onSubmit={handleSubmit}
                  className="p-3 border-t flex items-center sticky bottom-0 bg-white"
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

                {isAdmin && (
                  <div className="p-3 border-t bg-gray-50">
                    <details>
                      <summary className="font-medium cursor-pointer">⚙️ Treinamento da IA</summary>
                      <div className="mt-2 space-y-3">
                        <p className="text-xs text-gray-600">
                          Adicione exemplos de perguntas e respostas para treinar o chatbot. 
                          Separe cada par com linha em branco. Use o formato:
                        </p>
                        <div className="bg-gray-100 p-2 rounded text-xs">
                          <pre>Q: Como solicitar assistência técnica?
R: Para solicitar assistência técnica, preencha o formulário de Agricultura.

Q: Quais documentos preciso para o PAA?
R: Para participar do PAA, você precisa ter DAP/CAF ativa. Preencha o formulário PAA.</pre>
                        </div>
                        <Textarea 
                          placeholder="Adicione exemplos de perguntas e respostas (Q: Pergunta&#10;R: Resposta)"
                          value={trainingData}
                          onChange={(e) => setTrainingData(e.target.value)}
                          rows={6}
                        />
                        <div className="flex gap-2">
                          <Button 
                            onClick={trainAI}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Treinar Modelo
                          </Button>
                          <Button 
                            onClick={() => setTrainingData("")}
                            variant="outline"
                          >
                            Limpar
                          </Button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          O treino melhora a capacidade da IA de responder a perguntas específicas sobre os serviços da SEMAPA.
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </CardContent>
            </TabsContent>

            <TabsContent value="agricultura" className="p-0 m-0">
              <div className="p-4 bg-green-50/50">
                <h4 className="font-semibold text-green-800 mb-2">Setor de Agricultura</h4>
                <div className="space-y-2 text-sm">
                  <p>O setor agrícola oferece serviços de apoio ao produtor rural:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Assistência técnica rural</li>
                    <li>Programas de mecanização</li>
                    <li>Acesso a insumos agrícolas</li>
                    <li>Análise de solo</li>
                    <li>Distribuição de mudas e sementes</li>
                  </ul>
                  <p className="mt-3 text-gray-600">Horário de atendimento: Segunda a Sexta, 8h às 14h</p>

                  <div className="mt-4 p-3 bg-white rounded-md border border-green-200">
                    <h5 className="font-medium text-green-800 mb-2">Tipos de formulários disponíveis:</h5>
                    <div className="space-y-1 mb-3">
                      <p><span className="font-medium">Pré-Cadastro:</span> Formulário rápido e simplificado para um primeiro contato</p>
                      <p><span className="font-medium">Cadastro Completo:</span> Formulário detalhado com todas as informações necessárias</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    onClick={() => abrirFormulario('agricultura')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Pré-Cadastro
                  </Button>
                  <Button 
                    onClick={() => abrirFormulario('agricultura-completo')}
                    className="bg-green-800 hover:bg-green-900"
                  >
                    Cadastro Completo
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pesca" className="p-0 m-0">
              <div className="p-4 bg-blue-50/50">
                <h4 className="font-semibold text-blue-800 mb-2">Setor de Pesca</h4>
                <div className="space-y-2 text-sm">
                  <p>O setor de pesca oferece:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Suporte à piscicultura</li>
                    <li>Orientação para licenciamento</li>
                    <li>Assistência técnica especializada</li>
                    <li>Programas de incentivo à produção</li>
                  </ul>
                  <p className="mt-3 text-gray-600">Responsável: Coord. de Pesca - (99) 3333-4446</p>

                  <div className="mt-4 p-3 bg-white rounded-md border border-blue-200">
                    <h5 className="font-medium text-blue-800 mb-2">Tipos de formulários disponíveis:</h5>
                    <div className="space-y-1 mb-3">
                      <p><span className="font-medium">Pré-Cadastro:</span> Formulário rápido e simplificado para um primeiro contato</p>
                      <p><span className="font-medium">Cadastro Completo:</span> Formulário detalhado com estruturas, espécies e situação legal</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Button 
                    onClick={() => abrirFormulario('pesca')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Pré-Cadastro
                  </Button>
                  <Button 
                    onClick={() => abrirFormulario('pesca-completo')}
                    className="bg-blue-800 hover:bg-blue-900"
                  >
                    Cadastro Completo
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paa" className="p-0 m-0">
              <div className="p-4 bg-amber-50/50">
                <h4 className="font-semibold text-amber-800 mb-2">Programa de Aquisição de Alimentos</h4>
                <div className="space-y-2 text-sm">
                  <p>O PAA oferece:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Compra institucional de produtos da agricultura familiar</li>
                    <li>Apoio à comercialização</li>
                    <li>Acesso a mercados</li>
                    <li>Preços justos e garantidos</li>
                  </ul>
                  <p className="mt-3 text-gray-600">Requisitos: Ser agricultor familiar com DAP/CAF ativa</p>
                </div>
                <Button 
                  onClick={() => abrirFormulario('paa')}
                  className="mt-4 w-full bg-amber-600 hover:bg-amber-700"
                >
                  Participar do PAA
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;