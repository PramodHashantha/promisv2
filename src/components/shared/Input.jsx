import React from 'react'
import getIcon from '@/utils/getIcon'

import InlineError from './Notification/InlineError';

const Input = ({ label, icon, type = "text", placeholder, labelId, name, centerLink, error }) => {
    return (
        <div className="row mb-4 align-items-center">
            <div className="col-lg-4">
                <label htmlFor={labelId} className="fw-semibold">{label}: </label>
            </div>
            <div className="col-lg-8">
                <div className="input-group">
                    <div className={`input-group-text ${error ? 'border-red-500 text-red-500' : ''}`}>{getIcon(icon)}</div>
                    {centerLink ? <div className="input-group-text">https://themeforest.net/user/theme_ocean</div> : ""}
                    <input
                        type={type}
                        name={name}
                        className={`form-control ${error ? 'is-invalid border-red-500' : ''}`}
                        id={labelId}
                        placeholder={placeholder}
                    />
                </div>
                {error && <InlineError message={error} />}
            </div>
        </div>
    )
}

export default Input