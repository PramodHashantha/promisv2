import React from 'react'

/**
 * BrandCheckbox - A premium, styled checkbox component.
 * @param {string} label - The text label to display next to the checkbox.
 * @param {string} id - Unique identifier for the checkbox and label association.
 * @param {boolean} checked - Controlled checked state.
 * @param {string} className - Additional CSS classes for the container.
 */
const Checkbox = ({ label, id, checked, className = "", ...props }) => {
    return (
        <label className={`brand-checkbox-group ${className}`} htmlFor={id}>
            <input 
                type="checkbox" 
                id={id} 
                checked={checked} 
                {...props} 
            />
            <span className="brand-checkbox-box"></span>
            {label && <span className="brand-checkbox-label">{label}</span>}
        </label>
    )
}

export default Checkbox