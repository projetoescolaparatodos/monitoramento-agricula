
import React from 'react';

const AgricultureTractorIcon = () => (
  <svg
    className="w-8 h-8 text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300"
    fill="url(#tractorGradient)"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="tractorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#34d399' }} /> {/* green-400 */}
        <stop offset="100%" style={{ stopColor: '#059669' }} /> {/* green-600 */}
      </linearGradient>
    </defs>
    {/* Corpo do trator */}
    <rect x="4" y="10" width="16" height="6" rx="1" />
    {/* Roda traseira maior */}
    <circle cx="8" cy="18" r="3" />
    {/* Roda dianteira menor */}
    <circle cx="16" cy="18" r="2" />
    {/* Chaminé */}
    <rect x="18" y="8" width="2" height="3" rx="0.5" />
    {/* Cabine */}
    <path d="M12 8h4v-3a1 1 0 00-1-1h-2a1 1 0 00-1 1v3z" />
  </svg>
);

export default AgricultureTractorIcon;
