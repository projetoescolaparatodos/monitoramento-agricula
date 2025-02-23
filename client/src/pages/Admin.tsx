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

interface Trator {
  id: string;
  nome: string;
  fazenda: string;
  atividade: string;
  piloto: string;
  latitude: number;
  longitude: number;
  midias: string[];
  dataCadastro: string;
  tempoAtividade: number;
  concluido: boolean;
}

const Admin = () => {
  const [nome, setNome] = useState("");
  const [fazenda, setFazenda] = useState("");
  const [atividade, setAtividade] = useState("");
  const [piloto, setPiloto] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [midias, setMidias] = useState<string[]>([]);
  const [tempoAtividade, setTempoAtividade] = useState(0);
  const [dataCadastro, setDataCadastro] = useState(new Date().toISOString().split("T")[0]);
  const [tratoresCadastrados, setTratoresCadastrados] = useState<Trator[]>([]);
  const [tratorEmEdicao, setTratorEmEdicao] = useState<Trator | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTratores = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tratores"));
        const tratoresData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Trator[];
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
    const map = L.map("admin-map").setView([-2.87922, -52.0088], 12);

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
      setDataCadastro(new Date().toISOString().split("T")[0]);
      setTratorEmEdicao(null);

      // Atualiza a lista
      const querySnapshot = await getDocs(collection(db, "tratores"));
      const tratoresData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Trator[];
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

  const handleEditarTrator = (trator: Trator) => {
    setTratorEmEdicao(trator);
    setNome(trator.nome);
    setFazenda(trator.fazenda);
    setAtividade(trator.atividade);
    setPiloto(trator.piloto);
    setLatitude(trator.latitude);
    setLongitude(trator.longitude);
    setMidias(trator.midias || []);
    setTempoAtividade(trator.tempoAtividade);
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
        })) as Trator[];
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
    <div className="container mx-auto px-4 py-20">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Painel Administrativo</CardTitle>
        </CardHeader>
        <CardContent>
          <div id="admin-map" className="w-full h-[400px] mb-8 rounded-lg overflow-hidden" />
          
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

export default Admin;
