import React from 'react';
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import StockManualEntryForm from "@/components/storesManagement/stockManuallyEntry/StockManualEntryForm";

const Index = () => {
    return (
        <>
            <PageHeader>
                <UserHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <div className="col-12">
                        <StockManualEntryForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;

