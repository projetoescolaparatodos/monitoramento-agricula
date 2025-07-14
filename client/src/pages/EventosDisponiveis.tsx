
import React, { useState, useEffect } from 'react';
import { db } from '@/utils/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ExternalLink, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Evento {
  id: string;
  nome: string;
  dataInicio?: any;
  dataFim?: any;
  ativo?: boolean;
}

const EventosDisponiveis: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const eventosSnapshot = await getDocs(collection(db, 'eventos'));
        const eventosData = eventosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Evento[];
        
        // Filtrar apenas eventos ativos e ordenar por data de criação
        const eventosAtivos = eventosData
          .filter(evento => evento.ativo)
          .sort((a, b) => {
            if (a.criadoEm && b.criadoEm) {
              return b.criadoEm.toDate() - a.criadoEm.toDate();
            }
            return 0;
          });
        
        setEventos(eventosAtivos);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao buscar eventos:', error);
        setLoading(false);
      }
    };

    fetchEventos();
  }, []);

  const copyToClipboard = (eventoId: string) => {
    const url = `/evento-telao?evento=${eventoId}`;
    navigator.clipboard.writeText(window.location.origin + url);
    alert('URL copiada para a área de transferência!');
  };

  const openTelao = (eventoId: string) => {
    const url = `/evento-telao?evento=${eventoId}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-900 to-green-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-green-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Eventos Disponíveis</h1>
          <p className="text-xl text-gray-600">Selecione um evento para acessar o telão</p>
        </div>

        {eventos.length === 0 ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhum evento encontrado</h2>
            <p className="text-gray-600">Não há eventos cadastrados no sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-6 h-6 text-green-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                        {evento.nome}
                      </h3>
                    </div>
                    {evento.ativo && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm text-gray-600">
                      <strong>ID:</strong> <span className="font-mono">{evento.id}</span>
                    </p>
                    {evento.dataInicio && (
                      <p className="text-sm text-gray-600">
                        <strong>Início:</strong> {evento.dataInicio.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não definida'}
                      </p>
                    )}
                    {evento.dataFim && (
                      <p className="text-sm text-gray-600">
                        <strong>Fim:</strong> {evento.dataFim.toDate?.()?.toLocaleDateString('pt-BR') || 'Data não definida'}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => openTelao(evento.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Telão
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(evento.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventosDisponiveis;
