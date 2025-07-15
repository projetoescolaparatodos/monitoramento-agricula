
import { Link } from "wouter";
import { Separator } from "@/components/ui/separator";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-50 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-zinc-900 dark:to-zinc-800 text-zinc-700 dark:text-zinc-300 mt-16 border-t border-green-200 dark:border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logos e Identificação */}
          <div className="md:col-span-1 flex flex-col items-center md:items-start space-y-4">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center justify-center md:justify-start gap-6">
                <img 
                  src="/logo.png" 
                  alt="Logo SEMAPA" 
                  className="w-24 h-24 md:w-28 md:h-28 object-contain hover:scale-105 transition-transform duration-300"
                />
                <img 
                  src="/logoprefeitura.webp" 
                  alt="Logo Prefeitura Municipal" 
                  className="w-32 h-32 md:w-36 md:h-36 object-contain hover:scale-105 transition-transform duration-300"
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
                  Vitória do Xingu - PA / Av. Castelo Branco s/n
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <a 
                  href="mailto:secagricultura@vitoriadoxingu.pa.gov.br" 
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  secagricultura@vitoriadoxingu.pa.gov.br
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Phone className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-zinc-600 dark:text-zinc-400">
                  (93) 9144-6710
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <ExternalLink className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                <a 
                  href="https://vitoriadoxingu.pa.gov.br/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-200"
                >
                  vitoriadoxingu.pa.gov.br
                </a>
              </div>
            </div>
          </div>
        </div>

        </div>

      <Separator className="bg-green-200 dark:bg-zinc-700" />
      
      {/* Copyright */}
      <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-zinc-800 dark:to-zinc-900 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <p>
              &copy; {new Date().getFullYear()} SEMAPA - Secretaria de Agricultura, Pesca e Abastecimento de Vitória do Xingu. 
              Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <span>✨ Sistema desenvolvido com tecnologia avançada</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
