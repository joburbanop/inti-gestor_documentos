import React from 'react';

export const NewsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M4 6h12a2 2 0 012 2v9a3 3 0 01-3 3H7a3 3 0 01-3-3V6z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10h8M8 14h8M8 18h5" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 6V5a2 2 0 00-2-2H6a2 2 0 00-2 2v1" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const UploadIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M12 16V4m0 0l-4 4m4-4l4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
    <path d="M7 3v2m10-2v2M5 7h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 12h4m-4 4h6" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);
