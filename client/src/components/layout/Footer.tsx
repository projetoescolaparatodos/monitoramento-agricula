
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 text-zinc-700 dark:text-zinc-300 mt-16 border-t border-green-200 dark:border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logos e Identificação */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start space-y-4">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/logo.png" 
                  alt="Logo SEMAPA" 
                  className="w-16 h-16 object-contain"
                />
                <img 
                  src="/logoprefeitura.webp" 
                  alt="Logo Prefeitura Municipal" 
                  className="w-16 h-16 object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-lg font-bold text-green-800 dark:text-green-400">SEMAPA</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Secretaria de Agricultura, Pesca e Abastecimento
                </p>
              </div>
            </div>
          </div>

          {/* Links Úteis */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-4">Áreas de Atuação</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/agriculture" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center justify-center md:justify-start gap-2">
                  🚜 Agricultura
                </Link>
              </li>
              <li>
                <Link href="/fishing" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center justify-center md:justify-start gap-2">
                  🎣 Pesca
                </Link>
              </li>
              <li>
                <Link href="/paa" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center justify-center md:justify-start gap-2">
                  🏪 Programa PAA
                </Link>
              </li>
              <li>
                <Link href="/agriculture/map" className="hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200 flex items-center justify-center md:justify-start gap-2">
                  🗺️ Mapa Interativo
                </Link>
              </li>
            </ul>
          </div>

          {/* Serviços */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-4">Serviços</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-zinc-600 dark:text-zinc-400">📋 Cadastro de Produtores</span>
              </li>
              <li>
                <span className="text-zinc-600 dark:text-zinc-400">🚜 Mecanização Agrícola</span>
              </li>
              <li>
                <span className="text-zinc-600 dark:text-zinc-400">🌱 Distribuição de Mudas</span>
              </li>
              <li>
                <span className="text-zinc-600 dark:text-zinc-400">📊 Assistência Técnica</span>
              </li>
              <li>
                <span className="text-zinc-600 dark:text-zinc-400">🎯 Programas de Fomento</span>
              </li>
            </ul>
          </div>

          {/* Informações de Contato */}
          <div className="text-center md:text-left">
            <h4 className="font-semibold text-green-800 dark:text-green-400 mb-4">Contato</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  Vitória do Xingu - PA
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <a 
                  href="mailto:semapa@vtx.pa.gov.br" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  semapa@vtx.pa.gov.br
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  (93) 3515-2200
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <a 
                  href="https://vtx.pa.gov.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  vtx.pa.gov.br
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Seção Governamental */}
        <div className="mt-8 pt-6 border-t border-green-200 dark:border-zinc-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold">Governo Municipal</span> • Vitória do Xingu
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>📊 Transparência</span>
              <span>•</span>
              <span>🏛️ Dados Abertos</span>
              <span>•</span>
              <span>📱 Tecnologia & Inovação</span>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-green-200 dark:bg-zinc-700" />
      
      {/* Copyright */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-zinc-800 dark:to-zinc-900 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} SEMAPA - Secretaria de Agricultura, Pesca e Abastecimento de Vitória do Xingu. 
              Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span>✨ Sistema desenvolvido com tecnologia avançada</span>
              <span>🌿 Sustentabilidade & Desenvolvimento Rural</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
