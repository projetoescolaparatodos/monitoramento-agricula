
import React, { useState } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X } from "lucide-react";
import EnhancedUpload from "@/components/EnhancedUpload";
import { useAuthProtection } from "@/hooks/useAuthProtection";

interface FormViveirosProps {
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormViveiros: React.FC<FormViveirosProps> = ({
  latitude,
  longitude,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { userAuth } = useAuthProtection();
  const { toast } = useToast();
  
  // Estados do formulário
  const [dataInicio, setDataInicio] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [dataTermino, setDataTermino] = useState("");
  const [horaTermino, setHoraTermino] = useState("");
  const [tamanhoViveiro, setTamanhoViveiro] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [nomePropriedade, setNomePropriedade] = useState("");
  const [especieCultivada, setEspecieCultivada] = useState("");
  const [midias, setMidias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar strings de data/hora completas
      const dataInicioCompleta = dataInicio && horaInicio ? `${dataInicio} ${horaInicio}` : dataInicio;
      const dataTerminoCompleta = dataTermino && horaTermino ? `${dataTermino} ${horaTermino}` : dataTermino;

      const viveiroData = {
        dataInicio: dataInicioCompleta,
        dataTermino: dataTerminoCompleta,
        tamanhoViveiro,
        localidade,
        nomePropriedade,
        especieCultivada,
        latitude,
        longitude,
        midias,
        timestamp: serverTimestamp(),
        userId: userAuth?.uid || "anonimo",
        tipo: "viveiro_construcao"
      };

      await addDoc(collection(db, "viveiros_em_construcao"), viveiroData);
      
      toast({
        title: "Sucesso",
        description: "Viveiro em construção cadastrado com sucesso!",
      });

      // Limpar formulário
      setDataInicio("");
      setHoraInicio("");
      setDataTermino("");
      setHoraTermino("");
      setTamanhoViveiro("");
      setLocalidade("");
      setNomePropriedade("");
      setEspecieCultivada("");
      setMidias([]);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar viveiro:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o viveiro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setMidias([...midias, url]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-500">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-white">Cadastrar Viveiro em Construção</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="bg-red-600 text-white border-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {latitude && longitude && (
            <p className="text-sm text-white">
              <strong>Coordenadas:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio" className="text-white">Data de Início</Label>
                <div className="flex gap-2">
                  <Input
                    id="dataInicio"
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    required
                    className="text-black bg-white"
                  />
                  <Input
                    id="horaInicio"
                    type="time"
                    value={horaInicio}
                    onChange={(e) => setHoraInicio(e.target.value)}
                    className="text-black bg-white w-32"
                    placeholder="Hora"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataTermino" className="text-white">Data de Término</Label>
                <div className="flex gap-2">
                  <Input
                    id="dataTermino"
                    type="date"
                    value={dataTermino}
                    onChange={(e) => setDataTermino(e.target.value)}
                    required
                    className="text-black bg-white"
                  />
                  <Input
                    id="horaTermino"
                    type="time"
                    value={horaTermino}
                    onChange={(e) => setHoraTermino(e.target.value)}
                    className="text-black bg-white w-32"
                    placeholder="Hora"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tamanhoViveiro" className="text-white">Tamanho do Viveiro (m²)</Label>
                <Input
                  id="tamanhoViveiro"
                  type="number"
                  step="0.01"
                  value={tamanhoViveiro}
                  onChange={(e) => setTamanhoViveiro(e.target.value)}
                  placeholder="Ex: 1000"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="localidade" className="text-white">Localidade</Label>
                <Input
                  id="localidade"
                  value={localidade}
                  onChange={(e) => setLocalidade(e.target.value)}
                  placeholder="Ex: Vila Nova"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomePropriedade" className="text-white">Nome da Propriedade</Label>
                <Input
                  id="nomePropriedade"
                  value={nomePropriedade}
                  onChange={(e) => setNomePropriedade(e.target.value)}
                  placeholder="Ex: Fazenda São José"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="especieCultivada" className="text-white">Espécie Cultivada</Label>
                <Input
                  id="especieCultivada"
                  value={especieCultivada}
                  onChange={(e) => setEspecieCultivada(e.target.value)}
                  placeholder="Ex: Tilápia, Tambaqui"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
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
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-green-600 text-black hover:bg-green-700 hover:text-black"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Cadastrar Viveiro"
                )}
              </Button>

              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="bg-red-600 text-white border-red-600 hover:bg-red-700"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormViveiros;
