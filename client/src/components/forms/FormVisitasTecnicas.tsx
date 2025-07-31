import React, { useState } from 'react';
import { db } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

  // Estados do formulário
  const [dataVisita, setDataVisita] = useState(new Date().toISOString().split('T')[0]);
  const [nomeEquipe, setNomeEquipe] = useState('');
  const [tecnicoResponsavel, setTecnicoResponsavel] = useState('');
  const [descricao, setDescricao] = useState('');
  const [midias, setMidias] = useState<string[]>([]);

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
      // Verificar se o usuário está autenticado
      if (!userAuth || !userAuth.user?.uid) {
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não autenticado. Faça login novamente.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const visitaData = {
        dataVisita,
        nomeEquipe,
        tecnicoResponsavel,
        descricao,
        latitude,
        longitude,
        midias,
        timestamp: serverTimestamp(),
        userId: userAuth.user?.uid,
      };

      await addDoc(collection(db, 'visitas_tecnicas'), visitaData);

      toast({
        title: "Sucesso",
        description: "Visita técnica cadastrada com sucesso!",
      });

      // Limpar formulário
      setDataVisita(new Date().toISOString().split('T')[0]);
      setNomeEquipe('');
      setTecnicoResponsavel('');
      setDescricao('');
      setMidias([]);

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
            <Label htmlFor="dataVisita">Data da Visita</Label>
            <Input
              id="dataVisita"
              type="date"
              value={dataVisita}
              onChange={(e) => setDataVisita(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeEquipe">Nome da Equipe</Label>
            <Input
              id="nomeEquipe"
              value={nomeEquipe}
              onChange={(e) => setNomeEquipe(e.target.value)}
              placeholder="Ex: Equipe Técnica Regional"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tecnicoResponsavel">Técnico Responsável</Label>
            <Input
              id="tecnicoResponsavel"
              value={tecnicoResponsavel}
              onChange={(e) => setTecnicoResponsavel(e.target.value)}
              placeholder="Nome do técnico"
              required
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