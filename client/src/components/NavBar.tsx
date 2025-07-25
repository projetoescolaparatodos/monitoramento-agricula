import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Map, Settings } from "lucide-react";
import { useState, useEffect } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavBarVisible, setIsNavBarVisible] = useState(true);
  let lastScrollY = 0;

  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavBarVisible(false);
      } else {
        setIsNavBarVisible(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b z-50 ${isNavBarVisible ? '' : '-translate-y-full'} transition-transform duration-300`}>
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
            <Link to="/agricultura" onClick={() => {
              handleNavLinkClick();
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                Agricultura
              </Button>
            </Link>
            <Link to="/pesca" onClick={() => {
              handleNavLinkClick();
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                Pesca
              </Button>
            </Link>
            <Link to="/paa" onClick={() => {
              handleNavLinkClick();
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}>
              <Button variant="ghost" className="w-full md:w-auto justify-start">
                <Map className="h-4 w-4 mr-2" />
                PAA
              </Button>
            </Link>
            <Link to="/sim" onClick={() => {
              handleNavLinkClick();
              setTimeout(() => window.scrollTo(0, 0), 100);
            }}>
            </Link>
            
            <Link to="/login/admin" onClick={handleNavLinkClick}>
              <Button variant="ghost" className="w-full md:w-auto justify-center" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;