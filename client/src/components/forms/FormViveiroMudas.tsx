
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/utils/firebase';

interface FormViveiroMudasProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FormViveiroMudas: React.FC<FormViveiroMudasProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    especieMuda: '',
    quantidadePlantada: 0,
    dataPlantio: new Date().toISOString().split('T')[0],
    previsaoDoacao: '',
    insumos: {
      sacolas: 0,
      calcario: 0,
      adubo: 0,
      valorSacola: 0,
      valorCalcario: 0,
      valorAdubo: 0,
    },
    quantidadePronta: 0,
    quantidadeEmProcesso: 0,
    status: 'em_processo' as 'em_processo' | 'pronta' | 'doada',
    observacoes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('insumos.')) {
      const insumoField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        insumos: {
          ...prev.insumos,
          [insumoField]: parseFloat(value) || 0
        }
      }));
    } else if (name === 'quantidadePlantada' || name === 'quantidadePronta' || name === 'quantidadeEmProcesso') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.especieMuda || formData.quantidadePlantada <= 0) {
        toast({
          title: "Erro",
          description: "Preencha todos os campos obrigatórios",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      await addDoc(collection(db, 'viveiro_mudas'), {
        ...formData,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Sucesso",
        description: "Produção de mudas cadastrada com sucesso!",
      });

      // Limpar formulário
      setFormData({
        especieMuda: '',
        quantidadePlantada: 0,
        dataPlantio: new Date().toISOString().split('T')[0],
        previsaoDoacao: '',
        insumos: {
          sacolas: 0,
          calcario: 0,
          adubo: 0,
          valorSacola: 0,
          valorCalcario: 0,
          valorAdubo: 0,
        },
        quantidadePronta: 0,
        quantidadeEmProcesso: 0,
        status: 'em_processo',
        observacoes: '',
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produção de mudas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a produção de mudas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Cadastrar Produção de Mudas</CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={onClose}
              className="bg-red-600 text-white border-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="especieMuda">Espécie da Muda *</Label>
                <Input
                  id="especieMuda"
                  name="especieMuda"
                  value={formData.especieMuda}
                  onChange={handleInputChange}
                  placeholder="Ex: Açaí, Cupuaçu, Cacau"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidadePlantada">Quantidade Plantada *</Label>
                <Input
                  id="quantidadePlantada"
                  name="quantidadePlantada"
                  type="number"
                  value={formData.quantidadePlantada}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPlantio">Data do Plantio *</Label>
                <Input
                  id="dataPlantio"
                  name="dataPlantio"
                  type="date"
                  value={formData.dataPlantio}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="previsaoDoacao">Previsão para Doação *</Label>
                <Input
                  id="previsaoDoacao"
                  name="previsaoDoacao"
                  type="date"
                  value={formData.previsaoDoacao}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="em_processo">Em Processo</SelectItem>
                    <SelectItem value="pronta">Pronta para Doação</SelectItem>
                    <SelectItem value="doada">Doada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Insumos Utilizados</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="insumos.sacolas">Quantidade de Sacolas</Label>
                  <Input
                    id="insumos.sacolas"
                    name="insumos.sacolas"
                    type="number"
                    step="0.01"
                    value={formData.insumos.sacolas}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insumos.valorSacola">Valor Unitário (R$)</Label>
                  <Input
                    id="insumos.valorSacola"
                    name="insumos.valorSacola"
                    type="number"
                    step="0.01"
                    value={formData.insumos.valorSacola}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insumos.calcario">Quantidade de Calcário (kg)</Label>
                  <Input
                    id="insumos.calcario"
                    name="insumos.calcario"
                    type="number"
                    step="0.01"
                    value={formData.insumos.calcario}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insumos.valorCalcario">Valor Unitário (R$/kg)</Label>
                  <Input
                    id="insumos.valorCalcario"
                    name="insumos.valorCalcario"
                    type="number"
                    step="0.01"
                    value={formData.insumos.valorCalcario}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insumos.adubo">Quantidade de Adubo (kg)</Label>
                  <Input
                    id="insumos.adubo"
                    name="insumos.adubo"
                    type="number"
                    step="0.01"
                    value={formData.insumos.adubo}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insumos.valorAdubo">Valor Unitário (R$/kg)</Label>
                  <Input
                    id="insumos.valorAdubo"
                    name="insumos.valorAdubo"
                    type="number"
                    step="0.01"
                    value={formData.insumos.valorAdubo}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold mb-4">Controle de Estoque</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantidadePronta">Quantidade Pronta</Label>
                  <Input
                    id="quantidadePronta"
                    name="quantidadePronta"
                    type="number"
                    value={formData.quantidadePronta}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidadeEmProcesso">Quantidade Em Processo</Label>
                  <Input
                    id="quantidadeEmProcesso"
                    name="quantidadeEmProcesso"
                    type="number"
                    value={formData.quantidadeEmProcesso}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Observações adicionais sobre a produção..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  "Cadastrar Produção"
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

export default FormViveiroMudas;
