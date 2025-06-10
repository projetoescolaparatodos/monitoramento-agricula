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
                      className="text-lg md:text-2xl text-white/90 font-medium tracking-wide mb-6 md:mb-8 max-w-xl text-justify border-l-4 border-white/40 pl-6 py-4"
                      dangerouslySetInnerHTML={{
                        __html: content?.content || `Conheça as principais ações e iniciativas da Secretaria Municipal de Agricultura, Pesca e Abastecimento.<br><br>Fique por dentro dos projetos que estão transformando o setor agropecuário e pesqueiro do nosso município.`
                      }}
                    />
                  </>
                )}
              </div>
              <div className="mt-auto mb-6 md:mb-10">
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Link href="#areas">
                    <button 
                      className="group bg-white text-green-700 font-semibold px-8 py-4 rounded-lg hover:bg-green-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[180px] justify-center w-full sm:w-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        const areasSection = document.getElementById('areas');
                        if (areasSection) {
                          areasSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2v8h10V6H5z" clipRule="evenodd" />
                        <path d="M6 8h8v2H6V8zm0 3h8v1H6v-1z" />
                      </svg>
                      Explorar áreas
                    </button>
                  </Link>
                  <Link href="#estatisticas">
                    <button 
                      className="group bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/30 hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-3 min-w-[180px] justify-center border border-white/20 w-full sm:w-auto"
                      onClick={(e) => {
                        e.preventDefault();
                        const statsSection = document.getElementById('estatisticas');
                        if (statsSection) {
                          statsSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
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