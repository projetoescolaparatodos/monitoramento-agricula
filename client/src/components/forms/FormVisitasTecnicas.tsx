import React, { useState, useEffect } from 'react';
import { db } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EnhancedUpload from '@/components/EnhancedUpload';
import { useAuthProtection } from '@/hooks/useAuthProtection';

interface FormVisitasTecnicasProps {
  latitude: number | null;
  longitude: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormVisitasTecnicas: React.FC<FormVisitasTecnicasProps> = ({
  latitude,
  longitude,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const { userAuth } = useAuthProtection();
  const [loading, setLoading] = useState(false);
  const [veiculos, setVeiculos] = useState<any[]>([]);
  const [loadingVeiculos, setLoadingVeiculos] = useState(true);

  // Estados do formulário
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFim, setHoraFim] = useState('');
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState('');
  const [descricao, setDescricao] = useState('');
  const [midias, setMidias] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nomeProdutor: '',
    cpf: '',
    telefone: '',
    endereco: '',
    tipoAtividade: '',
    finalidadeVisita: '',
    dataVisita: '',
    tecnicoResponsavel: '',
    observacoes: '',
    recomendacoes: '',
    proximaVisita: '',
    veiculoId: '',
    distanciaEstimadaKm: 0
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      toast({
        title: "Erro",
        description: "Selecione uma localização no mapa.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const visitaData = {
        dataVisita: formData.dataVisita || dataVisita,
        horaInicio,
        horaFim,
        nomeEquipe,
        tecnicoResponsavel: formData.tecnicoResponsavel || tecnicoResponsavel,
        descricao,
        latitude,
        longitude,
        midias,
        timestamp: serverTimestamp(),
        userId: userAuth?.user?.uid || 'anonymous',
        veiculoId: formData.veiculoId,
        distanciaEstimadaKm: formData.distanciaEstimadaKm,
      };

      await addDoc(collection(db, 'visitas_tecnicas'), visitaData);

      toast({
        title: "Sucesso",
        description: "Visita técnica cadastrada com sucesso!",
      });

      // Limpar formulário
      setDataVisita(new Date().toISOString().split('T')[0]);
      setHoraInicio('');
      setHoraFim('');
      setNomeEquipe('');
      setTecnicoResponsavel('');
      setDescricao('');
      setMidias([]);
      setFormData({
        nomeProdutor: '',
        cpf: '',
        telefone: '',
        endereco: '',
        tipoAtividade: '',
        finalidadeVisita: '',
        dataVisita: '',
        tecnicoResponsavel: '',
        observacoes: '',
        recomendacoes: '',
        proximaVisita: '',
        veiculoId: '',
        distanciaEstimadaKm: 0
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar visita técnica:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a visita técnica.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = (url: string) => {
    setMidias([...midias, url]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cadastrar Visita Técnica</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataVisita" className="text-white">Data da Visita</Label>
            <Input
              id="dataVisita"
              type="date"
              value={dataVisita}
              onChange={(e) => setDataVisita(e.target.value)}
              required
              className="text-black bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio" className="text-white">Hora de Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
                className="text-black bg-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFim" className="text-white">Hora de Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={horaFim}
                onChange={(e) => setHoraFim(e.target.value)}
                required
                className="text-black bg-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeEquipe" className="text-white">Nome da Equipe</Label>
            <Input
              id="nomeEquipe"
              value={nomeEquipe}
              onChange={(e) => setNomeEquipe(e.target.value)}
              placeholder="Ex: Equipe Técnica Regional"
              required
              className="text-black bg-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tecnicoResponsavel" className="text-white">Técnico Responsável</Label>
            <Input
              id="tecnicoResponsavel"
              value={formData.tecnicoResponsavel || tecnicoResponsavel}
              onChange={handleInputChange}
              placeholder="Nome do técnico"
              required
              className="text-black bg-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição da Visita</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o propósito e observações da visita técnica..."
              rows={4}
              required
              className="text-black bg-white placeholder:text-gray-500"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Fotos/Vídeos da Visita</Label>
            <div className="bg-gray-100 rounded-lg p-4">
              <EnhancedUpload onUpload={handleUpload} />
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {midias.map((url, index) => (
                <div key={index} className="relative group">
                  {url.includes("/video/") || url.includes("/video/upload/") ||
                    url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".mov") ? (
                    <video
                      src={url}
                      controls
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <img
                      src={url}
                      alt={`Mídia ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 text-white hover:bg-red-700 w-6 h-6 p-0"
                    onClick={() => setMidias(midias.filter((_, i) => i !== index))}
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {latitude && longitude && (
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              <strong>Coordenadas:</strong> {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </div>
          )}

          {/* Seção de Veículo e Distância */}
          <div className="space-y-2">
            <Label htmlFor="veiculoId">Veículo Utilizado</Label>
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
            <Label htmlFor="distanciaEstimadaKm">Distância Estimada (km)</Label>
            <Input
              id="distanciaEstimadaKm"
              name="distanciaEstimadaKm"
              type="number"
              min="0"
              step="0.1"
              value={formData.distanciaEstimadaKm}
              onChange={handleInputChange}
              placeholder="Ex: 25.5"
            />
          </div>
          {/* Fim da Seção de Veículo e Distância */}

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 text-white hover:bg-green-700">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Cadastrar
                </span>
              )}
            </Button>

            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FormVisitasTecnicas;