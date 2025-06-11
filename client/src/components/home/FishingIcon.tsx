
import React from 'react';

const FishingIcon = () => (
  <svg
    className="w-12 h-12 text-white group-hover:scale-110 transition-all duration-300"
    fill="white"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <style>
      {`
        .wave-line {
          transform-origin: center;
        }
        .fish-tail {
          transform-origin: 16px 12px;
        }
        .group:hover .wave-line-1 {
          animation: wave 1.5s ease-in-out infinite;
        }
        .group:hover .wave-line-2 {
          animation: wave 1.5s ease-in-out infinite 0.2s;
        }
        .group:hover .wave-line-3 {
          animation: wave 1.5s ease-in-out infinite 0.4s;
        }
        .group:hover .fish-tail {
          animation: tailWag 1.2s ease-in-out infinite;
        }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(1px); }
        }
        @keyframes tailWag {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }
      `}
    </style>
    {/* Corpo do peixe */}
    <path d="M16 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z" />
    {/* Cauda do peixe */}
    <path className="fish-tail" d="M16 12l4-3v6l-4-3z" />
    {/* Linhas de água */}
    <path className="wave-line wave-line-1" d="M4 8c1.5 0 2 .5 3.5.5s2-.5 3.5-.5" fill="none" stroke="white" strokeWidth="1" />
    <path className="wave-line wave-line-2" d="M4 10c1.5 0 2 .5 3.5.5s2-.5 3.5-.5" fill="none" stroke="white" strokeWidth="1" />
    <path className="wave-line wave-line-3" d="M4 12c1.5 0 2 .5 3.5.5s2-.5 3.5-.5" fill="none" stroke="white" strokeWidth="1" />
  </svg>
);

export default FishingIcon;
