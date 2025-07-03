
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
import { Loader2, MapPin, Trash2, Edit2, Plus, ArrowLeft } from "lucide-react";
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
import styles from "./AgriculturaMap.module.css";

const AdminAgricultura = () => {
  // Hooks sempre devem estar no topo do componente
  const { userAuth, hasAccess, getLoginUrl, isLoading } = useAuthProtection();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Google Maps
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyC3fPdcovy7a7nQLe9aGBMR2PFY_qZZVZc",
  });

  // Estados do formulário
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
  const [mapCenter, setMapCenter] = useState({ lat: -2.87922, lng: -52.0088 });
  const [mapZoom, setMapZoom] = useState(12);
  const [midias, setMidias] = useState<string[]>([]);
  const [tempoAtividade, setTempoAtividade] = useState(0);
  const [areaTrabalhada, setAreaTrabalhada] = useState(0);
  const [dataCadastro, setDataCadastro] = useState(
    new Date().toISOString().split("T")[0],
  );

  // Estados de dados
  const [tratoresCadastrados, setTratoresCadastrados] = useState<any[]>([]);
  const [tratorEmEdicao, setTratorEmEdicao] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [agriculturasAtividades, setAgriculturasAtividades] = useState<any[]>([]);

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
  }, [toast]);

  // Verificações condicionais após hooks básicos
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
    setLocation(getLoginUrl('agricultura'));
    return null;
  }

  if (!hasAccess('agricultura')) {
    setLocation("/acesso-negado");
    return null;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

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
    setMapCenter({lat: trator.latitude, lng: trator.longitude} || { lat: -2.87922, lng: -52.0088 });
    setMapZoom(15);
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
          onClick={() => setLocation("/")}
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
                {/* Marcadores dos tratores existentes */}
                {tratoresCadastrados.map((trator) => (
                  <MarkerF
                    key={trator.id}
                    position={{ lat: trator.latitude, lng: trator.longitude }}
                    icon={{
                      url: "/trator-icon.png",
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
                      url: "/trator-icon.png",
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
