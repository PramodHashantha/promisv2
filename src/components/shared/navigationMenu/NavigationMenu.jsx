import React, { useContext, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FiSunrise } from "react-icons/fi";
import Menus from './Menus';
import { NavigationContext } from '../../../contentApi/navigationProvider';

const NavigationManu = () => {
    const { navigationOpen, setNavigationOpen } = useContext(NavigationContext)
    const pathName = useLocation().pathname
    useEffect(() => {
        setNavigationOpen(false)
    }, [pathName])
    return (
        <nav className={`nxl-navigation ${navigationOpen ? "mob-navigation-active" : ""}`}>
            <div className="navbar-wrapper">
                <div className="m-header">
                    <Link to="/dashboard" className="b-brand">
                        {/* <!-- ========   change your logo hear   ============ --> */}
                        <img src="/images/logoPromis1.png" alt="logo" className="logo logo-lg" style={{ width: "150px" }} />
                        <img src="/images/logo-abbr.png" alt="logo" className="logo logo-sm" />
                    </Link>
                </div>

                <div className={`navbar-content h-full`}>
                    <div className="h-full overflow-y-auto custom-scrollbar">
                        <ul className="nxl-navbar">
                            <li className="nxl-item nxl-caption">
                                <label>Navigation</label>
                            </li>
                            <Menus />
                        </ul>
                        <div style={{ height: "18px" }}></div>
                    </div>
                </div>
            </div>
            <div onClick={() => setNavigationOpen(false)} className={`${navigationOpen ? "nxl-menu-overlay" : ""}`}></div>
        </nav>
    )
}

export default NavigationManu