import React from 'react';
import { 
  BuildingIcon, 
  ProcessIcon, 
  DocumentIcon,
  SettingsIcon,
  ArrowLeftIcon,
  SaveIcon,
  CodeIcon,
  DescriptionIcon,
  PlusIcon,
  EditIcon,
  DeleteIcon,
  CloseIcon,
  InfoIcon,
  ArrowRightIcon,
  StatsIcon,
  DetailsIcon,
  EyeIcon
} from '../components/icons/CrudIcons.jsx';
import { ChartIcon } from '../components/icons/DashboardIcons.jsx';

// Mapeo de nombres de iconos a componentes SVG
export const iconMapping = {
  // Procesos Estratégicos
  'chart-bar': ChartIcon,
  'office-building': BuildingIcon,
  'process': ProcessIcon,
  
  // Procesos Misionales
  'heart': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
  })),
  'user-group': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
  })),
  'clipboard-list': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
  })),
  
  // Procesos de Apoyo
  'users': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
  })),
  'currency-dollar': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
  })),
  'computer-desktop': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  })),
  
  // Procesos de Evaluación
  'shield-check': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  })),
  'arrow-up': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M5 10l7-7m0 0l7 7m-7-7v18"
  })),
  
  // Procesos Internos
  'document-text': DocumentIcon,
  'academic-cap': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 14l9-5-9-5-9 5 9 5z"
  }), React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
  }), React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
  })),
  'book-open': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
  })),
  
  // Emojis convertidos a SVG (para compatibilidad)
  '📊': ChartIcon,
  '🏢': BuildingIcon,
  '❤️': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
  })),
  '👥': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
  })),
  '📋': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
  })),
  '👨‍💼': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
  })),
  '💰': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
  })),
  '💻': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
  })),
  '🛡️': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  })),
  '📈': ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
  })),
};

// Función para obtener el componente de icono
export const getIconComponent = (iconName, className = "w-6 h-6") => {
  const IconComponent = iconMapping[iconName];
  
  if (IconComponent) {
    return React.createElement(IconComponent, { className });
  }
  
  // Fallback: icono de documento genérico
  return React.createElement(DocumentIcon, { className });
};

// Función para renderizar icono con fallback
export const renderIcon = (iconName, className = "w-6 h-6") => {
  return getIconComponent(iconName, className);
};
