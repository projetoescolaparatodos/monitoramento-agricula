
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import LocationMap from '@/components/common/LocationMap';

interface ChatContext {
  ultimasMensagens: Array<{text: string, isUser: boolean, timestamp: Date}>;
  setor: string;
  formType: string;
  isCompleto: boolean;
  userLocation: {latitude: number, longitude: number} | null;
}

const FormAgriculturaCompleto = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Dados pessoais
    nome: '',
    cpf: '',
    identidade: '',
    emissor: '',
    sexo: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    travessao: '',
    
    // Dados da propriedade
    nomePropriedade: '',
    enderecoPropriedade: '',
    tamanhoPropriedade: '',
    coordenadas: null,
    distanciaMunicipio: '',
    situacaoLegal: '',
    outraSituacaoLegal: '',
    
    // Produção
    culturas: {
      hortalicas: { selecionado: false, area: '', producao: '' },
      mandioca: { selecionado: false, area: '', producao: '' },
      milho: { selecionado: false, area: '', producao: '' },
      feijao: { selecionado: false, area: '', producao: '' },
      banana: { selecionado: false, area: '', producao: '' },
      citricos: { selecionado: false, area: '', producao: '' },
      cafe: { selecionado: false, area: '', producao: '' },
      cacau: { selecionado: false, area: '', producao: '' },
    },
    
    // Recursos
    maquinario: {
      trator: false,
      plantadeira: false,
      colheitadeira: false,
      pulverizador: false,
      irrigacao: false,
    },
    
    maodeobra: {
      familiar: { selecionado: false, quantidade: '' },
      contratada_permanente: { selecionado: false, quantidade: '' },
      contratada_temporaria: { selecionado: false, quantidade: '' },
    },
    
    // Serviço solicitado
    tipoServico: '',
    periodoDesejado: '',
    detalhes: '',
    urgencia: 'normal',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Recuperar contexto do chat, se disponível
    const storedContext = localStorage.getItem('chatContext');
    if (storedContext) {
      try {
        const parsedContext = JSON.parse(storedContext) as ChatContext;
        setChatContext(parsedContext);
        
        // Preencher dados básicos do chat se disponíveis
        if (parsedContext.userLocation) {
          setFormData(prev => ({
            ...prev,
            coordenadas: parsedContext.userLocation
          }));
        }
        
        console.log('Contexto do chat recuperado:', parsedContext);
      } catch (error) {
        console.error('Erro ao carregar contexto do chat:', error);
      }
    }
    
    // Recuperar rascunho salvo
    const savedDraft = localStorage.getItem('formAgriculturaCompletoDraft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(prev => ({...prev, ...parsedDraft}));
        alert('Um rascunho salvo foi recuperado');
      } catch (error) {
        console.error('Erro ao carregar rascunho:', error);
      }
    }
  }, []);
  
  // Calcular progresso do formulário
  useEffect(() => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.entries(formData).filter(([key, value]) => {
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'boolean') return true;
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) return value.length > 0;
        return Object.values(value).some(v => v !== '' && v !== false);
      }
      return false;
    }).length;
    
    setProgress(Math.round((filledFields / totalFields) * 100));
  }, [formData]);
  
  // Salvar rascunho automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('formAgriculturaCompletoDraft', JSON.stringify(formData));
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (category: string, item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: checked
      }
    }));
  };
  
  const handleNestedCheckboxChange = (category: string, item: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          selecionado: checked
        }
      }
    }));
  };
  
  const handleNestedValueChange = (category: string, item: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [item]: {
          ...prev[category][item],
          [field]: value
        }
      }
    }));
  };

  const nextStep = () => {
    setActiveStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setActiveStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Adicionar dados ao Firebase
      await addDoc(collection(db, 'solicitacoes_agricultura_completo'), {
        ...formData,
        userLocation: chatContext?.userLocation || null,
        timestamp: serverTimestamp(),
        status: 'pendente',
        origem: 'formulario_web',
        tipo: 'cadastro_completo'
      });

      setSubmitted(true);
      // Limpar contexto e rascunho após envio bem-sucedido
      localStorage.removeItem('chatContext');
      localStorage.removeItem('formAgriculturaCompletoDraft');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveDraft = () => {
    localStorage.setItem('formAgriculturaCompletoDraft', JSON.stringify(formData));
    alert('Rascunho salvo com sucesso!');
  };

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-green-800">Solicitação Enviada!</CardTitle>
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
                identidade: '',
                emissor: '',
                sexo: '',
                telefone: '',
                celular: '',
                email: '',
                endereco: '',
                travessao: '',
                nomePropriedade: '',
                enderecoPropriedade: '',
                tamanhoPropriedade: '',
                coordenadas: null,
                distanciaMunicipio: '',
                situacaoLegal: '',
                outraSituacaoLegal: '',
                culturas: {
                  hortalicas: { selecionado: false, area: '', producao: '' },
                  mandioca: { selecionado: false, area: '', producao: '' },
                  milho: { selecionado: false, area: '', producao: '' },
                  feijao: { selecionado: false, area: '', producao: '' },
                  banana: { selecionado: false, area: '', producao: '' },
                  citricos: { selecionado: false, area: '', producao: '' },
                  cafe: { selecionado: false, area: '', producao: '' },
                  cacau: { selecionado: false, area: '', producao: '' },
                },
                maquinario: {
                  trator: false,
                  plantadeira: false,
                  colheitadeira: false,
                  pulverizador: false,
                  irrigacao: false,
                },
                maodeobra: {
                  familiar: { selecionado: false, quantidade: '' },
                  contratada_permanente: { selecionado: false, quantidade: '' },
                  contratada_temporaria: { selecionado: false, quantidade: '' },
                },
                tipoServico: '',
                periodoDesejado: '',
                detalhes: '',
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

  const renderIdentificacaoStep = () => {
    return (
      <div className="space-y-4">
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-green-600 rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">Progresso: {progress}%</p>
        </div>
        
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="identidade">Identidade</Label>
            <Input
              id="identidade"
              name="identidade"
              value={formData.identidade}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emissor">Emissor/UF</Label>
            <Input
              id="emissor"
              name="emissor"
              value={formData.emissor}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo</Label>
            <Select 
              value={formData.sexo} 
              onValueChange={(value) => handleSelectChange('sexo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Masculino">Masculino</SelectItem>
                <SelectItem value="Feminino">Feminino</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(00) 0000-0000"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
            />
          </div>
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
        
        <div className="space-y-2">
          <Label htmlFor="endereco">Endereço</Label>
          <Input
            id="endereco"
            name="endereco"
            value={formData.endereco}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="travessao">Travessão</Label>
          <Input
            id="travessao"
            name="travessao"
            value={formData.travessao}
            onChange={handleChange}
          />
        </div>
      </div>
    );
  };

  const renderPropriedadeStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="nomePropriedade">Nome da Propriedade</Label>
          <Input
            id="nomePropriedade"
            name="nomePropriedade"
            value={formData.nomePropriedade}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="enderecoPropriedade">Endereço da Propriedade</Label>
          <Input
            id="enderecoPropriedade"
            name="enderecoPropriedade"
            value={formData.enderecoPropriedade}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tamanhoPropriedade">Tamanho da Propriedade (hectares)</Label>
            <Input
              id="tamanhoPropriedade"
              name="tamanhoPropriedade"
              type="number"
              value={formData.tamanhoPropriedade}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="distanciaMunicipio">Distância da sede municipal (km)</Label>
            <Input
              id="distanciaMunicipio"
              name="distanciaMunicipio"
              type="number"
              value={formData.distanciaMunicipio}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Label>Localização da Propriedade</Label>
          {chatContext?.userLocation ? (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800 font-medium">Localização compartilhada pelo chat:</p>
              <p className="text-xs text-gray-600">
                Latitude: {chatContext.userLocation.latitude.toFixed(6)}, 
                Longitude: {chatContext.userLocation.longitude.toFixed(6)}
              </p>
              <div className="mt-2 h-48">
                <LocationMap 
                  latitude={chatContext.userLocation.latitude} 
                  longitude={chatContext.userLocation.longitude}
                  height={192}
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-3 rounded-lg text-center">
              <p className="text-sm text-gray-600">Localização não compartilhada</p>
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Label>Situação Legal</Label>
          <RadioGroup 
            value={formData.situacaoLegal}
            onValueChange={(value) => handleSelectChange('situacaoLegal', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Proprietário" id="proprietario" />
              <Label htmlFor="proprietario">Proprietário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Arrendatário" id="arrendatario" />
              <Label htmlFor="arrendatario">Arrendatário</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Assentado" id="assentado" />
              <Label htmlFor="assentado">Assentado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Outros" id="outros" />
              <Label htmlFor="outros">Outros</Label>
            </div>
          </RadioGroup>
          
          {formData.situacaoLegal === 'Outros' && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="outraSituacaoLegal">Especifique</Label>
              <Input
                id="outraSituacaoLegal"
                name="outraSituacaoLegal"
                value={formData.outraSituacaoLegal}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderProducaoStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Culturas produzidas</h3>
          
          {Object.entries({
            'hortalicas': 'Hortaliças',
            'mandioca': 'Mandioca',
            'milho': 'Milho',
            'feijao': 'Feijão',
            'banana': 'Banana',
            'citricos': 'Cítricos',
            'cafe': 'Café',
            'cacau': 'Cacau'
          }).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={key}
                  checked={formData.culturas[key as keyof typeof formData.culturas].selecionado}
                  onCheckedChange={(checked) => 
                    handleNestedCheckboxChange('culturas', key, checked as boolean)
                  }
                />
                <label 
                  htmlFor={key} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
              
              {formData.culturas[key as keyof typeof formData.culturas].selecionado && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`${key}_area`}>Área plantada (ha)</Label>
                    <Input
                      id={`${key}_area`}
                      type="number"
                      value={formData.culturas[key as keyof typeof formData.culturas].area}
                      onChange={(e) => 
                        handleNestedValueChange('culturas', key, 'area', e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`${key}_producao`}>Produção estimada (kg/ano)</Label>
                    <Input
                      id={`${key}_producao`}
                      type="number"
                      value={formData.culturas[key as keyof typeof formData.culturas].producao}
                      onChange={(e) => 
                        handleNestedValueChange('culturas', key, 'producao', e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecursosStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Maquinário disponível</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="trator"
                checked={formData.maquinario.trator}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maquinario', 'trator', checked as boolean)
                }
              />
              <label 
                htmlFor="trator" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Trator
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="plantadeira"
                checked={formData.maquinario.plantadeira}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maquinario', 'plantadeira', checked as boolean)
                }
              />
              <label 
                htmlFor="plantadeira" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Plantadeira
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="colheitadeira"
                checked={formData.maquinario.colheitadeira}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maquinario', 'colheitadeira', checked as boolean)
                }
              />
              <label 
                htmlFor="colheitadeira" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Colheitadeira
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="pulverizador"
                checked={formData.maquinario.pulverizador}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maquinario', 'pulverizador', checked as boolean)
                }
              />
              <label 
                htmlFor="pulverizador" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Pulverizador
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="irrigacao"
                checked={formData.maquinario.irrigacao}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('maquinario', 'irrigacao', checked as boolean)
                }
              />
              <label 
                htmlFor="irrigacao" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Sistema de Irrigação
              </label>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mão de obra</h3>
          
          {Object.entries({
            'familiar': 'Familiar',
            'contratada_permanente': 'Contratada Permanente',
            'contratada_temporaria': 'Contratada Temporária'
          }).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={key}
                  checked={formData.maodeobra[key as keyof typeof formData.maodeobra].selecionado}
                  onCheckedChange={(checked) => 
                    handleNestedCheckboxChange('maodeobra', key, checked as boolean)
                  }
                />
                <label 
                  htmlFor={key} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
              
              {formData.maodeobra[key as keyof typeof formData.maodeobra].selecionado && (
                <div className="ml-6 space-y-1">
                  <Label htmlFor={`${key}_quantidade`}>Quantidade de pessoas</Label>
                  <Input
                    id={`${key}_quantidade`}
                    type="number"
                    value={formData.maodeobra[key as keyof typeof formData.maodeobra].quantidade}
                    onChange={(e) => 
                      handleNestedValueChange('maodeobra', key, 'quantidade', e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderServicoStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tipoServico">Serviço Solicitado</Label>
          <Select 
            value={formData.tipoServico} 
            onValueChange={(value) => handleSelectChange('tipoServico', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de serviço" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Assistência técnica">Assistência técnica</SelectItem>
              <SelectItem value="Mecanização agrícola">Mecanização agrícola</SelectItem>
              <SelectItem value="Análise de solo">Análise de solo</SelectItem>
              <SelectItem value="Distribuição de mudas">Distribuição de mudas</SelectItem>
              <SelectItem value="Capacitação">Capacitação</SelectItem>
              <SelectItem value="Outro">Outro serviço</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="periodoDesejado">Período desejado para atendimento</Label>
          <Select 
            value={formData.periodoDesejado} 
            onValueChange={(value) => handleSelectChange('periodoDesejado', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Próximos 7 dias">Próximos 7 dias</SelectItem>
              <SelectItem value="Próximos 15 dias">Próximos 15 dias</SelectItem>
              <SelectItem value="Próximo mês">Próximo mês</SelectItem>
              <SelectItem value="A definir">A definir</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="detalhes">Detalhes da solicitação</Label>
          <Textarea
            id="detalhes"
            name="detalhes"
            value={formData.detalhes}
            onChange={handleChange}
            rows={4}
            placeholder="Descreva com detalhes sua necessidade"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="urgencia">Nível de Urgência</Label>
          <Select 
            value={formData.urgencia} 
            onValueChange={(value) => handleSelectChange('urgencia', value)}
          >
            <SelectTrigger id="urgencia">
              <SelectValue placeholder="Selecione o nível de urgência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="baixa">Baixa</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="alta">Alta</SelectItem>
              <SelectItem value="urgente">Urgente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return renderIdentificacaoStep();
      case 1:
        return renderPropriedadeStep();
      case 2:
        return renderProducaoStep();
      case 3:
        return renderRecursosStep();
      case 4:
        return renderServicoStep();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (activeStep) {
      case 0:
        return "Identificação do Produtor";
      case 1:
        return "Dados da Propriedade";
      case 2:
        return "Produção Agrícola";
      case 3:
        return "Recursos Disponíveis";
      case 4:
        return "Serviço Solicitado";
      default:
        return "";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4 relative">
      {/* Botão para voltar ao portal */}
      <div className="fixed bottom-6 left-6 z-20">
        <Button 
          onClick={() => window.location.href = '/'} 
          className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 text-white shadow-lg flex items-center justify-center"
          title="Voltar ao Portal"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-green-800 text-white">
          <CardTitle>Cadastro Completo - Setor de Agricultura</CardTitle>
          <CardDescription className="text-green-100">
            {getStepTitle()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {[0, 1, 2, 3, 4].map((step) => (
                <div 
                  key={step}
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                    ${activeStep >= step 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                >
                  {step + 1}
                </div>
              ))}
            </div>
            <div className="relative w-full h-1 bg-gray-200">
              <div 
                className="absolute top-0 left-0 h-full bg-green-500 transition-all" 
                style={{ width: `${(activeStep / 4) * 100}%` }}
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
          
          {activeStep < 4 ? (
            <div className="flex ml-auto gap-2">
              <Button 
                onClick={handleSaveDraft} 
                variant="outline" 
                type="button" 
                disabled={isSubmitting}
              >
                Salvar Rascunho
              </Button>
              <Button onClick={nextStep} className="bg-green-600 hover:bg-green-700">
                Próximo
              </Button>
            </div>
          ) : (
            <div className="flex ml-auto gap-2">
              <Button 
                onClick={handleSaveDraft} 
                variant="outline" 
                type="button" 
                disabled={isSubmitting}
              >
                Salvar Rascunho
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Enviando..." : "Concluir Solicitação"}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default FormAgriculturaCompleto;
