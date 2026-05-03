import UserTable from "@/components/users/UserTable";
import UserHeader from "@/components/users/UserHeader";
import PageHeader from "@/components/shared/pageHeader/PageHeader";
import Footer from "@/components/shared/Footer";

const UserAppointments = () => {
    return (
        <>
            <PageHeader>
                <UserHeader />
            </PageHeader>
            <div className="main-content">
                <div className="row">
                    <UserTable />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserAppointments;