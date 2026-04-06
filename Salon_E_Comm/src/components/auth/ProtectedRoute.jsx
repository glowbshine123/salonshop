import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />;
    }

    // Normalize role comparison
    const userRole = user?.role?.toUpperCase();

    if (roles && !roles.includes(userRole)) {
        console.warn(`Redirecting: Role ${userRole} not in allowed list [${roles.join(', ')}]`);
        // Redirect to home or a forbidden page if user doesn't have the required role
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
