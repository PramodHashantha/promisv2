import React, { useEffect, useState } from 'react'
import { FiSave, FiUpload, FiEdit2, FiX, FiUser, FiBriefcase, FiMail, FiPhone, FiTag } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext';
import useNotification from '../../hooks/useNotification';

const TabOverviewContent = () => {
    const { user } = useAuth();
    const { notify } = useNotification();

    const [isEditing, setIsEditing] = useState(false);

    // Initial state with defaults
    const [formData, setFormData] = useState({
        fullname: '',
        title: 'Ms',
        designation: '',
        email: '',
        phoneNumber: '',
        image: null
    });

    // Load user data when available
    useEffect(() => {
        if (user) {
            setFormData({
                fullname: user.fullname || '',
                title: user.titles || 'Ms',
                designation: user.designation || '',
                email: user.email || '',
                phoneNumber: user.phonE_NUMBER || '',
                image: null
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, image: e.target.files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Placeholder for API call
        notify('info', 'Update functionality coming soon!');
        console.log("Saving user data:", formData);
        setIsEditing(false); // Exit edit mode on save
    };

    const toggleEdit = (e) => {
        e.preventDefault();
        setIsEditing(!isEditing);
    };

    const handleCancel = (e) => {
        e.preventDefault();
        setIsEditing(false);
        // Reset data to user context if needed, but for now just exit edit mode
    };

    return (
        <div className="tab-pane fade show active p-4" id="overviewTab" role="tabpanel">
            <div className="profile-details mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                    <h5 className="fw-bold mb-0 text-dark">Profile Overview</h5>
                    {!isEditing && (
                        <button onClick={toggleEdit} className="btn btn-light-brand d-flex align-items-center gap-2">
                            <FiEdit2 size={16} />
                            <span>Edit Details</span>
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="animation-fade-in">
                        <div className="row mb-4">
                            <div className="col-md-4 mb-3 mb-md-0">
                                <label className="form-label fw-bold text-muted small text-uppercase">Full Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><FiUser /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="fullname"
                                        value={formData.fullname}
                                        onChange={handleChange}
                                        placeholder="Enter full name"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4 mb-3 mb-md-0">
                                <label className="form-label fw-bold text-muted small text-uppercase">Title</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><FiTag /></span>
                                    <select
                                        className="form-select"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                    >
                                        <option value="Ms">Ms</option>
                                        <option value="Mr">Mr</option>
                                        <option value="Eng">Eng</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <label className="form-label fw-bold text-muted small text-uppercase">Designation</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><FiBriefcase /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Enter designation"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-6 mb-3 mb-md-0">
                                <label className="form-label fw-bold text-muted small text-uppercase">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><FiMail /></span>
                                    <input
                                        type="email"
                                        className="form-control"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email address"
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold text-muted small text-uppercase">Phone Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white text-muted"><FiPhone /></span>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="row mb-4">
                            <div className="col-md-12">
                                <label className="form-label fw-bold text-muted small text-uppercase">Profile Image</label>
                                <div className="d-flex align-items-center gap-3 p-3 border border-dashed rounded bg-light-subtle">
                                    <div className="btn btn-light-brand position-relative overflow-hidden">
                                        <FiUpload className="me-2" /> Choose File
                                        <input
                                            type="file"
                                            className="position-absolute top-0 start-0 opacity-0 w-100 h-100 cursor-pointer"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                    {formData.image ?
                                        <span className="text-success fw-medium small">{formData.image.name}</span> :
                                        <span className="text-muted small fst-italic">No file chosen</span>
                                    }
                                </div>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-5 pt-3 border-top">
                            <button type="button" onClick={handleCancel} className="btn btn-light text-muted d-flex align-items-center gap-2">
                                <FiX />
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
                                <FiSave />
                                Save Changes
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="row g-4 animation-fade-in">
                        <div className="col-md-6 col-xl-4">
                            <div className="p-3 border rounded bg-white h-100 shadow-sm-hover transition-all">
                                <label className="d-block text-muted small text-uppercase fw-bold mb-2">Full Name</label>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-text bg-light-primary text-primary rounded-3 me-3">
                                        <FiUser size={18} />
                                    </div>
                                    <span className="fs-15 fw-semibold text-dark">{formData.fullname || <span className="text-muted fst-italic">Not set</span>}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-4">
                            <div className="p-3 border rounded bg-white h-100 shadow-sm-hover transition-all">
                                <label className="d-block text-muted small text-uppercase fw-bold mb-2">Title</label>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-text bg-light-info text-info rounded-3 me-3">
                                        <FiTag size={18} />
                                    </div>
                                    <span className="fs-15 fw-semibold text-dark">{formData.title}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-4">
                            <div className="p-3 border rounded bg-white h-100 shadow-sm-hover transition-all">
                                <label className="d-block text-muted small text-uppercase fw-bold mb-2">Designation</label>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-text bg-light-warning text-warning rounded-3 me-3">
                                        <FiBriefcase size={18} />
                                    </div>
                                    <span className="fs-15 fw-semibold text-dark">{formData.designation || <span className="text-muted fst-italic">Not set</span>}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-6">
                            <div className="p-3 border rounded bg-white h-100 shadow-sm-hover transition-all">
                                <label className="d-block text-muted small text-uppercase fw-bold mb-2">Email Address</label>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-text bg-light-danger text-danger rounded-3 me-3">
                                        <FiMail size={18} />
                                    </div>
                                    <span className="fs-15 fw-semibold text-dark">{formData.email || <span className="text-muted fst-italic">Not set</span>}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6 col-xl-6">
                            <div className="p-3 border rounded bg-white h-100 shadow-sm-hover transition-all">
                                <label className="d-block text-muted small text-uppercase fw-bold mb-2">Phone Number</label>
                                <div className="d-flex align-items-center">
                                    <div className="avatar-text bg-light-success text-success rounded-3 me-3">
                                        <FiPhone size={18} />
                                    </div>
                                    <span className="fs-15 fw-semibold text-dark">{formData.phoneNumber || <span className="text-muted fst-italic">Not set</span>}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TabOverviewContent