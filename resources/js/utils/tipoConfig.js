// Función para obtener configuración de un tipo específico
export const getTipoConfig = (tipo, configs = {}) => {
  console.log('🔍 [utils/tipoConfig.js] Obteniendo configuración para tipo:', tipo);
  
  // Si tenemos configuración desde la BD, usarla
  if (configs[tipo]) {
    return configs[tipo];
  }
  
  // Fallback si no hay configuración
  return {
    key: tipo,
    title: `Procesos: ${tipo}`,
    subtitle: '',
    emptyText: 'No hay procesos registrados.'
  };
};
