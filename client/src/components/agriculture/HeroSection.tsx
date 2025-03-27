import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";
import { useLocation } from "wouter";

const HeroSection = () => {
  const [, setLocation] = useLocation();

  return (
    <section className="py-12 text-center">
      <h1 className="text-4xl font-bold mb-4">Agricultura em Vitória do Xingu</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Informações e dados sobre a produção agrícola no município
      </p>
    </section>
  );
};

export default HeroSection;