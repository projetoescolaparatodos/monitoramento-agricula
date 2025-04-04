import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { db } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SuggestionButton {
  text: string;
  action: string;
}

// Fluxos de conversa
const botResponses = [
  {
    keywords: ["olá", "oi", "hey", "bom dia", "boa tarde", "boa noite"],
    response:
      "Olá! Sou o assistente virtual da Secretaria de Agricultura. Como posso ajudar você hoje?",
  },
  {
    keywords: ["agricultura", "plantar", "plantação", "cultivo"],
    response:
      "Nossa Secretaria oferece diversos serviços como assistência técnica e mecanização agrícola. Gostaria de fazer um cadastro?",
  },
  {
    keywords: ["pesca", "pescador", "peixe"],
    response:
      "O setor de Pesca oferece apoio aos pescadores locais. Posso ajudar você a iniciar um cadastro?",
  },
  {
    keywords: ["paa", "programa", "alimentos"],
    response:
      "O PAA permite que agricultores familiares vendam seus produtos. Gostaria de informações sobre como participar?",
  },
];

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
  "Qual a coordenada S da propriedade?",
  "Qual a coordenada W da propriedade?",

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

  // Dados Agropecuários
  "Você cultiva cacau? (Sim/Não)",
  // ... outros itens agrícolas
];

// Perguntas específicas para cacau
const cacauQuestions = [
  "Quantos pés de cacau você cultiva?",
  "É safreiro? (Sim/Não)",
  "Qual a idade do plantio?",
  "Utiliza sementes CEPLAC? (Sim/Não)",
  "Qual a produção anual em KG?",
  "Possui plantio de cacau clonado? (Sim/Não)",
];

const initialSuggestions: SuggestionButton[] = [
  { text: "Quero fazer um cadastro", action: "cadastro" },
  { text: "Informações sobre Agricultura", action: "agricultura" },
  { text: "Informações sobre Pesca", action: "pesca" },
  { text: "Sobre o PAA", action: "paa" },
];

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cadastroEtapa, setCadastroEtapa] = useState(-1);
  const [cadastroRespostas, setCadastroRespostas] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionButton[]>(initialSuggestions);
  const [subFluxo, setSubFluxo] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<'inicio' | 'cadastro' | 'servico'>('inicio');
  const [servicoAtual, setServicoAtual] = useState<string>('');
  const [usuarioCadastrado, setUsuarioCadastrado] = useState<boolean | null>(null);


  // Efeitos
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          text: "Olá! Como posso ajudar você hoje? Selecione uma das opções abaixo ou digite sua mensagem.",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (cadastroEtapa >= 0) {
      setSuggestions(getContextualSuggestions(cadastroEtapa));
    }
  }, [cadastroEtapa]);

  // Funções auxiliares
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getContextualSuggestions = (etapa: number): SuggestionButton[] => {
    if (subFluxo === "cacau") {
      const currentCacauQuestion = cadastroEtapa - cadastroFluxo.length;
      if (currentCacauQuestion === 0) return []; // Quantidade de pés (campo numérico)
      if (currentCacauQuestion === 1 || currentCacauQuestion === 2) {
        return [
          { text: "Sim", action: "sim" },
          { text: "Não", action: "nao" },
        ];
      }
    }

    switch (etapa) {
      case 1:
        return [
          { text: "Física", action: "fisica" },
          { text: "Jurídica", action: "juridica" },
        ];
      case 4:
      case 5:
      case 6:
      case 7:
      case 21:
        return [
          { text: "Sim", action: "sim" },
          { text: "Não", action: "nao" },
        ];
      case 14:
        return [
          { text: "Masculino", action: "masculino" },
          { text: "Feminino", action: "feminino" },
        ];
      case 18:
        return [
          { text: "Analfabeto", action: "analfabeto" },
          { text: "Fundamental", action: "fundamental" },
          { text: "Médio", action: "medio" },
          { text: "Superior", action: "superior" },
        ];
      default:
        return [];
    }
  };

  const validateField = (etapa: number, resposta: string): boolean => {
    const numericFields = [3, 8, 9]; // Campos que devem ser numéricos
    if (numericFields.includes(etapa)) {
      return !isNaN(Number(resposta));
    }
    return true;
  };

  const findResponse = (userMessage: string): string => {
    const lowercaseMsg = userMessage.toLowerCase();
    for (const item of botResponses) {
      if (item.keywords.some((keyword) => lowercaseMsg.includes(keyword))) {
        return item.response;
      }
    }
    return "Desculpe, não entendi. Você pode escolher um destes tópicos:\n- Agricultura\n- Pesca\n- PAA";
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

  const saveCadastroToFirebase = async () => {
    const dadosCadastro = {
      propriedade: {
        nome: cadastroRespostas[0],
        tipo: cadastroRespostas[1],
        endereco: cadastroRespostas[2],
        tamanho: parseFloat(cadastroRespostas[3]),
        escriturada: cadastroRespostas[4],
        dapCaf: cadastroRespostas[5],
        car: cadastroRespostas[6],
        financiamento: cadastroRespostas[7],
        coordenadas: {
          s: cadastroRespostas[8],
          w: cadastroRespostas[9],
        },
      },
      proprietario: {
        nome: cadastroRespostas[10],
        cpf: cadastroRespostas[11],
        rg: cadastroRespostas[12],
        emissor: cadastroRespostas[13],
        sexo: cadastroRespostas[14],
        nascimento: cadastroRespostas[15],
        naturalidade: cadastroRespostas[16],
        mae: cadastroRespostas[17],
        escolaridade: cadastroRespostas[18],
        telefone: cadastroRespostas[19],
        associacao: cadastroRespostas[20],
      },
      agricultura: {
        cacau:
          cadastroRespostas[21] === "sim"
            ? {
                quantidade:
                  subFluxo === "cacau" ? parseInt(cadastroRespostas[22]) : 0,
                safreiro:
                  subFluxo === "cacau"
                    ? cadastroRespostas[23] === "sim"
                    : false,
                idade: subFluxo === "cacau" ? cadastroRespostas[24] : "",
              }
            : null,
      },
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "cadastros_agricolas"), dadosCadastro);
    } catch (error) {
      console.error("Erro ao salvar cadastro:", error);
    }
  };

  const processUserMessage = async (userMessage: string) => {
    setIsLoading(true);

    // Adiciona mensagem do usuário
    addMessage(userMessage, true);

    // Processa resposta
    let botResponse = "";

    if (modo === 'servico') {
        // Lógica para o fluxo de serviço
        botResponse = "Você escolheu o serviço: " + servicoAtual;
    } else if (subFluxo === "cacau") {
      const respostasCacau = [...cadastroRespostas, userMessage];
      setCadastroRespostas(respostasCacau);

      const nextQuestionIndex =
        cadastroFluxo.length + respostasCacau.length - 22;
      if (nextQuestionIndex < cacauQuestions.length) {
        botResponse = cacauQuestions[nextQuestionIndex];
      } else {
        setSubFluxo(null);
        botResponse =
          "Obrigado pelas informações sobre cacau! Vamos continuar...";
      }
    } else if (cadastroEtapa >= 0) {
      if (!validateField(cadastroEtapa, userMessage)) {
        botResponse = "Por favor, insira um valor válido.";
      } else {
        const novasRespostas = [...cadastroRespostas, userMessage];
        setCadastroRespostas(novasRespostas);

        // Verifica se iniciou subfluxo de cacau
        if (cadastroEtapa === 21 && userMessage.toLowerCase() === "sim") {
          setSubFluxo("cacau");
          botResponse = cacauQuestions[0];
        }
        // Final do cadastro
        else if (cadastroEtapa >= cadastroFluxo.length - 1) {
          await saveCadastroToFirebase();
          botResponse =
            "Cadastro concluído! Um técnico entrará em contato em breve.";
          setCadastroEtapa(-1);
          setCadastroRespostas([]);
          setModo('inicio');
        }
        // Próxima pergunta normal
        else {
          setCadastroEtapa((prev) => prev + 1);
          botResponse = cadastroFluxo[cadastroEtapa + 1];
        }
      }
    } else if (modo === 'cadastro') {
        if (usuarioCadastrado === null) {
            botResponse = "Você já possui cadastro? (sim/não)";
        } else if (usuarioCadastrado) {
            if (cadastroRespostas.length === 0) {
                botResponse = "Qual seu nome?";
            } else if (cadastroRespostas.length === 1) {
                botResponse = "Qual seu CPF?";
            } else if (cadastroRespostas.length === 2) {
                botResponse = "Qual o nome da propriedade?";
                setCadastroEtapa(0); // inicia o cadastro pulando as etapas
            } else {
                botResponse = "Dados inseridos com sucesso!";
            }
        } else {
            setCadastroEtapa(0);
            botResponse = cadastroFluxo[0];
        }

    } else {
      botResponse = findResponse(userMessage);
      if (userMessage.toLowerCase().includes("cadastro")) {
          setModo('cadastro');
          botResponse = "Ok, vamos verificar seu cadastro.";
      } else if (userMessage.toLowerCase().includes("agricultura") || userMessage.toLowerCase().includes("pesca") || userMessage.toLowerCase().includes("paa")) {
          setModo('servico');
          setServicoAtual(userMessage);
          botResponse = "Você selecionou o serviço: " + userMessage;
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

  const handleUsuarioCadastrado = (value: boolean) => {
      setUsuarioCadastrado(value);
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
        <Card className="w-80 sm:w-96 shadow-xl flex flex-col" style={{maxHeight: '80vh'}}>
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-medium">Assistente Virtual</h3>
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
                    className={`p-3 rounded-lg max-w-[80%] ${
                      msg.isUser
                        ? "bg-green-600 text-white rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
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

            {suggestions.length > 0 && (
              <div className="sticky bottom-[60px] p-2 border-t flex flex-wrap gap-2 bg-gray-50 z-10">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs bg-white hover:bg-green-50 border-green-200 text-green-800"
                    onClick={() => {
                      setInput(suggestion.action);
                      handleSubmit({
                        preventDefault: () => {},
                      } as React.FormEvent);
                    }}
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