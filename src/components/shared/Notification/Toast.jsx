import React, { useEffect, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';
import './Notification.scss';

const Toast = ({ id, type, message, onClose, duration }) => {
    const [isExiting, setIsExiting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [progress, setProgress] = useState(100);

    const icons = {
        success: <FiCheckCircle />,
        error: <FiAlertCircle />,
        warning: <FiAlertTriangle />,
        info: <FiInfo />
    };

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => {
            onClose(id);
        }, 400); // Match CSS transition
    };

    useEffect(() => {
        // Trigger animations
        // We use a small delay to ensure the initial render (width: 100%) is processed
        const animFrame = requestAnimationFrame(() => {
            setIsMounted(true);
            // Start progress bar animation
            if (duration > 0) {
                // width transition will trigger onTransitionEnd which calls handleClose
                setProgress(0);
            }
        });

        return () => {
            cancelAnimationFrame(animFrame);
        };
    }, [duration]);

    // Determines class for animation state
    const animationClass = isExiting ? 'toast-exit-active' : (isMounted ? 'toast-enter-active' : 'toast-enter');

    return (
        <div
            className={`toast-card toast-${type} ${animationClass}`}
            role="alert"
        >
            <div className="toast-icon">
                {icons[type] || icons.info}
            </div>
            <div className="flex-1 text-sm font-medium leading-relaxed" style={{ wordBreak: 'break-word' }}>
                {message}
            </div>
            <button
                onClick={handleClose}
                className="toast-close"
                aria-label="Close"
            >
                <FiX size={18} />
            </button>

            {duration > 0 && (
                <div className="toast-progress-track">
                    <div
                        className="toast-progress-bar"
                        style={{ width: `${progress}%`, transitionDuration: `${duration}ms`, transitionTimingFunction: 'linear' }}
                        onTransitionEnd={() => handleClose()}
                    />
                </div>
            )}
        </div>
    );
};

export default Toast;
