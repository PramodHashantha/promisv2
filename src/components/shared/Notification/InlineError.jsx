import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

const InlineError = ({ message }) => {
    if (!message) return null;

    return (
        <div className="flex items-center gap-2 mt-1.5 text-red-500 text-sm animate-fadeIn">
            <FiAlertCircle size={14} className="flex-shrink-0" />
            <span className="font-medium">{message}</span>
        </div>
    );
};

export default InlineError;
