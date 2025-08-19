// Iconos corporativos para valores/identidad
import React from 'react'; // Icono de Misión: diana/objetivo
 export const MissionIcon = ({ className = "w-6 h-6" }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
 <circle cx="12" cy="12" r="5" strokeWidth="1.5" />
 <circle cx="12" cy="12" r="1" strokeWidth="1.5" />
 <path d="M15 9l5-5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 <path d="M19 4h2v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 );
 // Icono de Visión: ojo con destello
 export const VisionIcon = ({ className = "w-6 h-6" }) => (
 <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
 <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
 <circle cx="12" cy="12" r="3.25" strokeWidth="1.5" />
 <path d="M12 6V4m4 4 1.5-1.5M8 8 6.5 6.5" strokeWidth="1.5" strokeLinecap="round" />
 </svg>
 );