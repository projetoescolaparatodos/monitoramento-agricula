import { useQuery } from "@tanstack/react-query";
import { ContentItem } from "@/types";
import { Link } from "wouter";

const HeroSection = () => {
  const { data: heroContent, isLoading } = useQuery<ContentItem[]>({
    queryKey: ['/api/contents?pageType=home&sectionType=hero'],
  });

  const content = heroContent && heroContent.length > 0 ? heroContent[0] : null;

  return (
    <section className="mb-16">
      <div className="bg-green-700 rounded-lg overflow-hidden shadow-lg h-[800px]">
        <div className="md:flex h-full">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              {content?.iconUrl && (
                <img
                  src={content.iconUrl}
                  alt="Ícone"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="relative z-10 text-center md:text-left md:pr-8">
              {isLoading ? (
                <div>Carregando...</div>
              ) : (
                <>
                  <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight font-heading tracking-tight">
                    {content?.title || "Secretaria Municipal de Agricultura, Pesca e Abastecimento"}
                  </h1>
                  <p className="text-xl text-white/90 mb-8 leading-relaxed font-body max-w-xl">
                    {content?.content || "Promovendo o desenvolvimento sustentável do setor primário em Vitória do Xingu"}
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <Link href="#areas">
                      <a className="bg-white text-secondary font-semibold px-6 py-3 rounded-md hover:bg-neutral-light transition-colors">
                        Explorar áreas
                      </a>
                    </Link>
                    <Link href="#estatisticas">
                      <a className="bg-white/20 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/30 transition-colors">
                        Ver estatísticas
                      </a>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0 flex items-center" style={{ left: '-10%', right: '-5%' }}>
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80" 
                alt="Campos agrícolas brasileiros" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;