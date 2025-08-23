/**
 * Utilidades de formateo para datos
 */

/**
 * Formatear texto (capitalizar primera letra)
 */
export const formatText = (text, options = {}) => {
    const {
        textCase = 'capitalize', // 'capitalize', 'uppercase', 'lowercase'
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
