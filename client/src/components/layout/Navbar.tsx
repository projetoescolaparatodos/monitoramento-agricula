
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleNavLinkClick = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <nav className="bg-white shadow fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center" onClick={handleNavLinkClick}>
              Home
            </Link>
            <Link to="/agriculture" className="ml-8 flex items-center" onClick={handleNavLinkClick}>
              Agricultura
            </Link>
            <Link to="/fishing" className="ml-8 flex items-center" onClick={handleNavLinkClick}>
              Pesca
            </Link>
            <Link to="/paa" className="flex items-center hover:text-green-600 transition-colors" onClick={handleNavLinkClick}>
              PAA
            </Link>
            <Link to="/sim" className="flex items-center hover:text-green-600 transition-colors" onClick={handleNavLinkClick}>
              SIM
            </Link>
          </div>
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center" onClick={handleNavLinkClick}>
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
