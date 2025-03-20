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
  const [localidade, setLocalidade] = useState("");
  const [operacao, setOperacao] = useState("");
  const [horaMaquina, setHoraMaquina] = useState(0);
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
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
    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma localização no mapa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Verificar campos obrigatórios
      if (!nome || !fazenda || !atividade || !piloto || !latitude || !longitude || !operacao || !areaTrabalhada || !horaMaquina) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Validar os valores numéricos
      const latitudeNum = parseFloat(String(latitude));
      const longitudeNum = parseFloat(String(longitude));
      const tempoAtividadeNum = tempoAtividade ? parseFloat(String(tempoAtividade)) : null;
      const horaMaquinaNum = parseFloat(String(horaMaquina));
      const areaTrabalhadaNum = parseFloat(String(areaTrabalhada));


      // Verificar se as mídias são válidas
      const midiasValidas = midias.filter(url => url && typeof url === 'string' && url.trim() !== '');

      // Criar objeto com dados validados
      const tratorData = {
        nome,
        fazenda,
        atividade,
        piloto,
        dataCadastro: new Date().toISOString(),
        concluido: false,
        latitude: latitudeNum,
        longitude: longitudeNum,
        tempoAtividade: tempoAtividadeNum,
        areaTrabalhada: areaTrabalhadaNum,
        midias: midiasValidas,
        localidade: localidade || null,
        tecnicoResponsavel: tecnicoResponsavel || null,
        horaMaquina: horaMaquinaNum,
        operacao
      };

      // Remover propriedades com valores null ou undefined
      Object.keys(tratorData).forEach(key => {
        if (tratorData[key] === null || tratorData[key] === undefined) {
          delete tratorData[key];
        }
      });

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
      setLocalidade("");
      setOperacao("");
      setHoraMaquina(0);
      setTecnicoResponsavel("");
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
        description: "Não foi possível salvar o trator: " + (error.message || "Verifique o formato do vídeo"),
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
    setLocalidade(trator.localidade || "");
    setOperacao(trator.operacao || "");
    setHoraMaquina(trator.horaMaquina || 0);
    setTecnicoResponsavel(trator.tecnicoResponsavel || "");
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
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  placeholder="-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fazenda">Nome do Imóvel Rural</Label>
                <Input
                  id="fazenda"
                  value={fazenda}
                  onChange={(e) => setFazenda(e.target.value)}
                  required
                  placeholder="Du Rancho"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operacao">Operação</Label>
                <Input
                  id="operacao"
                  value={operacao}
                  onChange={(e) => setOperacao(e.target.value)}
                  placeholder="pulverizacao do solo"
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
                <Label htmlFor="piloto">Operador</Label>
                <Input
                  id="piloto"
                  value={piloto}
                  onChange={(e) => setPiloto(e.target.value)}
                  placeholder="Paulo Silva"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
                <Input
                  id="tecnicoResponsavel"
                  value={tecnicoResponsavel}
                  onChange={(e) => setTecnicoResponsavel(e.target.value)}
                  placeholder="-"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaMaquina">Hora/máquina</Label>
                <Input
                  id="horaMaquina"
                  type="number"
                  value={horaMaquina}
                  onChange={(e) => setHoraMaquina(Number(e.target.value))}
                  placeholder="5"
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
                <Label htmlFor="areaTrabalhada">Área para mecanização (m²)</Label>
                <Input
                  id="areaTrabalhada"
                  type="number"
                  value={areaTrabalhada}
                  onChange={(e) => setAreaTrabalhada(Number(e.target.value))}
                  placeholder="4"
                  required
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
          <div className="overflow-x-auto mt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border">Nome</th>
                      <th className="p-2 border">Imóvel Rural</th>
                      <th className="p-2 border">Operação</th>
                      <th className="p-2 border">Operador</th>
                      <th className="p-2 border">H/Máquina</th>
                      <th className="p-2 border">Área (m²)</th>
                      <th className="p-2 border">Data</th>
                      <th className="p-2 border">Status</th>
                      <th className="p-2 border">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tratoresCadastrados.map((trator) => (
                      <tr key={trator.id} className="hover:bg-gray-50">
                        <td className="p-2 border">{trator.nome}</td>
                        <td className="p-2 border">{trator.fazenda}</td>
                        <td className="p-2 border">{trator.operacao}</td>
                        <td className="p-2 border">{trator.piloto}</td>
                        <td className="p-2 border">{trator.horaMaquina || "-"}</td>
                        <td className="p-2 border">{trator.areaTrabalhada}</td>
                        <td className="p-2 border">
                          {new Date(trator.dataCadastro).toLocaleDateString()}
                        </td>
                        <td className="p-2 border">
                          {trator.concluido ? "Concluído" : "Em Serviço"}
                        </td>
                        <td className="p-2 border">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditarTrator(trator)}
                            >
                              <Edit2 className="h-4 w-4 mr-1" /> Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleExcluirTrator(trator.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
  const [tipoTanque, setTipoTanque] = useState("");
  const [especiePeixe, setEspeciePeixe] = useState("");
  const [quantidadeAlevinos, setQuantidadeAlevinos] = useState(0);
  const [metodoAlimentacao, setMetodoAlimentacao] = useState("");
  const [operador, setOperador] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [pesqueirosCadastrados, setPesqueirosCadastrados] = useState<any[]>([]);
  const [pesqueiroEmEdicao, setPesqueiroEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [numeroRegistro, setNumeroRegistro] = useState("");
  const [areaImovel, setAreaImovel] = useState(0);
  const [areaAlagada, setAreaAlagada] = useState(0);
  const [cicloProdução, setCicloProdução] = useState("");
  const [sistemaCultivo, setSistemaCultivo] = useState("");
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
        tipoTanque,
        especiePeixe,
        quantidadeAlevinos,
        metodoAlimentacao,
        operador,
        tecnicoResponsavel,
        latitude,
        longitude,
        midias,
        dataCadastro: pesqueiroEmEdicao ? pesqueiroEmEdicao.dataCadastro : dataCadastro,
        concluido: false,
        numeroRegistro,
        areaImovel,
        areaAlagada,
        cicloProdução,
        sistemaCultivo
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
      setTipoTanque("");
      setEspeciePeixe("");
      setQuantidadeAlevinos(0);
      setMetodoAlimentacao("");
      setOperador("");
      setTecnicoResponsavel("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setNumeroRegistro("");
      setAreaImovel(0);
      setAreaAlagada(0);
      setCicloProdução("");
      setSistemaCultivo("");
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
    setTipoTanque(pesqueiro.tipoTanque || "");
    setEspeciePeixe(pesqueiro.especiePeixe || "");
    setQuantidadeAlevinos(pesqueiro.quantidadeAlevinos || 0);
    setMetodoAlimentacao(pesqueiro.metodoAlimentacao || "");
    setOperador(pesqueiro.operador);
    setTecnicoResponsavel(pesqueiro.tecnicoResponsavel);
    setLatitude(pesqueiro.latitude);
    setLongitude(pesqueiro.longitude);
    setMidias(pesqueiro.midias || []);
    setDataCadastro(pesqueiro.dataCadastro);
    setNumeroRegistro(pesqueiro.numeroRegistro || "");
    setAreaImovel(pesqueiro.areaImovel || 0);
    setAreaAlagada(pesqueiro.areaAlagada || 0);
    setCicloProdução(pesqueiro.cicloProdução || "");
    setSistemaCultivo(pesqueiro.sistemaCultivo || "");
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
                <Label htmlFor="tipoTanque">Tipo de Ambiente de Cultivo</Label>
                <Input
                  id="tipoTanque"
                  value={tipoTanque}
                  onChange={(e) => setTipoTanque(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especiePeixe">Espécie</Label>
                <Input
                  id="especiePeixe"
                  value={especiePeixe}
                  onChange={(e) => setEspeciePeixe(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeAlevinos">Quantidade de Alevinos</Label>
                <Input
                  id="quantidadeAlevinos"
                  type="number"
                  value={quantidadeAlevinos}
                  onChange={(e) => setQuantidadeAlevinos(Number(e.target.value))}
                  placeholder="Número de alevinos no tanque"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoAlimentacao">Método de Alimentação</Label>
                <Input
                  id="metodoAlimentacao"
                  value={metodoAlimentacao}
                  onChange={(e) => setMetodoAlimentacao(e.target.value)}
                  placeholder="Ex: Ração, alimentação natural, etc."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroRegistro">N° de Registro</Label>
                <Input
                  id="numeroRegistro"
                  value={numeroRegistro}
                  onChange={(e) => setNumeroRegistro(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaImovel">Área do imóvel (ha)</Label>
                <Input
                  id="areaImovel"
                  type="number"
                  value={areaImovel}
                  onChange={(e) => setAreaImovel(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaAlagada">Área Alagada (ha)</Label>
                <Input
                  id="areaAlagada"
                  type="number"
                  value={areaAlagada}
                  onChange={(e) => setAreaAlagada(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cicloProdução">Ciclo de produção</Label>
                <Input
                  id="cicloProdução"
                  value={cicloProdução}
                  onChange={(e) => setCicloProdução(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sistemaCultivo">Sistema de cultivo</Label>
                <Input
                  id="sistemaCultivo"
                  value={sistemaCultivo}
                  onChange={(e) => setSistemaCultivo(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="operador">Operador</Label>
                <Input
                  id="operador"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
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
          </div>        </CardContent>
      </Card>
    </div>
  );
};

// PAA Tab
const PAAForm = () => {
  const [localidade, setLocalidade] = useState("");
  const [nomeImovel, setNomeImovel] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [tipoAlimento, setTipoAlimento] = useState("");
  const [quantidadeProduzida, setQuantidadeProduzida] = useState(0);
  const [metodoColheita, setMetodoColheita] = useState("");
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
        tipoAlimento,
        quantidadeProduzida,
        metodoColheita,
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
      setTipoAlimento("");
      setQuantidadeProduzida(0);
      setMetodoColheita("");
      setOperador("");
      setTecnicoResponsavel("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setPaaLocalEmEdicao(null);

      // Atualiza a lista
      const querySnapshot = await getDocs(collection(db, "paa"));
      const updatedPaaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPaaLocaisCadastrados(updatedPaaData);
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
    setTipoAlimento(paaLocal.tipoAlimento || "");
    setQuantidadeProduzida(paaLocal.quantidadeProduzida || 0);
    setMetodoColheita(paaLocal.metodoColheita || "");
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
                <Label htmlFor="tipoAlimento">Tipo de Alimento</Label>
                <Input
                  id="tipoAlimento"
                  value={tipoAlimento}
                  onChange={(e) => setTipoAlimento(e.target.value)}
                  placeholder="Ex: Feijão, Arroz, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeProduzida">Quantidade Produzida</Label>
                <Input
                  id="quantidadeProduzida"
                  type="number"
                  value={quantidadeProduzida}
                  onChange={(e) => setQuantidadeProduzida(Number(e.target.value))}
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metodoColheita">Método de Colheita</Label>
                <Input
                  id="metodoColheita"
                  value={metodoColheita}
                  onChange={(e) => setMetodoColheita(e.target.value)}
                  placeholder="Ex: Manual, Mecanizada"
                  required
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
  const [pescaLocaisCadastrados, setPescaLocaisCadastrados] = useState<any[]>([]);
  const [tratoresCadastrados, setTratoresCadastrados] = useState<any[]>([]);
  const [paaLocaisCadastrados, setPaaLocaisCadastrados] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tratoresSnapshot, pescaSnapshot, paaSnapshot] = await Promise.all([
          getDocs(collection(db, "tratores")),
          getDocs(collection(db, "pesca")),
          getDocs(collection(db, "paa")),
        ]);
        setTratoresCadastrados(tratoresSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setPescaLocaisCadastrados(pescaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setPaaLocaisCadastrados(paaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({ title: "Erro", description: "Não foi possível carregar os dados.", variant: "destructive" });
      }
    };

    fetchData();
  }, []);


  const handleStatusUpdate = async (collectionName: string, itemId: string, newStatus: boolean) => {
    try {
      const docRef = doc(db, collectionName, itemId);
      await updateDoc(docRef, {
        concluido: newStatus
      });

      // Refresh data after update
      const querySnapshot = await getDocs(collection(db, collectionName));
      const updatedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Update state based on collection
      switch(collectionName) {
        case "paa":
          setPaaLocaisCadastrados(updatedData);
          break;
        case "pesca":
          setPescaLocaisCadastrados(updatedData);
          break;
        case "tratores":
          setTratoresCadastrados(updatedData);
          break;
      }

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });

      // Dispatch event to update reports
      const event = new CustomEvent(`${collectionName}DataUpdated`, { detail: updatedData });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciar Status das Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Agricultura</h3>
              <div className="grid gap-4">
                {tratoresCadastrados.map((trator) => (
                  <div key={trator.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{trator.nome || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{trator.localidade || trator.fazenda}</p>
                    </div>
                    <Button
                      variant={trator.concluido ? "outline" : "default"}
                      onClick={() => handleStatusUpdate("tratores", trator.id, !trator.concluido)}
                    >
                      {trator.concluido ? "Marcar Em Serviço" : "Marcar Concluído"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Pesca</h3>
              <div className="grid gap-4">
                {pescaLocaisCadastrados.map((pesca) => (
                  <div key={pesca.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{pesca.localidade || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{pesca.tipoTanque}</p>
                    </div>
                    <Button
                      variant={pesca.concluido ? "outline" : "default"}
                      onClick={() => handleStatusUpdate("pesca", pesca.id, !pesca.concluido)}
                    >
                      {pesca.concluido ? "Marcar Em Andamento" : "Marcar Concluído"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">PAA</h3>
              <div className="grid gap-4">
                {paaLocaisCadastrados.map((paa) => (
                  <div key={paa.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{paa.localidade || 'Sem nome'}</p>
                      <p className="text-sm text-gray-500">{paa.tipoAlimento}</p>
                    </div>
                    <Button
                      variant={paa.concluido ? "outline" : "default"}
                      onClick={() => handleStatusUpdate("paa", paa.id, !paa.concluido)}
                    >
                      {paa.concluido ? "Marcar Em Andamento" : "Marcar Concluído"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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