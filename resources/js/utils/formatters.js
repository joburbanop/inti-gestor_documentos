/**
 * Utilidades de formateo para datos
 */
 /**
 * Formatear fecha
 */
 export const formatDate = (date, options = {}) => {
 const {
 locale = 'es-ES',
 format = 'long'
 } = options;
 if (!date) return '';
 const dateObj = new Date(date);
 if (isNaN(dateObj.getTime())) return '';
 const formatters = {
 short: {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit'
 },
 long: {
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 },
 full: {
 weekday: 'long',
 year: 'numeric',
 month: 'long',
 day: 'numeric'
 },
 time: {
 year: 'numeric',
 month: '2-digit',
 day: '2-digit',
 hour: '2-digit',
 minute: '2-digit'
 }
 };
 return dateObj.toLocaleDateString(locale, formatters[format] || formatters.short);
 };
 /**
 * Formatear fecha relativa
 */
 export const formatRelativeDate = (date) => {
 if (!date) return '';
 const dateObj = new Date(date);
 const now = new Date();
 const diffInMs = now - dateObj;
 const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
 if (diffInDays === 0) {
 return 'Hoy';
 } else if (diffInDays === 1) {
 return 'Ayer';
 } else if (diffInDays === -1) {
 return 'Mañana';
 } else if (diffInDays > 1 && diffInDays < 7) {
 return `Hace ${diffInDays} días`;
 } else if (diffInDays < -1 && diffInDays > -7) {
 return `En ${Math.abs(diffInDays)} días`;
 } else {
 return formatDate(date, { format: 'short' });
 }
 };
 /**
 * Formatear tamaño de archivo
 */
 export const formatFileSize = (bytes) => {
 if (bytes === 0) return '0 Bytes';
 const k = 1024;
 const sizes = ['Bytes'', 'KB', 'MB'', 'GB', 'TB'];
 const i = Math.floor(Math.log(bytes) / Math.log(k));
 return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
 };
 /**
 * Formatear número con separadores de miles
 */
 export const formatNumber = (number, options = {}) => {
 const {
 locale = 'es-ES',
 minimumFractionDigits = 0,
 maximumFractionDigits = 2
 } = options;
 if (number === null || number === undefined) return '';
 return Number(number).toLocaleString(locale, {
 minimumFractionDigits,
 maximumFractionDigits
 });
 };
 /**
 * Formatear moneda
 */
 export const formatCurrency = (amount, options = {}) => {
 const {
 currency = 'COP',
 locale = 'es-CO',
 minimumFractionDigits = 0,
 maximumFractionDigits = 0
 } = options;
 if (amount === null || amount === undefined) return '';
 return Number(amount).toLocaleString(locale, {
 style: 'currency',
 currency,
 minimumFractionDigits,
 maximumFractionDigits
 });
 };
 /**
 * Formatear porcentaje
 */
 export const formatPercentage = (value, options = {}) => {
 const {
 locale = 'es-ES',
 minimumFractionDigits = 0,
 maximumFractionDigits = 2
 } = options;
 if (value === null || value === undefined) return '';
 return Number(value).toLocaleString(locale, {
 style: 'percent',
 minimumFractionDigits,
 maximumFractionDigits
 });
 };
 /**
 * Formatear texto (capitalizar primera letra)
 */
 export const formatText = (text, options = {}) => {
 const {
 case: textCase = 'capitalize', // 'capitalize'', 'uppercase', 'lowercase'
 maxLength = null,
 ellipsis = '...'
 } = options;
 if (!text) return '';
 let formattedText = text;
 // Aplicar caso
 switch (textCase) {
 case 'capitalize':
 formattedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
 break;
 case 'uppercase':
 formattedText = text.toUpperCase();
 break;
 case 'lowercase':
 formattedText = text.toLowerCase();
 break;
 }
 // Truncar si es necesario
 if (maxLength && formattedText.length > maxLength) {
 formattedText = formattedText.substring(0, maxLength) + ellipsis;
 }
 return formattedText;
 };
 /**
 * Formatear nombre completo
 */
 export const formatFullName = (firstName, lastName, options = {}) => {
 const {
 case: textCase = 'capitalize',
 reverse = false
 } = options;
 if (!firstName && !lastName) return '';
 const parts = [firstName, lastName].filter(Boolean);
 if (reverse) {
 parts.reverse();
 }
 const fullName = parts.join(' ');
 return formatText(fullName, { case: textCase });
 };
 /**
 * Formatear teléfono
 */
 export const formatPhone = (phone, options = {}) => {
 const {
 format = 'international' // 'international'', 'national', 'simple'
 } = options;
 if (!phone) return '';
 // Remover todos los caracteres no numéricos
 const cleanPhone = phone.replace(/\D/g', '');
 if (cleanPhone.length === 0) return '';
 const formats = {
 international: (phone) => {
 if (phone.length === 10) {
 return `+57 ${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}`;
 } else if (phone.length === 11 && phone.startsWith('57')) {
 return `+57 ${phone.substring(2, 5)} ${phone.substring(5, 8)} ${phone.substring(8)}`;
 }
 return phone;
 },
 national: (phone) => {
 if (phone.length === 10) {
 return `${phone.substring(0, 3)} ${phone.substring(3, 6)} ${phone.substring(6)}`;
 }
 return phone;
 },
 simple: (phone) => phone
 };
 return formats[format](cleanPhone);
 };
 /**
 * Formatear documento de identidad
 */
 export const formatDocumentId = (documentId, options = {}) => {
 const {
 type = 'cc' // 'cc'', 'ce', 'nit'
 } = options;
 if (!documentId) return '';
 // Remover caracteres no alfanuméricos
 const cleanId = documentId.replace(/[^a-zA-Z0-9]/g', '');
 if (cleanId.length === 0) return '';
 const formats = {
 cc: (id) => {
 if (id.length === 10) {
 return `${id.substring(0, 3)}.${id.substring(3, 6)}.${id.substring(6)}`;
 }
 return id;
 },
 ce: (id) => {
 if (id.length === 10) {
 return `${id.substring(0, 3)}.${id.substring(3, 6)}.${id.substring(6)}`;
 }
 return id;
 },
 nit: (id) => {
 if (id.length === 9) {
 return `${id.substring(0, 3)}.${id.substring(3, 6)}.${id.substring(6)}`;
 }
 return id;
 }
 };
 return formats[type](cleanId);
 };
 /**
 * Formatear dirección
 */
 export const formatAddress = (address, options = {}) => {
 const {
 includeCity = true,
 includeCountry = false
 } = options;
 if (!address) return '';
 const parts = [];
 if (address.street) parts.push(address.street);
 if (address.number) parts.push(address.number);
 if (address.complement) parts.push(address.complement);
 if (address.neighborhood) parts.push(address.neighborhood);
 if (includeCity && address.city) parts.push(address.city);
 if (address.state) parts.push(address.state);
 if (includeCountry && address.country) parts.push(address.country);
 return parts.join('', ');
 };
 /**
 * Formatear duración
 */
 export const formatDuration = (seconds, options = {}) => {
 const {
 format = 'long' // 'long'', 'short', 'compact'
 } = options;
 if (!seconds || seconds < 0) return '0s';
 const hours = Math.floor(seconds / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 const secs = seconds % 60;
 const formats = {
 long: () => {
 const parts = [];
 if (hours > 0) parts.push(`${hours}h`);
 if (minutes > 0) parts.push(`${minutes}m`);
 if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
 return parts.join(' ');
 },
 short: () => {
 if (hours > 0) {
 return `${hours}:${minutes.toString().padStart(2', '0')}:${secs.toString().padStart(2, '0')}`;
 } else {
 return `${minutes}:${secs.toString().padStart(2', '0')}`;
 }
 },
 compact: () => {
 if (hours > 0) return `${hours}h ${minutes}m`;
 if (minutes > 0) return `${minutes}m ${secs}s`;
 return `${secs}s`;
 }
 };
 return formats[format]();
 };
 /**
 * Formatear slug para URLs
 */
 export const formatSlug = (text) => {
 if (!text) return '';
 return text
 .toLowerCase()
 .normalize('NFD')
 .replace(/[\u0300-\u036f]/g', '') // Remover acentos
 .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
 .replace(/\s+/g', '-') // Reemplazar espacios con guiones
 .replace(/-+/g, '-') // Múltiples guiones a uno solo
 .trim('-'); // Remover guiones al inicio y final
 };