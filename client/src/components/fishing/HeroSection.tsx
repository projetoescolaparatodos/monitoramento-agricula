
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const HeroSection = () => {
  const [, setLocation] = useLocation();

  return (
    <section id="hero" className="py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Pesca em Vitória do Xingu</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Informações e dados sobre a atividade pesqueira no município
      </p>
      <Button
        onClick={() => setLocation("/fishing/map")}
        className="flex items-center gap-2"
      >
        <Map className="h-4 w-4" />
        Acompanhar Atividades
      </Button>
    </section>
  );
};

export default HeroSection;
