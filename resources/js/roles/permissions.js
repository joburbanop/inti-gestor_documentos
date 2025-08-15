export const ROLES = { ADMINISTRADOR: 'administrador', DIRECTOR: 'director', USUARIO: 'usuario' };

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_DOCUMENTS: 'manage_documents',
  VIEW_DOCUMENTS: 'view_documents',
  MANAGE_PROCESSES: 'manage_processes',
  MANAGE_NEWS: 'manage_news',
  VIEW_NEWS: 'view_news',
};

export const ROLE_CAPABILITIES = {
  [ROLES.ADMINISTRADOR]: new Set(Object.values(PERMISSIONS)),
  [ROLES.DIRECTOR]: new Set([
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.MANAGE_PROCESSES,
    PERMISSIONS.MANAGE_NEWS,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.VIEW_NEWS,
  ]),
  [ROLES.USUARIO]: new Set([
    PERMISSIONS.VIEW_NEWS,
  ]),
};
