import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useHasPermission } from '../../hooks/useAuthorization';

const ProtectedRoute = ({ permission, children }) => {
  const allowed = useHasPermission(permission);
  if (!allowed) return <Navigate to="/" replace />;
  return children;
};

ProtectedRoute.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export default ProtectedRoute;
