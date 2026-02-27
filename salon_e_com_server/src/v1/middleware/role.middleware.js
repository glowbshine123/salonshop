// src/v1/middleware/role.middleware.js
export const authorize = (...roles) => {
    return (req, res, next) => {
        const userRole = req.user?.role ? req.user.role.toUpperCase() : 'GUEST';
        const allowedRoles = roles.map(r => r.toUpperCase());

        if (userRole === 'ADMIN') {
            return next();
        }

        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `User role '${userRole}' is not authorized to access this route`
            });
        }
        next();
    };
};
