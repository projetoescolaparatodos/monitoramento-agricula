
import React from 'react';
import { Link } from 'react-router-dom';

const AreasSection = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Áreas de Atuação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link to="/agriculture" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Agricultura</h3>
          </Link>
          <Link to="/fishing" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">Pesca</h3>
          </Link>
          <Link to="/paa" className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">PAA</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AreasSection;
