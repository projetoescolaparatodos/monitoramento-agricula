import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter'; // Added useNavigate


const PAAInfo = () => {
  const [, setLocation] = useLocation(); // Added navigate hook
  return (
    <div className="container mx-auto p-4 pt-16">
      <h1 className="text-3xl font-bold mb-6">Programa de Aquisição de Alimentos (PAA)</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sobre o PAA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">
            O Programa de Aquisição de Alimentos (PAA) é uma política pública que fortalece a agricultura familiar
            e promove o acesso à alimentação para pessoas em situação de insegurança alimentar.
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Dados do Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>Agricultores participantes: Em atualização</li>
              <li>Produção anual: Em atualização</li>
              <li>Famílias beneficiadas: Em atualização</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Impacto Social</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              O PAA tem um papel fundamental no desenvolvimento local, gerando renda para agricultores
              familiares e garantindo alimentação de qualidade para instituições sociais.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8 flex justify-center">
        <Button onClick={() => setLocation('/paa/mapa')} className="px-8 py-6 text-lg"> {/* Changed to useNavigate */}
          Acompanhar Serviços
        </Button>
      </div>
    </div>
  );
};

export default PAAInfo;