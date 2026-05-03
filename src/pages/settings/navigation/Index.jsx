import React from 'react'
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";
import Navigation from "../../../components/setting/navigation";

const Index = () => {
    return (
        <>
            <PageHeader>
                <UserHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <Navigation />
                </div>
            </div>
            {/* <Footer /> */}
        </>
    )
}

export default Index


