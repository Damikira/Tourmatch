import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Ajustamos la ruta porque ahora está un nivel más profundo

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;