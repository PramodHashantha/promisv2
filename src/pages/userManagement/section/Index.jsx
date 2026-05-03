import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import SectionTable from "@/components/userManagement/section/SectionTable";

const Index = () => {
    return (
        <>
            <PageHeader>
                <UserHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <SectionTable />
                </div>
            </div>
        </>
    )
}

export default Index