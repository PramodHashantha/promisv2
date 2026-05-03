import React from 'react'
import { BsPatchCheckFill } from 'react-icons/bs'
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="card stretch stretch-full">
            <div className="card-body">
                <div className="mb-4 text-center">
                    <div className="wd-150 ht-150 mx-auto mb-3 position-relative">
                        <div className="avatar-image wd-150 ht-150 border border-5 border-gray-3">
                            <img src={user.image || "/images/avatar/1.png"} alt="user-img" className="img-fluid" />
                        </div>
                        <div className="wd-10 ht-10 text-success rounded-circle position-absolute translate-middle" style={{ top: "76%", right: "10px" }}>
                            <BsPatchCheckFill size={16} />
                        </div>
                    </div>
                    <div className="mb-4">
                        <span className="fs-14 fw-bold d-block">{user?.titles ?? ''} {user?.fullname ?? 'User Name'}</span>
                        <a href="#" className="fs-12 fw-normal text-muted d-block">{user.email || 'Not set'}</a>
                    </div>
                </div>
                <ul className="list-unstyled mb-4 mx-auto" style={{ maxWidth: '300px' }}>
                    <li className="d-flex justify-content-between align-items-center mb-4">
                        <span className="text-muted fw-medium d-flex align-items-center gap-3"><FiMapPin size={16} />PF Number</span>
                        <span className="text-dark text-end">{user.pfno || "-"}</span>
                    </li>
                    <li className="d-flex justify-content-between align-items-center mb-4">
                        <span className="text-muted fw-medium d-flex align-items-center gap-3"><FiPhone size={16} />Phone</span>
                        <span className="text-dark text-end">{user.phonE_NUMBER || "Not set"}</span>
                    </li>
                    <li className="d-flex justify-content-between align-items-center mb-0">
                        <span className="text-muted fw-medium d-flex align-items-center gap-3"><FiMail size={16} />Email</span>
                        <span className="text-dark text-end">{user.email || "Not set"}</span>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Profile