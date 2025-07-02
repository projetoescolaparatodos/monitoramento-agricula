
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
import { Loader2, Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import EnhancedUpload from "@/components/EnhancedUpload";
import { useLocation } from "wouter";
import { useAuthProtection } from "@/hooks/useAuthProtection";

const AdminPesca = () => {
  // Hooks sempre devem estar no topo do componente
  const { userAuth, hasAccess, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();
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
  const [dataCadastro, setDataCadastro] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [pesqueirosCadastrados, setPesqueirosCadastrados] = useState<any[]>([]);
  const [pesqueiroEmEdicao, setPesqueiroEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [pescaData, setPescaData] = useState<any[]>([]);
  const { toast } = useToast();

  // Verificar autenticação e permissões
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userAuth.isAuthenticated) {
    setLocation("/login/admin/pesca");
    return null;
  }

  if (!hasAccess('pesca')) {
    setLocation("/acesso-negado");
    return null;
  }

  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPesqueirosCadastrados(pescaData);
        setPescaData(pescaData);
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

  const atualizarStatusPesca = async (id: string, statusAtual: boolean) => {
    try {
      await updateDoc(doc(db, "pesca", id), {
        concluido: !statusAtual,
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
      const snapshot = await getDocs(collection(db, "pesca"));
      const updatedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPescaData(updatedData);
      setPesqueirosCadastrados(updatedData);
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
    const map = L.map("admin-map-pesca").setView([-2.87922, -52.0088], 12);

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
        dataCadastro: pesqueiroEmEdicao
          ? pesqueiroEmEdicao.dataCadastro
          : dataCadastro,
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
      setPesqueiroEmEdicao(null);

      const querySnapshot = await getDocs(collection(db, "pesca"));
      const updatedPescaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPesqueirosCadastrados(updatedPescaData);
      setPescaData(updatedPescaData);
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
  };

  const handleExcluirPesqueiro = async (id: string) => {
    if (
      window.confirm("Tem certeza que deseja excluir estes dados de pesca?")
    ) {
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
        setPescaData(pescaData);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/admin")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-blue-800">Administração - Pesca</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Lista de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pescaData?.map((atividade) => (
              <Card key={atividade.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{atividade.localidade}</h4>
                    <p className="text-sm text-gray-500">
                      Operador: {atividade.operador || "Não informado"}
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
                      onClick={() => atualizarStatusPesca(atividade.id, atividade.concluido)}
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
          <CardTitle>Cadastrar Nova Atividade</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            id="admin-map-pesca"
            className="w-full h-[400px] mb-8 rounded-lg overflow-hidden"
          />

          <IconSelector 
            onLocationSelect={(lat, lng) => {
              setLatitude(lat);
              setLongitude(lng);

              const mapContainer = document.getElementById("admin-map-pesca");
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
                <Label htmlFor="tipoTanque">Estrutura Aquícola</Label>
                <Input
                  id="tipoTanque"
                  value={tipoTanque}
                  onChange={(e) => setTipoTanque(e.target.value)}
                  placeholder="Ex: Tanque escavado, tanque rede, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especiePeixe">Espécie de Peixe</Label>
                <Input
                  id="especiePeixe"
                  value={especiePeixe}
                  onChange={(e) => setEspeciePeixe(e.target.value)}
                  placeholder="Ex: Tilápia, Tambaqui, etc."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadeAlevinos">
                  Quantidade de Alevinos
                </Label>
                <Input
                  id="quantidadeAlevinos"
                  type="number"
                  value={quantidadeAlevinos}
                  onChange={(e) =>
                    setQuantidadeAlevinos(Number(e.target.value))
                  }
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
                    {pesqueiro.nomeImovel} -{" "}
                    {pesqueiro.concluido ? "Concluído" : "Em Andamento"}
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

export default AdminPesca;
