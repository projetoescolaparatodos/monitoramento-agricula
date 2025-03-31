import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ContentItem } from "@/types";

const HeroSection = () => {
  const { data: heroContent } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents?pageType=home&sectionType=hero'],
  });

  const content = heroContent && heroContent.length > 0 ? heroContent[0] : null;

  return (
    <section className="relative py-12 text-center">
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
        <img src="/logo.png" alt="SEMAPA" className="w-96 h-96 object-contain" />
      </div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-4 text-white">
          {content?.title || "Secretaria Municipal de Agricultura, Pesca e Abastecimento"}
        </h1>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          {content?.content || "Promovendo o desenvolvimento sustentável do setor primário em Vitória do Xingu"}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/agriculture">
            <Button size="lg">Agricultura</Button>
          </Link>
          <Link href="/fishing">
            <Button size="lg">Pesca</Button>
          </Link>
          <Link href="/paa">
            <Button size="lg">PAA</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;