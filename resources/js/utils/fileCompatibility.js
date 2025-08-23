/**
 * Utilidades para manejar la compatibilidad de archivos
 */

// Tipos de archivo visualizables en el navegador
export const VIEWABLE_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 
  'txt', 'html', 'css', 'js', 'json', 'xml', 'csv'
];

// Tipos MIME visualizables
export const VIEWABLE_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/svg+xml',
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
  'text/csv'
];

/**
 * Determina si un archivo es visualizable en el navegador
 * @param {string} extension - Extensión del archivo
 * @param {string} mimeType - Tipo MIME del archivo (opcional)
 * @returns {boolean}
 */
export const isViewableFile = (extension, mimeType = null) => {
  const ext = extension?.toLowerCase();
  
  // Si tenemos MIME type, usarlo como fuente principal
  if (mimeType && VIEWABLE_MIME_TYPES.includes(mimeType)) {
    return true;
  }
  
  // Fallback a extensión
  return VIEWABLE_EXTENSIONS.includes(ext);
};

/**
 * Obtiene el tipo de contenido del archivo
 * @param {string} extension - Extensión del archivo
 * @param {string} mimeType - Tipo MIME del archivo (opcional)
 * @returns {string}
 */
export const getContentType = (extension, mimeType = null) => {
  const ext = extension?.toLowerCase();
  
  // Determinar tipo basado en MIME type si está disponible
  if (mimeType) {
    if (mimeType.startsWith('image/')) return 'imagen';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('text/')) return 'texto';
  }
  
  // Fallback a extensión
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'imagen';
  if (ext === 'pdf') return 'pdf';
  if (['txt', 'html', 'css', 'js', 'json', 'xml', 'csv'].includes(ext)) return 'texto';
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'ofimatica';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return 'comprimido';
  
  return 'documento';
};

/**
 * Obtiene el mensaje de compatibilidad para un archivo
 * @param {string} extension - Extensión del archivo
 * @param {string} mimeType - Tipo MIME del archivo (opcional)
 * @returns {string}
 */
export const getCompatibilityMessage = (extension, mimeType = null) => {
  const isViewable = isViewableFile(extension, mimeType);
  
  if (isViewable) {
    return 'Este archivo se puede visualizar en el navegador';
  }
  
  const contentType = getContentType(extension, mimeType);
  
  switch (contentType) {
    case 'ofimatica':
      return 'Este archivo de Office requiere una aplicación compatible (Word, Excel, PowerPoint) para visualizarlo.';
    case 'comprimido':
      return 'Este archivo comprimido debe ser extraído antes de poder acceder a su contenido.';
    case 'documento':
    default:
      return 'Este tipo de archivo no es compatible con la visualización en el navegador. Se recomienda descargarlo.';
  }
};

/**
 * Obtiene el ícono apropiado para el tipo de archivo
 * @param {string} extension - Extensión del archivo
 * @param {string} mimeType - Tipo MIME del archivo (opcional)
 * @returns {string}
 */
export const getFileIcon = (extension, mimeType = null) => {
  const contentType = getContentType(extension, mimeType);
  
  switch (contentType) {
    case 'imagen':
      return '🖼️';
    case 'pdf':
      return '📄';
    case 'texto':
      return '📝';
    case 'ofimatica':
      return '📊';
    case 'comprimido':
      return '📦';
    default:
      return '📄';
  }
};

/**
 * Obtiene información completa de compatibilidad para un archivo
 * @param {string} extension - Extensión del archivo
 * @param {string} mimeType - Tipo MIME del archivo (opcional)
 * @returns {object}
 */
export const getFileCompatibilityInfo = (extension, mimeType = null) => {
  return {
    isViewable: isViewableFile(extension, mimeType),
    contentType: getContentType(extension, mimeType),
    message: getCompatibilityMessage(extension, mimeType),
    icon: getFileIcon(extension, mimeType),
    extension: extension?.toLowerCase(),
    mimeType
  };
};

/**
 * Obtiene las extensiones soportadas por tipo de contenido
 * @returns {object}
 */
export const getSupportedExtensionsByType = () => {
  return {
    imagen: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'],
    pdf: ['pdf'],
    texto: ['txt', 'html', 'css', 'js', 'json', 'xml', 'csv'],
    ofimatica: ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'],
    comprimido: ['zip', 'rar', '7z', 'tar', 'gz'],
    video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'],
    audio: ['mp3', 'wav', 'aac', 'ogg', 'flac']
  };
};

/**
 * Valida si una extensión es soportada
 * @param {string} extension - Extensión a validar
 * @returns {boolean}
 */
export const isSupportedExtension = (extension) => {
  const ext = extension?.toLowerCase();
  const allSupported = Object.values(getSupportedExtensionsByType()).flat();
  return allSupported.includes(ext);
};
