
import React, { useState } from 'react';
import { db } from '../../utils/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  onSuccess
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Estados do formulário
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataTermino, setDataTermino] = useState('');
  const [tamanhoViveiro, setTamanhoViveiro] = useState('');
  const [localidade, setLocalidade] = useState('');
  const [nomePropriedade, setNomePropriedade] = useState('');
  const [especieCultivada, setEspecieCultivada] = useState('');

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
      const viveiroData = {
        dataInicio,
        dataTermino,
        tamanhoViveiro: parseFloat(tamanhoViveiro),
        localidade,
        nomePropriedade,
        especieCultivada,
        latitude,
        longitude,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'viveiros_em_construcao'), viveiroData);
      
      toast({
        title: "Sucesso",
        description: "Viveiro em construção cadastrado com sucesso!",
      });

      // Limpar formulário
      setDataInicio(new Date().toISOString().split('T')[0]);
      setDataTermino('');
      setTamanhoViveiro('');
      setLocalidade('');
      setNomePropriedade('');
      setEspecieCultivada('');
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cadastrar Viveiro em Construção</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataTermino">Data de Término</Label>
              <Input
                id="dataTermino"
                type="date"
                value={dataTermino}
                onChange={(e) => setDataTermino(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tamanhoViveiro">Tamanho do Viveiro (m²)</Label>
            <Input
              id="tamanhoViveiro"
              type="number"
              step="0.01"
              value={tamanhoViveiro}
              onChange={(e) => setTamanhoViveiro(e.target.value)}
              placeholder="Ex: 500.50"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="localidade">Localidade</Label>
            <Input
              id="localidade"
              value={localidade}
              onChange={(e) => setLocalidade(e.target.value)}
              placeholder="Ex: Zona Rural"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomePropriedade">Nome da Propriedade</Label>
            <Input
              id="nomePropriedade"
              value={nomePropriedade}
              onChange={(e) => setNomePropriedade(e.target.value)}
              placeholder="Ex: Fazenda São João"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="especieCultivada">Espécie Cultivada</Label>
            <Input
              id="especieCultivada"
              value={especieCultivada}
              onChange={(e) => setEspecieCultivada(e.target.value)}
              placeholder="Ex: Tilápia, Tambaqui"
              required
            />
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

export default FormViveiros;
