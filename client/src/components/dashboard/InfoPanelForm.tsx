import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { InfoPanelFormData, InfoPanelItem } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Info,
  Users,
  BarChart2,
  Award,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin,
  Eye,
  Code,
  Palette,
  Type,
  Leaf,
} from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';

// Esquema de validação para o formulário
const formSchema = z.object({
  title: z.string().min(3, {
    message: 'O título deve ter pelo menos 3 caracteres',
  }),
  content: z.string().min(10, {
    message: 'O conteúdo deve ter pelo menos 10 caracteres',
  }),
  pageType: z.string().min(1, {
    message: 'Selecione o tipo de página',
  }),
  categoryId: z.string().min(1, {
    message: 'Insira um ID de categoria',
  }),
  icon: z.string().min(1, {
    message: 'Selecione um ícone',
  }),
  order: z.coerce.number().min(1, {
    message: 'A ordem deve ser pelo menos 1',
  }),
  active: z.boolean().default(true),
});

interface InfoPanelFormProps {
  initialData?: InfoPanelItem;
  onSubmit: (data: InfoPanelFormData) => void;
  isSubmitting: boolean;
}

const InfoPanelForm: React.FC<InfoPanelFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
}) => {
  const quillRef = useRef<ReactQuill>(null);
  // Configurar o formulário com valores iniciais
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          content: initialData.content,
          pageType: initialData.pageType,
          categoryId: initialData.categoryId,
          icon: initialData.icon,
          order: initialData.order,
          active: initialData.active,
        }
      : {
          title: '',
          content: '',
          pageType: '',
          categoryId: '',
          icon: 'Info',
          order: 1,
          active: true,
        },
  });

  const { processImage, isUploading: isCompressing } = useImageUpload({
    maxSizeInMB: 1,
    maxWidth: 1200,
    maxHeight: 800,
    quality: 0.7
  });

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const optimizedFile = await processImage(file);

          // Upload para Firebase Storage
          const formData = new FormData();
          formData.append('file', optimizedFile);

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            const quill = quillRef.current?.getEditor();
            if (quill) {
              const range = quill.getSelection();
              // Usar URL diretamente da resposta
              const imageUrl = data.url || data.secure_url;
              quill.insertEmbed(range?.index || 0, 'image', imageUrl);
            }
          } else {
            const errorData = await response.json();
            console.error('Erro no upload:', errorData);
            alert('Erro ao fazer upload da imagem. Tente novamente.');
          }
        } catch (error) {
          console.error('Erro ao fazer upload da imagem:', error);
          alert('Erro ao processar a imagem. Tente novamente.');
        }
      }
    };

    input.click();
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': ['#2e7d32', '#1b5e20', '#388e3c', '#4caf50', '#81c784', '#c8e6c9', '#37474f', '#455a64', '#1e88e5', '#000000'] }],
        [{ 'background': ['#f1f8e9', '#e8f5e9', '#c8e6c9', '#f5f5f5', '#ffffff'] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Opções de ícones com visualização melhorada
  const iconOptions = [
    { value: 'Info', label: 'Informação', icon: <Info size={16} />, description: 'Para informações gerais' },
    { value: 'Users', label: 'Usuários', icon: <Users size={16} />, description: 'Para dados de usuários/beneficiários' },
    { value: 'BarChart2', label: 'Gráfico', icon: <BarChart2 size={16} />, description: 'Para dados estatísticos' },
    { value: 'Award', label: 'Prêmio', icon: <Award size={16} />, description: 'Para conquistas e certificações' },
    { value: 'FileText', label: 'Documento', icon: <FileText size={16} />, description: 'Para documentos e legislação' },
    { value: 'ShoppingCart', label: 'Compras', icon: <ShoppingCart size={16} />, description: 'Para aquisições e licitações' },
    { value: 'Calendar', label: 'Calendário', icon: <Calendar size={16} />, description: 'Para cronogramas e eventos' },
    { value: 'MapPin', label: 'Localização', icon: <MapPin size={16} />, description: 'Para localizações e mapas' },
    { value: 'Leaf', label: 'Agricultura', icon: <Leaf size={16} />, description: 'Para temas relacionados à agricultura' },
  ];

  // Opções de páginas com descrição
  const pageOptions = [
    { value: 'home', label: 'Página Inicial', description: 'Painel exibido na página principal' },
    { value: 'paa', label: 'PAA', description: 'Programa de Aquisição de Alimentos' },
    { value: 'agriculture', label: 'Agricultura', description: 'Programas de agricultura' },
    { value: 'fishing', label: 'Pesca', description: 'Programas de pesca e aquicultura' },
    { value: 'sim', label: 'SIM', description: 'Sistema de Inspeção Municipal' },
  ];

  // Templates de conteúdo pré-formatado
  const contentTemplates = {
    info: `<h2>Título da Seção</h2>
<p>Descrição detalhada do programa ou serviço oferecido pela Secretaria de Agricultura.</p>

<h3>Objetivos</h3>
<ul>
  <li>Objetivo principal do programa</li>
  <li>Meta específica a ser alcançada</li>
  <li>Benefícios para a comunidade</li>
</ul>

<h3>Como Participar</h3>
<ol>
  <li>Primeiro passo para participação</li>
  <li>Documentação necessária</li>
  <li>Processo de inscrição</li>
</ol>

<blockquote>
"Compromisso da Secretaria com o desenvolvimento sustentável e apoio aos produtores rurais."
</blockquote>`,

    benefits: `<h2>Benefícios do Programa</h2>
<p>Este programa oferece diversos benefícios para os produtores rurais e comunidade em geral.</p>

<h3>Benefícios Diretos</h3>
<ul>
  <li><strong>Assistência Técnica:</strong> Acompanhamento especializado</li>
  <li><strong>Capacitação:</strong> Treinamentos e cursos</li>
  <li><strong>Recursos:</strong> Sementes, mudas e insumos</li>
</ul>

<h3>Resultados Esperados</h3>
<p>Com a participação no programa, esperamos alcançar melhorias significativas na produtividade e qualidade de vida dos beneficiários.</p>`,

    requirements: `<h2>Requisitos e Documentação</h2>
<p>Para participar dos programas da Secretaria, é necessário atender aos seguintes critérios:</p>

<h3>Documentos Obrigatórios</h3>
<ul>
  <li>CPF e RG atualizados</li>
  <li>Comprovante de residência</li>
  <li>Declaração de aptidão ao PRONAF (quando aplicável)</li>
  <li>Croqui da propriedade</li>
</ul>

<h3>Critérios de Elegibilidade</h3>
<ol>
  <li>Ser agricultor familiar</li>
  <li>Residir no município</li>
  <li>Não ter participado de programas similares nos últimos 2 anos</li>
</ol>`
  };

  // Lidar com o envio do formulário
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  const insertTemplate = (template: string) => {
    form.setValue('content', template);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[#2e7d32]" />
            {initialData?.id ? 'Editar' : 'Criar'} Painel Informativo
          </CardTitle>
          <CardDescription>
            Configure o painel informativo com formatação rica e layout profissional para a página selecionada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Info size={16} />
                    Informações Básicas
                  </TabsTrigger>
                  <TabsTrigger value="content" className="flex items-center gap-2">
                    <Type size={16} />
                    Conteúdo
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-2">
                    <Eye size={16} />
                    Configurações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do Painel</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Programa de Distribuição de Mudas" {...field} />
                          </FormControl>
                          <FormDescription>
                            Título exibido no menu lateral e no cabeçalho do painel.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pageType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Página de Destino</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a página" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pageOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{option.label}</span>
                                    <span className="text-xs text-gray-500">{option.description}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Página onde este painel será exibido.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID da Categoria</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: programa-mudas-2024" {...field} />
                          </FormControl>
                          <FormDescription>
                            Identificador único (use apenas letras, números e hífens).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="icon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ícone do Painel</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um ícone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {iconOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[#2e7d32]">{option.icon}</span>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{option.label}</span>
                                      <span className="text-xs text-gray-500">{option.description}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Ícone exibido no menu lateral e cabeçalho.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                  {/* Templates de conteúdo */}
                  <Card className="border-[#c8e6c9] bg-[#f1f8e9]">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2 text-[#2e7d32]">
                        <Code size={16} />
                        Templates Pré-formatados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertTemplate(contentTemplates.info)}
                          className="border-[#2e7d32] text-[#2e7d32] hover:bg-[#e8f5e9]"
                        >
                          Template Informativo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertTemplate(contentTemplates.benefits)}
                          className="border-[#2e7d32] text-[#2e7d32] hover:bg-[#e8f5e9]"
                        >
                          Template Benefícios
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => insertTemplate(contentTemplates.requirements)}
                          className="border-[#2e7d32] text-[#2e7d32] hover:bg-[#e8f5e9]"
                        >
                          Template Requisitos
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Type size={16} />
                          Conteúdo do Painel
                        </FormLabel>
                        <FormControl>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <ReactQuill
                              ref={quillRef}
                              theme="snow"
                              value={field.value}
                              onChange={field.onChange}
                              modules={modules}
                              formats={formats}
                              placeholder="Digite o conteúdo do painel usando a formatação rica..."
                              style={{ minHeight: '300px' }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm">
                          <div className="space-y-2 text-gray-600">
                            <p><strong>Dicas de formatação institucional:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>Use <strong>Título 2 (H2)</strong> para seções principais com ícone de folha</li>
                              <li>Use <strong>Título 3 (H3)</strong> para subseções com sublinhado pontilhado</li>
                              <li>Cores recomendadas: Verde (#2e7d32) para títulos, Azul (#1e88e5) para links</li>
                              <li>Use listas com marcadores para organizar informações</li>
                              <li>Citações em bloco para destacar compromissos institucionais</li>
                            </ul>
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="order"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ordem de Exibição</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" max="100" {...field} />
                          </FormControl>
                          <FormDescription>
                            Posição no menu lateral (1 = primeiro, números maiores = mais abaixo).
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#c8e6c9] p-4 bg-[#f9f9f9]">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base font-medium">Painel Ativo</FormLabel>
                            <FormDescription className="text-sm">
                              O painel será exibido na página quando ativado.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Informações adicionais sobre o painel */}
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-800">Funcionalidades do Painel Interativo</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-blue-700">
                      <ul className="space-y-2">
                        <li>✅ <strong>Tipografia Institucional:</strong> Hierarquia de títulos com cores oficiais</li>
                        <li>✅ <strong>Listas Personalizadas:</strong> Ícones de check para listas com marcadores</li>
                        <li>✅ <strong>Links Animados:</strong> Efeitos hover com setas</li>
                        <li>✅ <strong>Citações Destacadas:</strong> Fundo verde claro para citações</li>
                        <li>✅ <strong>Tabelas Formatadas:</strong> Cabeçalhos verdes e bordas suaves</li>
                        <li>✅ <strong>Rodapé Institucional:</strong> Informações de contato e data de atualização</li>
                        <li>✅ <strong>Responsivo:</strong> Adaptado para dispositivos móveis</li>
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-3 pt-6 border-t">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-6"
                >
                  {isSubmitting
                    ? 'Salvando...'
                    : initialData?.id
                    ? 'Atualizar Painel'
                    : 'Criar Painel'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoPanelForm;