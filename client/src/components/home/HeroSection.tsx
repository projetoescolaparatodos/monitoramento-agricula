
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
      <div className="bg-green-700 rounded-lg overflow-hidden shadow-lg min-h-[500px] md:h-[800px]">
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full md:w-1/2 p-4 md:p-12 flex flex-col justify-between relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-25">
              <img
                src="/logo.png"
                alt="SEMAPA Logo"
                className="w-[80%] md:w-[95%] h-[80%] md:h-[95%] object-contain"
              />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="pt-8 md:pt-12">
                {isLoading ? (
                  <div>Carregando...</div>
                ) : (
                  <>
                    <h1 
                      className="text-3xl md:text-5xl font-extrabold text-white mb-4 md:mb-6 leading-tight font-heading tracking-tight text-center"
                      dangerouslySetInnerHTML={{ 
                        __html: content?.title || "Secretaria Municipal de Agricultura, Pesca e Abastecimento" 
                      }}
                    />
                    <div 
                      className="text-lg md:text-2xl text-white/90 font-medium tracking-wide mb-6 md:mb-8 max-w-xl text-justify border-l-4 border-white/40 pl-4 py-2"
                      dangerouslySetInnerHTML={{ 
                        __html: content?.content || "Dados Sobre a produção em Vitória do Xingu" 
                      }}
                    />
                  </>
                )}
              </div>
              <div className="mt-auto mb-6 md:mb-10">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="#areas">
                    <button 
                      className="bg-white text-green-700 font-semibold px-6 py-3 rounded-md hover:bg-neutral-100 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const areasSection = document.getElementById('areas');
                        if (areasSection) {
                          areasSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Explorar áreas
                    </button>
                  </Link>
                  <Link href="#estatisticas">
                    <button 
                      className="bg-white/20 text-white font-semibold px-6 py-3 rounded-md hover:bg-white/30 transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        const statsSection = document.getElementById('estatisticas');
                        if (statsSection) {
                          statsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      Ver estatísticas
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute inset-0" style={{ left: '-5%', right: '-5%' }}>
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
