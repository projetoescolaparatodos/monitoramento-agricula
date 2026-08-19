import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Users,
  Tractor,
  Fish,
  Sprout,
  ClipboardList,
  Globe,
  Search,
  Eye,
  Download,
  RefreshCw,
  Phone,
  MapPin,
} from "lucide-react";

// ---------- Tipos ----------

interface AtividadeProdutor {
  tipo: string;
  tipoLabel: string;
  servico: string;
  regiao?: string;
  localidade?: string;
  planilha?: string;
  origem: "planilha" | "formulario_web";
  status?: string;
  urgencia?: string;
  data?: Date | null;
}

interface Produtor {
  cpfKey: string;
  cpf: string;
  cpfValido: boolean;
  nome: string;
  telefone: string;
  localidade: string;
  regiao: string;
  origem: "planilha" | "formulario_web" | "ambos";
  atividades: AtividadeProdutor[];
}

// ---------- Constantes ----------

const TIPO_INFO: Record<string, { label: string; cor: string }> = {
  mecanizacao: { label: "Mecanização", cor: "#16a34a" },
  mudas: { label: "Mudas Frutíferas", cor: "#84cc16" },
  piscicultura: { label: "Piscicultura", cor: "#0ea5e9" },
  projetos: { label: "Projetos", cor: "#f59e0b" },
  web: { label: "Cadastro Online", cor: "#8b5cf6" },
};

const COLECOES_WEB = [
  { nome: "solicitacoes_agricultura_completo", label: "Cadastro Agricultura (completo)" },
  { nome: "solicitacoes_agricultura", label: "Cadastro Agricultura" },
  { nome: "solicitacoes_pesca_completo", label: "Cadastro Pesca (completo)" },
  { nome: "solicitacoes_pesca", label: "Cadastro Pesca" },
  { nome: "solicitacoes_paa", label: "Cadastro PAA" },
];

const PAGE_SIZE = 30;

// ---------- Utilitários ----------

const normalizarCpf = (valor: any): string =>
  String(valor || "").replace(/\D/g, "");

const slugNome = (nome: string): string =>
  nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toDate = (ts: any): Date | null => {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? null : d;
};

// ---------- Componente ----------

export const ProdutoresManager: React.FC = () => {
  const [produtores, setProdutores] = useState<Produtor[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroRegiao, setFiltroRegiao] = useState("todas");
  const [filtroOrigem, setFiltroOrigem] = useState("todas");
  const [pagina, setPagina] = useState(0);

  const [selecionado, setSelecionado] = useState<Produtor | null>(null);

  const carregar = async () => {
    setLoading(true);
    setErro(null);
    try {
      // 1) Base de produtores (planilhas importadas)
      const mapa = new Map<string, Produtor>();
      const snapProdutores = await getDocs(collection(db, "produtores"));
      snapProdutores.forEach((docSnap) => {
        const d = docSnap.data() as any;
        mapa.set(docSnap.id, {
          cpfKey: docSnap.id,
          cpf: d.cpf || "",
          cpfValido: d.cpfValido !== false,
          nome: d.nome || "SEM NOME",
          telefone: d.telefone || "",
          localidade: d.localidade || "",
          regiao: d.regiao || "",
          origem: "planilha",
          atividades: (d.atividades || []).map((a: any) => ({
            ...a,
            origem: "planilha" as const,
          })),
        });
      });

      // 2) Cadastros feitos pelo site (fonte principal daqui em diante),
      //    cruzados por CPF para não duplicar produtores
      for (const colecao of COLECOES_WEB) {
        try {
          const snap = await getDocs(collection(db, colecao.nome));
          snap.forEach((docSnap) => {
            const d = docSnap.data() as any;
            const digitos = normalizarCpf(d.cpf);
            const nome = String(d.nome || "").trim();
            if (!nome && !digitos) return;
            const chave =
              digitos.length === 11 ? digitos : "nome-" + slugNome(nome);
            if (!chave || chave === "nome-") return;

            const atividade: AtividadeProdutor = {
              tipo: "web",
              tipoLabel: colecao.label,
              servico:
                d.tipoServico || d.servico || d.interesse || "Cadastro online",
              localidade: d.localidade || d.endereco || "",
              origem: "formulario_web",
              status: d.status || "pendente",
              urgencia: d.urgencia || "",
              data: toDate(d.timestamp),
            };

            const existente = mapa.get(chave);
            if (existente) {
              existente.origem = "ambos";
              if (!existente.telefone)
                existente.telefone = d.telefone || d.celular || "";
              existente.atividades.push(atividade);
            } else {
              mapa.set(chave, {
                cpfKey: chave,
                cpf: d.cpf || "",
                cpfValido: digitos.length === 11,
                nome: nome.toUpperCase() || "SEM NOME",
                telefone: d.telefone || d.celular || "",
                localidade: d.localidade || d.travessao || d.endereco || "",
                regiao: "",
                origem: "formulario_web",
                atividades: [atividade],
              });
            }
          });
        } catch (e) {
          console.warn(`Falha ao ler ${colecao.nome}:`, e);
        }
      }

      const lista = Array.from(mapa.values()).sort((a, b) =>
        a.nome.localeCompare(b.nome, "pt-BR"),
      );
      setProdutores(lista);
    } catch (e: any) {
      console.error("Erro ao carregar produtores:", e);
      setErro(e.message || "Erro ao carregar produtores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  // ---------- Derivados ----------

  const regioes = useMemo(() => {
    const set = new Set<string>();
    produtores.forEach((p) => p.regiao && set.add(p.regiao));
    return Array.from(set).sort();
  }, [produtores]);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return produtores.filter((p) => {
      if (termo) {
        const alvo =
          `${p.nome} ${p.cpf} ${p.localidade} ${p.telefone}`.toLowerCase();
        if (!alvo.includes(termo)) return false;
      }
      if (filtroTipo !== "todos") {
        if (!p.atividades.some((a) => a.tipo === filtroTipo)) return false;
      }
      if (filtroRegiao !== "todas") {
        const naRegiao =
          p.regiao === filtroRegiao ||
          p.atividades.some((a) => a.regiao === filtroRegiao);
        if (!naRegiao) return false;
      }
      if (filtroOrigem !== "todas") {
        if (filtroOrigem === "ambos" && p.origem !== "ambos") return false;
        if (filtroOrigem === "planilha" && p.origem === "formulario_web")
          return false;
        if (filtroOrigem === "formulario_web" && p.origem === "planilha")
          return false;
      }
      return true;
    });
  }, [produtores, busca, filtroTipo, filtroRegiao, filtroOrigem]);

  useEffect(() => setPagina(0), [busca, filtroTipo, filtroRegiao, filtroOrigem]);

  const stats = useMemo(() => {
    const porTipo: Record<string, number> = {};
    let comWeb = 0;
    produtores.forEach((p) => {
      if (p.origem !== "planilha") comWeb++;
      const tiposDoProdutor = new Set(p.atividades.map((a) => a.tipo));
      tiposDoProdutor.forEach((t) => {
        porTipo[t] = (porTipo[t] || 0) + 1;
      });
    });
    return { total: produtores.length, comWeb, porTipo };
  }, [produtores]);

  const dadosGraficoRegiao = useMemo(() => {
    const contagem: Record<string, number> = {};
    filtrados.forEach((p) => {
      const r = p.regiao || "Cadastro online";
      contagem[r] = (contagem[r] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([regiao, total]) => ({ regiao, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 12);
  }, [filtrados]);

  const dadosGraficoTipo = useMemo(() => {
    const contagem: Record<string, number> = {};
    filtrados.forEach((p) =>
      p.atividades.forEach((a) => {
        contagem[a.tipo] = (contagem[a.tipo] || 0) + 1;
      }),
    );
    return Object.entries(contagem).map(([tipo, value]) => ({
      name: TIPO_INFO[tipo]?.label || tipo,
      value,
      cor: TIPO_INFO[tipo]?.cor || "#6b7280",
    }));
  }, [filtrados]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaAtual = filtrados.slice(
    pagina * PAGE_SIZE,
    (pagina + 1) * PAGE_SIZE,
  );

  const exportarCsv = () => {
    const linhas = [
      ["Nome", "CPF", "Telefone", "Localidade", "Região", "Origem", "Atividades"],
      ...filtrados.map((p) => [
        p.nome,
        p.cpf,
        p.telefone,
        p.localidade,
        p.regiao,
        p.origem,
        p.atividades.map((a) => `${a.tipoLabel}: ${a.servico}`).join(" | "),
      ]),
    ];
    const csv = linhas
      .map((l) =>
        l.map((c) => `"${String(c || "").replace(/"/g, '""')}"`).join(";"),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produtores-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
        Carregando base de produtores...
      </div>
    );
  }

  if (erro) {
    return (
      <div className="text-center py-16 text-red-600">
        Erro ao carregar produtores: {erro}
        <div className="mt-4">
          <Button onClick={carregar} variant="outline">
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cartões de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Users className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-500">Produtores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Tractor className="w-5 h-5 mx-auto text-green-600 mb-1" />
            <div className="text-2xl font-bold">
              {stats.porTipo["mecanizacao"] || 0}
            </div>
            <div className="text-xs text-gray-500">Mecanização</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Sprout className="w-5 h-5 mx-auto text-lime-600 mb-1" />
            <div className="text-2xl font-bold">
              {stats.porTipo["mudas"] || 0}
            </div>
            <div className="text-xs text-gray-500">Mudas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Fish className="w-5 h-5 mx-auto text-sky-600 mb-1" />
            <div className="text-2xl font-bold">
              {stats.porTipo["piscicultura"] || 0}
            </div>
            <div className="text-xs text-gray-500">Piscicultura</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <ClipboardList className="w-5 h-5 mx-auto text-amber-600 mb-1" />
            <div className="text-2xl font-bold">
              {stats.porTipo["projetos"] || 0}
            </div>
            <div className="text-xs text-gray-500">Projetos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <Globe className="w-5 h-5 mx-auto text-violet-600 mb-1" />
            <div className="text-2xl font-bold">{stats.comWeb}</div>
            <div className="text-xs text-gray-500">Com cadastro online</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, CPF, localidade..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger>
                <SelectValue placeholder="Atividade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as atividades</SelectItem>
                <SelectItem value="mecanizacao">Mecanização</SelectItem>
                <SelectItem value="mudas">Mudas Frutíferas</SelectItem>
                <SelectItem value="piscicultura">Piscicultura</SelectItem>
                <SelectItem value="projetos">Projetos</SelectItem>
                <SelectItem value="web">Cadastro Online</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroRegiao} onValueChange={setFiltroRegiao}>
              <SelectTrigger>
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as regiões</SelectItem>
                {regioes.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger>
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as origens</SelectItem>
                <SelectItem value="planilha">Base inicial (planilha)</SelectItem>
                <SelectItem value="formulario_web">Somente site</SelectItem>
                <SelectItem value="ambos">Planilha + site</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Produtores por região ({filtrados.length} no filtro)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoRegiao} layout="vertical" margin={{ left: 30 }}>
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="regiao"
                  width={140}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip />
                <Bar dataKey="total" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Atividades por tipo</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosGraficoTipo}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {dadosGraficoTipo.map((entry) => (
                    <Cell key={entry.name} fill={entry.cor} />
                  ))}
                </Pie>
                <Legend />
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Produtores ({filtrados.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportarCsv}>
            <Download className="w-4 h-4 mr-1" /> Exportar CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Nome</th>
                  <th className="py-2 pr-4">CPF</th>
                  <th className="py-2 pr-4 hidden md:table-cell">Localidade</th>
                  <th className="py-2 pr-4">Atividades</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {paginaAtual.map((p) => {
                  const tipos = Array.from(
                    new Set(p.atividades.map((a) => a.tipo)),
                  );
                  return (
                    <tr
                      key={p.cpfKey}
                      className="border-b last:border-0 hover:bg-green-50/50 cursor-pointer"
                      onClick={() => setSelecionado(p)}
                    >
                      <td className="py-2 pr-4 font-medium">
                        {p.nome}
                        {p.origem !== "planilha" && (
                          <Badge className="ml-2 bg-violet-100 text-violet-700 hover:bg-violet-100">
                            site
                          </Badge>
                        )}
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">
                        {p.cpf || "—"}
                        {!p.cpfValido && (
                          <span className="ml-1 text-amber-500" title="CPF inválido ou ausente">
                            ⚠
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 hidden md:table-cell text-gray-600">
                        {p.localidade || p.regiao || "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-1">
                          {tipos.map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-full text-xs text-white"
                              style={{
                                backgroundColor: TIPO_INFO[t]?.cor || "#6b7280",
                              }}
                            >
                              {TIPO_INFO[t]?.label || t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2 text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {paginaAtual.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      Nenhum produtor encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Página {pagina + 1} de {totalPaginas}
            </span>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagina === 0}
                onClick={() => setPagina((p) => p - 1)}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={pagina >= totalPaginas - 1}
                onClick={() => setPagina((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalhe do produtor */}
      <Dialog open={!!selecionado} onOpenChange={(open) => !open && setSelecionado(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selecionado && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg">{selecionado.nome}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">CPF: </span>
                  {selecionado.cpf || "Não informado"}
                  {!selecionado.cpfValido && (
                    <span className="text-amber-600 ml-1">(inválido/incompleto)</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  {selecionado.telefone || "Não informado"}
                </div>
                <div className="flex items-center gap-1 md:col-span-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {selecionado.localidade || "—"}
                  {selecionado.regiao && (
                    <Badge variant="outline" className="ml-2">
                      {selecionado.regiao}
                    </Badge>
                  )}
                </div>
              </div>

              <h4 className="font-semibold mt-4 mb-2">
                Atividades ({selecionado.atividades.length})
              </h4>
              <div className="space-y-2">
                {selecionado.atividades.map((a, i) => (
                  <div
                    key={i}
                    className="border rounded-lg p-3 text-sm flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs text-white"
                          style={{
                            backgroundColor: TIPO_INFO[a.tipo]?.cor || "#6b7280",
                          }}
                        >
                          {TIPO_INFO[a.tipo]?.label || a.tipoLabel}
                        </span>
                        {a.origem === "formulario_web" ? (
                          <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">
                            via site
                          </Badge>
                        ) : (
                          <Badge variant="outline">base inicial</Badge>
                        )}
                        {a.status && (
                          <Badge
                            className={
                              a.status === "concluida" || a.status === "concluído"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : a.status === "em_andamento"
                                  ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                            }
                          >
                            {a.status}
                          </Badge>
                        )}
                      </div>
                      <div className="text-gray-800">{a.servico || "—"}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        {[a.localidade || a.regiao, a.data ? new Date(a.data).toLocaleDateString("pt-BR") : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProdutoresManager;
