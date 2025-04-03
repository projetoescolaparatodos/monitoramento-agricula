
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X } from 'lucide-react';

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
  'Por favor, informe seu nome completo:',
  'Agora, preciso do seu CPF:',
  'Qual é o seu endereço?',
  'Qual serviço específico você procura?',
  'Obrigado! Um técnico entrará em contato em breve.'
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
        setCadastroRespostas([]);
      } else {
        botResponse = cadastroFluxo[novaEtapa];
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
          
          <CardContent className="p-0 flex-1 flex flex-col h-full max-h-[500px]">
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
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
            
            <form onSubmit={handleSubmit} className="p-3 border-t flex">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 focus-visible:ring-green-600"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="ml-2 bg-green-600 hover:bg-green-700"
              >
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
