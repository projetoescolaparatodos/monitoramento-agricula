
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const SolicitacoesCadastro = () => {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Este componente exibirá as solicitações de cadastro feitas por agricultores e pescadores.
          <br />
          <strong>Origem dos dados:</strong> Firebase (coleção: solicitacoes)
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

export default SolicitacoesCadastro;
