
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
  userLocation: {latitude: number, longitude: number} | null;
}

const FormPesca = () => {
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
    
    // Atividade
    tipoAtividade: '',
    outraAtividade: '',
    coordenadas: null,
    estruturas: {
      viveiros_escavados: false,
      acudes: false,
      tanques: false,
      estruturas_flutuantes: false,
    },
    
    // Classificação
    obras: {
      canal_igarape: { selecionado: false, area: '', situacao: '' },
      viveiro_escavado: { selecionado: false, area: '', situacao: '' },
      barragem: { selecionado: false, area: '', situacao: '' },
      viveiro_suspenso: { selecionado: false, area: '', situacao: '' },
    },
    especies: {
      tambaqui: { selecionado: false, quantidade: '' },
      tambatinga: { selecionado: false, quantidade: '' },
      matrinxa: { selecionado: false, quantidade: '' },
      curimata: { selecionado: false, quantidade: '' },
      pirarucu: { selecionado: false, quantidade: '' },
      tilapia: { selecionado: false, quantidade: '' },
    },
    
    // Detalhamento
    distanciaMunicipio: '',
    referencialLocalizacao: '',
    situacaoLegal: '',
    outraSituacaoLegal: '',
    areaTotal: '',
    recursoHidrico: '',
    nomeRecurso: '',
    usosAgua: {
      aquicultura: false,
      irrigacao: false,
      abastecimento: false,
      lazer: false,
    },
    
    // Recursos
    numEmpregados: '',
    trabalhoFamiliar: '',
    fonteRecursos: '',
    fonteFinanciamento: '',
    assistenciaTecnica: '',
    
    // Observações
    observacoes: '',
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
    const savedDraft = localStorage.getItem('formPescaDraft');
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
      localStorage.setItem('formPescaDraft', JSON.stringify(formData));
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
      await addDoc(collection(db, 'solicitacoes_pesca'), {
        ...formData,
        userLocation: chatContext?.userLocation || null,
        timestamp: serverTimestamp(),
        status: 'pendente',
        origem: 'formulario_web'
      });

      setSubmitted(true);
      // Limpar contexto e rascunho após envio bem-sucedido
      localStorage.removeItem('chatContext');
      localStorage.removeItem('formPescaDraft');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      alert('Erro ao enviar solicitação. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSaveDraft = () => {
    localStorage.setItem('formPescaDraft', JSON.stringify(formData));
    alert('Rascunho salvo com sucesso!');
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
                identidade: '',
                emissor: '',
                sexo: '',
                telefone: '',
                celular: '',
                email: '',
                endereco: '',
                travessao: '',
                tipoAtividade: '',
                outraAtividade: '',
                coordenadas: null,
                estruturas: {
                  viveiros_escavados: false,
                  acudes: false,
                  tanques: false,
                  estruturas_flutuantes: false,
                },
                obras: {
                  canal_igarape: { selecionado: false, area: '', situacao: '' },
                  viveiro_escavado: { selecionado: false, area: '', situacao: '' },
                  barragem: { selecionado: false, area: '', situacao: '' },
                  viveiro_suspenso: { selecionado: false, area: '', situacao: '' },
                },
                especies: {
                  tambaqui: { selecionado: false, quantidade: '' },
                  tambatinga: { selecionado: false, quantidade: '' },
                  matrinxa: { selecionado: false, quantidade: '' },
                  curimata: { selecionado: false, quantidade: '' },
                  pirarucu: { selecionado: false, quantidade: '' },
                  tilapia: { selecionado: false, quantidade: '' },
                },
                distanciaMunicipio: '',
                referencialLocalizacao: '',
                situacaoLegal: '',
                outraSituacaoLegal: '',
                areaTotal: '',
                recursoHidrico: '',
                nomeRecurso: '',
                usosAgua: {
                  aquicultura: false,
                  irrigacao: false,
                  abastecimento: false,
                  lazer: false,
                },
                numEmpregados: '',
                trabalhoFamiliar: '',
                fonteRecursos: '',
                fonteFinanciamento: '',
                assistenciaTecnica: '',
                observacoes: '',
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
              className="h-full bg-blue-600 rounded-full" 
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

  const renderAtividadeStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="tipoAtividade">Atividade Principal</Label>
          <Select 
            value={formData.tipoAtividade} 
            onValueChange={(value) => handleSelectChange('tipoAtividade', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo de atividade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Piscicultura">Piscicultura</SelectItem>
              <SelectItem value="Aquicultura">Aquicultura</SelectItem>
              <SelectItem value="Pesca artesanal">Pesca artesanal</SelectItem>
              <SelectItem value="Outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {formData.tipoAtividade === 'Outro' && (
          <div className="space-y-2">
            <Label htmlFor="outraAtividade">Especifique a atividade</Label>
            <Input
              id="outraAtividade"
              name="outraAtividade"
              value={formData.outraAtividade}
              onChange={handleChange}
            />
          </div>
        )}
        
        <div className="space-y-4">
          <Label>Localização da Propriedade</Label>
          {chatContext?.userLocation ? (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Localização compartilhada pelo chat:</p>
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
          <Label>Estrutura Aquícola</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="viveiros_escavados"
                checked={formData.estruturas.viveiros_escavados}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('estruturas', 'viveiros_escavados', checked as boolean)
                }
              />
              <label 
                htmlFor="viveiros_escavados" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Viveiros escavados
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="acudes"
                checked={formData.estruturas.acudes}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('estruturas', 'acudes', checked as boolean)
                }
              />
              <label 
                htmlFor="acudes" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Açudes
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="tanques"
                checked={formData.estruturas.tanques}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('estruturas', 'tanques', checked as boolean)
                }
              />
              <label 
                htmlFor="tanques" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tanques
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="estruturas_flutuantes"
                checked={formData.estruturas.estruturas_flutuantes}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('estruturas', 'estruturas_flutuantes', checked as boolean)
                }
              />
              <label 
                htmlFor="estruturas_flutuantes" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Estruturas flutuantes
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderClassificacaoStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Obras a serem analisadas</h3>
          
          {Object.entries({
            'canal_igarape': 'Canal de igarapé',
            'viveiro_escavado': 'Viveiro Escavado',
            'barragem': 'Barragem',
            'viveiro_suspenso': 'Viveiro Suspenso'
          }).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={key}
                  checked={formData.obras[key as keyof typeof formData.obras].selecionado}
                  onCheckedChange={(checked) => 
                    handleNestedCheckboxChange('obras', key, checked as boolean)
                  }
                />
                <label 
                  htmlFor={key} 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {label}
                </label>
              </div>
              
              {formData.obras[key as keyof typeof formData.obras].selecionado && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor={`${key}_area`}>
                      {key.includes('viveiro') ? 'Área (ha)' : 'Área (m²)'}
                    </Label>
                    <Input
                      id={`${key}_area`}
                      type="number"
                      value={formData.obras[key as keyof typeof formData.obras].area}
                      onChange={(e) => 
                        handleNestedValueChange('obras', key, 'area', e.target.value)
                      }
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor={`${key}_situacao`}>Situação</Label>
                    <Select 
                      value={formData.obras[key as keyof typeof formData.obras].situacao}
                      onValueChange={(value) => 
                        handleNestedValueChange('obras', key, 'situacao', value)
                      }
                    >
                      <SelectTrigger id={`${key}_situacao`}>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Obras não iniciadas">Obras não iniciadas</SelectItem>
                        <SelectItem value="Em Construção">Em Construção</SelectItem>
                        <SelectItem value="Construído">Construído</SelectItem>
                        <SelectItem value="Em manutenção">Em manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Espécies confinadas</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries({
              'tambaqui': 'Tambaqui',
              'tambatinga': 'Tambatinga',
              'matrinxa': 'Matrinxã',
              'curimata': 'Curimatã',
              'pirarucu': 'Pirarucu',
              'tilapia': 'Tilápia'
            }).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={key}
                    checked={formData.especies[key as keyof typeof formData.especies].selecionado}
                    onCheckedChange={(checked) => 
                      handleNestedCheckboxChange('especies', key, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={key} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {label}
                  </label>
                </div>
                
                {formData.especies[key as keyof typeof formData.especies].selecionado && (
                  <div className="ml-6 space-y-1">
                    <Label htmlFor={`${key}_quantidade`}>Quantidade</Label>
                    <Input
                      id={`${key}_quantidade`}
                      type="number"
                      value={formData.especies[key as keyof typeof formData.especies].quantidade}
                      onChange={(e) => 
                        handleNestedValueChange('especies', key, 'quantidade', e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDetalhamentoStep = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div className="space-y-2">
            <Label htmlFor="areaTotal">Área total da propriedade (ha)</Label>
            <Input
              id="areaTotal"
              name="areaTotal"
              type="number"
              value={formData.areaTotal}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="referencialLocalizacao">Referencial para localização</Label>
          <Input
            id="referencialLocalizacao"
            name="referencialLocalizacao"
            value={formData.referencialLocalizacao}
            onChange={handleChange}
            placeholder="Ex: Estrada X, Posto Y"
          />
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
              <RadioGroupItem value="Parceiro" id="parceiro" />
              <Label htmlFor="parceiro">Parceiro</Label>
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
        
        <div className="space-y-3">
          <Label>Recursos Hídricos</Label>
          <div className="space-y-2">
            <Label htmlFor="recursoHidrico">Tipo de recurso</Label>
            <Select 
              value={formData.recursoHidrico} 
              onValueChange={(value) => handleSelectChange('recursoHidrico', value)}
            >
              <SelectTrigger id="recursoHidrico">
                <SelectValue placeholder="Selecione o tipo de recurso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rio">Rio</SelectItem>
                <SelectItem value="Nascente/Grota">Nascente/Grota</SelectItem>
                <SelectItem value="Barragem/Açude">Barragem/Açude</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nomeRecurso">Nome do recurso</Label>
            <Input
              id="nomeRecurso"
              name="nomeRecurso"
              value={formData.nomeRecurso}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Usos múltiplos da água</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="aquicultura"
                checked={formData.usosAgua.aquicultura}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('usosAgua', 'aquicultura', checked as boolean)
                }
              />
              <label 
                htmlFor="aquicultura" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Aquicultura
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="irrigacao"
                checked={formData.usosAgua.irrigacao}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('usosAgua', 'irrigacao', checked as boolean)
                }
              />
              <label 
                htmlFor="irrigacao" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Irrigação
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="abastecimento"
                checked={formData.usosAgua.abastecimento}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('usosAgua', 'abastecimento', checked as boolean)
                }
              />
              <label 
                htmlFor="abastecimento" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Abastecimento Público
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="lazer"
                checked={formData.usosAgua.lazer}
                onCheckedChange={(checked) => 
                  handleCheckboxChange('usosAgua', 'lazer', checked as boolean)
                }
              />
              <label 
                htmlFor="lazer" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Lazer
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecursosStep = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numEmpregados">Nº de empregados</Label>
            <Input
              id="numEmpregados"
              name="numEmpregados"
              type="number"
              value={formData.numEmpregados}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="trabalhoFamiliar">Trabalho familiar (pessoas)</Label>
            <Input
              id="trabalhoFamiliar"
              name="trabalhoFamiliar"
              type="number"
              value={formData.trabalhoFamiliar}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label>Recursos Financeiros</Label>
          <RadioGroup 
            value={formData.fonteRecursos}
            onValueChange={(value) => handleSelectChange('fonteRecursos', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Próprios" id="proprios" />
              <Label htmlFor="proprios">Próprios</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Financiamento" id="financiamento" />
              <Label htmlFor="financiamento">Financiamento</Label>
            </div>
          </RadioGroup>
          
          {formData.fonteRecursos === 'Financiamento' && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="fonteFinanciamento">Fonte do financiamento</Label>
              <Input
                id="fonteFinanciamento"
                name="fonteFinanciamento"
                value={formData.fonteFinanciamento}
                onChange={handleChange}
              />
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <Label>Assistência Técnica</Label>
          <RadioGroup 
            value={formData.assistenciaTecnica}
            onValueChange={(value) => handleSelectChange('assistenciaTecnica', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Permanente" id="permanente" />
              <Label htmlFor="permanente">Permanente</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Eventual" id="eventual" />
              <Label htmlFor="eventual">Eventual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Não tem" id="nao_tem" />
              <Label htmlFor="nao_tem">Não tem</Label>
            </div>
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="observacoes">Observações adicionais (opcional)</Label>
          <Textarea
            id="observacoes"
            name="observacoes"
            value={formData.observacoes}
            onChange={handleChange}
            rows={4}
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
        return renderAtividadeStep();
      case 2:
        return renderClassificacaoStep();
      case 3:
        return renderDetalhamentoStep();
      case 4:
        return renderRecursosStep();
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (activeStep) {
      case 0:
        return "Identificação do Empreendedor";
      case 1:
        return "Identificação da Atividade";
      case 2:
        return "Classificação";
      case 3:
        return "Detalhamento";
      case 4:
        return "Recursos e Observações";
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
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center"
          title="Voltar ao Portal"
        >
          <ArrowLeft size={20} />
        </Button>
      </div>
      <Card className="w-full max-w-4xl">
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">Solicitação de Serviço de Pesca</CardTitle>
          <CardDescription>
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
              <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
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
                className="bg-blue-600 hover:bg-blue-700"
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

export default FormPesca;
