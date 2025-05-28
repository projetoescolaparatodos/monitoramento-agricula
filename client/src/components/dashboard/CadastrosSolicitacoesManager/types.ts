
import { Timestamp } from 'firebase/firestore';

// Tipos básicos para solicitações
export interface DadosPessoais {
  nome: string;
  cpf: string;
  rg?: string;
  identidade?: string;
  emissor?: string;
  sexo?: string;
  endereco?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  travessao?: string;
  dataNascimento?: string;
  naturalidade?: string;
  nomeMae?: string;
  escolaridade?: string;
  instituicaoAssociada?: string;
}

export interface DadosPropriedade {
  nome?: string;
  nomePropriedade?: string;
  tipoPessoa?: string;
  endereco?: string;
  enderecoPropriedade?: string;
  tamanho?: number | string;
  tamanhoPropriedade?: string;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
  distanciaMunicipio?: string;
  situacaoLegal?: string;
  outraSituacaoLegal?: string;
}

export interface Cultura {
  selecionado: boolean;
  area?: string;
  producao?: string;
}

export interface Culturas {
  hortalicas?: Cultura;
  mandioca?: Cultura;
  milho?: Cultura;
  feijao?: Cultura;
  banana?: Cultura;
  citricos?: Cultura;
  cafe?: Cultura;
  cacau?: Cultura;
  [key: string]: Cultura | undefined;
}

export interface Maquinario {
  trator?: boolean;
  plantadeira?: boolean;
  colheitadeira?: boolean;
  pulverizador?: boolean;
  irrigacao?: boolean;
  outros?: string;
}

export interface TipoMaoDeObra {
  selecionado: boolean;
  quantidade?: string | number;
}

export interface MaoDeObra {
  familiar?: TipoMaoDeObra;
  contratada_permanente?: TipoMaoDeObra;
  contratada_temporaria?: TipoMaoDeObra;
  [key: string]: TipoMaoDeObra | undefined;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

// Interface principal da solicitação
export interface Solicitacao {
  id: string;
  
  // Campos obrigatórios
  nome: string;
  cpf: string;
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  urgencia: 'baixa' | 'normal' | 'alta' | 'urgente';
  timestamp: Timestamp | any;
  origem: 'formulario_web' | 'chat' | 'presencial';
  tipoOrigem: string; // Nome da coleção no Firebase
  
  // Dados pessoais opcionais
  telefone?: string;
  celular?: string;
  email?: string;
  endereco?: string;
  identidade?: string;
  emissor?: string;
  sexo?: string;
  travessao?: string;
  
  // Dados da propriedade
  nomePropriedade?: string;
  enderecoPropriedade?: string;
  tamanho?: string | number;
  tamanhoPropriedade?: string;
  distanciaMunicipio?: string;
  situacaoLegal?: string;
  outraSituacaoLegal?: string;
  
  // Serviços
  servico?: string;
  tipoServico?: string;
  descricao?: string;
  detalhes?: string;
  periodoDesejado?: string;
  
  // Dados específicos da Agricultura Completa
  culturas?: Culturas;
  maquinario?: Maquinario;
  maodeobra?: MaoDeObra;
  tipo?: string;
  
  // Dados específicos do PAA
  dapCaf?: string;
  localidade?: string;
  produtos?: string;
  areaMecanizacao?: string | number;
  areaMecanization?: string | number;
  interesse?: string;
  quantidadeEstimada?: string;
  observacoes?: string;
  
  // Localização
  userLocation?: UserLocation;
}

// Tipos para filtros
export type StatusFiltro = 'todos' | 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
export type UrgenciaFiltro = 'todos' | 'baixa' | 'normal' | 'alta' | 'urgente';
export type OrigemFiltro = 'todos' | 'formulario_web' | 'chat' | 'presencial';
export type TipoOrigemFiltro = 'todos' | 'solicitacoes_agricultura' | 'solicitacoes_agricultura_completo' | 'solicitacoes_pesca' | 'solicitacoes_pesca_completo' | 'solicitacoes_paa' | 'solicitacoes_servicos';

export interface FiltrosAtivos {
  status: StatusFiltro;
  urgencia: UrgenciaFiltro;
  origem: OrigemFiltro;
  tipoOrigem: TipoOrigemFiltro;
  busca: string;
}

// Estatísticas
export interface EstatisticasSolicitacoes {
  total: number;
  pendentes: number;
  emAndamento: number;
  concluidas: number;
  canceladas: number;
  porUrgencia: Record<string, number>;
  porOrigem: Record<string, number>;
  porTipo: Record<string, number>;
}
