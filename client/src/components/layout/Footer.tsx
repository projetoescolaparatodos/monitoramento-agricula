import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-neutral-dark text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="flex items-center space-x-2 mb-4">
                <h2 className="text-lg font-heading font-bold">InfoAgro</h2>
                <p className="text-xs text-neutral-light">Sistema de Gestão de Informações Agrícolas</p>
              </div>
            </Link>
            <p className="text-sm text-neutral-light mb-4">
              Fornecendo dados e informações sobre agricultura, pesca e programas governamentais para subsidiar políticas públicas e tomadas de decisão.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-light hover:text-white transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-neutral/20 mt-8 pt-8 text-center text-sm text-neutral-light">
          <p>&copy; {new Date().getFullYear()} InfoAgro - Sistema de Gestão de Informações Agrícolas. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;