
import React, { useState, useEffect } from 'react';
import { db } from "../../utils/firebase";
import { collection, addDoc, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Response {
  id: string;
  intent: string;
  response: string;
}

const ChatbotAdmin = () => {
  const [responses, setResponses] = useState<Response[]>([]);
  const [intent, setIntent] = useState('');
  const [response, setResponse] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const querySnapshot = await getDocs(collection(db, "chatbot_responses"));
    const loadedResponses = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Response));
    setResponses(loadedResponses);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "chatbot_responses"), {
        intent,
        response
      });
      toast({ title: "Sucesso", description: "Resposta adicionada com sucesso" });
      loadResponses();
      setIntent('');
      setResponse('');
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Erro ao adicionar resposta",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chatbot_responses", id));
      toast({ title: "Sucesso", description: "Resposta removida com sucesso" });
      loadResponses();
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: "Erro ao remover resposta",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Respostas do Chatbot</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Intent (ex: clima, pragas)"
                value={intent}
                onChange={(e) => setIntent(e.target.value)}
              />
            </div>
            <div>
              <Textarea
                placeholder="Resposta do chatbot"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
              />
            </div>
            <Button type="submit">Adicionar Resposta</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {responses.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{item.intent}</h3>
                  <p className="text-sm text-gray-600">{item.response}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(item.id)}
                >
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ChatbotAdmin;
