import { useAuth } from '../contexts/AuthContext';
import { ROLES, ROLE_CAPABILITIES } from '../roles/permissions';

export const useUserRole = () => {
  const { user } = useAuth();
  if (!user) return ROLES.USUARIO;
  if (user.is_admin) return ROLES.ADMINISTRADOR;
  // Normalizar valores comunes a nuestros roles esperados
  const raw = (user.role?.name || '').toString().toLowerCase();
  if (raw.includes('admin')) return ROLES.ADMINISTRADOR;
  if (raw.includes('director')) return ROLES.DIRECTOR;
  return ROLES.USUARIO;
};

export const useHasPermission = (permission) => {
  const role = useUserRole();
  const caps = ROLE_CAPABILITIES[role] || new Set();
  return caps.has(permission);
};
