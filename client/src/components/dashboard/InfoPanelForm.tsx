import React from 'react';
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
import {
  Info,
  Users,
  BarChart2,
  Award,
  FileText,
  ShoppingCart,
  Calendar,
  MapPin,
} from 'lucide-react';

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

  // Opções de ícones com visualização
  const iconOptions = [
    { value: 'Info', label: 'Informação', icon: <Info size={16} /> },
    { value: 'Users', label: 'Usuários', icon: <Users size={16} /> },
    { value: 'BarChart2', label: 'Gráfico', icon: <BarChart2 size={16} /> },
    { value: 'Award', label: 'Prêmio', icon: <Award size={16} /> },
    { value: 'FileText', label: 'Documento', icon: <FileText size={16} /> },
    { value: 'ShoppingCart', label: 'Compras', icon: <ShoppingCart size={16} /> },
    { value: 'Calendar', label: 'Calendário', icon: <Calendar size={16} /> },
    { value: 'MapPin', label: 'Localização', icon: <MapPin size={16} /> },
  ];

  // Lidar com o envio do formulário
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do painel informativo" {...field} />
                </FormControl>
                <FormDescription>
                  Título exibido no seletor de categorias e no cabeçalho do painel.
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
                <FormLabel>Página</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a página" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="home">Página Inicial</SelectItem>
                    <SelectItem value="paa">PAA</SelectItem>
                    <SelectItem value="agriculture">Agricultura</SelectItem>
                    <SelectItem value="fishing">Pesca</SelectItem>
                    <SelectItem value="sim">SIM</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Em qual página este painel será exibido.
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
                  <Input placeholder="Ex: info-paa-1" {...field} />
                </FormControl>
                <FormDescription>
                  ID único para identificar este painel (usado para âncoras e navegação).
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
                <FormLabel>Ícone</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className="mr-2 text-primary">{option.icon}</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Ícone exibido junto ao título da categoria.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ordem</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormDescription>
                  Ordem de exibição na lista de categorias (menor número = primeiro).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Ativar painel</FormLabel>
                  <FormDescription>
                    O painel será exibido para os usuários quando ativo.
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

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conteúdo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Conteúdo HTML do painel"
                  className="min-h-[200px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Conteúdo HTML completo que será exibido no painel. Suporta tags HTML para formatação.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Salvando...'
              : initialData?.id
              ? 'Atualizar painel'
              : 'Criar painel'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default InfoPanelForm;