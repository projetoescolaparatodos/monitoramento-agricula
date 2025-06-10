
import React from 'react';

const PAAIcon = () => (
  <svg
    className="w-16 h-16 text-white group-hover:scale-110 transition-all duration-300"
    fill="white"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <style>
      {`
        .fruit {
          transform-origin: center;
        }
        .group:hover .fruit-1 {
          animation: pulse 1.2s ease-in-out infinite;
        }
        .group:hover .fruit-2 {
          animation: pulse 1.2s ease-in-out infinite 0.2s;
        }
        .group:hover .fruit-3 {
          animation: pulse 1.2s ease-in-out infinite 0.4s;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      `}
    </style>
    {/* Base da cesta */}
    <path d="M4 10h16v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6z" />
    {/* Alça da cesta */}
    <path d="M8 10c0-3 2-5 4-5s4 2 4 5" fill="none" stroke="white" strokeWidth="2" />
    {/* Frutas */}
    <circle className="fruit fruit-1" cx="9" cy="14" r="2" />
    <circle className="fruit fruit-2" cx="12" cy="12" r="2" />
    <circle className="fruit fruit-3" cx="15" cy="14" r="2" />
  </svg>
);

export default PAAIcon;
