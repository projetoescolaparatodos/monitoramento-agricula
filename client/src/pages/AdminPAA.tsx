
import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
import {
  useLoadScript,
  GoogleMap,
  MarkerF,
  Polygon,
} from "@react-google-maps/api";
import EnhancedUpload from "@/components/EnhancedUpload";
import { useLocation } from "wouter";
import { useAuthProtection } from "@/hooks/useAuthProtection";
import { useKmlBoundary, isClockwise, ensureClockwise } from "../hooks/useKmlBoundary";
import styles from "./PAAMap.module.css";

const AdminPAA = () => {
  // Hooks sempre devem estar no topo do componente
  const { userAuth, hasAccess, getLoginUrl, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  // Estados do formulário
  const [localidade, setLocalidade] = useState("");
  const [nomeImovel, setNomeImovel] = useState("");
  const [proprietario, setProprietario] = useState("");
  const [tipoAlimento, setTipoAlimento] = useState("");
  const [quantidadeProduzida, setQuantidadeProduzida] = useState(0);
  const [operador, setOperador] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -2.87922, lng: -52.0088 });
  const [mapZoom, setMapZoom] = useState(12);
  const [midias, setMidias] = useState<string[]>([]);
  const [dataCadastro, setDataCadastro] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estados de dados
  const [paaLocaisCadastrados, setPaaLocaisCadastrados] = useState<any[]>([]);
  const [paaLocalEmEdicao, setPaaLocalEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [atividades, setAtividades] = useState<any[]>([]);

  // Estados para controle do contorno municipal
  const [showBoundary, setShowBoundary] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Configurações do Google Maps
  const mapContainerStyle = {
    width: "100%",
    height: "400px",
  };

  const center = { lat: -2.87922, lng: -52.0088 };
  
  // Usando o hook personalizado para carregar o contorno do município
  const { boundaryCoordinates, loading: loadingKml, error: kmlError } = useKmlBoundary();
  
  // Fallback para coordenadas caso o KML não seja carregado
  const fallbackBoundary = useMemo(() => [
    { lat: -2.85, lng: -52.05 },
    { lat: -2.88, lng: -51.95 },
    { lat: -2.93, lng: -51.98 },
    { lat: -2.91, lng: -52.07 },
    { lat: -2.85, lng: -52.05 }, // Fechar o polígono
  ], []);
  
  // Usar coordenadas do KML se disponíveis, senão usar fallback
  const municipioBoundary = useMemo(() => {
    if (boundaryCoordinates.length > 0) {
      return boundaryCoordinates;
    }
    return fallbackBoundary;
  }, [boundaryCoordinates, fallbackBoundary]);
  
  // Estilo para o contorno do município
  const boundaryStyle = useMemo(() => ({
    fillColor: '#00ff88',
    fillOpacity: 0.1,
    strokeColor: '#00ff88',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    zIndex: 2,
    clickable: false
  }), []);
  
  // Garantir que o caminho do município esteja no sentido horário
  const correctedBoundary = useMemo(() => {
    return ensureClockwise(municipioBoundary);
  }, [municipioBoundary]);

  // useEffect para buscar dados (sempre executa)
  useEffect(() => {
    const fetchPaaLocais = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "paa"));
        const paaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPaaLocaisCadastrados(paaData);
        setAtividades(paaData);
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
  }, [toast]);

  // Verificações condicionais após hooks básicos
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userAuth.isAuthenticated) {
    setLocation(getLoginUrl('paa'));
    return null;
  }

  if (!hasAccess('paa')) {
    setLocation("/acesso-negado");
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  const atualizarStatus = async (id: string, statusAtual: boolean) => {
    try {
      await updateDoc(doc(db, "paa", id), {
        concluido: !statusAtual,
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });
      const querySnapshot = await getDocs(collection(db, "paa"));
      const atividadesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAtividades(atividadesData);
      setPaaLocaisCadastrados(atividadesData);
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setLatitude(lat);
      setLongitude(lng);
      setMapCenter({ lat, lng });
      setMapZoom(15);
    }
  };

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
        operador,
        tecnicoResponsavel,
        latitude,
        longitude,
        midias,
        dataCadastro: paaLocalEmEdicao
          ? paaLocalEmEdicao.dataCadastro
          : dataCadastro,
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

      setLocalidade("");
      setNomeImovel("");
      setProprietario("");
      setTipoAlimento("");
      setQuantidadeProduzida(0);
      setOperador("");
      setTecnicoResponsavel("");
      setLatitude(null);
      setLongitude(null);
      setMidias([]);
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setPaaLocalEmEdicao(null);

      const querySnapshot = await getDocs(collection(db, "paa"));
      const updatedPaaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPaaLocaisCadastrados(updatedPaaData);
      setAtividades(updatedPaaData);
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
    setOperador(paaLocal.operador);
    setTecnicoResponsavel(paaLocal.tecnicoResponsavel);
    setLatitude(paaLocal.latitude);
    setLongitude(paaLocal.longitude);
    setMapCenter({lat: paaLocal.latitude, lng: paaLocal.longitude} || { lat: -2.87922, lng: -52.0088 });
    setMapZoom(15);
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
        setAtividades(paaData);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-amber-800">Administração - PAA</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Lista de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atividades.map((atividade) => (
              <Card key={atividade.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold">{atividade.localidade}</h4>
                    <p className="text-sm text-gray-500">
                      Técnico: {atividade.tecnicoResponsavel || "Não informado"}
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
                      onClick={() => atualizarStatus(atividade.id, atividade.concluido)}
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
          {/* Mapa do Google Maps */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block">
              Selecione a localização no mapa
            </Label>

            {/* Componente para inserção manual de coordenadas */}
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <IconSelector 
                onLocationSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }}
                onMapCenterChange={(lat, lng) => {
                  setMapCenter({ lat, lng });
                  setMapZoom(15);
                }}
                initialLatitude={latitude}
                initialLongitude={longitude}
              />
            </div>

            <div className="rounded-lg overflow-hidden border relative">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={mapZoom}
                onClick={handleMapClick}
                onLoad={() => setMapLoaded(true)}
                options={{
                  mapTypeId: google.maps.MapTypeId.HYBRID,
                  mapTypeControl: true,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                {/* Marcadores dos PAA existentes */}
                {paaLocaisCadastrados.map((paa) => (
                  <MarkerF
                    key={paa.id}
                    position={{ lat: paa.latitude, lng: paa.longitude }}
                    icon={{
                      url: "/paa-icon.png",
                      scaledSize: new window.google.maps.Size(40, 40),
                      anchor: new window.google.maps.Point(20, 40),
                    }}
                  />
                ))}

                {/* Marcador para a nova localização selecionada */}
                {latitude && longitude && (
                  <MarkerF
                    position={{ lat: latitude, lng: longitude }}
                    icon={{
                      url: "/paa-icon.png",
                      scaledSize: new window.google.maps.Size(50, 50),
                      anchor: new window.google.maps.Point(25, 50),
                    }}
                  />
                )}

                {/* Contorno do município */}
                {showBoundary && (
                  <Polygon
                    paths={correctedBoundary}
                    options={boundaryStyle}
                  />
                )}
              </GoogleMap>
              
              {/* Botão de controle para o limite municipal */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => setShowBoundary(!showBoundary)}
                  className={styles["boundary-toggle"]}
                  title={showBoundary ? "Ocultar Contorno Municipal" : "Mostrar Contorno Municipal"}
                >
                  <img 
                    src="/contornoicone.png" 
                    alt="Contorno Municipal" 
                    className={`${showBoundary ? styles["icon-active"] : ""}`}
                  />
                </button>
              </div>
            </div>

            {latitude && longitude && (
              <div className="mt-2 text-sm text-gray-600">
                <strong>Coordenadas selecionadas:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </div>
            )}
          </div>

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
                <Label htmlFor="quantidadeProduzida">
                  Quantidade Produzida
                </Label>
                <Input
                  id="quantidadeProduzida"
                  type="number"
                  value={quantidadeProduzida}
                  onChange={(e) =>
                    setQuantidadeProduzida(Number(e.target.value))
                  }
                  required
                  min="0"
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
                    {paaLocal.nomeImovel} -{" "}
                    {paaLocal.concluido ? "Concluído" : "Em Andamento"}
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

export default AdminPAA;
