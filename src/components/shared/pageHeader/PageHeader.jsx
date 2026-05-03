import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiAlignRight, FiArrowLeft, FiHome, FiChevronRight } from 'react-icons/fi'
import './Breadcrumb.css'

const PageHeader = ({ children }) => {
    const [openSidebar, setOpenSidebar] = useState(false)
    const pathName = useLocation().pathname
    let folderName = "Dashboard"
    let fileName = "Dashboard"
    if (pathName !== "/" && pathName !== "/dashboard") {
        const parts = pathName.split("/").filter(item => item !== "");
        folderName = parts[0];
        fileName = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    }

    return (
        <div className="page-header">
            <div className="page-header-left d-flex align-items-center">
                <div className="page-header-title">
                    <h5 className="m-b-10 text-capitalize">{folderName}</h5>
                </div>
                <div className="custom-breadcrumb">
                    <Link to="/dashboard" className="home-icon-container">
                        <FiHome size={18} />
                    </Link>

                    {/* Always show separator and current page for consistency with the card design, 
                        or logic to hide if strictly on dashboard? 
                        The user liked "Dashboard" only. 
                        If I show [HomeIcon] AND [Dashboard], it is: (Icon) > Dashboard.
                    */}
                    {(pathName !== "/" && pathName !== "/dashboard") ? (
                        <>
                            <span className="breadcrumb-separator"><FiChevronRight /></span>
                            <span className="breadcrumb-item active-item text-capitalize">{fileName}</span>
                        </>
                    ) : (
                        <>
                            <span className="breadcrumb-separator"><FiChevronRight /></span>
                            <span className="breadcrumb-item active-item text-capitalize">Dashboard</span>
                        </>
                    )}
                </div>
            </div>
            <div className="page-header-right ms-auto">
                <div className={`page-header-right-items ${openSidebar ? "page-header-right-open" : ""}`}>
                    <div className="d-flex d-md-none">
                        <Link to="#" onClick={() => setOpenSidebar(false)} className="page-header-right-close-toggle">
                            <FiArrowLeft size={16} className="me-2" />
                            <span>Back</span>
                        </Link>
                    </div>
                    {children}
                </div>
                <div className="d-md-none d-flex align-items-center">
                    <Link to="#" onClick={() => setOpenSidebar(true)} className="page-header-right-open-toggle">
                        <FiAlignRight className="fs-20" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PageHeader