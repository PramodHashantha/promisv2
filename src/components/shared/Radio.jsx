import React from 'react'

/**
 * Radio - A premium, styled radio button component.
 * @param {string} label - The text label to display next to the radio button.
 * @param {string} id - Unique identifier for the radio and label association.
 * @param {string} name - The name attribute for the radio group.
 * @param {boolean} checked - Controlled checked state.
 * @param {string} className - Additional CSS classes for the container.
 */
const Radio = ({ label, id, name, checked, className = "", ...props }) => {
    return (
        <label className={`brand-radio-group ${className}`} htmlFor={id}>
            <input 
                type="radio" 
                id={id} 
                name={name}
                checked={checked} 
                {...props} 
            />
            <span className="brand-radio-circle"></span>
            {label && <span className="brand-radio-label">{label}</span>}
        </label>
    )
}

export default Radio
