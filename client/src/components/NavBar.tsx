import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Map, BarChart3, Settings } from "lucide-react";
import { useState } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavLinkClick = () => {
    setIsMenuOpen(false); // Fecha o menu quando um link é clicado
  };

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex-1 flex justify-center md:justify-start" onClick={handleNavLinkClick}>
            <div className="flex items-center gap-2 text-primary">
              <img
                src="/logo.png"
                alt="SEMAPA"
                className="h-12 w-auto"
              />
              <span className="font-semibold text-lg hidden sm:inline">
                SEMAPA - Vitória do Xingu
              </span>
            </div>
          </Link>

          {/* Menu Hamburguer para Mobile */}
          <button 
            className="md:hidden text-primary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            ☰
          </button>

          {/* Menu de Navegação */}
          <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-full left-0 w-full md:w-auto bg-white/80 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none gap-2 md:gap-4 p-4 md:p-0 border-b md:border-0`}>
            <Link to="/agriculture" onClick={handleNavLinkClick}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                Agricultura
              </Button>
            </Link>
            <Link to="/fishing" onClick={handleNavLinkClick}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                Pesca
              </Button>
            </Link>
            <Link to="/paa" onClick={handleNavLinkClick}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                PAA
              </Button>
            </Link>
            <Link to="/admin" onClick={handleNavLinkClick}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Administração
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;