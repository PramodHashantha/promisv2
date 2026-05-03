import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message, duration = 5000) => {
        const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        setToasts(prev => [...prev, { id, type, message, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const confirm = useCallback(({ title, text, icon = 'warning', confirmButtonText = 'Yes, do it!', showCancelButton = true }) => {
        return MySwal.fire({
            title,
            text,
            icon,
            showCancelButton,
            confirmButtonText,
            customClass: {
                popup: 'dark:bg-slate-800 dark:text-white',
                title: 'dark:text-white',
                content: 'dark:text-gray-300'
            }
        });
    }, []);

    const success = useCallback((message, duration) => addToast('success', message, duration), [addToast]);
    const error = useCallback((message, duration) => addToast('error', message, duration), [addToast]);
    const warning = useCallback((message, duration) => addToast('warning', message, duration), [addToast]);
    const info = useCallback((message, duration) => addToast('info', message, duration), [addToast]);

    const contextValue = useMemo(
        () => ({
            toasts,
            notify: addToast,
            success,
            error,
            warning,
            info,
            removeToast,
            confirm,
        }),
        [toasts, addToast, success, error, warning, info, removeToast, confirm]
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
