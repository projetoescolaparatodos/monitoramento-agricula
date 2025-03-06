import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Trash2, Edit2, Plus } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Upload from "@/components/Upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Agriculture Tab
const AgriculturaForm = () => {
  const [nome, setNome] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [atividade, setAtividade] = useState("");
  const [piloto, setPiloto] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [tempoAtividade, setTempoAtividade] = useState(0);
  const [areaTrabalhada, setAreaTrabalhada] = useState(0);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [tratoresCadastrados, setTratoresCadastrados] = useState<any[]>([]);
  const [tratorEmEdicao, setTratorEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTratoresCadastrados(tratoresData);
      } catch (error) {
        console.error("Erro ao buscar tratores:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os tratores.",
          variant: "destructive",
        });
      }
    };

    fetchTratores();
  }, []);

  useEffect(() => {
    const map = L.map("admin-map-agricultura").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);

      // Limpa marcadores anteriores
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Adiciona novo marcador
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });

    return () => map.remove();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Clique no mapa para selecionar a localização do trator.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const tratorData = {
        nome,
        fazenda,
        atividade,
        piloto,
        latitude,
        longitude,
        midias,
        dataCadastro: tratorEmEdicao ? tratorEmEdicao.dataCadastro : dataCadastro,
        tempoAtividade,
        areaTrabalhada,
        concluido: false,
      };

      if (tratorEmEdicao) {
        await updateDoc(doc(db, "tratores", tratorEmEdicao.id), tratorData);
        toast({
          title: "Sucesso",
          description: "Trator atualizado com sucesso!",
        });
      } else {
        await addDoc(collection(db, "tratores"), tratorData);
        toast({
          title: "Sucesso",
          description: "Trator adicionado com sucesso!",
        });
      }

      // Limpa o formulário
      setNome("");
      setFazenda("");
      setAtividade("");
      setPiloto("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setTempoAtividade(0);
      setAreaTrabalhada(0);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setTratorEmEdicao(null);

      // Atualiza a lista
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratoresCadastrados(tratoresData);
    } catch (error) {
      console.error("Erro ao salvar trator:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o trator.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setMidias([...midias, url]);
  };

  const handleEditarTrator = (trator: any) => {
    setTratorEmEdicao(trator);
    setNome(trator.nome);
    setFazenda(trator.fazenda);
    setAtividade(trator.atividade);
    setPiloto(trator.piloto);
    setLatitude(trator.latitude);
    setLongitude(trator.longitude);
    setMidias(trator.midias || []);
    setTempoAtividade(trator.tempoAtividade);
    setAreaTrabalhada(trator.areaTrabalhada || 0);
    setDataCadastro(trator.dataCadastro);
  };

  const handleExcluirTrator = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este trator?")) {
      try {
        await deleteDoc(doc(db, "tratores", id));
        toast({
          title: "Sucesso",
          description: "Trator excluído com sucesso!",
        });
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTratoresCadastrados(tratoresData);
      } catch (error) {
        console.error("Erro ao excluir trator:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o trator.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciar Agricultura</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="admin-map-agricultura" className="w-full h-[400px] mb-8 rounded-lg overflow-hidden" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Trator</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazenda">Fazenda</Label>
                <Input
                  id="fazenda"
                  value={fazenda}
                  onChange={(e) => setFazenda(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="atividade">Atividade</Label>
                <Input
                  id="atividade"
                  value={atividade}
                  onChange={(e) => setAtividade(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="piloto">Piloto</Label>
                <Input
                  id="piloto"
                  value={piloto}
                  onChange={(e) => setPiloto(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoAtividade">Tempo de Atividade (minutos)</Label>
                <Input
                  id="tempoAtividade"
                  type="number"
                  value={tempoAtividade}
                  onChange={(e) => setTempoAtividade(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaTrabalhada">Área a ser Trabalhada (m²)</Label>
                <Input
                  id="areaTrabalhada"
                  type="number"
                  value={areaTrabalhada}
                  onChange={(e) => setAreaTrabalhada(Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCadastro">Data</Label>
                <Input
                  id="dataCadastro"
                  type="date"
                  value={dataCadastro}
                  onChange={(e) => setDataCadastro(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotos/Vídeos</Label>
              <Upload onUpload={handleUpload} />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {midias.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {tratorEmEdicao ? "Atualizar Trator" : "Adicionar Trator"}
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tratores Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tratoresCadastrados.map((trator) => (
              <div
                key={trator.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{trator.nome}</h3>
                  <p className="text-sm text-gray-600">
                    {trator.fazenda} - {trator.concluido ? "Concluído" : "Em Serviço"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarTrator(trator)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluirTrator(trator.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Pesca Tab
const PescaForm = () => {
  const [localidade, setLocalidade] = useState("");
  const [nomeImovel, setNomeImovel] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [operacao, setOperacao] = useState("");
  const [horaMaquina, setHoraMaquina] = useState(0);
  const [areaMecanizacao, setAreaMecanizacao] = useState(0);
  const [operador, setOperador] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [pesqueirosCadastrados, setPesqueirosCadastrados] = useState<any[]>([]);
  const [pesqueiroEmEdicao, setPesqueiroEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesqueirosCadastrados(pescaData);
      } catch (error) {
        console.error("Erro ao buscar dados de pesca:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados de pesca.",
          variant: "destructive",
        });
      }
    };

    fetchPesqueiros();
  }, []);

  useEffect(() => {
    const map = L.map("admin-map-pesca").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });

    return () => map.remove();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Clique no mapa para selecionar a localização.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const pescaData = {
        localidade,
        nomeImovel,
        proprietario,
        operacao,
        horaMaquina,
        areaMecanizacao,
        operador,
        tecnicoResponsavel,
        latitude,
        longitude,
        midias,
        dataCadastro: pesqueiroEmEdicao ? pesqueiroEmEdicao.dataCadastro : dataCadastro,
        concluido: false,
      };

      if (pesqueiroEmEdicao) {
        await updateDoc(doc(db, "pesca", pesqueiroEmEdicao.id), pescaData);
        toast({
          title: "Sucesso",
          description: "Dados de pesca atualizados com sucesso!",
        });
      } else {
        await addDoc(collection(db, "pesca"), pescaData);
        toast({
          title: "Sucesso",
          description: "Dados de pesca adicionados com sucesso!",
        });
      }

      // Limpa o formulário
      setLocalidade("");
      setNomeImovel("");
      setProprietario("");
      setOperacao("");
      setHoraMaquina(0);
      setAreaMecanizacao(0);
      setOperador("");
      setTecnicoResponsavel("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setPesqueiroEmEdicao(null);

      // Atualiza a lista
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const updatedPescaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPesqueirosCadastrados(updatedPescaData);
    } catch (error) {
      console.error("Erro ao salvar dados de pesca:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados de pesca.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setMidias([...midias, url]);
  };

  const handleEditarPesqueiro = (pesqueiro: any) => {
    setPesqueiroEmEdicao(pesqueiro);
    setLocalidade(pesqueiro.localidade);
    setNomeImovel(pesqueiro.nomeImovel);
    setProprietario(pesqueiro.proprietario);
    setOperacao(pesqueiro.operacao);
    setHoraMaquina(pesqueiro.horaMaquina);
    setAreaMecanizacao(pesqueiro.areaMecanizacao);
    setOperador(pesqueiro.operador);
    setTecnicoResponsavel(pesqueiro.tecnicoResponsavel);
    setLatitude(pesqueiro.latitude);
    setLongitude(pesqueiro.longitude);
    setMidias(pesqueiro.midias || []);
    setDataCadastro(pesqueiro.dataCadastro);
  };

  const handleExcluirPesqueiro = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir estes dados de pesca?")) {
      try {
        await deleteDoc(doc(db, "pesca", id));
        toast({
          title: "Sucesso",
          description: "Dados de pesca excluídos com sucesso!",
        });
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesqueirosCadastrados(pescaData);
      } catch (error) {
        console.error("Erro ao excluir dados de pesca:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir os dados de pesca.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciar Pesca</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="admin-map-pesca" className="w-full h-[400px] mb-8 rounded-lg overflow-hidden" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeImovel">Nome do Imóvel Rural</Label>
                <Input
                  id="nomeImovel"
                  value={nomeImovel}
                  onChange={(e) => setNomeImovel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietario">Nome do Proprietário</Label>
                <Input
                  id="proprietario"
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operacao">Operação</Label>
                <Input
                  id="operacao"
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaMaquina">Hora/máquina</Label>
                <Input
                  id="horaMaquina"
                  type="number"
                  value={horaMaquina}
                  onChange={(e) => setHoraMaquina(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaMecanizacao">Área para mecanização (hectares)</Label>
                <Input
                  id="areaMecanizacao"
                  type="number"
                  value={areaMecanizacao}
                  onChange={(e) => setAreaMecanizacao(Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
                <Input
                  id="tecnicoResponsavel"
                  value={tecnicoResponsavel}
                  onChange={(e) => setTecnicoResponsavel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCadastroPesca">Data</Label>
                <Input
                  id="dataCadastroPesca"
                  type="date"
                  value={dataCadastro}
                  onChange={(e) => setDataCadastro(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotos/Vídeos</Label>
              <Upload onUpload={handleUpload} />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {midias.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {pesqueiroEmEdicao ? "Atualizar" : "Adicionar"}
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pesqueiros Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pesqueirosCadastrados.map((pesqueiro) => (
              <div
                key={pesqueiro.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{pesqueiro.localidade}</h3>
                  <p className="text-sm text-gray-600">
                    {pesqueiro.nomeImovel} - {pesqueiro.concluido ? "Concluído" : "Em Andamento"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarPesqueiro(pesqueiro)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluirPesqueiro(pesqueiro.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// PAA Tab
const PAAForm = () => {
  const [localidade, setLocalidade] = useState("");
  const [nomeImovel, setNomeImovel] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [operacao, setOperacao] = useState("");
  const [horaMaquina, setHoraMaquina] = useState(0);
  const [areaMecanizacao, setAreaMecanizacao] = useState(0);
  const [operador, setOperador] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [paaLocaisCadastrados, setPaaLocaisCadastrados] = useState<any[]>([]);
  const [paaLocalEmEdicao, setPaaLocalEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPaaLocais = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paa"));
        const paaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaaLocaisCadastrados(paaData);
      } catch (error) {
        console.error("Erro ao buscar dados do PAA:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do PAA.",
          variant: "destructive",
        });
      }
    };

    fetchPaaLocais();
  }, []);

  useEffect(() => {
    const map = L.map("admin-map-paa").setView([-2.87922, -52.0088], 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on("click", (e) => {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);

      map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
    });

    return () => map.remove();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Clique no mapa para selecionar a localização.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const paaData = {
        localidade,
        nomeImovel,
        proprietario,
        operacao,
        horaMaquina,
        areaMecanizacao,
        operador,
        tecnicoResponsavel,
        latitude,
        longitude,
        midias,
        dataCadastro: paaLocalEmEdicao ? paaLocalEmEdicao.dataCadastro : dataCadastro,
        concluido: false,
      };

      if (paaLocalEmEdicao) {
        await updateDoc(doc(db, "paa", paaLocalEmEdicao.id), paaData);
        toast({
          title: "Sucesso",
          description: "Dados do PAA atualizados com sucesso!",
        });
      } else {
        await addDoc(collection(db, "paa"), paaData);
        toast({
          title: "Sucesso",
          description: "Dados do PAA adicionados com sucesso!",
        });
      }

      // Limpa o formulário
      setLocalidade("");
      setNomeImovel("");
      setProprietario("");
      setOperacao("");
      setHoraMaquina(0);
      setAreaMecanizacao(0);
      setOperador("");
      setTecnicoResponsavel("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setPaaLocalEmEdicao(null);

      // Atualiza a lista
      const querySnapshot = await getDocs(collection(db, "paa"));
      const paaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPaaLocaisCadastrados(paaData);
    } catch (error) {
      console.error("Erro ao salvar dados do PAA:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados do PAA.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setMidias([...midias, url]);
  };

  const handleEditarPaaLocal = (paaLocal: any) => {
    setPaaLocalEmEdicao(paaLocal);
    setLocalidade(paaLocal.localidade);
    setNomeImovel(paaLocal.nomeImovel);
    setProprietario(paaLocal.proprietario);
    setOperacao(paaLocal.operacao);
    setHoraMaquina(paaLocal.horaMaquina);
    setAreaMecanizacao(paaLocal.areaMecanizacao);
    setOperador(paaLocal.operador);
    setTecnicoResponsavel(paaLocal.tecnicoResponsavel);
    setLatitude(paaLocal.latitude);
    setLongitude(paaLocal.longitude);
    setMidias(paaLocal.midias || []);
    setDataCadastro(paaLocal.dataCadastro);
  };

  const handleExcluirPaaLocal = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir estes dados do PAA?")) {
      try {
        await deleteDoc(doc(db, "paa", id));
        toast({
          title: "Sucesso",
          description: "Dados do PAA excluídos com sucesso!",
        });
        const querySnapshot = await getDocs(collection(db, "paa"));
        const paaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaaLocaisCadastrados(paaData);
      } catch (error) {
        console.error("Erro ao excluir dados do PAA:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir os dados do PAA.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciar PAA</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="admin-map-paa" className="w-full h-[400px] mb-8 rounded-lg overflow-hidden" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeImovel">Nome do Imóvel Rural</Label>
                <Input
                  id="nomeImovel"
                  value={nomeImovel}
                  onChange={(e) => setNomeImovel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proprietario">Nome do Proprietário</Label>
                <Input
                  id="proprietario"
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operacao">Operação</Label>
                <Input
                  id="operacao"
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaMaquina">Hora/máquina</Label>
                <Input
                  id="horaMaquina"
                  type="number"
                  value={horaMaquina}
                  onChange={(e) => setHoraMaquina(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaMecanizacao">Área para mecanização (hectares)</Label>
                <Input
                  id="areaMecanizacao"
                  type="number"
                  value={areaMecanizacao}
                  onChange={(e) => setAreaMecanizacao(Number(e.target.value))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
                <Input
                  id="tecnicoResponsavel"
                  value={tecnicoResponsavel}
                  onChange={(e) => setTecnicoResponsavel(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataCadastroPaa">Data</Label>
                <Input
                  id="dataCadastroPaa"
                  type="date"
                  value={dataCadastro}
                  onChange={(e) => setDataCadastro(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fotos/Vídeos</Label>
              <Upload onUpload={handleUpload} />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {midias.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Mídia ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  {paaLocalEmEdicao ? "Atualizar" : "Adicionar"}
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PAA Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paaLocaisCadastrados.map((paaLocal) => (
              <div
                key={paaLocal.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-semibold">{paaLocal.localidade}</h3>
                  <p className="text-sm text-gray-600">
                    {paaLocal.nomeImovel} - {paaLocal.concluido ? "Concluído" : "Em Andamento"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditarPaaLocal(paaLocal)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleExcluirPaaLocal(paaLocal.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Admin = () => {
  return (
    <div className="container mx-auto px-4 py-20">
      <Tabs defaultValue="agricultura">
        <TabsList className="mb-8">
          <TabsTrigger value="agricultura">Agricultura</TabsTrigger>
          <TabsTrigger value="pesca">Pesca</TabsTrigger>
          <TabsTrigger value="paa">PAA</TabsTrigger>
        </TabsList>

        <TabsContent value="agricultura">
          <AgriculturaForm />
        </TabsContent>

        <TabsContent value="pesca">
          <PescaForm />
        </TabsContent>

        <TabsContent value="paa">
          <PAAForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;