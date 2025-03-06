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
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <Map className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Monitoramento em Tempo Real</h3>
              <p className="text-gray-600">
                Acompanhe todas as atividades agrícolas em andamento através do mapa interativo.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <BarChart2 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Relatórios Detalhados</h3>
              <p className="text-gray-600">
                Gere relatórios completos com métricas importantes.
              </p>
            </div>
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <Tractor className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestão de Atividades</h3>
              <p className="text-gray-600">
                fique por dentro das atividades desenvovidas pela SEMAPA - VTX.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;