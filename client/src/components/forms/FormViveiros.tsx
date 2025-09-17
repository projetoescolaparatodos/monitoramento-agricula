import React, { useState, useEffect } from "react";
import { db } from "../../utils/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);
  const { toast } = useToast();

  // Estados do formulário
  const [formData, setFormData] = useState({
    nomePropriedade: '',
    nomeProprietario: '',
    cpf: '',
    telefone: '',
    especieCultivada: '',
    areaTotalViveiro: '',
    profundidadeMedia: '',
    dataInicio: '',
    previsaoTermino: '',
    tecnicoResponsavel: '',
    observacoes: '',
    statusObra: 'planejamento',
    veiculoId: '',
    tempoEstimadoHoras: 0
  });
  const [midias, setMidias] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solicitar localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Erro ao obter localização:', error);
        }
      );
    }

    // Carregar veículos disponíveis
    const fetchVeiculos = async () => {
      try {
        const veiculosRef = collection(db, 'veiculos');
        const q = query(veiculosRef, where('status', '==', 'funcionando'));
        const snapshot = await getDocs(q);

        const veiculosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setVeiculos(veiculosData);
      } catch (error) {
        console.error('Erro ao carregar veículos:', error);
        toast({
          title: "Aviso",
          description: "Não foi possível carregar a lista de veículos.",
          variant: "destructive"
        });
      } finally {
        setLoadingVeiculos(false);
      }
    };

    fetchVeiculos();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Criar strings de data/hora completas
      const dataInicioCompleta = formData.dataInicio ? `${formData.dataInicio}` : formData.dataInicio;
      const dataTerminoCompleta = formData.previsaoTermino ? `${formData.previsaoTermino}` : formData.previsaoTermino;

      const viveiroData = {
        ...formData,
        dataInicio: dataInicioCompleta,
        dataTermino: dataTerminoCompleta,
        latitude: userLocation?.latitude || latitude,
        longitude: userLocation?.longitude || longitude,
        midias,
        timestamp: serverTimestamp(),
        userId: userAuth?.uid || "anonimo",
        tipo: "viveiro_construcao",
        status: "em_andamento"
      };

      await addDoc(collection(db, "viveiros_em_construcao"), viveiroData);

      toast({
        title: "Sucesso",
        description: "Viveiro em construção cadastrado com sucesso!",
      });

      // Limpar formulário
      setFormData({
        nomePropriedade: '',
        nomeProprietario: '',
        cpf: '',
        telefone: '',
        especieCultivada: '',
        areaTotalViveiro: '',
        profundidadeMedia: '',
        dataInicio: '',
        previsaoTermino: '',
        tecnicoResponsavel: '',
        observacoes: '',
        statusObra: 'planejamento',
        veiculoId: '',
        tempoEstimadoHoras: 0
      });
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
                <Input
                  id="dataInicio"
                  name="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previsaoTermino" className="text-white">Previsão de Término</Label>
                <Input
                  id="previsaoTermino"
                  name="previsaoTermino"
                  type="date"
                  value={formData.previsaoTermino}
                  onChange={handleInputChange}
                  required
                  className="text-black bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="areaTotalViveiro" className="text-white">Área Total do Viveiro (m²)</Label>
                <Input
                  id="areaTotalViveiro"
                  name="areaTotalViveiro"
                  type="number"
                  step="0.01"
                  value={formData.areaTotalViveiro}
                  onChange={handleInputChange}
                  placeholder="Ex: 1000"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profundidadeMedia" className="text-white">Profundidade Média (m)</Label>
                <Input
                  id="profundidadeMedia"
                  name="profundidadeMedia"
                  type="number"
                  step="0.1"
                  value={formData.profundidadeMedia}
                  onChange={handleInputChange}
                  placeholder="Ex: 1.5"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomePropriedade" className="text-white">Nome da Propriedade</Label>
                <Input
                  id="nomePropriedade"
                  name="nomePropriedade"
                  value={formData.nomePropriedade}
                  onChange={handleInputChange}
                  placeholder="Ex: Fazenda São José"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="nomeProprietario" className="text-white">Nome do Proprietário</Label>
                <Input
                  id="nomeProprietario"
                  name="nomeProprietario"
                  value={formData.nomeProprietario}
                  onChange={handleInputChange}
                  placeholder="Ex: João da Silva"
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-white">CPF do Proprietário</Label>
                <Input
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="Ex: 123.456.789-00"
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-white">Telefone</Label>
                <Input
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  placeholder="Ex: (99) 99999-9999"
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="especieCultivada" className="text-white">Espécie Cultivada</Label>
                <Input
                  id="especieCultivada"
                  name="especieCultivada"
                  value={formData.especieCultivada}
                  onChange={handleInputChange}
                  placeholder="Ex: Tilápia, Tambaqui"
                  required
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tecnicoResponsavel" className="text-white">Técnico Responsável</Label>
                <Input
                  id="tecnicoResponsavel"
                  name="tecnicoResponsavel"
                  value={formData.tecnicoResponsavel}
                  onChange={handleInputChange}
                  placeholder="Ex: Engenheiro Agrônomo Silva"
                  className="text-black bg-white placeholder:text-gray-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="statusObra" className="text-white">Status da Obra</Label>
                <Select name="statusObra" value={formData.statusObra} onValueChange={(value) => setFormData(prev => ({...prev, statusObra: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="veiculoId">Veículo/Equipamento Utilizado</Label>
                <Select value={formData.veiculoId} onValueChange={(value) => setFormData(prev => ({...prev, veiculoId: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingVeiculos ? "Carregando veículos..." : "Selecione o veículo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {veiculos.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.modelo} - {veiculo.tipo} ({veiculo.consumoMedio} km/L)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoEstimadoHoras">Tempo Estimado de Trabalho (horas)</Label>
                <Input
                  id="tempoEstimadoHoras"
                  name="tempoEstimadoHoras"
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.tempoEstimadoHoras}
                  onChange={handleInputChange}
                  placeholder="Ex: 8 horas"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
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
                disabled={loading || !formData.veiculoId}
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