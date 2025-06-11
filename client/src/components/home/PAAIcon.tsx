
import React from 'react';

const PAAIcon = () => (
  <svg
    className="w-12 h-12 text-white group-hover:scale-110 transition-all duration-300"
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
          animation: fruitJump 1.8s ease-in-out infinite;
        }
        .group:hover .fruit-2 {
          animation: fruitJump 1.8s ease-in-out infinite 0.3s;
        }
        .group:hover .fruit-3 {
          animation: fruitJump 1.8s ease-in-out infinite 0.6s;
        }
        @keyframes fruitJump {
          0%, 100% { 
            transform: translateY(0) scale(1); 
          }
          25% { 
            transform: translateY(-4px) scale(1.05); 
          }
          50% { 
            transform: translateY(-6px) scale(1.1); 
          }
          75% { 
            transform: translateY(-2px) scale(1.02); 
          }
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
