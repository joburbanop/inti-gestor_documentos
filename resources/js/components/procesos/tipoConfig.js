export const TIPO_CONFIG = {
  estrategico: {
    key: 'estrategico',
    title: 'Procesos Estratégicos',
    subtitle: 'Definen la dirección y objetivos de la organización',
    emptyText: 'No hay procesos estratégicos registrados aún.'
  },
  misional: {
    key: 'misional',
    title: 'Procesos Misionales',
    subtitle: 'Ejecutan las funciones principales de la organización',
    emptyText: 'No hay procesos misionales registrados aún.'
  },
  apoyo: {
    key: 'apoyo',
    title: 'Procesos de Apoyo',
    subtitle: 'Soportan y habilitan los procesos estratégicos y misionales',
    emptyText: 'No hay procesos de apoyo registrados aún.'
  },
  evaluacion: {
    key: 'evaluacion',
    title: 'Procesos de Evaluación',
    subtitle: 'Evaluación y mejora continua de la organización',
    emptyText: 'No hay procesos de evaluación registrados aún.'
  }
};

export const getTipoConfig = (tipo) => TIPO_CONFIG[tipo] || {
  key: tipo,
  title: `Procesos: ${tipo}`,
  subtitle: '',
  emptyText: 'No hay procesos registrados.'
};
