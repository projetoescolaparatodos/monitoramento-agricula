
import { Timestamp } from 'firebase/firestore';

// Tipos básicos para solicitações
export interface DadosPessoais {
  nome: string;
  cpf: string;
  rg?: string;
  endereco?: string;
  telefone?: string;
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
  tipoPessoa?: string;
  endereco?: string;
  tamanho?: number;
  coordenadas?: {
    latitude: number;
    longitude: number;
  };
}

export interface Maquinario {
  trator?: boolean;
  plantadeira?: boolean;
  colheitadeira?: boolean;
  pulverizador?: boolean;
  irrigacao?: boolean;
  outros?: string;
}

export interface MaoDeObra {
  familiar?: {
    selecionado: boolean;
    quantidade?: number;
  };
  contratada_permanente?: {
    selecionado: boolean;
    quantidade?: number;
  };
  contratada_temporaria?: {
    selecionado: boolean;
    quantidade?: number;
  };
}

export interface Recursos {
  numeroEmpregados?: number;
  trabalhoFamiliar?: number;
  recursosFinanceiros?: string;
  fonteFinanciamento?: string;
  assistenciaTecnica?: string;
}

// Interface base para solicitações
export interface Solicitacao {
  id: string;
  tipo: 'agricultura' | 'pesca' | 'paa';
  status: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado';
  criadoEm: Timestamp | string;
  atualizadoEm?: Timestamp | string;
  usuarioId: string;
  dadosPessoais: DadosPessoais;
  dadosPropriedade?: DadosPropriedade;
  tipoServico?: string;
  periodoDesejado?: string;
  urgencia?: string;
  detalhes?: string;
  observacoes?: string;
  maquinario?: Maquinario;
  maodeobra?: MaoDeObra;
  recursos?: Recursos;
  // Campos específicos para cada tipo serão verificados dinamicamente
  [key: string]: any;
}

// Tipo para filtros
export interface FiltroSolicitacoes {
  tipo?: 'agricultura' | 'pesca' | 'paa' | 'todas';
  status?: 'pendente' | 'em_andamento' | 'concluido' | 'cancelado' | 'todas';
  pesquisa?: string;
}
