import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { loginUser, revokeUser } from '../utils/api/http';
import { getNavigationMenu } from '../utils/api/api';
import { useQueryClient } from '@tanstack/react-query';
export const AuthContext = createContext(null);
import useNotification from "../hooks/useNotification";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const { notify } = useNotification();
    const queryClient = useQueryClient();
    const notifyRef = useRef(notify);
    notifyRef.current = notify;

    // Initialize state from local storage on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem("user");
                const storedMenu = localStorage.getItem("menu");
                const token = localStorage.getItem("accessToken");

                if (storedUser && token) {
                    setUser(JSON.parse(storedUser));
                    if (storedMenu) {
                        setMenu(JSON.parse(storedMenu));
                    }
                }
            } catch (error) {
                console.error("Failed to parse user from local storage", error);
                localStorage.removeItem("user");
                localStorage.removeItem("menu");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            } finally {
                setLoading(false);
            }
        };

        const handleSessionExpired = (event) => {
            const { redirectTo } = event.detail;
            
            // Show notification
            notifyRef.current('warning', 'Your session has expired. You will be redirected to login shortly.', { autoClose: 4000 });
            
            // Delayed cleanup and redirect
            setTimeout(() => {
                // Clear local state right before redirect
                setUser(null);
                setMenu([]);
                window.location.href = `/authentication/login/minimal?error=session_expired&redirectTo=${redirectTo}`;
            }, 3000);
        };

        initAuth();
        window.addEventListener('auth:session_expired', handleSessionExpired);

        return () => {
            window.removeEventListener('auth:session_expired', handleSessionExpired);
        };
    }, []);

    const handleLoginSuccess = useCallback(async (res) => {
        try {
            // Store tokens
            localStorage.setItem("accessToken", res.accessToken);
            localStorage.setItem("refreshToken", res.refreshToken);
            const userToStore = { ...res.user, ...(res.additionalData ?? {}) };
            localStorage.setItem("user", JSON.stringify(userToStore));

            // Fetch and store menu
            try {
                const menuRes = await getNavigationMenu();
                setMenu(menuRes);
                localStorage.setItem("menu", JSON.stringify(menuRes));
            } catch (menuError) {
                console.error("Failed to fetch navigation menu", menuError);
                notify('error', 'Failed to fetch navigation menu');
            }

            // Update state
            setUser(userToStore);
            notify('success', `Welcome back, ${res.user.fullname || 'User'}!`);

            // Invalidate cached enum/status data — ensures fresh data after a backend redeploy
            queryClient.invalidateQueries({ queryKey: ['status'] });

            return res; // Pass response back
        } catch (error) {
            console.error("Login success handler error", error);
            notify('error', 'Login failed. Please try again.');
            throw error;
        }
    }, [notify, queryClient]);

    const loginDev = useCallback(async (pfno, password) => {
        const res = await loginUser("/api/Auth/loginDev", { PFNO: pfno, Password: password });
        return await handleLoginSuccess(res);
    }, [handleLoginSuccess]);

    const login = useCallback(async (pfno, password) => {
        const res = await loginUser("/api/Auth/login", { PFNO: pfno, Password: password });
        return await handleLoginSuccess(res);
    }, [handleLoginSuccess]);

    const logout = useCallback(async () => {
        try {
            await revokeUser();
        } catch (error) {
            console.error("Logout revoke error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            localStorage.removeItem("menu");
            setUser(null);
            setMenu([]);
            window.location.href = "/authentication/login/minimal";
        }
    }, []);

    const authValue = useMemo(
        () => ({ user, menu, login, loginDev, logout, loading }),
        [user, menu, login, loginDev, logout, loading]
    );

    return (
        <AuthContext.Provider value={authValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
