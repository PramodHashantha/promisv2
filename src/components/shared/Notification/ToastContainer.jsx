import React from 'react';
import useNotification from '@/hooks/useNotification';
import Toast from './Toast';
import './Notification.scss';

const ToastContainer = () => {
    const { toasts, removeToast } = useNotification();

    return (
        <div className="toast-container-custom">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
