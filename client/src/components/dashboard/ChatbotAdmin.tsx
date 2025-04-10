import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';
import MediaFileUploader from './MediaFileUploader';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


const ChatbotAdmin = () => {
  const [trainingData, setTrainingData] = useState("");
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]); 
  const [contextText, setContextText] = useState("");
  const [contextList, setContextList] = useState<any[]>([]);
  const [editingContextId, setEditingContextId] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar histórico de treinamentos, feedbacks e contextos
  useEffect(() => {
    loadTrainings();
    loadFeedbacks();
    loadSavedContexts();
  }, []);

  const loadTrainings = async () => {
    try {
      const q = query(collection(db, 'ai_training'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const trainings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrainingHistory(trainings);
    } catch (error) {
      console.error('Erro ao carregar treinamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de treinamentos",
        variant: "destructive"
      });
    }
  };

  const loadFeedbacks = async () => {
    try {
      const q = query(collection(db, 'ai_feedback'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const feedbacks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFeedbackHistory(feedbacks);
    } catch (error) {
      console.error('Erro ao carregar feedbacks:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de feedbacks",
        variant: "destructive"
      });
    }
  };

  const trainAI = async () => {
    if (!trainingData.trim()) {
      toast({
        title: "Erro",
        description: "Adicione exemplos de treinamento antes de enviar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const examples = trainingData.split('\n\n').map(example => {
        const parts = example.split('\n');
        return {
          question: parts[0]?.replace('Q: ', '') || '',
          answer: parts[1]?.replace('R: ', '') || ''
        };
      }).filter(ex => ex.question && ex.answer);

      if (examples.length === 0) {
        toast({
          title: "Formato inválido",
          description: "Verifique se o formato está correto (Q: pergunta\\nR: resposta)",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      await addDoc(collection(db, 'ai_training'), {
        examples,
        timestamp: serverTimestamp(),
        trainedBy: 'admin'
      });

      toast({
        title: "Sucesso",
        description: `${examples.length} exemplos adicionados ao treinamento da IA`,
      });

      setTrainingData("");
      loadTrainings();
    } catch (error) {
      console.error("Erro no treinamento:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao treinar a IA",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const deleteTraining = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este treinamento?")) {
      try {
        await deleteDoc(doc(db, 'ai_training', id));
        toast({
          title: "Sucesso",
          description: "Treinamento excluído com sucesso",
        });
        loadTrainings();
      } catch (error) {
        console.error("Erro ao excluir treinamento:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o treinamento",
          variant: "destructive"
        });
      }
    }
  };

  const handleFileUploaded = (url) => {
    setMediaUrls((prevUrls) => [...prevUrls, url]);
    toast({
      title: "Arquivo adicionado",
      description: "O arquivo foi adicionado à lista de mídia."
    });
  };

  const handleRemoveMedia = (index) => {
    setMediaUrls((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };


  // Implementação para gerenciamento de contextos
  const loadSavedContexts = async () => {
    try {
      const q = query(collection(db, 'ai_contexts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const contexts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setContextList(contexts);
    } catch (error) {
      console.error('Erro ao carregar contextos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os contextos salvos",
        variant: "destructive"
      });
    }
  };

  const handleSaveContext = async () => {
    if (!contextText.trim()) {
      toast({
        title: "Erro",
        description: "O texto do contexto não pode estar vazio",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      if (editingContextId) {
        // Atualizar contexto existente
        await updateDoc(doc(db, 'ai_contexts', editingContextId), {
          text: contextText,
          media: mediaUrls,
          updatedAt: serverTimestamp()
        });
        toast({
          title: "Sucesso",
          description: "Contexto atualizado com sucesso",
        });
      } else {
        // Criar novo contexto
        await addDoc(collection(db, 'ai_contexts'), {
          text: contextText,
          media: mediaUrls,
          timestamp: serverTimestamp(),
          createdBy: 'admin'
        });
        toast({
          title: "Sucesso",
          description: "Novo contexto adicionado com sucesso",
        });
      }

      // Limpar formulário e recarregar contextos
      setContextText("");
      setMediaUrls([]);
      setEditingContextId(null);
      loadSavedContexts();
    } catch (error) {
      console.error("Erro ao salvar contexto:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o contexto",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const handleEditContext = (contextId: string, text: string, media: string[] = []) => {
    setEditingContextId(contextId);
    setContextText(text);
    setMediaUrls(media);
  };

  const handleDeleteContext = async (contextId: string) => {
    if (confirm("Tem certeza que deseja excluir este contexto?")) {
      try {
        await deleteDoc(doc(db, 'ai_contexts', contextId));
        toast({
          title: "Sucesso",
          description: "Contexto excluído com sucesso",
        });
        loadSavedContexts();
      } catch (error) {
        console.error("Erro ao excluir contexto:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao excluir o contexto",
          variant: "destructive"
        });
      }
    }
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciamento do Chatbot de IA</CardTitle>
        <CardDescription>
          Treine a IA, visualize feedbacks e gerencie o comportamento do chatbot
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="training">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="training">Treinamento</TabsTrigger>
            <TabsTrigger value="history">Histórico de Treinamentos</TabsTrigger>
            <TabsTrigger value="feedback">Feedbacks dos Usuários</TabsTrigger>
            <TabsTrigger value="contexts">Contextos</TabsTrigger>
          </TabsList>

          <TabsContent value="training" className="space-y-4 mt-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Adicionar Novos Treinamentos</h3>
              <p className="text-sm text-gray-600">
                Adicione exemplos de perguntas e respostas para treinar o chatbot. 
                Cada exemplo deve estar no formato:
              </p>
              <div className="bg-gray-100 p-3 rounded">
                <pre className="text-sm">
                  Q: Pergunta do usuário
                  R: Resposta que o bot deve dar
                </pre>
              </div>
              <p className="text-sm text-gray-600">
                Separe cada par pergunta/resposta com uma linha em branco.
              </p>
            </div>

            <Textarea 
              placeholder="Q: Como posso participar do programa de mecanização agrícola?
R: Para participar do programa de mecanização agrícola, preencha o formulário de Agricultura disponível no nosso site ou visite a Secretaria.

Q: Quais documentos preciso para o PAA?
R: Para o PAA, você precisa apresentar DAP/CAF ativa, documentos pessoais e comprovante de produção. Preencha nosso formulário específico para mais detalhes."
              value={trainingData}
              onChange={(e) => setTrainingData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setTrainingData("")}
                disabled={isLoading}
              >
                Limpar
              </Button>
              <Button 
                onClick={trainAI}
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Treinar IA"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <h3 className="text-lg font-medium mb-4">Histórico de Treinamentos</h3>

            {trainingHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum treinamento registrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {trainingHistory.map((training: any, index) => (
                  <Card key={training.id} className="p-4">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">
                        Treinamento #{index + 1}
                      </div>
                      <div className="text-xs text-gray-500">
                        {training.timestamp?.toDate().toLocaleString() || 'Data desconhecida'}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm mb-1">Exemplos:</p>
                      {training.examples && (
                        <ul className="space-y-2 mt-2">
                          {training.examples.map((example: any, i: number) => (
                            <li key={i} className="bg-gray-50 p-2 rounded text-sm">
                              <div className="font-medium">Q: {example.question}</div>
                              <div className="text-green-600">R: {example.answer}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteTraining(training.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="mt-4">
            <h3 className="text-lg font-medium mb-4">Feedbacks dos Usuários</h3>

            {feedbackHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum feedback registrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {feedbackHistory.map((feedback: any) => (
                  <Card key={feedback.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className={feedback.isGood ? "text-green-500" : "text-red-500"}>
                          {feedback.isGood ? "👍 Feedback positivo" : "👎 Feedback negativo"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {feedback.timestamp?.toDate().toLocaleString() || 'Data desconhecida'}
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-sm font-medium">Pergunta:</p>
                        <p className="text-sm">{feedback.question || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-sm font-medium">Resposta avaliada:</p>
                        <p className="text-sm">{feedback.answer || "N/A"}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contexts" className="mt-4">
            <h3 className="text-lg font-medium mb-4">Gerenciamento de Contextos do Chatbot</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="context-text">Texto do Contexto</Label>
                <Textarea 
                  id="context-text"
                  placeholder="Adicione informações de contexto para o chatbot..."
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  rows={5}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Adicionar Mídia</Label>
                <MediaFileUploader 
                  onFileUploaded={handleFileUploaded}
                  label="Upload de Mídia"
                  acceptTypes="image/*,video/*"
                  folderPath="chatbot-contexts"
                />
              </div>
              
              {mediaUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Mídias ({mediaUrls.length})</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {mediaUrls.map((url, index) => (
                      <div key={index} className="relative border rounded-md overflow-hidden">
                        {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img 
                            src={url} 
                            alt={`Mídia ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Erro+ao+carregar';
                            }}
                          />
                        ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Vídeo</p>
                          </div>
                        ) : (
                          <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                            <p className="text-sm text-gray-500">Link: {url.substring(0, 20)}...</p>
                          </div>
                        )}
                        <Button 
                          size="icon" 
                          variant="destructive"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => handleRemoveMedia(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                {editingContextId && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingContextId(null);
                      setContextText("");
                      setMediaUrls([]);
                    }}
                    disabled={isLoading}
                  >
                    Cancelar
                  </Button>
                )}
                <Button 
                  onClick={handleSaveContext}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : editingContextId ? "Atualizar Contexto" : "Salvar Contexto"}
                </Button>
              </div>
            </div>
            
            <h4 className="font-medium mb-2">Contextos Salvos</h4>
            {contextList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum contexto salvo ainda.</p>
            ) : (
              <div className="space-y-4">
                {contextList.map((context) => (
                  <Card key={context.id} className="p-4">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">
                        Contexto #{context.id.substring(0, 8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {context.timestamp?.toDate().toLocaleString() || 'Data desconhecida'}
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-sm mb-1">Texto:</p>
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        {context.text}
                      </div>
                    </div>
                    
                    {context.media && context.media.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm mb-1">Mídias ({context.media.length}):</p>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {context.media.map((url: string, i: number) => (
                            <div key={i} className="h-16 rounded overflow-hidden border">
                              {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                <img 
                                  src={url} 
                                  alt={`Mídia ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Erro';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <p className="text-xs text-gray-500">Link de mídia</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditContext(context.id, context.text, context.media || [])}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteContext(context.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatbotAdmin;