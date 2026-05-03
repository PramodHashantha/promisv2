import React, { useMemo, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ module }) => {
    const { user, menu, loading } = useAuth();
    const location = useLocation();

    console.log("ProtectedRoute check:", { user, loading, path: location.pathname });


    // Flatten the menu to get a list of allowed paths
    const allowedPaths = useMemo(() => {
        const paths = new Set();

        // System routes that are always allowed for authenticated users
        // even if not present in the dynamic menu.
        const systemRoutes = ['/profile', '/settings'];
        systemRoutes.forEach(route => paths.add(route));

        const traverse = (items) => {
            if (!items) return;
            items.forEach(item => {
                if (item.path && item.path !== "#") {
                    let cleanPath = item.path.trim().toLowerCase();
                    // Ensure path starts with / for comparison with location.pathname
                    if (!cleanPath.startsWith('/')) {
                        cleanPath = '/' + cleanPath;
                    }
                    paths.add(cleanPath);
                }
                if (item.dropdownMenu) traverse(item.dropdownMenu);
                if (item.subdropdownMenu) traverse(item.subdropdownMenu);
            });
        };

        traverse(menu);
        return paths;
    }, [menu]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/authentication/login/minimal" state={{ from: location }} replace />;
    }

    // If no module constraint is passed, default to checking the current path
    const pathToCheck = module || location.pathname;

    // Check if any allowed path matches the start of the current path
    const isAllowed = Array.from(allowedPaths).some(path =>
        pathToCheck.toLowerCase().startsWith(path.toLowerCase())
    );

    if (!isAllowed) {
        console.warn(`Access denied to ${pathToCheck}. Redirecting...`);

        // Smart Redirect: Go to the first allowed path found, or Home if available, otherwise Login
        const firstAllowed = Array.from(allowedPaths)[0];

        if (firstAllowed) {
            // Avoid redirect loop if we are already at the target
            if (location.pathname.toLowerCase().startsWith(firstAllowed.toLowerCase())) {
                // We are at an allowed path (prefix matches) yet isAllowed failed?
                // This shouldn't happen with the logic above unless case sensitivity or exact match issues.
                // Fallback to login to be safe.
                return <Navigate to="/authentication/login/minimal" replace />;
            }
            return <Navigate to={firstAllowed} replace />;
        } else {
            // No permissions at all?
            return <Navigate to="/authentication/login/minimal" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
