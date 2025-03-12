import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tractor, BarChart2, Map } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex items-center relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449')] bg-cover bg-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/40" />
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Sistema de Monitoramento Agrícola
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8">
              Gerencie suas atividades agrícolas em tempo real e tome decisões baseadas em dados precisos.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/agricultura">
                <Button size="lg" className="w-full flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Agricultura
                </Button>
              </Link>
              <Link href="/pesca">
                <Button size="lg" className="w-full flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Pesca
                </Button>
              </Link>
              <Link href="/paa">
                <Button size="lg" className="w-full flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  PAA
                </Button>
              </Link>
              <Link href="/report">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <BarChart2 className="h-5 w-5" />
                  Relatórios
                </Button>
              </Link>
              <Link href="/admin">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full flex items-center gap-2 bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Tractor className="h-5 w-5" />
                  Administração
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">Recursos do Sistema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <Map className="h-8 w-8 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Monitoramento em Tempo Real</h3>
              <p className="text-sm md:text-base text-gray-600">
                Acompanhe todas as atividades agrícolas em andamento através do mapa interativo.
              </p>
            </div>
            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <BarChart2 className="h-8 w-8 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Relatórios Detalhados</h3>
              <p className="text-sm md:text-base text-gray-600">
                Gere relatórios completos com métricas importantes.
              </p>
            </div>
            <div className="p-4 md:p-6 rounded-lg border bg-white shadow-sm">
              <Tractor className="h-8 w-8 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">Gestão de Atividades</h3>
              <p className="text-sm md:text-base text-gray-600">
                fique por dentro das atividades desenvovidas pela SEMAPA - VTX.
              </p>
            </div>
          </div>
        </div>
      </section>

      
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            <div className="mb-6 sm:mb-0">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">SEMAPA</h3>
              <p className="text-sm md:text-base text-gray-400">
                Sistema de Monitoramento Agrícola da SEMAPA - Secretaria Municipal de Agricultura, Pecuária e Abastecimento.
              </p>
            </div>
            <div className="mb-6 sm:mb-0">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Links Úteis</h3>
              <ul className="space-y-1 md:space-y-2">
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white">Sobre Nós</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="text-sm md:text-base text-gray-400 hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Contato</h3>
              <p className="text-sm md:text-base text-gray-400">
                Endereço: Av. Principal, 123<br />
                Telefone: (11) 1234-5678<br />
                Email: contato@semapa.gov.br
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-800 text-center text-xs md:text-sm text-gray-500">
            <p>© 2024 SEMAPA - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;