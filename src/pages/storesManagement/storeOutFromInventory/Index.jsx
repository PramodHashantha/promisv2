import React from 'react'
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";
import StoresOutFromInventoryTable from "@/components/storesManagement/storeOutFromInventory/StoresOutFromInventoryTable";

const Index = () => {
    return (
        <>
            <PageHeader>
                <UserHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <StoresOutFromInventoryTable />
                </div>
            </div>
            {/* <Footer /> */}
        </>
    )
}

export default Index


