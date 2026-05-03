import React from 'react'
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import StoresInTable from "@/components/storesManagement/storesIn/StoresInTable";

const Index = () => {
    return (
        <>
            {/* <PageHeader>
                <UserHeader />
            </PageHeader> */}
            <div className="main-content">
                <div className="row">
                    <StoresInTable />
                </div>
            </div>
        </>
    )
}

export default Index
