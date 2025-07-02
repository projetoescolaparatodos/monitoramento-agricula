
import { useState, useEffect } from "react";
import { db } from "../utils/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import IconSelector from "@/components/admin/IconSelector";
import { getLeafletMapInstance, addMarkerToMap } from "@/utils/coordinateUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EnhancedUpload from "@/components/EnhancedUpload";
import { useLocation } from "wouter";
import { useAuthProtection } from "@/hooks/useAuthProtection";

const AdminAgricultura = () => {
  const { userAuth, hasAccess, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();

  // Verificar autenticação e permissões
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userAuth.isAuthenticated) {
    setLocation("/login/admin/agricultura");
    return null;
  }

  if (!hasAccess('agricultura')) {
    setLocation("/acesso-negado");
    return null;
  }
  const [nome, setNome] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [atividade, setAtividade] = useState("");
  const [piloto, setPiloto] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [operacao, setOperacao] = useState("");
  const [horaMaquina, setHoraMaquina] = useState(0);
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [tempoAtividade, setTempoAtividade] = useState(0);
  const [areaTrabalhada, setAreaTrabalhada] = useState(0);
  const [dataCadastro, setDataCadastro] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [tratoresCadastrados, setTratoresCadastrados] = useState<any[]>([]);
  const [tratorEmEdicao, setTratorEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [agriculturasAtividades, setAgriculturasAtividades] = useState<any[]>([]);

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTratoresCadastrados(tratoresData);
        setAgriculturasAtividades(tratoresData);
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

  const atualizarStatusAgricultura = async (id: string, statusAtual: boolean) => {
    try {
      await updateDoc(doc(db, "tratores", id), {
        concluido: !statusAtual,
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTratoresCadastrados(tratoresData);
      setAgriculturasAtividades(tratoresData);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const map = L.map("admin-map-agricultura").setView(
      [-2.87922, -52.0088],
      12,
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
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
      if (
        !nome ||
        !fazenda ||
        !atividade ||
        !piloto ||
        !latitude ||
        !longitude ||
        !operacao ||
        !areaTrabalhada ||
        !horaMaquina
      ) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const latitudeNum = parseFloat(String(latitude));
      const longitudeNum = parseFloat(String(longitude));
      const tempoAtividadeNum = tempoAtividade
        ? parseFloat(String(tempoAtividade))
        : null;
      const horaMaquinaNum = parseFloat(String(horaMaquina));
      const areaTrabalhadaNum = parseFloat(String(areaTrabalhada));

      const midiasValidas = midias.filter(
        (url) => url && typeof url === "string" && url.trim() !== "",
      );

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
        proprietario: proprietario || null,
        tecnicoResponsavel: tecnicoResponsavel || null,
        horaMaquina: horaMaquinaNum,
        operacao,
      };

      Object.keys(tratorData).forEach((key) => {
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

      setNome("");
      setFazenda("");
      setAtividade("");
      setPiloto("");
      setLocalidade("");
      setProprietario("");
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
        description:
          "Não foi possível salvar o trator: " +
          (error.message || "Verifique o formato do vídeo"),
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
    setProprietario(trator.proprietario || "");
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/admin")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-green-800">Administração - Agricultura</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Lista de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agriculturasAtividades.map((atividade) => (
              <Card key={atividade.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{atividade.nome}</h4>
                    <p className="text-sm text-gray-500">
                      Localidade: {atividade.localidade || atividade.fazenda || "Não informado"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Operador: {atividade.piloto || "Não informado"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Data: {new Date(atividade.dataCadastro).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={atividade.concluido ? "success" : "default"}>
                      {atividade.concluido ? "Concluído" : "Em Serviço"}
                    </Badge>
                    <Button
                      onClick={() => atualizarStatusAgricultura(atividade.id, atividade.concluido)}
                      variant="outline"
                      size="sm"
                    >
                      Alterar Status
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Cadastrar Nova Atividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="admin-map-agricultura"
            className="w-full h-[400px] mb-8 rounded-lg overflow-hidden"
          />

          <IconSelector 
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);

              const mapContainer = document.getElementById("admin-map-agricultura");
              if (!mapContainer) {
                console.error("Elemento do mapa não encontrado");
                return;
              }

              const mapInstance = getLeafletMapInstance(mapContainer);

              if (mapInstance) {
                console.log("Instância do mapa encontrada, atualizando...");
                addMarkerToMap(mapInstance, lat, lng, true);
              } else {
                console.error("Não foi possível acessar a instância do mapa");
                toast({
                  title: "Erro",
                  description: "Houve um problema ao atualizar o mapa. Por favor, atualize a página.",
                  variant: "destructive",
                });
              }
            }}
            initialLatitude={latitude}
            initialLongitude={longitude}
          />

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
                <Label htmlFor="proprietario">Nome do Proprietário</Label>
                <Input
                  id="proprietario"
                  value={proprietario}
                  onChange={(e) => setProprietario(e.target.value)}
                  placeholder="Nome do proprietário"
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
                <Label htmlFor="tempoAtividade">
                  Tempo de Atividade (minutos)
                </Label>
                <Input
                  id="tempoAtividade"
                  type="number"
                  value={tempoAtividade}
                  onChange={(e) => setTempoAtividade(Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaTrabalhada">Área para Mecanização (ha)</Label>
                <Input
                  id="areaTrabalhada"
                  type="number"
                  value={areaTrabalhada}
                  onChange={(e) => setAreaTrabalhada(Number(e.target.value))}
                  required
                  step="0.01"
                  min="0"
                  placeholder="Valor em hectares"
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
              <EnhancedUpload onUpload={handleUpload} />
              <div className="grid grid-cols-4 gap-2 mt-2">
                {midias.map((url, index) => (
                  <div key={index} className="relative group">
                    {url.includes("/video/") || url.includes("/video/upload/") || 
                      url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") ? (
                      <video
                        src={url}
                        controls
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          console.error("Erro ao carregar vídeo:", url);
                          e.currentTarget.poster = 'https://placehold.co/600x400?text=Erro+no+vídeo';
                        }}
                      />
                    ) : (
                      <img
                        src={url}
                        alt={`Mídia ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          console.error("Erro ao carregar imagem:", url);
                          (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Erro+ao+carregar';
                        }}
                      />
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setMidias(midias.filter((_, i) => i !== index))}
                    >
                      ✕
                    </Button>
                  </div>
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
                  <th className="p-2 border">Área (ha)</th>
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
                    <td className="p-2 border">{trator.areaTrabalhada ? parseFloat(trator.areaTrabalhada).toFixed(2) : "-"} ha</td>
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

export default AdminAgricultura;
