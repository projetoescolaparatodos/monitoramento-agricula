
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, X } from "lucide-react";

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'bot'}[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, sender: 'user' }]);
    setInput('');

    try {
      const response = await fetch('http://0.0.0.0:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, sender: 'user' })
      });

      const data = await response.json();
      
      // Add bot response
      if (data && data[0]?.text) {
        setMessages(prev => [...prev, { text: data[0].text, sender: 'bot' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-80 h-96 flex flex-col">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-semibold">Chat Assistente</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form 
            className="p-4 border-t"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-md border px-3 py-2"
                placeholder="Digite sua mensagem..."
              />
              <Button type="submit" size="icon">
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button 
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-12 w-12 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
