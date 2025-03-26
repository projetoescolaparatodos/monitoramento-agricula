
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            © 2024 Sistema de Gestão Agropecuária. Todos os direitos reservados.
          </div>
          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-4">
              <a href="/agriculture" className="text-sm text-gray-600 hover:text-gray-900">Agricultura</a>
              <a href="/fishing" className="text-sm text-gray-600 hover:text-gray-900">Pesca</a>
              <a href="/paa" className="text-sm text-gray-600 hover:text-gray-900">PAA</a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
