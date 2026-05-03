import React from 'react'

/**
 * Switch - A premium, styled toggle switch component.
 * @param {string} label - The text label to display next to the switch.
 * @param {string} id - Unique identifier for the switch and label association.
 * @param {boolean} checked - Controlled checked state.
 * @param {string} className - Additional CSS classes for the container.
 */
const Switch = ({ label, id, checked, className = "", ...props }) => {
    return (
        <label className={`brand-switch ${className}`} htmlFor={id}>
            <input 
                type="checkbox" 
                id={id} 
                checked={checked} 
                {...props} 
            />
            <div className="brand-switch-track">
                <div className="brand-switch-thumb"></div>
            </div>
            {label && <span className="brand-switch-label">{label}</span>}
        </label>
    )
}

export default Switch
