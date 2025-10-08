import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Sprout } from 'lucide-react';
import ConsumoFrotaConsolidado from './ConsumoFrotaConsolidado';
import GestaoViveiroMudas from './GestaoViveiroMudas';

const MetadadosViveiros = () => {
  const [activeTab, setActiveTab] = useState('frota');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="frota" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Consumo de Frota
        </TabsTrigger>
        <TabsTrigger value="viveiro" className="flex items-center gap-2">
          <Sprout className="h-4 w-4" />
          Viveiro de Mudas
        </TabsTrigger>
      </TabsList>

      <TabsContent value="frota">
        <ConsumoFrotaConsolidado />
      </TabsContent>

      <TabsContent value="viveiro">
        <GestaoViveiroMudas />
      </TabsContent>
    </Tabs>
  );
};

export default MetadadosViveiros;