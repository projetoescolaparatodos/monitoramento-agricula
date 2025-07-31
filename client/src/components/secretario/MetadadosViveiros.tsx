
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const MetadadosViveiros = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este componente exibirá metadados e informações sobre viveiros em construção.
          <br />
          <strong>Origem dos dados:</strong> Firebase (coleção: viveiros_construcao)
        </AlertDescription>
      </Alert>
      
      <div className="text-center py-8">
        <p className="text-gray-500">
          Componente em desenvolvimento - ETAPA 2
        </p>
      </div>
    </div>
  );
};

export default MetadadosViveiros;
