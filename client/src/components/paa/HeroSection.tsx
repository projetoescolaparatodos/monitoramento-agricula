
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const HeroSection = () => {
  const [, setLocation] = useLocation();

  return (
    <section className="py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Programa de Aquisição de Alimentos</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Informações e dados sobre o PAA em Vitória do Xingu
      </p>
      <Button
        onClick={() => setLocation("/paa/map")}
        className="flex items-center gap-2"
      >
        <Map className="h-4 w-4" />
        Acompanhar Programa
      </Button>
    </section>
  );
};

export default HeroSection;
