import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { db } from '@/utils/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const botResponses = [
  {
    keywords: ['olá', 'oi', 'hey', 'bom dia', 'boa tarde', 'boa noite'],
    response: 'Olá! Sou o assistente virtual da Secretaria de Agricultura. Como posso ajudar você hoje?'
  },
  {
    keywords: ['agricultura', 'plantar', 'plantação', 'cultivo'],
    response: 'Nossa Secretaria oferece diversos serviços como assistência técnica e mecanização agrícola. Gostaria de fazer um cadastro?'
  },
  {
    keywords: ['pesca', 'pescador', 'peixe'],
    response: 'O setor de Pesca oferece apoio aos pescadores locais. Posso ajudar você a iniciar um cadastro?'
  },
  {
    keywords: ['paa', 'programa', 'alimentos'],
    response: 'O PAA permite que agricultores familiares vendam seus produtos. Gostaria de informações sobre como participar?'
  }
];

const cadastroFluxo = [
  // Dados da Propriedade
  'Qual o nome da propriedade?',
  'A propriedade é pessoa Física ou Jurídica?',
  'Qual o endereço da propriedade?',
  'Qual o tamanho da propriedade em hectares (ha)?',
  'A propriedade é escriturada? (Sim/Não)',
  'Possui DAP/CAF? (Sim/Não)',
  'Possui CAR? (Sim/Não)',
  'Possui Financiamento Rural? (Sim/Não)',
  'Qual a coordenada S da propriedade?',
  'Qual a coordenada W da propriedade?',

  // Dados do Proprietário
  'Qual seu nome completo?',
  'Qual seu CPF?',
  'Qual seu RG?',
  'Qual o órgão emissor e UF do RG?',
  'Qual seu sexo?',
  'Qual sua data de nascimento?',
  'Qual sua naturalidade?',
  'Qual o nome da sua mãe?',
  'Qual sua escolaridade? (Analfabeto/Fundamental Incompleto/Fundamental completo/Médio Incompleto/Médio completo/Superior Incompleto/Superior completo/Pós Graduação)',
  'Qual seu telefone para contato?',
  'É associado a alguma instituição? Se sim, qual?',

  // Dados Agropecuários
  'Você cultiva cacau? (Sim/Não)',
  'Cultiva frutíferas perenes? (Sim/Não)',
  'Possui cultivo de lavouras anuais? (Sim/Não)',
  'Produz mandioca/macaxeira? (Sim/Não)',
  'Produz arroz ou feijão? (Sim/Não)',
  'Produz olerícolas? (Sim/Não)',
  'Produz tuberosas? (Sim/Não)',
  'Possui criação de bovinos? (Sim/Não)',
  'Possui criação de caprinos/ovinos? (Sim/Não)',
  'Possui criação de suínos? (Sim/Não)',
  'Possui criação de aves? (Sim/Não)',

  'Obrigado por fornecer todas as informações! Um técnico entrará em contato em breve para dar continuidade ao seu cadastro.'
];

interface SuggestionButton {
  text: string;
  action: string;
}

const initialSuggestions: SuggestionButton[] = [
  { text: "Quero fazer um cadastro", action: "cadastro" },
  { text: "Informações sobre Agricultura", action: "agricultura" },
  { text: "Informações sobre Pesca", action: "pesca" },
  { text: "Sobre o PAA", action: "paa" }
];

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cadastroEtapa, setCadastroEtapa] = useState(-1);
  const [cadastroRespostas, setCadastroRespostas] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionButton[]>(initialSuggestions);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: 'Olá! Como posso ajudar você hoje? Selecione uma das opções abaixo ou digite sua mensagem.',
        isUser: false,
        timestamp: new Date()
      }]);
      setSuggestions(initialSuggestions);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const findResponse = (userMessage: string): string => {
    const lowercaseMsg = userMessage.toLowerCase();

    for (const item of botResponses) {
      if (item.keywords.some(keyword => lowercaseMsg.includes(keyword))) {
        return item.response;
      }
    }

    return 'Desculpe, não entendi. Você pode escolher um destes tópicos:\n- Agricultura\n- Pesca\n- PAA';
  };

  const processUserMessage = async (userMessage: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    let botResponse: string;

    if (cadastroEtapa >= 0) {
      const novasRespostas = [...cadastroRespostas, userMessage];
      setCadastroRespostas(novasRespostas);

      const novaEtapa = cadastroEtapa + 1;
      setCadastroEtapa(novaEtapa);

      if (novaEtapa >= cadastroFluxo.length) {
        botResponse = cadastroFluxo[cadastroFluxo.length - 1];
        setCadastroEtapa(-1);

        // Criar objeto com as respostas organizadas
        const dadosCadastro = {
          propriedade: {
            nome: novasRespostas[0],
            tipoPessoa: novasRespostas[1],
            endereco: novasRespostas[2],
            tamanho: novasRespostas[3],
            escriturada: novasRespostas[4],
            dapCaf: novasRespostas[5],
            car: novasRespostas[6],
            financiamentoRural: novasRespostas[7],
            coordenadaS: novasRespostas[8],
            coordenadaW: novasRespostas[9]
          },
          proprietario: {
            nome: novasRespostas[10],
            cpf: novasRespostas[11],
            rg: novasRespostas[12],
            emissorUf: novasRespostas[13],
            sexo: novasRespostas[14],
            dataNascimento: novasRespostas[15],
            naturalidade: novasRespostas[16],
            nomeMae: novasRespostas[17],
            escolaridade: novasRespostas[18],
            telefone: novasRespostas[19],
            instituicaoAssociada: novasRespostas[20]
          },
          agropecuaria: {
            cultivaCacau: novasRespostas[21],
            frutPerenes: novasRespostas[22],
            lavouraAnual: novasRespostas[23],
            mandioca: novasRespostas[24],
            arrozFeijao: novasRespostas[25],
            olericolas: novasRespostas[26],
            tuberosas: novasRespostas[27],
            bovinos: novasRespostas[28],
            caprinosOvinos: novasRespostas[29],
            suinos: novasRespostas[30],
            aves: novasRespostas[31]
          },
          dataCadastro: new Date().toISOString()
        };

        try {
          // Salvar no Firebase
          const cadastroRef = collection(db, "cadastros_rurais");
          await addDoc(cadastroRef, dadosCadastro);
          console.log('Cadastro salvo com sucesso!');
        } catch (error) {
          console.error('Erro ao salvar cadastro:', error);
        }

        setCadastroRespostas([]);
      } else {
        botResponse = cadastroFluxo[novaEtapa];

        // Adicionar sugestões baseadas na etapa atual
        // Reseta sugestões para perguntas que exigem entrada livre
        const perguntasLivres = [
          0,  // Nome da propriedade
          2,  // Endereço
          3,  // Tamanho da propriedade
          8,  // Coordenada S
          9,  // Coordenada W
          10, // Nome completo
          11, // CPF
          12, // RG
          13, // Emissor/UF
          15, // Data de nascimento
          16, // Naturalidade
          17, // Nome da mãe
          19, // Telefone
          20  // Instituição associada
        ];

        if (perguntasLivres.includes(novaEtapa)) {
          setSuggestions([]);
        } 
        // Tipo de pessoa
        else if (novaEtapa === 1) {
          setSuggestions([
            { text: "Física", action: "fisica" },
            { text: "Jurídica", action: "juridica" }
          ]);
        }
        // Perguntas Sim/Não
        else if ([4, 5, 6, 7, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].includes(novaEtapa)) {
          setSuggestions([
            { text: "Sim", action: "sim" },
            { text: "Não", action: "nao" }
          ]);
        }
        // Sexo
        else if (novaEtapa === 14) {
          setSuggestions([
            { text: "Masculino", action: "masculino" },
            { text: "Feminino", action: "feminino" }
          ]);
        }
        // Escolaridade
        else if (novaEtapa === 18) {
          setSuggestions([
            { text: "Analfabeto", action: "analfabeto" },
            { text: "Fundamental Incompleto", action: "fundamental_incompleto" },
            { text: "Fundamental Completo", action: "fundamental_completo" },
            { text: "Médio Incompleto", action: "medio_incompleto" },
            { text: "Médio Completo", action: "medio_completo" },
            { text: "Superior Incompleto", action: "superior_incompleto" },
            { text: "Superior Completo", action: "superior_completo" },
            { text: "Pós Graduação", action: "pos_graduacao" }
          ]);
        }
      }
    } else {
      if (userMessage.toLowerCase().includes('cadastro') || 
          userMessage.toLowerCase().includes('sim')) {
        botResponse = cadastroFluxo[0];
        setCadastroEtapa(0);
      } else {
        botResponse = findResponse(userMessage);
      }
    }

    setMessages(prev => [...prev, {
      text: botResponse,
      isUser: false,
      timestamp: new Date()
    }]);

    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, {
      text: input,
      isUser: true,
      timestamp: new Date()
    }]);

    processUserMessage(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button 
          onClick={() => setIsOpen(true)} 
          className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] shadow-xl flex flex-col bg-white">
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-medium">Assistente Virtual</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:bg-green-700 h-8 w-8 p-0"
            >
              <X size={20} />
            </Button>
          </div>

          <CardContent className="p-0 flex flex-col h-[500px] relative">
            <div className="absolute top-0 left-0 right-0 bottom-[60px] overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`mb-4 flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`p-3 rounded-lg max-w-[80%] break-words ${
                      msg.isUser 
                        ? 'bg-green-600 text-white rounded-tr-none' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 rounded-lg bg-gray-100 text-gray-800 rounded-tl-none">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {suggestions.length > 0 && (
              <div className="p-2 border-t flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm bg-green-50 hover:bg-green-100 border-green-200"
                    onClick={() => {
                      setInput(suggestion.text);
                      handleSubmit(new Event('submit') as unknown as React.FormEvent);
                      setSuggestions([]);
                    }}
                  >
                    {suggestion.text}
                  </Button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-3 border-t flex items-center absolute bottom-0 left-0 right-0 bg-white z-10">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 focus-visible:ring-green-600 text-base md:text-lg h-12"
                style={{ fontSize: 'inherit' }}
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={isLoading || !input.trim()}
                className="ml-2 bg-green-600 hover:bg-green-700 h-12 w-12"
              >
                <Send size={24} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;