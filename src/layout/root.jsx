import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import NavigationManu from '@/components/shared/navigationMenu/NavigationMenu'
import Header from '@/components/shared/header/Header'
import useBootstrapUtils from '@/hooks/useBootstrapUtils'
import SupportDetails from '@/components/supportDetails'

import Footer from '@/components/shared/Footer'

const RootLayout = () => {
    const pathName = useLocation().pathname
    useBootstrapUtils(pathName)

    return (
        <>
            <Header />
            <NavigationManu />
            <main className="nxl-container">
                <div className="nxl-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <div style={{ flex: 1 }}>
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </main>
            <SupportDetails />
        </>
    )
}

export default RootLayout