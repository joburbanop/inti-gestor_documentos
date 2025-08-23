import React from 'react';

// Iconos SVG para tipos de archivo
export const FileTypeIcons = {
  // Documentos PDF
  pdf: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  }), React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M12 6v6m0 0l-2-2m2 2l2-2"
  })),

  // Imágenes
  image: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
  })),

  // Documentos de texto
  text: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  })),

  // Excel/Spreadsheets
  excel: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  })),

  // Word/Documents
  word: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  })),

  // PowerPoint/Presentations
  powerpoint: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
  })),

  // Archivos comprimidos
  archive: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  })),

  // Archivo genérico
  generic: ({ className = "w-6 h-6" }) => React.createElement('svg', {
    className,
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  }, React.createElement('path', {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: 2,
    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
  }))
};

// Función para obtener el icono SVG basado en la extensión
export const getFileTypeIcon = (extension, className = "w-6 h-6") => {
  const ext = extension?.toLowerCase();
  
  if (!ext) {
    return React.createElement(FileTypeIcons.generic, { className });
  }
  
  // PDF
  if (ext === 'pdf') {
    return React.createElement(FileTypeIcons.pdf, { className });
  }
  
  // Imágenes
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
    return React.createElement(FileTypeIcons.image, { className });
  }
  
  // Excel
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return React.createElement(FileTypeIcons.excel, { className });
  }
  
  // Word
  if (['doc', 'docx'].includes(ext)) {
    return React.createElement(FileTypeIcons.word, { className });
  }
  
  // PowerPoint
  if (['ppt', 'pptx'].includes(ext)) {
    return React.createElement(FileTypeIcons.powerpoint, { className });
  }
  
  // Archivos comprimidos
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return React.createElement(FileTypeIcons.archive, { className });
  }
  
  // Texto
  if (['txt', 'html', 'css', 'js', 'json', 'xml'].includes(ext)) {
    return React.createElement(FileTypeIcons.text, { className });
  }
  
  // Fallback genérico
  return React.createElement(FileTypeIcons.generic, { className });
};
