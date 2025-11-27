import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  where,
  getDocs 
} from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Sprout, 
  Package, 
  Clock, 
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface Muda {
  id: string;
  especieMuda: string;
  quantidadePlantada: number;
  quantidadePronta: number;
  quantidadeEmProcesso: number;
  dataPlantio: string;
  previsaoDoacao: string;
  status: 'em_processo' | 'pronta' | 'doada';
  insumoId?: string;
  timestamp: any;
}

const GestaoViveiroMudas: React.FC = () => {
  const [mudas, setMudas] = useState<Muda[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Sincronizar estoque de mudas prontas com doações
  const sincronizarEstoque = async (mudaId: string, insumoId: string) => {
    try {
      // Buscar total doado deste insumo
      const doacoesRef = collection(db, 'doacoes_evento');
      const qDoacoes = query(doacoesRef, where('insumoId', '==', insumoId));
      const doacoesSnapshot = await getDocs(qDoacoes);

      const totalDoado = doacoesSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().quantidade || 0);
      }, 0);

      // Buscar dados da muda
      const mudasRef = collection(db, 'viveiro_mudas');
      const qMudas = query(mudasRef, where('insumoId', '==', insumoId));
      const mudasSnapshot = await getDocs(qMudas);

      if (!mudas.empty) {
        const mudaDoc = mudasSnapshot.docs[0];
        const mudaData = mudaDoc.data();
        const quantidadeAtualPronta = mudaData.quantidadePronta || 0;
        const quantidadeTotalProduzida = mudaData.quantidadePlantada || 0;

        // Calcular estoque disponível
        const estoqueDisponivel = Math.max(0, quantidadeAtualPronta - totalDoado);

        // Atualizar apenas se houver mudança
        if (estoqueDisponivel !== quantidadeAtualPronta) {
          await updateDoc(doc(db, 'viveiro_mudas', mudaDoc.id), {
            quantidadePronta: estoqueDisponivel,
            quantidadeDoada: totalDoado,
            ultimaSincronizacao: new Date().toISOString()
          });

          console.log(`📊 Estoque sincronizado - ${mudaData.especieMuda}: ${estoqueDisponivel} mudas disponíveis (${totalDoado} doadas)`);
        }
      }
    } catch (error) {
      console.error('Erro ao sincronizar estoque:', error);
    }
  };

  useEffect(() => {
    const mudasQuery = query(
      collection(db, 'viveiro_mudas')
    );

    const unsubscribe = onSnapshot(mudasQuery, (snapshot) => {
      const mudasData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Muda[];

      setMudas(mudasData.sort((a, b) => a.especieMuda.localeCompare(b.especieMuda)));
      setLoading(false);

      // Sincronizar estoque de cada muda com insumoId
      mudasData.forEach(muda => {
        if (muda.insumoId) {
          sincronizarEstoque(muda.id, muda.insumoId);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  const marcarComoPronta = async (mudaId: string) => {
    try {
      const mudaRef = doc(db, 'viveiro_mudas', mudaId);
      const muda = mudas.find(m => m.id === mudaId);

      if (muda) {
        await updateDoc(mudaRef, {
          status: 'pronta',
          quantidadePronta: muda.quantidadeEmProcesso,
          quantidadeEmProcesso: 0
        });

        toast({
          title: "Sucesso",
          description: `${muda.especieMuda} marcada como pronta para doação!`
        });
      }
    } catch (error) {
      console.error('Erro ao marcar como pronta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const mudasEmProcesso = mudas.filter(m => m.status === 'em_processo');
  const mudasProntas = mudas.filter(m => m.status === 'pronta' && m.quantidadePronta > 0);
  const totalMudasProntas = mudasProntas.reduce((sum, m) => sum + m.quantidadePronta, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Em Processo</p>
                <p className="text-2xl font-bold">{mudasEmProcesso.length} espécies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Prontas para Doação</p>
                <p className="text-2xl font-bold">{totalMudasProntas.toLocaleString()} mudas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Espécies Disponíveis</p>
                <p className="text-2xl font-bold">{mudasProntas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mudas Prontas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-green-600" />
            Mudas Prontas para Doação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mudasProntas.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma muda pronta para doação.</p>
          ) : (
            <div className="space-y-4">
              {mudasProntas.map(muda => (
                <Card key={muda.id} className="border-l-4 border-l-green-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{muda.especieMuda}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Disponível</p>
                            <p className="font-bold text-green-600">{muda.quantidadePronta} mudas</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Plantadas</p>
                            <p className="font-medium">{muda.quantidadePlantada}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Data Plantio</p>
                            <p className="font-medium">{new Date(muda.dataPlantio).toLocaleDateString('pt-BR')}</p>
                          </div>
                          {muda.insumoId && (
                            <div>
                              <Badge variant="outline" className="bg-blue-50">
                                <Package className="h-3 w-3 mr-1" />
                                Insumo Vinculado
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mudas Em Processo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-yellow-600" />
            Mudas Em Desenvolvimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mudasEmProcesso.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Nenhuma muda em processo.</p>
          ) : (
            <div className="space-y-4">
              {mudasEmProcesso.map(muda => (
                <Card key={muda.id} className="border-l-4 border-l-yellow-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{muda.especieMuda}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <p className="text-gray-500">Em Processo</p>
                            <p className="font-bold text-yellow-600">{muda.quantidadeEmProcesso} mudas</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Plantadas</p>
                            <p className="font-medium">{muda.quantidadePlantada}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Previsão</p>
                            <p className="font-medium">{new Date(muda.previsaoDoacao).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div>
                            <Button
                              size="sm"
                              onClick={() => marcarComoPronta(muda.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Marcar como Pronta
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta de Sincronização */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O estoque de mudas é sincronizado automaticamente com as doações registradas nos eventos.
          Quando uma doação é feita usando mudas, a quantidade é descontada automaticamente do estoque disponível.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GestaoViveiroMudas;