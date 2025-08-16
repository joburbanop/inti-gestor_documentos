/**
 * Utilidades de validación para formularios
 */
 /**
 * Validar email
 */
 export const validateEmail = (email) => {
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 return emailRegex.test(email);
 };
 /**
 * Validar contraseña
 */
 export const validatePassword = (password) => {
 // Mínimo 8 caracteres, al menos una letra y un número
 const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
 return passwordRegex.test(password);
 };
 /**
 * Validar archivo
 */
 export const validateFile = (file, options = {}) => {
 const {
 maxSize = 8 * 1024 * 1024, // 8MB por defecto
   allowedTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'zip', 'rar'],
 maxSizeMB = 8
 } = options;
 const errors = [];
 // Verificar si hay archivo
 if (!file) {
 errors.push('Debe seleccionar un archivo');
 return { isValid: false, errors };
 }
 // Verificar tamaño
 if (file.size > maxSize) {
 errors.push(`El archivo no puede ser mayor a ${maxSizeMB}MB`);
 }
 // Verificar tipo
 const fileExtension = file.name.split('.').pop().toLowerCase();
 if (!allowedTypes.includes(fileExtension)) {
 errors.push(`Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join('', ')}`);
 }
 return {
 isValid: errors.length === 0,
 errors
 };
 };
 /**
 * Validar campos requeridos
 */
 export const validateRequired = (value, fieldName) => {
 if (!value || (typeof value === 'string' && value.trim() === '')) {
 return `${fieldName} es obligatorio`;
 }
 return null;
 };
 /**
 * Validar longitud mínima
 */
 export const validateMinLength = (value, minLength, fieldName) => {
 if (value && value.length < minLength) {
 return `${fieldName} debe tener al menos ${minLength} caracteres`;
 }
 return null;
 };
 /**
 * Validar longitud máxima
 */
 export const validateMaxLength = (value, maxLength, fieldName) => {
 if (value && value.length > maxLength) {
 return `${fieldName} no puede tener más de ${maxLength} caracteres`;
 }
 return null;
 };
 /**
 * Validar número
 */
 export const validateNumber = (value, fieldName) => {
 if (value && isNaN(Number(value))) {
 return `${fieldName} debe ser un número válido`;
 }
 return null;
 };
 /**
 * Validar número mínimo
 */
 export const validateMinNumber = (value, minValue, fieldName) => {
 const numValue = Number(value);
 if (value && numValue < minValue) {
 return `${fieldName} debe ser mayor o igual a ${minValue}`;
 }
 return null;
 };
 /**
 * Validar número máximo
 */
 export const validateMaxNumber = (value, maxValue, fieldName) => {
 const numValue = Number(value);
 if (value && numValue > maxValue) {
 return `${fieldName} debe ser menor o igual a ${maxValue}`;
 }
 return null;
 };
 /**
 * Validar fecha
 */
 export const validateDate = (value, fieldName) => {
 if (value && isNaN(Date.parse(value))) {
 return `${fieldName} debe ser una fecha válida`;
 }
 return null;
 };
 /**
 * Validar fecha futura
 */
 export const validateFutureDate = (value, fieldName) => {
 if (value) {
 const date = new Date(value);
 const now = new Date();
 if (date <= now) {
 return `${fieldName} debe ser una fecha futura`;
 }
 }
 return null;
 };
 /**
 * Validar fecha pasada
 */
 export const validatePastDate = (value, fieldName) => {
 if (value) {
 const date = new Date(value);
 const now = new Date();
 if (date >= now) {
 return `${fieldName} debe ser una fecha pasada`;
 }
 }
 return null;
 };
 /**
 * Validar formato de teléfono
 */
 export const validatePhone = (phone) => {
 const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
 return phoneRegex.test(phone);
 };
 /**
 * Validar formato de URL
 */
 export const validateURL = (url) => {
 try {
 new URL(url);
 return true;
 } catch {
 return false;
 }
 };
 /**
 * Validar formulario completo
 */
 export const validateForm = (formData, validationRules) => {
 const errors = {};
 Object.keys(validationRules).forEach(fieldName => {
 const value = formData[fieldName];
 const rules = validationRules[fieldName];
 // Validar campo requerido
 if (rules.required) {
 const requiredError = validateRequired(value, fieldName);
 if (requiredError) {
 errors[fieldName] = requiredError;
 return; // No continuar con otras validaciones si es requerido
 }
 }
 // Validar longitud mínima
 if (rules.minLength && value) {
 const minLengthError = validateMinLength(value, rules.minLength, fieldName);
 if (minLengthError) {
 errors[fieldName] = minLengthError;
 }
 }
 // Validar longitud máxima
 if (rules.maxLength && value) {
 const maxLengthError = validateMaxLength(value, rules.maxLength, fieldName);
 if (maxLengthError) {
 errors[fieldName] = maxLengthError;
 }
 }
 // Validar email
 if (rules.email && value) {
 if (!validateEmail(value)) {
 errors[fieldName] = 'Email inválido';
 }
 }
 // Validar número
 if (rules.number && value) {
 const numberError = validateNumber(value, fieldName);
 if (numberError) {
 errors[fieldName] = numberError;
 }
 }
 // Validar número mínimo
 if (rules.minNumber && value) {
 const minNumberError = validateMinNumber(value, rules.minNumber, fieldName);
 if (minNumberError) {
 errors[fieldName] = minNumberError;
 }
 }
 // Validar número máximo
 if (rules.maxNumber && value) {
 const maxNumberError = validateMaxNumber(value, rules.maxNumber, fieldName);
 if (maxNumberError) {
 errors[fieldName] = maxNumberError;
 }
 }
 // Validar fecha
 if (rules.date && value) {
 const dateError = validateDate(value, fieldName);
 if (dateError) {
 errors[fieldName] = dateError;
 }
 }
 // Validar fecha futura
 if (rules.futureDate && value) {
 const futureDateError = validateFutureDate(value, fieldName);
 if (futureDateError) {
 errors[fieldName] = futureDateError;
 }
 }
 // Validar fecha pasada
 if (rules.pastDate && value) {
 const pastDateError = validatePastDate(value, fieldName);
 if (pastDateError) {
 errors[fieldName] = pastDateError;
 }
 }
 // Validar teléfono
 if (rules.phone && value) {
 if (!validatePhone(value)) {
 errors[fieldName] = 'Teléfono inválido';
 }
 }
 // Validar URL
 if (rules.url && value) {
 if (!validateURL(value)) {
 errors[fieldName] = 'URL inválida';
 }
 }
 // Validación personalizada
 if (rules.custom && value) {
 const customError = rules.custom(value, formData);
 if (customError) {
 errors[fieldName] = customError;
 }
 }
 });
 return {
 isValid: Object.keys(errors).length === 0,
 errors
 };
 };