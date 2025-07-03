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
import styles from "./PescaMap.module.css";

interface Pesca {
  id: string;
  numeroRegistro?: string;
  localidade: string;
  nomeImovel?: string;
  proprietario?: string;
  tipoTanque: string;
  areaImovel?: number;
  areaAlagada?: number;
  cicloProdução?: string;
  sistemaCultivo?: string;
  especiePeixe: string;
  quantidadeAlevinos: number;
  metodoAlimentacao: string;
  operador?: string;
  tecnicoResponsavel?: string;
  dataCadastro: string;
  concluido: boolean;
  latitude: number;
  longitude: number;
  midias?: string[];
}

const AdminPesca = () => {
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
  const [tipoTanque, setTipoTanque] = useState("");
  const [areaAlagada, setAreaAlagada] = useState(0);
  const [especiePeixe, setEspeciePeixe] = useState("");
  const [quantidadeAlevinos, setQuantidadeAlevinos] = useState(0);
  const [metodoAlimentacao, setMetodoAlimentacao] = useState("");
  const [operador, setOperador] = useState("");
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: -3.15, lng: -52.0088 });
  const [mapZoom, setMapZoom] = useState(12);
  const [midias, setMidias] = useState<string[]>([]);
  const [dataCadastro, setDataCadastro] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estados de dados
  const [pesqueirosCadastrados, setPesqueirosCadastrados] = useState<Pesca[]>([]);
  const [pesqueiroEmEdicao, setPesqueiroEmEdicao] = useState<Pesca | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<Pesca | null>(null);
  
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

  // useEffect para buscar dados (sempre executa - não condicional)
  useEffect(() => {
    const fetchPesqueiros = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pesca[];
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
  }, [toast]);

  // Verificações condicionais (sempre executam após os hooks)
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
    setLocation(getLoginUrl('pesca'));
    return null;
  }

  if (!hasAccess('pesca')) {
    setLocation("/acesso-negado");
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  const atualizarStatusPesca = async (id: string, statusAtual: boolean) => {
    try {
      await updateDoc(doc(db, "pesca", id), {
        concluido: !statusAtual,
      });
      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso!",
      });

      // Recarrega os dados
      const snapshot = await getDocs(collection(db, "pesca"));
      const updatedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pesca[];
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

  const handleMarkerClick = (pesqueiro: Pesca) => {
    setSelectedMarker(pesqueiro);
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
      const pescaData = {
        localidade,
        nomeImovel,
        proprietario,
        tipoTanque,
        areaAlagada,
        especiePeixe,
        quantidadeAlevinos,
        metodoAlimentacao,
        operador,
        tecnicoResponsavel,
        latitude,
        longitude,
        midias,
        dataCadastro: dataCadastro,
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
      setTipoTanque("");
      setAreaAlagada(0);
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

      // Recarrega os dados
      const querySnapshot = await getDocs(collection(db, "pesca"));
      const updatedPescaData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Pesca[];
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

  const handleEditarPesqueiro = (pesqueiro: Pesca) => {
    setPesqueiroEmEdicao(pesqueiro);
    setLocalidade(pesqueiro.localidade || "");
    setNomeImovel(pesqueiro.nomeImovel || "");
    setProprietario(pesqueiro.proprietario || "");
    setTipoTanque(pesqueiro.tipoTanque || "");
    setAreaAlagada(pesqueiro.areaAlagada || 0);
    setEspeciePeixe(pesqueiro.especiePeixe || "");
    setQuantidadeAlevinos(pesqueiro.quantidadeAlevinos || 0);
    setMetodoAlimentacao(pesqueiro.metodoAlimentacao || "");
    setOperador(pesqueiro.operador || "");
    setTecnicoResponsavel(pesqueiro.tecnicoResponsavel || "");
    setLatitude(pesqueiro.latitude || null);
    setLongitude(pesqueiro.longitude || null);
    setMapCenter({lat: pesqueiro.latitude, lng: pesqueiro.longitude} || { lat: -3.15, lng: -52.0088 });
    setMapZoom(15);
    setMidias(pesqueiro.midias || []);
    // Converter a data para o formato YYYY-MM-DD se necessário
    const dataFormatada = pesqueiro.dataCadastro ? 
      (pesqueiro.dataCadastro.includes('T') ? 
        pesqueiro.dataCadastro.split('T')[0] : 
        pesqueiro.dataCadastro) : 
      new Date().toISOString().split("T")[0];
    setDataCadastro(dataFormatada);
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

        // Recarrega os dados
        const querySnapshot = await getDocs(collection(db, "pesca"));
        const pescaData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Pesca[];
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

  const cancelarEdicao = () => {
    setPesqueiroEmEdicao(null);
    setLocalidade("");
    setNomeImovel("");
    setProprietario("");
    setTipoTanque("");
    setAreaAlagada(0);
    setEspeciePeixe("");
    setQuantidadeAlevinos(0);
    setMetodoAlimentacao("");
    setOperador("");
    setTecnicoResponsavel("");
    setLatitude(null);
    setLongitude(null);
    setMidias([]);
    setDataCadastro(new Date().toISOString().split("T")[0]);
  };

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setLocation("/")}
          className="bg-green-600 text-black border-green-600 hover:bg-green-700 hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-blue-800">Administração - Pesca</h1>
      </div>

      {/* Lista de Atividades */}
      <Card className="mb-8 bg-gray-500">
        <CardHeader>
          <CardTitle className="text-white">Lista de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pesqueirosCadastrados.length === 0 ? (
              <p className="text-white text-center py-4">
                Nenhuma atividade cadastrada ainda.
              </p>
            ) : (
              pesqueirosCadastrados.map((atividade) => (
                <Card key={atividade.id} className="p-4 bg-gray-600">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-white">{atividade.localidade}</h4>
                      <p className="text-sm text-white">
                        Operador: {atividade.operador || "Não informado"}
                      </p>
                      <p className="text-sm text-white">
                        Data: {new Date(atividade.dataCadastro).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={atividade.concluido ? "default" : "secondary"}>
                        {atividade.concluido ? "Concluído" : "Em Serviço"}
                      </Badge>
                      <Button
                        onClick={() => atualizarStatusPesca(atividade.id, atividade.concluido)}
                        variant="outline"
                        size="sm"
                        className="bg-green-600 text-black border-green-600 hover:bg-green-700 hover:text-black"
                      >
                        Alterar Status
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Cadastro */}
      <Card className="mb-8 bg-gray-500">
        <CardHeader>
          <CardTitle>
            {pesqueiroEmEdicao ? "Editar Atividade" : "Cadastrar Nova Atividade"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mapa do Google Maps */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block">
              Selecione a localização no mapa
            </Label>

            {/* Componente para inserção manual de coordenadas */}
            <div className="bg-gray-500 rounded-lg p-4">
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
                {/* Marcadores dos pesqueiros existentes */}
                {pesqueirosCadastrados.map((pesca) => (
                  <MarkerF
                    key={pesca.id}
                    position={{ lat: pesca.latitude, lng: pesca.longitude }}
                    onClick={() => handleMarkerClick(pesca)}
                    icon={{
                      url: "/pesca-icon.png",
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
                      url: "/pesca-icon.png",
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
                <Label htmlFor="areaAlagada">Área Alagada (ha)</Label>
                <Input
                  id="areaAlagada"
                  type="number"
                  step="0.01"
                  value={areaAlagada}
                  onChange={(e) => setAreaAlagada(Number(e.target.value))}
                  placeholder="Ex: 2.5"
                  required
                  min="0"
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
                  Quantidade de Alevinos (kg)
                </Label>
                <Input
                  id="quantidadeAlevinos"
                  type="number"
                  step="0.01"
                  value={quantidadeAlevinos}
                  onChange={(e) =>
                    setQuantidadeAlevinos(Number(e.target.value))
                  }
                  placeholder="Peso dos alevinos em kg"
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
              <Label className="text-white">Fotos/Vídeos</Label>
              <div className="bg-gray-500 rounded-lg p-4">
                <EnhancedUpload onUpload={handleUpload} />
              </div>
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
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white hover:bg-red-700"
                      onClick={() => setMidias(midias.filter((_, i) => i !== index))}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1 bg-green-600 text-black hover:bg-green-700 hover:text-black">
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

              {pesqueiroEmEdicao && (
                <Button type="button" variant="outline" onClick={cancelarEdicao} className="bg-green-600 text-black border-green-600 hover:bg-green-700 hover:text-black">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Pesqueiros Cadastrados */}
      <Card className="bg-gray-500">
        <CardHeader>
          <CardTitle className="text-white">Pesqueiros Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pesqueirosCadastrados.length === 0 ? (
              <p className="text-white text-center py-8">
                Nenhum pesqueiro cadastrado ainda.
              </p>
            ) : (
              pesqueirosCadastrados.map((pesqueiro) => (
                <div
                  key={pesqueiro.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-400"
                >
                  <div>
                    <h3 className="font-semibold text-white">{pesqueiro.localidade}</h3>
                    <p className="text-sm text-white">
                      {pesqueiro.nomeImovel} -{" "}
                      {pesqueiro.concluido ? "Concluído" : "Em Andamento"}
                    </p>
                    <p className="text-xs text-white">
                      Proprietário: {pesqueiro.proprietario}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditarPesqueiro(pesqueiro)}
                      className="bg-green-600 text-black border-green-600 hover:bg-green-700 hover:text-black"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleExcluirPesqueiro(pesqueiro.id)}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default AdminPesca;