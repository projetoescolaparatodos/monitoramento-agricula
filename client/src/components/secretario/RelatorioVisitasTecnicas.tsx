
import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/utils/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  MapPin,
  Download,
  Calendar,
  User,
  FileText,
  Image,
  Video,
  Clock,
  ExternalLink,
  Package,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface VisitaTecnica {
  id: string;
  dataVisita: string;
  horaInicio: string;
  horaFim: string;
  nomeEquipe: string;
  tecnicoResponsavel: string;
  descricao: string;
  latitude: number;
  longitude: number;
  midias: string[];
  timestamp: any;
  userId: string;
}

const RelatorioVisitasTecnicas = () => {
  const [visitas, setVisitas] = useState<VisitaTecnica[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchVisitas = async () => {
      try {
        const visitasRef = collection(db, 'visitas_tecnicas');
        const q = query(visitasRef, orderBy('timestamp', 'desc'));
        const snapshot = await getDocs(q);
        
        const visitasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as VisitaTecnica[];
        
        setVisitas(visitasData);
      } catch (error) {
        console.error('Erro ao buscar visitas técnicas:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as visitas técnicas.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVisitas();
  }, [toast]);

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      // Criar dados para download
      const csvData = visitas.map(visita => ({
        'Data': format(new Date(visita.dataVisita), 'dd/MM/yyyy', { locale: ptBR }),
        'Hora Início': visita.horaInicio,
        'Hora Fim': visita.horaFim,
        'Equipe': visita.nomeEquipe,
        'Técnico Responsável': visita.tecnicoResponsavel,
        'Descrição': visita.descricao,
        'Latitude': visita.latitude,
        'Longitude': visita.longitude,
        'Quantidade de Mídias': visita.midias?.length || 0
      }));

      // Converter para CSV
      const headers = Object.keys(csvData[0]).join(',');
      const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
      const csvContent = `${headers}\n${rows}`;

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_visitas_tecnicas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Relatório baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao baixar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const openInMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
  };

  const renderMidiaPreview = (midias: string[]) => {
    if (!midias || midias.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Mídias ({midias.length})
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {midias.slice(0, 4).map((midia, index) => (
            <div key={index} className="relative">
              {midia.includes('video') || midia.includes('.mp4') ? (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-gray-500" />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
          ))}
          {midias.length > 4 && (
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center text-sm text-gray-600">
              +{midias.length - 4}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando visitas técnicas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com estatísticas e ações */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Relatório de Visitas Técnicas - Pesca</h2>
            <div className="flex flex-wrap gap-4 text-blue-100">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="text-sm">{visitas.length} visitas registradas</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Última atualização: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDownloadAll}
            disabled={downloading || visitas.length === 0}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Baixar Relatório
          </Button>
        </div>
      </div>

      {/* Lista de visitas */}
      {visitas.length === 0 ? (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Nenhuma visita técnica encontrada. As visitas cadastradas aparecerão aqui.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-6">
          {visitas.map((visita) => (
            <Card key={visita.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <CardTitle className="text-lg text-blue-900 flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {visita.tecnicoResponsavel}
                    </CardTitle>
                    <p className="text-blue-700 font-medium">{visita.nomeEquipe}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge variant="outline" className="text-blue-700 border-blue-300">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(visita.dataVisita), 'dd/MM/yyyy', { locale: ptBR })}
                    </Badge>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      <Clock className="h-3 w-3 mr-1" />
                      {visita.horaInicio} - {visita.horaFim}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Descrição */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Descrição da Visita
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg">
                      {visita.descricao}
                    </p>
                  </div>

                  {/* Localização */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span className="text-sm">
                        Coordenadas: {visita.latitude?.toFixed(6)}, {visita.longitude?.toFixed(6)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openInMaps(visita.latitude, visita.longitude)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Abrir no Maps
                    </Button>
                  </div>

                  {/* Mídias */}
                  {renderMidiaPreview(visita.midias)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatorioVisitasTecnicas;
