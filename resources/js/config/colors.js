// Colores corporativos de Intiled
export const INTILED_COLORS = { // Colores principales
 azul: '#1F448B',        // Azul corporativo
 naranja: '#FF7D09',     // Naranja corporativo
 verde: '#B1CC34',       // Verde corporativo
 blanco: '#FFFFFF',      // Blanco puro
 // Fondos y superficies
 fondo: '#F8FAFC',       // Blanco suave para fondo principal
 superficie: '#FFFFFF',  // Blanco para cards y elementos
 superficieSecundaria: '#F1F5F9', // Gris muy claro para hover
 // Variaciones de azul
 azulClaro: '#4A6BA8',
 azulOscuro: '#1A3A7A',
 azulTransparente: 'rgba(31, 68, 139, 0.1)',
 azulHover: '#2D5AA0',
 // Variaciones de naranja
 naranjaClaro: '#FF9A3C',
 naranjaOscuro: '#E66A00',
 naranjaTransparente: 'rgba(255, 125, 9, 0.1)',
 naranjaHover: '#FF8A1A',
 // Variaciones de verde
 verdeClaro: '#C4D94A',
 verdeOscuro: '#9BB82A',
 verdeTransparente: 'rgba(177, 204, 52, 0.1)',
 verdeHover: '#A3C02A',
 // Grises y neutros
 grisClaro: '#F8F9FA',
 grisMedio: '#6C757D',
 grisOscuro: '#343A40',
 grisTransparente: 'rgba(108, 117, 125, 0.1)',
 grisTexto: '#64748B',
 grisBorde: '#E2E8F0',
 // Estados
 exito: '#28A745',
 error: '#DC3545',
 advertencia: '#FFC107',
 info: '#17A2B8',
 // Transparencias
 transparente: 'rgba(255, 255, 255, 0)',
 blancoTransparente: 'rgba(255, 255, 255, 0.1)',
 blancoTransparenteMedio: 'rgba(255, 255, 255, 0.2)',
 blancoTransparenteAlto: 'rgba(255, 255, 255, 0.8)',
 negroTransparente: 'rgba(0, 0, 0, 0.1)',
 negroTransparenteMedio: 'rgba(0, 0, 0, 0.2)',
 };
 // Gradientes corporativos
 export const INTILED_GRADIENTS = {
 // Gradiente principal (azul a naranja)
 principal: 'linear-gradient(135deg, #1F448B 0%, #4A6BA8 50%, #FF7D09 100%)',
 // Gradiente secundario (azul a verde)
 secundario: 'linear-gradient(135deg, #1F448B 0%, #4A6BA8 50%, #B1CC34 100%)',
 // Gradiente de acento (naranja a verde)
 acento: 'linear-gradient(45deg, #FF7D09, #B1CC34)',
 // Gradiente suave (azul suave)
 suave: 'linear-gradient(135deg, #1F448B 0%, #4A6BA8 100%)',
 // Gradiente glassmorphism
 glassmorphism: 'linear-gradient(135deg, rgba(31, 68, 139, 0.1) 0%, rgba(255, 125, 9, 0.1) 100%)',
 // Gradiente para botones
 botonPrimario: 'linear-gradient(45deg, #1F448B, #4A6BA8)',
 botonSecundario: 'linear-gradient(45deg, #FF7D09, #FF9A3C)',
 botonExito: 'linear-gradient(45deg, #B1CC34, #C4D94A)',
 // Gradientes para cards de estadísticas
 azul: 'linear-gradient(135deg, #1F448B 0%, #4A6BA8 100%)',
 verde: 'linear-gradient(135deg, #B1CC34 0%, #C4D94A 100%)',
 naranja: 'linear-gradient(135deg, #FF7D09 0%, #FF9A3C 100%)',
 morado: 'linear-gradient(135deg, #6B46C1 0%, #8B5CF6 100%)',
 rojo: 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)',
 amarillo: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
 };
 // Temas de componentes
 export const INTILED_THEMES = {
 // Botones
 botonPrimario: {
 background: INTILED_GRADIENTS.botonPrimario,
 color: INTILED_COLORS.blanco,
 border: 'none',
 hover: {
 background: INTILED_COLORS.azulHover,
 transform: 'translateY(-2px)',
 boxShadow: '0 8px 25px rgba(31, 68, 139, 0.3)'
 }
 },
 botonSecundario: {
 background: INTILED_GRADIENTS.botonSecundario,
 color: INTILED_COLORS.blanco,
 border: 'none',
 hover: {
 background: INTILED_COLORS.naranjaHover,
 transform: 'translateY(-2px)',
 boxShadow: '0 8px 25px rgba(255, 125, 9, 0.3)'
 }
 },
 botonExito: {
 background: INTILED_GRADIENTS.botonExito,
 color: INTILED_COLORS.blanco,
 border: 'none',
 hover: {
 background: INTILED_COLORS.verdeHover,
 transform: 'translateY(-2px)',
 boxShadow: '0 8px 25px rgba(177, 204, 52, 0.3)'
 }
 },
 botonOutline: {
 background: 'transparent',
 color: INTILED_COLORS.azul,
 border: `2px solid ${INTILED_COLORS.azul}`,
 hover: {
 background: INTILED_COLORS.azul,
 color: INTILED_COLORS.blanco
 }
 },
 // Inputs
 input: {
 background: INTILED_COLORS.superficie,
 border: `1px solid ${INTILED_COLORS.grisBorde}`,
 color: INTILED_COLORS.grisOscuro,
 focus: {
 borderColor: INTILED_COLORS.azul,
 boxShadow: `0 0 0 3px ${INTILED_COLORS.azulTransparente}`
 }
 },
 // Cards
 card: {
 background: INTILED_COLORS.superficie,
 border: `1px solid ${INTILED_COLORS.grisBorde}`,
 boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
 hover: {
 boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
 transform: 'translateY(-1px)'
 }
 },
 cardElevada: {
 background: INTILED_COLORS.superficie,
 border: `1px solid ${INTILED_COLORS.grisBorde}`,
 boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
 },
 // Estados
 exito: {
 background: 'rgba(40, 167, 69, 0.1)',
 border: '1px solid rgba(40, 167, 69, 0.2)',
 color: '#155724'
 },
 error: {
 background: 'rgba(220, 53, 69, 0.1)',
 border: '1px solid rgba(220, 53, 69, 0.2)',
 color: '#721c24'
 },
 advertencia: {
 background: 'rgba(255, 193, 7, 0.1)',
 border: '1px solid rgba(255, 193, 7, 0.2)',
 color: '#856404'
 },
 info: {
 background: 'rgba(23, 162, 184, 0.1)',
 border: '1px solid rgba(23, 162, 184, 0.2)',
 color: '#0c5460'
 }
 };
 // Función helper para aplicar estilos consistentes
 export const applyIntiledStyle = (component, variant = 'default') => {
 const baseStyles = {
 fontFamily: 'Inter, Arial, sans-serif',
 transition: 'all 0.3s ease'
 };
 switch (component) {
 case 'boton':
 return {
 ...baseStyles,
 ...INTILED_THEMES[variant === 'primario' ? 'botonPrimario' :
 variant === 'secundario' ? 'botonSecundario' :
 variant === 'exito' ? 'botonExito' : 'botonOutline']
 };
 case 'input':
 return {
 ...baseStyles,
 ...INTILED_THEMES.input
 };
 case 'card':
 return {
 ...baseStyles,
 ...INTILED_THEMES[variant === 'elevada' ? 'cardElevada' : 'card']
 };
 default:
 return baseStyles;
 }
 };