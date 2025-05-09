
import { Button } from "@/components/ui/button";
import { ClipboardList } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="hero" className="py-12 text-center">
      <h1 className="text-4xl font-bold mb-4 text-white">Serviço de Inspeção Municipal</h1>
      <p className="text-lg text-white/90 mb-8">
        Sistema de inspeção e controle de qualidade dos produtos de origem animal
      </p>
      <Button
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
      >
        <ClipboardList className="h-4 w-4" />
        Solicitar Inspeção
      </Button>
    </section>
  );
};

export default HeroSection;
