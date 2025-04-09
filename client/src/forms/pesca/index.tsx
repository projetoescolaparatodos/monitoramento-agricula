
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

const FormPesca = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    // Dados da atividade
    tipoAtividade: '',
    localidade: '',
    experiencia: '',
    // Serviço solicitado
    servico: '',
    descricao: '',
    urgencia: 'normal',
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
      await addDoc(collection(db, 'solicitacoes_pesca'), {
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
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-blue-800">Solicitação Enviada!</CardTitle>
            <CardDescription>Sua solicitação foi registrada com sucesso.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-center mb-4">
              Um técnico entrará em contato em breve para agendar o atendimento.
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
                tipoAtividade: '',
                localidade: '',
                experiencia: '',
                servico: '',
                descricao: '',
                urgencia: 'normal',
              });
              setActiveStep(0);
            }}>
              Nova Solicitação
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
              <Label htmlFor="tipoAtividade">Tipo de Atividade</Label>
              <select
                id="tipoAtividade"
                name="tipoAtividade"
                value={formData.tipoAtividade}
                onChange={handleChange as any}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione uma atividade</option>
                <option value="Piscicultura">Piscicultura</option>
                <option value="Pesca artesanal">Pesca artesanal</option>
                <option value="Pesca esportiva">Pesca esportiva</option>
                <option value="Processamento de pescado">Processamento de pescado</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="localidade">Localidade/Rio/Lagoa</Label>
              <Input
                id="localidade"
                name="localidade"
                value={formData.localidade}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experiencia">Experiência na Atividade</Label>
              <select
                id="experiencia"
                name="experiencia"
                value={formData.experiencia}
                onChange={handleChange as any}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione o tempo de experiência</option>
                <option value="Menos de 1 ano">Menos de 1 ano</option>
                <option value="1 a 3 anos">1 a 3 anos</option>
                <option value="3 a 5 anos">3 a 5 anos</option>
                <option value="Mais de 5 anos">Mais de 5 anos</option>
              </select>
            </div>
            {chatContext?.userLocation && (
              <div className="bg-blue-50 p-3 rounded-lg mt-4">
                <p className="text-sm text-blue-800 font-medium">Localização compartilhada pelo chat:</p>
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
              <Label htmlFor="servico">Serviço Solicitado</Label>
              <select
                id="servico"
                name="servico"
                value={formData.servico}
                onChange={handleChange as any}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Selecione um serviço</option>
                <option value="Assistência técnica para piscicultura">Assistência técnica para piscicultura</option>
                <option value="Licenciamento ambiental">Licenciamento ambiental</option>
                <option value="Acesso a crédito e financiamento">Acesso a crédito e financiamento</option>
                <option value="Capacitação técnica">Capacitação técnica</option>
                <option value="Outro">Outro serviço</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição da Solicitação</Label>
              <Textarea
                id="descricao"
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="urgencia">Nível de Urgência</Label>
              <select
                id="urgencia"
                name="urgencia"
                value={formData.urgencia}
                onChange={handleChange as any}
                className="w-full p-2 border rounded-md"
              >
                <option value="baixa">Baixa</option>
                <option value="normal">Normal</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
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
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">Solicitação de Serviço de Pesca</CardTitle>
          <CardDescription>
            {activeStep === 0 && "Preencha seus dados pessoais"}
            {activeStep === 1 && "Informe os dados da atividade"}
            {activeStep === 2 && "Detalhe o serviço solicitado"}
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
                      ? 'bg-blue-100 border-blue-500 text-blue-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                >
                  {step + 1}
                </div>
              ))}
            </div>
            <div className="relative w-full h-1 bg-gray-200">
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500 transition-all" 
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
            <Button onClick={nextStep} className="ml-auto bg-blue-600 hover:bg-blue-700">
              Próximo
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="ml-auto bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Enviando..." : "Concluir Solicitação"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormPesca;
