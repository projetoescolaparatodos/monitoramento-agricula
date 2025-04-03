
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface FormularioRural {
  dadosPropriedade: {
    nome: string;
    tipoEntidade: string;
    endereco: string;
    tamanho: string;
    escriturada: string;
    dapCaf: string;
    car: string;
    financiamento: string;
  };
  dadosProprietario: {
    nomeCompleto: string;
    cpf: string;
    telefone: string;
    associacao: string;
  };
  dadosAgropecuarios: {
    cultivaCacau: string;
    detalheCacau?: {
      quantidadePes: string;
      safreiro: string;
      idade: string;
      producaoAnual: string;
    };
    cultivaFrutas: string;
    detalheFrutas?: {
      tipos: string[];
      destino: string;
      producao: string;
    };
    cultivaMandioca: string;
    detalheMandioca?: {
      tipo: string;
      finalidade: string;
      area: string;
      mecanizada: string;
    };
    criacaoBovino: string;
    detalheBovino?: {
      quantidade: string;
      gadoLeite: string;
      fase: string;
      sistemaManejo: string;
    };
  };
  solicitacao: string;
}

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(-1);
  const [respostas, setRespostas] = useState<any>({
    dadosPropriedade: {},
    dadosProprietario: {},
    dadosAgropecuarios: {},
    solicitacao: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const perguntas = [
    "Olá! Sou o assistente da Secretaria de Agricultura. Vou ajudar você a preencher o cadastro de produtor rural. Podemos começar? (Digite 'sim' para iniciar)",
    "Vamos começar com os dados da propriedade. Qual é o nome da sua propriedade rural?",
    "A propriedade é Física ou Jurídica?",
    "Qual é o endereço completo da propriedade?",
    "Qual é o tamanho da propriedade em hectares (ha)?",
    "A propriedade é escriturada? (sim/não)",
    "Possui DAP/CAF? (sim/não)",
    "Possui CAR - Cadastro Ambiental Rural? (sim/não)",
    "Possui financiamento rural? (sim/não)",
    "Agora, vamos para os dados do proprietário. Qual é o seu nome completo?",
    "Qual é o seu CPF?",
    "Qual é o seu telefone para contato?",
    "Você é associado a alguma instituição? Se sim, qual?",
    "Vamos para os dados de produção. Você cultiva cacau? (sim/não)",
    "Quantos pés de cacau você tem?",
    "É safreiro? (sim/não)",
    "Qual a idade da plantação?",
    "Você cultiva frutas perenes como laranja, limão, cupuaçu, açaí etc.? (sim/não)",
    "Quais frutas você cultiva? (Separe por vírgula)",
    "Qual o destino da produção? (consumo/venda/doação)",
    "Qual a produção anual em kg?",
    "Você produz mandioca/macaxeira? (sim/não)",
    "Qual o tipo? (brava/mansa)",
    "Qual a finalidade? (consumo/ração animal/subprodutos)",
    "Qual a área cultivada em hectares?",
    "A área de plantio é mecanizada? (sim/não)",
    "Você cria bovinos? (sim/não)",
    "Quantos animais tem no rebanho?",
    "É gado de leite? (sim/não)",
    "Qual a fase predominante? (cria/recria/engorda)",
    "Qual o sistema de manejo? (pastejo contínuo/confinamento/rotacionado)",
    "Para finalizar, descreva qual sua principal solicitação ou necessidade atual:"
  ];

  const proximaEtapa = (etapaAtual: number, resposta: string): number => {
    if (etapaAtual === 13 && resposta.toLowerCase().includes('não')) {
      return 17;
    }
    if (etapaAtual === 17 && resposta.toLowerCase().includes('não')) {
      return 21;
    }
    if (etapaAtual === 21 && resposta.toLowerCase().includes('não')) {
      return 26;
    }
    if (etapaAtual === 26 && resposta.toLowerCase().includes('não')) {
      return 31;
    }
    return etapaAtual + 1;
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: perguntas[0],
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const mapearResposta = (etapa: number, resposta: string) => {
    const novasRespostas = { ...respostas };
    
    if (etapa === 1) novasRespostas.dadosPropriedade.nome = resposta;
    else if (etapa === 2) novasRespostas.dadosPropriedade.tipoEntidade = resposta;
    else if (etapa === 3) novasRespostas.dadosPropriedade.endereco = resposta;
    else if (etapa === 4) novasRespostas.dadosPropriedade.tamanho = resposta;
    else if (etapa === 5) novasRespostas.dadosPropriedade.escriturada = resposta;
    else if (etapa === 6) novasRespostas.dadosPropriedade.dapCaf = resposta;
    else if (etapa === 7) novasRespostas.dadosPropriedade.car = resposta;
    else if (etapa === 8) novasRespostas.dadosPropriedade.financiamento = resposta;
    else if (etapa === 9) novasRespostas.dadosProprietario.nomeCompleto = resposta;
    else if (etapa === 10) novasRespostas.dadosProprietario.cpf = resposta;
    else if (etapa === 11) novasRespostas.dadosProprietario.telefone = resposta;
    else if (etapa === 12) novasRespostas.dadosProprietario.associacao = resposta;
    else if (etapa === 13) {
      novasRespostas.dadosAgropecuarios.cultivaCacau = resposta;
      if (resposta.toLowerCase().includes('sim')) {
        novasRespostas.dadosAgropecuarios.detalheCacau = {};
      }
    }
    else if (etapa === 14) novasRespostas.dadosAgropecuarios.detalheCacau.quantidadePes = resposta;
    else if (etapa === 15) novasRespostas.dadosAgropecuarios.detalheCacau.safreiro = resposta;
    else if (etapa === 16) novasRespostas.dadosAgropecuarios.detalheCacau.idade = resposta;
    else if (etapa === 17) {
      novasRespostas.dadosAgropecuarios.cultivaFrutas = resposta;
      if (resposta.toLowerCase().includes('sim')) {
        novasRespostas.dadosAgropecuarios.detalheFrutas = {};
      }
    }
    else if (etapa === 18) novasRespostas.dadosAgropecuarios.detalheFrutas.tipos = resposta.split(',').map(item => item.trim());
    else if (etapa === 19) novasRespostas.dadosAgropecuarios.detalheFrutas.destino = resposta;
    else if (etapa === 20) novasRespostas.dadosAgropecuarios.detalheFrutas.producao = resposta;
    else if (etapa === 21) {
      novasRespostas.dadosAgropecuarios.cultivaMandioca = resposta;
      if (resposta.toLowerCase().includes('sim')) {
        novasRespostas.dadosAgropecuarios.detalheMandioca = {};
      }
    }
    else if (etapa === 22) novasRespostas.dadosAgropecuarios.detalheMandioca.tipo = resposta;
    else if (etapa === 23) novasRespostas.dadosAgropecuarios.detalheMandioca.finalidade = resposta;
    else if (etapa === 24) novasRespostas.dadosAgropecuarios.detalheMandioca.area = resposta;
    else if (etapa === 25) novasRespostas.dadosAgropecuarios.detalheMandioca.mecanizada = resposta;
    else if (etapa === 26) {
      novasRespostas.dadosAgropecuarios.criacaoBovino = resposta;
      if (resposta.toLowerCase().includes('sim')) {
        novasRespostas.dadosAgropecuarios.detalheBovino = {};
      }
    }
    else if (etapa === 27) novasRespostas.dadosAgropecuarios.detalheBovino.quantidade = resposta;
    else if (etapa === 28) novasRespostas.dadosAgropecuarios.detalheBovino.gadoLeite = resposta;
    else if (etapa === 29) novasRespostas.dadosAgropecuarios.detalheBovino.fase = resposta;
    else if (etapa === 30) novasRespostas.dadosAgropecuarios.detalheBovino.sistemaManejo = resposta;
    else if (etapa === 31) novasRespostas.solicitacao = resposta;
    
    setRespostas(novasRespostas);
  };

  const salvarCadastroFirebase = async () => {
    try {
      await addDoc(collection(db, 'cadastros_produtores'), {
        ...respostas,
        timestamp: serverTimestamp(),
        status: 'pendente',
        origem: 'chatbot'
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar cadastro:', error);
      return false;
    }
  };

  const processarMensagem = async (mensagemUsuario: string) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    let respostaChatbot: string;
    
    if (etapaAtual === -1) {
      if (mensagemUsuario.toLowerCase().includes('sim')) {
        respostaChatbot = perguntas[1];
        setEtapaAtual(1);
      } else {
        respostaChatbot = "Sem problemas! Quando quiser iniciar o cadastro, basta me avisar.";
      }
    } else {
      mapearResposta(etapaAtual, mensagemUsuario);
      const proximaEtapaIndex = proximaEtapa(etapaAtual, mensagemUsuario);
      
      if (proximaEtapaIndex >= perguntas.length) {
        const salvamentoSucesso = await salvarCadastroFirebase();
        
        if (salvamentoSucesso) {
          respostaChatbot = "Obrigado! Seu cadastro foi enviado com sucesso. Em breve, um técnico da Secretaria de Agricultura entrará em contato.";
        } else {
          respostaChatbot = "Houve um problema ao salvar seu cadastro. Por favor, entre em contato diretamente com a Secretaria.";
        }
        
        setEtapaAtual(-1);
        setRespostas({
          dadosPropriedade: {},
          dadosProprietario: {},
          dadosAgropecuarios: {},
          solicitacao: ''
        });
      } else {
        respostaChatbot = perguntas[proximaEtapaIndex];
        setEtapaAtual(proximaEtapaIndex);
      }
    }
    
    setMessages(prev => [...prev, {
      text: respostaChatbot,
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
    
    processarMensagem(input);
    setInput('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center">
          <MessageCircle size={24} />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] shadow-xl flex flex-col bg-white">
          <div className="bg-green-600 text-white p-3 flex justify-between items-center rounded-t-lg">
            <h3 className="font-medium">Assistente de Cadastro Rural</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-green-700 h-8 w-8 p-0">
              <X size={20} />
            </Button>
          </div>
          
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-4 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg max-w-[90%] ${
                    msg.isUser ? 'bg-green-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'
                  }`}>
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
            
            <form onSubmit={handleSubmit} className="p-3 border-t flex">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua resposta..."
                className="flex-1 focus-visible:ring-green-600"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="ml-2 bg-green-600 hover:bg-green-700">
                <Send size={18} />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatbotWidget;
