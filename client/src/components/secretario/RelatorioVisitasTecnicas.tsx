
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const RelatorioVisitasTecnicas = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este componente exibirá relatórios das visitas técnicas realizadas no setor de Pesca.
          <br />
          <strong>Origem dos dados:</strong> Firebase (coleção: visitas_tecnicas)
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

export default RelatorioVisitasTecnicas;
