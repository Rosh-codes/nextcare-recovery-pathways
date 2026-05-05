import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Spinner, Center } from '@chakra-ui/react';

const PrivateRoute = ({ children, requireAdmin = false, allowedRoles = null }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="primary.500" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PrivateRoute;
