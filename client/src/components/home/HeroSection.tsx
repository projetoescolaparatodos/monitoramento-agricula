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
      <div className="bg-green-700 rounded-lg overflow-hidden shadow-lg"> {/* Changed background color to a darker green */}
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-5/6 mb-6"></div>
                <div className="flex gap-3">
                  <div className="h-10 bg-white/20 rounded w-32"></div>
                  <div className="h-10 bg-white/20 rounded w-32"></div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
                  {content?.title || "Informações e dados sobre produção agrícola brasileira"}
                </h2>
                <p className="text-white/90 mb-6">
                  {content?.content || "Acesse estatísticas atualizadas, análises e informações detalhadas sobre agricultura, pesca e o Programa de Aquisição de Alimentos (PAA)."}
                </p>
                <div className="flex flex-wrap gap-3">
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
          <div className="md:w-1/2 flex items-center">
            <div className="flex items-center gap-4">
              <img 
                src="/logo.png" 
                alt="SEMAPA" 
                className="h-24 w-auto"
              />
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=800&q=80" 
                alt="Campos agrícolas brasileiros" 
                className="w-[1000px] h-[800px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;