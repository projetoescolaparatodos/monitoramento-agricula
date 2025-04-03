
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

const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        text: 'Olá! Como posso ajudar você hoje?',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = async (userMessage: string) => {
    try {
      const response = await fetch('http://0.0.0.0:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: 'user', message: userMessage })
      });
      
      const data = await response.json();
      return data[0]?.text || 'Desculpe, não entendi. Poderia reformular?';
    } catch (error) {
      console.error('Erro:', error);
      return 'Desculpe, ocorreu um erro. Tente novamente mais tarde.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, {
      text: userMessage,
      isUser: true,
      timestamp: new Date()
    }]);
    
    setIsLoading(true);
    const botResponse = await getBotResponse(userMessage);
    setMessages(prev => [...prev, {
      text: botResponse,
      isUser: false,
      timestamp: new Date()
    }]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <Button onClick={() => setIsOpen(true)} className="rounded-full w-14 h-14 bg-green-600 hover:bg-green-700">
          <MessageCircle size={24} />
        </Button>
      ) : (
        <Card className="w-80 sm:w-96 h-[500px] flex flex-col">
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Assistente Virtual</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-green-700">
              <X size={20} />
            </Button>
          </div>
          
          <CardContent className="p-0 flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`mb-4 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    msg.isUser ? 'bg-green-600 text-white' : 'bg-gray-100'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="text-left mb-4">
                  <div className="inline-block p-3 bg-gray-100 rounded-lg">
                    <div className="flex space-x-2">
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce delay-400"></div>
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
                placeholder="Digite sua mensagem..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()} className="ml-2 bg-green-600">
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
