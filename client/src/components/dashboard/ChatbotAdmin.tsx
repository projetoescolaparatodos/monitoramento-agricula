import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { useToast } from '@/hooks/use-toast';
import MediaFileUploader from './MediaFileUploader'; // Assumed location for MediaFileUploader component


const ChatbotAdmin = () => {
  const [trainingData, setTrainingData] = useState("");
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState([]); // Added state for media URLs
  const [keywordList, setKeywordList] = useState<any[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newResponse, setNewResponse] = useState("");
  const [editingKeyword, setEditingKeyword] = useState<any>(null);
  const { toast } = useToast();

  // Carregar histórico de treinamentos, feedbacks e palavras-chave
  useEffect(() => {
    loadTrainings();
    loadFeedbacks();
    loadKeywords();
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

      const docRef = await addDoc(collection(db, 'ai_training'), {
        examples,
        timestamp: serverTimestamp(),
        trainedBy: 'admin'
      });

      console.log("Treinamento adicionado com ID:", docRef.id);
      
      toast({
        title: "Sucesso",
        description: `${examples.length} exemplos adicionados ao treinamento da IA. O chatbot agora responderá com base nestes exemplos.`,
      });

      setTrainingData("");
      loadTrainings();
      
      // Aviso adicional sobre atualização
      setTimeout(() => {
        toast({
          title: "Informação",
          description: "Os exemplos treinados já estão disponíveis no chatbot. Você pode testar agora mesmo.",
        });
      }, 1500);
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

  // Funções para gerenciamento de palavras-chave
  const loadKeywords = async () => {
    try {
      const q = query(collection(db, 'keywords'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const keywords = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setKeywordList(keywords);
    } catch (error) {
      console.error('Erro ao carregar palavras-chave:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as palavras-chave",
        variant: "destructive"
      });
    }
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        title: "Erro",
        description: "A palavra-chave não pode estar vazia",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'keywords'), {
        keyword: newKeyword.trim(),
        responses: [newResponse || "Resposta padrão para " + newKeyword],
        score: 1,
        timestamp: serverTimestamp()
      });
      setNewKeyword("");
      setNewResponse("");
      loadKeywords();
      toast({
        title: "Sucesso",
        description: "Palavra-chave adicionada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao adicionar palavra-chave:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a palavra-chave",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const removeKeyword = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta palavra-chave?")) {
      try {
        await deleteDoc(doc(db, 'keywords', id));
        toast({
          title: "Sucesso",
          description: "Palavra-chave removida com sucesso",
        });
        loadKeywords();
      } catch (error) {
        console.error("Erro ao remover palavra-chave:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao remover a palavra-chave",
          variant: "destructive"
        });
      }
    }
  };

  const startEditKeyword = (keyword: any) => {
    setEditingKeyword({
      ...keyword,
      newResponses: [...keyword.responses]
    });
  };

  const addResponseToKeyword = () => {
    if (!editingKeyword) return;
    
    setEditingKeyword({
      ...editingKeyword,
      newResponses: [...editingKeyword.newResponses, ""]
    });
  };

  const updateKeywordResponse = (index: number, value: string) => {
    if (!editingKeyword) return;
    
    const updatedResponses = [...editingKeyword.newResponses];
    updatedResponses[index] = value;
    
    setEditingKeyword({
      ...editingKeyword,
      newResponses: updatedResponses
    });
  };

  const removeKeywordResponse = (index: number) => {
    if (!editingKeyword || editingKeyword.newResponses.length <= 1) return;
    
    const updatedResponses = [...editingKeyword.newResponses];
    updatedResponses.splice(index, 1);
    
    setEditingKeyword({
      ...editingKeyword,
      newResponses: updatedResponses
    });
  };

  const saveKeywordEdit = async () => {
    if (!editingKeyword) return;
    
    try {
      await updateDoc(doc(db, 'keywords', editingKeyword.id), {
        responses: editingKeyword.newResponses,
        score: parseInt(editingKeyword.score) || 1
      });
      
      setEditingKeyword(null);
      loadKeywords();
      
      toast({
        title: "Sucesso",
        description: "Palavra-chave atualizada com sucesso",
      });
    } catch (error) {
      console.error("Erro ao atualizar palavra-chave:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a palavra-chave",
        variant: "destructive"
      });
    }
  };

  const cancelKeywordEdit = () => {
    setEditingKeyword(null);
  };

  // Placeholder functions -  These need to be implemented based on your actual data structure and Firebase setup.
  const handleSaveContext = async () => { /*Implementation missing*/ };
  const handleEditContext = (contextId, contextText, mediaList = []) => { /*Implementation missing*/ };
  const handleDeleteContext = (contextId) => { /*Implementation missing*/ };
  const loadSavedContexts = async () => { /*Implementation missing*/ };


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
            <TabsTrigger value="keywords">Palavras-chave</TabsTrigger>
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

          <TabsContent value="keywords" className="mt-4">
            <h3 className="text-lg font-medium mb-4">Gerenciamento de Palavras-chave</h3>
            
            <div className="space-y-6">
              {/* Formulário para adicionar palavra-chave */}
              <Card className="p-4">
                <h4 className="text-md font-medium mb-3">Adicionar Nova Palavra-chave</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">Palavra-chave</label>
                    <Input 
                      placeholder="Ex: licenciamento pesca"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600 mb-1 block">Resposta Inicial (opcional)</label>
                    <Input 
                      placeholder="Resposta padrão para esta palavra-chave"
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  onClick={addKeyword}
                  disabled={isLoading || !newKeyword.trim()}
                >
                  Adicionar Palavra-chave
                </Button>
              </Card>
              
              {/* Lista de palavras-chave */}
              <div className="space-y-4">
                <h4 className="text-md font-medium">Palavras-chave Existentes</h4>
                
                {keywordList.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma palavra-chave registrada ainda.</p>
                ) : (
                  <div className="space-y-4">
                    {keywordList.map((keyword) => (
                      <Card key={keyword.id} className="p-4">
                        {editingKeyword && editingKeyword.id === keyword.id ? (
                          // Modo de edição
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h5 className="text-lg font-medium">{keyword.keyword}</h5>
                              <div>
                                <label className="text-sm mr-2">Pontuação:</label>
                                <Input 
                                  type="number" 
                                  className="w-16 inline-block" 
                                  value={editingKeyword.score} 
                                  onChange={(e) => setEditingKeyword({...editingKeyword, score: e.target.value})}
                                  min="1"
                                  max="10"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <h6 className="font-medium">Respostas:</h6>
                                <Button variant="outline" size="sm" onClick={addResponseToKeyword}>
                                  + Adicionar Resposta
                                </Button>
                              </div>
                              
                              {editingKeyword.newResponses.map((response, index) => (
                                <div key={index} className="flex space-x-2">
                                  <Textarea
                                    value={response}
                                    onChange={(e) => updateKeywordResponse(index, e.target.value)}
                                    placeholder="Resposta para a palavra-chave"
                                    className="flex-1"
                                  />
                                  {editingKeyword.newResponses.length > 1 && (
                                    <Button 
                                      variant="destructive" 
                                      size="icon"
                                      onClick={() => removeKeywordResponse(index)}
                                    >
                                      X
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={cancelKeywordEdit}>
                                Cancelar
                              </Button>
                              <Button onClick={saveKeywordEdit}>
                                Salvar Alterações
                              </Button>
                            </div>
                          </div>
                        ) : (
                          // Modo de visualização
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="text-lg font-medium">{keyword.keyword}</h5>
                                <p className="text-sm text-gray-500">Pontuação: {keyword.score}</p>
                              </div>
                              <div className="space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => startEditKeyword(keyword)}
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => removeKeyword(keyword.id)}
                                >
                                  Excluir
                                </Button>
                              </div>
                            </div>
                            
                            <div className="mt-3">
                              <p className="font-medium text-sm">Respostas:</p>
                              <ul className="mt-2 space-y-2">
                                {keyword.responses && keyword.responses.map((response, index) => (
                                  <li key={index} className="bg-gray-50 p-2 rounded-md text-sm">
                                    {response}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatbotAdmin;