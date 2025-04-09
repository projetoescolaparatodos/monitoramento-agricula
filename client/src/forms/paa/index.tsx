
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface ChatContext {
  ultimasMensagens: Array<{text: string, isUser: boolean, timestamp: Date}>;
  setor: string;
  userLocation: {latitude: number, longitude: number} | null;
}

const FormPAA = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    // Dados do produtor
    dapCaf: '',
    localidade: '',
    produtos: '',
    // Interesse no PAA
    interesse: '',
    quantidadeEstimada: '',
    observacoes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);

  useEffect(() => {
    // Recuperar contexto do chat, se disponível
    const storedContext = localStorage.getItem('chatContext');
    if (storedContext) {
      try {
        const parsedContext = JSON.parse(storedContext) as ChatContext;
        setChatContext(parsedContext);
        console.log('Contexto do chat recuperado:', parsedContext);
      } catch (error) {
        console.error('Erro ao carregar contexto do chat:', error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => {
    setActiveStep(prev => prev + 1);
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Adicionar dados ao Firebase
      await addDoc(collection(db, 'solicitacoes_paa'), {
        ...formData,
        userLocation: chatContext?.userLocation || null,
        timestamp: serverTimestamp(),
        status: 'pendente',
        origem: 'formulario_web'
      });

      setSubmitted(true);
      // Limpar contexto após envio bem-sucedido
      localStorage.removeItem('chatContext');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-amber-50">
            <CardTitle className="text-amber-800">Cadastro Realizado!</CardTitle>
            <CardDescription>Seu interesse no PAA foi registrado com sucesso.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center mb-4">
              Um técnico entrará em contato em breve para mais informações sobre o programa.
            </p>
            <p className="text-center text-sm text-gray-500">
              Número de protocolo: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => window.close()} variant="outline" className="mr-2">
              Fechar
            </Button>
            <Button onClick={() => {
              setSubmitted(false);
              setFormData({
                nome: '',
                cpf: '',
                telefone: '',
                email: '',
                dapCaf: '',
                localidade: '',
                produtos: '',
                interesse: '',
                quantidadeEstimada: '',
                observacoes: '',
              });
              setActiveStep(0);
            }}>
              Novo Cadastro
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (opcional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dapCaf">Número DAP/CAF</Label>
              <Input
                id="dapCaf"
                name="dapCaf"
                value={formData.dapCaf}
                onChange={handleChange}
                placeholder="Nº do documento DAP ou CAF"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="localidade">Localidade/Comunidade</Label>
              <Input
                id="localidade"
                name="localidade"
                value={formData.localidade}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="produtos">Principais Produtos</Label>
              <Textarea
                id="produtos"
                name="produtos"
                value={formData.produtos}
                onChange={handleChange}
                placeholder="Liste os principais produtos que você produz"
                rows={3}
                required
              />
            </div>
            {chatContext?.userLocation && (
              <div className="bg-amber-50 p-3 rounded-lg mt-4">
                <p className="text-sm text-amber-800 font-medium">Localização compartilhada pelo chat:</p>
                <p className="text-xs text-gray-600">
                  Latitude: {chatContext.userLocation.latitude.toFixed(6)}, 
                  Longitude: {chatContext.userLocation.longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interesse">Interesse no PAA</Label>
              <select
                id="interesse"
                name="interesse"
                value={formData.interesse}
                onChange={handleChange as any}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione seu interesse</option>
                <option value="Fornecer para escolas">Fornecer para escolas</option>
                <option value="Fornecer para entidades sociais">Fornecer para entidades sociais</option>
                <option value="Fornecer para restaurantes populares">Fornecer para restaurantes populares</option>
                <option value="Conhecer o programa">Conhecer mais sobre o programa</option>
                <option value="Outro">Outro</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantidadeEstimada">Quantidade Estimada de Produção (mensal)</Label>
              <Input
                id="quantidadeEstimada"
                name="quantidadeEstimada"
                value={formData.quantidadeEstimada}
                onChange={handleChange}
                placeholder="Ex: 100kg de hortaliças, 50kg de frutas"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleChange}
                placeholder="Outras informações relevantes sobre sua produção ou interesse no PAA"
                rows={3}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="bg-amber-50">
          <CardTitle className="text-amber-800">Cadastro no Programa de Aquisição de Alimentos</CardTitle>
          <CardDescription>
            {activeStep === 0 && "Preencha seus dados pessoais"}
            {activeStep === 1 && "Informe os dados do produtor rural"}
            {activeStep === 2 && "Detalhes sobre seu interesse no PAA"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[0, 1, 2].map((step) => (
                <div 
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${activeStep >= step 
                      ? 'bg-amber-100 border-amber-500 text-amber-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                >
                  {step + 1}
                </div>
              ))}
            </div>
            <div className="relative w-full h-1 bg-gray-200">
              <div 
                className="absolute top-0 left-0 h-full bg-amber-500 transition-all" 
                style={{ width: `${(activeStep / 2) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {renderStep()}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          {activeStep > 0 && (
            <Button onClick={prevStep} variant="outline" disabled={isSubmitting}>
              Anterior
            </Button>
          )}
          {activeStep < 2 ? (
            <Button onClick={nextStep} className="ml-auto bg-amber-600 hover:bg-amber-700">
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="ml-auto bg-amber-600 hover:bg-amber-700">
              {isSubmitting ? "Enviando..." : "Concluir Cadastro"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormPAA;
